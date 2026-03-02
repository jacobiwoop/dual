import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryString, getQueryNumber } from '../../lib/query';

export const transactionsController = {
  // GET /api/admin/transactions - Liste toutes les transactions
  async getTransactions(req: Request, res: Response) {
    const type = getQueryString(req.query.type);
    const status = getQueryString(req.query.status);
    const limit = getQueryNumber(req.query.limit, 50);
    const offset = getQueryNumber(req.query.offset, 0);

    const whereClause: any = {};
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.transaction.count({ where: whereClause });

    res.json({
      transactions,
      total,
      hasMore: offset + transactions.length < total,
    });
  },

  // GET /api/admin/revenue/stats - Stats revenus globaux
  async getRevenueStats(req: Request, res: Response) {
    const days = getQueryNumber(req.query.period, 30);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [revenueData, creditsSold] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'completed',
          type: { in: ['subscription', 'tip', 'media', 'gallery', 'show'] },
        },
        _sum: {
          amountEur: true,
          commissionEur: true,
        },
        _count: true,
      }),

      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: startDate },
          type: 'credit_purchase',
          status: 'completed',
        },
        _sum: { amountEur: true },
        _count: true,
      }),
    ]);

    // Revenus par type
    const revenueByType = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: startDate },
        status: 'completed',
      },
      _sum: {
        amountEur: true,
        commissionEur: true,
      },
    });

    res.json({
      period: days,
      totalRevenue: revenueData._sum.amountEur || 0,
      totalCommission: revenueData._sum.commissionEur || 0,
      transactionsCount: revenueData._count,
      creditsSold: creditsSold._sum.amountEur || 0,
      creditsSalesCount: creditsSold._count,
      revenueByType,
    });
  },

  // GET /api/admin/revenue/by-creator - Revenus par créateur
  async getRevenueByCreator(req: Request, res: Response) {
    const days = getQueryNumber(req.query.period, 30);
    const limit = getQueryNumber(req.query.limit, 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Récupérer tous les créateurs
    const creators = await prisma.user.findMany({
      where: { role: 'CREATOR' },
      select: { id: true, username: true, displayName: true, avatarUrl: true },
    });

    // Calculer revenus pour chaque créateur
    const creatorsWithRevenue = await Promise.all(
      creators.map(async (creator) => {
        const revenue = await prisma.transaction.aggregate({
          where: {
            userId: creator.id,
            createdAt: { gte: startDate },
            type: { in: ['subscription', 'tip', 'media', 'gallery'] },
            status: 'completed',
          },
          _sum: { amountEur: true, commissionEur: true },
          _count: true,
        });

        return {
          creator,
          totalRevenue: revenue._sum.amountEur || 0,
          commission: revenue._sum.commissionEur || 0,
          transactionsCount: revenue._count,
        };
      })
    );

    // Trier par revenus décroissants
    creatorsWithRevenue.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      period: days,
      topCreators: creatorsWithRevenue.slice(0, limit),
    });
  },

  // GET /api/admin/revenue/chart - Graphique revenus
  async getRevenueChart(req: Request, res: Response) {
    const days = getQueryNumber(req.query.period, 30);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'completed',
      },
      select: {
        amountEur: true,
        commissionEur: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper par jour
    const revenueByDay: { [key: string]: any } = {};

    transactions.forEach((tx) => {
      const dateKey = tx.createdAt.toISOString().split('T')[0];

      if (!revenueByDay[dateKey]) {
        revenueByDay[dateKey] = {
          date: dateKey,
          revenue: 0,
          commission: 0,
          count: 0,
        };
      }

      revenueByDay[dateKey].revenue += tx.amountEur || 0;
      revenueByDay[dateKey].commission += tx.commissionEur || 0;
      revenueByDay[dateKey].count += 1;
    });

    const chartData = Object.values(revenueByDay);

    res.json({
      period: days,
      data: chartData,
    });
  },
};
