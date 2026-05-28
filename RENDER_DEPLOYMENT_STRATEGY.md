# Render-Specific Production Deployment Strategy

## Render Platform Constraints
- No direct database script execution via CLI
- Limited shell access
- Must work within Render's deployment workflow
- Database access through pgAdmin or connection strings only

## Safe Render Deployment Strategy

### Option 1: Prisma Migrate Approach (Recommended)

#### Step 1: Create Prisma Migration File
```bash
# In your local development environment
npx prisma migrate dev --name production_fixes
```

This creates a migration file in `prisma/migrations/` that Render will automatically apply.

#### Step 2: Update Prisma Schema
Ensure your `schema.prisma` includes all the missing tables/columns we identified.

#### Step 3: Deploy to Render
```bash
# Deploy with migration
git push origin main
# Render will automatically run: npx prisma migrate deploy
```

### Option 2: Database Connection Approach

#### Step 1: Connect to Render Database
```bash
# Get connection string from Render dashboard
# Use pgAdmin, DBeaver, or psql to connect

psql $RENDER_DATABASE_URL
```

#### Step 2: Run Migration Manually
Copy the `production_safe_migration.sql` content and run it in your database client.

#### Step 3: Deploy Code
```bash
git push origin main
```

### Option 3: Render Database Console

#### Step 1: Access Database Console
1. Go to Render dashboard
2. Navigate to your PostgreSQL service
3. Click "Database Console" (if available)
4. Paste the migration SQL

#### Step 2: Deploy Application
```bash
git push origin main
```

## Render-Specific Migration Files

### Create Prisma Migration File
```bash
# File: prisma/migrations/001_production_fixes.sql

-- Create missing enums
CREATE TYPE IF NOT EXISTS "UserRole" AS ENUM ('OWNER', 'MANAGER', 'WORKER', 'SUPERUSER');
CREATE TYPE IF NOT EXISTS "PaymentMethod" AS ENUM ('CASH', 'TRANSFER');
-- ... (add all other enums)

-- Create missing tables
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    -- ... (add all columns)
);

-- Add missing columns
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS user_id INTEGER;
-- ... (add all other columns)
```

### Update package.json Scripts
```json
{
  "scripts": {
    "postinstall": "npx prisma generate",
    "build": "npm run postinstall && next build",
    "start": "next start",
    "migrate:deploy": "npx prisma migrate deploy"
  }
}
```

### Update render.yaml (if using)
```yaml
services:
  - type: web
    name: track-farm-ops-api
    env: node
    buildCommand: npm run build
    startCommand: npm run start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: track-farm-ops-db
          property: connectionString
    preDeployCommand: npm run migrate:deploy
```

## Step-by-Step Render Deployment

### Phase 1: Preparation (Local)
1. **Update Prisma Schema** with all missing tables/columns
2. **Create Migration File**: `npx prisma migrate dev --name production_fixes`
3. **Test Locally**: Ensure migration works
4. **Commit Changes**: `git add . && git commit -m "Add production database fixes"`

### Phase 2: Database Migration (Render)
#### Option A: Automatic via Prisma
- Render will automatically run `prisma migrate deploy` on deploy

#### Option B: Manual via Database Client
1. **Connect to Render Database** using pgAdmin/DBeaver
2. **Run Migration SQL** manually
3. **Verify Tables Created**

#### Option C: Render Console
1. **Open Database Console** in Render dashboard
2. **Paste Migration SQL**
3. **Execute and Verify**

### Phase 3: Application Deployment
```bash
git push origin main
```

### Phase 4: Verification
1. **Check Render Logs** for any errors
2. **Test Endpoints**:
   - `https://your-app.onrender.com/api/health`
   - `https://your-app.onrender.com/api/superuser/stats`
3. **Monitor Dashboard** for 500 errors

## Render-Specific Considerations

### Database Connection
```bash
# Get from Render dashboard
RENDER_DATABASE_URL="postgresql://user:password@host:port/database"

# Test connection
psql $RENDER_DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Environment Variables
Ensure these are set in Render dashboard:
- `DATABASE_URL` (from database service)
- `JWT_SECRET`
- `SUPERUSER_ADMIN_KEY`
- `NODE_ENV=production`

### Build Process
Render automatically runs:
1. `npm install`
2. `npm run build` (if specified)
3. `npm run start` (if specified)

### Monitoring
- Check Render logs for migration errors
- Monitor database connection issues
- Watch for 500 errors in application logs

## Emergency Rollback for Render

### If Migration Fails
1. **Access Database** via client
2. **Drop New Tables** (if created)
3. **Restore from Backup** (if available)
4. **Redeploy Previous Code**

### If Application Fails
1. **Rollback Code**: `git revert HEAD`
2. **Redeploy**: `git push origin main`
3. **Database Remains Unchanged** (safe)

## Testing Strategy for Render

### Pre-Deployment
1. **Local Testing**: Run migration locally
2. **Staging**: Deploy to Render staging service first
3. **Database Backup**: Create manual backup

### Post-Deployment
1. **Health Check**: Verify `/api/health`
2. **Authentication**: Test login
3. **Superuser Dashboard**: Test all endpoints
4. **Data Verification**: Check user counts

## Success Metrics

### Deployment Success When:
- [ ] Build completes without errors
- [ ] Database migration succeeds
- [ ] Application starts successfully
- [ ] Health endpoint returns 200
- [ ] Superuser endpoints return 200 (not 500)
- [ ] Existing users can login
- [ ] No data loss detected

## Render Support Resources

### Documentation
- Render Database Documentation
- Prisma Deploy Guide
- Render Environment Variables

### Troubleshooting
- Render Dashboard Logs
- Database Connection Testing
- Migration Error Analysis

## Timeline for Render

- **Preparation**: 30 minutes (local testing)
- **Migration**: 15 minutes (database update)
- **Deployment**: 10 minutes (code push)
- **Verification**: 30 minutes (endpoint testing)

**Total Estimated Time: ~1.5 hours**

## Final Recommendation

**Use Option 1 (Prisma Migrate)** as it's the most reliable and Render-native approach. Render automatically handles the migration process during deployment, making it the safest option for your production environment.
