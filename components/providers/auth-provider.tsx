'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase/client';
import { log } from '@/lib/logger';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { UserWithAuth } from '@/types/supabase';
import { UserRole } from '@/lib/types';
import { LoadingPage } from '@/components/ui/loading';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserWithAuth | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Maps user role to their primary dashboard path
 */
function getRoleDashboardPath(role: UserRole | string): string {
  switch (role?.toString().toLowerCase()) {
    case 'admin':
      return '/admin/dashboard';
    case 'landlord':
      return '/dashboard/landlord';
    case 'tenant':
      return '/dashboard/tenant';
    case 'property_manager':
    case 'manager':
      return '/dashboard/manager';
    case 'super':
    case 'superintendent':
      return '/super/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Checks if current pathname is an auth page
 */
function isAuthPage(pathname: string): boolean {
  return /\/(login|signup|forgot-password|reset-password|role-select)/.test(pathname);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithAuth | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        console.log('🔍 AuthProvider: Getting user...');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ AuthProvider: Auth error:', authError);
          log.error('Auth error:', authError);
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
          return;
        }

        if (!authUser) {
          console.log('ℹ️ AuthProvider: No authenticated user');
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
          return;
        }

        console.log('✅ AuthProvider: Auth user found:', authUser.email);

        // Fetch user profile from public.users table
        console.log('🔍 AuthProvider: Fetching user profile...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (userError) {
          console.error('❌ AuthProvider: Error fetching user profile:', userError);
          
          // Don't throw - user may need to complete onboarding
          // Redirect to role selection if user exists in auth but not in public.users
          if (userError.code === 'PGRST116' || userError.message.includes('406')) {
            console.log('ℹ️ AuthProvider: User not in public.users, needs to select role');
            if (mounted && isAuthPage(pathname)) {
              setLoading(false);
              router.push('/role-select');
            }
          }
          return;
        }

        if (!userData) {
          console.log('ℹ️ AuthProvider: User profile not found');
          if (mounted && isAuthPage(pathname)) {
            setLoading(false);
            router.push('/role-select');
          }
          return;
        }

        console.log('✅ AuthProvider: User profile loaded:', userData.email);

        if (mounted) {
          const mergedUser = { ...authUser, ...userData } as UserWithAuth;
          setUser(mergedUser);
          setRole(userData.role as UserRole);
          setLoading(false);

          // Redirect from auth pages to dashboard after successful login
          if (isAuthPage(pathname)) {
            const dashboardPath = getRoleDashboardPath(userData.role);
            console.log(`📍 AuthProvider: Redirecting to ${dashboardPath}`);
            router.push(dashboardPath);
          }
        }
      } catch (error) {
        console.error('❌ AuthProvider: Unexpected error in getUser:', error);
        log.error('Error in getUser:', error as Error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    };

    getUser();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthProvider: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ AuthProvider: User signed in');
        setLoading(true);
        await getUser();
      } else if (event === 'SIGNED_OUT') {
        console.log('✅ AuthProvider: User signed out');
        setUser(null);
        setRole(null);
        setLoading(false);
        router.push('/');
      } else if (event === 'USER_UPDATED') {
        console.log('✅ AuthProvider: User data updated');
        await getUser();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔐 AuthProvider: Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ AuthProvider: Sign in error:', error);
        log.error('Sign in error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before signing in');
        } else {
          throw error;
        }
      }

      if (!data.user) {
        throw new Error('No user data received');
      }

      console.log('✅ AuthProvider: Sign in successful');
      
      // Fetch user profile to get role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('❌ AuthProvider: Error fetching user data:', userError);
        log.error('Error fetching user data:', userError);
        throw new Error('Failed to fetch user profile. Please try again.');
      }

      if (!userData) {
        console.error('❌ AuthProvider: User profile not found');
        throw new Error('User profile not found. Please contact support.');
      }

      if (mounted) {
        setUser({ ...data.user, ...userData } as UserWithAuth);
        setRole(userData.role as UserRole);
      }
      
      console.log('✅ AuthProvider: User authenticated and loaded');
    } catch (error: any) {
      console.error('❌ AuthProvider: Sign in failed:', error);
      log.error('Error in signIn:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🔐 AuthProvider: Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AuthProvider: Sign out error:', error);
        throw error;
      }
      
      console.log('✅ AuthProvider: Sign out successful');
      setUser(null);
      setRole(null);
      router.push('/');
    } catch (error) {
      console.error('❌ AuthProvider: Sign out failed:', error);
      log.error('Error signing out:', error as Error);
      toast.error('Failed to sign out. Please try again.');
      setLoading(false);
    }
  };

  const updateRole = (newRole: UserRole) => {
    console.log('🔄 AuthProvider: Updating role to:', newRole);
    setRole(newRole);
  };

  // Prevent infinite loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ AuthProvider: Loading timeout reached, forcing completion');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 