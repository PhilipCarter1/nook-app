'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, DollarSign, Wrench, Plus, FileText, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionDiv = motion.div;

export default function DashboardPage() {
  const { user, role } = useAuth();

  // Sample data to demonstrate the platform
  const stats = [
    {
      name: 'Properties',
      value: role === 'landlord' ? '3' : '1',
      icon: Building2,
      description: 'Total properties',
      href: '/dashboard/properties',
    },
    {
      name: 'Tenants',
      value: role === 'landlord' ? '8' : '1',
      icon: Users,
      description: 'Active tenants',
      href: '/dashboard/tenants',
    },
    {
      name: 'Payments',
      value: role === 'landlord' ? '$12,450' : '$1,200',
      icon: DollarSign,
      description: 'This month',
      href: '/dashboard/payments',
    },
    {
      name: 'Maintenance',
      value: role === 'landlord' ? '5' : '2',
      icon: Wrench,
      description: 'Open tickets',
      href: '/dashboard/maintenance',
    },
  ];

  const quickActions = [
    {
      name: 'Add Property',
      description: 'Create a new property listing',
      icon: Plus,
      href: '/dashboard/properties',
      showFor: ['landlord'],
    },
    {
      name: 'Invite Tenant',
      description: 'Send invitation to new tenant',
      icon: Users,
      href: '/dashboard/tenants/invitations',
      showFor: ['landlord'],
    },
    {
      name: 'Submit Maintenance',
      description: 'Create a maintenance request',
      icon: Wrench,
      href: '/dashboard/maintenance',
      showFor: ['tenant'],
    },
    {
      name: 'Make Payment',
      description: 'Pay rent or deposit',
      icon: DollarSign,
      href: '/dashboard/payments',
      showFor: ['tenant'],
    },
    {
      name: 'Upload Documents',
      description: 'Add lease or other documents',
      icon: FileText,
      href: '/dashboard/documents',
      showFor: ['landlord', 'tenant'],
    },
    {
      name: 'Settings',
      description: 'Manage your account',
      icon: Settings,
      href: '/dashboard/settings',
      showFor: ['landlord', 'tenant'],
    },
  ];

  const recentActivity = [
    {
      type: 'payment',
      message: 'Rent payment received for Unit 2A',
      time: '2 hours ago',
      user: 'John Smith',
    },
    {
      type: 'maintenance',
      message: 'Maintenance ticket #1234 updated',
      time: '1 day ago',
      user: 'Maintenance Team',
    },
    {
      type: 'document',
      message: 'New lease agreement uploaded',
      time: '3 days ago',
      user: 'Property Manager',
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
            Here's an overview of your property management dashboard
          </p>
        </MotionDiv>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <MotionDiv
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
              </Link>
            </MotionDiv>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
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
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-nook-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {activity.time} • {activity.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionDiv>

          {/* Quick Actions */}
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
                  {quickActions
                    .filter(action => action.showFor.includes(role || 'tenant'))
                    .map((action) => (
                      <Link key={action.name} href={action.href}>
                        <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-nook-purple-50 dark:text-gray-300 dark:hover:bg-nook-purple-900/50 rounded-md transition-colors flex items-center">
                          <action.icon className="w-4 h-4 mr-3 text-nook-purple-500" />
                          <div>
                            <div className="font-medium">{action.name}</div>
                            <div className="text-xs text-gray-500">{action.description}</div>
                          </div>
                        </button>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>

        {/* Platform Features Demo */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Platform Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-nook-purple-500" />
                  <h3 className="font-semibold">Property Management</h3>
                  <p className="text-sm text-gray-600">Manage properties, units, and tenants</p>
                </div>
                <div className="text-center p-4">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-nook-purple-500" />
                  <h3 className="font-semibold">Payment Processing</h3>
                  <p className="text-sm text-gray-600">Secure rent and deposit payments</p>
                </div>
                <div className="text-center p-4">
                  <Wrench className="w-8 h-8 mx-auto mb-2 text-nook-purple-500" />
                  <h3 className="font-semibold">Maintenance Hub</h3>
                  <p className="text-sm text-gray-600">Track and manage maintenance requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
} 