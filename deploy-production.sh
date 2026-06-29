#!/bin/bash

# Automated Production Deployment Script for Password Change Features
# This script handles the complete deployment process with safety checks

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/tmp/db-backup-$(date +%Y%m%d-%H%M%S)"
PROJECT_DIR="/path/to/your/track-farm-ops-fresh"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Safety checks
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        error "package.json not found. Please run from project root."
        exit 1
    fi
    
    # Check if Docker is running (if using Docker)
    if command -v docker &> /dev/null; then
        if ! docker info &> /dev/null; then
            error "Docker is not running"
            exit 1
        fi
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create database backup
backup_database() {
    log "Creating database backup..."
    
    # Extract database URL from environment
    if [[ -z "$DATABASE_URL" ]]; then
        if [[ -f ".env" ]]; then
            source .env
        fi
    fi
    
    if [[ -z "$DATABASE_URL" ]]; then
        error "DATABASE_URL not found in environment"
        exit 1
    fi
    
    mkdir -p "$BACKUP_DIR"
    
    # Create backup using pg_dump
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database-backup.sql"
    
    if [[ $? -eq 0 ]]; then
        success "Database backup created at $BACKUP_DIR/database-backup.sql"
    else
        error "Failed to create database backup"
        exit 1
    fi
}

# Run database migration
migrate_database() {
    log "Running database migration..."
    
    cd "$BACKEND_DIR"
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    if [[ $? -eq 0 ]]; then
        success "Database migration completed"
    else
        error "Database migration failed"
        log "Restoring from backup..."
        psql "$DATABASE_URL" < "$BACKUP_DIR/database-backup.sql"
        exit 1
    fi
    
    cd - > /dev/null
}

# Update backend dependencies and restart
deploy_backend() {
    log "Deploying backend..."
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    npm ci --production
    
    # Generate Prisma client
    npx prisma generate
    
    # Build backend (if needed)
    if [[ -f "package.json" ]] && grep -q "build" package.json; then
        npm run build
    fi
    
    # Restart backend service
    if command -v pm2 &> /dev/null; then
        pm2 restart track-farm-ops-backend || pm2 start npm --name "track-farm-ops-backend" -- start
    elif command -v docker &> /dev/null; then
        docker-compose restart backend
    else
        log "Please restart your backend service manually"
    fi
    
    success "Backend deployment completed"
    cd - > /dev/null
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    npm ci
    
    # Build frontend
    npm run build
    
    # Deploy to production (adjust based on your hosting)
    if [[ -d "dist" ]]; then
        # Copy to web server directory
        sudo cp -r dist/* /var/www/html/ || {
            warning "Could not copy to /var/www/html. Please deploy manually."
        }
    fi
    
    success "Frontend deployment completed"
    cd - > /dev/null
}

# Health checks
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        success "Backend health check passed"
    else
        warning "Backend health check failed"
    fi
    
    # Check new endpoint
    if curl -f http://localhost:3001/api/auth/change-password -X POST -H "Content-Type: application/json" -d '{}' 2>/dev/null | grep -q "error"; then
        success "Change password endpoint is responding"
    else
        warning "Change password endpoint health check inconclusive"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old backups (keep last 5)
    find /tmp -name "db-backup-*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    if [[ -f "$BACKUP_DIR/database-backup.sql" ]]; then
        psql "$DATABASE_URL" < "$BACKUP_DIR/database-backup.sql"
        success "Database rollback completed"
    else
        error "No backup found for rollback"
        exit 1
    fi
}

# Main deployment flow
main() {
    log "Starting production deployment for password change features..."
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            backup_database
            migrate_database
            deploy_backend
            deploy_frontend
            health_check
            cleanup
            success "🎉 Production deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "backup-only")
            check_prerequisites
            backup_database
            success "Backup completed"
            ;;
        "health-check")
            health_check
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|backup-only|health-check}"
            echo "  deploy      - Full deployment with safety checks"
            echo "  rollback    - Rollback to previous state"
            echo "  backup-only - Create database backup only"
            echo "  health-check- Perform health checks"
            exit 1
            ;;
    esac
}

# Trap for cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
