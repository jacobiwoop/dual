import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const creditsController = {
  // GET /api/client/credits/balance - Solde de crédits
  async getBalance(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const client = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        balanceCredits: true,
        totalSpent: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json({
      balanceCredits: client.balanceCredits,
      totalSpent: client.totalSpent,
    });
  },

  // POST /api/client/credits/purchase - Acheter des crédits
  async purchaseCredits(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { amount, paymentMethod = 'stripe' } = req.body;
    const clientId = req.user.userId;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Montant invalide' });
    }

    // Packs de crédits prédéfinis (1€ = 10 crédits)
    const validPacks = [10, 20, 50, 100, 200, 500]; // en euros
    if (!validPacks.includes(amount)) {
      return res.status(400).json({
        error: 'Pack invalide',
        validPacks,
      });
    }

    const credits = amount * 10; // 1€ = 10 crédits

    // TODO: Intégrer Stripe pour le paiement réel (Phase 3)
    // Pour l'instant, on simule l'achat (mode dev)
    
    // Créditer le client
    await prisma.user.update({
      where: { id: clientId },
      data: {
        balanceCredits: { increment: credits },
      },
    });

    // Créer transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: clientId,
        type: 'credit_purchase',
        amountCredits: credits,
        amountEur: amount,
        status: 'completed',
        paymentMethod,
      },
    });

    res.status(201).json({
      success: true,
      transaction,
      newBalance: (await prisma.user.findUnique({
        where: { id: clientId },
        select: { balanceCredits: true },
      }))?.balanceCredits || 0,
      message: `${credits} crédits ajoutés avec succès`,
    });
  },

  // GET /api/client/credits/history - Historique des transactions
  async getHistory(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { limit = 20, offset = 0, type } = req.query;
    const clientId = req.user.userId;

    const whereClause: any = { userId: clientId };
    if (type) {
      whereClause.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.transaction.count({ where: whereClause });

    res.json({
      transactions,
      total,
      hasMore: Number(offset) + transactions.length < total,
    });
  },

  // GET /api/client/credits/packs - Packs de crédits disponibles
  async getPacks(req: Request, res: Response) {
    const packs = [
      { euros: 10, credits: 100, bonus: 0 },
      { euros: 20, credits: 200, bonus: 10 },
      { euros: 50, credits: 500, bonus: 50 },
      { euros: 100, credits: 1000, bonus: 150 },
      { euros: 200, credits: 2000, bonus: 400 },
      { euros: 500, credits: 5000, bonus: 1250 },
    ];

    res.json({ packs });
  },
};
