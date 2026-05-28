export interface User {
  id: number;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'WORKER' | 'SUPERUSER';
  organizationId?: number;
  organizationName?: string;
  createdAt: string;
  lastPasswordChange?: string;
  passwordChangeCount?: number;
  requiresPasswordChange?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  requestId?: string;
  debug?: {
    responseTime?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface IncomeEntry {
  id: number;
  amount: number;
  category: string;
  paymentMethod: 'CASH' | 'TRANSFER';
  date: string;
  description?: string;
  quantity?: string;
  unitPrice?: string;
  // VAT fields from database
  enableVAT?: boolean;
  vatRate?: number;
  vatAmount?: number;
  subtotal?: number;
  invoiceVat?: number; // VAT from corresponding invoice record (legacy)
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  invoiceCreator?: string; // Original invoice creator for invoice-based income
  approvedBy?: string; // User who marked invoice as paid
  metadata?: {
    invoiceCreator?: string;
    invoiceId?: number;
    invoiceNumber?: string;
  }; // Metadata for invoice-related info
}

export interface ExpenseEntry {
  id: number;
  amount: number;
  category: string;
  note?: string;
  date: string;
  userId: number;
  createdAt: string;
  merchant?: string;
  hasReceipt?: boolean;
  receiptImageUrl?: string;
  ocrConfidence?: number;
  ocrSource?: string;
  rawText?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: Array<{
    category: string;
    amount: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
}

export interface InventoryItem {
  id: number;
  name: string;
  type: 'LIVESTOCK' | 'PRODUCE' | 'CONSUMABLES' | 'SEEDS' | 'FERTILIZERS' | 'PESTICIDES' | 'EQUIPMENT' | 'SUPPLIES' | 'MEDICINE' | 'FEED' | 'OTHER';
  unit: string;
  quantity: number;
  initialQuantity?: number;
  description?: string; // Added: Direct description field
  categoryId?: number;
  // Added: Direct fields for better performance
  location?: string;
  supplier?: string;
  purchaseDate?: string;
  expiryDate?: string;
  minimumStock?: number;
  pricePerUnit?: number;
  // Keep metadata for flexibility and backward compatibility
  metadata?: {
    notes?: string;
    [key: string]: any; // Allow additional fields
  };
  category?: {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
  };
}

export interface InventoryTransaction {
  id: number;
  inventoryItemId: number;
  quantityChange: number;
  reason: string;
  usageType?: 'INITIAL_STOCK' | 'RESTOCK' | 'FEEDING' | 'PLANTING' | 'SALES' | 'WASTE' | 'TRANSFER' | 'ADJUSTMENT' | 'OTHER';
  costPerUnit?: number;
  totalCost?: number;
  relatedEntity?: string;
  relatedEntityId?: number;
  date: string;
  userId: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'OWNER' | 'MANAGER' | 'WORKER';
  };
  inventoryItem: {
    id: number;
    name: string;
    type: 'LIVESTOCK' | 'PRODUCE' | 'CONSUMABLES';
    unit: string;
  };
}

export interface InventorySummary {
  totalItems: number;
  livestock: number;
  produce: number;
  consumables: number;
  totalTransactions: number;
  itemsByType: {
    LIVESTOCK: InventoryItem[];
    PRODUCE: InventoryItem[];
    CONSUMABLES: InventoryItem[];
  };
}
