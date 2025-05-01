import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

const supabase = createClientComponentClient<Database>();

// Auth Helpers
export async function getUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserRole() {
  try {
    const user = await getUser();
    if (!user) return null;

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// Property Helpers
export async function getProperties() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting properties:', error);
    return [];
  }
}

export async function getPropertyById(id: string) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting property:', error);
    return null;
  }
}

// Maintenance Ticket Helpers
export async function getTicketsByProperty(propertyId: string) {
  try {
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
    console.error('Error getting tickets:', error);
    return [];
  }
}

export async function createTicket(ticket: Database['public']['Tables']['maintenance_tickets']['Insert']) {
  try {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

export async function updateTicketStatus(id: string, status: 'open' | 'in_progress' | 'resolved') {
  try {
    const { data, error } = await supabase
      .from('maintenance_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
}

// Comment Helpers
export async function getCommentsByTicket(ticketId: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(name, avatar_url)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

export async function createComment(comment: Database['public']['Tables']['comments']['Insert']) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

// Payment Helpers
export async function getPaymentsByProperty(propertyId: string) {
  try {
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
    console.error('Error getting payments:', error);
    return [];
  }
}

// Client Helper
export function getClient() {
  return supabase;
}