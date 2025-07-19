'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Mail, Calendar, DollarSign } from 'lucide-react';
import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { log } from '@/lib/logger';
interface Unit {
  id: string;
  number: string;
  rent_amount: number;
  lease_start: string;
  lease_end: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
  tenants: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
  }>;
}

const inviteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function UnitPage() {
  const params = useParams();
  const router = useRouter();
  const [unit, setUnit] = React.useState<Unit | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  const fetchUnit = async () => {
    if (!params?.id) return;
    
    try {
      const supabase = getClient();
      const { data, error } = await supabase
        .from('units')
        .select(`
          id,
          number,
          rent_amount,
          lease_start,
          lease_end,
          property:properties(id, name, address),
          tenants:unit_tenants(
            id,
            name,
            email,
            status
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;

      if (data) {
        setUnit({
          ...data,
          property: data.property[0],
          tenants: data.tenants || []
        });
      }
    } catch (error) {
      log.error('Error fetching unit:', error as Error);
      toast.error('Failed to load unit details');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUnit();
  }, [params?.id]);

  const handleInvite = async (data: InviteFormData) => {
    try {
      // Create tenant record
      const { data: tenant, error: tenantError } = await getClient()
        .from('tenants')
        .insert({
          name: data.name,
          email: data.email,
          status: 'pending'
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create user record with tenant role
      const { error: userError } = await getClient().auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        user_metadata: {
          role: 'tenant',
          tenant_id: tenant.id
        }
      });

      if (userError) throw userError;

      // Associate tenant with unit
      const { error: unitTenantError } = await getClient()
        .from('unit_tenants')
        .insert({
          unit_id: params?.id,
          tenant_id: tenant.id
        });

      if (unitTenantError) throw unitTenantError;

      toast.success('Tenant invited successfully');
      setInviteDialogOpen(false);
      form.reset();
      fetchUnit();
    } catch (error) {
      log.error('Error inviting tenant:', error as Error);
      toast.error('Failed to invite tenant');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!unit) {
    return <div>Unit not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Properties
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Unit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{unit.property.name}</h3>
                <p className="text-sm text-gray-500">{unit.property.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Unit Number</p>
                  <p className="font-medium">{unit.number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="font-medium">${unit.rent_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lease Start</p>
                  <p className="font-medium">
                    {new Date(unit.lease_start).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lease End</p>
                  <p className="font-medium">
                    {new Date(unit.lease_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tenants</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Invite Tenant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Tenant to Unit {unit.number}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tenant Name</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="Enter tenant name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="Enter tenant email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unit.tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{tenant.name}</p>
                    <p className="text-sm text-gray-500">{tenant.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      tenant.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {tenant.status}
                  </span>
                </div>
              ))}
              {unit.tenants.length === 0 && (
                <p className="text-sm text-gray-500">No tenants assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 