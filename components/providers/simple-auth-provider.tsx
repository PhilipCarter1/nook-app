'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
        console.log('🔍 SimpleAuthProvider: Getting user...');
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ SimpleAuthProvider: Auth error:', authError);
          throw authError;
        }

        console.log('✅ SimpleAuthProvider: Auth user found:', authUser?.email);

        if (authUser) {
          console.log('🔍 SimpleAuthProvider: Fetching user data from public.users...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          if (userError) {
            console.error('❌ SimpleAuthProvider: Error fetching user data:', userError);
            
            // If user doesn't exist in public.users, create them
            console.log('🔧 SimpleAuthProvider: Creating user in public.users...');
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
              console.error('❌ SimpleAuthProvider: Error creating user:', createError);
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
              console.log('✅ SimpleAuthProvider: User created successfully:', newUserData);
              if (mounted) {
                setUser(newUserData as UserWithAuth);
                setRole(newUserData.role as UserRole);
                setLoading(false);
              }
            }
          } else {
            console.log('✅ SimpleAuthProvider: User data found:', userData);
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
        console.error('❌ SimpleAuthProvider: Error in getUser:', error);
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
    console.log('🔐 SimpleAuthProvider: Signing in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ SimpleAuthProvider: Sign in error:', error);
      throw error;
    }

    console.log('✅ SimpleAuthProvider: Sign in successful:', data.user?.email);
    
    // Refresh the user data
    window.location.reload();
  };

  const signOut = async () => {
    console.log('🚪 SimpleAuthProvider: Signing out...');
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
