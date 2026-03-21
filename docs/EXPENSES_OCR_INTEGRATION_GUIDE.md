# Receipt OCR Integration Implementation Guide
## Track Farm Operations Project - Expenses Page Enhancement

## Overview

This guide provides a comprehensive implementation plan for integrating sophisticated receipt OCR (Optical Character Recognition) capabilities into the expenses page of the Track Farm Operations project. The implementation uses a dual-OCR approach with PaddleOCR as the primary engine and Tesseract.js as fallback, combined with bank-specific pattern recognition for optimal accuracy in Nigerian agricultural business contexts.

## Current Project Analysis

### Existing Technology Stack
- **Frontend**: React 19.2.0 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Authentication**: JWT-based auth system
- **Current Expenses**: Basic manual entry form in `ExpenseForm.tsx`

### Current Expense Flow
1. Manual entry through `ExpenseForm.tsx` component
2. Categories: Feed, Transport, Labor, Veterinary, Fuel, Equipment, Other
3. Basic validation and currency formatting
4. API endpoint: `/finance/expenses`

## Implementation Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   OCR Services  │
│                 │    │                 │    │                 │
│ • Enhanced      │◄──►│ • PaddleOCR API │◄──►│ • PaddleOCR     │
│   ExpenseForm   │    │ • Tesseract.js  │    │ • Tesseract.js  │
│ • Camera UI     │    │ • Error Handling│    │ • Image Processing│
│ • File Upload   │    │ • Performance   │    │ • Bank Pattern  │
│ • Results UI    │    │ • Validation    │    │   Recognition   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Phase 1: Backend OCR Infrastructure

### 1.1 Install Backend Dependencies

```bash
cd backend
npm install multer sharp tesseract.js node-cache
npm install -D @types/multer
```

### 1.2 Python OCR Environment Setup

```bash
# Create Python environment for OCR
python3 -m venv ocr-env
source ocr-env/bin/activate  # On Windows: ocr-env\Scripts\activate

# Install Python dependencies
pip install paddleocr>=2.7.0
pip install opencv-python>=4.8.0
pip install numpy>=1.24.0
pip install Pillow>=10.0.0
```

### 1.3 Create OCR Service Structure

