// Database type definitions for Supabase
export interface Database {
  public: {
    Tables: {
      financial_transactions: {
        Row: {
          id: string;
          property_id: string;
          unit_id?: string;
          tenant_id?: string;
          type: 'income' | 'expense' | 'transfer';
          category: string;
          amount: number;
          description?: string;
          date: string;
          status: 'pending' | 'completed' | 'failed' | 'reversed';
          payment_method?: string;
          reference_number?: string;
          attachments?: string[];
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          unit_id?: string;
          tenant_id?: string;
          type: 'income' | 'expense' | 'transfer';
          category: string;
          amount: number;
          description?: string;
          date: string;
          status?: 'pending' | 'completed' | 'failed' | 'reversed';
          payment_method?: string;
          reference_number?: string;
          attachments?: string[];
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          unit_id?: string;
          tenant_id?: string;
          type?: 'income' | 'expense' | 'transfer';
          category?: string;
          amount?: number;
          description?: string;
          date?: string;
          status?: 'pending' | 'completed' | 'failed' | 'reversed';
          payment_method?: string;
          reference_number?: string;
          attachments?: string[];
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_reports: {
        Row: {
          id: string;
          property_id: string;
          type: 'monthly' | 'quarterly' | 'annual' | 'custom';
          start_date: string;
          end_date: string;
          data: Record<string, any>;
          status: 'draft' | 'final' | 'archived';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          type: 'monthly' | 'quarterly' | 'annual' | 'custom';
          start_date: string;
          end_date: string;
          data: Record<string, any>;
          status?: 'draft' | 'final' | 'archived';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          type?: 'monthly' | 'quarterly' | 'annual' | 'custom';
          start_date?: string;
          end_date?: string;
          data?: Record<string, any>;
          status?: 'draft' | 'final' | 'archived';
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_metrics: {
        Row: {
          id: string;
          property_id: string;
          date: string;
          occupancy_rate?: number;
          rental_yield?: number;
          maintenance_costs?: number;
          operating_expenses?: number;
          net_operating_income?: number;
          cap_rate?: number;
          market_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          date: string;
          occupancy_rate?: number;
          rental_yield?: number;
          maintenance_costs?: number;
          operating_expenses?: number;
          net_operating_income?: number;
          cap_rate?: number;
          market_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          date?: string;
          occupancy_rate?: number;
          rental_yield?: number;
          maintenance_costs?: number;
          operating_expenses?: number;
          net_operating_income?: number;
          cap_rate?: number;
          market_value?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 