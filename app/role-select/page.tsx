'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Building2, Users, ArrowRight } from 'lucide-react';

const MotionDiv = motion.div;

export default function RoleSelectPage() {
  const router = useRouter();

  const handleRoleSelect = async (role: string) => {
    try {
      const response = await fetch('/api/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to set role');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error setting role:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="container mx-auto px-4 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
              Select Your Role
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Choose how you'll use Nook to manage your properties
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <MotionDiv
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRoleSelect('tenant')}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <Users className="h-8 w-8 text-nook-purple-500" />
                    <CardTitle>Tenant</CardTitle>
                  </div>
                  <CardDescription>
                    I am looking to rent a property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Submit maintenance requests
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Pay rent online
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Split rent with roommates
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Track payment history
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRoleSelect('landlord')}
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <Building2 className="h-8 w-8 text-nook-purple-500" />
                    <CardTitle>Landlord</CardTitle>
                  </div>
                  <CardDescription>
                    I own or manage properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Manage properties
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Handle maintenance requests
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Track rent payments
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-nook-purple-500" />
                      Generate reports
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </MotionDiv>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
} 