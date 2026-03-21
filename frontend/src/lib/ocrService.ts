import axios from 'axios';

// Create a separate OCR client without the /api prefix
const OCR_BASE_URL = import.meta.env.VITE_API_URL ? 
  import.meta.env.VITE_API_URL.replace('/api', '') : 
  'http://localhost:3001';

const ocrApi = axios.create({
  baseURL: OCR_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to OCR requests
ocrApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('trackfarmops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
    // Use the OCR client with correct base URL
    const response = await ocrApi.post<OCRResponse>('/ocr/process-receipt', formData, {
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
