import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const profileController = {
  // GET /api/creator/profile - Profil du créateur connecté
  async getProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const profile = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        bannerUrl: true,
        subscriptionPrice: true,
        subscriptionPricePlus: true,
        balance: true,
        totalEarned: true,
        isVerified: true,
        kycStatus: true,
        iban: true,
        ibanVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }

    res.json({ profile });
  },

  // PUT /api/creator/profile - Modifier le profil
  async updateProfile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const {
      displayName,
      bio,
      username,
      subscriptionPrice,
      subscriptionPricePlus,
      iban,
    } = req.body;

    const creatorId = req.user.userId;

    // Vérifier username unique si changé
    if (username) {
      const existing = await prisma.user.findFirst({
        where: {
          username,
          id: { not: creatorId },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
      }
    }

    // Validation des prix
    if (subscriptionPrice !== undefined && subscriptionPrice < 0) {
      return res.status(400).json({ error: 'Prix d\'abonnement invalide' });
    }

    if (subscriptionPricePlus !== undefined && subscriptionPricePlus < 0) {
      return res.status(400).json({ error: 'Prix d\'abonnement Plus invalide' });
    }

    const profile = await prisma.user.update({
      where: { id: creatorId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(username !== undefined && { username }),
        ...(subscriptionPrice !== undefined && { subscriptionPrice }),
        ...(subscriptionPricePlus !== undefined && { subscriptionPricePlus }),
        ...(iban !== undefined && { iban, ibanVerified: false }), // Reset verification si IBAN changé
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        bannerUrl: true,
        subscriptionPrice: true,
        subscriptionPricePlus: true,
        balance: true,
        totalEarned: true,
        isVerified: true,
        kycStatus: true,
        iban: true,
        ibanVerified: true,
        updatedAt: true,
      },
    });

    res.json({ profile });
  },

  // POST /api/creator/profile/avatar - Upload avatar (URL fournie après upload S3)
  async updateAvatar(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ error: 'URL avatar requise' });
    }

    const profile = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    res.json({ profile });
  },

  // POST /api/creator/profile/banner - Upload bannière
  async updateBanner(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { bannerUrl } = req.body;

    if (!bannerUrl) {
      return res.status(400).json({ error: 'URL bannière requise' });
    }

    const profile = await prisma.user.update({
      where: { id: req.user.userId },
      data: { bannerUrl },
      select: {
        id: true,
        bannerUrl: true,
      },
    });

    res.json({ profile });
  },
};
