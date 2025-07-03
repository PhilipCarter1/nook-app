#!/bin/bash

echo "🚀 Starting pre-deployment checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --silent
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

# Run linting
echo "🔍 Running linting checks..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Error: Linting failed"
    exit 1
fi

# Run type checking
echo "🔍 Running TypeScript checks..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ Error: TypeScript errors found"
    exit 1
fi

# Run unit tests
echo "🧪 Running unit tests..."
npm run test:unit
if [ $? -ne 0 ]; then
    echo "❌ Error: Unit tests failed"
    exit 1
fi

# Run E2E tests
echo "🧪 Running E2E tests..."
npm run test:e2e
if [ $? -ne 0 ]; then
    echo "❌ Error: E2E tests failed"
    exit 1
fi

# Build the application
echo "🏗️ Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

# Check bundle size
echo "📊 Checking bundle size..."
npx @next/bundle-analyzer .next/static/chunks/pages/**/*.js

# Check for security vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
npm audit --audit-level moderate
if [ $? -ne 0 ]; then
    echo "⚠️ Warning: Security vulnerabilities found. Please review and fix."
fi

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL not set"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️ Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "⚠️ Warning: STRIPE_SECRET_KEY not set"
fi

echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready for deployment!" 