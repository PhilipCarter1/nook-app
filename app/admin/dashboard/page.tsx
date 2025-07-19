'use client';

import React from 'react';
import { log } from '@/lib/logger';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Settings, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
const MotionDiv = motion.div;

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalProperties: 0,
    activeClients: 0,
    systemStatus: 'Healthy'
  });
  const [loading, setLoading] = React.useState(true);
  const supabase = createClientComponentClient<Database>();

  React.useEffect(() => {
    async function fetchAdminStats() {
      try {
        // Fetch total users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Fetch total properties
        const { count: propertyCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        // Fetch active clients
        const { count: clientCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: userCount || 0,
          totalProperties: propertyCount || 0,
          activeClients: clientCount || 0,
          systemStatus: 'Healthy'
        });
      } catch (error) {
        log.error('Error fetching admin stats:', error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminStats();
  }, [supabase]);

  const statItems = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      description: 'Across all roles',
    },
    {
      name: 'Properties',
      value: stats.totalProperties.toString(),
      icon: Building2,
      description: 'Total properties',
    },
    {
      name: 'Active Clients',
      value: stats.activeClients.toString(),
      icon: Shield,
      description: 'With active subscriptions',
    },
    {
      name: 'System Status',
      value: stats.systemStatus,
      icon: Settings,
      description: 'All systems operational',
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Welcome back, {user?.email}
          </p>
        </MotionDiv>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statItems.map((stat) => (
            <MotionDiv
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-nook-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </MotionDiv>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No recent activity
                </p>
              </CardContent>
            </Card>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                    Create New User
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                    Manage Clients
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                    System Settings
                  </button>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </RoleGuard>
  );
} 