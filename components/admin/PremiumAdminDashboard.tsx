'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Settings, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Wrench,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { toast } from 'sonner';
import { log } from '@/lib/logger';

interface SystemStats {
  totalUsers: number;
  totalProperties: number;
  activeClients: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  revenue: number;
  pendingApprovals: number;
  maintenanceTickets: number;
  documentsUploaded: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'property' | 'payment' | 'maintenance' | 'document';
  action: string;
  user: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'premium' | 'experimental';
}

const MotionDiv = motion.div;

export default function PremiumAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProperties: 0,
    activeClients: 0,
    systemStatus: 'healthy',
    revenue: 0,
    pendingApprovals: 0,
    maintenanceTickets: 0,
    documentsUploaded: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch system statistics
      const [
        { count: userCount },
        { count: propertyCount },
        { count: clientCount },
        { count: maintenanceCount },
        { count: documentCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('maintenance_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: userCount || 0,
        totalProperties: propertyCount || 0,
        activeClients: clientCount || 0,
        systemStatus: 'healthy',
        revenue: 125000, // Mock data
        pendingApprovals: 12, // Mock data
        maintenanceTickets: maintenanceCount || 0,
        documentsUploaded: documentCount || 0,
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'user',
          action: 'New user registration',
          user: 'john.doe@example.com',
          timestamp: '2 minutes ago',
          status: 'completed',
        },
        {
          id: '2',
          type: 'property',
          action: 'Property added',
          user: 'landlord@example.com',
          timestamp: '15 minutes ago',
          status: 'pending',
        },
        {
          id: '3',
          type: 'payment',
          action: 'Payment processed',
          user: 'tenant@example.com',
          timestamp: '1 hour ago',
          status: 'completed',
        },
        {
          id: '4',
          type: 'maintenance',
          action: 'Maintenance ticket created',
          user: 'tenant@example.com',
          timestamp: '2 hours ago',
          status: 'pending',
        },
      ]);

      // Mock feature flags
      setFeatureFlags([
        {
          id: 'legal_assistant',
          name: 'AI Legal Assistant',
          description: 'Enable AI-powered document review and agreement generation',
          enabled: true,
          category: 'premium',
        },
        {
          id: 'concierge_setup',
          name: 'Concierge Services',
          description: 'Enable concierge setup and management features',
          enabled: false,
          category: 'premium',
        },
        {
          id: 'custom_branding',
          name: 'Custom Branding',
          description: 'Allow clients to customize their branding',
          enabled: true,
          category: 'premium',
        },
        {
          id: 'split_payments',
          name: 'Split Payments',
          description: 'Enable split payment functionality for rent and deposits',
          enabled: true,
          category: 'core',
        },
        {
          id: 'dark_mode',
          name: 'Dark Mode',
          description: 'Enable dark mode for all users',
          enabled: true,
          category: 'core',
        },
        {
          id: 'beta_features',
          name: 'Beta Features',
          description: 'Enable experimental features for testing',
          enabled: false,
          category: 'experimental',
        },
      ]);

    } catch (error) {
      log.error('Error fetching dashboard data:', error as Error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async (featureId: string, enabled: boolean) => {
    try {
      // Update feature flag in database
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled })
        .eq('name', featureId);

      if (error) throw error;

      // Update local state
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag.id === featureId ? { ...flag, enabled } : flag
        )
      );

      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      log.error('Error updating feature flag:', error as Error);
      toast.error('Failed to update feature flag');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'property':
        return <Building2 className="w-4 h-4" />;
      case 'payment':
        return <DollarSign className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Across all roles',
      trend: '+12%',
      trendUp: true,
    },
    {
      name: 'Properties',
      value: stats.totalProperties.toLocaleString(),
      icon: Building2,
      description: 'Total properties',
      trend: '+8%',
      trendUp: true,
    },
    {
      name: 'Active Clients',
      value: stats.activeClients.toLocaleString(),
      icon: Shield,
      description: 'With active subscriptions',
      trend: '+15%',
      trendUp: true,
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'This month',
      trend: '+23%',
      trendUp: true,
    },
    {
      name: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      icon: Clock,
      description: 'Require attention',
      trend: '-5%',
      trendUp: false,
    },
    {
      name: 'System Status',
      value: stats.systemStatus.charAt(0).toUpperCase() + stats.systemStatus.slice(1),
      icon: CheckCircle,
      description: 'All systems operational',
      trend: '100%',
      trendUp: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-nook-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="space-y-8">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Welcome back, {user?.email}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button onClick={fetchDashboardData} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </MotionDiv>

        {/* Stats Grid */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {statCards.map((stat, index) => (
            <Card key={stat.name} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-nook-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.description}
                  </p>
                  <span className={`text-xs font-medium ${
                    stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </MotionDiv>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                      <Badge className={getStatusColor('healthy')}>Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
                      <Badge className={getStatusColor('healthy')}>Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Payment Processing</span>
                      <Badge className={getStatusColor('healthy')}>Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email Service</span>
                      <Badge className={getStatusColor('healthy')}>Healthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New User
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Building2 className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable or disable features across the platform
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {featureFlags.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Label className="text-base font-medium">
                            {feature.name}
                          </Label>
                          <Badge variant={
                            feature.category === 'premium' ? 'default' :
                            feature.category === 'experimental' ? 'secondary' : 'outline'
                          }>
                            {feature.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Latest system activities and user actions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {activity.user}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getActivityStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure system-wide settings and preferences
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Temporarily disable the platform for maintenance
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Debug Logging</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable detailed logging for troubleshooting
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Auto Backup</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically backup data daily
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
} 