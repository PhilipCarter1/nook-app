import React from 'react';
import { log } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getClient } from '@/lib/supabase/client';
import { CheckCircle2, AlertCircle, Clock, CreditCard, Send, Share2, Building2, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PremiumLayout,
} from '@/components/layout/PremiumLayout';
import { PremiumCard, PremiumCardHeader, PremiumCardContent } from '@/components/ui/PremiumCard';
import { premiumComponents, premiumAnimations } from '@/lib/theme';
import { cn } from '@/lib/utils';
interface Tenant {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  share_percentage: number;
  share_amount: number;
  paid_amount: number;
  status: 'paid' | 'partial' | 'unpaid';
  last_payment_date?: string;
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

interface SplitRentPaymentProps {
  id: string;
  totalAmount: number;
  dueDate: string;
  onPaymentComplete: () => void;
}

export default function SplitRentPayment({
  id,
  totalAmount,
  dueDate,
  onPaymentComplete,
}: SplitRentPaymentProps) {
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [isSplitEnabled, setIsSplitEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('');
  const { toast } = useToast();
  const supabase = getClient();

  React.useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tenantsData, settingsData] = await Promise.all([
        supabase
          .from('rent_splits')
          .select(`
            *,
            tenant:users (
              id,
              name,
              email,
              avatar_url
            ),
            payments (
              amount,
              created_at,
              status
            )
          `)
          .eq('property_id', id),
        supabase
          .from('property_settings')
          .select('*')
          .eq('property_id', id)
          .single()
      ]);

      if (tenantsData.error) throw tenantsData.error;
      if (settingsData.error) throw settingsData.error;

      const formattedTenants = tenantsData.data.map((split: any) => {
        const totalPaid = split.payments.reduce((sum: number, payment: any) => 
          sum + (payment.status === 'completed' ? payment.amount : 0), 0);
        
        return {
          id: split.tenant.id,
          name: split.tenant.name,
          email: split.tenant.email,
          avatar_url: split.tenant.avatar_url,
          share_percentage: split.share_percentage,
          share_amount: (totalAmount * split.share_percentage) / 100,
          paid_amount: totalPaid,
          status: getPaymentStatus(totalPaid, (totalAmount * split.share_percentage) / 100),
          last_payment_date: split.payments[0]?.created_at,
        };
      });

      setTenants(formattedTenants);
      setPaymentMethods(settingsData.data.payment_methods || []);
      setIsSplitEnabled(settingsData.data.split_rent_enabled);
    } catch (error) {
      log.error('Error fetching data:', error);
      setError('Failed to load information');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (paid: number, total: number): 'paid' | 'partial' | 'unpaid' => {
    if (paid >= total) return 'paid';
    if (paid > 0) return 'partial';
    return 'unpaid';
  };

  const handlePayment = async (tenantId: string, amount: number) => {
    if (!selectedPaymentMethod) {
      toast({
        title: 'Error',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return;
    }

    try {
      const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
      if (!method) throw new Error('Payment method not found');

      // Check amount limits
      if (method.details.minimumAmount && amount < method.details.minimumAmount) {
        toast({
          title: 'Error',
          description: `Minimum payment amount is ${formatCurrency(method.details.minimumAmount)}`,
          variant: 'destructive',
        });
        return;
      }

      if (method.details.maximumAmount && amount > method.details.maximumAmount) {
        toast({
          title: 'Error',
          description: `Maximum payment amount is ${formatCurrency(method.details.maximumAmount)}`,
          variant: 'destructive',
        });
        return;
      }

      // Calculate fees
      let finalAmount = amount;
      if (method.details.fees) {
        if (method.details.fees.type === 'percentage') {
          finalAmount += (amount * method.details.fees.amount) / 100;
        } else {
          finalAmount += method.details.fees.amount;
        }
      }

      const { data: session, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount: finalAmount,
          propertyId: id,
          userId: tenantId,
          type: 'rent',
          paymentMethod: method.type,
        },
      });

      if (error) throw error;

      window.location.href = session.url;
    } catch (error) {
      log.error('Error creating payment session:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async (tenantId: string) => {
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) return;

      const shareUrl = `${window.location.origin}/pay-rent/${id}/${tenantId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: 'Link Copied',
        description: 'Share this link with the tenant to pay their share',
      });
    } catch (error) {
      log.error('Error sharing payment link:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy payment link',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">Partial</Badge>;
      default:
        return <Badge className="bg-red-500">Unpaid</Badge>;
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const totalPaid = tenants.reduce((sum, tenant) => sum + tenant.paid_amount, 0);
  const progress = (totalPaid / totalAmount) * 100;

  if (loading) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PremiumLayout>
    );
  }

  if (!isSplitEnabled) {
    return (
      <PremiumLayout>
        <PremiumCard>
          <PremiumCardHeader>
            <h2 className="text-xl font-semibold">Rent Payment</h2>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="text-center py-8">
              <p className="text-neutral-600">Split rent is currently disabled for this property.</p>
              <p className="text-sm text-neutral-500 mt-2">Please contact your landlord for payment instructions.</p>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="space-y-6">
        <PremiumCard>
          <PremiumCardHeader>
            <h2 className="text-2xl font-semibold">Split Rent Payment</h2>
            <p className="text-sm text-neutral-500">
              Manage rent payments for multiple tenants
            </p>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="grid grid-cols-1 gap-4">
              {tenants.map((tenant) => (
                <PremiumCard key={tenant.id} className={premiumComponents.card.hover}>
                  <PremiumCardContent>
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
                          <p className="text-sm text-neutral-500">{tenant.email}</p>
                          {tenant.last_payment_date && (
                            <p className="text-xs text-neutral-500">
                              Last payment: {new Date(tenant.last_payment_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(tenant.status)}
                        </div>
                        <p className="text-sm">
                          Share: {formatCurrency(tenant.share_amount)} ({tenant.share_percentage}%)
                        </p>
                        <p className="text-sm">
                          Paid: {formatCurrency(tenant.paid_amount)}
                        </p>
                        <div className="flex gap-2 justify-end">
                          {tenant.status !== 'paid' && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className={cn(
                                      premiumComponents.button.base,
                                      premiumComponents.button.primary
                                    )}
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Pay {formatCurrency(tenant.share_amount - tenant.paid_amount)}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className={premiumComponents.dialog.content}>
                                  <DialogHeader>
                                    <DialogTitle>Select Payment Method</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <Select
                                      value={selectedPaymentMethod}
                                      onValueChange={setSelectedPaymentMethod}
                                    >
                                      <SelectTrigger className={premiumComponents.select.base}>
                                        <SelectValue placeholder="Select payment method" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {paymentMethods
                                          .filter(method => method.isEnabled)
                                          .map(method => (
                                            <SelectItem key={method.id} value={method.id}>
                                              <div className="flex items-center gap-2">
                                                {getPaymentMethodIcon(method.type)}
                                                <span className="capitalize">{method.type.replace('_', ' ')}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    {selectedPaymentMethod && (
                                      <div className="space-y-2">
                                        <p className="text-sm text-neutral-500">
                                          Processing time: {paymentMethods.find(m => m.id === selectedPaymentMethod)?.details.processingTime}
                                        </p>
                                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.details.fees && (
                                          <p className="text-sm text-neutral-500">
                                            Fee: {paymentMethods.find(m => m.id === selectedPaymentMethod)?.details.fees?.type === 'percentage' 
                                              ? `${paymentMethods.find(m => m.id === selectedPaymentMethod)?.details.fees?.amount}%`
                                              : formatCurrency(paymentMethods.find(m => m.id === selectedPaymentMethod)?.details.fees?.amount || 0)}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    <Button
                                      className={cn(
                                        premiumComponents.button.base,
                                        premiumComponents.button.primary,
                                        'w-full'
                                      )}
                                      onClick={() => handlePayment(tenant.id, tenant.share_amount - tenant.paid_amount)}
                                      disabled={!selectedPaymentMethod}
                                    >
                                      Pay {formatCurrency(tenant.share_amount - tenant.paid_amount)}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="outline"
                                className={cn(
                                  premiumComponents.button.base,
                                  premiumComponents.button.outline
                                )}
                                onClick={() => handleShare(tenant.id)}
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
} 