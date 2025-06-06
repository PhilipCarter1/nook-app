'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { UserWithAuth } from '@/types/supabase';
import { UserRole } from '@/lib/types';
import { LoadingPage } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';

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
        console.log('Fetching user data...');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          throw authError;
        }

        if (authUser) {
          console.log('Auth user found:', authUser.email);
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (userError) {
            console.error('Error fetching user data:', userError);
            throw userError;
          }

          if (userData) {
            console.log('User data found:', userData);
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
                    router.push('/landlord/dashboard');
                    break;
                  case 'tenant':
                    router.push('/tenant/dashboard');
                    break;
                  default:
                    router.push('/dashboard');
                }
              }
            }
          } else {
            console.log('No user data found, creating new user record...');
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
              console.error('Error creating user data:', createError);
              throw createError;
            }

            if (newUserData && mounted) {
              console.log('New user data created:', newUserData);
              setUser({ ...authUser, ...newUserData } as UserWithAuth);
              setRole(newUserData.role as UserRole);
              setLoading(false);
              router.push('/tenant/dashboard');
            }
          }
        } else {
          console.log('No auth user found');
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in getUser:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
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
      console.log('Attempting sign in...');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      console.log('Sign in successful');
    } catch (error) {
      console.error('Error in signIn:', error);
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
      router.push('/');
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
        console.log('Loading timeout reached, forcing loading state to false');
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