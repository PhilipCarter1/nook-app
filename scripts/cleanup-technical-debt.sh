#!/bin/bash

# 🧹 Technical Debt Cleanup Script
# This script helps clean up common technical debt issues

set -e

echo "🧹 Starting Technical Debt Cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# 1. Remove console.log statements
print_status "Removing console.log statements..."
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' '/console\.log/d' || true
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs sed -i '' '/console\.warn/d' || true
print_success "Console statements removed"

# 2. Find files with 'any' types
print_status "Finding files with 'any' types..."
echo "Files with 'any' types:"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -l ": any" | head -10 || true

# 3. Find mock implementations
print_status "Finding mock implementations..."
echo "Files with mock implementations:"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -l "mock\|Mock\|MOCK" | head -10 || true

# 4. Find unused imports
print_status "Checking for unused imports..."
if command -v npx &> /dev/null; then
    npx unimported --init || true
    print_warning "Run 'npx unimported' to see unused imports"
else
    print_warning "npx not available, skipping unused import check"
fi

# 5. Run ESLint
print_status "Running ESLint..."
if command -v npx &> /dev/null; then
    npx eslint . --ext .ts,.tsx --fix || print_warning "ESLint found issues"
else
    print_warning "npx not available, skipping ESLint"
fi

# 6. Run TypeScript check
print_status "Running TypeScript check..."
if command -v npx &> /dev/null; then
    npx tsc --noEmit || print_warning "TypeScript found issues"
else
    print_warning "npx not available, skipping TypeScript check"
fi

# 7. Find TODO comments
print_status "Finding TODO comments..."
echo "TODO comments found:"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -n "TODO\|FIXME\|HACK" | head -10 || true

# 8. Check for duplicate code patterns
print_status "Checking for common duplicate patterns..."
echo "Files with potential duplicate error handling:"
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -l "console\.error.*catch" | head -5 || true

# 9. Generate report
print_status "Generating technical debt report..."
cat > technical-debt-report.md << EOF
# Technical Debt Report
Generated on: $(date)

## Console Statements
$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -c "console\." | awk -F: '{sum+=$2} END {print "Total console statements found: " sum}')

## Any Types
$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -c ": any" | awk -F: '{sum+=$2} END {print "Total 'any' types found: " sum}')

## Mock Implementations
$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -c "mock\|Mock\|MOCK" | awk -F: '{sum+=$2} END {print "Total mock references found: " sum}')

## TODO Comments
$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -c "TODO\|FIXME\|HACK" | awk -F: '{sum+=$2} END {print "Total TODO comments found: " sum}')

## Files with Issues
$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -l "console\.log\|: any\|mock\|TODO" | sort | uniq | head -20)

## Recommendations
1. Replace all console.log statements with proper logging
2. Replace 'any' types with proper interfaces
3. Implement real functionality instead of mocks
4. Address TODO comments
5. Implement proper error handling
6. Add comprehensive tests
EOF

print_success "Technical debt report generated: technical-debt-report.md"

# 10. Create action items
print_status "Creating action items..."
cat > action-items.md << EOF
# Action Items for Technical Debt

## Immediate Actions (Week 1)
- [ ] Review and address console.log statements
- [ ] Replace 'any' types with proper interfaces
- [ ] Implement proper error handling
- [ ] Add proper logging infrastructure

## Short Term (Week 2-3)
- [ ] Replace mock implementations with real functionality
- [ ] Implement proper service layer
- [ ] Add comprehensive type definitions
- [ ] Set up proper testing infrastructure

## Medium Term (Week 4-6)
- [ ] Refactor large components
- [ ] Implement proper state management
- [ ] Add performance optimizations
- [ ] Improve code organization

## Long Term (Week 7-8)
- [ ] Add comprehensive test coverage
- [ ] Implement automated code quality checks
- [ ] Set up monitoring and alerting
- [ ] Document best practices

## Files Requiring Immediate Attention
$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -l "console\.log\|: any\|mock" | sort | uniq | head -10 | sed 's/^/- [ ] /')
EOF

print_success "Action items created: action-items.md"

print_success "Technical debt cleanup completed!"
print_warning "Review the generated reports and action items"
print_warning "Manual review and fixes are still required" 