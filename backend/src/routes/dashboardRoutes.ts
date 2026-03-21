import { Router } from 'express';
import {
  getDashboardData,
  getDashboardCharts
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get dashboard data - GET /api/dashboard
router.get('/', getDashboardData);

// Get dashboard charts - GET /api/dashboard/charts
router.get('/charts', getDashboardCharts);

export default router;
