import rateLimit from 'express-rate-limit';

// Rate limiter strict pour auth (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les endpoints généraux
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requêtes par minute
  message: {
    error: 'Trop de requêtes, veuillez ralentir',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour upload/actions sensibles
export const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 uploads par minute
  message: {
    error: 'Trop d\'uploads, veuillez patienter',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les messages
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages par minute
  message: {
    error: 'Trop de messages envoyés, veuillez ralentir',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
