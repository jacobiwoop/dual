import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryNumber } from '../../lib/query';

export const adminPaymentsController = {
  // GET /api/admin/payments/requests - Voir toutes les demandes en attente
  async getPurchaseRequests(req: Request, res: Response) {
    const limit = getQueryNumber(req.query.limit, 20);
    const offset = getQueryNumber(req.query.offset, 0);
    const { status } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const requests = await prisma.purchaseRequest.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            coinBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.purchaseRequest.count({ where: whereClause });

    res.json({
      requests,
      total,
      hasMore: offset + requests.length < total,
    });
  },

  // PUT /api/admin/payments/requests/:id/approve - Valider un achat
  async approvePurchaseRequest(req: Request, res: Response) {
    const { id } = req.params;

    const request = await prisma.purchaseRequest.findUnique({
      where: { id: id as string },
      include: { client: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    // Créditer les pièces au client
    await prisma.user.update({
      where: { id: request.clientId },
      data: {
        coinBalance: { increment: request.coinsRequested },
        totalSpent: { increment: request.amountPaidRaw },
      },
    });

    // Marquer comme approuvée
    const updatedRequest = await prisma.purchaseRequest.update({
      where: { id: id as string },
      data: {
        status: 'approved',
        adminId: req.user!.userId,
      },
    });

    // Logger la transaction formellement
    await prisma.transaction.create({
      data: {
        userId: request.clientId,
        type: 'credit_purchase',
        amountCoins: request.coinsRequested,
        status: 'completed',
        paymentMethod: request.paymentMethod,
        referenceId: request.id,
      },
    });

    // Log de l'admin
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'purchase_approved',
        targetType: 'purchase_request',
        targetId: id as string,
        details: JSON.stringify({
          clientId: request.clientId,
          coins: request.coinsRequested,
          amountPaid: request.amountPaidRaw,
          currency: request.currency,
        }),
      },
    });

    res.json({ success: true, request: updatedRequest });
  },

  // PUT /api/admin/payments/requests/:id/reject - Refuser
  async rejectPurchaseRequest(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Un motif de refus est requis' });
    }

    const request = await prisma.purchaseRequest.findUnique({
      where: { id: id as string },
    });

    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Cette demande a déjà été traitée' });
    }

    const updatedRequest = await prisma.purchaseRequest.update({
      where: { id: id as string },
      data: {
        status: 'rejected',
        adminId: req.user!.userId,
        rejectionReason: reason,
      },
    });

    // Log de l'admin
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'purchase_rejected',
        targetType: 'purchase_request',
        targetId: id as string,
        details: JSON.stringify({
          clientId: request.clientId,
          reason,
        }),
      },
    });

    res.json({ success: true, request: updatedRequest });
  },
};
