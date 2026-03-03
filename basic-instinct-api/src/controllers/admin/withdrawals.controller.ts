import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryString, getQueryNumber } from '../../lib/query';

export const withdrawalsController = {
  // GET /api/admin/withdrawals - Liste toutes les demandes de retrait
  async getWithdrawals(req: Request, res: Response) {
    const status = getQueryString(req.query.status);
    const limit = getQueryNumber(req.query.limit, 20);
    const offset = getQueryNumber(req.query.offset, 0);

    const whereClause: any = {};
    if (status) whereClause.status = status;

    const withdrawals = await prisma.withdrawal.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            coinBalance: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.withdrawal.count({ where: whereClause });

    res.json({
      withdrawals,
      total,
      hasMore: offset + withdrawals.length < total,
    });
  },

  // GET /api/admin/withdrawals/:id - Détails d'une demande
  async getWithdrawal(req: Request, res: Response) {
    const { id } = req.params;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: id as string },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            iban: true,
            coinBalance: true,
            totalEarned: true,
            kycStatus: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Demande de retrait non trouvée' });
    }

    res.json({ withdrawal });
  },

  // PUT /api/admin/withdrawals/:id/approve - Approuver une demande
  async approveWithdrawal(req: Request, res: Response) {
    const { id } = req.params;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: id as string },
      include: { creator: true },
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Demande de retrait non trouvée' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    // Vérifier que le créateur a toujours le solde
    if (withdrawal.creator.coinBalance < withdrawal.amountCoins) {
      return res.status(400).json({
        error: 'Solde insuffisant',
        required: withdrawal.amountCoins,
        available: withdrawal.creator.coinBalance,
      });
    }

    // Débiter le solde du créateur
    await prisma.user.update({
      where: { id: withdrawal.creatorId },
      data: {
        coinBalance: { decrement: withdrawal.amountCoins },
      },
    });

    // Marquer comme approuvé
    const updated = await prisma.withdrawal.update({
      where: { id: id as string },
      data: {
        status: 'completed',
        adminId: req.user!.userId,
        processedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Créer transaction
    await prisma.transaction.create({
      data: {
        userId: withdrawal.creatorId,
        type: 'withdrawal',
        amountCoins: withdrawal.amountCoins,
        status: 'completed',
        referenceId: withdrawal.id,
      },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'withdrawal_approved',
        targetType: 'withdrawal',
        targetId: id as string,
        details: JSON.stringify({
          creatorId: withdrawal.creatorId,
          amount: withdrawal.netEur,
        }),
      },
    });

    res.json({
      success: true,
      withdrawal: updated,
      message: 'Retrait approuvé',
    });
  },

  // PUT /api/admin/withdrawals/:id/reject - Rejeter une demande
  async rejectWithdrawal(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: id as string },
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Demande de retrait non trouvée' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Raison de rejet requise' });
    }

    const updated = await prisma.withdrawal.update({
      where: { id: id as string },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        adminId: req.user!.userId,
        processedAt: new Date(),
      },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'withdrawal_rejected',
        targetType: 'withdrawal',
        targetId: id as string,
        details: JSON.stringify({
          creatorId: withdrawal.creatorId,
          reason,
        }),
      },
    });

    res.json({
      success: true,
      withdrawal: updated,
      message: 'Retrait rejeté',
    });
  },

  // GET /api/admin/withdrawals/stats - Statistiques retraits
  async getStats(req: Request, res: Response) {
    const [pending, processing, completed, rejected, totalAmount] = await Promise.all([
      prisma.withdrawal.count({ where: { status: 'pending' } }),
      prisma.withdrawal.count({ where: { status: 'processing' } }),
      prisma.withdrawal.count({ where: { status: 'completed' } }),
      prisma.withdrawal.count({ where: { status: 'rejected' } }),
      prisma.withdrawal.aggregate({
        where: { status: 'completed' },
        _sum: { netEur: true },
      }),
    ]);

    res.json({
      pending,
      processing,
      completed,
      rejected,
      totalPaid: totalAmount._sum.netEur || 0,
    });
  },
};
