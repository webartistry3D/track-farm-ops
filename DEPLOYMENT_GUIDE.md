# 🚀 Automated Production Deployment Guide

## 📋 Prerequisites

1. **Database Access**: Ensure you have database credentials
2. **Backup Strategy**: Database will be automatically backed up
3. **Server Access**: SSH access to production server (if not using Render)

## 🎯 One-Command Deployment Options

### Option 1: Render Platform (Recommended)
```bash
# 1. Push changes to GitHub
git add .
git commit -m "Add password change features with automated deployment"
git push origin main

# 2. Render will automatically deploy with the new render.yaml configuration
# 3. Database migration runs automatically
# 4. New features are live!
```

### Option 2: Custom Server
```bash
# Make deployment script executable
chmod +x deploy-production.sh

# Run full deployment (includes backup, migration, and rollback capability)
./deploy-production.sh deploy

# Or run individual commands
npm run db:migrate        # Database migration only
npm run deploy:prod       # Full deployment
npm run health:check      # Verify deployment
```

### Option 3: Manual Step-by-Step
```bash
# 1. Create database backup
npm run db:backup

# 2. Run database migration
npm run db:migrate

# 3. Deploy backend
cd backend
npm ci --production
npm run build
npm start

# 4. Deploy frontend
cd frontend
npm ci
npm run build
# Copy dist/ to your web server

# 5. Verify deployment
curl http://your-domain.com/api/health
```

## 🔒 Safety Features Built-In

### ✅ Automatic Database Backup
- Creates timestamped backup before migration
- Backup stored in `/tmp/db-backup-*`
- Automatic rollback on failure

### ✅ Migration Verification
- Checks if migration is needed
- Verifies tables and columns exist
- Tests trigger functions

### ✅ Health Checks
- Backend health endpoint
- New password change endpoint
- Frontend accessibility

### ✅ Rollback Capability
```bash
# Quick rollback if issues occur
./deploy-production.sh rollback
# OR
npm run deploy:rollback
```

## 📊 What Gets Deployed

### Backend Changes
- ✅ `/auth/change-password` endpoint
- ✅ Password validation utility
- ✅ Rate limiting (3 attempts per 15 min)
- ✅ Audit logging
- ✅ Database schema updates

### Frontend Changes
- ✅ Profile/Settings navigation
- ✅ Password change form
- ✅ Password strength indicator
- ✅ First-time login prompt
- ✅ User profile management

### Database Changes
- ✅ `password_change_count` column
- ✅ `last_password_change` column
- ✅ `requires_password_change` column
- ✅ `password_history` table
- ✅ `audit_logs` table

## 🔍 Post-Deployment Verification

### Test Endpoints
```bash
# Health check
curl http://your-domain.com/api/health

# Password change endpoint (should return validation error without auth)
curl -X POST http://your-domain.com/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"","newPassword":""}'
```

### Test UI Features
1. **Login as existing user** → Should work normally
2. **Click Profile in dropdown** → Should show password change form
3. **Change password** → Should validate strength and update
4. **Create new user** → Should prompt for password change on first login

## 🚨 Troubleshooting

### Migration Issues
```bash
# Check migration status
node backend/scripts/migrate-password-features.js

# Manual rollback
psql $DATABASE_URL < /tmp/db-backup-YYYYMMDD-HHMMSS/database-backup.sql
```

### Backend Issues
```bash
# Check logs
pm2 logs track-farm-ops-backend

# Restart service
pm2 restart track-farm-ops-backend
```

### Frontend Issues
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## 📈 Monitoring

### Key Metrics to Watch
- Password change success rate
- Rate limiting violations
- Audit log volume
- User adoption of password changes

### Log Locations
- Backend: Console logs + audit trail
- Database: `audit_logs` table
- Frontend: Browser console

## 🎉 Success Indicators

✅ **Deployment succeeds without errors**
✅ **Health checks pass**
✅ **New Profile option appears in navigation**
✅ **Password change form works**
✅ **Rate limiting active**
✅ **Audit logs being created**

---

## 🆘 Quick Help

If anything goes wrong:
1. **Don't panic** - Automatic backup was created
2. **Run rollback**: `./deploy-production.sh rollback`
3. **Check logs**: Review error messages
4. **Contact support**: Include deployment logs

The deployment is designed to be **safe and reversible** at every step!
