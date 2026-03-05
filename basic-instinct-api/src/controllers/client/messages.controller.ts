import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import redis from '../../lib/redis';
import { extractR2Key, r2Client, R2_BUCKET_NAME } from '../../lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const clientMessagesController = {
  // GET /api/client/conversations - Liste des conversations du client
  async getConversations(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { limit = 20, offset = 0 } = req.query;
    const clientId = req.user.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: clientId as string },
        },
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
                isVerified: true,
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
            isPaid: true,
            isUnlocked: true,
            mediaAttachments: {
              include: {
                libraryItem: true,
              },
            },
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { updatedAt: 'desc' },
    });

    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== clientId);
      const lastMessage = conv.messages[0];

      const unreadCount = conv.messages.filter(
        (m) => !m.isRead && m.senderId !== clientId
      ).length;

      // Présence Redis
      const creatorId = otherParticipant?.user?.id;
      const isOnline = creatorId
        ? (await redis.sismember('presence:online', creatorId)) === 1
        : false;

      let signedLastMessage = lastMessage ? { ...lastMessage } : null;
      if (lastMessage?.mediaAttachments && lastMessage.mediaAttachments.length > 0) {
        const signedAtts = await Promise.all(lastMessage.mediaAttachments.map(async (att: any) => {
          if (!att.libraryItem) return att;
          let displayUrl = att.libraryItem.url;
          try {
            const key = extractR2Key(att.libraryItem.url);
            const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
            displayUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
          } catch (e) {}

          let displayThumbnail = att.libraryItem.thumbnailUrl;
          if (att.libraryItem.thumbnailUrl) {
            try {
              const key = extractR2Key(att.libraryItem.thumbnailUrl);
              const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
              displayThumbnail = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
            } catch (e) {}
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
        signedLastMessage = { ...lastMessage, mediaAttachments: signedAtts as any };
      }

      return {
        id: conv.id,
        creatorId: creatorId || null,
        creator: otherParticipant?.user || null,
        isOnline,
        lastMessage: signedLastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    }));

    res.json({
      conversations: formattedConversations,
      total: formattedConversations.length,
    });
  },

  // GET /api/client/conversations/:creatorId/messages - Messages avec un créateur
  async getMessages(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { creatorId } = req.params;
    const { limit = 50, before } = req.query;
    const clientId = req.user.userId;

    const creator = await prisma.user.findUnique({
      where: { id: creatorId as string, role: 'CREATOR' },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            OR: [{ userId: clientId as string }, { userId: creatorId as string }],
          },
        },
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
      return res.json({
        conversationId: null,
        creator: creator,
        messages: [],
        hasMore: false,
      });
    }

    const rawMessages = conversation.messages.reverse();

    // Signer les URLs des médias
    const messages = await Promise.all(rawMessages.map(async (msg: any) => {
      if (!msg.mediaAttachments || msg.mediaAttachments.length === 0) return msg;

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
      creator: creator,
      messages,
      hasMore: messages.length === Number(limit),
    });
  },

  // POST /api/client/conversations/:creatorId/messages - Envoyer un message à un créateur
  async sendMessage(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { creatorId } = req.params;
    const { content, tipCoins } = req.body; // Anciennement tipAmount
    const clientId = req.user.userId;

    if (!content && !tipCoins) {
      return res.status(400).json({ error: 'Message ou tip requis' });
    }

    // Vérifier que le créateur existe
    const creator = await prisma.user.findUnique({
      where: { id: creatorId as string, role: 'CREATOR' },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    // Si tip, vérifier les crédits (Pièces)
    if (tipCoins && tipCoins > 0) {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { coinBalance: true },
      });

      if (!client || client.coinBalance < tipCoins) {
        return res.status(400).json({
          error: 'Crédits insuffisants',
          required: tipCoins,
          available: client?.coinBalance || 0,
        });
      }
    }

    // Trouver ou créer conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            OR: [{ userId: clientId as string }, { userId: creatorId as string }],
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          creatorId: creatorId as string,
          clientId: clientId as string,
          participants: {
            create: [
              { userId: clientId as string },
              { userId: creatorId as string },
            ],
          },
        },
      });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: clientId as string,
        recipientId: creatorId as string,
        content: content || null,
        isTip: !!tipCoins,
        tipAmount: tipCoins || null,
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
      },
    });

    // Si tip, traiter le paiement
    if (tipCoins && tipCoins > 0) {
      const tipAmount = tipCoins;
      const creatorGroupPiece = Math.floor(tipAmount * 0.8); // 80% après commission
      const commissionGroupPiece = tipAmount - creatorGroupPiece;

      await prisma.user.update({
        where: { id: clientId },
        data: {
          coinBalance: { decrement: tipAmount },
          totalSpent: { increment: tipAmount },
        },
      });

      await prisma.user.update({
        where: { id: creatorId as string },
        data: {
          coinBalance: { increment: creatorGroupPiece },
          totalEarned: { increment: creatorGroupPiece },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: clientId,
          type: 'tip',
          amountCoins: tipAmount,
          commissionCoins: commissionGroupPiece,
          commissionRate: 0.2,
          status: 'completed',
          referenceId: message.id,
        },
      });
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ message });
  },

  // POST /api/client/messages/:id/unlock - Débloquer un média payant
  async unlockMessage(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const clientId = req.user.userId;

    const message = await prisma.message.findUnique({
      where: { id: id as string },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    if (!message.isPaid) {
      return res.status(400).json({ error: 'Ce message n\'est pas payant' });
    }

    if (message.isUnlocked) {
      return res.status(400).json({ error: 'Message déjà débloqué' });
    }

    // Vérifier que le client est participant
    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === clientId
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const priceCoins = message.price || 0; // Le prix est désormais en "Pièces"

    // Vérifier les pièces (coins)
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { coinBalance: true },
    });

    if (!client || client.coinBalance < priceCoins) {
      return res.status(400).json({
        error: 'Crédits insuffisants',
        required: priceCoins,
        available: client?.coinBalance || 0,
      });
    }

    // Débloquer le message
    await prisma.message.update({
      where: { id: id as string },
      data: { isUnlocked: true },
    });

    // Traiter le paiement
    const creatorRevenueCoins = Math.floor(priceCoins * 0.8);
    const commissionCoins = priceCoins - creatorRevenueCoins;

    await prisma.user.update({
      where: { id: clientId },
      data: {
        coinBalance: { decrement: priceCoins },
        totalSpent: { increment: priceCoins },
      },
    });

    await prisma.user.update({
      where: { id: message.senderId },
      data: {
        coinBalance: { increment: creatorRevenueCoins },
        totalEarned: { increment: creatorRevenueCoins },
      },
    });

    await prisma.transaction.create({
      data: {
        userId: clientId,
        type: 'media',
        amountCoins: priceCoins,
        commissionCoins: commissionCoins,
        commissionRate: 0.2,
        status: 'completed',
        referenceId: message.id,
      },
    });

    res.json({
      success: true,
      message: 'Message débloqué avec succès',
    });
  },
};
