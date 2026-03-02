import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès refusé',
        message: `Rôle requis: ${roles.join(' ou ')}`,
      });
    }

    next();
  };
};
