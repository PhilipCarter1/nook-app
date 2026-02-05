import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { log } from '@/lib/logger';

/**
 * Create a Supabase client for browser/Client Components
 * This uses only the public ANON_KEY - safe for browser
 */
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  // Reuse client instance for browser
  if (!clientInstance) {
    clientInstance = createBrowserClient<Database>(url, key);
  }

  return clientInstance;
}

// Auth Helpers
export async function getUser() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    log.error('Error getting user:', error as Error);
    return null;
  }
}

export async function getUserRole() {
  try {
    const supabase = createClient();
    const user = await getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role || null;
  } catch (error) {
    log.error('Error getting user role:', error as Error);
    return null;
  }
}

// Property Helpers
export async function getProperties() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    log.error('Error getting properties:', error as Error);
    return [];
  }
}

export async function getPropertyById(id: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    log.error('Error getting property:', error as Error);
    return null;
  }
}

// Maintenance Ticket Helpers
export async function getTicketsByProperty(propertyId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .select(`
        *,
        created_by:users(name),
        assigned_to:users(name)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    log.error('Error getting tickets:', error as Error);
    return [];
  }
}

export async function createTicket(ticket: Database['public']['Tables']['maintenance_tickets']['Insert']) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    log.error('Error creating ticket:', error as Error);
    throw error;
  }
}

export async function updateTicketStatus(id: string, status: 'open' | 'in_progress' | 'resolved') {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    log.error('Error updating ticket status:', error as Error);
    throw error;
  }
}

// Payment Helpers
export async function getPaymentsByProperty(propertyId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        user:users(name)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    log.error('Error getting payments:', error as Error);
    return [];
  }
}

// Reset client instance (for testing/debugging)
export const resetClient = () => {
  clientInstance = null;
};

// Backward compatibility export
export const getClient = createClient;