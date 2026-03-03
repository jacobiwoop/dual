import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { r2Client, R2_BUCKET_NAME, extractR2Key } from '../../lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const libraryController = {
  // GET /api/creator/library - Liste des médias bibliothèque
  async getLibraryItems(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { folderId, type, search, limit = 50, offset = 0 } = req.query;
    const creatorId = req.user.userId;

    const items = await prisma.libraryItem.findMany({
      where: {
        creatorId,
        ...(folderId && { folderId: folderId as string }),
        ...(type && { type: type as string }),
        ...(search && {
          OR: [
            { filename: { contains: search as string } },
          ],
        }),
      },
      include: {
        folder: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.libraryItem.count({
      where: {
        creatorId,
        ...(folderId && { folderId: folderId as string }),
        ...(type && { type: type as string }),
      },
    });

    // Générer les URLs signées en parallèle pour l'affichage (valides 1h)
    const serialized = await Promise.all(items.map(async (item) => {
      let displayUrl = item.url;
      try {
        const key = extractR2Key(item.url);
        const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
        displayUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
      } catch {
        // Fallback: utiliser l'URL directe si la signature échoue
      }

      let displayThumbnail = item.thumbnailUrl;
      if (item.thumbnailUrl) {
        try {
          const key = extractR2Key(item.thumbnailUrl);
          const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
          displayThumbnail = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        } catch { /* fallback */ }
      }

      return {
        ...item,
        url: displayUrl,
        thumbnailUrl: displayThumbnail,
        sizeBytes: item.sizeBytes !== null ? Number(item.sizeBytes) : null,
      };
    }));

    res.json({
      items: serialized,
      total,
      hasMore: Number(offset) + items.length < total,
    });
  },

  // GET /api/creator/library/folders - Liste des dossiers
  async getFolders(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const creatorId = req.user.userId;

    const folders = await prisma.libraryFolder.findMany({
      where: { creatorId },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ folders });
  },

  // POST /api/creator/library/folders - Créer un dossier
  async createFolder(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { title, description, coverUrl } = req.body;
    const creatorId = req.user.userId;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Titre requis' });
    }

    const folder = await prisma.libraryFolder.create({
      data: {
        creatorId,
        title,
        description: description || null,
        coverUrl: coverUrl || null,
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    res.status(201).json({ folder });
  },

  // PUT /api/creator/library/folders/:id - Modifier un dossier
  async updateFolder(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const { title, description, coverUrl } = req.body;
    const creatorId = req.user.userId;

    // Vérifier que le dossier appartient au créateur
    const existingFolder = await prisma.libraryFolder.findUnique({
      where: { id: id as string },
    });

    if (!existingFolder) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    if (existingFolder.creatorId !== creatorId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const folder = await prisma.libraryFolder.update({
      where: { id: id as string },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(coverUrl !== undefined && { coverUrl }),
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    res.json({ folder });
  },

  // DELETE /api/creator/library/folders/:id - Supprimer un dossier
  async deleteFolder(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const creatorId = req.user.userId;

    // Vérifier que le dossier appartient au créateur
    const folder = await prisma.libraryFolder.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!folder) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    if (folder.creatorId !== creatorId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Empêcher suppression si dossier contient des médias
    if (folder._count.items > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer un dossier contenant des médias',
        itemCount: folder._count.items,
      });
    }

    await prisma.libraryFolder.delete({
      where: { id: id as string },
    });

    res.json({ success: true });
  },

  // POST /api/creator/library - Créer un media item (après upload)
  async createLibraryItem(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const {
      url,
      thumbnailUrl,
      type,
      filename,
      sizeBytes,
      durationSec,
      folderId,
    } = req.body;
    const creatorId = req.user.userId;

    // Validation
    if (!url || !type) {
      return res.status(400).json({ error: 'URL et type requis' });
    }

    if (!['image', 'video'].includes(type)) {
      return res.status(400).json({ error: 'Type invalide (image ou video)' });
    }

    // Vérifier que le dossier appartient au créateur (si folderId fourni)
    if (folderId) {
      const folder = await prisma.libraryFolder.findUnique({
        where: { id: folderId },
      });

      if (!folder || folder.creatorId !== creatorId) {
        return res.status(400).json({ error: 'Dossier invalide' });
      }
    }

    const item = await prisma.libraryItem.create({
      data: {
        creatorId,
        url,
        thumbnailUrl: thumbnailUrl || null,
        type,
        filename: filename || null,
        sizeBytes: sizeBytes ? BigInt(sizeBytes) : null,
        durationSec: durationSec || null,
        folderId: folderId || null,
      },
      include: {
        folder: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({ item });
  },

  // DELETE /api/creator/library/:id - Supprimer un media item
  async deleteLibraryItem(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const creatorId = req.user.userId;

    // Vérifier que le média appartient au créateur
    const item = await prisma.libraryItem.findUnique({
      where: { id: id as string },
    });

    if (!item) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    if (item.creatorId !== creatorId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Vérifier qu'il n'est pas utilisé dans des messages
    const usageCount = await prisma.messageMedia.count({
      where: { libraryItemId: id as string },
    });

    if (usageCount > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer un média utilisé dans des messages',
        usageCount,
      });
    }

    await prisma.libraryItem.delete({
      where: { id: id as string },
    });

    res.json({ success: true });
  },

  // PUT /api/creator/library/:id/move - Déplacer un média vers un autre dossier
  async moveLibraryItem(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.params;
    const { folderId } = req.body;
    const creatorId = req.user.userId;

    // Vérifier que le média appartient au créateur
    const item = await prisma.libraryItem.findUnique({
      where: { id: id as string },
    });

    if (!item) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    if (item.creatorId !== creatorId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Vérifier que le dossier appartient au créateur (si folderId fourni)
    if (folderId) {
      const folder = await prisma.libraryFolder.findUnique({
        where: { id: folderId },
      });

      if (!folder || folder.creatorId !== creatorId) {
        return res.status(400).json({ error: 'Dossier invalide' });
      }
    }

    const updatedItem = await prisma.libraryItem.update({
      where: { id: id as string },
      data: { folderId: folderId || null },
      include: {
        folder: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({ item: updatedItem });
  },

  // GET /api/creator/library/stats - Statistiques bibliothèque
  async getStats(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const creatorId = req.user.userId;

    const [totalItems, totalFolders, imageCount, videoCount, totalSize] = await Promise.all([
      prisma.libraryItem.count({ where: { creatorId } }),
      prisma.libraryFolder.count({ where: { creatorId } }),
      prisma.libraryItem.count({ where: { creatorId, type: 'image' } }),
      prisma.libraryItem.count({ where: { creatorId, type: 'video' } }),
      prisma.libraryItem.aggregate({
        where: { creatorId },
        _sum: { sizeBytes: true },
      }),
    ]);

    res.json({
      totalItems,
      totalFolders,
      imageCount,
      videoCount,
      totalSizeBytes: totalSize._sum.sizeBytes?.toString() || '0',
    });
  },
};
