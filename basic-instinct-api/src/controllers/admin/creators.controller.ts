import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryString, getQueryNumber } from '../../lib/query';

export const adminCreatorsController = {
  // GET /api/admin/creators - Liste tous les créateurs
  async getCreators(req: Request, res: Response) {
    const search = getQueryString(req.query.search);
    const status = getQueryString(req.query.status);
    const verified = getQueryString(req.query.verified);
    const limit = getQueryNumber(req.query.limit, 20);
    const offset = getQueryNumber(req.query.offset, 0);

    const whereClause: any = { role: 'CREATOR' };

    if (search) {
      whereClause.OR = [
        { username: { contains: search } },
        { displayName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status === 'suspended') {
      whereClause.isSuspended = true;
    } else if (status === 'active') {
      whereClause.isSuspended = false;
      whereClause.isActive = true;
    }

    if (verified === 'true') {
      whereClause.isVerified = true;
    } else if (verified === 'false') {
      whereClause.isVerified = false;
    }

    const creators = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isVerified: true,
        kycStatus: true,
        isSuspended: true,
        suspendedReason: true,
        balance: true,
        totalEarned: true,
        subscriptionPrice: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            subscriptionsAsCreator: true,
            posts: true,
            withdrawals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.user.count({ where: whereClause });

    res.json({
      creators: creators.map((c) => ({
        ...c,
        subscribersCount: c._count.subscriptionsAsCreator,
        postsCount: c._count.posts,
        withdrawalsCount: c._count.withdrawals,
      })),
      total,
      hasMore: offset + creators.length < total,
    });
  },

  // GET /api/admin/creators/:id - Détails d'un créateur
  async getCreator(req: Request, res: Response) {
    const { id } = req.params;

    const creator = await prisma.user.findUnique({
      where: { id: id as string, role: 'CREATOR' },
      include: {
        _count: {
          select: {
            subscriptionsAsCreator: true,
            posts: true,
            galleries: true,
            libraryItems: true,
            withdrawals: true,
            kycSubmissions: true,
          },
        },
      },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    // Revenus 30 derniers jours
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRevenue = await prisma.transaction.aggregate({
      where: {
        userId: id as string,
        createdAt: { gte: last30Days },
        type: { in: ['subscription', 'tip', 'media', 'gallery'] },
        status: 'completed',
      },
      _sum: { amountEur: true },
    });

    res.json({
      creator: {
        ...creator,
        subscribersCount: creator._count?.subscriptionsAsCreator || 0,
        postsCount: creator._count?.posts || 0,
        galleriesCount: creator._count?.galleries || 0,
        libraryItemsCount: creator._count?.libraryItems || 0,
        withdrawalsCount: creator._count?.withdrawals || 0,
        kycSubmissionsCount: creator._count?.kycSubmissions || 0,
        revenueLastMonth: recentRevenue._sum?.amountEur || 0,
      },
    });
  },

  // PUT /api/admin/creators/:id/verify - Vérifier un créateur
  async verifyCreator(req: Request, res: Response) {
    const { id } = req.params;
    const { verified } = req.body;

    const creator = await prisma.user.findUnique({
      where: { id: id as string, role: 'CREATOR' },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    const updated = await prisma.user.update({
      where: { id: id as string },
      data: { isVerified: verified },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: verified ? 'creator_verified' : 'creator_unverified',
        targetType: 'user',
        targetId: id as string,
        details: JSON.stringify({ username: creator.username }),
      },
    });

    res.json({
      success: true,
      creator: updated,
      message: verified ? 'Créateur vérifié' : 'Vérification retirée',
    });
  },

  // PUT /api/admin/creators/:id/suspend - Suspendre un créateur
  async suspendCreator(req: Request, res: Response) {
    const { id } = req.params;
    const { suspend, reason } = req.body;

    const creator = await prisma.user.findUnique({
      where: { id: id as string, role: 'CREATOR' },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    const updated = await prisma.user.update({
      where: { id: id as string },
      data: {
        isSuspended: suspend,
        suspendedReason: suspend ? reason : null,
        suspendedAt: suspend ? new Date() : null,
      },
    });

    // Invalider tous les refresh tokens si suspendu
    if (suspend) {
      await prisma.refreshToken.deleteMany({
        where: { userId: id as string },
      });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: suspend ? 'creator_suspended' : 'creator_unsuspended',
        targetType: 'user',
        targetId: id as string,
        details: JSON.stringify({ username: creator.username, reason }),
      },
    });

    res.json({
      success: true,
      creator: updated,
      message: suspend ? 'Créateur suspendu' : 'Suspension levée',
    });
  },

  // PUT /api/admin/creators/:id/kyc - Approuver/rejeter KYC
  async updateKycStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { kycStatus, rejectionReason } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(kycStatus)) {
      return res.status(400).json({ error: 'Statut KYC invalide' });
    }

    const creator = await prisma.user.findUnique({
      where: { id: id as string, role: 'CREATOR' },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    const updated = await prisma.user.update({
      where: { id: id as string },
      data: { kycStatus },
    });

    // Mettre à jour la dernière soumission KYC
    const lastSubmission = await prisma.kycSubmission.findFirst({
      where: { creatorId: id as string },
      orderBy: { submittedAt: 'desc' },
    });

    if (lastSubmission) {
      await prisma.kycSubmission.update({
        where: { id: lastSubmission.id },
        data: {
          status: kycStatus,
          rejectionReason: kycStatus === 'rejected' ? rejectionReason : null,
          reviewedAt: new Date(),
          reviewedBy: req.user!.userId,
        },
      });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: `kyc_${kycStatus}`,
        targetType: 'user',
        targetId: id as string,
        details: JSON.stringify({ username: creator.username, rejectionReason }),
      },
    });

    res.json({
      success: true,
      creator: updated,
      message: `KYC ${kycStatus === 'approved' ? 'approuvé' : 'rejeté'}`,
    });
  },

  // GET /api/admin/creators/:id/analytics - Analytics d'un créateur
  async getCreatorAnalytics(req: Request, res: Response) {
    const { id } = req.params;
    const days = getQueryNumber(req.query.period, 30);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [revenue, subscribers, transactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: id as string,
          createdAt: { gte: startDate },
          type: { in: ['subscription', 'tip', 'media', 'gallery'] },
          status: 'completed',
        },
        _sum: { amountEur: true, commissionEur: true },
        _count: true,
      }),

      prisma.subscription.count({
        where: {
          creatorId: id as string,
          status: 'active',
        },
      }),

      prisma.transaction.findMany({
        where: {
          userId: id as string,
          createdAt: { gte: startDate },
          status: 'completed',
        },
        select: {
          type: true,
          amountEur: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      period: days,
      revenue: revenue._sum.amountEur || 0,
      commission: revenue._sum.commissionEur || 0,
      transactionsCount: revenue._count,
      subscribers,
      transactions,
    });
  },
};
