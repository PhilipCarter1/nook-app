'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Copy, 
  Check, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { getTenantPaymentInfo, type PropertyPaymentMethod } from '@/lib/services/property-payments';

interface TenantPaymentInfoProps {
  propertyId: string;
  propertyName: string;
  tenantId: string;
}

export function TenantPaymentInfo({ propertyId, propertyName, tenantId }: TenantPaymentInfoProps) {
  const [paymentInfo, setPaymentInfo] = useState<{
    paymentMethods: PropertyPaymentMethod[];
    paymentSettings: any;
    rentSplit: any;
    totalRent: number;
    tenantAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentInfo();
  }, [propertyId, tenantId]);

  const loadPaymentInfo = async () => {
    setLoading(true);
    try {
      const result = await getTenantPaymentInfo(propertyId, tenantId);
      
      if (result.success && result.paymentInfo) {
        setPaymentInfo(result.paymentInfo);
      } else {
        toast.error(result.error || 'Failed to load payment information');
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
      toast.error('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const renderPaymentMethodDetails = (method: PropertyPaymentMethod) => {
    const { details } = method;
    
    switch (method.type) {
      case 'bank_transfer':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Number:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {details.accountNumber}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.accountNumber || '', `account-${method.id}`)}
                >
                  {copiedField === `account-${method.id}` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Routing Number:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {details.routingNumber}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.routingNumber || '', `routing-${method.id}`)}
                >
                  {copiedField === `routing-${method.id}` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Bank:</strong> {details.bankName}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Account Holder:</strong> {details.accountHolderName}
            </div>
          </div>
        );
      case 'zelle':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Zelle Email:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {details.zelleEmail}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.zelleEmail || '', `zelle-email-${method.id}`)}
                >
                  {copiedField === `zelle-email-${method.id}` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {details.zellePhone && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zelle Phone:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {details.zellePhone}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(details.zellePhone || '', `zelle-phone-${method.id}`)}
                  >
                    {copiedField === `zelle-phone-${method.id}` ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      case 'venmo':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Venmo Username:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  @{details.venmoUsername}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`@${details.venmoUsername}`, `venmo-${method.id}`)}
                >
                  {copiedField === `venmo-${method.id}` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      case 'paypal':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PayPal Email:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {details.paypalEmail}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(details.paypalEmail || '', `paypal-${method.id}`)}
                >
                  {copiedField === `paypal-${method.id}` ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {details.paypalLink && (
              <div className="text-sm text-blue-600">
                <a href={details.paypalLink} target="_blank" rel="noopener noreferrer">
                  PayPal Payment Link
                </a>
              </div>
            )}
          </div>
        );
      case 'check':
        return (
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Make checks payable to:</strong> {details.checkPayableTo}
            </div>
            <div className="text-sm">
              <strong>Mail to:</strong> {details.mailingAddress}
            </div>
          </div>
        );
      default:
        return <div className="text-sm text-gray-600">No details available</div>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment information available</p>
            <p className="text-sm">Contact your landlord for payment details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Rent Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-nook-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Property</p>
                <p className="font-medium">{propertyName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Your Amount</p>
                <p className="text-2xl font-bold text-nook-purple-700">
                  ${paymentInfo.tenantAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {paymentInfo.paymentSettings?.split_rent_enabled && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Split Rent Enabled</p>
                  <p>You only pay your share of the total rent (${paymentInfo.totalRent.toFixed(2)})</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Due Date</span>
              <span>1st of each month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            How to Pay Your Rent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentInfo.paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment methods configured</p>
              <p className="text-sm">Contact your landlord for payment instructions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {paymentInfo.paymentMethods.map((method, index) => (
                <div key={method.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={method.is_default ? "default" : "secondary"}>
                      {method.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <h4 className="font-medium">{method.name}</h4>
                    {method.is_default && (
                      <Badge variant="outline">Recommended</Badge>
                    )}
                  </div>

                  <div className="pl-4 border-l-2 border-gray-200">
                    {renderPaymentMethodDetails(method)}

                    {method.instructions && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Important:</strong> {method.instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  {index < paymentInfo.paymentMethods.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Payment Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-nook-purple-600 rounded-full mt-2"></div>
              <p>Always include your property address or unit number in the payment memo</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-nook-purple-600 rounded-full mt-2"></div>
              <p>Payments are due on the 1st of each month</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-nook-purple-600 rounded-full mt-2"></div>
              <p>Late fees may apply after the grace period</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-nook-purple-600 rounded-full mt-2"></div>
              <p>Keep receipts or confirmation numbers for your records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
