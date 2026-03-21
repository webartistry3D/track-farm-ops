/**
 * Express Request Helper Types
 * Provides type-safe access to Express Request properties
 */

import { Request } from 'express';
import { AuthRequest } from '../middleware/auth';

export type ExpressRequest = Request;

export function getRequestBody(req: AuthRequest): any {
  return (req as any).body;
}

export function getRequestQuery(req: AuthRequest): any {
  return (req as any).query;
}

export function getRequestParams(req: AuthRequest): any {
  return (req as any).params;
}

export function getRequestHeaders(req: AuthRequest): any {
  return (req as any).headers;
}

export function getRequestMethod(req: AuthRequest): string {
  return (req as any).method;
}

export function getRequestUrl(req: AuthRequest): string {
  return (req as any).url;
}

export function getRequestPath(req: AuthRequest): string {
  return (req as any).path;
}

export function getRequestIp(req: AuthRequest): string {
  return (req as any).ip;
}

export function getRequestConnection(req: AuthRequest): any {
  return (req as any).connection;
}

export function getRequestSocket(req: AuthRequest): any {
  return (req as any).socket;
}

export function getRequestHeader(req: AuthRequest, header: string): string | undefined {
  return (req as any).get(header);
}
