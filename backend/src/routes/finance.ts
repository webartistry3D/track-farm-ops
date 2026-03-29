import { Router } from 'express';
import { 
  createIncomeEntry, 
  getIncomeEntries, 
  createExpenseEntry, 
  getExpenseEntries,
  getFinancialSummary,
  getVATRecords
} from '../controllers/financeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Income routes
router.post('/income', createIncomeEntry);
router.get('/income', getIncomeEntries);

// Expense routes
router.post('/expenses', createExpenseEntry);
router.get('/expenses', getExpenseEntries);

// VAT routes
router.get('/vat/records', getVATRecords);

// Summary routes - only owners can view full summaries
router.get('/summary', authorize(['OWNER', 'MANAGER']), getFinancialSummary);

export default router;
