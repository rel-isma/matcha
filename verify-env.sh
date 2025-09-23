#!/bin/bash

# Environment Files Verification Script
echo "🔍 Checking Environment Files Setup..."
echo "=================================="

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 exists"
        return 0
    else
        echo "❌ $1 missing"
        return 1
    fi
}

echo ""
echo "📁 Checking file existence..."

# Check root files
check_file ".env"
check_file ".env.example"

# Check backend files  
check_file "backend/.env"
check_file "backend/.env.example"

# Check frontend files
check_file "frontend/.env.local"
check_file "frontend/.env.example"

echo ""
echo "📋 Environment Setup Summary:"
echo "=============================="
echo "• Root .env      → Docker Compose shared variables"
echo "• Backend .env   → Backend-specific configuration"  
echo "• Frontend .env.local → Frontend-specific configuration (Next.js)"

echo ""
echo "✅ Environment setup verification complete!"
