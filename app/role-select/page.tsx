'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function RoleSelectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    checkUserRoles();
  }, []);

  const checkUserRoles = async () => {
    try {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user has any roles assigned
      const { data: roles, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (roles?.role) {
        // User already has a role, redirect to dashboard
        router.push('/dashboard');
        return;
      }

      // Check if user has any properties (landlord) or leases (tenant)
      const [propertiesResult, leasesResult] = await Promise.all([
        supabase
          .from('properties')
          .select('id')
          .eq('landlord_id', user.id),
        supabase
          .from('leases')
          .select('id')
          .eq('tenant_id', user.id)
      ]);

      const roles = [];
      if (propertiesResult.data?.length) roles.push('landlord');
      if (leasesResult.data?.length) roles.push('tenant');

      setUserRoles(roles);
    } catch (error) {
      console.error('Error checking user roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user roles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: 'tenant' | 'landlord') => {
    try {
      const supabase = getClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id);

      if (error) throw error;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error setting user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to set user role',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Select Your Role</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRoleSelect('tenant')}>
            <CardHeader>
              <CardTitle>Tenant</CardTitle>
              <CardDescription>
                I am looking to rent a property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Submit maintenance requests</li>
                <li>Pay rent online</li>
                <li>Split rent with roommates</li>
                <li>Track payment history</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRoleSelect('landlord')}>
            <CardHeader>
              <CardTitle>Landlord</CardTitle>
              <CardDescription>
                I own or manage properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Manage properties</li>
                <li>Handle maintenance requests</li>
                <li>Track rent payments</li>
                <li>Generate reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {userRoles.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Based on your account activity, you can also access these roles:
            </p>
            <div className="flex gap-4 justify-center">
              {userRoles.map(role => (
                <Button
                  key={role}
                  variant="outline"
                  onClick={() => handleRoleSelect(role as 'tenant' | 'landlord')}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 