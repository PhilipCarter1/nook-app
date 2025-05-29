'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getClient } from '@/lib/supabase/client';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface LeaseAgreementProps {
  propertyId: string;
  userId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  onAgreementComplete: () => void;
}

export default function LeaseAgreement({
  propertyId,
  userId,
  tenantId,
  startDate,
  endDate,
  monthlyRent,
  securityDeposit,
  onAgreementComplete,
}: LeaseAgreementProps) {
  const [loading, setLoading] = React.useState(false);
  const [agreementUrl, setAgreementUrl] = React.useState('');
  const [signed, setSigned] = React.useState(false);
  const [error, setError] = React.useState('');
  const supabase = getClient();

  const generateLeaseAgreement = async () => {
    setLoading(true);
    setError('');
    try {
      // Generate lease agreement using Edge Function
      const { data, error } = await supabase.functions.invoke('generate-lease-agreement', {
        body: {
          propertyId,
          userId,
          tenantId,
          startDate,
          endDate,
          monthlyRent,
          securityDeposit,
        },
      });

      if (error) throw error;

      setAgreementUrl(data.url);
    } catch (error) {
      console.error('Error generating lease agreement:', error);
      setError('Failed to generate lease agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignAgreement = async () => {
    setLoading(true);
    setError('');
    try {
      // Sign lease agreement using Edge Function
      const { data, error } = await supabase.functions.invoke('sign-lease-agreement', {
        body: {
          agreementUrl,
          userId,
          tenantId,
        },
      });

      if (error) throw error;

      // Update lease status in database
      const { error: updateError } = await supabase
        .from('leases')
        .update({ status: 'signed' })
        .eq('property_id', propertyId)
        .eq('tenant_id', tenantId);

      if (updateError) throw updateError;

      setSigned(true);
      onAgreementComplete();
    } catch (error) {
      console.error('Error signing lease agreement:', error);
      setError('Failed to sign lease agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lease Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">Lease Term</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Monthly Rent</p>
                  <p className="text-2xl font-bold">${monthlyRent}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">Security Deposit</h3>
                  <p className="text-sm text-gray-500">Required before move-in</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${securityDeposit}</p>
                </div>
              </div>
            </div>

            {!agreementUrl ? (
              <Button
                className="w-full"
                onClick={generateLeaseAgreement}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Lease Agreement'}
              </Button>
            ) : !signed ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>Lease agreement generated successfully</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSignAgreement}
                  disabled={loading}
                >
                  {loading ? 'Signing...' : 'Sign Lease Agreement'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Lease agreement signed successfully</span>
              </div>
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
    </div>
  );
} 