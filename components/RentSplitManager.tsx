import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, DollarSign, Plus, Trash2 } from 'lucide-react';
import { log } from '@/lib/logger';
import { getClient } from '@/lib/supabase/client';
interface Tenant {
  id: string;
  user: {
    full_name: string;
    email: string;
  };
}

interface RentSplit {
  id: string;
  tenant_id: string;
  percentage: number;
}

interface RentSplitManagerProps {
  unitId: string;
  monthlyRent: number;
}

export function RentSplitManager({ unitId, monthlyRent }: RentSplitManagerProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [splits, setSplits] = useState<RentSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = getClient();

  useEffect(() => {
    fetchTenantsAndSplits();
  }, [unitId]);

  const fetchTenantsAndSplits = async () => {
    try {
      // Fetch tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
          id,
          user:user_id!inner(
            full_name,
            email
          )
        `)
        .eq('unit_id', unitId);

      if (tenantsError) throw tenantsError;
      setTenants((tenantsData || []).map(tenant => ({
        id: tenant.id,
        user: tenant.user[0]
      })));

      // Fetch existing splits
      const { data: splitsData, error: splitsError } = await supabase
        .from('rent_splits')
        .select('*')
        .eq('unit_id', unitId);

      if (splitsError) throw splitsError;
      setSplits(splitsData || []);
    } catch (error) {
      log.error('Error fetching tenants and splits:', error as Error);
      toast.error('Failed to load rent split information');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitChange = async (tenantId: string, percentage: number) => {
    try {
      // Validate total percentage
      const otherSplits = splits.filter(split => split.tenant_id !== tenantId);
      const totalPercentage = otherSplits.reduce((sum, split) => sum + split.percentage, 0) + percentage;

      if (totalPercentage > 100) {
        toast.error('Total percentage cannot exceed 100%');
        return;
      }

      // Update or create split
      const existingSplit = splits.find(split => split.tenant_id === tenantId);
      
      if (existingSplit) {
        const { error } = await supabase
          .from('rent_splits')
          .update({ percentage })
          .eq('id', existingSplit.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rent_splits')
          .insert({
            unit_id: unitId,
            tenant_id: tenantId,
            percentage,
          });

        if (error) throw error;
      }

      // Refresh splits
      fetchTenantsAndSplits();
      toast.success('Rent split updated');
    } catch (error) {
      log.error('Error updating rent split:', error as Error);
      toast.error('Failed to update rent split');
    }
  };

  const handleRemoveSplit = async (splitId: string) => {
    try {
      const { error } = await supabase
        .from('rent_splits')
        .delete()
        .eq('id', splitId);

      if (error) throw error;

      // Refresh splits
      fetchTenantsAndSplits();
      toast.success('Rent split removed');
    } catch (error) {
      log.error('Error removing rent split:', error as Error);
      toast.error('Failed to remove rent split');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Rent Split</h3>
          <p className="text-sm text-gray-500 mb-4">
            Monthly Rent: ${monthlyRent}
          </p>

          <div className="space-y-4">
            {tenants.map((tenant) => {
              const split = splits.find(s => s.tenant_id === tenant.id);
              const amount = split ? (monthlyRent * split.percentage) / 100 : 0;

              return (
                <div key={tenant.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tenant.user.full_name}</p>
                      <p className="text-sm text-gray-500">{tenant.user.email}</p>
                    </div>
                    {split && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSplit(split.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`split-${tenant.id}`}>Percentage</Label>
                      <Input
                        id={`split-${tenant.id}`}
                        type="number"
                        min="0"
                        max="100"
                        value={split?.percentage || 0}
                        onChange={(e) => handleSplitChange(tenant.id, Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Amount</Label>
                      <p className="text-lg font-medium">${amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {tenants.length === 0 && (
              <p className="text-center text-gray-500">
                No tenants assigned to this unit
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 