/**
 * Storage Configuration
 * Environment-based storage settings for development and production
 */

export interface StorageConfig {
  type: 'local' | 's3';
  uploadPath?: string;
  baseUrl?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string; // For S3-compatible services
  forcePathStyle?: boolean;
  maxFileSize?: number; // in bytes
  allowedMimeTypes?: string[];
}

export const storageConfigs: Record<string, StorageConfig> = {
  development: {
    type: 'local',
    uploadPath: './uploads',
    baseUrl: 'http://localhost:3001/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  test: {
    type: 'local',
    uploadPath: './test-uploads',
    baseUrl: 'http://localhost:3001/test-uploads',
    maxFileSize: 5 * 1024 * 1024, // 5MB for testing
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ]
  },
  production: {
    type: 's3',
    bucket: import.meta.env.VITE_AWS_S3_BUCKET || 'trackfarmops',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
    endpoint: import.meta.env.VITE_AWS_ENDPOINT, // Optional: for custom S3 endpoints
    forcePathStyle: import.meta.env.VITE_AWS_FORCE_PATH_STYLE === 'true',
    maxFileSize: 20 * 1024 * 1024, // 20MB for production
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  staging: {
    type: 's3',
    bucket: import.meta.env.VITE_AWS_S3_BUCKET || 'trackfarmops-staging',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
    endpoint: import.meta.env.VITE_AWS_ENDPOINT,
    forcePathStyle: import.meta.env.VITE_AWS_FORCE_PATH_STYLE === 'true',
    maxFileSize: 15 * 1024 * 1024, // 15MB for staging
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ]
  }
};

/**
 * Get current storage configuration based on environment
 */
export function getStorageConfig(): StorageConfig {
  const env = import.meta.env.MODE || 'development';
  
  // Check if S3 environment variables are available (production setup)
  const hasS3Config = import.meta.env.VITE_AWS_S3_BUCKET && 
                     import.meta.env.VITE_AWS_REGION && 
                     import.meta.env.VITE_AWS_ACCESS_KEY_ID && 
                     import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  
  // Use S3 if environment variables are available, otherwise fall back to environment-specific config
  let config: StorageConfig;
  if (hasS3Config) {
    config = storageConfigs.production;
    console.log(`🗄️ Storage Config: Using S3 storage (environment variables detected)`);
  } else {
    config = storageConfigs[env] || storageConfigs.development;
    console.log(`🗄️ Storage Config: Using ${config.type} storage for ${env} environment`);
  }
  
  return config;
}

/**
 * Validate storage configuration
 */
export function validateStorageConfig(config: StorageConfig): boolean {
  if (config.type === 's3') {
    if (!config.bucket || !config.region || !config.accessKeyId || !config.secretAccessKey) {
      console.error('❌ S3 configuration incomplete:', {
        bucket: !!config.bucket,
        region: !!config.region,
        accessKeyId: !!config.accessKeyId,
        secretAccessKey: !!config.secretAccessKey
      });
      return false;
    }
  } else if (config.type === 'local') {
    if (!config.uploadPath || !config.baseUrl) {
      console.error('❌ Local storage configuration incomplete:', {
        uploadPath: !!config.uploadPath,
        baseUrl: !!config.baseUrl
      });
      return false;
    }
  }
  
  return true;
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  };
  
  return mimeToExt[mimeType] || '.bin';
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string, mimeType: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(mimeType);
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  
  return `${nameWithoutExt}_${timestamp}_${random}${extension}`;
}

/**
 * Validate file against configuration
 */
export function validateFile(file: File, config: StorageConfig): { valid: boolean; error?: string } {
  // Check file size
  if (config.maxFileSize && file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(config.maxFileSize / 1024 / 1024).toFixed(2)}MB`
    };
  }
  
  // Check MIME type
  if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`
    };
  }
  
  return { valid: true };
}
