'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Home, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

const inviteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface Property {
  id: string;
  name: string;
  address: string;
  units: Unit[];
}

interface Unit {
  id: string;
  number: string;
  property_id: string;
  tenants: Tenant[];
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending';
}

export default function LandlordDashboard() {
  const router = useRouter();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedUnit, setSelectedUnit] = React.useState<Unit | null>(null);
  const supabase = getClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
  });

  React.useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          units (
            id,
            number,
            property_id,
            tenants (
              id,
              name,
              email,
              status
            )
          )
        `);

      if (error) throw error;
      setProperties(properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (data: InviteFormData) => {
    if (!selectedUnit) return;

    try {
      // Create tenant record
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: data.name,
          email: data.email,
          status: 'pending',
          unit_id: selectedUnit.id,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Create user record with tenant role
      const { error: userError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        user_metadata: {
          role: 'tenant',
          tenant_id: tenant.id,
        },
      });

      if (userError) throw userError;

      // TODO: Send onboarding email
      // This would be implemented with your email service

      toast.success('Tenant invited successfully');

      // Refresh properties to show new tenant
      fetchProperties();
      reset();
    } catch (error) {
      console.error('Error inviting tenant:', error);
      toast.error('Failed to invite tenant');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Property Management</h1>
        <Button onClick={() => router.push('/properties/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                {property.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{property.address}</p>
              <div className="space-y-4">
                {property.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/units/${unit.id}`)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Unit {unit.number}</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUnit(unit);
                            }}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Invite Tenant
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite Tenant to Unit {unit.number}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit(handleInvite)} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Tenant Name</Label>
                              <Input
                                id="name"
                                {...register('name')}
                                placeholder="Enter tenant name"
                              />
                              {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="Enter tenant email"
                              />
                              {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                              )}
                            </div>
                            <Button type="submit" className="w-full">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Invitation
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-2">
                      {unit.tenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{tenant.name}</span>
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 