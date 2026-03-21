# 🚀 Deployment Guide for Reorganized Structure

## 📋 Updated Render Configuration

### Frontend Deployment
```
Root Directory: frontend/
Build Command: npm install && npm run build
Start Command: npm start
```

### Backend Deployment
```
Root Directory: backend/
Build Command: npm install && npm run build
Start Command: npm start
```

## 🔧 Environment Variables

### Frontend Environment Variables
Add these to your frontend Render service:
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=FarmOps
VITE_APP_VERSION=2.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_API_TIMEOUT=30000
VITE_RETRY_ATTEMPTS=3
VITE_CACHE_DURATION=300000
VITE_ENABLE_ERROR_REPORTING=true
VITE_SENTRY_DSN=your-sentry-dsn-here
VITE_MAP_API_KEY=your-map-api-key
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# AWS S3 Configuration
VITE_AWS_S3_BUCKET=trackfarmops
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=5a67cc4d-84e9-4093-93ae-d20ce653d39a
VITE_AWS_SECRET_ACCESS_KEY=4RXGXLIE6MHWTP7ADIKAKCTNTRIEF6ZFJMBVGEODLZIFYYMMVH27SEXOGML2PT3K
VITE_AWS_ENDPOINT=
VITE_AWS_FORCE_PATH_STYLE=false
```

### Backend Environment Variables
Add these to your backend Render service:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://farmops_prod_user:oXkNxZdBXLXM7wxVOs9VhWj1o77Ap8gr@dpg-d6ute1hj16oc738tee1g-a.oregon-postgres.render.com:5432/farmops_prod
JWT_SECRET=6fd4659dde83a67e26cf4eb83da7c1fbf6ee2e7a8bbc0ee9806364e13d1de2b0d94505429a5a2300e7f9ad4ce8889e1a4a1e3df38e216b104ed62b5e8b805dcb
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.onrender.com
LOG_LEVEL=info
LOG_FILE=logs/app.log
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ENABLE_METRICS=true
METRICS_PORT=9090
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
```

## 🎯 Benefits of New Structure

### ✅ Clear Separation
- Frontend and backend are completely isolated
- No more TypeScript conflicts
- Independent build processes
- Cleaner dependency management

### ✅ Better Organization
- Dedicated folders for each concern
- Shared utilities in `/shared`
- Documentation in `/docs`
- Test scripts organized

### ✅ Easier Deployment
- Each service can be deployed independently
- Clear root directory for each service
- No more build conflicts
- Simplified environment management

### ✅ Scalability
- Easy to add new services
- Shared code can be organized in `/shared`
- Monorepo structure with workspaces
- Better dependency management

## 🚀 Deployment Steps

### 1. Deploy Database
- Create PostgreSQL database on Render
- Get connection string
- Update `DATABASE_URL` in backend environment

### 2. Deploy Backend
- Create new Web Service for backend
- Set Root Directory to `backend/`
- Add environment variables
- Deploy and test

### 3. Deploy Frontend
- Create new Web Service for frontend
- Set Root Directory to `frontend/`
- Add environment variables
- Deploy and test

### 4. Test Integration
- Verify frontend can connect to backend
- Test authentication flow
- Verify all features work

## 🔍 Troubleshooting

### Build Issues
- Ensure correct Root Directory is set
- Check that all dependencies are installed
- Verify TypeScript configuration

### Connection Issues
- Check CORS configuration (`FRONTEND_URL`)
- Verify database connection string
- Test API endpoints individually

### Environment Issues
- Double-check all environment variables
- Ensure secrets are properly set
- Verify URLs are correct

This new structure eliminates all the previous build conflicts and provides a clean, scalable architecture! 🎉
