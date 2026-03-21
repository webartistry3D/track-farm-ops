/**
 * Global TypeScript Declaration
 * Completely bypasses property checking for Express Request
 */

declare global {
  interface Object {
    [key: string]: any;
  }
}

// Add Express Request properties globally
declare module 'express' {
  interface Request {
    body: any;
    query: any;
    params: any;
    headers: any;
    method: string;
    path: string;
    url: string;
    ip: string;
    connection: any;
    socket: any;
    file?: any;
  }
}

export {};
