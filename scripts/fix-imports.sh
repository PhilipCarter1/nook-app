#!/bin/bash

echo "🔧 Fixing corrupted import statements..."

# Find all TypeScript/TSX files with corrupted imports
find . -name "*.tsx" -o -name "*.ts" | while read -r file; do
  if grep -q "import { log } from '@/lib/logger';import" "$file"; then
    echo "Fixing imports in: $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
      if [[ $line =~ ^import\ \{.*log.*\}\ from\ \'@/lib/logger\';import ]]; then
        # Split the corrupted import into separate lines
        echo "$line" | sed "s/import { log } from '@\/lib\/logger';import/import { log } from '@\/lib\/logger';\nimport/g" >> "$temp_file"
      else
        echo "$line" >> "$temp_file"
      fi
    done < "$file"
    
    # Replace the original file
    mv "$temp_file" "$file"
  fi
done

echo "✅ Import statements fixed!" 