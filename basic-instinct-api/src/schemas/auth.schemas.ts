import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères').max(20).optional(),
    role: z.enum(['CREATOR', 'CLIENT', 'ADMIN']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requis'),
  }),
});
