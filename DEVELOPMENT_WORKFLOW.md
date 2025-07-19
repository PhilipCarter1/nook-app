# 🔄 DEVELOPMENT WORKFLOW

## 📋 OVERVIEW
This document outlines the development workflow and processes for the Nook property management platform.

## 🚀 GETTING STARTED

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Supabase CLI (optional)
- Docker (optional)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd nook-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npm run db:setup

# Start development server
npm run dev
```

## 🔄 DEVELOPMENT PROCESS

### 1. Feature Development Workflow

#### Step 1: Create Feature Branch
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Ensure you're up to date
git pull origin main
```

#### Step 2: Development
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:unit:watch

# Run linting
npm run lint
```

#### Step 3: Testing
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

#### Step 4: Code Quality Checks
```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Run technical debt cleanup
./scripts/cleanup-technical-debt.sh
```

#### Step 5: Commit Changes
```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add payment processing functionality

- Implement Stripe payment integration
- Add payment validation
- Add error handling
- Add tests for payment flow"
```

#### Step 6: Push and Create PR
```bash
# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### 2. Code Review Process

#### For Contributors
1. **Self-Review**: Review your own code before submitting
2. **Tests**: Ensure all tests pass
3. **Documentation**: Update documentation if needed
4. **Screenshots**: Add screenshots for UI changes

#### For Reviewers
1. **Functionality**: Does the code work as expected?
2. **Code Quality**: Does it follow our standards?
3. **Security**: Are there any security concerns?
4. **Performance**: Any performance implications?
5. **Tests**: Are there adequate tests?

#### Review Checklist
- [ ] Code follows development standards
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Type safety (no `any` types)
- [ ] Tests pass
- [ ] No duplicate code
- [ ] Performance considerations
- [ ] Security considerations
- [ ] Documentation updated

### 3. Testing Strategy

#### Unit Tests
```bash
# Run unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- UserService.test.ts

# Run tests with coverage
npm run test:unit -- --coverage
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- payment-flow.test.ts
```

#### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- auth.spec.ts

# Run E2E tests in UI mode
npm run test:e2e:ui
```

#### Test Writing Guidelines
```typescript
// ✅ GOOD: Proper test structure
describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockApiClient: jest.Mocked<ApiClient>;
  
  beforeEach(() => {
    mockApiClient = createMockApiClient();
    paymentService = new PaymentService(mockApiClient);
  });
  
  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      // Arrange
      const paymentData = createTestPaymentData();
      mockApiClient.post.mockResolvedValue(createMockResponse());
      
      // Act
      const result = await paymentService.createPayment(paymentData);
      
      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        status: 'completed'
      });
    });
    
    it('should handle validation errors', async () => {
      // Arrange
      const invalidData = { amount: -100 };
      
      // Act & Assert
      await expect(paymentService.createPayment(invalidData))
        .rejects.toThrow('Invalid amount');
    });
  });
});
```

### 4. Database Management

#### Migrations
```bash
# Generate migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database
npm run db:reset
```

#### Schema Changes
1. Create migration file
2. Test migration locally
3. Update types if needed
4. Update tests
5. Document changes

### 5. Deployment Process

#### Staging Deployment
```bash
# Deploy to staging
git push origin feature/your-feature-name
# Create PR to staging branch
# Automated deployment to staging environment
```

#### Production Deployment
```bash
# Merge to main branch
git checkout main
git merge feature/your-feature-name

# Deploy to production
git push origin main
# Automated deployment to production
```

## 🛠️ DEVELOPMENT TOOLS

### 1. VS Code Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### 2. Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### 3. Git Hooks
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linting
npm run lint

# Run tests
npm run test:unit

# Check types
npx tsc --noEmit
```

## 📊 MONITORING & DEBUGGING

### 1. Development Logging
```typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  logger.debug('Payment created', { paymentId, amount });
}
```

### 2. Error Tracking
```typescript
// Error tracking
import * as Sentry from '@sentry/nextjs';

try {
  await createPayment(data);
} catch (error) {
  Sentry.captureException(error, {
    extra: { paymentData: data }
  });
  throw error;
}
```

### 3. Performance Monitoring
```typescript
// Performance monitoring
import { performance } from 'perf_hooks';

const start = performance.now();
await createPayment(data);
const duration = performance.now() - start;

if (duration > 1000) {
  logger.warn('Slow payment creation', { duration });
}
```

## 🔧 TROUBLESHOOTING

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

#### Test Failures
```bash
# Clear test cache
npm run test:clear

# Run tests with verbose output
npm run test:unit -- --verbose

# Run specific failing test
npm run test:unit -- --testNamePattern="PaymentService"
```

#### Database Issues
```bash
# Reset database
npm run db:reset

# Check database connection
npm run db:check

# View database logs
supabase logs
```

## 📚 RESOURCES

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Code Standards
- [Development Standards](./DEVELOPMENT_STANDARDS.md)
- [Technical Debt Tracking](./TECHNICAL_DEBT.md)
- [API Documentation](./API_DOCUMENTATION.md)

### Tools
- [ESLint Configuration](./.eslintrc.json)
- [TypeScript Configuration](./tsconfig.json)
- [Prettier Configuration](./.prettierrc)

## 🚨 EMERGENCY PROCEDURES

### Hot Fixes
1. Create hotfix branch from main
2. Make minimal changes
3. Test thoroughly
4. Deploy immediately
5. Create proper fix later

### Rollback
```bash
# Rollback to previous version
git revert <commit-hash>

# Deploy rollback
git push origin main
```

### Database Rollback
```bash
# Rollback last migration
npm run db:rollback

# Restore from backup
npm run db:restore
``` 