```typescript
// backend/src/services/ocrService.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface OCRResult {
  success: boolean;
  text?: string;
  confidence?: number;
  processingTime?: number;
  source?: 'paddleocr' | 'tesseract';
  error?: string;
}

export interface ProcessedReceipt {
  merchant?: string;
  amount?: number;
  date?: string;
  items?: string[];
  category?: string;
  confidence?: number;
  notes?: string;
  ocrSource?: 'paddleocr' | 'tesseract';
  processingTime?: number;
  transactionDate?: {
    year: number;
    month: string | number;
    day: number;
    weekday?: string;
    time?: string;
  };
}

class OCRService {
  private uploadDir = path.join(__dirname, '../../uploads');
  private tempDir = path.join(__dirname, '../../temp');

  constructor() {
    this.ensureDirectories();
  }

  private async ensureDirectories() {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  // Configure multer for file uploads
  getUploadMiddleware() {
    const storage = multer.memoryStorage();
    return multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });
  }

  async processReceiptOCR(file: Buffer): Promise<OCRResult> {
    const startTime = Date.now();
    
    try {
      // Try PaddleOCR first
      const result = await this.processWithPaddleOCR(file);
      return {
        ...result,
        processingTime: Date.now() - startTime,
        source: 'paddleocr'
      };
    } catch (error) {
      console.warn('PaddleOCR failed, falling back to Tesseract.js:', error);
      try {
        const result = await this.processWithTesseract(file);
        return {
          ...result,
          processingTime: Date.now() - startTime,
          source: 'tesseract'
        };
      } catch (fallbackError) {
        throw new Error(`Both OCR engines failed: ${fallbackError.message}`);
      }
    }
  }

  private async processWithPaddleOCR(fileBuffer: Buffer): Promise<OCRResult> {
    const tempImagePath = path.join(this.tempDir, `temp_${Date.now()}.jpg`);
    
    try {
      // Save temporary file
      await fs.writeFile(tempImagePath, fileBuffer);
      
      // Process with PaddleOCR Python script
      const pythonScript = path.join(__dirname, '../ocr/paddleocr_processor.py');
      const { stdout } = await execAsync(`python3 "${pythonScript}" "${tempImagePath}"`, {
        timeout: 30000 // 30 second timeout
      });
      
      const result = JSON.parse(stdout);
      
      if (!result.success) {
        throw new Error(result.error || 'PaddleOCR processing failed');
      }
      
      return {
        success: true,
        text: result.text,
        confidence: result.confidence
      };
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tempImagePath);
      } catch (error) {
        console.warn('Failed to clean up temp file:', error);
      }
    }
  }

  private async processWithTesseract(fileBuffer: Buffer): Promise<OCRResult> {
    // Import Tesseract.js dynamically
    const { createWorker } = await import('tesseract.js');
    
    // Create worker
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`Tesseract progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    try {
      // Convert buffer to base64
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      
      // Recognize text
      const { data } = await worker.recognize(dataUrl);
      
      return {
        success: true,
        text: data.text,
        confidence: data.confidence
      };
    } finally {
      await worker.terminate();
    }
  }

  extractReceiptData(ocrText: string, confidence: number): ProcessedReceipt {
    // Detect bank/receipt type
    const bankType = this.detectBankType(ocrText);
    
    // Parse based on detected type
    switch (bankType) {
      case 'providus':
        return this.parseProvidusReceipt(ocrText, confidence);
      case 'opay':
        return this.parseOpayReceipt(ocrText, confidence);
      case 'gtbank':
        return this.parseGTBankReceipt(ocrText, confidence);
      default:
        return this.parseGenericReceipt(ocrText, confidence);
    }
  }

  private detectBankType(text: string): string {
    const t = text.toLowerCase();
    
    if (t.includes('providus')) return 'providus';
    if (t.includes('opay')) return 'opay';
    if (t.includes('gtbank') || t.includes('guaranty trust')) return 'gtbank';
    if (t.includes('access')) return 'access';
    if (t.includes('uba') || t.includes('united bank for africa')) return 'uba';
    if (t.includes('zenith')) return 'zenith';
    if (t.includes('firstbank')) return 'firstbank';
    if (t.includes('moniepoint')) return 'moniepoint';
    
    return 'generic';
  }

  private parseProvidusReceipt(text: string, confidence: number): ProcessedReceipt {
    const cleanText = text.replace(/[👤📤📝🏁🔍💰💾✅❌⚠️—]/g, '').replace(/\s+/g, ' ').trim();
    
    const patterns = {
      transactionDate: /Transaction\s*Date\s*:\s*([A-Za-z]+\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}:\d{2})/i,
      beneficiaryName: /Beneficiary\s*Name\s*:\s*([A-Z\s]+?)(?=\s+Beneficiary|\s+Amount|\s+Type|\n|$)/i,
      amount: /Amount\s*:\s*NGN\s*([\d,]+\.\d{2})/i,
      narration: /Narration\s*:\s*(.*)/i
    };

    const amountMatch = cleanText.match(patterns.amount);
    const beneficiaryMatch = cleanText.match(patterns.beneficiaryName);
    const dateMatch = cleanText.match(patterns.transactionDate);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    const merchant = beneficiaryMatch?.[1]?.trim() || 'Unknown Beneficiary';
    
    let transactionDate = undefined;
    if (dateMatch) {
      const date = new Date(dateMatch[1]);
      if (!isNaN(date.getTime())) {
        transactionDate = {
          year: date.getFullYear(),
          month: date.toLocaleDateString('en-US', { month: 'long' }),
          day: date.getDate(),
          weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
    }

    return {
      merchant,
      amount,
      date: transactionDate ? 
        `${transactionDate.year}-${String(transactionDate.month).padStart(2, '0')}-${String(transactionDate.day).padStart(2, '0')}` : 
        new Date().toISOString().split('T')[0],
      items: cleanText.includes('agric') || cleanText.includes('feed') || cleanText.includes('seed') ? 
        ['Agricultural supplies'] : ['Bank transfer'],
      category: this.inferCategory(merchant, cleanText),
      confidence: Math.round(confidence),
      notes: cleanText.substring(0, 200),
      ocrSource: 'paddleocr',
      transactionDate
    };
  }

  private parseOpayReceipt(text: string, confidence: number): ProcessedReceipt {
    const cleanText = text.replace(/[👤📤📝🏁🔍💰💾✅❌⚠️—]/g, '').replace(/\s+/g, ' ').trim();
    
    const patterns = {
      paymentTo: /Payment\s*To\s*:\s*([A-Za-z\s]+)/i,
      merchantName: /Merchant\s*:\s*([A-Za-z\s]+)/i,
      amount: /Amount\s*:\s*₦\s*([\d,]+\.\d{2})/i,
      amountAlt: /~([\d,]+\.\d{2})/i,
      date: /Date\s*:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      reference: /Reference\s*:\s*([A-Z0-9]+)/i
    };

    const amountMatch = cleanText.match(patterns.amount);
    const amountAltMatch = cleanText.match(patterns.amountAlt);
    const paymentToMatch = cleanText.match(patterns.paymentTo);
    const merchantMatch = cleanText.match(patterns.merchantName);
    const dateMatch = cleanText.match(patterns.date);

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 
                   amountAltMatch ? parseFloat(amountAltMatch[1].replace(/,/g, '')) : 0;
    
    const merchant = paymentToMatch?.[1]?.trim() || 
                    merchantMatch?.[1]?.trim() || 
                    'Unknown Merchant';

    let date = new Date().toISOString().split('T')[0];
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }

    return {
      merchant,
      amount,
      date,
      items: this.extractItems(cleanText),
      category: this.inferCategory(merchant, cleanText),
      confidence: Math.round(confidence),
      notes: cleanText.substring(0, 200),
      ocrSource: 'paddleocr'
    };
  }

  private parseGTBankReceipt(text: string, confidence: number): ProcessedReceipt {
    // Similar implementation for GTBank receipts
    return this.parseGenericReceipt(text, confidence);
  }

  private parseGenericReceipt(text: string, confidence: number): ProcessedReceipt {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Generic patterns
    const amountPattern = /(?:₦|NGN|Naira)\s*([\d,]+\.\d{2})/i;
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
    const merchantPattern = /^(.+)$/m; // First line as merchant
    
    const amountMatch = cleanText.match(amountPattern);
    const dateMatch = cleanText.match(datePattern);
    const lines = cleanText.split('\n');
    const merchant = lines[0]?.trim() || 'Unknown Merchant';
    
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    let date = new Date().toISOString().split('T')[0];
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }

    return {
      merchant,
      amount,
      date,
      items: this.extractItems(cleanText),
      category: this.inferCategory(merchant, cleanText),
      confidence: Math.round(confidence),
      notes: cleanText.substring(0, 200),
      ocrSource: 'tesseract'
    };
  }

  private extractItems(text: string): string[] {
    const items: string[] = [];
    const lines = text.split('\n');
    
    // Look for common agricultural patterns
    const agriculturalKeywords = ['feed', 'seed', 'fertilizer', 'pesticide', 'equipment', 'tools', 'vet', 'medicine'];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (agriculturalKeywords.some(keyword => lowerLine.includes(keyword))) {
        items.push(line.trim());
      }
    });
    
    return items.length > 0 ? items : ['General expense'];
  }

  private inferCategory(merchant: string, text: string): string {
    const lowerMerchant = merchant.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // Agricultural category inference
    if (lowerMerchant.includes('feed') || lowerText.includes('feed')) return 'Feed';
    if (lowerMerchant.includes('vet') || lowerText.includes('vet') || lowerText.includes('medicine')) return 'Veterinary';
    if (lowerMerchant.includes('fuel') || lowerText.includes('fuel') || lowerText.includes('petrol')) return 'Fuel';
    if (lowerMerchant.includes('transport') || lowerText.includes('transport')) return 'Transport';
    if (lowerMerchant.includes('equipment') || lowerText.includes('equipment') || lowerText.includes('tools')) return 'Equipment';
    if (lowerMerchant.includes('labor') || lowerText.includes('salary') || lowerText.includes('wages')) return 'Labor';
    
    return 'Other';
  }
}

