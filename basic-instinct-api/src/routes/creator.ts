import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { messagesController } from '../controllers/creator/messages.controller';
import { libraryController } from '../controllers/creator/library.controller';
import { profileController } from '../controllers/creator/profile.controller';
import { analyticsController } from '../controllers/creator/analytics.controller';
import { validateBody, validate } from '../middleware/validate';
import { messageLimiter, uploadLimiter } from '../middleware/rateLimiter';
import { 
  updateProfileSchema, 
  sendMessageSchema, 
  createFolderSchema, 
  createLibraryItemSchema 
} from '../schemas/creator.schemas';
import mediaRoutes from './creator/media.routes';

const router = Router();

// Toutes les routes nécessitent authentification + rôle CREATOR
router.use(requireAuth);
router.use(requireRole(['CREATOR']));

// ====================================
// MESSAGES & CONVERSATIONS
// ====================================
router.get('/conversations', messagesController.getConversations);
router.get('/conversations/:clientId/messages', messagesController.getMessages);
router.post('/conversations/:clientId/messages', messageLimiter, validate(sendMessageSchema), messagesController.sendMessage);
router.put('/conversations/:clientId/read', messagesController.markAsRead);
router.get('/conversations/:clientId/info', messagesController.getClientInfo);

// Notes sur clients
router.post('/notes/:clientId', messagesController.saveNote);

// ====================================
// LIBRARY (Bibliothèque privée)
// ====================================
router.get('/library', libraryController.getLibraryItems);
router.post('/library', uploadLimiter, validateBody(createLibraryItemSchema), libraryController.createLibraryItem);
router.delete('/library/:id', libraryController.deleteLibraryItem);
router.put('/library/:id/move', libraryController.moveLibraryItem);
router.get('/library/stats', libraryController.getStats);

// Folders
router.get('/library/folders', libraryController.getFolders);
router.post('/library/folders', validateBody(createFolderSchema), libraryController.createFolder);
router.put('/library/folders/:id', libraryController.updateFolder);
router.delete('/library/folders/:id', libraryController.deleteFolder);

// ====================================
// PROFILE
// ====================================
router.get('/profile', profileController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), profileController.updateProfile);
router.post('/profile/avatar', uploadLimiter, profileController.updateAvatar);
router.post('/profile/banner', uploadLimiter, profileController.updateBanner);

// ====================================
// ANALYTICS & DASHBOARD
// ====================================
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/revenue', analyticsController.getRevenueChart);
router.get('/analytics/subscribers', analyticsController.getSubscribersChart);
router.get('/analytics/top-clients', analyticsController.getTopClients);
router.get('/analytics/stats', analyticsController.getStats);

// ====================================
// MEDIA (Upload R2 - Phase 2)
// ====================================
router.use('/media', mediaRoutes);

export default router;
