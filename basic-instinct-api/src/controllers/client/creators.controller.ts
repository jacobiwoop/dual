import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const creatorsController = {
  // GET /api/client/creators - Liste des créateurs (explore)
  async getCreators(req: Request, res: Response) {
    const { search, limit = 20, offset = 0, verified } = req.query;

    const whereClause: any = {
      role: 'CREATOR',
      isActive: true,
      isSuspended: false,
    };

    if (search) {
      whereClause.OR = [
        { username: { contains: search as string } },
        { displayName: { contains: search as string } },
        { bio: { contains: search as string } },
      ];
    }

    if (verified === 'true') {
      whereClause.isVerified = true;
    }

    const creators = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        subscriptionPrice: true,
        subscriptionPricePlus: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            subscriptionsAsCreator: true,
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      creators: creators.map((c) => ({
        ...c,
        subscribersCount: c._count.subscriptionsAsCreator,
        postsCount: c._count.posts,
      })),
      hasMore: creators.length === Number(limit),
    });
  },

  // GET /api/client/creators/:username - Profil public d'un créateur
  async getCreatorProfile(req: Request, res: Response) {
    const { username } = req.params;
    const clientId = req.user?.userId;

    const creator = await prisma.user.findUnique({
      where: { username: username as string },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        subscriptionPrice: true,
        subscriptionPricePlus: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            subscriptionsAsCreator: true,
            posts: true,
            galleries: true,
          },
        },
      },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    if (creator.id === clientId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas consulter votre propre profil ici' });
    }

    // Vérifier si le client est abonné
    let subscription = null;
    if (clientId) {
      subscription = await prisma.subscription.findUnique({
        where: {
          clientId_creatorId: {
            clientId,
            creatorId: creator.id,
          },
        },
      });
    }

    res.json({
      creator: {
        ...creator,
        subscribersCount: creator._count.subscriptionsAsCreator,
        postsCount: creator._count.posts,
        galleriesCount: creator._count.galleries,
      },
      isSubscribed: !!subscription,
      subscription: subscription
        ? {
            tier: subscription.tier,
            status: subscription.status,
            startedAt: subscription.startedAt,
            renewsAt: subscription.renewsAt,
          }
        : null,
    });
  },

  // GET /api/client/creators/:username/posts - Posts publics du créateur
  async getCreatorPosts(req: Request, res: Response) {
    const { username } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const clientId = req.user?.userId;

    const creator = await prisma.user.findUnique({
      where: { username: username as string },
      select: { id: true },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    // Vérifier si abonné
    let isSubscribed = false;
    if (clientId) {
      const sub = await prisma.subscription.findUnique({
        where: {
          clientId_creatorId: {
            clientId,
            creatorId: creator.id,
          },
        },
      });
      isSubscribed = sub?.status === 'active';
    }

    // Posts visibles selon statut abonnement
    const whereClause: any = {
      creatorId: creator.id,
      isVisible: true,
    };

    if (isSubscribed) {
      whereClause.visibility = { in: ['public', 'subscribers'] };
    } else {
      whereClause.visibility = 'public';
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      posts,
      hasMore: posts.length === Number(limit),
    });
  },

  // GET /api/client/creators/:username/galleries - Galeries du créateur
  async getCreatorGalleries(req: Request, res: Response) {
    const { username } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    const clientId = req.user?.userId;

    const creator = await prisma.user.findUnique({
      where: { username: username as string },
      select: { id: true },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    // Vérifier si abonné
    let isSubscribed = false;
    if (clientId) {
      const sub = await prisma.subscription.findUnique({
        where: {
          clientId_creatorId: {
            clientId,
            creatorId: creator.id,
          },
        },
      });
      isSubscribed = sub?.status === 'active';
    }

    // Galeries visibles
    const whereClause: any = {
      creatorId: creator.id,
      isVisible: true,
    };

    if (!isSubscribed) {
      whereClause.visibility = 'free';
    }

    const galleries = await prisma.gallery.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      galleries: galleries.map((g) => ({
        ...g,
        itemsCount: g._count.items,
      })),
      hasMore: galleries.length === Number(limit),
    });
  },

  // POST /api/client/creators/:id/subscribe - S'abonner à un créateur
  async subscribe(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const { tier = 'normal' } = req.body;
    const clientId = req.user.userId;

    // Vérifier que le créateur existe
    const creator = await prisma.user.findUnique({
      where: { id: id as string, role: 'CREATOR' },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    // Vérifier si déjà abonné
    const existing = await prisma.subscription.findUnique({
      where: {
        clientId_creatorId: {
          clientId,
          creatorId: id as string,
        },
      },
    });

    if (existing && existing.status === 'active') {
      return res.status(400).json({ error: 'Déjà abonné à ce créateur' });
    }

    // Prix selon tier
    const price = tier === 'plus' ? creator.subscriptionPricePlus : creator.subscriptionPrice;
    const priceCredits = Math.round(price * 10); // 1€ = 10 crédits

    // Vérifier que le client a assez de crédits
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

    // Créer ou réactiver l'abonnement
    const subscription = await prisma.subscription.upsert({
      where: {
        clientId_creatorId: {
          clientId,
          creatorId: id as string,
        },
      },
      create: {
        clientId,
        creatorId: id as string,
        tier,
        priceCredits,
        status: 'active',
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      },
      update: {
        tier,
        priceCredits,
        status: 'active',
        startedAt: new Date(),
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelledAt: null,
      },
    });

    // Débiter les crédits du client
    await prisma.user.update({
      where: { id: clientId },
      data: {
        balanceCredits: { decrement: priceCredits },
        totalSpent: { increment: price },
      },
    });

    // Créditer le créateur (80% après commission)
    const creatorRevenue = price * 0.8;
    await prisma.user.update({
      where: { id: id as string },
      data: {
        balance: { increment: creatorRevenue },
        totalEarned: { increment: creatorRevenue },
      },
    });

    // Créer transaction
    await prisma.transaction.create({
      data: {
        userId: clientId,
        type: 'subscription',
        amountCredits: priceCredits,
        amountEur: price,
        commissionEur: price * 0.2,
        commissionRate: 0.2,
        status: 'completed',
        referenceId: subscription.id,
      },
    });

    res.status(201).json({
      subscription,
      message: 'Abonnement créé avec succès',
    });
  },

  // DELETE /api/client/creators/:id/subscribe - Se désabonner
  async unsubscribe(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const clientId = req.user.userId;

    const subscription = await prisma.subscription.findUnique({
      where: {
        clientId_creatorId: {
          clientId,
          creatorId: id as string,
        },
      },
    });

    if (!subscription || subscription.status !== 'active') {
      return res.status(404).json({ error: 'Aucun abonnement actif trouvé' });
    }

    // Annuler l'abonnement (reste actif jusqu'à la fin de la période)
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    res.json({
      message: 'Abonnement annulé. Vous restez abonné jusqu\'à la date de renouvellement.',
      endsAt: subscription.renewsAt,
    });
  },
};
