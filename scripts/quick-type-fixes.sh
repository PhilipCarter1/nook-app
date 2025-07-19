#!/bin/bash

# Quick type fixes for common patterns

echo "🔧 Applying quick type fixes..."

# Replace common any patterns
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' \
  -e 's/useState<any\[\]>/useState<User[]>/g' \
  -e 's/useState<any>/useState<User | null>/g' \
  -e 's/: any\[\]/: User[]/g' \
  -e 's/: any\b/: User/g' \
  -e 's/any\[\]/User[]/g'

echo "✅ Quick type fixes applied"
echo "⚠️  Review and test the changes"
