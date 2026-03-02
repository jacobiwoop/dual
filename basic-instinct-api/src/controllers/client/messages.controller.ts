import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

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
          },
        },
      },
      take: Number(limit),
      skip: Number(offset),
      orderBy: { updatedAt: 'desc' },
    });

    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== clientId);
      const lastMessage = conv.messages[0];

      const unreadCount = conv.messages.filter(
        (m) => !m.isRead && m.senderId !== clientId
      ).length;

      return {
        id: conv.id,
        creator: otherParticipant?.user || null,
        lastMessage: lastMessage || null,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    });

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
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    const messages = conversation.messages.reverse();

    res.json({
      conversationId: conversation.id,
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
    const { content, tipAmount } = req.body;
    const clientId = req.user.userId;

    if (!content && !tipAmount) {
      return res.status(400).json({ error: 'Message ou tip requis' });
    }

    // Vérifier que le créateur existe
    const creator = await prisma.user.findUnique({
      where: { id: creatorId as string, role: 'CREATOR' },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    // Si tip, vérifier les crédits
    if (tipAmount && tipAmount > 0) {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { balanceCredits: true },
      });

      if (!client || client.balanceCredits < tipAmount) {
        return res.status(400).json({
          error: 'Crédits insuffisants',
          required: tipAmount,
          available: client?.balanceCredits || 0,
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
        content: content || null,
        isTip: !!tipAmount,
        tipAmount: tipAmount || null,
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
    if (tipAmount && tipAmount > 0) {
      const tipEur = tipAmount * 0.1; // 1 crédit = 0.10€
      const creatorRevenue = tipEur * 0.8; // 80% après commission

      await prisma.user.update({
        where: { id: clientId },
        data: {
          balanceCredits: { decrement: tipAmount },
          totalSpent: { increment: tipEur },
        },
      });

      await prisma.user.update({
        where: { id: creatorId as string },
        data: {
          balance: { increment: creatorRevenue },
          totalEarned: { increment: creatorRevenue },
        },
      });

      await prisma.transaction.create({
        data: {
          userId: clientId,
          type: 'tip',
          amountCredits: tipAmount,
          amountEur: tipEur,
          commissionEur: tipEur * 0.2,
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

    const price = message.price || 0;
    const priceCredits = Math.round(price * 10);

    // Vérifier les crédits
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { balanceCredits: true },
    });

    if (!client || client.balanceCredits < priceCredits) {
      return res.status(400).json({
        error: 'Crédits insuffisants',
        required: priceCredits,
        available: client?.balanceCredits || 0,
      });
    }

    // Débloquer le message
    await prisma.message.update({
      where: { id: id as string },
      data: { isUnlocked: true },
    });

    // Traiter le paiement
    const creatorRevenue = price * 0.8;

    await prisma.user.update({
      where: { id: clientId },
      data: {
        balanceCredits: { decrement: priceCredits },
        totalSpent: { increment: price },
      },
    });

    await prisma.user.update({
      where: { id: message.senderId },
      data: {
        balance: { increment: creatorRevenue },
        totalEarned: { increment: creatorRevenue },
      },
    });

    await prisma.transaction.create({
      data: {
        userId: clientId,
        type: 'media',
        amountCredits: priceCredits,
        amountEur: price,
        commissionEur: price * 0.2,
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
