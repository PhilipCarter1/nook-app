import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Mock maintenance service for launch readiness

export interface MaintenanceTicket {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'scheduled';
  category: 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'appliance' | 'other';
  assigned_to?: string;
  scheduled_date?: string;
  scheduled_time_slot?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  is_urgent: boolean;
  is_premium: boolean;
}

export interface MaintenanceComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_internal: boolean;
}

export interface TicketStats {
  total: number;
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

// Mock data for launch readiness
const mockTickets: MaintenanceTicket[] = [
  {
    id: '1',
    title: 'Leaky Faucet in Kitchen',
    description: 'The kitchen faucet has been dripping for the past week. Need it fixed asap.',
    status: 'open',
    priority: 'medium',
    category: 'plumbing',
    property_id: 'prop-1',
    unit_id: 'unit-1',
    tenant_id: 'tenant-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_urgent: false,
    is_premium: false,
  },
  {
    id: '2',
    title: 'Heating System Not Working',
    description: 'The heating system stopped working yesterday. It\'s getting cold.',
    status: 'in_progress',
    priority: 'high',
    category: 'hvac',
    property_id: 'prop-1',
    unit_id: 'unit-2',
    tenant_id: 'tenant-2',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    is_urgent: true,
    is_premium: false,
  },
  {
    id: '3',
    title: 'Broken Window Lock',
    description: 'The window lock in the bedroom is broken and won\'t secure properly.',
    status: 'resolved',
    priority: 'low',
    category: 'structural',
    property_id: 'prop-1',
    unit_id: 'unit-3',
    tenant_id: 'tenant-3',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    is_urgent: false,
    is_premium: false,
  },
];

export async function getMaintenanceTickets(propertyId?: string, status?: string): Promise<MaintenanceTicket[]> {
  let query = supabase
    .from('maintenance_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getMaintenanceTicket(id: string): Promise<MaintenanceTicket | null> {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createMaintenanceTicket(ticket: Omit<MaintenanceTicket, 'id' | 'created_at' | 'updated_at'>): Promise<MaintenanceTicket> {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .insert({
      ...ticket,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateMaintenanceTicket(id: string, updates: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addMaintenanceComment(comment: Omit<MaintenanceComment, 'id' | 'created_at'>): Promise<MaintenanceComment> {
  const { data, error } = await supabase
    .from('maintenance_comments')
    .insert({
      ...comment,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function assignMaintenanceTicket(ticketId: string, assignedTo: string): Promise<MaintenanceTicket> {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTickets(userId: string, filters?: {
  status?: string;
  priority?: string;
  category?: string;
}): Promise<MaintenanceTicket[]> {
  // Mock implementation
  console.log('Getting maintenance tickets for user:', userId, 'with filters:', filters);
  
  let filteredTickets = [...mockTickets];
  
  if (filters?.status) {
    filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
  }
  
  if (filters?.priority) {
    filteredTickets = filteredTickets.filter(ticket => ticket.priority === filters.priority);
  }
  
  if (filters?.category) {
    filteredTickets = filteredTickets.filter(ticket => ticket.category === filters.category);
  }
  
  return filteredTickets;
}

export async function getTicket(id: string): Promise<MaintenanceTicket | null> {
  // Mock implementation
  console.log('Getting maintenance ticket:', id);
  
  const ticket = mockTickets.find(t => t.id === id);
  return ticket || null;
}

export async function createTicket(ticketData: {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'appliance' | 'other';
  propertyId?: string;
  unitId?: string;
  userId: string;
}): Promise<MaintenanceTicket> {
  // Mock implementation
  console.log('Creating maintenance ticket:', ticketData);
  
  const newTicket: MaintenanceTicket = {
    id: Math.random().toString(36).substr(2, 9),
    title: ticketData.title,
    description: ticketData.description,
    status: 'open',
    priority: ticketData.priority,
    category: ticketData.category,
    property_id: ticketData.propertyId || '',
    unit_id: ticketData.unitId || '',
    tenant_id: ticketData.userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_urgent: false,
    is_premium: false,
  };
  
  mockTickets.push(newTicket);
  return newTicket;
}

export async function updateTicketStatus(
  ticketId: string, 
  status: 'open' | 'in_progress' | 'resolved'
): Promise<MaintenanceTicket> {
  // Mock implementation
  console.log('Updating ticket status:', ticketId, 'to', status);
  
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  
  ticket.status = status;
  ticket.updated_at = new Date().toISOString();
  
  return ticket;
}

export async function updateTicketPriority(
  ticketId: string, 
  priority: 'low' | 'medium' | 'high'
): Promise<MaintenanceTicket> {
  // Mock implementation
  console.log('Updating ticket priority:', ticketId, 'to', priority);
  
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  
  ticket.priority = priority;
  ticket.updated_at = new Date().toISOString();
  
  return ticket;
}

export async function assignTicket(
  ticketId: string, 
  assignedTo: string
): Promise<MaintenanceTicket> {
  // Mock implementation
  console.log('Assigning ticket:', ticketId, 'to', assignedTo);
  
  const ticket = mockTickets.find(t => t.id === ticketId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  
  ticket.updated_at = new Date().toISOString();
  
  return ticket;
}

export async function getTicketStats(userId: string): Promise<TicketStats> {
  // Mock implementation
  console.log('Getting ticket stats for user:', userId);
  
  const total = mockTickets.length;
  const byStatus = {
    open: mockTickets.filter(t => t.status === 'open').length,
    in_progress: mockTickets.filter(t => t.status === 'in_progress').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
  };
  const byPriority = {
    low: mockTickets.filter(t => t.priority === 'low').length,
    medium: mockTickets.filter(t => t.priority === 'medium').length,
    high: mockTickets.filter(t => t.priority === 'high').length,
  };
  
  return {
    total,
    byStatus,
    byPriority,
  };
} 