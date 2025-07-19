#!/bin/bash

# 🔄 Console.log Replacement Script
# This script replaces console.log statements with proper logging

set -e

echo "🔄 Starting console.log replacement..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_status "Creating backup in $BACKUP_DIR"

# Function to replace console.log in a file
replace_console_logs() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    # Create backup
    cp "$file" "$BACKUP_DIR/"
    
    # Replace console.log statements with proper logging
    sed -E '
        # Replace console.log with log.info
        s/console\.log\(([^)]+)\);/log.info(\1);/g
        
        # Replace console.error with log.error
        s/console\.error\(([^)]+)\);/log.error(\1);/g
        
        # Replace console.warn with log.warn
        s/console\.warn\(([^)]+)\);/log.warn(\1);/g
        
        # Replace console.debug with log.debug
        s/console\.debug\(([^)]+)\);/log.debug(\1);/g
    ' "$file" > "$temp_file"
    
    # Check if file was modified
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        print_success "Updated $file"
        return 0
    else
        rm "$temp_file"
        return 1
    fi
}

# Function to add logger import if needed
add_logger_import() {
    local file="$1"
    
    # Check if file already has logger import
    if grep -q "from '@/lib/logger'" "$file"; then
        return 0
    fi
    
    # Check if file has other imports
    if grep -q "^import" "$file"; then
        # Add logger import after existing imports
        sed -i '' '/^import/a\
import { log } from '\''@/lib/logger'\'';' "$file"
    else
        # Add logger import at the beginning
        sed -i '' '1i\
import { log } from '\''@/lib/logger'\'';' "$file"
    fi
    
    print_success "Added logger import to $file"
}

# Find all TypeScript/JavaScript files with console.log statements
print_status "Finding files with console.log statements..."

FILES_WITH_CONSOLE=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -l "console\." || true)

if [ -z "$FILES_WITH_CONSOLE" ]; then
    print_success "No console.log statements found!"
    exit 0
fi

print_status "Found $(echo "$FILES_WITH_CONSOLE" | wc -l) files with console statements"

# Process each file
UPDATED_FILES=0
TOTAL_FILES=0

for file in $FILES_WITH_CONSOLE; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    print_status "Processing $file"
    
    # Add logger import if needed
    if grep -q "console\." "$file"; then
        add_logger_import "$file"
    fi
    
    # Replace console.log statements
    if replace_console_logs "$file"; then
        UPDATED_FILES=$((UPDATED_FILES + 1))
    fi
done

print_success "Updated $UPDATED_FILES out of $TOTAL_FILES files"

# Generate report
print_status "Generating replacement report..."

cat > console-replacement-report.md << EOF
# Console.log Replacement Report
Generated on: $(date)

## Summary
- Total files processed: $TOTAL_FILES
- Files updated: $UPDATED_FILES
- Backup location: $BACKUP_DIR

## Files Updated
$(echo "$FILES_WITH_CONSOLE" | head -20 | sed 's/^/- /')

## Replacement Patterns
- \`console.log(...)\` → \`log.info(...)\`
- \`console.error(...)\` → \`log.error(...)\`
- \`console.warn(...)\` → \`log.warn(...)\`
- \`console.debug(...)\` → \`log.debug(...)\`

## Next Steps
1. Review the changes in each file
2. Test the application to ensure logging works correctly
3. Update any remaining console statements manually
4. Consider using service-specific logging methods (log.service, log.api, etc.)

## Manual Review Required
Some console statements may need manual review and conversion to more specific logging methods:
- Service calls: Use \`log.service(serviceName, action, context)\`
- API calls: Use \`log.api(method, endpoint, context)\`
- User actions: Use \`log.user(userId, action, context)\`
- Payment events: Use \`log.payment(paymentId, action, context)\`
- Maintenance events: Use \`log.maintenance(ticketId, action, context)\`
EOF

print_success "Console.log replacement completed!"
print_warning "Review the generated report: console-replacement-report.md"
print_warning "Backup files are available in: $BACKUP_DIR"
print_warning "Test the application to ensure logging works correctly" 