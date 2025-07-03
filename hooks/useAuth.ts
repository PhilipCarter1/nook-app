import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { AppError } from '../lib/services/error';

interface User {
  id: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new AppError(error.message, 401);

      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role, avatar_url')
          .eq('id', data.user.id)
          .single();

        setState({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: profile?.role || 'user',
            avatarUrl: profile?.avatar_url,
          },
          loading: false,
          error: null,
        });

        router.push('/dashboard');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, [router]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw new AppError(error.message, 400);

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              first_name: firstName,
              last_name: lastName,
              role: 'user',
            },
          ]);

        if (profileError) throw new AppError(profileError.message, 400);

        setState({
          user: {
            id: data.user.id,
            email: data.user.email!,
            role: 'user',
          },
          loading: false,
          error: null,
        });

        router.push('/dashboard');
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw new AppError(error.message, 400);

      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new AppError(error.message, 400);

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('role, avatar_url')
            .eq('id', session.user.id)
            .single();

          setState({
            user: {
              id: session.user.id,
              email: session.user.email!,
              role: profile?.role || 'user',
              avatarUrl: profile?.avatar_url,
            },
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
} 