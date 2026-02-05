'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { log } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/types';

interface UserWithAuth {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserWithAuth | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
}

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithAuth | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        log.debug('SimpleAuthProvider: Getting user...');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          log.error('SimpleAuthProvider: Auth error', authError as Error);
          throw authError;
        }

        log.debug('SimpleAuthProvider: Auth user found', { email: authUser?.email });

        if (authUser) {
          log.debug('SimpleAuthProvider: Fetching user data from public.users...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (userError) {
            log.error('SimpleAuthProvider: Error fetching user data', userError as Error);
            
            // If user doesn't exist in public.users, create them
            log.debug('SimpleAuthProvider: Creating user in public.users...');
            const { data: newUserData, error: createError } = await supabase
              .from('users')
              .insert([
                {
                  id: authUser.id,
                  email: authUser.email,
                  first_name: authUser.email?.split('@')[0] || 'User',
                  last_name: '',
                  name: authUser.email?.split('@')[0] || 'User',
                  role: 'tenant',
                  avatar_url: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              ])
              .select()
              .single();

            if (createError) {
              log.error('SimpleAuthProvider: Error creating user', createError as Error);
              // Create fallback user
              const fallbackUser = {
                id: authUser.id,
                email: authUser.email || '',
                first_name: authUser.email?.split('@')[0] || 'User',
                last_name: '',
                name: authUser.email?.split('@')[0] || 'User',
                role: 'tenant',
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              
              if (mounted) {
                setUser(fallbackUser as UserWithAuth);
                setRole('tenant' as UserRole);
                setLoading(false);
              }
              } else {
              log.debug('SimpleAuthProvider: User created successfully', { user: newUserData });
              if (mounted) {
                setUser(newUserData as UserWithAuth);
                setRole(newUserData.role as UserRole);
                setLoading(false);
              }
            }
          } else {
            log.debug('SimpleAuthProvider: User data found', { user: userData });
            if (mounted) {
              setUser(userData as UserWithAuth);
              setRole(userData.role as UserRole);
              setLoading(false);
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
        log.error('SimpleAuthProvider: Error in getUser', error as Error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      }
    };

    getUser();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    log.debug('SimpleAuthProvider: Signing in', { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      log.error('SimpleAuthProvider: Sign in error', error as Error);
      throw error;
    }

    log.debug('SimpleAuthProvider: Sign in successful', { email: data.user?.email });
    
    // Refresh the user data
    window.location.reload();
  };

  const signOut = async () => {
    log.debug('SimpleAuthProvider: Signing out');
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    router.push('/login');
  };

  const value = {
    user,
    role,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
