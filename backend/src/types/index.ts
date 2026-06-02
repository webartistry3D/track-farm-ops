export interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPERUSER' | 'OWNER' | 'MANAGER' | 'WORKER' | 'ACCOUNTANT' | 'INVENTORY' | 'VETERINARIAN';
  organizationId?: number;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface IncomeEntry {
  id: number;
  amount: number;
  category: string;
  paymentMethod: 'CASH' | 'TRANSFER';
  date: Date;
  userId: number;
  createdAt: Date;
}

export interface ExpenseEntry {
  id: number;
  amount: number;
  category: string;
  note?: string;
  date: Date;
  userId: number;
  createdAt: Date;
}

export interface InventoryItem {
  id: number;
  name: string;
  type: 'LIVESTOCK' | 'PRODUCE' | 'CONSUMABLES';
  unit: string;
  quantity: number;
  createdAt: Date;
}

export interface InventoryTransaction {
  id: number;
  inventoryItemId: number;
  quantityChange: number;
  reason: string;
  date: Date;
  userId: number;
  createdAt: Date;
}
