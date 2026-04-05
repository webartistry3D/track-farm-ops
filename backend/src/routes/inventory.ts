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

// Manual seeding routes (for production/debugging)
router.post('/seed-organization', authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    const { organizationId } = req.body;
    const { manuallySeedOrganization } = await import('../utils/manualSeeding');
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const success = await manuallySeedOrganization(organizationId);
    
    if (success) {
      res.json({ message: 'Organization seeded successfully' });
    } else {
      res.status(500).json({ error: 'Failed to seed organization' });
    }
  } catch (error) {
    console.error('Manual seeding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/seed-all-empty', authorize(['OWNER', 'MANAGER']), async (req, res) => {
  try {
    const { seedAllEmptyOrganizations } = await import('../utils/manualSeeding');
    
    const success = await seedAllEmptyOrganizations();
    
    if (success) {
      res.json({ message: 'All empty organizations seeded successfully' });
    } else {
      res.status(500).json({ error: 'Failed to seed some organizations' });
    }
  } catch (error) {
    console.error('Seed all organizations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/status', async (req, res) => {
  try {
    const { getOrganizationInventoryStatus } = await import('../utils/manualSeeding');
    
    const organizations = await getOrganizationInventoryStatus();
    
    res.json({ organizations });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
