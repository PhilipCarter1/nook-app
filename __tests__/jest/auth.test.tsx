import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import '@testing-library/jest-dom';
import { AuthProvider } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the Supabase client
const mockSignInWithPassword = jest.fn();
const mockGetUser = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockFrom = jest.fn();

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: jest.fn(),
    },
    from: mockFrom,
  }),
}));

// Mock the auth provider
jest.mock('@/components/providers/auth-provider', () => {
  const originalModule = jest.requireActual('@/components/providers/auth-provider');
  return {
    ...originalModule,
    useAuth: () => ({
      signIn: async (email: string, password: string) => {
        const { error } = await mockSignInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: jest.fn(),
      user: null,
      role: null,
      loading: false,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('handles login error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid login credentials'),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password');
    });
  });

  it('validates required fields', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('validates email format', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful user fetch
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    });

    // Mock successful role fetch
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    }));
  });

  it('renders children when authenticated', async () => {
    render(
      <AuthProvider>
        <div data-testid="test-child">Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  it('handles authentication state changes', async () => {
    render(
      <AuthProvider>
        <div data-testid="test-child">Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });
  });

  it('handles unauthenticated state', async () => {
    // Mock no user
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    render(
      <AuthProvider>
        <div data-testid="test-child">Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });
}); 