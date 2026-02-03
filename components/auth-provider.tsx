'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { UserWithAuth } from '@/types/supabase';
import { UserRole } from '@/lib/types';
import { LoadingPage } from '@/components/ui/loading';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// 1. Define this helper function outside the component to satisfy line 109
const isAuthPage = (pathname: string): boolean => {
  return ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);
};

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
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;

        if (authUser) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          // Handling the "User needs to select role" case (PGRST116)
          if (userError) {
            if (userError.code === 'PGRST116' || userError.message.includes('406')) {
              console.log('ℹ️ AuthProvider: User not in public.users, needs to select role');
              
              // FIX: Ensure pathname is a string, never null
              const pathname = typeof window !== 'undefined' ? window.location.pathname || '' : '';
              
              if (mounted && isAuthPage(pathname)) {
                setLoading(false);
                router.push('/role-select');
              }
              return;
            }
            throw userError;
          }

          if (userData && mounted) {
            setUser({ ...authUser, ...userData } as UserWithAuth);
            setRole(userData.role as UserRole);
            setLoading(false);

            const pathname = typeof window !== 'undefined' ? window.location.pathname || '' : '';
            if (isAuthPage(pathname)) {
              switch (userData.role) {
                case 'admin': router.push('/admin/dashboard'); break;
                case 'landlord': router.push('/dashboard/landlord'); break;
                case 'tenant': router.push('/dashboard/tenant'); break;
                default: router.push('/dashboard');
              }
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
        console.error('Error in getUser:', error);
        if (mounted) {
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('No user data received');
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setLoading(false);
    router.push('/');
  };

  const updateRole = (newRole: UserRole) => setRole(newRole);

  if (loading) return <LoadingPage />;

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut, updateRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}