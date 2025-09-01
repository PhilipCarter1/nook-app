// Comprehensive type definitions for Nook property management platform

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  email_verified?: boolean;
  created_at: Date;
  updated_at: Date;
  last_sign_in_at?: Date;
  organization_id?: string;
}

export type UserRole = 'tenant' | 'landlord' | 'property_manager' | 'admin' | 'super';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
    timezone: string;
  };
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// PROPERTY TYPES
// ============================================================================

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  type: PropertyType;
  units: number;
  status: PropertyStatus;
  monthly_rent: number;
  security_deposit: number;
  description?: string;
  amenities: string[];
  images: string[];
  owner_id: string;
  manager_id?: string;
  created_at: Date;
  updated_at: Date;
}

export type PropertyType = 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial';
export type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'off_market';

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: UnitStatus;
  monthly_rent: number;
  security_deposit: number;
  amenities: string[];
  images: string[];
  current_tenant_id?: string;
  created_at: Date;
  updated_at: Date;
}

export type UnitStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

// ============================================================================
// LEASE TYPES
// ============================================================================

export interface Lease {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  security_deposit: number;
  status: LeaseStatus;
  terms: string;
  documents: string[];
  created_at: Date;
  updated_at: Date;
  signed_at?: Date;
  terminated_at?: Date;
}

export type LeaseStatus = 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'renewed';

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface Payment {
  id: string;
  lease_id: string;
  tenant_id: string;
  property_id: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  due_date: Date;
  paid_at?: Date;
  stripe_payment_id?: string;
  stripe_customer_id?: string;
  receipt_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type PaymentType = 'rent' | 'deposit' | 'late_fee' | 'maintenance' | 'utility' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer' | 'check' | 'cash';

export interface PaymentMethodConfig {
  id: string;
  user_id: string;
  type: PaymentMethod;
  is_default: boolean;
  details: {
    card_last4?: string;
    card_brand?: string;
    bank_name?: string;
    account_last4?: string;
    minimumAmount?: number;
    maximumAmount?: number;
    fees?: {
      type: 'percentage' | 'fixed';
      amount: number;
    };
  };
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// MAINTENANCE TYPES
// ============================================================================

export interface MaintenanceTicket {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  category: MaintenanceCategory;
  assigned_to?: string;
  scheduled_date?: Date;
  scheduled_time_slot?: string;
  estimated_cost?: number;
  actual_cost?: number;
  is_urgent: boolean;
  is_premium: boolean;
  images: string[];
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';
export type MaintenanceStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'scheduled';
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'hvac' | 'structural' | 'appliance' | 'pest_control' | 'cleaning' | 'other';

export interface MaintenanceComment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  attachments: string[];
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  file_url: string;
  file_size: number;
  mime_type: string;
  property_id?: string;
  unit_id?: string;
  tenant_id?: string;
  lease_id?: string;
  uploaded_by: string;
  status: DocumentStatus;
  tags: string[];
  metadata: {
    page_count?: number;
    word_count?: number;
    extracted_fields?: Record<string, string>;
  };
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export type DocumentType = 'pdf' | 'image' | 'word' | 'excel' | 'other';
export type DocumentCategory = 'lease' | 'application' | 'maintenance' | 'payment' | 'insurance' | 'utility' | 'other';
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: DocumentVariable[];
  metadata: {
    category: string;
    tags: string[];
    required_signatures: string[];
    expiration_days: number;
  };
  created_at: Date;
  updated_at: Date;
}

export interface DocumentVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'select';
  required: boolean;
  options?: string[];
}

// ============================================================================
// APPLICATION TYPES
// ============================================================================

export interface Application {
  id: string;
  property_id: string;
  unit_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  employment_info: {
    employer: string;
    position: string;
    income: number;
    start_date: Date;
  };
  personal_info: {
    date_of_birth: Date;
    ssn?: string;
    emergency_contact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  move_in_date: Date;
  additional_info?: string;
  documents: string[];
  created_at: Date;
  updated_at: Date;
  approved_at?: Date;
  rejected_at?: Date;
  rejection_reason?: string;
}

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

export type NotificationType = 'maintenance' | 'payment' | 'lease' | 'message' | 'document' | 'workflow' | 'reminder';

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  attachments: string[];
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Conversation {
  id: string;
  participants: string[];
  subject?: string;
  last_message_id?: string;
  last_message_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  website?: string;
  logo_url?: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  created_at: Date;
  updated_at: Date;
}

export type SubscriptionPlan = 'free' | 'basic' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  permissions: string[];
  invited_by: string;
  invited_at: Date;
  joined_at?: Date;
  status: 'pending' | 'active' | 'inactive';
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormData {
  [key: string]: string | number | boolean | Date | File | null;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T = FormData> {
  data: T;
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  type: EventType;
  property_id?: string;
  unit_id?: string;
  tenant_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export type EventType = 'maintenance' | 'inspection' | 'showing' | 'move_in' | 'move_out' | 'other';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// All types are already exported individually above 