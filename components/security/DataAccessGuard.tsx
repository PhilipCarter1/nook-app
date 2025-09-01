'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';

interface DataAccessContextType {
  canAccessProperty: (propertyId: string) => Promise<boolean>;
  canAccessTenant: (tenantId: string) => Promise<boolean>;
  canAccessDocument: (documentId: string) => Promise<boolean>;
  canAccessPayment: (paymentId: string) => Promise<boolean>;
  canAccessMaintenanceTicket: (ticketId: string) => Promise<boolean>;
  getUserProperties: () => Promise<string[]>;
  getUserTenants: () => Promise<string[]>;
  logDataAccess: (tableName: string, operation: string, recordId?: string) => Promise<void>;
}

const DataAccessContext = createContext<DataAccessContextType | null>(null);

export function DataAccessProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  // Check if user can access a specific property
  const canAccessProperty = async (propertyId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .single();

      if (error || !data) return false;
      
      // If we can query it, RLS policies ensure we have access
      return true;
    } catch (error) {
      console.error('Error checking property access:', error);
      return false;
    }
  };

  // Check if user can access a specific tenant
  const canAccessTenant = async (tenantId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .single();

      if (error || !data) return false;
      
      // If we can query it, RLS policies ensure we have access
      return true;
    } catch (error) {
      console.error('Error checking tenant access:', error);
      return false;
    }
  };

  // Check if user can access a specific document
  const canAccessDocument = async (documentId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id')
        .eq('id', documentId)
        .single();

      if (error || !data) return false;
      
      // If we can query it, RLS policies ensure we have access
      return true;
    } catch (error) {
      console.error('Error checking document access:', error);
      return false;
    }
  };

  // Check if user can access a specific payment
  const canAccessPayment = async (paymentId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id')
        .eq('id', paymentId)
        .single();

      if (error || !data) return false;
      
      // If we can query it, RLS policies ensure we have access
      return true;
    } catch (error) {
      console.error('Error checking payment access:', error);
      return false;
    }
  };

  // Check if user can access a specific maintenance ticket
  const canAccessMaintenanceTicket = async (ticketId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select('id')
        .eq('id', ticketId)
        .single();

      if (error || !data) return false;
      
      // If we can query it, RLS policies ensure we have access
      return true;
    } catch (error) {
      console.error('Error checking maintenance ticket access:', error);
      return false;
    }
  };

  // Get all properties the user can access
  const getUserProperties = async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id');

      if (error) {
        console.error('Error fetching user properties:', error);
        return [];
      }

      return data?.map(p => p.id) || [];
    } catch (error) {
      console.error('Error fetching user properties:', error);
      return [];
    }
  };

  // Get all tenants the user can access
  const getUserTenants = async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id');

      if (error) {
        console.error('Error fetching user tenants:', error);
        return [];
      }

      return data?.map(t => t.id) || [];
    } catch (error) {
      console.error('Error fetching user tenants:', error);
      return [];
    }
  };

  // Log data access for GDPR compliance
  const logDataAccess = async (tableName: string, operation: string, recordId?: string): Promise<void> => {
    if (!user) return;
    
    try {
      await supabase
        .from('data_access_log')
        .insert({
          user_id: user.id,
          table_name: tableName,
          operation: operation,
          record_id: recordId,
          ip_address: null, // Will be filled by database trigger
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging data access:', error);
    }
  };

  const value: DataAccessContextType = {
    canAccessProperty,
    canAccessTenant,
    canAccessDocument,
    canAccessPayment,
    canAccessMaintenanceTicket,
    getUserProperties,
    getUserTenants,
    logDataAccess
  };

  return (
    <DataAccessContext.Provider value={value}>
      {children}
    </DataAccessContext.Provider>
  );
}

export function useDataAccess() {
  const context = useContext(DataAccessContext);
  if (!context) {
    throw new Error('useDataAccess must be used within a DataAccessProvider');
  }
  return context;
}

// Higher-order component for protecting data access
export function withDataAccess<T extends object>(
  Component: React.ComponentType<T>,
  requiredAccess: {
    propertyId?: string;
    tenantId?: string;
    documentId?: string;
    paymentId?: string;
    maintenanceTicketId?: string;
  }
) {
  return function ProtectedComponent(props: T) {
    const { user } = useAuth();
    const dataAccess = useDataAccess();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAccess = async () => {
        if (!user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        try {
          let access = true;

          if (requiredAccess.propertyId) {
            access = access && await dataAccess.canAccessProperty(requiredAccess.propertyId);
          }

          if (requiredAccess.tenantId) {
            access = access && await dataAccess.canAccessTenant(requiredAccess.tenantId);
          }

          if (requiredAccess.documentId) {
            access = access && await dataAccess.canAccessDocument(requiredAccess.documentId);
          }

          if (requiredAccess.paymentId) {
            access = access && await dataAccess.canAccessPayment(requiredAccess.paymentId);
          }

          if (requiredAccess.maintenanceTicketId) {
            access = access && await dataAccess.canAccessMaintenanceTicket(requiredAccess.maintenanceTicketId);
          }

          setHasAccess(access);
        } catch (error) {
          console.error('Error checking data access:', error);
          setHasAccess(false);
        } finally {
          setLoading(false);
        }
      };

      checkAccess();
    }, [user, dataAccess]);

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
        </div>
      );
    }

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this data.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
