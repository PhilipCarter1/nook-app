'use client';

import React from 'react';
import { TenantOnly } from '@/components/guards/RoleGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  FileText, 
  Wrench, 
  CreditCard, 
  Settings,
  Calendar,
  DollarSign,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

export default function TenantDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <TenantOnly>
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
                    <h1 className="text-2xl font-bold text-nook-purple-700 dark:text-nook-purple-300">Tenant Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your rental experience</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700">
                  Tenant
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
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-nook-purple-700 dark:text-nook-purple-300 mb-3">
                  Welcome back, {user?.user_metadata?.full_name || user?.email || 'Tenant'}!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                  Here's everything you need to know about your rental property.
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                    <Home className="h-4 w-4 mr-1" />
                    Current Tenant
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    <Calendar className="h-4 w-4 mr-1" />
                    Rent Due: 15th
                  </Badge>
                  <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Good Standing
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-nook-purple-100 dark:bg-nook-purple-900 rounded-lg flex items-center justify-center mr-4">
                    <Home className="h-6 w-6 text-nook-purple-600 dark:text-nook-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Rent</p>
                    <p className="text-2xl font-bold text-nook-purple-700 dark:text-nook-purple-300">$2,400</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Until Rent Due</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tickets</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documents</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Information */}
          <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-nook-purple-700 dark:text-nook-purple-300">Your Property</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Home className="h-5 w-5 text-nook-purple-600 dark:text-nook-purple-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sunset Apartments - Unit 3A</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">123 Sunset Blvd, Los Angeles, CA 90210</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Property Details</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2 Bedrooms • 2 Bathrooms • 1,200 sq ft</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Lease Term</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Jan 1, 2024 - Dec 31, 2024</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Monthly Rent</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">$2,400 due on the 1st of each month</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Property Manager</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sarah Johnson • (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Contact</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">sarah.johnson@nook.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/payments')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Pay Rent</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Make your monthly rent payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/maintenance')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                    <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Maintenance</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Report maintenance issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white dark:bg-gray-800" onClick={() => router.push('/dashboard/documents')}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Documents</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">View lease and other documents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-nook-purple-700 dark:text-nook-purple-300">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Rent Payment Successful</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">$2,400 rent payment processed for January 2024</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Maintenance Request Submitted</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Kitchen sink leak reported - Ticket #MT-2024-001</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Document Uploaded</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Updated proof of income submitted</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Maintenance Update</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Plumber scheduled for tomorrow between 9 AM - 12 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TenantOnly>
  );
}
