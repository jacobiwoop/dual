import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, extractR2Key } from '../../lib/r2';

export const showsController = {
  // GET /api/client/shows/:creatorId
  async getCreatorShows(req: Request, res: Response) {
    if (!req.user || req.user.role !== 'CLIENT') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { creatorId } = req.params;

    try {
      const shows = await prisma.showType.findMany({
        where: { 
          creatorId,
          isActive: true // Seulement les shows actifs
        },
        orderBy: { sortOrder: 'asc' },
      });
      res.json({ shows });
    } catch (error) {
      console.error('Erreur getCreatorShows:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // POST /api/client/shows/request
  async requestShow(req: Request, res: Response) {
    if (!req.user || req.user.role !== 'CLIENT') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { showId, creatorId } = req.body;
    const clientId = req.user.userId;

    if (!showId || !creatorId) {
      return res.status(400).json({ error: 'showId et creatorId requis' });
    }

    try {
      // 1. Récupérer le show et vérifier son prix
      const show = await prisma.showType.findUnique({
        where: { id: showId },
      });

      if (!show || show.creatorId !== creatorId || !show.isActive) {
        return res.status(404).json({ error: 'Demande spéciale introuvable ou inactive' });
      }

      const price = show.priceCredits;

      // 2. Transaction complète
      const result = await prisma.$transaction(async (tx) => {
        // A. Vérifier le solde du client
        const client = await tx.user.findUnique({ where: { id: clientId } });
        if (!client || client.coinBalance < price) {
          throw new Error('Solde insuffisant');
        }

        // B. Débiter le client
        await tx.user.update({
          where: { id: clientId },
          data: { 
            coinBalance: { decrement: price },
            totalSpent: { increment: price }
          },
        });

        // C. Créditer le créateur
        await tx.user.update({
          where: { id: creatorId },
          data: { 
            coinBalance: { increment: price },
            totalEarned: { increment: price }
          },
        });

        // D. Créer la transaction d'historique
        await tx.transaction.create({
          data: {
            userId: clientId,
            type: 'SHOW_REQUEST',
            amountCoins: price,
            status: 'COMPLETED',
          },
        });

        // E. Créer le message automatique dans la conversation existante ou en créer une nouvelle
        let conversation = await tx.conversation.findFirst({
          where: {
            clientId,
            creatorId,
          },
        });

        if (!conversation) {
          conversation = await tx.conversation.create({
            data: {
              clientId,
              creatorId,
            },
          });
        }

        const messageText = `🎁 **Nouvelle Demande Spéciale !**\n\nLe client a commandé : **${show.emoji || ''} ${show.title}** pour ${price} 🪙.\n\n*${show.description || ''}*`;

        const autoMessage = await tx.message.create({
          data: {
            conversationId: conversation.id,
            senderId: clientId,
            recipientId: creatorId,
            content: messageText,
            isPaid: true,
            price: price,
          },
        });

        // Mettre à jour la conversation
        await tx.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(),
            lastMessageStr: `Sujet : ${show.title}`,
          },
        });

        return { newBalance: client.coinBalance - price, message: autoMessage };
      });

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Erreur requestShow:', error);
      if (error.message === 'Solde insuffisant') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};
