# Render Deployment Instructions

## 🚀 Production Deployment Steps

### 1. Update Render Build Command
Go to your Render dashboard and update the build command for your backend service:

**Current Build Command:**
```
npm run build:render
```

**New Build Command:**
```
npm run build:deploy
```

### 2. Set Environment Variables
In Render dashboard, add this environment variable:

```
SUPERUSER_ADMIN_KEY=trackfarmops-superuser-2024
```

### 3. Verify Deployment
After deployment, test the superuser functionality:

```bash
curl -X POST https://track-farm-ops-backend.onrender.com/api/auth/superuser-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Superuser",
    "email": "test@superuser.com", 
    "password": "Password1709#",
    "adminKey": "trackfarmops-superuser-2024"
  }'
```

### 4. Expected Results
- ✅ Should return 201 status with user data
- ✅ Superuser role should be created in database
- ✅ Dashboard should work after login

## 🔧 What the Deployment Script Does

1. **Installs dependencies**
2. **Generates Prisma client**
3. **Runs database migrations** (applies superuser role)
4. **Verifies build success**

## 📊 Deployment Status

- ✅ Code pushed to GitHub
- ⏳ Waiting for Render deployment
- ⏳ Need to update build command in Render
- ⏳ Need to set environment variables

## 🎯 Next Steps

1. Update Render build command to `npm run build:deploy`
2. Add `SUPERUSER_ADMIN_KEY` environment variable
3. Trigger manual deployment
4. Test superuser signup functionality
