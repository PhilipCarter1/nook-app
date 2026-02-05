'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { log } from './logger';
import { sendWelcomeEmail } from './email/client';
import { Database } from '@/types/supabase';

/**
 * Server-side auth actions for Supabase Authentication
 * These functions MUST be used on the server side (API routes or Server Components)
 * Never expose Supabase service role key to the client
 */

/**
 * Sign up a new user with email and password
 * Creates both Supabase Auth user and database user record
 */
export async function signUpAction(
  email: string,
  password: string,
  userData?: {
    firstName?: string;
    lastName?: string;
    role?: 'landlord' | 'tenant' | 'property_manager' | 'admin';
  }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    // 1. Create Supabase Auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (signUpError) {
      log.error('Sign up error:', signUpError);
      throw new Error(signUpError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // 2. Create user record in database
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: userData?.firstName || '',
        last_name: userData?.lastName || '',
        role: userData?.role || 'tenant',
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      log.error('Failed to create user record:', dbError);
      // Note: Auth user was created but DB record failed
      // In production, you might want to trigger a cleanup or manual intervention
      throw new Error(`Failed to create user profile: ${dbError.message}`);
    }

    log.info(`User signed up: ${email}`);
    // Fire-and-forget welcome email (do not block signup flow)
    try {
      void sendWelcomeEmail(email, `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || email);
    } catch (e) {
      log.error('Failed to send welcome email:', e as Error);
    }
    return {
      success: true,
      user: authData.user,
      message: 'Sign up successful. Please check your email to confirm your account.',
    };
  } catch (error: any) {
    log.error('Sign up action failed:', error);
    throw error;
  }
}

/**
 * Sign in user with email and password
 */
export async function signInAction(email: string, password: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      log.error('Sign in error:', error);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to sign in user');
    }

    log.info(`User signed in: ${email}`);

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error: any) {
    log.error('Sign in action failed:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOutAction() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    const { error } = await supabase.auth.signOut();

    if (error) {
      log.error('Sign out error:', error);
      throw new Error(error.message);
    }

    log.info('User signed out');

    return { success: true };
  } catch (error: any) {
    log.error('Sign out action failed:', error);
    throw error;
  }
}

/**
 * Reset password - send reset link via email
 */
export async function resetPasswordAction(email: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      log.error('Reset password error:', error);
      throw new Error(error.message);
    }

    log.info(`Password reset link sent to: ${email}`);

    return {
      success: true,
      message: 'Password reset link has been sent to your email',
    };
  } catch (error: any) {
    log.error('Reset password action failed:', error);
    throw error;
  }
}

/**
 * Update user password with reset token
 */
export async function updatePasswordAction(password: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      log.error('Update password error:', error);
      throw new Error(error.message);
    }

    log.info('Password updated successfully');

    return { success: true, message: 'Password updated successfully' };
  } catch (error: any) {
    log.error('Update password action failed:', error);
    throw error;
  }
}

/**
 * Get current session (server-side)
 */
export async function getSessionAction() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      log.error('Get session error:', error);
      return null;
    }

    return session;
  } catch (error: any) {
    log.error('Get session action failed:', error);
    return null;
  }
}

/**
 * Get current user (server-side)
 */
export async function getUserAction() {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      log.error('Failed to fetch user profile:', profileError);
      return user;
    }

    return { ...user, ...profile };
  } catch (error: any) {
    log.error('Get user action failed:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfileAction(
  userId: string,
  updates: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
  }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    // Verify user is updating their own profile
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      throw new Error('Unauthorized');
    }

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      log.error('Update profile error:', error);
      throw new Error(error.message);
    }

    log.info(`User profile updated: ${userId}`);

    return { success: true, user: data };
  } catch (error: any) {
    log.error('Update profile action failed:', error);
    throw error;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRoleAction(userId: string, role: 'landlord' | 'tenant' | 'property_manager' | 'admin') {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });

    // Verify current user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: currentUserProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentUserProfile || currentUserProfile.role !== 'admin') {
      throw new Error('Only admins can update user roles');
    }

    // Update target user's role
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      log.error('Update role error:', error);
      throw new Error(error.message);
    }

    log.info(`User role updated: ${userId} -> ${role}`);

    return { success: true, user: data };
  } catch (error: any) {
    log.error('Update role action failed:', error);
    throw error;
  }
}
