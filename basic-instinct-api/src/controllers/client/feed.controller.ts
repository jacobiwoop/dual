import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const feedController = {
  // GET /api/client/feed - Feed des posts des créateurs suivis
  async getFeed(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { limit = 20, offset = 0, visibility } = req.query;
    const clientId = req.user.userId;

    // Récupérer les créateurs auxquels le client est abonné
    const subscriptions = await prisma.subscription.findMany({
      where: {
        clientId,
        status: 'active',
      },
      select: { creatorId: true },
    });

    const followedCreatorIds = subscriptions.map((s) => s.creatorId);

    // Si pas d'abonnements, retourner posts publics
    const whereClause: any = {
      isVisible: true,
      ...(followedCreatorIds.length > 0
        ? {
            OR: [
              { visibility: 'public' },
              {
                visibility: 'subscribers',
                creatorId: { in: followedCreatorIds },
              },
            ],
          }
        : { visibility: 'public' }),
    };

    if (visibility) {
      whereClause.visibility = visibility;
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

    // Vérifier si le client a liké chaque post
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await prisma.like.findUnique({
          where: {
            postId_userId: {
              postId: post.id,
              userId: clientId,
            },
          },
        });

        return {
          ...post,
          isLiked: !!isLiked,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
        };
      })
    );

    res.json({
      posts: postsWithLikeStatus,
      hasMore: posts.length === Number(limit),
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
