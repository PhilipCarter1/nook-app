import { Database } from '@/types/supabase';

export const mockUsers: Database['public']['Tables']['users']['Row'][] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    property_id: null,
    avatar_url: 'https://github.com/shadcn.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'landlord@example.com',
    name: 'Landlord User',
    role: 'landlord',
    property_id: '1',
    avatar_url: 'https://github.com/shadcn.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'tenant@example.com',
    name: 'Tenant User',
    role: 'tenant',
    property_id: '1',
    avatar_url: 'https://github.com/shadcn.png',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockProperties: Database['public']['Tables']['properties']['Row'][] = [
  {
    id: '1',
    name: 'Sunset Apartments',
    address: '123 Main St, San Francisco, CA 94105',
    landlord_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ocean View Condos',
    address: '456 Beach Ave, San Francisco, CA 94105',
    landlord_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockTickets: Database['public']['Tables']['maintenance_tickets']['Row'][] = [
  {
    id: '1',
    title: 'Kitchen sink is leaking',
    description: 'The kitchen sink has been leaking for the past 2 days. It\'s causing water to pool under the sink.',
    status: 'open',
    priority: 'high',
    property_id: '1',
    created_by: '3',
    assigned_to: null,
    upvotes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'AC not working properly',
    description: 'The air conditioning unit is making strange noises and not cooling effectively.',
    status: 'in_progress',
    priority: 'medium',
    property_id: '1',
    created_by: '3',
    assigned_to: '2',
    upvotes: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockComments: Database['public']['Tables']['comments']['Row'][] = [
  {
    id: '1',
    ticket_id: '1',
    user_id: '3',
    content: 'This has been happening for a while now. Please fix it soon.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    ticket_id: '1',
    user_id: '2',
    content: 'I\'ll send a plumber tomorrow morning.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]; 