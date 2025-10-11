#!/bin/bash

echo "🚀 Creating mock data for Matcha..."

# Navigate to backend directory
cd /home/rel-isma/goinfre/matcha/backend

# Run the mock data script
node scripts/createMockData.js

echo "✅ Done! You can now test browsing profiles."