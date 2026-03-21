import { Router } from 'express';
import {
  getFinancialReport,
  getInventoryReport,
  getOperationalReport
} from '../controllers/reportingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get financial report - GET /api/reports/financial
router.get('/financial', getFinancialReport);

// Get inventory report - GET /api/reports/inventory
router.get('/inventory', getInventoryReport);

// Get operational report - GET /api/reports/operational
router.get('/operational', getOperationalReport);

export default router;
