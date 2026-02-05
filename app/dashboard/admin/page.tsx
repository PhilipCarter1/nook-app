'use client';

import React from 'react';
import { AdminOnly } from '@/components/guards/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  CreditCard, 
  Settings,
  DollarSign,
  BarChart,
  AlertCircle,
  Shield,
  Zap,
  Activity,
  Globe,
  Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <AdminOnly>
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
                    <h1 className="text-2xl font-bold text-nook-purple-700 dark:text-nook-purple-300">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">System administration and oversight</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700">
                  Admin
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
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-nook-purple-700 dark:text-nook-purple-300 mb-3">
                  Welcome back, {user?.user_metadata?.full_name || user?.email || 'Administrator'}!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                  System overview and administrative controls for the Nook platform.
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
                    <Shield className="h-4 w-4 mr-1" />
                    System Admin
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    <Database className="h-4 w-4 mr-1" />
                    Full Access
                  </Badge>
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                    <Activity className="h-4 w-4 mr-1" />
                    Monitoring
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-nook-purple-100 dark:bg-nook-purple-900 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-nook-purple-600 dark:text-nook-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-nook-purple-700 dark:text-nook-purple-300">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Properties</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">342</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">$2.1M</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                    <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">89</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/admin/users')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-nook-purple-100 dark:bg-nook-purple-900 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-nook-purple-600 dark:text-nook-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">User Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage all users and permissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/admin/properties')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                    <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Property Overview</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">View all properties in the system</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/admin/analytics')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">System Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Platform performance and metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/admin/settings')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
                    <Settings className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">System Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Configure platform settings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/admin/security')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Security</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Security monitoring and logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/admin/billing')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Billing Overview</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Platform revenue and billing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-nook-purple-700 dark:text-nook-purple-300">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Database</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">All systems operational</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">API Services</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">99.9% uptime</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Security</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">No threats detected</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Performance</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Average response time: 120ms</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Alerts</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">3 pending notifications</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Storage</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">67% of capacity used</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnly>
  );
} 