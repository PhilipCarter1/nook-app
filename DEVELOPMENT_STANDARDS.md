# 📋 DEVELOPMENT STANDARDS

## 🎯 OVERVIEW
This document establishes coding standards and best practices for the Nook property management platform.

## 🏗️ ARCHITECTURE PRINCIPLES

### 1. Service Layer Architecture
```typescript
// ✅ GOOD: Proper service structure
export class UserService {
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }
  
  async getUser(id: string): Promise<User> {
    try {
      const response = await this.apiClient.get(`/users/${id}`);
      return this.validateUser(response.data);
    } catch (error) {
      throw new ServiceError('Failed to fetch user', error);
    }
  }
}

// ❌ BAD: Mock implementation
export async function getUser(id: string): Promise<User> {
  console.log('Getting user:', id);
  return mockUsers.find(u => u.id === id) || mockUsers[0];
}
```

### 2. Component Architecture
```typescript
// ✅ GOOD: Proper component structure
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  loading?: boolean;
}

export function UserCard({ user, onEdit, onDelete, loading }: UserCardProps) {
  if (loading) return <UserCardSkeleton />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
        {onEdit && <Button onClick={() => onEdit(user)}>Edit</Button>}
      </CardContent>
    </Card>
  );
}

// ❌ BAD: Large component with multiple responsibilities
export default function UserManagementPage() {
  // 200+ lines of mixed concerns
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // ... many more states and effects
}
```

## 📝 CODING STANDARDS

### 1. Type Safety
```typescript
// ✅ GOOD: Proper typing
interface Payment {
  id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

// ❌ BAD: Using any
const [payments, setPayments] = useState<any[]>([]);
```

### 2. Error Handling
```typescript
// ✅ GOOD: Proper error handling
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  try {
    const response = await apiClient.post('/payments', data);
    return response.data;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new PaymentValidationError(error.message);
    }
    if (error instanceof NetworkError) {
      throw new PaymentNetworkError('Network connection failed');
    }
    throw new PaymentError('Failed to create payment');
  }
}

// ❌ BAD: Console logging
export async function createPayment(data: any) {
  try {
    const response = await fetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    console.error('Error creating payment:', error);
    return null;
  }
}
```

### 3. State Management
```typescript
// ✅ GOOD: Proper state management
export function usePayments() {
  const queryClient = useQueryClient();
  
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentService.getPayments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const createPaymentMutation = useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create payment');
    },
  });
  
  return {
    payments,
    isLoading,
    error,
    createPayment: createPaymentMutation.mutate,
  };
}

// ❌ BAD: Direct state management
export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);
}
```

## 🔧 TOOLING & AUTOMATION

### 1. Pre-commit Hooks
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

### 2. ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": "error",
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-empty-interface": "error"
  }
}
```

### 3. TypeScript Configuration
```json
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
```

## 🧪 TESTING STANDARDS

### 1. Unit Tests
```typescript
// ✅ GOOD: Proper unit test
describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockApiClient: jest.Mocked<ApiClient>;
  
  beforeEach(() => {
    mockApiClient = createMockApiClient();
    paymentService = new PaymentService(mockApiClient);
  });
  
  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const paymentData = {
        amount: 100,
        currency: 'USD' as const,
        method: 'card' as const,
      };
      
      mockApiClient.post.mockResolvedValue({
        data: { id: '1', ...paymentData, status: 'completed' }
      });
      
      const result = await paymentService.createPayment(paymentData);
      
      expect(result).toEqual({
        id: '1',
        amount: 100,
        currency: 'USD',
        method: 'card',
        status: 'completed'
      });
      expect(mockApiClient.post).toHaveBeenCalledWith('/payments', paymentData);
    });
    
    it('should throw error on API failure', async () => {
      mockApiClient.post.mockRejectedValue(new Error('API Error'));
      
      await expect(paymentService.createPayment({} as any))
        .rejects.toThrow('Failed to create payment');
    });
  });
});
```

### 2. Integration Tests
```typescript
// ✅ GOOD: Integration test
describe('Payment Flow', () => {
  it('should complete payment flow', async () => {
    const user = await createTestUser();
    const property = await createTestProperty();
    
    const response = await request(app)
      .post('/api/payments')
      .send({
        userId: user.id,
        propertyId: property.id,
        amount: 1000,
        method: 'card'
      })
      .expect(201);
    
    expect(response.body).toMatchObject({
      id: expect.any(String),
      amount: 1000,
      status: 'completed'
    });
  });
});
```

## 📊 PERFORMANCE STANDARDS

### 1. Bundle Size
- Main bundle: < 500KB
- Individual chunks: < 100KB
- Total bundle: < 2MB

### 2. Loading Times
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

### 3. API Response Times
- GET requests: < 200ms
- POST/PUT requests: < 500ms
- File uploads: < 5s

## 🔒 SECURITY STANDARDS

### 1. Input Validation
```typescript
// ✅ GOOD: Input validation
import { z } from 'zod';

const CreatePaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  method: z.enum(['card', 'bank_transfer']),
  userId: z.string().uuid(),
});

export async function createPayment(data: unknown): Promise<Payment> {
  const validatedData = CreatePaymentSchema.parse(data);
  // Process validated data
}
```

### 2. Authentication & Authorization
```typescript
// ✅ GOOD: Proper auth checks
export async function getUserPayments(userId: string, currentUser: User): Promise<Payment[]> {
  if (currentUser.id !== userId && currentUser.role !== 'admin') {
    throw new UnauthorizedError('Access denied');
  }
  
  return paymentService.getPaymentsByUser(userId);
}
```

## 📈 MONITORING & LOGGING

### 1. Structured Logging
```typescript
// ✅ GOOD: Structured logging
import { logger } from '@/lib/logger';

export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  logger.info('Creating payment', {
    userId: data.userId,
    amount: data.amount,
    method: data.method,
  });
  
  try {
    const payment = await paymentService.create(data);
    logger.info('Payment created successfully', { paymentId: payment.id });
    return payment;
  } catch (error) {
    logger.error('Failed to create payment', {
      error: error.message,
      userId: data.userId,
      amount: data.amount,
    });
    throw error;
  }
}
```

### 2. Error Tracking
```typescript
// ✅ GOOD: Error tracking
import * as Sentry from '@sentry/nextjs';

export async function handlePaymentError(error: Error, context: PaymentContext) {
  Sentry.withScope((scope) => {
    scope.setExtra('paymentContext', context);
    scope.setTag('payment_method', context.method);
    scope.setLevel('error');
    Sentry.captureException(error);
  });
  
  throw new PaymentError('Payment processing failed');
}
```

## 🚀 DEPLOYMENT STANDARDS

### 1. Environment Management
- Use environment variables for all configuration
- Never commit secrets to version control
- Use different environments for dev/staging/prod

### 2. Database Migrations
- All schema changes must be versioned
- Migrations must be reversible
- Test migrations in staging before production

### 3. API Versioning
- Use semantic versioning for APIs
- Maintain backward compatibility
- Deprecate old versions gracefully

## 📚 DOCUMENTATION STANDARDS

### 1. Code Documentation
```typescript
/**
 * Creates a new payment for a user
 * @param data - Payment creation data
 * @returns Promise resolving to the created payment
 * @throws {ValidationError} When payment data is invalid
 * @throws {PaymentError} When payment processing fails
 */
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  // Implementation
}
```

### 2. API Documentation
- Use OpenAPI/Swagger for API documentation
- Include examples for all endpoints
- Document error responses

### 3. README Files
- Clear setup instructions
- Environment variables documentation
- Development workflow description

## 🔄 CODE REVIEW CHECKLIST

### Before Submitting PR:
- [ ] All tests pass
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Type safety (no `any` types)
- [ ] Performance considerations
- [ ] Security considerations
- [ ] Documentation updated

### During Code Review:
- [ ] Code follows standards
- [ ] No duplicate code
- [ ] Proper separation of concerns
- [ ] Error handling is comprehensive
- [ ] Tests cover edge cases
- [ ] Performance impact assessed 