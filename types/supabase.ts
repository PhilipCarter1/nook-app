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
          name: string
          role: 'tenant' | 'landlord' | 'admin' | 'super'
          property_id: string | null
          avatar_url: string | null
          phone: string | null
          email_verified: boolean
          last_login: string | null
          password_reset_token: string | null
          password_reset_expires: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'tenant' | 'landlord' | 'admin' | 'super'
          property_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          last_login?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'tenant' | 'landlord' | 'admin' | 'super'
          property_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          last_login?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          name: string
          address: string
          type: 'apartment' | 'house' | 'condo' | 'commercial'
          units: number
          landlord_id: string
          status: 'available' | 'leased' | 'maintenance'
          monthly_rent: number
          security_deposit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          type: 'apartment' | 'house' | 'condo' | 'commercial'
          units: number
          landlord_id: string
          status?: 'available' | 'leased' | 'maintenance'
          monthly_rent: number
          security_deposit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          type?: 'apartment' | 'house' | 'condo' | 'commercial'
          units?: number
          landlord_id?: string
          status?: 'available' | 'leased' | 'maintenance'
          monthly_rent?: number
          security_deposit?: number
          created_at?: string
          updated_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          status: 'pending' | 'active' | 'expired' | 'terminated'
          monthly_rent: number
          security_deposit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          status?: 'pending' | 'active' | 'expired' | 'terminated'
          monthly_rent: number
          security_deposit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string
          start_date?: string
          end_date?: string
          status?: 'pending' | 'active' | 'expired' | 'terminated'
          monthly_rent?: number
          security_deposit?: number
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_tickets: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          title: string
          description: string
          status: 'open' | 'in_progress' | 'resolved'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id: string
          title: string
          description: string
          status?: 'open' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string
          title?: string
          description?: string
          status?: 'open' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          lease_id: string
          amount: number
          type: 'rent' | 'deposit' | 'maintenance'
          status: 'pending' | 'completed' | 'failed'
          due_date: string
          paid_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lease_id: string
          amount: number
          type: 'rent' | 'deposit' | 'maintenance'
          status?: 'pending' | 'completed' | 'failed'
          due_date: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lease_id?: string
          amount?: number
          type?: 'rent' | 'deposit' | 'maintenance'
          status?: 'pending' | 'completed' | 'failed'
          due_date?: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          type: 'lease' | 'maintenance' | 'payment' | 'other'
          url: string
          property_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'lease' | 'maintenance' | 'payment' | 'other'
          url: string
          property_id: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'lease' | 'maintenance' | 'payment' | 'other'
          url?: string
          property_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'payment' | 'maintenance' | 'lease' | 'system'
          title: string
          message: string
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'payment' | 'maintenance' | 'lease' | 'system'
          title: string
          message: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'payment' | 'maintenance' | 'lease' | 'system'
          title?: string
          message?: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      property_amenities: {
        Row: {
          id: string
          property_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_media: {
        Row: {
          id: string
          property_id: string
          type: 'image' | 'video' | 'document'
          url: string
          title: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          type: 'image' | 'video' | 'document'
          url: string
          title?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          type?: 'image' | 'video' | 'document'
          url?: string
          title?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lease_documents: {
        Row: {
          id: string
          lease_id: string
          version: number
          document_url: string
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          created_by: string
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lease_id: string
          version: number
          document_url: string
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_by: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lease_id?: string
          version?: number
          document_url?: string
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_by?: string
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lease_renewals: {
        Row: {
          id: string
          lease_id: string
          new_start_date: string
          new_end_date: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lease_id: string
          new_start_date: string
          new_end_date: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lease_id?: string
          new_start_date?: string
          new_end_date?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_schedule: {
        Row: {
          id: string
          property_id: string
          title: string
          description: string | null
          frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          last_performed: string | null
          next_due: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          title: string
          description?: string | null
          frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          last_performed?: string | null
          next_due?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          title?: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
          last_performed?: string | null
          next_due?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_history: {
        Row: {
          id: string
          schedule_id: string
          performed_by: string
          performed_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          performed_by: string
          performed_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          performed_by?: string
          performed_at?: string
          notes?: string | null
          created_at?: string
        }
      }
      payment_receipts: {
        Row: {
          id: string
          payment_id: string
          receipt_number: string
          receipt_url: string
          created_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          receipt_number: string
          receipt_url: string
          created_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          receipt_number?: string
          receipt_url?: string
          created_at?: string
        }
      }
      late_fees: {
        Row: {
          id: string
          payment_id: string
          amount: number
          days_late: number
          status: 'pending' | 'paid' | 'waived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          amount: number
          days_late: number
          status?: 'pending' | 'paid' | 'waived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          amount?: number
          days_late?: number
          status?: 'pending' | 'paid' | 'waived'
          created_at?: string
          updated_at?: string
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
      user_role: 'tenant' | 'landlord' | 'admin' | 'super'
      property_type: 'apartment' | 'house' | 'condo' | 'commercial'
      property_status: 'available' | 'leased' | 'maintenance'
      lease_status: 'pending' | 'active' | 'expired' | 'terminated'
      maintenance_status: 'open' | 'in_progress' | 'resolved'
      maintenance_priority: 'low' | 'medium' | 'high'
      payment_type: 'rent' | 'deposit' | 'maintenance'
      payment_status: 'pending' | 'completed' | 'failed'
      document_type: 'lease' | 'maintenance' | 'payment' | 'other'
      notification_type: 'payment' | 'maintenance' | 'lease' | 'system'
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