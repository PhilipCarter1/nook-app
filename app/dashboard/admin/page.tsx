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
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { PendingDocumentsQueue, PendingDocument } from '@/components/documents/PendingDocumentsQueue';
import { createClient } from '@/lib/supabase/client';

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
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 12,
    totalTenants: 24,
    pendingMaintenance: 3,
    totalRevenue: 75000,
    pendingDocuments: 5
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
        },
        {
          id: '5',
          type: 'warning',
          title: 'Document Expiring',
          message: 'Lease agreement for Unit 2C expires in 30 days',
          timestamp: '2 days ago',
          read: false,
          link: '/dashboard/documents'
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

      // Simulate pending documents
      setPendingDocuments([
        {
          id: 'doc-1',
          name: 'Lease Agreement - Sarah Johnson',
          tenantName: 'Sarah Johnson',
          propertyName: 'Sunset Apartments',
          unitNumber: 'A-101',
          type: 'lease',
          urgency: 'high',
          uploadedAt: '2024-01-15T10:30:00Z',
          status: 'pending'
        },
        {
          id: 'doc-2',
          name: 'ID Verification - Mike Chen',
          tenantName: 'Mike Chen',
          propertyName: 'Sunset Apartments',
          unitNumber: 'B-205',
          type: 'id_verification',
          urgency: 'medium',
          uploadedAt: '2024-01-14T14:20:00Z',
          status: 'pending'
        },
        {
          id: 'doc-3',
          name: 'Income Proof - Emily Rodriguez',
          tenantName: 'Emily Rodriguez',
          propertyName: 'Sunset Apartments',
          unitNumber: 'C-312',
          type: 'income_proof',
          urgency: 'high',
          uploadedAt: '2024-01-13T09:15:00Z',
          status: 'pending'
        },
        {
          id: 'doc-4',
          name: 'Proof of Address - David Kim',
          tenantName: 'David Kim',
          propertyName: 'Sunset Apartments',
          unitNumber: 'A-203',
          type: 'proof_of_address',
          urgency: 'low',
          uploadedAt: '2024-01-12T16:45:00Z',
          status: 'pending'
        },
        {
          id: 'doc-5',
          name: 'References - Lisa Thompson',
          tenantName: 'Lisa Thompson',
          propertyName: 'Sunset Apartments',
          unitNumber: 'B-108',
          type: 'references',
          urgency: 'medium',
          uploadedAt: '2024-01-11T11:30:00Z',
          status: 'pending'
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
      case 'analytics':
        router.push('/dashboard/analytics');
        break;
      default:
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-property':
        router.push('/dashboard/properties');
        toast.info('Navigate to Properties to add a new property');
        break;
      case 'add-tenant':
        router.push('/dashboard/tenants');
        toast.info('Navigate to Tenants to add a new tenant');
        break;
      case 'create-maintenance':
        router.push('/dashboard/maintenance');
        toast.info('Navigate to Maintenance to create a new ticket');
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  };

  // Document approval handlers
  const handleDocumentApprove = async (documentId: string) => {
    try {
      // In a real app, this would call an API to approve the document
      setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setStats(prev => ({ ...prev, pendingDocuments: prev.pendingDocuments - 1 }));
      toast.success('Document approved successfully');
    } catch (error) {
      toast.error('Failed to approve document');
    }
  };

  const handleDocumentReject = async (documentId: string, reason: string) => {
    try {
      // In a real app, this would call an API to reject the document
      setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setStats(prev => ({ ...prev, pendingDocuments: prev.pendingDocuments - 1 }));
      toast.success('Document rejected');
    } catch (error) {
      toast.error('Failed to reject document');
    }
  };

  const handleDocumentRequestChanges = async (documentId: string, changes: string[]) => {
    try {
      // In a real app, this would call an API to request changes
      setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setStats(prev => ({ ...prev, pendingDocuments: prev.pendingDocuments - 1 }));
      toast.success('Changes requested successfully');
    } catch (error) {
      toast.error('Failed to request changes');
    }
  };

  const handleViewDocument = (documentId: string) => {
    // In a real app, this would open the document viewer
    router.push(`/dashboard/documents/${documentId}`);
  };

  // Get limited notifications and activities
  const displayedNotifications = showAllNotifications ? notifications : notifications.slice(0, 3);
  const displayedActivities = showAllActivities ? recentActivity : recentActivity.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-nook-purple-700 dark:text-nook-purple-300">Admin Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Full system control and management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/settings')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    toast.success('Signed out successfully!');
                    router.push('/login');
                  } catch (error) {
                    toast.error('Failed to sign out. Please try again.');
                  }
                }}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                <Shield className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-nook-purple-700 dark:text-nook-purple-300 mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">Full system access and administrative controls at your fingertips.</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 dark:from-red-900/20 dark:to-red-800/20 dark:text-red-300 dark:border-red-600 px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Access
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-300 dark:border-blue-600 px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Full Control
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 dark:from-purple-900/20 dark:to-purple-800/20 dark:text-purple-300 dark:border-purple-600 px-4 py-2">
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
            className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30"
            onClick={() => handleStatsCardClick('properties')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">Total Properties</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalProperties}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+2 this month</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-green-100 hover:to-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:hover:from-green-800/30 dark:hover:to-green-700/30"
            onClick={() => handleStatsCardClick('tenants')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300 mb-1">Total Tenants</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalTenants}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+5 this month</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-orange-100 hover:to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30"
            onClick={() => handleStatsCardClick('maintenance')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-300 mb-1">Pending Maintenance</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingMaintenance}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">3 open tickets</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-purple-100 hover:to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30"
            onClick={() => handleStatsCardClick('analytics')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+12% this month</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tiles */}
        <Card className="mt-8 border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
              <Building className="h-5 w-5 mr-2 text-nook-purple-600 dark:text-nook-purple-400" />
              Dashboard Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Properties Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30" onClick={() => router.push('/dashboard/properties')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Properties</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your properties</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Tenants Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:hover:from-green-800/30 dark:hover:to-green-700/30" onClick={() => router.push('/dashboard/tenants')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Tenants</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Manage tenant information</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:hover:from-orange-800/30 dark:hover:to-orange-700/30" onClick={() => router.push('/dashboard/maintenance')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Maintenance</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Track and manage maintenance requests</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Payments Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:hover:from-purple-800/30 dark:hover:to-purple-700/30" onClick={() => router.push('/dashboard/payments')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Payments</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Manage rent and other payments</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:hover:from-indigo-800/30 dark:hover:to-indigo-700/30" onClick={() => router.push('/dashboard/analytics')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-nook-purple-700 dark:text-nook-purple-300 text-lg">Analytics</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">View performance insights</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Documents Tile */}
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 dark:from-pink-900/20 dark:to-pink-800/20 dark:hover:from-pink-800/30 dark:hover:to-pink-700/30" onClick={() => router.push('/dashboard/documents')}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Documents</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Manage documents and contracts</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-pink-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Pending Documents Stat Card */}
        {stats.pendingDocuments > 0 && (
          <div className="mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300 cursor-pointer hover:from-red-100 hover:to-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:hover:from-red-800/30 dark:hover:to-red-700/30" onClick={() => router.push('/dashboard/documents')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-300 mb-1">Documents Pending Approval</p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.pendingDocuments}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">Requires immediate attention</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Items to Approve */}
        {stats.pendingDocuments > 0 && (
          <PendingDocumentsQueue
            documents={pendingDocuments}
            onApprove={handleDocumentApprove}
            onReject={handleDocumentReject}
            onRequestChanges={handleDocumentRequestChanges}
            onViewDocument={handleViewDocument}
            className="mt-8"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notifications - Clickable */}
          <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg font-semibold dark:text-white">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-nook-purple-600 dark:text-nook-purple-400" />
                  Recent Notifications
                </div>
                <Badge className="bg-nook-purple-100 text-nook-purple-700 dark:bg-nook-purple-900/30 dark:text-nook-purple-300">
                  {notifications.filter(n => !n.read).length} new
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayedNotifications.map((notification) => (
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
                      <p className="text-sm font-medium text-nook-purple-700">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
                
                {notifications.length > 3 && (
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllNotifications(!showAllNotifications)}
                      className="w-full text-nook-purple-600 hover:text-nook-purple-700 hover:bg-nook-purple-50"
                    >
                      {showAllNotifications ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show More ({notifications.length - 3} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity - Clickable */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg font-semibold">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-nook-purple-600" />
                  Recent Activity
                </div>
                <Badge className="bg-nook-purple-100 text-nook-purple-700">
                  {recentActivity.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayedActivities.map((activity) => (
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
                      <p className="text-sm font-medium text-nook-purple-700">{activity.action}</p>
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
                
                {recentActivity.length > 3 && (
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllActivities(!showAllActivities)}
                      className="w-full text-nook-purple-600 hover:text-nook-purple-700 hover:bg-nook-purple-50"
                    >
                      {showAllActivities ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show More ({recentActivity.length - 3} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Functional Buttons */}
        <Card className="mt-8 border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
              <Zap className="h-5 w-5 mr-2 text-nook-purple-600 dark:text-nook-purple-400" />
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
                className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200 bg-white dark:bg-gray-700"
                onClick={() => handleQuickAction('add-tenant')}
              >
                <Users className="h-4 w-4 mr-2" />
                Onboard Tenant
              </Button>
              <Button 
                variant="outline" 
                className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200 bg-white dark:bg-gray-700"
                onClick={() => handleQuickAction('create-maintenance')}
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