export default new OCRService();
```

### 1.4 Create PaddleOCR Python Processor

```python
# backend/src/ocr/paddleocr_processor.py
import sys
import json
import os
from paddleocr import PaddleOCR
import cv2
import numpy as np

class PaddleOCRProcessor:
    def __init__(self):
        # Initialize PaddleOCR with English language
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en')
    
    def process_image(self, image_path):
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image file")
            
            # Preprocess image for better OCR accuracy
            img = self.preprocess_image(img)
            
            # Perform OCR
            results = self.ocr.ocr(img, cls=True)
            
            if not results or not results[0]:
                return {
                    "success": False,
                    "text": "",
                    "confidence": 0
                }
            
            # Extract text and calculate confidence
            text_lines = []
            confidences = []
            
            for line in results[0]:
                if line:
                    bbox, (text, confidence) = line
                    text_lines.append(text)
                    confidences.append(confidence)
            
            full_text = '\n'.join(text_lines)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                "success": True,
                "text": full_text,
                "confidence": avg_confidence * 100  # Convert to percentage
            }
            
        except Exception as e:
            return {
                "success": False,
                "text": "",
                "confidence": 0,
                "error": str(e)
            }
    
    def preprocess_image(self, img):
        """Preprocess image for better OCR results"""
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, h=10, templateWindowSize=7, searchWindowSize=21)
        
        return denoised

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python paddleocr_processor.py <image_path>"
        }))
        return
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(json.dumps({
            "success": False,
            "error": f"Image file not found: {image_path}"
        }))
        return
    
    processor = PaddleOCRProcessor()
    result = processor.process_image(image_path)
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
```

### 1.5 Create OCR API Routes

```typescript
// backend/src/routes/ocrRoutes.ts
import { Router } from 'express';
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

