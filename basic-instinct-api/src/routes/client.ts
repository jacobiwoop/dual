import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { feedController } from '../controllers/client/feed.controller';
import { creatorsController } from '../controllers/client/creators.controller';
import { clientMessagesController } from '../controllers/client/messages.controller';
import { creditsController } from '../controllers/client/credits.controller';
import { clientPaymentsController } from '../controllers/client/payments.controller';
import { validateBody, validate } from '../middleware/validate';
import { messageLimiter } from '../middleware/rateLimiter';
import { 
  subscribeSchema, 
  purchaseCreditsSchema, 
  commentPostSchema, 
  sendClientMessageSchema 
} from '../schemas/client.schemas';

const router = Router();

// Toutes les routes nécessitent authentification + rôle CLIENT
router.use(requireAuth);
router.use(requireRole(['CLIENT']));

// ====================================
// FEED & POSTS
// ====================================
router.get('/feed', feedController.getFeed);
router.get('/posts/:id', feedController.getPost);
router.post('/posts/:id/like', feedController.likePost);
router.post('/posts/:id/comment', validate(commentPostSchema), feedController.commentPost);
router.get('/posts/:id/comments', feedController.getComments);

// ====================================
// CREATORS (Explore & Profils)
// ====================================
router.get('/creators', creatorsController.getCreators);
router.get('/creators/:username', creatorsController.getCreatorProfile);
router.get('/creators/:username/posts', creatorsController.getCreatorPosts);
router.get('/creators/:username/galleries', creatorsController.getCreatorGalleries);

// Subscriptions
router.post('/creators/:id/subscribe', validate(subscribeSchema), creatorsController.subscribe);
router.delete('/creators/:id/subscribe', creatorsController.unsubscribe);

// ====================================
// MESSAGES
// ====================================
router.get('/conversations', clientMessagesController.getConversations);
router.get('/conversations/:creatorId/messages', clientMessagesController.getMessages);
router.post('/conversations/:creatorId/messages', messageLimiter, validate(sendClientMessageSchema), clientMessagesController.sendMessage);
router.post('/messages/:id/unlock', clientMessagesController.unlockMessage);

// ====================================
// CREDITS
// ====================================
router.get('/credits/balance', creditsController.getBalance);
router.post('/credits/purchase', validateBody(purchaseCreditsSchema), creditsController.purchaseCredits);
router.get('/credits/history', creditsController.getHistory);
router.get('/credits/packs', creditsController.getPacks);

// ====================================
// ACHAT DE PIÈCES (PAYMENTS)
// ====================================
router.post('/payments/buy-coins', clientPaymentsController.buyCoins);
router.get('/payments/history', clientPaymentsController.getPurchaseHistory);

export default router;
