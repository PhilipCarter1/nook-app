import { User as SupabaseUser } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          floor: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          rent_amount: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          floor: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          rent_amount: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          floor?: number
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          rent_amount?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date: string
          rent_amount: number
          security_deposit: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date: string
          rent_amount: number
          security_deposit: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          tenant_id?: string
          start_date?: string
          end_date?: string
          rent_amount?: number
          security_deposit?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_tickets: {
        Row: {
          id: string
          unit_id: string
          tenant_id: string
          title: string
          description: string
          priority: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          tenant_id: string
          title: string
          description: string
          priority: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          tenant_id?: string
          title?: string
          description?: string
          priority?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_comments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          comment: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          comment: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          comment?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          type: string
          url: string
          size: number
          mime_type: string
          related_id: string
          related_type: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          url: string
          size: number
          mime_type: string
          related_id: string
          related_type: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          url?: string
          size?: number
          mime_type?: string
          related_id?: string
          related_type?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          lease_id: string
          amount: number
          type: string
          status: string
          due_date: string
          paid_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lease_id: string
          amount: number
          type: string
          status?: string
          due_date: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lease_id?: string
          amount?: number
          type?: string
          status?: string
          due_date?: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          type: string
          contact_name: string
          contact_email: string
          contact_phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          contact_name: string
          contact_email: string
          contact_phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          contact_name?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          count?: number
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          details: Json
          ip_address: string
          user_agent: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          details: Json
          ip_address: string
          user_agent: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          details?: Json
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type User = Database['public']['Tables']['users']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type Lease = Database['public']['Tables']['leases']['Row'];
export type MaintenanceTicket = Database['public']['Tables']['maintenance_tickets']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type PropertyAmenity = Database['public']['Tables']['property_amenities']['Row'];
export type PropertyMedia = Database['public']['Tables']['property_media']['Row'];
export type LeaseDocument = Database['public']['Tables']['lease_documents']['Row'];
export type LeaseRenewal = Database['public']['Tables']['lease_renewals']['Row'];
export type MaintenanceSchedule = Database['public']['Tables']['maintenance_schedule']['Row'];
export type MaintenanceHistory = Database['public']['Tables']['maintenance_history']['Row'];
export type PaymentReceipt = Database['public']['Tables']['payment_receipts']['Row'];
export type LateFee = Database['public']['Tables']['late_fees']['Row'];
export type UserWithAuth = User & SupabaseUser; 