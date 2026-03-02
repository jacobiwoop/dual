import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryString, getQueryNumber } from '../../lib/query';

export const moderationController = {
  // GET /api/admin/moderation/posts - Posts à modérer
  async getPosts(req: Request, res: Response) {
    const flagged = getQueryString(req.query.flagged);
    const limit = getQueryNumber(req.query.limit, 20);
    const offset = getQueryNumber(req.query.offset, 0);

    const whereClause: any = {};
    if (flagged === 'true') {
      // TODO: Ajouter champ isFlagged dans Post
      // whereClause.isFlagged = true;
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    res.json({
      posts,
      total: posts.length,
    });
  },

  // PUT /api/admin/moderation/posts/:id - Modérer un post
  async moderatePost(req: Request, res: Response) {
    const { id } = req.params;
    const { action, reason } = req.body; // approve | reject | hide

    const post = await prisma.post.findUnique({
      where: { id: id as string },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    let updateData: any = {};
    if (action === 'hide' || action === 'reject') {
      updateData.isVisible = false;
    } else if (action === 'approve') {
      updateData.isVisible = true;
    }

    const updated = await prisma.post.update({
      where: { id: id as string },
      data: updateData,
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: `post_${action}`,
        targetType: 'post',
        targetId: id as string,
        details: JSON.stringify({ reason }),
      },
    });

    res.json({
      success: true,
      post: updated,
      message: `Post ${action === 'approve' ? 'approuvé' : 'masqué'}`,
    });
  },

  // GET /api/admin/moderation/media - Médias à modérer
  async getMedia(req: Request, res: Response) {
    const flagged = getQueryString(req.query.flagged);
    const limit = getQueryNumber(req.query.limit, 20);
    const offset = getQueryNumber(req.query.offset, 0);

    const whereClause: any = {};
    if (flagged === 'true') {
      whereClause.isFlagged = true;
    }

    const media = await prisma.mediaItem.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: { uploadDate: 'desc' },
      take: limit,
      skip: offset,
    });

    res.json({
      media,
      total: media.length,
    });
  },

  // PUT /api/admin/moderation/media/:id - Modérer un média
  async moderateMedia(req: Request, res: Response) {
    const { id } = req.params;
    const { action, reason } = req.body;

    const media = await prisma.mediaItem.findUnique({
      where: { id: id as string },
    });

    if (!media) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    const updated = await prisma.mediaItem.update({
      where: { id: id as string },
      data: {
        isVisible: action === 'approve',
        isFlagged: action === 'flag',
      },
    });

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.userId,
        action: `media_${action}`,
        targetType: 'media',
        targetId: id as string,
        details: JSON.stringify({ reason }),
      },
    });

    res.json({
      success: true,
      media: updated,
    });
  },

  // GET /api/admin/moderation/stats - Stats modération
  async getStats(req: Request, res: Response) {
    const [flaggedMedia, hiddenPosts, totalPosts, totalMedia] = await Promise.all([
      prisma.mediaItem.count({ where: { isFlagged: true } }),
      prisma.post.count({ where: { isVisible: false } }),
      prisma.post.count(),
      prisma.mediaItem.count(),
    ]);

    res.json({
      flaggedMedia,
      hiddenPosts,
      totalPosts,
      totalMedia,
    });
  },
};
