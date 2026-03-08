import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { extractR2Key, r2Client, R2_BUCKET_NAME } from '../../lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const feedController = {
  // GET /api/client/feed - Feed: liste des créateurs suivis ou à découvrir
  async getFeed(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { limit = 20, offset = 0 } = req.query;
    const clientId = req.user.userId;
    const take = Number(limit);
    const skip = Number(offset);

    // Récupérer les créateurs auxquels le client est abonné
    const subscriptions = await prisma.subscription.findMany({
      where: { clientId, status: 'active' },
      select: { creatorId: true },
    });

    const followedCreatorIds = subscriptions.map((s) => s.creatorId);

    // Récupérer les créateurs actifs (via la table User, role = CREATOR)
    const creators = await prisma.user.findMany({
      where: {
        role: 'CREATOR',
        isActive: true,
        isSuspended: false,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        profilePhotos: true,
        bio: true,
        isVerified: true,
        subscriptionPrice: true,
        _count: {
          select: {
            posts: true,
            subscriptionsAsCreator: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      // On ne fait pas le "take/skip" ici car on va "déplier" la liste
    });

    // 1. Déplier les créateurs (Illusion de multiplicité)
    let virtualList: any[] = [];
    
    for (const creator of creators) {
      let photos: string[] = [];
      try {
        if (creator.profilePhotos) {
          const parsed = JSON.parse(creator.profilePhotos);
          if (Array.isArray(parsed)) photos = parsed;
        }
      } catch (e) {}

      // Si pas de photos additionnelles, on garde juste l'avatar principal
      if (photos.length === 0) {
        virtualList.push({ ...creator, virtualId: `${creator.id}_0`, displayPhoto: creator.avatarUrl });
      } else {
        // On limite à 4 photos max pour l'illusion
        const photosToUse = photos.slice(0, 4);
        photosToUse.forEach((photo, idx) => {
          virtualList.push({
            ...creator,
            virtualId: `${creator.id}_${idx}`,
            displayPhoto: photo
          });
        });
      }
    }

    // 2. Mélanger la liste pour que les doublons soient dispersés
    // Utilisation d'un seed basé sur la date du jour ou autre pour garder une certaine cohérence ?
    // Pour l'instant on mélange simplement de façon pseudo-aléatoire
    virtualList.sort(() => Math.random() - 0.5);

    // 3. Appliquer la pagination sur la liste virtuelle
    const paginatedList = virtualList.slice(skip, skip + take);

    // 4. Signer les URLs pour chaque créateur virtuel
    const signedCreators = await Promise.all(
      paginatedList.map(async (vCreator) => {
        let displayPhotoUrl = vCreator.displayPhoto;
        
        if (displayPhotoUrl) {
          try {
            const key = extractR2Key(displayPhotoUrl);
            const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
            displayPhotoUrl = await getSignedUrl(r2Client, command, { expiresIn: 604800 });
          } catch (e) {
            console.error(`Failed to sign photo for ${vCreator.username}`, e);
          }
        }

        return {
          id: vCreator.id, // Original ID
          virtualId: vCreator.virtualId, // ID unique pour React key
          username: vCreator.username,
          displayName: vCreator.displayName,
          avatarUrl: displayPhotoUrl, // URL signée de la photo choisie
          bio: vCreator.bio,
          isVerified: vCreator.isVerified,
          subscriptionPrice: vCreator.subscriptionPrice,
          postsCount: vCreator._count.posts,
          subscribersCount: vCreator._count.subscriptionsAsCreator,
          isFollowed: followedCreatorIds.includes(vCreator.id),
        };
      })
    );

    res.json({
      creators: signedCreators,
      hasMore: skip + take < virtualList.length,
    });
  },

  // POST /api/client/posts/:id/like - Liker un post
  async likePost(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const clientId = req.user.userId;

    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: id as string },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Vérifier si déjà liké
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id as string,
          userId: clientId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      // Décrémenter le compteur
      await prisma.post.update({
        where: { id: id as string },
        data: { likesCount: { decrement: 1 } },
      });

      return res.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId: id as string,
          userId: clientId,
        },
      });

      // Incrémenter le compteur
      await prisma.post.update({
        where: { id: id as string },
        data: { likesCount: { increment: 1 } },
      });

      return res.json({ liked: true });
    }
  },

  // POST /api/client/posts/:id/comment - Commenter un post
  async commentPost(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const { content } = req.body;
    const clientId = req.user.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Commentaire vide' });
    }

    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: id as string },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id as string,
        userId: clientId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Incrémenter le compteur de commentaires
    await prisma.post.update({
      where: { id: id as string },
      data: { commentsCount: { increment: 1 } },
    });

    res.status(201).json({ comment });
  },

  // GET /api/client/posts/:id/comments - Récupérer les commentaires d'un post
  async getComments(req: Request, res: Response) {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const comments = await prisma.comment.findMany({
      where: { postId: id as string },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    res.json({
      comments,
      hasMore: comments.length === Number(limit),
    });
  },

  // GET /api/client/posts/:id - Récupérer un post spécifique
  async getPost(req: Request, res: Response) {
    const { id } = req.params;
    const clientId = req.user?.userId;

    const post = await prisma.post.findUnique({
      where: { id: id as string },
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
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Vérifier si le client a liké
    let isLiked = false;
    if (clientId) {
      const like = await prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: id as string,
            userId: clientId,
          },
        },
      });
      isLiked = !!like;
    }

    res.json({
      post: {
        ...post,
        isLiked,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
      },
    });
  },
};
