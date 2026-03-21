/**
 * Backend Storage Service
 * Handles file uploads for both local development and AWS S3 production
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export interface StorageConfig {
  type: 'local' | 's3';
  uploadPath?: string;
  baseUrl?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

class StorageService {
  private config: StorageConfig;
  private uploadDir: string;
  private tempDir: string;

  constructor() {
    this.config = this.getStorageConfig();
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.tempDir = path.join(__dirname, '../../temp');
    
    this.ensureDirectories();
  }

  private getStorageConfig(): StorageConfig {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production') {
      return {
        type: 's3',
        bucket: process.env.AWS_S3_BUCKET || 'trackfarmops-documents',
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        endpoint: process.env.AWS_ENDPOINT,
        forcePathStyle: process.env.AWS_FORCE_PATH_STYLE === 'true'
      };
    } else {
      return {
        type: 'local',
        uploadPath: './uploads',
        baseUrl: 'http://localhost:3001/uploads'
      };
    }
  }

  private async ensureDirectories() {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  /**
   * Get multer middleware for file uploads
   */
  getUploadMiddleware() {
    const storage = multer.memoryStorage();
    return multer({
      storage,
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
      fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} is not allowed`) as any, false);
        }
      }
    });
  }

  /**
   * Upload file to storage
   */
  async uploadFile(file: Express.Multer.File, key: string): Promise<{ url: string; key: string }> {
    try {
      console.log(`📤 Uploading file: ${file.originalname} → ${key} (${this.config.type} storage)`);

      if (this.config.type === 's3') {
        return await this.uploadToS3(file, key);
      } else {
        return await this.uploadToLocal(file, key);
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(file: Express.Multer.File, key: string): Promise<{ url: string; key: string }> {
    try {
      // For now, simulate S3 upload with local storage
      // In production, you would use AWS SDK here
      const filePath = path.join(this.uploadDir, key);
      const dir = path.dirname(filePath);
      
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, file.buffer);

      const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
      
      console.log(`✅ S3 upload simulated: ${key}`);
      return { url, key };
    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      throw new Error('S3 upload failed');
    }
  }

  /**
   * Upload file to local storage
   */
  private async uploadToLocal(file: Express.Multer.File, key: string): Promise<{ url: string; key: string }> {
    try {
      const filePath = path.join(this.uploadDir, key);
      const dir = path.dirname(filePath);
      
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, file.buffer);

      const url = `${this.config.baseUrl}/${key}`;
      
      console.log(`✅ Local upload: ${key}`);
      console.log(`📁 File saved to: ${filePath}`);
      console.log(`🔗 Generated URL: ${url}`);
      return { url, key };
    } catch (error) {
      console.error('❌ Local upload failed:', error);
      throw new Error('Local upload failed');
    }
  }

  /**
   * Get file from storage
   */
  async getFile(key: string): Promise<Buffer | null> {
    try {
      if (this.config.type === 'local') {
        const filePath = path.join(this.uploadDir, key);
        try {
          return await fs.readFile(filePath);
        } catch (error) {
          return null;
        }
      } else {
        // S3 - for now, read from local storage (simulated)
        const filePath = path.join(this.uploadDir, key);
        try {
          return await fs.readFile(filePath);
        } catch (error) {
          return null;
        }
      }
    } catch (error) {
      console.error('❌ Get file failed:', error);
      return null;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting file: ${key} (${this.config.type} storage)`);

      if (this.config.type === 'local') {
        const filePath = path.join(this.uploadDir, key);
        try {
          await fs.unlink(filePath);
          return true;
        } catch (error) {
          console.warn('File not found for deletion:', key);
          return true; // Consider it successful if file doesn't exist
        }
      } else {
        // S3 - for now, delete from local storage (simulated)
        const filePath = path.join(this.uploadDir, key);
        try {
          await fs.unlink(filePath);
          return true;
        } catch (error) {
          console.warn('File not found for deletion:', key);
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Delete file failed:', error);
      return false;
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(key: string): string {
    if (this.config.type === 'local') {
      return `${this.config.baseUrl}/${key}`;
    } else {
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
    }
  }

  /**
   * Clear all stored files (development only)
   */
  async clearStorage(): Promise<boolean> {
    try {
      if (this.config.type === 'local') {
        await fs.rm(this.uploadDir, { recursive: true, force: true });
        await fs.mkdir(this.uploadDir, { recursive: true });
      }
      
      console.log('🧹 Storage cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Clear storage failed:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    storageType: string;
  }> {
    try {
      let totalFiles = 0;
      let totalSize = 0;

      const countFiles = async (dir: string): Promise<void> => {
        try {
          const items = await fs.readdir(dir);
          for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = await fs.stat(itemPath);
            
            if (stat.isDirectory()) {
              await countFiles(itemPath);
            } else {
              totalFiles++;
              totalSize += stat.size;
            }
          }
        } catch (error) {
          // Directory doesn't exist or is empty
        }
      };

      await countFiles(this.uploadDir);

      return {
        totalFiles,
        totalSize,
        storageType: this.config.type
      };
    } catch (error) {
      console.error('❌ Get storage stats failed:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        storageType: this.config.type
      };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing
export { StorageService };

// Middleware for serving uploaded files
export const serveUploads = (req: Request, res: Response) => {
  const key = req.params[0]; // Get everything after /uploads/
  const filePath = path.join(storageService['uploadDir'], key);

  fs.readFile(filePath)
    .then(file => {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      res.send(file);
    })
    .catch(error => {
      console.error('Serve file error:', error);
      res.status(404).json({ error: 'File not found' });
    });
};
