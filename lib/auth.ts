import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export interface User {
  id: string;
  email: string;
  role: 'landlord' | 'admin' | 'super' | 'tenant';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (userError || !user) {
    return null;
  }

  return user;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateUserRole(
  userId: string,
  role: User['role']
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

export const auth = () => getServerSession(authOptions); 