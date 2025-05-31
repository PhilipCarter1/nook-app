import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import '@testing-library/jest-dom';
import { AuthProvider } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import React from 'react';
import { UserRole } from '@/lib/types';
import { UserWithAuth } from '@/types/supabase';

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

// Mock the LoadingPage component
jest.mock('@/components/ui/loading', () => ({
  LoadingPage: () => <div data-testid="loading">Loading...</div>,
}));

// Mock the Supabase client
const mockSignInWithPassword = jest.fn();
const mockGetUser = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockFrom = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
    from: mockFrom,
  }),
}));

// Mock the auth provider
jest.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => ({
    user: null,
    role: null,
    loading: false,
    signIn: async (email: string, password: string) => {
      try {
        const { error } = await mockSignInWithPassword({ email, password });
        if (error) throw error;
      } catch (error) {
        throw error;
      }
    },
    signOut: async () => {
      try {
        const { error } = await mockSignOut();
        if (error) throw error;
      } catch (error) {
        throw error;
      }
    },
    updateRole: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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