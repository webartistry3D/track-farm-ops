import { Router } from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid
} from '../controllers/invoiceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create invoice - POST /api/invoices
router.post('/', createInvoice);

// Get all invoices for current user - GET /api/invoices
// Supports query parameters: ?limit=10&offset=0&status=PENDING
router.get('/', getInvoices);

// Get specific invoice by ID - GET /api/invoices/:id
router.get('/:id', getInvoiceById);

// Update invoice - PUT /api/invoices/:id
router.put('/:id', updateInvoice);

// Delete invoice - DELETE /api/invoices/:id
router.delete('/:id', deleteInvoice);

// Mark invoice as paid - PATCH /api/invoices/:id/mark-paid
router.patch('/:id/mark-paid', markInvoiceAsPaid);

export default router;
