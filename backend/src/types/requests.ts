/**
 * Request Type Definitions
 * Generic types for Express Request properties
 */

import { Request } from 'express';
import { AuthRequest } from '../middleware/auth';

// Import Prisma types for proper enum typing
import { User } from '@prisma/client';

// Common request body types
export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role?: User['role']; // Use Prisma enum type
  organizationId?: number;
  farmName?: string;
}

export interface AssetQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
}

export interface AssetParams {
  id: string;
}

export interface FinanceQueryParams {
  startDate?: string;
  endDate?: string;
  type?: string;
  page?: string;
  limit?: string;
}

// Generic request helpers with proper typing
export function getTypedBody<T>(req: Request): T {
  return req.body as T;
}

export function getTypedQuery<T>(req: Request): T {
  return req.query as T;
}

export function getTypedParams<T>(req: Request): T {
  return req.params as T;
}

// Auth-specific helpers
export function getAuthUser(req: AuthRequest) {
  return req.user;
}

export function getAuthUserId(req: AuthRequest): number | undefined {
  return req.user?.id;
}

export function getAuthUserRole(req: AuthRequest): string | undefined {
  return req.user?.role;
}

export function getAuthOrgId(req: AuthRequest): number | undefined {
  return req.user?.organizationId;
}
