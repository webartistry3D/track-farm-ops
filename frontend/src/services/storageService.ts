/**
 * Storage Service
 * Handles file uploads for both local development and AWS S3 production
 */

import { getStorageConfig, validateFile, generateUniqueFilename } from '../config/storage';
import type { StorageConfig } from '../config/storage';
import { api } from '../lib/api';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
  metadata?: {
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  };
}

export interface FileMetadata {
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  key?: string;
  url?: string;
}

/**
 * Storage Service Class
 */
class StorageService {
  private config: StorageConfig;

  constructor() {
    this.config = getStorageConfig();
    
    // Validate configuration on initialization
    if (!this.validateConfig()) {
      console.error('❌ Storage service configuration is invalid');
      throw new Error('Invalid storage configuration');
    }
  }

  /**
   * Validate storage configuration
   */
  private validateConfig(): boolean {
    if (this.config.type === 's3') {
      return !!(this.config.bucket && this.config.region && 
               this.config.accessKeyId && this.config.secretAccessKey);
    } else if (this.config.type === 'local') {
      return !!(this.config.uploadPath && this.config.baseUrl);
    }
    return false;
  }

  /**
   * Upload file to storage
   */
  async uploadFile(
    file: File | ArrayBuffer, 
    folder: string = 'general',
    originalName?: string
  ): Promise<UploadResult> {
    try {
      // Handle different file types
      let fileArrayBuffer: ArrayBuffer;
      let fileName: string;
      let mimeType: string;

      if (file instanceof File) {
        // Validate file
        const validation = validateFile(file, this.config);
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error
          };
        }

        fileArrayBuffer = await file.arrayBuffer();
        fileName = originalName || file.name;
        mimeType = file.type;
      } else {
        // ArrayBuffer input
        fileArrayBuffer = file;
        fileName = originalName || 'upload';
        mimeType = this.detectMimeType(fileArrayBuffer);
      }

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(fileName, mimeType);
      const key = `${folder}/${uniqueFilename}`;

      console.log(`📤 Uploading file: ${fileName} → ${key} (${this.config.type} storage)`);

