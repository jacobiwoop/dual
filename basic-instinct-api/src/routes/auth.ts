import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schemas';

const router = Router();

// Public routes with validation and rate limiting
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', requireAuth, authController.me);

export default router;
