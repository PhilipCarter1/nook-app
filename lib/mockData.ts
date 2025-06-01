import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type Property = Database['public']['Tables']['properties']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'tenant@example.com',
    name: 'John Tenant',
    role: 'tenant',
    property_id: '1',
    avatar_url: null,
    phone: '+1234567890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'landlord@example.com',
    name: 'Jane Landlord',
    role: 'landlord',
    property_id: null,
    avatar_url: null,
    phone: '+1234567891',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    property_id: null,
    avatar_url: null,
    phone: '+1234567892',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Properties',
    config: {
      features: {
        legalAssistant: true,
        concierge: false,
        customBranding: true,
      },
      branding: {
        primaryColor: '#8b5cf6',
        logo: '/logos/acme.png',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Downtown Apartments',
    address: '123 Main St, New York, NY 10001',
    landlord_id: '2',
    type: 'apartment',
    units: 20,
    status: 'available',
    monthly_rent: 2500,
    security_deposit: 1000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Riverside Condos',
    address: '456 River Rd, New York, NY 10002',
    landlord_id: '2',
    type: 'condo',
    units: 10,
    status: 'available',
    monthly_rent: 3200,
    security_deposit: 1200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
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
    updated_at: new Date().toISOString(),
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
    updated_at: new Date().toISOString(),
  },
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
    updated_at: new Date().toISOString(),
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
    updated_at: new Date().toISOString(),
  },
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
    updated_at: new Date().toISOString(),
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
    updated_at: new Date().toISOString(),
  },
]; 