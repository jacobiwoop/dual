import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryString, getQueryNumber } from '../../lib/query';

export const dashboardController = {
  // GET /api/admin/dashboard - Stats globales
  async getDashboard(req: Request, res: Response) {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCreators,
      totalClients,
      activeSubscriptions,
      pendingWithdrawals,
      totalRevenue,
      revenueLast30Days,
      totalCommission,
      newCreatorsLast7Days,
      newClientsLast7Days,
      transactionsLast30Days,
    ] = await Promise.all([
      // Utilisateurs
      prisma.user.count({ where: { role: 'CREATOR', isActive: true } }),
      prisma.user.count({ where: { role: 'CLIENT', isActive: true } }),

      // Abonnements
      prisma.subscription.count({ where: { status: 'active' } }),

      // Retraits en attente
      prisma.withdrawal.count({ where: { status: 'pending' } }),

      // Revenus total
      prisma.transaction.aggregate({
        where: {
          type: { in: ['credit_purchase', 'subscription', 'tip', 'media', 'gallery'] },
          status: 'completed',
        },
        _sum: { amountEur: true },
      }),

      // Revenus 30 jours
      prisma.transaction.aggregate({
        where: {
          type: { in: ['credit_purchase', 'subscription', 'tip', 'media', 'gallery'] },
          status: 'completed',
          createdAt: { gte: last30Days },
        },
        _sum: { amountEur: true },
      }),

      // Commission totale
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
        },
        _sum: { commissionEur: true },
      }),

      // Nouveaux créateurs (7 jours)
      prisma.user.count({
        where: {
          role: 'CREATOR',
          createdAt: { gte: last7Days },
        },
      }),

      // Nouveaux clients (7 jours)
      prisma.user.count({
        where: {
          role: 'CLIENT',
          createdAt: { gte: last7Days },
        },
      }),

      // Transactions 30 jours
      prisma.transaction.count({
        where: {
          createdAt: { gte: last30Days },
          status: 'completed',
        },
      }),
    ]);

    res.json({
      users: {
        totalCreators,
        totalClients,
        newCreatorsLast7Days,
        newClientsLast7Days,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
      revenue: {
        total: totalRevenue._sum.amountEur || 0,
        last30Days: revenueLast30Days._sum.amountEur || 0,
        totalCommission: totalCommission._sum.commissionEur || 0,
      },
      transactions: {
        last30Days: transactionsLast30Days,
      },
      withdrawals: {
        pending: pendingWithdrawals,
      },
    });
  },

  // GET /api/admin/logs - Logs admin
  async getLogs(req: Request, res: Response) {
    const action = getQueryString(req.query.action);
    const limit = getQueryNumber(req.query.limit, 50);
    const offset = getQueryNumber(req.query.offset, 0);

    const whereClause: any = {};
    if (action) whereClause.action = action;

    const logs = await prisma.adminLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.adminLog.count({ where: whereClause });

    res.json({
      logs,
      total,
      hasMore: offset + logs.length < total,
    });
  },

  // GET /api/admin/settings - Platform settings
  async getSettings(req: Request, res: Response) {
    const settings = await prisma.platformSettings.findMany({
      orderBy: { key: 'asc' },
    });

    res.json({ settings });
  },

  // PUT /api/admin/settings/:key - Update setting
  async updateSetting(req: Request, res: Response) {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await prisma.platformSettings.upsert({
      where: { key: key as string },
      create: {
        key: key as string,
        value,
        updatedBy: req.user!.userId,
      },
      update: {
        value,
        updatedBy: req.user!.userId,
      },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: 'setting_updated',
        targetType: 'setting',
        targetId: key as string,
        details: JSON.stringify({ value }),
      },
    });

    res.json({ setting });
  },
};
