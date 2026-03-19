/**
 * Storage Routes
 * API endpoints for file storage operations
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { storageService } from '../services/storageService';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Log all storage requests
router.use((req, res, next) => {
  console.log(`📡 Storage request: ${req.method} ${req.path}`);
  next();
});

/**
 * Upload file (general endpoint)
 * POST /api/storage/upload
 */
router.post('/upload', authenticate, storageService.getUploadMiddleware().single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const { key } = req.body;
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required'
      });
    }

    console.log(`📤 User ${req.user!.name} uploading file: ${req.file.originalname}`);

    const result = await storageService.uploadFile(req.file, key);

    res.json({
      success: true,
      ...result,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    });
  }
});

/**
 * Upload file to local storage
 * POST /api/storage/upload-local
 */
router.post('/upload-local', storageService.getUploadMiddleware().single('file'), async (req, res) => {
  console.log('📤 Received upload-local request');
  console.log('📁 Request body:', req.body);
  console.log('📄 File info:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  } : 'No file received');
  
  try {
    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const { key } = req.body;
    if (!key) {
      console.log('❌ No key provided in request');
      return res.status(400).json({
        success: false,
        error: 'File key is required'
      });
    }

    console.log(`📤 Local upload: ${req.file.originalname} -> ${key}`);

    const result = await storageService.uploadFile(req.file, key);

    console.log('✅ Upload result:', result);

    res.json({
      success: true,
      ...result,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Local upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Local upload failed'
    });
  }
});

/**
 * Get file
 * GET /api/storage/file/:key
 */
router.get('/file/:key', async (req, res) => {
  try {
    const key = req.params.key as string;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required'
      });
    }

    console.log(`📥 Getting file: ${key}`);

    const fileBuffer = await storageService.getFile(key);
    
    if (!fileBuffer) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Set appropriate content type
    const ext = key.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.send(fileBuffer);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file'
    });
  }
});

/**
 * Delete file
 * DELETE /api/storage/file/:key
 */
router.delete('/file/:key', authenticate, async (req: AuthRequest, res) => {
  try {
    const key = req.params.key as string;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required'
      });
    }

    console.log(`🗑️ User ${req.user!.name} deleting file: ${key}`);

    const success = await storageService.deleteFile(key);
    
    if (success) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete file'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file'
    });
  }
});

/**
 * Get file URL
 * GET /api/storage/url/:key
 */
router.get('/url/:key', authenticate, async (req: AuthRequest, res) => {
  try {
    const key = req.params.key as string;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required'
      });
    }

    const url = storageService.getFileUrl(key);
    
    res.json({
      success: true,
      url,
      key
    });
  } catch (error) {
    console.error('Get URL error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file URL'
    });
  }
});

/**
 * Get storage statistics
 * GET /api/storage/stats
 */
router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  try {
    console.log(`📊 User ${req.user!.name} getting storage stats`);

    const stats = await storageService.getStorageStats();
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get storage stats'
    });
  }
});

/**
 * Clear storage (development only)
 * POST /api/storage/clear
 */
router.post('/clear', authenticate, async (req: AuthRequest, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Storage clear not allowed in production'
      });
    }

    console.log(`🧹 User ${req.user!.name} clearing storage`);

    const success = await storageService.clearStorage();
    
    if (success) {
      res.json({
        success: true,
        message: 'Storage cleared successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to clear storage'
      });
    }
  } catch (error) {
    console.error('Clear storage error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear storage'
    });
  }
});

export default router;
