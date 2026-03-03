import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const analyticsController = {
  // GET /api/creator/analytics/overview - Vue d'ensemble du dashboard
  async getOverview(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const creatorId = req.user.userId;
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Récupérer les stats en parallèle
    const [
      creator,
      totalSubscribers,
      newSubscribersLast7Days,
      totalMessages,
      unreadMessages,
      libraryItemsCount,
      totalEarnings,
      earningsLast30Days,
    ] = await Promise.all([
      // Créateur
      prisma.user.findUnique({
        where: { id: creatorId },
        select: {
          coinBalance: true,
          totalEarned: true,
          subscriptionPrice: true,
        },
      }),

      // Abonnés total
      prisma.subscription.count({
        where: {
          creatorId,
          status: 'active',
        },
      }),

      // Nouveaux abonnés (7 jours)
      prisma.subscription.count({
        where: {
          creatorId,
          status: 'active',
          startedAt: { gte: last7Days },
        },
      }),

      // Messages total
      prisma.message.count({
        where: { senderId: creatorId },
      }),

      // Messages non lus reçus
      prisma.message.count({
        where: {
          conversation: {
            participants: {
              some: { userId: creatorId },
            },
          },
          senderId: { not: creatorId },
          isRead: false,
        },
      }),

      // Médias bibliothèque
      prisma.libraryItem.count({
        where: { creatorId },
      }),

      // Revenus total
      prisma.transaction.aggregate({
        where: {
          userId: creatorId,
          type: { in: ['subscription', 'tip', 'media', 'gallery', 'show'] },
          status: 'completed',
        },
        _sum: { amountCoins: true },
      }),

      // Revenus 30 derniers jours
      prisma.transaction.aggregate({
        where: {
          userId: creatorId,
          type: { in: ['subscription', 'tip', 'media', 'gallery', 'show'] },
          status: 'completed',
          createdAt: { gte: last30Days },
        },
        _sum: { amountCoins: true },
      }),
    ]);

    res.json({
      balance: creator?.coinBalance || 0,
      totalEarned: creator?.totalEarned || 0,
      earningsLast30Days: earningsLast30Days._sum.amountCoins || 0,
      subscriptionPrice: creator?.subscriptionPrice || 0,
      subscribers: {
        total: totalSubscribers,
        new7Days: newSubscribersLast7Days,
      },
      messages: {
        total: totalMessages,
        unread: unreadMessages,
      },
      library: {
        totalItems: libraryItemsCount,
      },
    });
  },

  // GET /api/creator/analytics/revenue - Graphique revenus
  async getRevenueChart(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { period = '30' } = req.query; // 7, 30, 90 jours
    const creatorId = req.user.userId;
    const days = parseInt(String(period).replace(/\D/g, ''), 10) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Récupérer toutes les transactions de la période
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: creatorId,
        type: { in: ['subscription', 'tip', 'media', 'gallery', 'show'] },
        status: 'completed',
        createdAt: { gte: startDate },
      },
      select: {
        amountCoins: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Grouper par jour
    const revenueByDay: { [key: string]: { date: string; total: number; byType: { [key: string]: number } } } = {};

    transactions.forEach((tx) => {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      
      if (!revenueByDay[dateKey]) {
        revenueByDay[dateKey] = {
          date: dateKey,
          total: 0,
          byType: {},
        };
      }

      revenueByDay[dateKey].total += tx.amountCoins || 0;
      revenueByDay[dateKey].byType[tx.type] = (revenueByDay[dateKey].byType[tx.type] || 0) + (tx.amountCoins || 0);
    });

    const chartData = Object.values(revenueByDay);

    res.json({
      period: days,
      data: chartData,
      total: chartData.reduce((sum, day) => sum + day.total, 0),
    });
  },

  // GET /api/creator/analytics/subscribers - Graphique abonnés
  async getSubscribersChart(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { period = '30' } = req.query;
    const creatorId = req.user.userId;
    const days = parseInt(String(period).replace(/\D/g, ''), 10) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Récupérer les abonnements de la période
    const subscriptions = await prisma.subscription.findMany({
      where: {
        creatorId,
        startedAt: { gte: startDate },
      },
      select: {
        startedAt: true,
        tier: true,
      },
      orderBy: { startedAt: 'asc' },
    });

    // Grouper par jour
    const subsByDay: { [key: string]: { date: string; count: number; normal: number; plus: number } } = {};

    subscriptions.forEach((sub) => {
      const dateKey = sub.startedAt.toISOString().split('T')[0];
      
      if (!subsByDay[dateKey]) {
        subsByDay[dateKey] = {
          date: dateKey,
          count: 0,
          normal: 0,
          plus: 0,
        };
      }

      subsByDay[dateKey].count += 1;
      if (sub.tier === 'plus') {
        subsByDay[dateKey].plus += 1;
      } else {
        subsByDay[dateKey].normal += 1;
      }
    });

    const chartData = Object.values(subsByDay);

    res.json({
      period: days,
      data: chartData,
      total: subscriptions.length,
    });
  },

  // GET /api/creator/analytics/top-clients - Meilleurs clients
  async getTopClients(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { limit = 10 } = req.query;
    const creatorId = req.user.userId;

    // Récupérer les abonnés avec leurs stats
    const subscribers = await prisma.subscription.findMany({
      where: {
        creatorId,
        status: 'active',
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            totalSpent: true,
          },
        },
      },
      take: Number(limit),
    });

    // Enrichir avec nombre de messages
    const topClients = await Promise.all(
      subscribers.map(async (sub) => {
        const messageCount = await prisma.message.count({
          where: {
            conversation: {
              participants: {
                every: {
                  OR: [
                    { userId: creatorId },
                    { userId: sub.client.id },
                  ],
                },
              },
            },
          },
        });

        return {
          client: sub.client,
          subscription: {
            tier: sub.tier,
            startedAt: sub.startedAt,
          },
          messageCount,
        };
      })
    );

    // Trier par totalSpent
    topClients.sort((a, b) => b.client.totalSpent - a.client.totalSpent);

    res.json({
      topClients: topClients.slice(0, Number(limit)),
    });
  },

  // GET /api/creator/analytics/stats - Stats générales
  async getStats(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const creatorId = req.user.userId;

    const [
      postsCount,
      likesCount,
      commentsCount,
      galleriesCount,
      showTypesCount,
      withdrawalsCount,
    ] = await Promise.all([
      prisma.post.count({ where: { creatorId } }),
      prisma.like.count({
        where: {
          post: { creatorId },
        },
      }),
      prisma.comment.count({
        where: {
          post: { creatorId },
        },
      }),
      prisma.gallery.count({ where: { creatorId } }),
      prisma.showType.count({ where: { creatorId, isActive: true } }),
      prisma.withdrawal.count({ where: { creatorId } }),
    ]);

    res.json({
      posts: postsCount,
      likes: likesCount,
      comments: commentsCount,
      galleries: galleriesCount,
      showTypes: showTypesCount,
      withdrawals: withdrawalsCount,
    });
  },
};
