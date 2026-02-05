'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { log } from '@/lib/logger';
import { getClient } from '@/lib/supabase/client';
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

function getRoleDashboardPath(role: UserRole | string): string {
  switch (role?.toString().toLowerCase()) {
    case 'admin': return '/admin/dashboard';
    case 'landlord': return '/dashboard/landlord';
    case 'tenant': return '/dashboard/tenant';
    case 'property_manager':
    case 'manager': return '/dashboard/manager';
    case 'super':
    case 'superintendent': return '/super/dashboard';
    default: return '/dashboard';
  }
}

function isAuthPage(pathname: string | null): boolean {
  if (!pathname) return false;
  return /\/(login|signup|forgot-password|reset-password|role-select)/.test(pathname);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithAuth | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (userError) {
          if (userError.code === 'PGRST116' || userError.message.includes('406')) {
            // Fix 1: Pass empty string if pathname is null
            if (mounted && isAuthPage(pathname || '')) {
              setLoading(false);
              router.push('/role-select');
            }
          }
          return;
        }

        if (userData && mounted) {
          setUser({ ...authUser, ...userData } as UserWithAuth);
          setRole(userData.role as UserRole);
          setLoading(false);

          // Fix 2: Pass empty string if pathname is null
          if (isAuthPage(pathname || '')) {
            router.push(getRoleDashboardPath(userData.role));
          }
        }
      } catch (error) {
        log.error('Error in getUser:', error as Error);
        if (mounted) setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
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
  }, [supabase, router, pathname]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      if (!data.user) throw new Error('No user data received');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      // Remove 'mounted' check here as this is an async trigger, not an effect
      setUser({ ...data.user, ...userData } as UserWithAuth);
      setRole(userData.role as UserRole);
      setLoading(false);
      
    } catch (error: any) {
      log.error('Error in signIn:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      router.push('/');
    } catch (error) {
      log.error('Error signing out:', error as Error);
      toast.error('Failed to sign out.');
      setLoading(false);
    }
  };

  const updateRole = (newRole: UserRole) => setRole(newRole);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [loading]);

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