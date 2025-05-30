import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Users, Plus, Trash2 } from 'lucide-react';
import { getClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Tenant {
  id: string;
  name: string;
  email: string;
  percentage: number;
}

interface SplitRentSetupProps {
  tenants: Tenant[];
  onUpdate: () => void;
}

export default function SplitRentSetup({ tenants, onUpdate }: SplitRentSetupProps) {
  const { toast } = useToast();
  const [newTenant, setNewTenant] = React.useState({ name: '', email: '', percentage: 0 });
  const supabase = getClient();

  const handleAddTenant = async () => {
    if (!newTenant.name || !newTenant.email || newTenant.percentage <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const totalPercentage = tenants.reduce((sum, t) => sum + t.percentage, 0) + newTenant.percentage;
    if (totalPercentage > 100) {
      toast({
        title: 'Error',
        description: 'Total percentage cannot exceed 100%',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          split_rent: {
            enabled: true,
            tenants: [...tenants, { ...newTenant, id: Date.now().toString() }],
          },
        })
        .eq('id', tenants[0]?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tenant added to split rent',
      });

      setNewTenant({ name: '', email: '', percentage: 0 });
      onUpdate();
    } catch (error) {
      console.error('Error adding tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tenant',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveTenant = async (tenantId: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          split_rent: {
            enabled: tenants.length > 1,
            tenants: tenants.filter((t) => t.id !== tenantId),
          },
        })
        .eq('id', tenants[0]?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tenant removed from split rent',
      });

      onUpdate();
    } catch (error) {
      console.error('Error removing tenant:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove tenant',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{tenant.name}</h3>
                <p className="text-sm text-gray-500">{tenant.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">{tenant.percentage}%</span>
                {tenants.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTenant(tenant.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Add Tenant to Split</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newTenant.name}
              onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
              placeholder="Enter tenant name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newTenant.email}
              onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
              placeholder="Enter tenant email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentage">Percentage</Label>
            <Input
              id="percentage"
              type="number"
              min="0"
              max="100"
              value={newTenant.percentage}
              onChange={(e) =>
                setNewTenant({ ...newTenant, percentage: parseInt(e.target.value) || 0 })
              }
              placeholder="Enter percentage"
            />
          </div>
        </div>
        <Button onClick={handleAddTenant} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>
    </div>
  );
} 