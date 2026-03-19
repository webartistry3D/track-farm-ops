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
          cb(new Error('Only image files are allowed') as any, false);
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
        throw new Error(`Both OCR engines failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
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
    let parsedDate = null;
    if (dateMatch) {
      parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = {
          year: parsedDate.getFullYear(),
          month: parsedDate.toLocaleDateString('en-US', { month: 'long' }),
          day: parsedDate.getDate(),
          weekday: parsedDate.toLocaleDateString('en-US', { weekday: 'long' }),
          time: parsedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
    }

    return {
      merchant,
      amount,
      date: transactionDate ? 
        `${transactionDate.year}-${String(parsedDate!.getMonth() + 1).padStart(2, '0')}-${String(transactionDate.day).padStart(2, '0')}` : 
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
    
    console.log('🔍 OPay OCR Debug - Raw text:', JSON.stringify(text, null, 2));
    console.log('🧹 OPay OCR Debug - Clean text:', JSON.stringify(cleanText, null, 2));
    
    const patterns = {
      paymentTo: /Payment\s*To\s*:\s*([A-Za-z\s]+)/i,
      merchantName: /Merchant\s*:\s*([A-Za-z\s]+)/i,
      recipient: /Recipient\s*:\s*([A-Za-z\s]+)/i,
      recipientAlt: /Recipient\s*Details\s+([A-Z\s]+?)(?=\s+OPay)/i,
      recipientAlt2: /Recipient\s*details\s+([A-Z\s]+?)(?=\s+OPay)/i,
      amount: /Amount\s*:\s*₦\s*([\d,]+\.\d{2})/i,
      amountAlt: /~([\d,]+\.\d{2})/i,
      amountAlt2: /₦\s*([\d,]+\.\d{2})/i,
      date: /Date\s*:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      dateAlt: /(\w+\s+\d{1,2}[a-z]*[;,]\s+\d{4})/i, // Alternative for "Dec 20th, 2025" or "Dec 20th; 2025"
      time: /Time\s*:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
      timeAlt: /(\d{1,2}:\d{2}:\d{2})/i, // Alternative for "11:39:50"
      reference: /Reference\s*:\s*([A-Z0-9]+)/i
    };

    console.log('🎯 Testing patterns against clean text...');
    
    const amountMatch = cleanText.match(patterns.amount);
    const amountAltMatch = cleanText.match(patterns.amountAlt);
    const amountAlt2Match = cleanText.match(patterns.amountAlt2);
    const paymentToMatch = cleanText.match(patterns.paymentTo);
    const merchantMatch = cleanText.match(patterns.merchantName);
    const recipientMatch = cleanText.match(patterns.recipient);
    const recipientAltMatch = cleanText.match(patterns.recipientAlt);
    const recipientAlt2Match = cleanText.match(patterns.recipientAlt2);
    const dateMatch = cleanText.match(patterns.date);
    const dateAltMatch = cleanText.match(patterns.dateAlt);
    const timeMatch = cleanText.match(patterns.time);
    const timeAltMatch = cleanText.match(patterns.timeAlt);

    console.log('💰 Amount matches:', {
      amount: amountMatch?.[1],
      amountAlt: amountAltMatch?.[1],
      amountAlt2: amountAlt2Match?.[1]
    });
    
    console.log('🏪 Merchant matches:', {
      paymentTo: paymentToMatch?.[1],
      merchantName: merchantMatch?.[1],
      recipient: recipientMatch?.[1],
      recipientAlt: recipientAltMatch?.[1],
      recipientAlt2: recipientAlt2Match?.[1]
    });
    
    console.log('📅 Date matches:', {
      date: dateMatch?.[1],
      dateAlt: dateAltMatch?.[1]
    });
    
    console.log('⏰ Time matches:', {
      time: timeMatch?.[1],
      timeAlt: timeAltMatch?.[1]
    });

    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 
                   amountAltMatch ? parseFloat(amountAltMatch[1].replace(/,/g, '')) :
                   amountAlt2Match ? parseFloat(amountAlt2Match[1].replace(/,/g, '')) : 0;
    
    const merchant = paymentToMatch?.[1]?.trim() || 
                    merchantMatch?.[1]?.trim() ||
                    recipientMatch?.[1]?.trim() ||
                    recipientAltMatch?.[1]?.trim() ||
                    recipientAlt2Match?.[1]?.trim() ||
                    'Unknown Merchant';

    console.log('✅ Final extracted values:', {
      merchant,
      amount,
      confidence
    });

    let date = new Date().toISOString().split('T')[0];
    
    // Try primary date pattern
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }
    // Try alternative date pattern like "Dec 20th, 2025" or "Dec 20th; 2025"
    else if (dateAltMatch) {
      // Clean the date string by removing ordinal suffixes
      let cleanDateStr = dateAltMatch[1].replace(/(\d+)(?:st|nd|rd|th)/i, '$1');
      console.log('🧹 Cleaned date string:', cleanDateStr);
      
      // Parse the date and set time to noon to avoid timezone issues
      const parsedDate = new Date(cleanDateStr + ' 12:00:00');
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
        console.log('📅 Final parsed date:', date);
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
