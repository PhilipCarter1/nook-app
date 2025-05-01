export type UserRole = 'tenant' | 'landlord' | 'builder_super' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  config: ClientConfig;
  createdAt: string;
  updatedAt: string;
}

export interface ClientConfig {
  features: {
    legalAssistant: boolean;
    concierge: boolean;
    customBranding: boolean;
  };
  branding?: {
    primaryColor: string;
    logo: string;
  };
}

export interface Property {
  id: string;
  clientId: string;
  name: string;
  address: string;
  units: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  assignedTo?: string;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedBy: string;
  approvedBy?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  propertyId: string;
  userId: string;
  type: 'rent' | 'deposit';
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  method: 'stripe' | 'paypal' | 'bank_transfer';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
} 