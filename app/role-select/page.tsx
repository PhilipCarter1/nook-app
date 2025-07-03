'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { UserRole } from '@/lib/types';
import { Building2, User, Shield, Wrench } from 'lucide-react';

const MotionDiv = motion.div;

const roles = [
  {
    id: 'tenant',
    title: 'Tenant',
    description: 'I am looking to rent a property',
    icon: User,
    features: [
      'View and manage your rental property',
      'Submit maintenance requests',
      'Pay rent online',
      'Access important documents'
    ]
  },
  {
    id: 'landlord',
    title: 'Landlord',
    description: 'I own or manage properties',
    icon: Building2,
    features: [
      'Manage multiple properties',
      'Track rent payments',
      'Handle maintenance requests',
      'Manage tenant communications'
    ]
  },
  {
    id: 'super',
    title: 'Property Manager',
    description: 'I manage maintenance and operations',
    icon: Wrench,
    features: [
      'View and manage maintenance requests',
      'Track maintenance history',
      'Schedule maintenance tasks',
      'Communicate with tenants and landlords'
    ]
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'I manage the platform',
    icon: Shield,
    features: [
      'System-wide management',
      'User management',
      'Platform configuration',
      'Analytics and reporting'
    ]
  }
];

export default function RoleSelect() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Update user role in the database
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Role selected successfully!');
      
      // Redirect based on role
      switch (role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'landlord':
          router.push('/landlord/dashboard');
          break;
        case 'super':
          router.push('/super/dashboard');
          break;
        case 'tenant':
          router.push('/tenant/dashboard');
          break;
      }
    } catch (error: any) {
      console.error('Error selecting role:', error);
      toast.error(error.message || 'Failed to select role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="container mx-auto px-4 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Select Your Role
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Choose how you'll use Nook
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className={`p-6 cursor-pointer transition-all ${
                      selectedRole === role.id
                        ? 'border-nook-purple-500 bg-nook-purple-50 dark:bg-nook-purple-900/20'
                        : 'hover:border-nook-purple-300'
                    }`}
                    onClick={() => handleRoleSelect(role.id as UserRole)}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <role.icon className="w-12 h-12 text-nook-purple-500" />
                      <h3 className="text-lg font-semibold">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                      <ul className="text-sm text-left space-y-2">
                        {role.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
} 