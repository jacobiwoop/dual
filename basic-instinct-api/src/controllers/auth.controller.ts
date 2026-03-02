import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export const authController = {
  // Register (Inscription)
  async register(req: Request, res: Response) {
    const { email, password, username, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email: email as string } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Vérifier si le username existe déjà (si fourni)
    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username: username as string } });
      if (existingUsername) {
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà pris' });
      }
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        username: username || null,
        role: role || 'CLIENT',
        displayName: username || email.split('@')[0],
      },
    });

    // Générer les tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email } as object,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id } as object,
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions
    );

    // Stocker le refresh token en DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      },
    });

    res.status(201).json({
      message: 'Inscription réussie',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });
  },

  // Login (Connexion)
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email: email as string } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Vérifier si le compte est suspendu
    if (user.isSuspended) {
      return res.status(403).json({ 
        error: 'Compte suspendu',
        reason: user.suspendedReason,
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Générer les tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, email: user.email } as object,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id } as object,
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions
    );

    // Stocker le refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Mettre à jour lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    res.json({
      message: 'Connexion réussie',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        balance: user.balance,
        balanceCredits: user.balanceCredits,
      },
    });
  },

  // Refresh token
  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }

    try {
      // Vérifier le refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };

      // Vérifier qu'il existe en DB
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        return res.status(401).json({ error: 'Refresh token invalide' });
      }

      // Vérifier l'expiration
      if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        return res.status(401).json({ error: 'Refresh token expiré' });
      }

      // Vérifier que le user n'est pas suspendu
      if (storedToken.user.isSuspended) {
        return res.status(403).json({ error: 'Compte suspendu' });
      }

      // Générer un nouveau access token
      const accessToken = jwt.sign(
        { userId: storedToken.user.id, role: storedToken.user.role, email: storedToken.user.email } as object,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as SignOptions
      );

      res.json({
        accessToken,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          role: storedToken.user.role,
        },
      });
    } catch (error) {
      return res.status(401).json({ error: 'Refresh token invalide' });
    }
  },

  // Logout
  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }

    // Supprimer le refresh token de la DB
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    res.json({ message: 'Déconnexion réussie' });
  },

  // Get current user (moi)
  async me(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        avatarUrl: true,
        bio: true,
        bannerUrl: true,
        balance: true,
        balanceCredits: true,
        subscriptionPrice: true,
        subscriptionPricePlus: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  },
};
