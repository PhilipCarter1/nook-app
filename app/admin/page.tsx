'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Users, Settings, Shield } from 'lucide-react';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

const featureFlags: FeatureFlag[] = [
  {
    key: 'legalAssistant',
    name: 'Legal Assistant',
    description: 'Enable AI-powered lease review and compliance checking',
    enabled: false,
  },
  {
    key: 'concierge',
    name: 'Concierge Service',
    description: 'Enable premium tenant concierge services',
    enabled: false,
  },
  {
    key: 'customBranding',
    name: 'Custom Branding',
    description: 'Allow clients to customize their branding',
    enabled: false,
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [flags, setFlags] = React.useState<FeatureFlag[]>(featureFlags);
  const [loading, setLoading] = React.useState(true);
  const supabase = getClient();

  React.useEffect(() => {
    const fetchFeatureFlags = async () => {
      try {
        const { data, error } = await supabase
          .from('feature_flags')
          .select('*');

        if (error) throw error;

        setFlags(
          featureFlags.map((flag) => ({
            ...flag,
            enabled: data.find((f) => f.key === flag.key)?.enabled || false,
          }))
        );
      } catch (error) {
        console.error('Error fetching feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFlags();
  }, [supabase]);

  const handleToggleFeature = async (key: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .upsert({ key, enabled });

      if (error) throw error;

      setFlags((prev) =>
        prev.map((flag) =>
          flag.key === key ? { ...flag, enabled } : flag
        )
      );

      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast.error('Failed to update feature flag');
    }
  };

  if (loading) {
    return (
      <MainLayout userRole="admin">
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="admin">
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Active accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Features</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flags.filter((flag) => flag.enabled).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Enabled features
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {flags.map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <Label htmlFor={flag.key} className="text-base">
                      {flag.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {flag.description}
                    </p>
                  </div>
                  <Switch
                    id={flag.key}
                    checked={flag.enabled}
                    onCheckedChange={(checked) =>
                      handleToggleFeature(flag.key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">
                    john@example.com
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">
                    jane@example.com
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => window.location.href = '/admin/users'}>
            View All Users
          </Button>
          <Button onClick={() => window.location.href = '/admin/settings'}>
            System Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 