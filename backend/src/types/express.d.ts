import "express";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
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
    }
  }
}

export {};
