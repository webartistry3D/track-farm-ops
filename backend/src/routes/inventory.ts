import { Router } from 'express';
import {
  getInventorySettings,
  getInventoryUnits,
  getInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryQuantity,
  getInventoryTransactions,
  getInventorySummary,
  deleteInventoryItem,
  getInventoryCategories,
  createInventoryCategory
} from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Inventory settings route
router.get('/settings', getInventorySettings);

// Inventory units route
router.get('/units', getInventoryUnits);

// Inventory categories routes
router.get('/categories', getInventoryCategories);
router.post('/categories', authorize(['OWNER', 'MANAGER']), createInventoryCategory);

// Inventory items routes
router.get('/items', getInventoryItems);
router.post('/items', authorize(['OWNER', 'MANAGER']), createInventoryItem);
router.put('/items/:id', authorize(['OWNER', 'MANAGER']), updateInventoryItem);
router.put('/items/:id/quantity', updateInventoryQuantity);
router.delete('/items/:id', authorize(['OWNER', 'MANAGER']), deleteInventoryItem);

// Inventory transactions routes
router.get('/transactions', getInventoryTransactions);

// Inventory summary route
router.get('/summary', getInventorySummary);

export default router;