      // Upload based on storage type
      if (this.config.type === 's3') {
        return await this.uploadToS3(fileArrayBuffer, key, mimeType, fileName);
      } else {
        return await this.uploadToLocal(fileArrayBuffer, key, mimeType, fileName);
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(
    arrayBuffer: ArrayBuffer, 
    key: string, 
    mimeType: string, 
    originalName: string
  ): Promise<UploadResult> {
    try {
      // For now, we'll simulate S3 upload with API call
      // In a real implementation, you'd use AWS SDK
      const formData = new FormData();
      formData.append('file', new Blob([arrayBuffer], { type: mimeType }));
      formData.append('key', key);
      formData.append('bucket', this.config.bucket!);
      formData.append('region', this.config.region!);

      // Call backend upload endpoint
      const response = await api.post('/storage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (!response.data) {
        throw new Error(`Upload failed: No response data`);
      }

      const result = response.data;

      return {
        success: true,
        url: result.url,
        key: result.key,
        metadata: {
          originalName,
          size: arrayBuffer.byteLength,
          mimeType,
          uploadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'S3 upload failed'
      };
    }
  }

  /**
   * Upload file to local storage
   */
  private async uploadToLocal(
    arrayBuffer: ArrayBuffer, 
    key: string, 
    mimeType: string, 
    originalName: string
  ): Promise<UploadResult> {
    try {
      // For local development, we'll use localStorage for small files
      // and API for larger files
      const isSmallFile = arrayBuffer.byteLength < 1024 * 1024; // 1MB
      const isReceiptImage = key.startsWith('receipts/');

      if (isSmallFile && !isReceiptImage) {
        // Store in localStorage for development (but NOT for receipt images)
        const base64 = this.bufferToBase64(arrayBuffer, mimeType);
        const storageKey = `trackfarmops_file_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        localStorage.setItem(storageKey, base64);
        
        const url = `${this.config.baseUrl}/${key}`;

        return {
          success: true,
          url,
          key,
          metadata: {
            originalName,
            size: arrayBuffer.byteLength,
            mimeType,
            uploadedAt: new Date().toISOString()
          }
        };
      } else {
        // Use API for larger files OR receipt images
        console.log('📤 Using API upload for:', isReceiptImage ? 'receipt image' : 'large file');
        const formData = new FormData();
        formData.append('file', new Blob([arrayBuffer], { type: mimeType }));
        formData.append('key', key);

        console.log('📤 Sending upload request:');
        console.log('📁 FormData key:', key);
        console.log('📄 File size:', arrayBuffer.byteLength);
        console.log('📄 MIME type:', mimeType);

        const response = await api.post('/storage/upload-local', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }).catch(error => {
          console.error('❌ Backend upload failed:', error);
          console.error('❌ Error response:', error.response);
          console.error('❌ Error status:', error.response?.status);
          console.error('❌ Error data:', error.response?.data);
          throw error;
        });

        console.log('📡 Backend upload response:', response);
        console.log('📊 Response data:', response.data);
        console.log('📊 Response status:', response.status);

        if (!response.data) {
          throw new Error(`Upload failed: No response data`);
        }

        const result = response.data;

        return {
          success: true,
          url: result.url,
          key: result.key,
          metadata: {
            originalName,
            size: arrayBuffer.byteLength,
            mimeType,
            uploadedAt: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error('❌ Local upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Local upload failed'
      };
    }
  }

  /**
   * Get file from storage
   */
  async getFile(key: string): Promise<string | null> {
    try {
      if (this.config.type === 'local') {
        // Try localStorage first
        const storageKey = `trackfarmops_file_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const stored = localStorage.getItem(storageKey);
        
        if (stored) {
          return stored;
        }

        // Fallback to API
        const response = await api.get(`/storage/file/${key}`);
        if (response.data) {
          return response.data;
        }
      } else {
        // S3 - get via API
        const s3Response = await api.get(`/storage/file/${key}`);
        if (s3Response.data) {
          return s3Response.data;
        }
      }

      return null;
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
        // Remove from localStorage
        const storageKey = `trackfarmops_file_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
        localStorage.removeItem(storageKey);

        // Also call API to delete from server
        await api.delete(`/storage/file/${key}`);
      } else {
        // S3 - delete via API
        await api.delete(`/storage/file/${key}`);
      }

      return true;
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
      // S3 URL - this would be generated based on your S3 configuration
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
    }
  }

  /**
   * Convert Buffer to Base64
   */
  private bufferToBase64(arrayBuffer: ArrayBuffer, mimeType: string): string {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Detect MIME type from buffer
   */
  private detectMimeType(arrayBuffer: ArrayBuffer): string {
    // Simple MIME type detection based on file signatures
    const signatures: Record<string, string> = {
      '89504e47': 'image/png',
      'ffd8ffe0': 'image/jpeg',
      'ffd8ffe1': 'image/jpeg',
      'ffd8ffe2': 'image/jpeg',
      'ffd8ffe3': 'image/jpeg',
      'ffd8ffe8': 'image/jpeg',
      '25504446': 'application/pdf',
      '504b0304': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'd0cf11e0': 'application/vnd.ms-excel'
    };

    const bytes = new Uint8Array(arrayBuffer.slice(0, 4));
    const signature = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toLowerCase();
    
    return signatures[signature] || 'application/octet-stream';
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
      // Count files in localStorage
      let totalFiles = 0;
      let totalSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('trackfarmops_file_')) {
          totalFiles++;
          const value = localStorage.getItem(key);
          if (value) {
            // Estimate size from base64 string
            totalSize += value.length * 0.75; // Base64 is ~33% larger
          }
        }
      }

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

  /**
   * Clear all stored files (development only)
   */
  async clearStorage(): Promise<boolean> {
    try {
      if (this.config.type === 'local') {
        // Clear localStorage files
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('trackfarmops_file_')) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Also clear server storage
        await api.post('/storage/clear');
      }

      console.log('🧹 Storage cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Clear storage failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing
export { StorageService };

// Utility functions
export const uploadFile = (file: File | ArrayBuffer, folder?: string, originalName?: string) => 
  storageService.uploadFile(file, folder, originalName);

export const getFile = (key: string) => storageService.getFile(key);

export const deleteFile = (key: string) => storageService.deleteFile(key);

export const getFileUrl = (key: string) => storageService.getFileUrl(key);

export const getStorageStats = () => storageService.getStorageStats();

export const clearStorage = () => storageService.clearStorage();
