import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { messagesController } from '../controllers/creator/messages.controller';
import { libraryController } from '../controllers/creator/library.controller';
import { profileController } from '../controllers/creator/profile.controller';
import { analyticsController } from '../controllers/creator/analytics.controller';
import { creatorPayoutsController } from '../controllers/creator/payouts.controller';
import { showsController } from '../controllers/creator/shows.controller';
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
router.post('/library', uploadLimiter, validate(createLibraryItemSchema), libraryController.createLibraryItem);
router.delete('/library/:id', libraryController.deleteLibraryItem);
router.put('/library/:id/move', libraryController.moveLibraryItem);
router.get('/library/stats', libraryController.getStats);

// Folders
router.get('/library/folders', libraryController.getFolders);
router.post('/library/folders', validate(createFolderSchema), libraryController.createFolder);
router.put('/library/folders/:id', libraryController.updateFolder);
router.delete('/library/folders/:id', libraryController.deleteFolder);

// ====================================
// PROFILE
// ====================================
router.get('/profile', profileController.getProfile);
router.put('/profile', validate(updateProfileSchema), profileController.updateProfile);
router.post('/profile/avatar', uploadLimiter, profileController.updateAvatar);
router.post('/profile/banner', uploadLimiter, profileController.updateBanner);
router.post('/profile/photos', uploadLimiter, profileController.addProfilePhoto);
router.delete('/profile/photos', profileController.removeProfilePhoto);
router.put('/profile/payout-settings', creatorPayoutsController.updatePayoutSettings);

// ====================================
// PAYOUTS (Retraits)
// ====================================
router.post('/payouts/request', creatorPayoutsController.requestPayout);
router.get('/payouts/history', creatorPayoutsController.getPayoutHistory);

// ====================================
// ANALYTICS & DASHBOARD
// ====================================
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/revenue', analyticsController.getRevenueChart);
router.get('/analytics/subscribers', analyticsController.getSubscribersChart);
router.get('/analytics/top-clients', analyticsController.getTopClients);
// ====================================
// STATS & ANALYTICS
// ====================================
router.get('/analytics/stats', analyticsController.getStats);

// ====================================
// DEMANDES SPÉCIALES (SHOWS)
// ====================================
router.get('/shows', showsController.getShows);
router.post('/shows', showsController.createShow);
router.put('/shows/:id', showsController.updateShow);
router.delete('/shows/:id', showsController.deleteShow);

// ====================================
// MEDIA (Upload R2 - Phase 2)
// ====================================
router.use('/media', mediaRoutes);

export default router;
