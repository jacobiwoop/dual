import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import redis from '../../lib/redis';
import { extractR2Key, r2Client, R2_BUCKET_NAME } from '../../lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const messagesController = {
  // GET /api/creator/conversations - Liste des conversations
  async getConversations(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { search, limit = 20, offset = 0 } = req.query;
    const creatorId = req.user.userId;

    // Récupérer toutes les conversations du créateur
    const conversations = await prisma.conversation.findMany({
      where: {
        creatorId: creatorId as string,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true,
            isTip: true,
            tipAmount: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: creatorId as string },
              },
            },
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { updatedAt: 'desc' },
    });

    // Formatter les conversations (en parallèle pour la présence Redis)
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== creatorId);
      const lastMessage = conv.messages[0];
      
      // Compter messages non lus avec le count de Prisma
      const unreadCount = conv._count.messages;

      // Vérifier la présence Redis
      const clientId = conv.clientId || otherParticipant?.user?.id || null;
      const isOnline = clientId
        ? (await redis.sismember('presence:online', clientId)) === 1
        : false;

      const client = otherParticipant?.user || null;
      let signedAvatarUrl = client?.avatarUrl || null;

      if (signedAvatarUrl) {
        try {
          const key = extractR2Key(signedAvatarUrl);
          const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
          signedAvatarUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
        } catch (e) {
          // Keep original
        }
      }

      return {
        id: conv.id,
        clientId,
        client: client ? { ...client, avatarUrl: signedAvatarUrl } : null,
        isOnline,
        lastMessage: lastMessage || null,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    }));

    res.json({
      conversations: formattedConversations,
      total: formattedConversations.length,
    });
  },

  // GET /api/creator/conversations/:clientId/messages - Messages d'une conversation
  async getMessages(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { clientId } = req.params;
    const { limit = 50, before } = req.query;
    const creatorId = req.user.userId;

    // Trouver la conversation entre le créateur et le client
    const conversation = await prisma.conversation.findFirst({
      where: {
        creatorId: creatorId as string,
        clientId: clientId as string,
      },
      include: {
        messages: {
          where: before
            ? { createdAt: { lt: new Date(before as string) } }
            : undefined,
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            mediaAttachments: {
              include: {
                libraryItem: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    // Inverser pour avoir ordre chronologique
    const rawMessages = conversation.messages.reverse();

    // Signer les URLs des médias — Les imports sont maintenant en haut du fichier

    const messages = await Promise.all(rawMessages.map(async (msg: any) => {
      if (!msg.mediaAttachments) return msg;

      const updatedAttachments = await Promise.all(msg.mediaAttachments.map(async (att: any) => {
        if (!att.libraryItem) return att;

        let displayUrl = att.libraryItem.url;
        try {
          const key = extractR2Key(att.libraryItem.url);
          const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
          displayUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
        } catch (e) { /* fallback */ }

        let displayThumbnail = att.libraryItem.thumbnailUrl;
        if (att.libraryItem.thumbnailUrl) {
          try {
            const key = extractR2Key(att.libraryItem.thumbnailUrl);
            const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
            displayThumbnail = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
          } catch (e) { /* fallback */ }
        }

        return {
          ...att,
          libraryItem: {
            ...att.libraryItem,
            url: displayUrl,
            thumbnailUrl: displayThumbnail,
            sizeBytes: att.libraryItem.sizeBytes !== null ? Number(att.libraryItem.sizeBytes) : null,
          }
        };
      }));

      return {
        ...msg,
        mediaAttachments: updatedAttachments
      };
    }));

    res.json({
      conversationId: conversation.id,
      messages,
      hasMore: messages.length === Number(limit),
    });
  },

  // POST /api/creator/conversations/:clientId/messages - Envoyer un message
  async sendMessage(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { clientId } = req.params;
    const { content, mediaIds, isPaid, price } = req.body;
    const creatorId = req.user.userId;

    // Validation
    if (!content && (!mediaIds || mediaIds.length === 0)) {
      return res.status(400).json({ error: 'Message vide' });
    }

    if (isPaid && (!price || price <= 0)) {
      return res.status(400).json({ error: 'Prix requis pour message payant' });
    }

    // Vérifier que le client existe
    const client = await prisma.user.findUnique({
      where: { id: clientId as string },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Trouver ou créer la conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        creatorId: creatorId as string,
        clientId: clientId as string,
      },
    });

    if (!conversation) {
      // Créer nouvelle conversation
      conversation = await prisma.conversation.create({
        data: {
          creatorId: creatorId as string,
          clientId: clientId as string,
          participants: {
            create: [
              { userId: creatorId as string },
              { userId: clientId as string },
            ],
          },
        },
      });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: creatorId as string,
        recipientId: clientId as string,
        content: content || null,
        isPaid: isPaid || false,
        price: price || null,
        mediaAttachments: mediaIds
          ? {
              create: mediaIds.map((id: string) => ({
                libraryItemId: id,
              })),
            }
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        mediaAttachments: {
          include: {
            libraryItem: true,
          },
        },
      },
    });

    // Mettre à jour la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ message });
  },

  // PUT /api/creator/conversations/:clientId/read - Marquer comme lu
  async markAsRead(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { clientId } = req.params;
    const creatorId = req.user.userId;

    // Trouver la conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            OR: [{ userId: creatorId as string }, { userId: clientId as string }],
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    // Marquer tous les messages du client comme lus
    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: clientId as string,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Mettre à jour lastReadAt du participant créateur
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: conversation.id,
        userId: creatorId,
      },
      data: { lastReadAt: new Date() },
    });

    res.json({ success: true });
  },

  // GET /api/creator/conversations/:clientId/info - Info client
  async getClientInfo(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { clientId } = req.params;

    const client = await prisma.user.findUnique({
      where: { id: clientId as string },
      select: {
        id: true,
        username: true,
        displayName: true,
        coinBalance: true,
        totalSpent: true,
        createdAt: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Récupérer note du créateur sur ce client
    const note = await prisma.creatorNote.findUnique({
      where: {
        creatorId_clientId: {
          creatorId: req.user.userId as string,
          clientId: clientId as string,
        },
      },
    });

    res.json({
      client,
      note: note?.content || null,
    });
  },

  // POST /api/creator/notes/:clientId - Sauvegarder note
  async saveNote(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { clientId } = req.params;
    const { content } = req.body;
    const creatorId = req.user.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Note vide' });
    }

    const note = await prisma.creatorNote.upsert({
      where: {
        creatorId_clientId: {
          creatorId: creatorId as string,
          clientId: clientId as string,
        },
      },
      create: {
          creatorId: creatorId as string,
          clientId: clientId as string,
        content,
      },
      update: {
        content,
      },
    });

    res.json({ note });
  },
};
