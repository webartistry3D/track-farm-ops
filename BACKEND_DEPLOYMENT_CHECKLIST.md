# 🚀 Backend Deployment Checklist

## ✅ Pre-Deployment Checks

### **Backend Build Status**: ✅ PASSED
- TypeScript compilation successful
- All dependencies installed
- Build command works

### **Files Ready**: ✅ COMPLETE
- `backend/package.json` - Production ready
- `backend/.env.production` - Environment configured
- `backend/src/index.ts` - Entry point exists
- `backend/dist/` - Build output ready

## 🎯 Render Deployment Steps

### **1. Create Web Service**
- **Name**: `track-farm-ops-backend`
- **Repository**: Your GitHub repo (same as frontend)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Free (to start)

### **2. Environment Variables**
Add these in Render dashboard:

#### **🔐 Critical Variables:**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=your-render-postgres-connection-string
JWT_SECRET=your-super-secure-jwt-secret-for-production-change-this
FRONTEND_URL=https://track-farm-ops.onrender.com
```

#### **🔧 Additional Variables:**
```bash
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
```

### **3. Database Setup**
- **Create**: PostgreSQL database on Render
- **Name**: `track-farm-ops-db`
- **Database**: `farmops_prod`
- **Get Connection String** from Render dashboard
- **Update DATABASE_URL** in backend environment variables

### **4. CORS Configuration**
The backend will automatically allow requests from:
- `https://track-farm-ops.onrender.com` (your frontend)
- `http://localhost:3000` (development)

## 📋 Post-Deployment Verification

### **Backend Health Check:**
```bash
# Test backend is running
curl https://track-farm-ops-backend.onrender.com/api/health

# Test database connection
curl https://track-farm-ops-backend.onrender.com/api/test-db
```

### **Frontend Connection Test:**
1. ✅ Frontend should connect to backend
2. ✅ Login should work without CORS errors
3. ✅ Data should load from database

## 🔍 Troubleshooting

### **CORS Issues:**
- Check `FRONTEND_URL` matches your frontend URL exactly
- Verify backend CORS middleware is configured

### **Database Issues:**
- Verify DATABASE_URL is correct
- Check database is accessible from Render
- Ensure Prisma schema is deployed

### **Build Issues:**
- Check `backend/package.json` scripts are correct
- Verify TypeScript compilation
- Check `backend/dist/index.js` exists

## 🎯 Expected URLs After Deployment

- **Frontend**: https://track-farm-ops.onrender.com ✅ (already working)
- **Backend**: https://track-farm-ops-backend.onrender.com ⏳ (to be deployed)
- **Database**: Render PostgreSQL ⏳ (to be created)

## 🚀 Next Steps

1. **Deploy backend** to Render using this checklist
2. **Create PostgreSQL database** on Render
3. **Update environment variables** with real database URL
4. **Test full application** end-to-end
5. **Redeploy frontend** if needed (to pick up new backend URL)

---

**Once backend is deployed, your CORS and database connection issues will be resolved!** 🎉