// OCR processing endpoint
router.post('/process-receipt', ocrRateLimit, ocrService.getUploadMiddleware().single('receipt'), async (req, res) => {
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
      error: error.message || 'Failed to process receipt'
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
```

### 1.6 Update Backend Server

```typescript
// backend/src/index.ts (add to existing file)
import ocrRoutes from './routes/ocrRoutes';

// Add OCR routes
app.use('/api/ocr', ocrRoutes);
```

## Phase 2: Frontend Enhancement

### 2.1 Install Frontend Dependencies

```bash
npm install tesseract.js react-hook-form @hookform/resolvers zod date-fns
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast
```

### 2.2 Create OCR Service Client

```typescript
// src/lib/ocrService.ts
import api from './api';

export interface OCRResponse {
  success: boolean;
  data?: {
    merchant?: string;
    amount?: number;
    date?: string;
    items?: string[];
    category?: string;
    confidence?: number;
    notes?: string;
    ocrSource?: 'paddleocr' | 'tesseract';
    processingTime?: number;
    rawText?: string;
  };
  error?: string;
}

export async function processReceiptImage(file: File): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append('receipt', file);

  try {
    const response = await api.post<OCRResponse>('/api/ocr/process-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 45000, // 45 second timeout
    });

    return response.data;
  } catch (error: any) {
    console.error('OCR API Error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to process receipt'
    };
  }
}
```

### 2.3 Create Enhanced Expense Form Component

```typescript
// src/components/EnhancedExpenseForm.tsx
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { processReceiptImage } from '../lib/ocrService';
import type { ExpenseEntry } from '../types';
import { formatCurrency, parseCurrency, validateCurrencyInput } from '../utils/currency';
import { Camera, Upload, Scan, CheckCircle, AlertCircle, X } from 'lucide-react';

interface OCRResult {
  merchant?: string;
  amount?: number;
  date?: string;
  items?: string[];
  category?: string;
  confidence?: number;
  notes?: string;
  ocrSource?: 'paddleocr' | 'tesseract';
  processingTime?: number;
  rawText?: string;
}

const expenseCategories = [
  "Feed", "Transport", "Labor", "Veterinary", "Fuel", "Equipment", "Other"
];

const EnhancedExpenseForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    merchant: ''
  });
  const [displayAmount, setDisplayAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [showOCRResults, setShowOCRResults] = useState(false);
  
  const { user } = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const processReceiptFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsScanning(true);
    setError('');
    
    try {
      console.log(`📸 Processing receipt: ${file.name}`);
      
      const result = await processReceiptImage(file);
      
      if (result.success && result.data) {
        console.log(`✅ OCR Success: ${result.data.ocrSource}, Confidence: ${result.data.confidence}%`);
        
        setOcrResult(result.data);
        setShowOCRResults(true);
        
        // Auto-fill form with OCR data
        setFormData({
          amount: result.data.amount?.toString() || '',
          category: result.data.category || 'Other',
          note: result.data.items?.join(', ') || result.data.notes || '',
          date: result.data.date || new Date().toISOString().split('T')[0],
          merchant: result.data.merchant || ''
        });
        
        // Update display amount
        if (result.data.amount) {
          setDisplayAmount(formatCurrency(result.data.amount.toString()));
        }
        
        setSuccess(`Receipt processed successfully with ${result.data.confidence}% confidence`);
      } else {
        throw new Error(result.error || 'OCR processing failed');
      }
    } catch (err: any) {
      console.error('❌ OCR Error:', err);
      setError(err.message || 'Failed to process receipt. Please try manual entry.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const numericAmount = parseCurrency(displayAmount);
      
      const expenseData = {
        ...formData,
        amount: numericAmount.toString(),
        merchant: formData.merchant || 'Manual Entry',
        hasReceipt: !!ocrResult,
        ocrConfidence: ocrResult?.confidence,
        ocrSource: ocrResult?.ocrSource
      };
      
      await api.post<ExpenseEntry>('/finance/expenses', expenseData);
      
      setSuccess('Expense entry recorded successfully!');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record expense');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
      merchant: ''
    });
    setDisplayAmount('');
    setOcrResult(null);
    setShowOCRResults(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (!validateCurrencyInput(inputValue.replace(/[^\d.]/g, ''))) {
      return;
    }
    
    const formatted = formatCurrency(inputValue.replace(/[^\d.]/g, ''));
    setDisplayAmount(formatted);
    
    const numericValue = parseCurrency(inputValue.replace(/[^\d.]/g, ''));
    setFormData({
      ...formData,
      amount: numericValue.toString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return <div>Please log in to access this feature.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Record Farm Expense
          </h2>

          {/* OCR Section */}
          {!ocrResult && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Quick Receipt Scan
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
                Take a photo or upload a receipt to automatically extract expense details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleCameraCapture}
                  disabled={isScanning}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  {isScanning ? 'Processing...' : 'Take Photo'}
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={isScanning}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  {isScanning ? 'Processing...' : 'Upload Image'}
                </button>
              </div>
              
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                ref={cameraInputRef}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
          )}

          {/* OCR Results */}
          {showOCRResults && ocrResult && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Receipt Scanned Successfully
                </h3>
                <button
                  onClick={() => setShowOCRResults(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Merchant:</span>
                  <p className="text-green-900 dark:text-green-100">{ocrResult.merchant || 'Not detected'}</p>
                </div>
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Amount:</span>
                  <p className="text-green-900 dark:text-green-100 font-mono">
                    ₦{ocrResult.amount?.toLocaleString() || '0.00'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Confidence:</span>
                  <p className="text-green-900 dark:text-green-100">{ocrResult.confidence}%</p>
                </div>
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Source:</span>
                  <p className="text-green-900 dark:text-green-100 capitalize">{ocrResult.ocrSource}</p>
                </div>
              </div>
              
              {ocrResult.items && ocrResult.items.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-green-700 dark:text-green-300 block mb-1">Detected Items:</span>
                  <ul className="list-disc list-inside text-green-900 dark:text-green-100 text-sm">
                    {ocrResult.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                <p className="text-xs text-green-600 dark:text-green-400">
                  Please review and edit the extracted information below before saving
                </p>
              </div>
            </div>
          )}

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Merchant Field */}
            <div>
              <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Merchant/Supplier
              </label>
              <input
                type="text"
                id="merchant"
                name="merchant"
                className="form-input"
                placeholder="e.g., Feed Store, Veterinary Clinic"
                value={formData.merchant}
                onChange={handleChange}
              />
            </div>

            {/* Amount Field */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (₦) *
              </label>
              <input
                type="text"
                id="amount"
                name="amount"
                required
                className="form-input"
                placeholder="0.00"
                value={displayAmount}
                onChange={handleAmountChange}
              />
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                className="form-input"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Field */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="form-input"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes / Items Purchased
              </label>
              <textarea
                id="note"
                name="note"
                rows={3}
                className="form-input"
                placeholder="List items purchased or add additional notes..."
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              {ocrResult && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Scan Another Receipt
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Recording...' : 'Record Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExpenseForm;
```

### 2.4 Update Dashboard to Use Enhanced Form

```typescript
// src/components/Dashboard.tsx (modify existing import and usage)
import EnhancedExpenseForm from './EnhancedExpenseForm';

// Replace the existing ExpenseForm with EnhancedExpenseForm in your dashboard component
```

## Phase 3: Database Schema Updates

### 3.1 Update Prisma Schema

```prisma
// prisma/schema.prisma (add to existing Expense model)
model Expense {
  id          String   @id @default(cuid())
  amount      Float
  category    String
  note        String?
  date        DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  // OCR-related fields
  merchant    String?  @default("Manual Entry")
  hasReceipt  Boolean  @default(false)
  ocrConfidence Int?   // OCR confidence percentage
  ocrSource   String?  // 'paddleocr' or 'tesseract'
  rawText     String?  // Raw OCR text for debugging
  
  @@map("expenses")
}
```

### 3.2 Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add-ocr-fields
```

## Phase 4: Testing & Validation

### 4.1 Unit Tests for OCR Service

```typescript
// src/__tests__/ocrService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { processReceiptImage } from '../lib/ocrService';

describe('OCR Service', () => {
  it('should process receipt image successfully', async () => {
    // Mock API call
    vi.mock('../lib/api', () => ({
      default: {
        post: vi.fn().mockResolvedValue({
          data: {
            success: true,
            data: {
              merchant: 'Test Store',
              amount: 5000,
              date: '2024-01-15',
              category: 'Feed',
              confidence: 95,
              ocrSource: 'paddleocr'
            }
          }
        })
      }
    }));

    const mockFile = new File(['test'], 'receipt.jpg', { type: 'image/jpeg' });
    const result = await processReceiptImage(mockFile);

    expect(result.success).toBe(true);
    expect(result.data?.merchant).toBe('Test Store');
    expect(result.data?.amount).toBe(5000);
  });

  it('should handle OCR processing errors', async () => {
    vi.mock('../lib/api', () => ({
      default: {
        post: vi.fn().mockRejectedValue(new Error('OCR failed'))
      }
    }));

    const mockFile = new File(['test'], 'receipt.jpg', { type: 'image/jpeg' });
    const result = await processReceiptImage(mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 4.2 Integration Tests

```typescript
// backend/src/__tests__/ocrIntegration.test.ts
import request from 'supertest';
import path from 'path';
import app from '../index';

describe('OCR Integration', () => {
  it('should process receipt upload', async () => {
    const testImagePath = path.join(__dirname, 'fixtures/test-receipt.jpg');
    
    const response = await request(app)
      .post('/api/ocr/process-receipt')
      .attach('receipt', testImagePath)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.merchant).toBeDefined();
    expect(response.body.data.amount).toBeDefined();
  });

  it('should reject non-image files', async () => {
    const response = await request(app)
      .post('/api/ocr/process-receipt')
      .attach('receipt', path.join(__dirname, 'fixtures/test.txt'))
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

## Phase 5: Performance Optimization

### 5.1 Image Preprocessing

```typescript
// backend/src/services/imagePreprocessor.ts
import sharp from 'sharp';

export class ImagePreprocessor {
  static async preprocessForOCR(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .sharpen({ sigma: 1, flat: 1, jagged: 2 })
      .normalize()
      .threshold(128)
      .jpeg({ quality: 90 })
      .toBuffer();
  }
}
```

### 5.2 Caching Implementation

```typescript
// backend/src/services/ocrCache.ts
import NodeCache from 'node-cache';

class OCRCache {
  private cache = new NodeCache({ 
    stdTTL: 3600, // 1 hour
    checkperiod: 600 // 10 minutes
  });

  generateKey(buffer: Buffer): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  async get(buffer: Buffer) {
    const key = this.generateKey(buffer);
    return this.cache.get(key);
  }

  async set(buffer: Buffer, result: any) {
    const key = this.generateKey(buffer);
    return this.cache.set(key, result);
  }
}

export default new OCRCache();
```

## Phase 6: Deployment Considerations

### 6.1 Environment Variables

```bash
# .env (backend)
OCR_ENABLED=true
OCR_TIMEOUT=45000
OCR_MAX_FILE_SIZE=10485760
OCR_RATE_LIMIT=50
PADDLEOCR_MODEL_PATH=./models
TEMP_DIR=./temp
UPLOAD_DIR=./uploads
```

### 6.2 Docker Configuration

```dockerfile
# backend/Dockerfile (add OCR dependencies)
FROM node:18-alpine

# Install Python and OCR dependencies
RUN apk add --no-cache python3 py3-pip
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Install Node.js dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p temp uploads models

EXPOSE 3001

CMD ["npm", "start"]
```

### 6.3 Production Monitoring

```typescript
// backend/src/middleware/ocrMonitoring.ts
export const ocrMetrics = {
  totalProcessed: 0,
  successful: 0,
  failed: 0,
  avgProcessingTime: 0,
  paddleOCRUsage: 0,
  tesseractUsage: 0
};

export function recordOCRProcessing(success: boolean, processingTime: number, source: string) {
  ocrMetrics.totalProcessed++;
  
  if (success) {
    ocrMetrics.successful++;
  } else {
    ocrMetrics.failed++;
  }
  
  // Update average processing time
  ocrMetrics.avgProcessingTime = 
    (ocrMetrics.avgProcessingTime * (ocrMetrics.totalProcessed - 1) + processingTime) / 
    ocrMetrics.totalProcessed;
  
  // Track source usage
  if (source === 'paddleocr') {
    ocrMetrics.paddleOCRUsage++;
  } else {
    ocrMetrics.tesseractUsage++;
  }
}
```

## Phase 7: User Experience Enhancements

### 7.1 Progressive Loading

```typescript
// src/hooks/useOCRProgress.ts
import { useState, useCallback } from 'react';

export function useOCRProgress() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');

  const updateProgress = useCallback((currentStage: string, currentProgress: number) => {
    setStage(currentStage);
    setProgress(currentProgress);
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setStage('');
  }, []);

  return { progress, stage, updateProgress, reset };
}
```

### 7.2 Error Recovery

```typescript
// src/components/OCRErrorHandler.tsx
interface OCRErrorHandlerProps {
  error: string;
  onRetry: () => void;
  onManualEntry: () => void;
}

export const OCRErrorHandler = ({ error, onRetry, onManualEntry }: OCRErrorHandlerProps) => {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-red-900 dark:text-red-100">Receipt Processing Failed</h4>
          <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onManualEntry}
              className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
            >
              Enter Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Phase 8: Security & Compliance

### 8.1 File Validation

```typescript
// backend/src/middleware/fileValidation.ts
export function validateImageFile(file: Express.Multer.File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  // Additional validation can be added here
  return true;
}
```

### 8.2 Data Privacy

```typescript
// backend/src/services/ocrPrivacy.ts
export class OCRPrivacyService {
  static sanitizeText(text: string): string {
    // Remove or mask sensitive information
    return text
      .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '****-****-****-****') // Credit cards
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****') // SSN
      .replace(/\b\d{10}\b/g, '**********'); // Phone numbers
  }

  static autoDeleteTempFiles(olderThanHours: number = 1) {
    // Implement cleanup logic for temporary files
  }
}
```

## Implementation Timeline

### Week 1-2: Backend Infrastructure
- Set up Python OCR environment
- Implement OCR service and API routes
- Create database schema updates
- Basic testing

### Week 3: Frontend Integration
- Create enhanced expense form component
- Implement OCR client service
- Add UI components for receipt scanning
- Integration testing

### Week 4: Polish & Optimization
- Performance optimization
- Error handling improvements
- User experience enhancements
- Security implementation

### Week 5: Testing & Deployment
- Comprehensive testing
- Documentation
- Production deployment
- Monitoring setup

## Success Metrics

1. **OCR Accuracy**: Target 85%+ accuracy for common Nigerian bank receipts
2. **Processing Time**: Under 10 seconds for most receipts
3. **User Adoption**: 60%+ of expense entries using OCR within 3 months
4. **Error Rate**: Less than 5% failed processing attempts
5. **User Satisfaction**: 4+ star rating from user feedback

## Maintenance & Support

1. **Regular Model Updates**: Update OCR models quarterly for improved accuracy
2. **Bank Format Monitoring**: Track changes in bank receipt formats
3. **Performance Monitoring**: Monitor processing times and success rates
4. **User Feedback Loop**: Collect and implement user suggestions
5. **Security Updates**: Regular security patches and compliance checks

This comprehensive implementation plan provides a robust foundation for integrating receipt OCR capabilities into the Track Farm Operations project, specifically tailored for Nigerian agricultural business needs while maintaining high accuracy and user-friendly experience.
