import { Router, Request } from 'express';
import ocrService from '../services/ocrService';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for OCR endpoints
const ocrRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 OCR requests per window
  message: {
    success: false,
    error: 'Too many OCR requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Extend Request type to include file property
interface AuthenticatedRequest extends Request {
  file?: Express.Multer.File;
}

// OCR processing endpoint
router.post('/process-receipt', ocrRateLimit, ocrService.getUploadMiddleware().single('receipt'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No receipt image provided'
      });
    }

    console.log(`📸 Processing receipt: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // Process with OCR
    const ocrResult = await ocrService.processReceiptOCR(req.file.buffer);
    
    if (!ocrResult.success) {
      throw new Error(ocrResult.error || 'OCR processing failed');
    }

    // Extract structured data
    const processedReceipt = ocrService.extractReceiptData(
      ocrResult.text!, 
      ocrResult.confidence!
    );

    console.log(`✅ OCR completed: Source=${ocrResult.source}, Confidence=${ocrResult.confidence}%`);

    res.json({
      success: true,
      data: {
        ...processedReceipt,
        ocrSource: ocrResult.source,
        processingTime: ocrResult.processingTime,
        rawText: ocrResult.text
      }
    });

  } catch (error) {
    console.error('❌ OCR processing error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Failed to process receipt'
    });
  }
});

// Health check for OCR service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OCR service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
