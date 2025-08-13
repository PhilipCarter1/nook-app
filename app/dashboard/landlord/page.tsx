'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Building,
  Users,
  Wrench,
  CreditCard,
  FileText,
  BarChart,
  Settings,
  Plus,
  CheckIcon,
  TrendingUp,
  Shield,
  Zap,
  Bell,
  Activity,
  AlertCircle,
  Clock,
  DollarSign,
  Home,
  MapPin
} from 'lucide-react';
import { PendingDocumentsQueue, PendingDocument } from '@/components/documents/PendingDocumentsQueue';

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
}

interface ActivityItem {
  id: string;
  type: 'property' | 'tenant' | 'maintenance' | 'payment' | 'document';
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  occupiedUnits: number;
  monthlyRent: number;
  status: 'active' | 'maintenance' | 'vacant';
}

export default function LandlordDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    monthlyRevenue: 0,
    pendingMaintenance: 0,
    pendingDocuments: 0
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // TEMPORARY: Use simulated user data
        console.log('Using simulated landlord user data');
        setUser({
          id: '1',
          email: 'landlord@example.com',
          name: 'Sarah Landlord',
          role: 'landlord'
        });

        // Simulate notifications
        setNotifications([
          {
            id: '1',
            type: 'warning',
            title: 'Maintenance Request',
            message: 'New maintenance request for Sunset Apartments Unit 2A',
            timestamp: new Date().toISOString(),
            read: false
          },
          {
            id: '2',
            type: 'success',
            title: 'Rent Payment',
            message: 'Rent payment received from John Doe - $1,200',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          },
          {
            id: '3',
            type: 'info',
            title: 'New Tenant',
            message: 'New tenant application for Ocean View Complex',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true
          }
        ]);

        // Simulate recent activity
        setRecentActivity([
          {
            id: '1',
            type: 'property',
            action: 'Property Added',
            description: 'New property "Ocean View Complex" added to portfolio',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'Sarah Landlord'
          },
          {
            id: '2',
            type: 'tenant',
            action: 'Tenant Onboarded',
            description: 'Jane Smith assigned to Sunset Apartments Unit 3B',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            user: 'Sarah Landlord'
          },
          {
            id: '3',
            type: 'maintenance',
            action: 'Maintenance Completed',
            description: 'Plumbing repair completed at Sunset Apartments Unit 1A',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            user: 'Maintenance Team'
          }
        ]);

        // Simulate properties
        setProperties([
          {
            id: '1',
            name: 'Sunset Apartments',
            address: '123 Sunset Blvd, Los Angeles, CA',
            units: 12,
            occupiedUnits: 10,
            monthlyRent: 14400,
            status: 'active'
          },
          {
            id: '2',
            name: 'Ocean View Complex',
            address: '456 Ocean Dr, Santa Monica, CA',
            units: 8,
            occupiedUnits: 6,
            monthlyRent: 9600,
            status: 'active'
          },
          {
            id: '3',
            name: 'Downtown Lofts',
            address: '789 Main St, Downtown, CA',
            units: 6,
            occupiedUnits: 4,
            monthlyRent: 7200,
            status: 'maintenance'
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
          }
        ]);

        // Simulate stats
        setStats({
          totalProperties: 3,
          totalUnits: 26,
          occupiedUnits: 20,
          monthlyRevenue: 31200,
          pendingMaintenance: 2,
          pendingDocuments: 3
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading landlord dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'tenant':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPropertyStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'vacant':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Landlord Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your properties and tenants</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-nook-purple-100 text-nook-purple-800 border-nook-purple-200 dark:bg-nook-purple-900/30 dark:text-nook-purple-300 dark:border-nook-purple-600">Landlord</Badge>
              <Button variant="outline" onClick={() => router.push('/dashboard/settings')} className="text-nook-purple-600 border-nook-purple-200 hover:bg-nook-purple-50 dark:text-nook-purple-300 dark:border-nook-purple-600 dark:hover:bg-nook-purple-900/20">
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
        <Card className="mb-8 border-0 shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome, {user?.name}!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your property portfolio with professional tools.</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="outline" className="bg-nook-purple-100 text-nook-purple-800 border-nook-purple-200 dark:bg-nook-purple-900/30 dark:text-nook-purple-300 dark:border-nook-purple-600">
                  <Building className="h-4 w-4 mr-1" />
                  Property Manager
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Portfolio Growth
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600">
                  <Users className="h-4 w-4 mr-1" />
                  Tenant Management
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Units</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied Units</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.occupiedUnits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items to Approve */}
        {stats.pendingDocuments > 0 && (
          <PendingDocumentsQueue
            documents={pendingDocuments}
            onApprove={handleDocumentApprove}
            onReject={handleDocumentReject}
            onRequestChanges={handleDocumentRequestChanges}
            onViewDocument={handleViewDocument}
            className="mb-8"
          />
        )}

        {/* Notifications and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Notifications */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()} • {activity.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Overview */}
        <Card className="mb-8 border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Properties Overview
              </span>
              <Button onClick={() => router.push('/dashboard/properties')} className="bg-nook-purple-600 hover:bg-nook-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/properties/${property.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-nook-purple-700 text-lg">{property.name}</h3>
                        <p className="text-gray-600 text-sm flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.address}
                        </p>
                      </div>
                      <Badge className={getPropertyStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Units</p>
                        <p className="text-lg font-bold text-nook-purple-700">{property.occupiedUnits}/{property.units}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Rent</p>
                        <p className="text-lg font-bold text-nook-purple-700">${property.monthlyRent.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/properties')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-nook-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Building className="h-6 w-6 text-nook-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Properties</h3>
                  <p className="text-gray-600 text-sm">Manage your properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/tenants')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Tenants</h3>
                  <p className="text-gray-600 text-sm">Manage your tenants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/maintenance')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Maintenance</h3>
                  <p className="text-gray-600 text-sm">Track maintenance requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/payments')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Payments</h3>
                  <p className="text-gray-600 text-sm">Track rent and payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/documents')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Documents</h3>
                  <p className="text-gray-600 text-sm">Manage leases and documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => router.push('/dashboard/analytics')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Analytics</h3>
                  <p className="text-gray-600 text-sm">View portfolio performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 