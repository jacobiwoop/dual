import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, extractR2Key } from '../../lib/r2';

const PROFILE_SELECT = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  bannerUrl: true,
  age: true,
  country: true,
  welcomeMessage: true,
  subscriberWelcomeMsg: true,
  categories: true,
  tags: true,
  profilePhotos: true,
  height: true,
  hairColor: true,
  eyeColor: true,
  bodyType: true,
  tattoos: true,
  subscriptionPrice: true,
  subscriptionPricePlus: true,
  isSubscriptionEnabled: true,
  isPayPerMessageEnabled: true,
  messagePrice: true,
  isSpecialContentEnabled: true,
  specialContentBasePrice: true,
  isPrivateGalleryEnabled: true,
  privateGalleryDefaultPrice: true,
  coinBalance: true,
  totalEarned: true,
  isVerified: true,
  kycStatus: true,
  iban: true,
  ibanVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Helper pour signer toutes les URLs d'images du profil (bannière, avatar, photos profil)
async function signProfileUrls(profile: any) {
  const sign = async (url: string | null) => {
    if (!url || !url.includes('pub-') || !url.includes('.r2.dev')) return url;
    try {
      const key = extractR2Key(url);
      const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
      return await getSignedUrl(r2Client, command, { expiresIn: 604800 });
    } catch {
      return url;
    }
  };

  const p = { ...profile };
  if (p.avatarUrl) p.avatarUrl = await sign(p.avatarUrl);
  if (p.bannerUrl) p.bannerUrl = await sign(p.bannerUrl);
  if (p.profilePhotos) {
    try {
      const photos = JSON.parse(p.profilePhotos);
      if (Array.isArray(photos)) {
        const signedPhotos = await Promise.all(photos.map((u: string) => sign(u)));
        p.profilePhotos = JSON.stringify(signedPhotos);
      }
    } catch (e) {
      console.error('Invalid JSON for profilePhotos:', p.profilePhotos);
    }
  }
  return p;
}

export const profileController = {
  // GET /api/creator/profile
  async getProfile(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });

    const profile = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: PROFILE_SELECT,
    });

    if (!profile) return res.status(404).json({ error: 'Profil non trouvé' });
    const signedProfile = await signProfileUrls(profile);
    res.json({ profile: signedProfile });
  },

  // PUT /api/creator/profile
  async updateProfile(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });

    const {
      displayName, bio, username, subscriptionPrice, subscriptionPricePlus, iban,
      age, country, welcomeMessage, subscriberWelcomeMsg,
      categories, tags, profilePhotos,
      height, hairColor, eyeColor, bodyType, tattoos,
      isSubscriptionEnabled, isPayPerMessageEnabled, messagePrice,
      isSpecialContentEnabled, specialContentBasePrice,
      isPrivateGalleryEnabled, privateGalleryDefaultPrice,
    } = req.body;

    const creatorId = req.user.userId;

    if (username) {
      const existing = await prisma.user.findFirst({ where: { username, id: { not: creatorId } } });
      if (existing) return res.status(400).json({ error: "Ce nom d'utilisateur est déjà pris" });
    }

    if (subscriptionPrice !== undefined && subscriptionPrice < 0)
      return res.status(400).json({ error: "Prix d'abonnement invalide" });

    const profile = await prisma.user.update({
      where: { id: creatorId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(username !== undefined && { username }),
        ...(subscriptionPrice !== undefined && { subscriptionPrice }),
        ...(subscriptionPricePlus !== undefined && { subscriptionPricePlus }),
        ...(iban !== undefined && { iban, ibanVerified: false }),
        ...(age !== undefined && { age: age ? Number(age) : null }),
        ...(country !== undefined && { country }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
        ...(subscriberWelcomeMsg !== undefined && { subscriberWelcomeMsg }),
        ...(categories !== undefined && { categories: JSON.stringify(categories) }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(profilePhotos !== undefined && { profilePhotos: JSON.stringify(profilePhotos) }),
        ...(height !== undefined && { height }),
        ...(hairColor !== undefined && { hairColor }),
        ...(eyeColor !== undefined && { eyeColor }),
        ...(bodyType !== undefined && { bodyType }),
        ...(tattoos !== undefined && { tattoos }),
        ...(isSubscriptionEnabled !== undefined && { isSubscriptionEnabled }),
        ...(isPayPerMessageEnabled !== undefined && { isPayPerMessageEnabled }),
        ...(messagePrice !== undefined && { messagePrice: Number(messagePrice) }),
        ...(isSpecialContentEnabled !== undefined && { isSpecialContentEnabled }),
        ...(specialContentBasePrice !== undefined && { specialContentBasePrice: Number(specialContentBasePrice) }),
        ...(isPrivateGalleryEnabled !== undefined && { isPrivateGalleryEnabled }),
        ...(privateGalleryDefaultPrice !== undefined && { privateGalleryDefaultPrice: Number(privateGalleryDefaultPrice) }),
      },
      select: PROFILE_SELECT,
    });

    const signedProfile = await signProfileUrls(profile);
    res.json({ profile: signedProfile });
  },

  // POST /api/creator/profile/avatar
  async updateAvatar(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const { avatarUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ error: 'URL avatar requise' });

    const profile = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
    const signedProfile = await signProfileUrls(profile);
    res.json({ profile: signedProfile });
  },

  // POST /api/creator/profile/banner
  async updateBanner(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const { bannerUrl } = req.body;
    if (!bannerUrl) return res.status(400).json({ error: 'URL bannière requise' });

    const profile = await prisma.user.update({
      where: { id: req.user.userId },
      data: { bannerUrl },
      select: { id: true, bannerUrl: true },
    });
    const signedProfile = await signProfileUrls(profile);
    res.json({ profile: signedProfile });
  },

  // POST /api/creator/profile/photos - Ajouter une photo de profil (max 4)
  async addProfilePhoto(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const { photoUrl } = req.body;
    if (!photoUrl) return res.status(400).json({ error: 'URL photo requise' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { profilePhotos: true },
    });

    const existing: string[] = user?.profilePhotos ? JSON.parse(user.profilePhotos) : [];
    if (existing.length >= 4) return res.status(400).json({ error: 'Maximum 4 photos de profil' });

    const updated = [...existing, photoUrl];
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { profilePhotos: JSON.stringify(updated) },
    });

    const fakeProfile = await signProfileUrls({ profilePhotos: JSON.stringify(updated) });
    res.json({ profilePhotos: JSON.parse(fakeProfile.profilePhotos) });
  },

  // DELETE /api/creator/profile/photos - Supprimer une photo de profil par index
  async removeProfilePhoto(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' });
    const { index } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { profilePhotos: true },
    });

    const existing: string[] = user?.profilePhotos ? JSON.parse(user.profilePhotos) : [];
    const updated = existing.filter((_, i) => i !== Number(index));

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { profilePhotos: JSON.stringify(updated) },
    });

    const fakeProfile = await signProfileUrls({ profilePhotos: JSON.stringify(updated) });
    res.json({ profilePhotos: JSON.parse(fakeProfile.profilePhotos) });
  },
};
