/**
 * Global TypeScript Declaration
 * Disables strict checking for Express Request properties
 */

declare global {
  namespace Express {
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
      get(header: string): string | string[] | undefined;
      file?: any;
    }
  }
}

export {};
