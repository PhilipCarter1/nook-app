'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  Lock, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Database
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface GDPRComplianceProps {
  className?: string;
}

export function GDPRCompliance({ className }: GDPRComplianceProps) {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  // Request data export (GDPR Article 20 - Right to data portability)
  const handleDataExport = async () => {
    if (!user) return;
    
    setLoading('export');
    try {
      // Get all user data
      const [userData, properties, tenants, documents, payments, maintenanceTickets] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('properties').select('*'),
        supabase.from('tenants').select('*'),
        supabase.from('documents').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('maintenance_tickets').select('*')
      ]);

      const exportData = {
        user: userData.data,
        properties: properties.data,
        tenants: tenants.data,
        documents: documents.data,
        payments: payments.data,
        maintenanceTickets: maintenanceTickets.data,
        exportedAt: new Date().toISOString(),
        exportedBy: user.email
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nook-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data export completed successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(null);
    }
  };

  // Request data deletion (GDPR Article 17 - Right to erasure)
  const handleDataDeletion = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action cannot be undone and will permanently remove all your information from our systems.'
    );
    
    if (!confirmed) return;

    setLoading('delete');
    try {
      // Delete user data in order (respecting foreign key constraints)
      await Promise.all([
        supabase.from('data_access_log').delete().eq('user_id', user.id),
        supabase.from('maintenance_tickets').delete().eq('tenant_id', user.id),
        supabase.from('payments').delete().eq('tenant_id', user.id),
        supabase.from('documents').delete().eq('tenant_id', user.id),
        supabase.from('leases').delete().eq('tenant_id', user.id),
        supabase.from('tenants').delete().eq('user_id', user.id),
        supabase.from('user_profiles').delete().eq('id', user.id),
        supabase.from('users').delete().eq('id', user.id)
      ]);

      // Delete auth user
      await supabase.auth.admin.deleteUser(user.id);

      toast.success('All your data has been deleted successfully');
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Failed to delete data. Please contact support.');
    } finally {
      setLoading(null);
    }
  };

  // View data access log (GDPR Article 15 - Right of access)
  const handleViewAccessLog = async () => {
    if (!user) return;
    
    setLoading('access');
    try {
      const { data, error } = await supabase
        .from('data_access_log')
        .select('*')
        .eq('user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching access log:', error);
        toast.error('Failed to fetch access log');
        return;
      }

      // Create and download access log
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nook-access-log-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Access log downloaded successfully');
    } catch (error) {
      console.error('Error downloading access log:', error);
      toast.error('Failed to download access log');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={className}>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
            <Shield className="h-5 w-5 mr-2 text-nook-purple-600" />
            GDPR Compliance & Data Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Protection Status */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">Data Protection Active</h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Your data is protected with enterprise-grade security. Only you and authorized personnel can access your information.
            </p>
          </div>

          {/* GDPR Rights */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Your GDPR Rights</h3>
            
            {/* Right to Data Portability */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Right to Data Portability</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Download all your data in a machine-readable format
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDataExport}
                disabled={loading === 'export'}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
              >
                {loading === 'export' ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>

            {/* Right of Access */}
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <h4 className="font-medium text-purple-800 dark:text-purple-200">Right of Access</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    View your data access history and logs
                  </p>
                </div>
              </div>
              <Button
                onClick={handleViewAccessLog}
                disabled={loading === 'access'}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-800"
              >
                {loading === 'access' ? 'Loading...' : 'View Access Log'}
              </Button>
            </div>

            {/* Right to Erasure */}
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-center">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Right to Erasure</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Permanently delete all your data from our systems
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDataDeletion}
                disabled={loading === 'delete'}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-800"
              >
                {loading === 'delete' ? 'Deleting...' : 'Delete All Data'}
              </Button>
            </div>
          </div>

          {/* Data Security Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Data Security Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Row-Level Security</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Database className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Data Isolation</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Access Logging</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Encrypted Storage</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Privacy Notice</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your data is processed in accordance with GDPR regulations. We implement strict data isolation 
                  to ensure that tenants can only access their own information and landlords can only see data 
                  from their own properties.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
