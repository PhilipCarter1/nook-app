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
import { useRouter } from 'next/navigation';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithAuth | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        console.log('🔍 AuthProvider: Getting user...');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ AuthProvider: Auth error:', authError);
          log.error('Auth error:', authError);
          throw authError;
        }

        console.log('✅ AuthProvider: Auth user found:', authUser?.email);

        if (authUser) {
          console.log('🔍 AuthProvider: Fetching user data from public.users...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (userError) {
            console.error('❌ AuthProvider: Error fetching user data:', userError);
            log.error('Error fetching user data:', userError);
            throw userError;
          }

          console.log('✅ AuthProvider: User data found:', userData);

          if (userData) {
            if (mounted) {
              setUser({ ...authUser, ...userData } as UserWithAuth);
              setRole(userData.role as UserRole);
              setLoading(false);

              // Redirect based on role
              const pathname = window.location.pathname;
              if (pathname === '/login' || pathname === '/signup') {
                switch (userData.role) {
                  case 'admin':
                    router.push('/admin/dashboard');
                    break;
                  case 'landlord':
                    router.push('/dashboard/landlord');
                    break;
                  case 'tenant':
                    router.push('/dashboard/tenant');
                    break;
                  default:
                    router.push('/dashboard');
                }
              }
            }
          } else {
            const { data: newUserData, error: createError } = await supabase
              .from('users')
              .insert([
                {
                  id: authUser.id,
                  email: authUser.email,
                  role: 'tenant',
                  created_at: new Date().toISOString(),
                }
              ])
              .select()
              .single();

            if (createError) {
              log.error('Error creating user data:', createError);
              throw createError;
            }

            if (newUserData && mounted) {
              setUser({ ...authUser, ...newUserData } as UserWithAuth);
              setRole(newUserData.role as UserRole);
              setLoading(false);
              router.push('/dashboard/tenant');
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
        }
      } catch (error) {
        log.error('Error in getUser:', error as Error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await getUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setLoading(false);
        router.push('/');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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

      
      // Fetch user data immediately after successful sign in
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        log.error('Error fetching user data:', userError);
        throw new Error('Failed to fetch user data. Please try again.');
      }

      if (userData) {
        setUser({ ...data.user, ...userData } as UserWithAuth);
        setRole(userData.role as UserRole);
      } else {
        throw new Error('User profile not found. Please contact support.');
      }
    } catch (error: any) {
      log.error('Error in signIn:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user data
      setUser(null);
      setRole(null);
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      log.error('Error signing out:', error as Error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000); // 5 second timeout

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