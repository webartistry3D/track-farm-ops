import { Router } from 'express';
import {
  getOrganizationKPIs,
  getRevenueAnalytics,
  getInventoryAnalytics
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get organization KPIs - GET /api/analytics/kpis
router.get('/kpis', getOrganizationKPIs);

// Get revenue analytics - GET /api/analytics/revenue
router.get('/revenue', getRevenueAnalytics);

// Get inventory analytics - GET /api/analytics/inventory
router.get('/inventory', getInventoryAnalytics);

export default router;
