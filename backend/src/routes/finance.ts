import { Router } from 'express';
import { 
  createIncomeEntry, 
  getIncomeEntries, 
  deleteIncomeEntry,
  createExpenseEntry, 
  getExpenseEntries,
  deleteExpenseEntry,
  getFinancialSummary,
  getVatRecords
} from '../controllers/financeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Income routes
router.post('/income', createIncomeEntry);
router.get('/income', getIncomeEntries);
router.delete('/income/:id', deleteIncomeEntry);

// Expense routes
router.post('/expenses', createExpenseEntry);
router.get('/expenses', getExpenseEntries);
router.delete('/expenses/:id', deleteExpenseEntry);

// VAT routes
router.get('/vat/records', getVatRecords);

// Summary routes - only owners can view full summaries
router.get('/summary', authorize(['OWNER', 'MANAGER']), getFinancialSummary);

export default router;
