import { Router } from 'express';
import { 
  getCurrentSubscription,
  createSubscription,
  verifyPayment,
  cancelSubscription,
  updateSubscription
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';
import SubscriptionRateLimiter from '../middleware/subscriptionRateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting to all subscription routes
router.use(SubscriptionRateLimiter.middleware);

// Get current subscription
router.get('/current', getCurrentSubscription);

// Create new subscription
router.post('/create', createSubscription);

// Verify payment
router.post('/verify', verifyPayment);

// Cancel subscription
router.post('/cancel', cancelSubscription);

// Update subscription
router.put('/update', updateSubscription);

export default router;
