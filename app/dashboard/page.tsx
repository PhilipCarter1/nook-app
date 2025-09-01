'use client';

import React, { useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  FileText, 
  Wrench, 
  CreditCard, 
  Settings,
  Plus,
  Shield,
  Zap,
  TrendingUp,
  BarChart,
  Home,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role) {
      // Redirect to role-specific dashboard
      switch (role) {
        case 'landlord':
        case 'property_manager':
          router.push('/dashboard/landlord');
          break;
        case 'tenant':
          router.push('/dashboard/tenant');
          break;
        case 'admin':
        case 'super':
          router.push('/dashboard/admin');
          break;
        default:
          // Stay on main dashboard
          break;
      }
    }
  }, [role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-nook-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-nook-purple-700 dark:text-nook-purple-300">Nook</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Property Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-nook-purple-100 dark:bg-nook-purple-900 text-nook-purple-800 dark:text-nook-purple-200 border-nook-purple-200 dark:border-nook-purple-700">
                {role || 'User'}
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/settings')}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
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
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-nook-purple-50 to-blue-50 dark:from-nook-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-nook-purple-700 dark:text-nook-purple-300 mb-3">
                Welcome, {user.user_metadata?.full_name || user.email || 'User'}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Your Nook account is ready. Start managing your properties.
              </p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure
                </Badge>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  <Zap className="h-4 w-4 mr-1" />
                  Fast
                </Badge>
                <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-based Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Properties - Available to all */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/properties')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-nook-purple-100 dark:bg-nook-purple-900 rounded-lg flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-nook-purple-600 dark:text-nook-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Properties</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tenants - Landlord/Manager only */}
          {(role === 'landlord' || role === 'property_manager' || role === 'admin') && (
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/tenants')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Tenants</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage tenant information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Maintenance - Available to all */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/maintenance')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                  <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Maintenance</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Track and manage maintenance requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payments - Available to all */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/payments')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Payments</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Manage rent and other payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Documents - Available to all */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/documents')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Documents</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Store and manage important documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Analytics - Landlord/Manager/Admin only */}
          {(role === 'landlord' || role === 'property_manager' || role === 'admin') && (
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/analytics')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                    <BarChart className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Gain insights into your portfolio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Getting Started */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-nook-purple-700 dark:text-nook-purple-300">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Account Created</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">Your Nook account is ready to use</p>
                </div>
              </div>
              
              {(role === 'landlord' || role === 'property_manager') && (
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Add Your First Property</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Start by adding your properties to the platform</p>
                  </div>
                </div>
              )}
              
              {role === 'tenant' && (
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">View Your Property</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Access information about your rental property</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 