# Storage Service Implementation

## 🎯 Overview

A comprehensive storage service with environment-based configuration supporting both local development (localStorage) and AWS S3 production for receipt and invoice document storage.

## 📁 File Structure

```
src/
├── config/
│   └── storage.ts              # Storage configuration and utilities
├── services/
│   └── storageService.ts        # Frontend storage service
└── components/
    └── EnhancedIncomePage.tsx   # Invoice creation with receipt upload

backend/
├── src/
│   ├── services/
│   │   └── storageService.ts    # Backend storage service
│   └── routes/
│       └── storageRoutes.ts      # Storage API endpoints
└── uploads/                     # Local file storage (development)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Development (Local Storage)
NODE_ENV=development

# Production (AWS S3)
NODE_ENV=production
VITE_AWS_S3_BUCKET=trackfarmops-documents
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Storage Modes

#### Development Mode (`NODE_ENV=development`)
- **Local File Storage**: Files stored in `backend/uploads/`
- **localStorage**: Small files (<1MB) stored in browser localStorage
- **API Fallback**: Larger files uploaded to local server storage
- **Base URL**: `http://localhost:3001/uploads`

#### Production Mode (`NODE_ENV=production`)
- **AWS S3 Storage**: Files uploaded to Amazon S3
- **Cloud URLs**: `https://bucket.s3.region.amazonaws.com/key`
- **Scalable**: Handles large file volumes
- **CDN Ready**: Can integrate with CloudFront

## 🚀 API Endpoints

### Upload Files

```bash
# Authenticated upload (S3/Local)
POST /api/storage/upload
Content-Type: multipart/form-data
Body: file (File), key (string)

# Local upload (no auth required)
POST /api/storage/upload-local
Content-Type: multipart/form-data
Body: file (File), key (string)
```

### File Management

```bash
# Get file
GET /api/storage/file/:key

# Get file URL
GET /api/storage/url/:key

# Delete file
DELETE /api/storage/file/:key

# Storage statistics
GET /api/storage/stats

# Clear storage (dev only)
POST /api/storage/clear
```

## 💻 Frontend Usage

### Basic Upload

```typescript
import { storageService } from '../services/storageService';

// Upload file
const result = await storageService.uploadFile(
  file,                    // File object
  'invoices/receipt-123',  // Folder/key
  'receipt.jpg'           // Original filename
);

if (result.success) {
  console.log('File uploaded:', result.url);
  console.log('File key:', result.key);
}
```

### Invoice with Receipt

```typescript
// In invoice creation
const handleGenerateInvoice = async () => {
  // Upload receipt first
  let receiptUrl = null;
  if (receiptFile) {
    const uploadResult = await storageService.uploadFile(
      receiptFile,
      `invoices/invoice-${invoiceNumber}`,
      receiptFile.name
    );
    
    if (uploadResult.success) {
      receiptUrl = uploadResult.url;
    }
  }

  // Create invoice with receipt URL
  const invoice = {
    ...invoiceData,
    receiptUrl  // Link receipt to invoice
  };

  const response = await api.post('/invoices', invoice);
};
```

### File Retrieval

```typescript
// Get file
const fileData = await storageService.getFile('invoices/receipt-123');

// Get URL
const url = storageService.getFileUrl('invoices/receipt-123');

// Delete file
const deleted = await storageService.deleteFile('invoices/receipt-123');
```

## 🗄️ Backend Integration

### Invoice Controller Update

```typescript
// Add receiptUrl to invoice schema
const invoice = await prisma.invoice.create({
  data: {
    ...invoiceData,
    receiptUrl: req.body.receiptUrl || null,  // New field
    userId: req.user!.id
  }
});
```

### Database Schema

Add to your invoice table:

```sql
ALTER TABLE invoices 
ADD COLUMN receipt_url TEXT,
ADD COLUMN receipt_uploaded_at TIMESTAMP;
```

## 🔒 Security Features

### File Validation
- **MIME Type Checking**: Only allowed file types
- **Size Limits**: Configurable max file sizes
- **File Signatures**: Verify actual file content
- **Path Traversal**: Prevent directory access attacks

### Authentication
- **Protected Endpoints**: Upload/delete require auth
- **User Isolation**: Files organized by user folders
- **Access Control**: Role-based file access

### Error Handling
- **Graceful Fallbacks**: Continue without receipt if upload fails
- **Detailed Logging**: Track upload success/failure
- **User Feedback**: Clear error messages

## 📊 Storage Statistics

```typescript
const stats = await storageService.getStorageStats();
console.log(stats);
// {
//   totalFiles: 25,
//   totalSize: 15728640,  // bytes
//   storageType: 'local' | 's3'
// }
```

## 🧹 Development Tools

### Clear Storage (Development Only)

```typescript
// Clear all stored files
await storageService.clearStorage();
```

### Environment Detection

```typescript
import { getStorageConfig } from '../config/storage';

const config = getStorageConfig();
console.log(`Using ${config.type} storage`);
```

## 🔄 Migration Guide

### From Local to S3

1. **Set Environment Variables**:
   ```bash
   NODE_ENV=production
   VITE_AWS_S3_BUCKET=your-bucket
   VITE_AWS_REGION=your-region
   VITE_AWS_ACCESS_KEY_ID=your-key
   VITE_AWS_SECRET_ACCESS_KEY=your-secret
   ```

2. **Update Configuration**:
   - No code changes needed
   - Automatic environment detection

3. **Test Upload**:
   ```typescript
   const result = await storageService.uploadFile(file, 'test/file');
   // Should upload to S3 instead of local storage
   ```

### Data Migration

```bash
# Export local files
tar -czf local-files.tar.gz backend/uploads/

# Upload to S3 (manual or script)
aws s3 sync backend/uploads/ s3://your-bucket/
```

## 🛠️ Troubleshooting

### Common Issues

1. **Upload Fails**:
   - Check file size limits
   - Verify MIME type is allowed
   - Check AWS credentials (production)

2. **File Not Found**:
   - Verify key path
   - Check file permissions
   - Ensure file was uploaded successfully

3. **Environment Detection**:
   ```bash
   echo $NODE_ENV  # Should be 'development' or 'production'
   ```

### Debug Mode

```typescript
// Enable detailed logging
console.log('Storage config:', getStorageConfig());
console.log('Upload result:', result);
```

## 📈 Performance

### Local Storage
- **Small Files**: localStorage (instant)
- **Large Files**: Server upload (fast)
- **Development**: No external dependencies

### S3 Storage
- **Upload Speed**: Depends on file size and connection
- **Scalability**: Unlimited storage
- **CDN Integration**: Global distribution

### Optimization Tips

1. **Compress Images**: Before upload
2. **Use Appropriate Formats**: WebP for images
3. **Implement Caching**: Browser and CDN
4. **Batch Operations**: Multiple files

## 🔮 Future Enhancements

- **Image Resizing**: Automatic thumbnail generation
- **File Versioning**: Keep multiple versions
- **Virus Scanning**: Security for uploads
- **CDN Integration**: CloudFront/Cloudflare
- **File Encryption**: Client-side encryption
- **Bulk Operations**: Multiple file upload/download

## 📞 Support

For issues with the storage implementation:

1. Check environment variables
2. Verify AWS credentials (production)
3. Review browser console for errors
4. Check backend logs for upload failures
5. Ensure proper file permissions
