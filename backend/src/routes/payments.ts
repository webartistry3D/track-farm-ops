import { Router } from 'express';
import {
  initiateManualPayment,
  submitManualPayment,
  getPaymentHistory,
  getBankDetailsPublic,
  getCurrentPaymentRequest
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Initiate a new manual bank transfer payment
router.post('/manual/initiate', initiateManualPayment);

// Submit "I've Sent the Money"
router.post('/manual/submit', submitManualPayment);

// Get current pending/under-review payment request
router.get('/current', getCurrentPaymentRequest);

// Get payment history for the user's organization
router.get('/history', getPaymentHistory);

// Get bank details (for manual transfer display)
router.get('/bank-details', getBankDetailsPublic);

export default router;
