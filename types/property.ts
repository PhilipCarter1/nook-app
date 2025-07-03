export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string;
  units: number;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  tenants?: Array<{
    id: string;
    userId: string;
    unitId: string;
    email: string;
    leaseStart: string;
    leaseEnd: string;
    status: string;
  }>;
  maintenance_requests?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  documents?: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    status: string;
  }>;
}

export interface PropertyFormData {
  name: string;
  address: string;
  units: number;
  status: string;
  images?: string[];
}

export interface PropertyFilters {
  owner_id?: string;
  status?: string;
  property_type?: string;
  min_rent?: number;
  max_rent?: number;
  location?: string;
  organization_id?: string;
} 