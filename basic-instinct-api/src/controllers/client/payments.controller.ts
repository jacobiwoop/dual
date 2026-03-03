import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryNumber } from '../../lib/query';

export const clientPaymentsController = {
  // POST /api/client/payments/buy-coins - Demande d'achat de pièces
  async buyCoins(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const clientId = req.user.userId;
    const { 
      coinsRequested, 
      amountPaidRaw, 
      currency = 'EUR', 
      paymentMethod, 
      transactionId, 
      proofImageUrl 
    } = req.body;

    // Validation
    if (!coinsRequested || coinsRequested <= 0) {
      return res.status(400).json({ error: 'Le montant en pièces doit être supérieur à 0' });
    }
    if (!amountPaidRaw || amountPaidRaw <= 0) {
      return res.status(400).json({ error: 'Le montant payé doit être supérieur à 0' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ error: 'Une méthode de paiement est requise' });
    }

    // Créer la demande
    const request = await prisma.purchaseRequest.create({
      data: {
        clientId,
        coinsRequested,
        amountPaidRaw,
        currency,
        paymentMethod,
        transactionId: transactionId || null,
        proofImageUrl: proofImageUrl || null,
        status: 'pending',
      },
    });

    res.status(201).json({
      success: true,
      request,
      message: 'Demande d\'achat envoyée. Elle sera traitée par un administrateur sous peu.',
    });
  },

  // GET /api/client/payments/history - Historique des demandes d'achat
  async getPurchaseHistory(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const limit = getQueryNumber(req.query.limit, 20);
    const offset = getQueryNumber(req.query.offset, 0);
    const clientId = req.user.userId;

    const requests = await prisma.purchaseRequest.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.purchaseRequest.count({ where: { clientId } });

    res.json({
      requests,
      total,
      hasMore: offset + requests.length < total,
    });
  },
};
