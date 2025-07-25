import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Settings, Plus, CheckCircle } from 'lucide-react';
import { log } from '@/lib/logger';
import { Switch } from '@/components/ui/switch';
import Stripe from 'stripe';
import { getClient } from '@/lib/supabase/client';
import { toast } from '@/lib/hooks/use-toast';
interface PaymentConfigProps {
  propertyId?: string;
  unitId?: string;
  level: 'property' | 'unit';
}

export function PaymentConfig({ propertyId, unitId, level }: PaymentConfigProps) {
  const [config, setConfig] = React.useState({
    stripe_enabled: false,
    bank_transfer_enabled: false,
    paypal_enabled: false,
    stripe_account_id: '',
    bank_account_details: '',
    paypal_email: '',
  });
  const [loading, setLoading] = React.useState(true);
  const supabase = getClient();

  React.useEffect(() => {
    fetchConfig();
  }, [propertyId, unitId]);

  const fetchConfig = async () => {
    try {
      const table = level === 'property' ? 'properties' : 'units';
      const id = level === 'property' ? propertyId : unitId;

      const { data, error } = await supabase
        .from(table)
        .select('payment_config')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data?.payment_config) {
        setConfig(data.payment_config);
      }
    } catch (error) {
      log.error('Error fetching payment config:', error as Error);
      toast({
        title: "Error",
        description: "Failed to load payment configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (method: string, enabled: boolean) => {
    try {
      const updatedConfig = {
        ...config,
        [`${method}_enabled`]: enabled,
      };

      const table = level === 'property' ? 'properties' : 'units';
      const id = level === 'property' ? propertyId : unitId;

      const { error } = await supabase
        .from(table)
        .update({ payment_config: updatedConfig })
        .eq('id', id);

      if (error) throw error;

      setConfig(updatedConfig);
      toast({
        title: "Success",
        description: `Payment method ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      log.error('Error updating payment config:', error as Error);
      toast({
        title: "Error",
        description: "Failed to update payment configuration",
        variant: "destructive"
      });
    }
  };

  const handleStripeConnect = async () => {
    try {
      const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      const accountLink = await stripe.accountLinks.create({
        account: config.stripe_account_id,
        refresh_url: `${window.location.origin}/dashboard/landlord`,
        return_url: `${window.location.origin}/dashboard/landlord`,
        type: 'account_onboarding',
      });

      window.location.href = accountLink.url;
    } catch (error) {
      log.error('Error connecting Stripe account:', error as Error);
      toast({
        title: "Error",
        description: "Failed to connect Stripe account",
        variant: "destructive"
      });
    }
  };

  const handleSaveDetails = async (method: string, value: string) => {
    try {
      const updatedConfig = {
        ...config,
        [`${method}`]: value,
      };

      const table = level === 'property' ? 'properties' : 'units';
      const id = level === 'property' ? propertyId : unitId;

      const { error } = await supabase
        .from(table)
        .update({ payment_config: updatedConfig })
        .eq('id', id);

      if (error) throw error;

      setConfig(updatedConfig);
      toast({
        title: "Success",
        description: "Payment details updated"
      });
    } catch (error) {
      log.error('Error updating payment details:', error as Error);
      toast({
        title: "Error",
        description: "Failed to update payment details",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="stripe">Stripe</Label>
                <p className="text-sm text-gray-500">
                  Accept credit card payments securely
                </p>
              </div>
              <Switch
                id="stripe"
                checked={config.stripe_enabled}
                onCheckedChange={(checked) => handleToggle('stripe', checked)}
              />
            </div>

            {config.stripe_enabled && level === 'property' && (
              <div className="space-y-2">
                {config.stripe_account_id ? (
                  <Button
                    variant="outline"
                    onClick={handleStripeConnect}
                  >
                    Manage Stripe Account
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleStripeConnect}
                  >
                    Connect Stripe Account
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="bank">Bank Transfer</Label>
                <p className="text-sm text-gray-500">
                  Accept manual bank transfers
                </p>
              </div>
              <Switch
                id="bank"
                checked={config.bank_transfer_enabled}
                onCheckedChange={(checked) => handleToggle('bank_transfer', checked)}
              />
            </div>

            {config.bank_transfer_enabled && (
              <div className="space-y-2">
                <Label htmlFor="bank-details">Bank Account Details</Label>
                <Input
                  id="bank-details"
                  value={config.bank_account_details}
                  onChange={(e) => handleSaveDetails('bank_account_details', e.target.value)}
                  placeholder="Enter bank account details"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="paypal">PayPal</Label>
                <p className="text-sm text-gray-500">
                  Accept PayPal payments
                </p>
              </div>
              <Switch
                id="paypal"
                checked={config.paypal_enabled}
                onCheckedChange={(checked) => handleToggle('paypal', checked)}
              />
            </div>

            {config.paypal_enabled && (
              <div className="space-y-2">
                <Label htmlFor="paypal-email">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  value={config.paypal_email}
                  onChange={(e) => handleSaveDetails('paypal_email', e.target.value)}
                  placeholder="Enter PayPal email"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 