import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const showsController = {
  // GET /api/creator/shows
  async getShows(req: Request, res: Response) {
    if (!req.user || req.user.role !== 'CREATOR') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
      const shows = await prisma.showType.findMany({
        where: { creatorId: req.user.userId },
        orderBy: { sortOrder: 'asc' },
      });
      res.json({ shows });
    } catch (error) {
      console.error('Erreur getShows:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // POST /api/creator/shows
  async createShow(req: Request, res: Response) {
    if (!req.user || req.user.role !== 'CREATOR') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { emoji, title, description, priceCredits, durationLabel, availability } = req.body;

    if (!title || priceCredits === undefined) {
      return res.status(400).json({ error: 'Le titre et le prix sont obligatoires' });
    }

    try {
      // Calculer le prochain sortOrder
      const lastShow = await prisma.showType.findFirst({
        where: { creatorId: req.user.userId },
        orderBy: { sortOrder: 'desc' },
      });
      const nextSortOrder = lastShow ? lastShow.sortOrder + 1 : 0;

      const show = await prisma.showType.create({
        data: {
          creatorId: req.user.userId,
          emoji,
          title,
          description,
          priceCredits: Number(priceCredits),
          durationLabel,
          availability: availability || 'always',
          sortOrder: nextSortOrder,
        },
      });

      res.status(201).json({ show });
    } catch (error) {
      console.error('Erreur createShow:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // PUT /api/creator/shows/:id
  async updateShow(req: Request, res: Response) {
    if (!req.user || req.user.role !== 'CREATOR') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { id } = req.params;
    const { emoji, title, description, priceCredits, durationLabel, availability, isActive } = req.body;

    try {
      // Vérifier que le show appartient bien à ce créateur
      const existingShow = await prisma.showType.findUnique({ where: { id } });
      if (!existingShow || existingShow.creatorId !== req.user.userId) {
        return res.status(404).json({ error: 'Show introuvable' });
      }

      const updatedShow = await prisma.showType.update({
        where: { id },
        data: {
          ...(emoji !== undefined && { emoji }),
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(priceCredits !== undefined && { priceCredits: Number(priceCredits) }),
          ...(durationLabel !== undefined && { durationLabel }),
          ...(availability !== undefined && { availability }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ show: updatedShow });
    } catch (error) {
      console.error('Erreur updateShow:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // DELETE /api/creator/shows/:id
  async deleteShow(req: Request, res: Response) {
    if (!req.user || req.user.role !== 'CREATOR') {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const { id } = req.params;

    try {
      // Vérifier que le show appartient bien à ce créateur
      const existingShow = await prisma.showType.findUnique({ where: { id } });
      if (!existingShow || existingShow.creatorId !== req.user.userId) {
        return res.status(404).json({ error: 'Show introuvable' });
      }

      await prisma.showType.delete({ where: { id } });
      
      res.json({ message: 'Show supprimé avec succès' });
    } catch (error) {
      console.error('Erreur deleteShow:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};
