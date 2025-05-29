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
export type UserWithAuth = User & SupabaseUser; 