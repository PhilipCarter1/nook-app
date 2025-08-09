'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Wrench, 
  DollarSign, 
  Bell, 
  Activity, 
  AlertCircle, 
  Clock, 
  Settings,
  Shield,
  Zap,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface ActivityItem {
  id: string;
  type: 'property' | 'tenant' | 'maintenance' | 'payment' | 'document';
  action: string;
  description: string;
  timestamp: string;
  user: string;
  link?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 12,
    totalTenants: 24,
    pendingMaintenance: 3,
    totalRevenue: 75000,
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      // Simulate user data for now
      setUser({
        id: '1',
        email: 'admin@nook.com',
        name: 'Admin User',
        role: 'admin'
      });

      // Simulate notifications with links
      setNotifications([
        {
          id: '1',
          type: 'info',
          title: 'New Property Added',
          message: 'Property "Sunset Apartments" has been added to the system',
          timestamp: '2 hours ago',
          read: false,
          link: '/dashboard/properties'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Maintenance Request',
          message: 'New maintenance request for Unit 3B at Downtown Lofts',
          timestamp: '4 hours ago',
          read: false,
          link: '/dashboard/maintenance'
        },
        {
          id: '3',
          type: 'success',
          title: 'Payment Received',
          message: 'Rent payment received for Unit 1A at Riverside Complex',
          timestamp: '6 hours ago',
          read: true,
          link: '/dashboard/payments'
        },
        {
          id: '4',
          type: 'info',
          title: 'New Tenant Onboarded',
          message: 'Sarah Johnson has been successfully onboarded',
          timestamp: '1 day ago',
          read: true,
          link: '/dashboard/tenants'
        }
      ]);

      // Simulate recent activity with links
      setRecentActivity([
        {
          id: '1',
          type: 'property',
          action: 'Property Added',
          description: 'Sunset Apartments was added to the portfolio',
          timestamp: '2 hours ago',
          user: 'Admin User',
          link: '/dashboard/properties'
        },
        {
          id: '2',
          type: 'maintenance',
          action: 'Maintenance Request',
          description: 'New ticket created for Unit 3B - Leaky faucet',
          timestamp: '4 hours ago',
          user: 'John Smith',
          link: '/dashboard/maintenance'
        },
        {
          id: '3',
          type: 'payment',
          action: 'Payment Received',
          description: 'Rent payment of $2,500 received for Unit 1A',
          timestamp: '6 hours ago',
          user: 'Sarah Johnson',
          link: '/dashboard/payments'
        },
        {
          id: '4',
          type: 'tenant',
          action: 'Tenant Onboarded',
          description: 'New tenant Sarah Johnson added to Riverside Complex',
          timestamp: '1 day ago',
          user: 'Admin User',
          link: '/dashboard/tenants'
        },
        {
          id: '5',
          type: 'document',
          action: 'Document Uploaded',
          description: 'Lease agreement uploaded for Unit 2C',
          timestamp: '2 days ago',
          user: 'Admin User',
          link: '/dashboard/documents'
        }
      ]);
    };

    checkAuthAndLoadData();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building className="h-5 w-5 text-blue-500" />;
      case 'tenant':
        return <Users className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-pink-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link);
    } else {
      toast.info(`Notification: ${notification.title}`);
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.link) {
      router.push(activity.link);
    } else {
      toast.info(`Activity: ${activity.action}`);
    }
  };

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'properties':
        router.push('/dashboard/properties');
        break;
      case 'tenants':
        router.push('/dashboard/tenants');
        break;
      case 'maintenance':
        router.push('/dashboard/maintenance');
        break;
      case 'revenue':
        router.push('/dashboard/analytics');
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-property':
        router.push('/dashboard/properties');
        toast.info('Navigate to Properties page to add a new property');
        break;
      case 'onboard-tenant':
        router.push('/dashboard/tenants');
        toast.info('Navigate to Tenants page to onboard a new tenant');
        break;
      case 'create-ticket':
        router.push('/dashboard/maintenance');
        toast.info('Navigate to Maintenance page to create a new ticket');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Full system control and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/settings')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
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
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-gray-600 mb-6 text-lg">Full system access and administrative controls at your fingertips.</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Access
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Full Control
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 px-4 py-2">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  System Management
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview - Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-blue-100 hover:to-blue-200" 
            onClick={() => handleStatsCardClick('properties')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Properties</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalProperties}</p>
                  <p className="text-xs text-blue-600 mt-1">+2 this month</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-green-100 hover:to-green-200" 
            onClick={() => handleStatsCardClick('tenants')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Total Tenants</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalTenants}</p>
                  <p className="text-xs text-green-600 mt-1">+5 this month</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-orange-100 hover:to-orange-200" 
            onClick={() => handleStatsCardClick('maintenance')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Pending Maintenance</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.pendingMaintenance}</p>
                  <p className="text-xs text-orange-600 mt-1">-1 from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-purple-100 hover:to-purple-200" 
            onClick={() => handleStatsCardClick('revenue')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-900">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 mt-1">+12% this month</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notifications - Clickable */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Bell className="h-5 w-5 mr-2 text-nook-purple-600" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity - Clickable */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold">
                <Activity className="h-5 w-5 mr-2 text-nook-purple-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      activity.type === 'maintenance' 
                        ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' 
                        : activity.type === 'payment' 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : activity.type === 'property' 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                        : activity.type === 'tenant' 
                        ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">{activity.user}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tiles */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Building className="h-5 w-5 mr-2 text-nook-purple-600" />
              Dashboard Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Properties Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200" onClick={() => router.push('/dashboard/properties')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Properties</h3>
                      <p className="text-gray-600 text-sm">Manage your properties</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Tenants Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200" onClick={() => router.push('/dashboard/tenants')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Tenants</h3>
                      <p className="text-gray-600 text-sm">Manage tenant information</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200" onClick={() => router.push('/dashboard/maintenance')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Maintenance</h3>
                      <p className="text-gray-600 text-sm">Track and manage maintenance requests</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Payments Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200" onClick={() => router.push('/dashboard/payments')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Payments</h3>
                      <p className="text-gray-600 text-sm">Manage rent and other payments</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200" onClick={() => router.push('/dashboard/analytics')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Analytics</h3>
                      <p className="text-gray-600 text-sm">View performance insights</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Documents Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200" onClick={() => router.push('/dashboard/documents')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">Documents</h3>
                      <p className="text-gray-600 text-sm">Manage documents and contracts</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-pink-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Functional Buttons */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Zap className="h-5 w-5 mr-2 text-nook-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-12 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => handleQuickAction('add-property')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
              <Button 
                variant="outline" 
                className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white"
                onClick={() => handleQuickAction('onboard-tenant')}
              >
                <Users className="h-4 w-4 mr-2" />
                Onboard Tenant
              </Button>
              <Button 
                variant="outline" 
                className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white"
                onClick={() => handleQuickAction('create-ticket')}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 