import React from 'react';
import { log } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getClient } from '@/lib/supabase/client';
import { Settings, CreditCard, Building2, Wallet } from 'lucide-react';
import {
  PremiumLayout,
} from '@/components/layout/PremiumLayout';
import { PremiumCard, PremiumCardHeader, PremiumCardContent } from '@/components/ui/PremiumCard';
import { premiumComponents, premiumAnimations } from '@/lib/theme';
import { cn } from '@/lib/utils';
interface SplitRentSettingsProps {
  id: string;
  onUpdate: () => void;
}

interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'credit_card' | 'zelle' | 'venmo' | 'apple_pay' | 'paypal' | 'check' | 'cash';
  isEnabled: boolean;
  details: {
    minimumAmount?: number;
    maximumAmount?: number;
    processingTime?: string;
    fees?: {
      type: 'percentage' | 'fixed';
      amount: number;
    };
  };
}

export default function SplitRentSettings({
  id,
  onUpdate,
}: SplitRentSettingsProps) {
  const [isSplitEnabled, setIsSplitEnabled] = React.useState(true);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const supabase = getClient();

  React.useEffect(() => {
    fetchSettings();
  }, [id]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('property_settings')
        .select('*')
        .eq('property_id', id)
        .single();

      if (error) throw error;

      setIsSplitEnabled(data.split_rent_enabled);
      setPaymentMethods(data.payment_methods || []);
    } catch (error) {
      log.error('Error fetching settings:', error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSplitToggle = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('property_settings')
        .update({ split_rent_enabled: enabled })
        .eq('property_id', id);

      if (error) throw error;

      setIsSplitEnabled(enabled);
      toast({
        title: 'Settings Updated',
        description: `Split rent ${enabled ? 'enabled' : 'disabled'}`,
      });
      onUpdate();
    } catch (error) {
      log.error('Error updating split rent setting:', error as Error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentMethodToggle = async (methodId: string, enabled: boolean) => {
    try {
      const updatedMethods = paymentMethods.map(method =>
        method.id === methodId ? { ...method, isEnabled: enabled } : method
      );

      const { error } = await supabase
        .from('property_settings')
        .update({ payment_methods: updatedMethods })
        .eq('property_id', id);

      if (error) throw error;

      setPaymentMethods(updatedMethods);
      toast({
        title: 'Settings Updated',
        description: `Payment method ${enabled ? 'enabled' : 'disabled'}`,
      });
      onUpdate();
    } catch (error) {
      log.error('Error updating payment method:', error as Error);
      toast({
        title: 'Error',
        description: 'Failed to update payment method',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentMethodUpdate = async (methodId: string, updates: Partial<PaymentMethod['details']>) => {
    try {
      const updatedMethods = paymentMethods.map(method =>
        method.id === methodId
          ? { ...method, details: { ...method.details, ...updates } }
          : method
      );

      const { error } = await supabase
        .from('property_settings')
        .update({ payment_methods: updatedMethods })
        .eq('property_id', id);

      if (error) throw error;

      setPaymentMethods(updatedMethods);
      toast({
        title: 'Settings Updated',
        description: 'Payment method details updated',
      });
      onUpdate();
    } catch (error) {
      log.error('Error updating payment method details:', error as Error);
      toast({
        title: 'Error',
        description: 'Failed to update payment method details',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <PremiumCard>
        <PremiumCardHeader>
          <h2 className="text-xl font-semibold">Split Rent Settings</h2>
        </PremiumCardHeader>
        <PremiumCardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Split Rent</Label>
                <p className="text-sm text-neutral-500">
                  Allow tenants to pay their share of the rent separately
                </p>
              </div>
              <Switch
                checked={isSplitEnabled}
                onCheckedChange={handleSplitToggle}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Payment Methods</h3>
              {/* PremiumGrid is removed, so we'll render cards directly */}
              {paymentMethods.map((method) => (
                <PremiumCard key={method.id} className={premiumComponents.card.hover}>
                  <PremiumCardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {method.type === 'bank_transfer' && <Building2 className="h-4 w-4" />}
                          {method.type === 'credit_card' && <CreditCard className="h-4 w-4" />}
                          {method.type === 'cash' && <Wallet className="h-4 w-4" />}
                          <Label className="capitalize">{method.type.replace('_', ' ')}</Label>
                        </div>
                        <Switch
                          checked={method.isEnabled}
                          onCheckedChange={(enabled) => handlePaymentMethodToggle(method.id, enabled)}
                        />
                      </div>

                      {method.isEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Minimum Amount</Label>
                            <Input
                              type="number"
                              className={premiumComponents.input.base}
                              value={method.details.minimumAmount}
                              onChange={(e) => handlePaymentMethodUpdate(method.id, {
                                minimumAmount: Number(e.target.value)
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Maximum Amount</Label>
                            <Input
                              type="number"
                              className={premiumComponents.input.base}
                              value={method.details.maximumAmount}
                              onChange={(e) => handlePaymentMethodUpdate(method.id, {
                                maximumAmount: Number(e.target.value)
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Processing Time</Label>
                            <Input
                              className={premiumComponents.input.base}
                              value={method.details.processingTime}
                              onChange={(e) => handlePaymentMethodUpdate(method.id, {
                                processingTime: e.target.value
                              })}
                              placeholder="e.g., 1-2 business days"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fee Type</Label>
                            <Select
                              value={method.details.fees?.type}
                              onValueChange={(value: 'percentage' | 'fixed') => handlePaymentMethodUpdate(method.id, {
                                fees: { 
                                  type: value,
                                  amount: method.details.fees?.amount || 0
                                }
                              })}
                            >
                              <SelectTrigger className={premiumComponents.select.base}>
                                <SelectValue placeholder="Select fee type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {method.details.fees?.type && (
                            <div className="space-y-2">
                              <Label>Fee Amount</Label>
                              <Input
                                type="number"
                                className={premiumComponents.input.base}
                                value={method.details.fees.amount}
                                onChange={(e) => handlePaymentMethodUpdate(method.id, {
                                  fees: { 
                                    type: method.details.fees?.type || 'fixed',
                                    amount: Number(e.target.value)
                                  }
                                })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              ))}
            </div>
          </div>
        </PremiumCardContent>
      </PremiumCard>
    </PremiumLayout>
  );
} 