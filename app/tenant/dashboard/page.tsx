'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MessageSquare, CreditCard, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { log } from '@/lib/logger';
const MotionDiv = motion.div;

export default function TenantDashboard() {
  const { user } = useAuth();
  const [propertyData, setPropertyData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClientComponentClient<Database>();

  React.useEffect(() => {
    async function fetchTenantData() {
      if (!user) return;

      try {
        // Fetch tenant's property data
        const { data: tenantData, error: tenantError } = await supabase
          .from('users')
          .select('property_id')
          .eq('id', user.id)
          .single();

        if (tenantError) throw tenantError;

        if (tenantData?.property_id) {
          // Fetch property details
          const { data: property, error: propertyError } = await supabase
            .from('properties')
            .select('*')
            .eq('id', tenantData.property_id)
            .single();

          if (propertyError) throw propertyError;
          setPropertyData(property);
        }
      } catch (error) {
        log.error('Error fetching tenant data:', error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTenantData();
  }, [user, supabase]);

  const stats = [
    {
      name: 'Property',
      value: propertyData?.name || 'Not Assigned',
      icon: Building2,
      description: 'Your current residence',
    },
    {
      name: 'Maintenance',
      value: '0',
      icon: MessageSquare,
      description: 'Open requests',
    },
    {
      name: 'Payments',
      value: '$0',
      icon: CreditCard,
      description: 'This month',
    },
    {
      name: 'Documents',
      value: '0',
      icon: FileText,
      description: 'Pending review',
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <RoleGuard allowedRoles={['tenant']}>
      <div>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tenant Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Welcome back, {user?.email}
          </p>
        </MotionDiv>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
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
                    Submit Maintenance Request
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                    Make Payment
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                    View Documents
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