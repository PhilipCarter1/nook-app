import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserRole = async () => {
  const user = await getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return profile?.role;
};

export const getClient = async () => {
  const user = await getUser();
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('client_id')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  if (!profile?.client_id) return null;

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', profile.client_id)
    .single();

  if (clientError) throw clientError;
  return client;
}; 