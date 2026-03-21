#!/bin/bash

# FarmOps Deployment Script
# This script deploys both frontend and backend to production

set -e

echo "🚀 Starting FarmOps Deployment..."

# Configuration
FRONTEND_DIR="."
BACKEND_DIR="backend"
FRONTEND_BUILD_URL="https://your-farmops-frontend.onrender.com"
BACKEND_DEPLOY_URL="https://your-farmops-backend.onrender.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm ci --production=false
    
    # Build for production
    log_info "Building frontend for production..."
    npm run build
    
    # Check if build was successful
    if [ ! -d "dist" ]; then
        log_error "Frontend build failed - dist directory not found"
        exit 1
    fi
    
    log_info "Frontend build completed ✓"
    cd ..
}

# Build backend
build_backend() {
    log_info "Building backend..."
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    log_info "Installing backend dependencies..."
    npm ci --production=false
    
    # Build TypeScript
    log_info "Building backend TypeScript..."
    npm run build
    
    # Check if build was successful
    if [ ! -d "dist" ]; then
        log_error "Backend build failed - dist directory not found"
        exit 1
    fi
    
    log_info "Backend build completed ✓"
    cd ..
}

# Deploy to Render (or your preferred platform)
deploy_application() {
    log_info "Deploying application..."
    
    # Git operations
    log_info "Preparing git repository..."
    git add .
    git commit -m "Deploy FarmOps v2.0.0 - $(date)"
    git push origin main
    
    log_info "Code pushed to repository ✓"
    log_warn "Remember to trigger your deployment platform (Render, Vercel, etc.)"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check frontend health (if deployed)
    if command -v curl &> /dev/null; then
        log_info "Checking frontend health..."
        if curl -f -s "$FRONTEND_BUILD_URL" > /dev/null; then
            log_info "Frontend health check passed ✓"
        else
            log_warn "Frontend health check failed - may still be deploying"
        fi
        
        # Check backend health
        log_info "Checking backend health..."
        if curl -f -s "$BACKEND_DEPLOY_URL/api/health" > /dev/null; then
            log_info "Backend health check passed ✓"
        else
            log_warn "Backend health check failed - may still be deploying"
        fi
    else
        log_warn "curl not available - skipping health checks"
    fi
}

# Setup production environment
setup_production_env() {
    log_info "Setting up production environment..."
    
    # Create production environment files if they don't exist
    if [ ! -f "$BACKEND_DIR/.env.production" ]; then
        log_warn "Backend .env.production not found - please create it"
        log_warn "See backend/.env.production.example for template"
    fi
    
    if [ ! -f ".env.production" ]; then
        log_warn "Frontend .env.production not found - please create it"
        log_warn "See .env.production.example for template"
    fi
}

# Main deployment process
main() {
    log_info "FarmOps Deployment Script v2.0.0"
    log_info "=================================="
    
    check_prerequisites
    setup_production_env
    build_frontend
    build_backend
    deploy_application
    health_check
    
    log_info "🎉 Deployment completed successfully!"
    log_info "=================================="
    log_info "Next steps:"
    log_info "1. Update your production environment variables"
    log_info "2. Set up your database connection"
    log_info "3. Configure your domain and SSL"
    log_info "4. Test the application"
    log_info "5. Set up monitoring and backups"
    
    echo ""
    log_info "Useful URLs:"
    log_info "Frontend: $FRONTEND_BUILD_URL"
    log_info "Backend: $BACKEND_DEPLOY_URL"
    log_info "API Health: $BACKEND_DEPLOY_URL/api/health"
}

# Run main function
main "$@"
