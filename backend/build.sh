#!/bin/bash
# Backend Build Script for Render
# Ensures we build from the correct directory

echo "🔧 Building backend from correct directory..."

# Change to backend directory
cd /opt/render/project/src/backend

# Install dependencies
npm install

# Build the backend
npm run build

echo "✅ Backend build completed!"
