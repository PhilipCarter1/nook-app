'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getClient } from '@/lib/supabase/client';
import { User, CreditCard, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  share_percentage: number;
  share_amount: number;
  paid_amount: number;
  status: 'paid' | 'partial' | 'unpaid';
}

interface SplitRentProps {
  id: string;
  totalAmount: number;
  dueDate: string;
  onPaymentComplete: () => void;
}

export default function SplitRent({
  id,
  totalAmount,
  dueDate,
  onPaymentComplete,
}: SplitRentProps) {
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showSplitForm, setShowSplitForm] = React.useState(false);
  const [newTenantEmail, setNewTenantEmail] = React.useState('');
  const [newTenantShare, setNewTenantShare] = React.useState(0);
  const supabase = getClient();

  React.useEffect(() => {
    fetchTenants();
  }, [id]);

  const fetchTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('rent_splits')
        .select(`
          *,
          tenant:users (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('property_id', id);

      if (error) throw error;

      const formattedTenants = data.map((split: any) => ({
        id: split.tenant.id,
        name: split.tenant.name,
        email: split.tenant.email,
        avatar_url: split.tenant.avatar_url,
        share_percentage: split.share_percentage,
        share_amount: (totalAmount * split.share_percentage) / 100,
        paid_amount: split.paid_amount || 0,
        status: getPaymentStatus(split.paid_amount || 0, (totalAmount * split.share_percentage) / 100),
      }));

      setTenants(formattedTenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Failed to load tenant information');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (paid: number, total: number): 'paid' | 'partial' | 'unpaid' => {
    if (paid >= total) return 'paid';
    if (paid > 0) return 'partial';
    return 'unpaid';
  };

  const handleAddTenant = async () => {
    if (!newTenantEmail || newTenantShare <= 0) return;

    try {
      // First, get the user ID from email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newTenantEmail)
        .single();

      if (userError) throw userError;

      // Add the rent split
      const { error: splitError } = await supabase
        .from('rent_splits')
        .insert({
          property_id: id,
          tenant_id: userData.id,
          share_percentage: newTenantShare,
        });

      if (splitError) throw splitError;

      // Refresh tenant list
      await fetchTenants();
      setNewTenantEmail('');
      setNewTenantShare(0);
      setShowSplitForm(false);
    } catch (error) {
      console.error('Error adding tenant:', error);
      setError('Failed to add tenant');
    }
  };

  const handlePayment = async (tenantId: string, amount: number) => {
    try {
      // Create Stripe checkout session
      const { data: session, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount,
          propertyId: id,
          userId: tenantId,
          type: 'rent',
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating payment session:', error);
      setError('Failed to process payment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const totalPaid = tenants.reduce((sum, tenant) => sum + tenant.paid_amount, 0);
  const progress = (totalPaid / totalAmount) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Split Rent Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Amount</span>
              <span className="font-medium">${totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Due Date</span>
              <span className="font-medium">{new Date(dueDate).toLocaleDateString()}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Paid: ${totalPaid}</span>
              <span>Remaining: ${totalAmount - totalPaid}</span>
            </div>
          </div>

          <div className="space-y-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={tenant.avatar_url} />
                        <AvatarFallback>
                          {tenant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-500">{tenant.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tenant.status)}
                        <span className="text-sm capitalize">{tenant.status}</span>
                      </div>
                      <p className="text-sm">
                        Share: ${tenant.share_amount} ({tenant.share_percentage}%)
                      </p>
                      {tenant.status !== 'paid' && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handlePayment(tenant.id, tenant.share_amount - tenant.paid_amount)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay ${tenant.share_amount - tenant.paid_amount}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {showSplitForm ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Tenant Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTenantEmail}
                  onChange={(e) => setNewTenantEmail(e.target.value)}
                  placeholder="Enter tenant's email"
                />
              </div>
              <div>
                <Label htmlFor="share">Share Percentage</Label>
                <Input
                  id="share"
                  type="number"
                  value={newTenantShare}
                  onChange={(e) => setNewTenantShare(Number(e.target.value))}
                  placeholder="Enter share percentage"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddTenant}
                  disabled={!newTenantEmail || newTenantShare <= 0}
                >
                  Add Tenant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSplitForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSplitForm(true)}
            >
              Add Tenant to Split
            </Button>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 