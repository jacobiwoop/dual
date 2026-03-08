import { prisma } from '../../lib/prisma';
import { extractR2Key, r2Client, R2_BUCKET_NAME } from '../../lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
        profilePhotos: true,
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

    const signedCreators = await Promise.all(creators.map(async (c) => {
      let rawAvatarUrl = c.avatarUrl;
      if (!rawAvatarUrl && c.profilePhotos) {
        try {
          const photos = JSON.parse(c.profilePhotos);
          if (Array.isArray(photos) && photos.length > 0) {
            rawAvatarUrl = photos[0];
          }
        } catch (e) {}
      }

      let displayAvatarUrl = rawAvatarUrl;
      if (rawAvatarUrl) {
        try {
          const key = extractR2Key(rawAvatarUrl);
          const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
          displayAvatarUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
        } catch (e) {}
      }

      return {
        ...c,
        avatarUrl: displayAvatarUrl,
        subscribersCount: c._count.subscriptionsAsCreator,
        postsCount: c._count.posts,
      };
    }));

    res.json({
      creators: signedCreators,
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
        age: true,
        country: true,
        height: true,
        hairColor: true,
        eyeColor: true,
        bodyType: true,
        tattoos: true,
        profilePhotos: true,
        isSubscriptionEnabled: true,
        isPayPerMessageEnabled: true,
        messagePrice: true,
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

    let rawAvatarUrl = creator.avatarUrl;
    if (!rawAvatarUrl && creator.profilePhotos) {
      try {
        const photos = JSON.parse(creator.profilePhotos);
        if (Array.isArray(photos) && photos.length > 0) {
          rawAvatarUrl = photos[0];
        }
      } catch (e) {}
    }

    let displayAvatarUrl = rawAvatarUrl;
    if (rawAvatarUrl) {
      try {
        const key = extractR2Key(rawAvatarUrl);
        const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
        displayAvatarUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
      } catch (e) {}
    }

    let displayBannerUrl = creator.bannerUrl;
    if (creator.bannerUrl) {
      try {
        const key = extractR2Key(creator.bannerUrl);
        const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
        displayBannerUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
      } catch (e) {}
    }

    res.json({
      creator: {
        ...creator,
        avatarUrl: displayAvatarUrl,
        bannerUrl: displayBannerUrl,
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

    // Posts visibles
    const whereClause: any = {
      creatorId: creator.id,
      isVisible: true,
    };

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
        mediaItems: {
          include: {
            mediaItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    // URL Signing
    const signedPosts = await Promise.all(posts.map(async (post) => {
      let signedAtts = [];
      if (post.mediaItems && post.mediaItems.length > 0) {
         signedAtts = await Promise.all(post.mediaItems.map(async (att: any) => {
           if (!att.mediaItem) return att;
           let displayUrl = att.mediaItem.url;
           try {
             const key = extractR2Key(att.mediaItem.url);
             const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
             displayUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
           } catch (e) {}

           let displayThumbnail = att.mediaItem.thumbnailUrl;
           if (att.mediaItem.thumbnailUrl) {
             try {
               const key = extractR2Key(att.mediaItem.thumbnailUrl);
               const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
               displayThumbnail = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
             } catch (e) {}
           }
           
           return {
             ...att,
             isPremium: !isSubscribed && post.visibility !== 'public',
             mediaItem: {
               ...att.mediaItem,
               url: displayUrl,
               thumbnailUrl: displayThumbnail,
               fileSizeBytes: att.mediaItem.fileSizeBytes !== null ? Number(att.mediaItem.fileSizeBytes) : null,
             }
           };
         }));
      }

      return {
        ...post,
        mediaItems: signedAtts
      }
    }));

    res.json({
      posts: signedPosts,
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

    const galleries = await prisma.gallery.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          take: 4, // Prendre quelques miniatures pour la cover
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    // URL Signing
    const signedGalleries = await Promise.all(galleries.map(async (g) => {
      let signedItems = [];
      if (g.items && g.items.length > 0) {
        signedItems = await Promise.all(g.items.map(async (item: any) => {
           let displayUrl = item.url;
           try {
             const key = extractR2Key(item.url);
             const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
             displayUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
           } catch (e) {}

           let displayThumbnail = item.thumbnailUrl;
           if (item.thumbnailUrl) {
             try {
               const key = extractR2Key(item.thumbnailUrl);
               const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
               displayThumbnail = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
             } catch (e) {}
           }
           return {
             ...item,
             isPremium: !isSubscribed && g.visibility !== 'free',
             url: displayUrl,
             thumbnailUrl: displayThumbnail,
             fileSizeBytes: item.fileSizeBytes !== null ? Number(item.fileSizeBytes) : null,
           };
        }));
      }

      let displayCoverUrl = g.coverUrl;
      if (g.coverUrl) {
        try {
          const key = extractR2Key(g.coverUrl);
          const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
          displayCoverUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
        } catch (e) {}
      }

      return {
        ...g,
        coverUrl: displayCoverUrl,
        itemsCount: g._count.items,
        items: signedItems,
      }
    }));


    res.json({
      galleries: signedGalleries,
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
      select: {
        isSubscriptionEnabled: true,
        subscriptionPrice: true,
        subscriptionPricePlus: true,
      }
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    if (!creator.isSubscriptionEnabled) {
      return res.status(400).json({ error: "Ce créateur n'accepte pas les abonnements actuellement." });
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

    // Prix selon tier (déjà en pièces)
    const priceCoins = creator.subscriptionPrice || 0;

    // Vérifier que le client a assez de pièces
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { coinBalance: true },
    });

    if (!client || client.coinBalance < priceCoins) {
      return res.status(400).json({
        error: 'Crédits insuffisants',
        required: priceCoins,
        available: client?.coinBalance || 0,
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
        priceCredits: priceCoins,
        status: 'active',
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      },
      update: {
        tier,
        priceCredits: priceCoins,
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
        coinBalance: { decrement: priceCoins },
        totalSpent: { increment: priceCoins },
      },
    });

    // Créditer le créateur (80% après commission)
    const creatorRevenueCoins = Math.floor(priceCoins * 0.8);
    const commissionCoins = priceCoins - creatorRevenueCoins;
    await prisma.user.update({
      where: { id: id as string },
      data: {
        coinBalance: { increment: creatorRevenueCoins },
        totalEarned: { increment: creatorRevenueCoins },
      },
    });

    // Créer transaction
    await prisma.transaction.create({
      data: {
        userId: clientId,
        type: 'subscription',
        amountCoins: priceCoins,
        commissionCoins: commissionCoins,
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
