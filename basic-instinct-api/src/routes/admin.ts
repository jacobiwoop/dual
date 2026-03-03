import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { adminCreatorsController } from '../controllers/admin/creators.controller';
import { moderationController } from '../controllers/admin/moderation.controller';
import { transactionsController } from '../controllers/admin/transactions.controller';
import { withdrawalsController } from '../controllers/admin/withdrawals.controller';
import { dashboardController } from '../controllers/admin/dashboard.controller';
import { adminPaymentsController } from '../controllers/admin/payments.controller';

const router = Router();

// Toutes les routes nécessitent authentification + rôle ADMIN
router.use(requireAuth);
router.use(requireRole(['ADMIN']));

// ====================================
// DASHBOARD
// ====================================
router.get('/dashboard', dashboardController.getDashboard);
router.get('/logs', dashboardController.getLogs);
router.get('/settings', dashboardController.getSettings);
router.put('/settings/:key', dashboardController.updateSetting);

// ====================================
// CREATORS MANAGEMENT
// ====================================
router.get('/creators', adminCreatorsController.getCreators);
router.get('/creators/:id', adminCreatorsController.getCreator);
router.put('/creators/:id/verify', adminCreatorsController.verifyCreator);
router.put('/creators/:id/suspend', adminCreatorsController.suspendCreator);
router.put('/creators/:id/kyc', adminCreatorsController.updateKycStatus);
router.get('/creators/:id/analytics', adminCreatorsController.getCreatorAnalytics);

// ====================================
// MODERATION
// ====================================
router.get('/moderation/posts', moderationController.getPosts);
router.put('/moderation/posts/:id', moderationController.moderatePost);
router.get('/moderation/media', moderationController.getMedia);
router.put('/moderation/media/:id', moderationController.moderateMedia);
router.get('/moderation/stats', moderationController.getStats);

// ====================================
// TRANSACTIONS & REVENUE
// ====================================
router.get('/transactions', transactionsController.getTransactions);
router.get('/revenue/stats', transactionsController.getRevenueStats);
router.get('/revenue/by-creator', transactionsController.getRevenueByCreator);
router.get('/revenue/chart', transactionsController.getRevenueChart);

// ====================================
// WITHDRAWALS
// ====================================
router.get('/withdrawals', withdrawalsController.getWithdrawals);
router.get('/withdrawals/:id', withdrawalsController.getWithdrawal);
router.put('/withdrawals/:id/approve', withdrawalsController.approveWithdrawal);
router.put('/withdrawals/:id/reject', withdrawalsController.rejectWithdrawal);
router.get('/withdrawals/stats', withdrawalsController.getStats);

// ====================================
// Achat de pièces (Validation Admin)
// ====================================
router.get('/payments/requests', adminPaymentsController.getPurchaseRequests);
router.put('/payments/requests/:id/approve', adminPaymentsController.approvePurchaseRequest);
router.put('/payments/requests/:id/reject', adminPaymentsController.rejectPurchaseRequest);

export default router;
