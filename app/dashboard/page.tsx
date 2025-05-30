'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function DashboardPage() {
  const { user, role } = useAuth();

  const stats = [
    {
      name: 'Properties',
      value: '0',
      icon: Building2,
      description: 'Total properties',
    },
    {
      name: 'Tenants',
      value: '0',
      icon: Users,
      description: 'Active tenants',
    },
    {
      name: 'Payments',
      value: '$0',
      icon: DollarSign,
      description: 'This month',
    },
    {
      name: 'Maintenance',
      value: '0',
      icon: Wrench,
      description: 'Open tickets',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="container mx-auto px-4 py-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome back, {user?.email}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Here's an overview of your property management
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
                  {role === 'landlord' && (
                    <>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                        Add New Property
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                        Invite Tenant
                      </button>
                    </>
                  )}
                  {role === 'tenant' && (
                    <>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                        Submit Maintenance Request
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors">
                        Make Payment
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
} 