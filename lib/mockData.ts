import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Property = Database['public']['Tables']['properties']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'tenant@example.com',
    first_name: 'John',
    last_name: 'Tenant',
    role: 'tenant',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tenant',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    email: 'landlord@example.com',
    first_name: 'Jane',
    last_name: 'Landlord',
    role: 'landlord',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=landlord',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Downtown Apartments',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    owner_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Riverside Condos',
    address: '456 River Rd',
    city: 'New York',
    state: 'NY',
    zip_code: '10002',
    owner_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    lease_id: '1',
    amount: 2500,
    type: 'rent',
    status: 'completed',
    due_date: new Date().toISOString(),
    paid_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    lease_id: '1',
    amount: 5000,
    type: 'deposit',
    status: 'pending',
    due_date: new Date().toISOString(),
    paid_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockMaintenanceTickets = [
  {
    id: '1',
    property_id: '1',
    title: 'Leaking faucet',
    description: 'Kitchen sink faucet is leaking',
    status: 'open',
    priority: 'medium',
    created_by: '1',
    assigned_to: null,
    upvotes: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    property_id: '1',
    title: 'Broken AC',
    description: 'AC unit not cooling properly',
    status: 'in_progress',
    priority: 'high',
    created_by: '1',
    assigned_to: null,
    upvotes: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockDocuments = [
  {
    id: '1',
    property_id: '1',
    name: 'ID Document',
    type: 'id',
    status: 'approved',
    uploaded_by: '1',
    approved_by: '2',
    url: '/documents/id.pdf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    property_id: '1',
    name: 'Proof of Income',
    type: 'income',
    status: 'pending',
    uploaded_by: '1',
    approved_by: null,
    url: '/documents/income.pdf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]; 