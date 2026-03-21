# FarmOps Deployment Guide

## Overview
This guide covers deploying FarmOps to production environments, specifically optimized for Render but adaptable to other platforms.

## Prerequisites

### Required Tools
- Node.js 18+ 
- npm
- Git
- Render account (or alternative hosting platform)
- PostgreSQL database (Neon recommended)

### Environment Setup
1. Clone your repository to your deployment platform
2. Set up environment variables
3. Configure database connection
4. Deploy both frontend and backend

## Environment Configuration

### Backend Environment Variables
Copy `backend/.env.production` and configure:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://username:password@host:5432/farmops_prod"
JWT_SECRET="your-super-secure-jwt-secret-change-this"
FRONTEND_URL="https://your-frontend-domain.onrender.com"
```

### Frontend Environment Variables
Copy `.env.production` and configure:

```bash
VITE_API_URL=https://your-backend-domain.onrender.com/api
VITE_APP_NAME=FarmOps
VITE_APP_VERSION=2.0.0
```

## Deployment Platforms

### Render (Recommended)

#### Backend Deployment
1. Create a new **Web Service** on Render
2. Connect your Git repository
3. Configure:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
   - **Region**: Choose closest to your users
4. Add environment variables from `.env.production`
5. Set up PostgreSQL database add-on

#### Frontend Deployment
1. Create a new **Static Site** on Render
2. Connect your Git repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node Environment**: Production
4. Add environment variables from `.env.production`

### Alternative Platforms

#### Vercel (Frontend only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod
```

#### Heroku
```bash
# Install Heroku CLI
# Create backend app
heroku create your-farmops-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your-db-url

# Deploy
git push heroku main
```

## Database Setup

### Using Neon (Recommended)
1. Create a Neon account
2. Create a new PostgreSQL database
3. Get connection string
4. Add to environment variables

### Manual PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE farmops_prod;

-- Create user (optional)
CREATE USER farmops_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE farmops_prod TO farmops_user;
```

## SSL and Security

### Automatic SSL (Render)
- SSL certificates are automatically provided
- HTTPS is enforced by default

### Manual SSL Setup
1. Obtain SSL certificate (Let's Encrypt recommended)
2. Configure your web server/proxy
3. Update environment variables

## Monitoring and Logging

### Health Checks
- Backend: `https://your-domain.com/api/health`
- Detailed: `https://your-domain.com/api/health/detailed`

### Logs
- Production logs are stored in `logs/app.log`
- Configure log rotation in production
- Set up external monitoring (optional)

## Performance Optimization

### For Poor Internet Conditions
1. **API Timeout**: 30 seconds (configured in frontend)
2. **Retry Logic**: 3 attempts for failed requests
3. **Caching**: 5-minute cache for static data
4. **Compression**: Enabled by default in production
5. **CDN**: Consider using CDN for static assets

### Database Optimization
1. Enable connection pooling
2. Set up read replicas for high traffic
3. Configure proper indexes
4. Regular maintenance and backups

## Backup Strategy

### Automated Backups
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Upload to cloud storage (optional)
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

### Backup Retention
- Keep daily backups for 30 days
- Monthly backups for 1 year
- Test restoration process regularly

## Testing Production

### Pre-deployment Checklist
- [ ] All environment variables set
- [ ] Database connection working
- [ ] SSL certificates configured
- [ ] Health checks passing
- [ ] Test accounts working
- [ ] Mobile responsiveness verified

### Post-deployment Testing
1. Test login with both user roles
2. Verify all CRUD operations
3. Check mobile performance
4. Test with poor network conditions
5. Verify error handling

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check connection string
psql $DATABASE_URL

# Verify network connectivity
telnet your-db-host 5432
```

#### Frontend Not Loading
- Check build logs
- Verify environment variables
- Clear browser cache
- Check console for errors

#### API Requests Failing
- Check CORS configuration
- Verify API URL in frontend
- Check backend logs
- Test health endpoint

### Getting Help
1. Check application logs
2. Review deployment logs
3. Test health endpoints
4. Monitor database performance

## Security Considerations

### Production Security
1. Use strong JWT secrets
2. Enable rate limiting
3. Configure CORS properly
4. Regular security updates
5. Monitor for suspicious activity

### Data Protection
1. Encrypt sensitive data
2. Regular backups
3. Access control
4. Audit logs
5. GDPR compliance (if applicable)

## Maintenance

### Regular Tasks
- Weekly: Check logs and performance
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: Review and update infrastructure

### Scaling
- Monitor resource usage
- Plan for traffic spikes
- Consider load balancing
- Database optimization

## Support

For deployment issues:
1. Check this guide first
2. Review platform documentation
3. Check application logs
4. Contact support if needed

---

**Deployment Script**: Run `./deploy.sh` for automated deployment
**Environment Templates**: See `.env.production.example` files
**Health Monitoring**: `/api/health` endpoint available
