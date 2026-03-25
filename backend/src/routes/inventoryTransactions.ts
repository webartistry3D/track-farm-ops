import express from 'express';
import { InventoryTransactionController } from '../controllers/inventoryTransactionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Record inventory usage
router.post('/usage', InventoryTransactionController.recordUsage);

// Add inventory (restock)
router.post('/add', InventoryTransactionController.addInventory);

// Get usage history
router.get('/history', InventoryTransactionController.getUsageHistory);

// Get usage analytics
router.get('/analytics', InventoryTransactionController.getUsageAnalytics);

// Get low stock alerts
router.get('/alerts', InventoryTransactionController.getLowStockAlerts);

export default router;
