'use client';

import React from 'react';
import { getClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'suspended';
  client_config: {
    legal_assistant: boolean;
    concierge_setup: boolean;
    custom_branding: boolean;
  };
  created_at: string;
  properties_count: number;
  tenants_count: number;
}

export default async function AdminDashboard() {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is an admin
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!admin) {
    redirect('/dashboard');
  }

  // Get all organizations with their stats
  const { data: organizations } = await supabase
    .from('organizations')
    .select(`
      *,
      properties:properties(count),
      tenants:tenants(count)
    `)
    .order('created_at', { ascending: false });

  const handleImpersonate = async (orgId: string) => {
    try {
      // Create a session for the admin as the organization
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: 'admin-impersonation',
        options: {
          data: {
            impersonating: true,
            organization_id: orgId,
          },
        },
      });

      if (error) throw error;

      // Redirect to the organization's dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error impersonating organization:', error);
      toast.error('Failed to impersonate organization');
    }
  };

  const handleFeatureToggle = async (orgId: string, feature: string, enabled: boolean) => {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('client_config')
        .eq('id', orgId)
        .single();

      if (!org) throw new Error('Organization not found');

      const updatedConfig = {
        ...org.client_config,
        [feature]: enabled,
      };

      const { error } = await supabase
        .from('organizations')
        .update({ client_config: updatedConfig })
        .eq('id', orgId);

      if (error) throw error;

      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast.error('Failed to update feature flag');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="space-y-6">
        {organizations?.map((org: Organization) => (
          <Card key={org.id} className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{org.name}</h2>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getStatusColor(org.status)}>
                      {org.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Created {new Date(org.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleImpersonate(org.id)}
                >
                  Impersonate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Organization Stats</h3>
                  <div className="space-y-2">
                    <p>Properties: {org.properties_count}</p>
                    <p>Tenants: {org.tenants_count}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Feature Flags</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`legal-${org.id}`}>Legal Assistant</Label>
                      <Switch
                        id={`legal-${org.id}`}
                        checked={org.client_config.legal_assistant}
                        onCheckedChange={(checked) =>
                          handleFeatureToggle(org.id, 'legal_assistant', checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`concierge-${org.id}`}>Concierge Setup</Label>
                      <Switch
                        id={`concierge-${org.id}`}
                        checked={org.client_config.concierge_setup}
                        onCheckedChange={(checked) =>
                          handleFeatureToggle(org.id, 'concierge_setup', checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`branding-${org.id}`}>Custom Branding</Label>
                      <Switch
                        id={`branding-${org.id}`}
                        checked={org.client_config.custom_branding}
                        onCheckedChange={(checked) =>
                          handleFeatureToggle(org.id, 'custom_branding', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 