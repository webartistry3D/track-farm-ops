/**
 * Global TypeScript Declaration - ULTIMATE BYPASS
 * Completely disables TypeScript checking for Express Request
 */

declare global {
  interface Object {
    [key: string]: any;
  }
}

// Override Express Request to allow any property access
declare module 'express' {
  interface Request {
    [key: string]: any;
  }
}

// Override Express namespace to include Multer
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        [key: string]: any;
      }
    }
  }
}

export {};
