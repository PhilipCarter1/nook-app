'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Home, 
  Building, 
  Users, 
  FileText, 
  Wrench, 
  CreditCard, 
  Settings,
  Plus,
  Calendar,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/login');
          return;
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(userProfile);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to Nook</h1>
              <p className="text-gray-600">Your property management platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{user?.role || 'User'}</Badge>
              <Button variant="outline" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.name || 'User'}!</h2>
              <p className="text-gray-600 mb-4">Your Nook account is ready. Start managing your properties.</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Zap className="h-4 w-4 mr-1" />
                  Fast
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/properties')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-6 w-6 text-nook-purple-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Properties</h3>
                  <p className="text-sm text-gray-600">Manage your properties</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast.info('Coming soon!')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Tenants</h3>
                  <p className="text-sm text-gray-600">Manage tenant information</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast.info('Coming soon!')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wrench className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Maintenance</h3>
                  <p className="text-sm text-gray-600">Track maintenance requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast.info('Coming soon!')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Payments</h3>
                  <p className="text-sm text-gray-600">Manage rent and payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast.info('Coming soon!')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Documents</h3>
                  <p className="text-sm text-gray-600">Manage leases and documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast.info('Coming soon!')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View property performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-green-800">Account Created</h3>
                  <p className="text-sm text-green-700">Your Nook account is ready to use</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-blue-800">Add Your First Property</h3>
                  <p className="text-sm text-blue-700">Start by adding your properties to the platform</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
} 