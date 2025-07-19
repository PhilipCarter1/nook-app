#!/bin/bash

# 🔒 Type Safety Fix Script
# This script identifies and helps fix type safety issues

set -e

echo "🔒 Starting type safety analysis..."

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

# Find files with 'any' types
print_status "Finding files with 'any' types..."

FILES_WITH_ANY=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next | xargs grep -l ": any\|: any\[\]\|any\[\]\|any\s" || true)

if [ -z "$FILES_WITH_ANY" ]; then
    print_success "No 'any' types found!"
    exit 0
fi

print_status "Found $(echo "$FILES_WITH_ANY" | wc -l) files with 'any' types"

# Generate type safety report
print_status "Generating type safety report..."

cat > type-safety-report.md << EOF
# Type Safety Report
Generated on: $(date)

## Summary
- Total files with 'any' types: $(echo "$FILES_WITH_ANY" | wc -l)
- Critical files requiring immediate attention: $(echo "$FILES_WITH_ANY" | grep -E "(service|api|component)" | wc -l)

## Files with 'any' Types
$(echo "$FILES_WITH_ANY" | sed 's/^/- /')

## Common 'any' Type Patterns Found

### 1. State Variables
\`\`\`typescript
// ❌ BAD
const [data, setData] = useState<any[]>([]);
const [user, setUser] = useState<any>(null);

// ✅ GOOD
const [data, setData] = useState<User[]>([]);
const [user, setUser] = useState<User | null>(null);
\`\`\`

### 2. Function Parameters
\`\`\`typescript
// ❌ BAD
function handleData(data: any) { ... }

// ✅ GOOD
function handleData(data: UserData) { ... }
\`\`\`

### 3. API Responses
\`\`\`typescript
// ❌ BAD
const response: any = await fetch('/api/users');

// ✅ GOOD
const response: UserResponse = await fetch('/api/users');
\`\`\`

### 4. Event Handlers
\`\`\`typescript
// ❌ BAD
const handleSubmit = (e: any) => { ... }

// ✅ GOOD
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { ... }
\`\`\`

## Recommended Type Definitions

### User Types
\`\`\`typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'admin' | 'super';
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### Property Types
\`\`\`typescript
export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'condo';
  units: number;
  status: 'available' | 'occupied' | 'maintenance';
  monthlyRent: number;
  securityDeposit: number;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### Payment Types
\`\`\`typescript
export interface Payment {
  id: string;
  amount: number;
  type: 'rent' | 'deposit' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  dueDate: Date;
  paidAt?: Date;
  propertyId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

### Maintenance Types
\`\`\`typescript
export interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  category: 'plumbing' | 'electrical' | 'hvac' | 'structural';
  propertyId: string;
  unitId: string;
  tenantId: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

## Action Items

### High Priority
1. Replace 'any' types in service files
2. Replace 'any' types in API routes
3. Replace 'any' types in component props

### Medium Priority
1. Replace 'any' types in utility functions
2. Replace 'any' types in hooks
3. Replace 'any' types in test files

### Low Priority
1. Replace 'any' types in mock data
2. Replace 'any' types in development utilities

## Files Requiring Immediate Attention

### Service Files
$(echo "$FILES_WITH_ANY" | grep "services" | head -10 | sed 's/^/- /')

### API Files
$(echo "$FILES_WITH_ANY" | grep "api" | head -10 | sed 's/^/- /')

### Component Files
$(echo "$FILES_WITH_ANY" | grep "components" | head -10 | sed 's/^/- /')

## Next Steps
1. Review each file and replace 'any' types with proper interfaces
2. Create comprehensive type definitions in \`lib/types.ts\`
3. Update TypeScript configuration to be more strict
4. Add type validation where needed
5. Test the application to ensure type safety

## TypeScript Configuration Recommendations
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
\`\`\`
EOF

print_success "Type safety report generated: type-safety-report.md"

# Create a script to help with common replacements
cat > scripts/quick-type-fixes.sh << 'EOF'
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
EOF

chmod +x scripts/quick-type-fixes.sh

print_success "Type safety analysis completed!"
print_warning "Review the generated report: type-safety-report.md"
print_warning "Use scripts/quick-type-fixes.sh for common replacements"
print_warning "Manual review and testing required for all changes" 