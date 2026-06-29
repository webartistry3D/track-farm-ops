# File Storage

## Overview

TrackFarmOps uses AWS S3 (or S3-compatible storage) for two purposes:
1. **Receipt images** — scanned via OCR when recording expenses
2. **Profile images** — user avatar uploads

---

## Configuration

| Env Var | Description |
|---|---|
| `AWS_S3_BUCKET` | S3 bucket name |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | IAM access key |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key |
| `AWS_ENDPOINT` | Custom endpoint for S3-compatible providers (e.g. Cloudflare R2) |
| `AWS_FORCE_PATH_STYLE` | `true` for MinIO/R2 style paths |

---

## Receipt Image Upload + OCR Pipeline

```
POST /api/expenses/ocr
  │
  ├── Multer middleware — accept image/pdf, max 10MB
  ├── Upload file to S3 bucket
  ├── Run tesseract.js OCR on uploaded file
  │     ├── Language: English ('eng')
  │     └── Returns: { text, confidence }
  ├── Parse extracted text for:
  │     ├── Merchant name
  │     ├── Total amount
  │     └── Date
  ├── Store expense with:
  │     ├── receiptImageUrl (S3 URL)
  │     ├── ocrConfidence (integer 0-100)
  │     ├── ocrSource
  │     └── rawText (full extracted text)
  └── Return parsed expense fields to frontend for user confirmation
```

The OCR result is **suggested, not auto-saved** — the user reviews and confirms the parsed fields before the expense is created.

---

## Profile Image Upload

```
POST /api/auth/profile-image
  │
  ├── Multer middleware — accept image/*, max 5MB
  ├── Resize/validate image
  ├── Upload to S3: profiles/{userId}/{timestamp}.{ext}
  ├── Update user.profileImageUrl in DB
  └── Return { profileImageUrl: "https://..." }
```

---

## S3 Bucket Configuration

Recommended IAM policy (least privilege):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Bucket CORS policy (for direct browser access to images):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["https://track-farm-ops.onrender.com"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## S3-Compatible Alternatives

The storage client accepts a custom `endpoint`, enabling use of:
- **Cloudflare R2** — no egress fees
- **MinIO** — self-hosted
- **DigitalOcean Spaces**

Set `AWS_ENDPOINT` to the provider's S3-compatible endpoint URL and `AWS_FORCE_PATH_STYLE=true` if required.
