#!/bin/bash

# ClipStr Deployment Script
# Run this script to prepare the project for deployment

echo "🚀 Preparing ClipStr for deployment..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf clipstr-production.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.env \
  --exclude=*.log \
  --exclude=temp_* \
  --exclude=*.tmp \
  .

echo "✅ Deployment package created: clipstr-production.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Upload clipstr-production.tar.gz to your Ionos server"
echo "2. Extract: tar -xzf clipstr-production.tar.gz"
echo "3. Install dependencies: npm install && cd server && npm install"
echo "4. Install FFmpeg on your server"
echo "5. Copy env.production.example to .env and configure"
echo "6. Start server: node server/production.js"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
