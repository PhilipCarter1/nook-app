'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import DocumentUpload from '@/components/DocumentUpload';
import DepositPayment from '@/components/DepositPayment';
import LeaseAgreement from '@/components/LeaseAgreement';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
  security_deposit: number;
}

interface Lease {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function PreLeasePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getClient();

  const [property, setProperty] = React.useState<Property | null>(null);
  const [lease, setLease] = React.useState<Lease | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [currentStep, setCurrentStep] = React.useState(1);
  const [documents, setDocuments] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!params?.id || !user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', params.id)
          .single();

        if (propertyError) throw propertyError;
        setProperty(propertyData);

        // Fetch lease details
        const { data: leaseData, error: leaseError } = await supabase
          .from('leases')
          .select('*')
          .eq('property_id', params.id)
          .eq('tenant_id', user.id)
          .single();

        if (leaseError && leaseError.code !== 'PGRST116') throw leaseError;
        setLease(leaseData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id, user?.id]);

  const handleDocumentUpload = (url: string) => {
    setDocuments((prev) => [...prev, url]);
    if (documents.length >= 2) {
      setCurrentStep(2);
    }
  };

  const handleDepositComplete = () => {
    setCurrentStep(3);
  };

  const handleLeaseComplete = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property || !user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-500">{error || 'Property not found'}</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/dashboard/properties')}
          >
            Return to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <p className="text-gray-500">{property.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
            <div className="flex gap-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 w-2 rounded-full ${
                    step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-500">
                  Please upload the following documents to proceed with your lease application:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    {documents.length > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span>Government-issued ID</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {documents.length > 1 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span>Proof of Income</span>
                  </li>
                </ul>
                <DocumentUpload
                  onUploadComplete={handleDocumentUpload}
                  onUploadError={(error: Error) => console.error('Upload error:', error)}
                  acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                  propertyId={property.id}
                  userId={user.id}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <DepositPayment
            propertyId={property.id}
            userId={user.id}
            amount={property.security_deposit}
            onPaymentComplete={handleDepositComplete}
          />
        )}

        {currentStep === 3 && (
          <LeaseAgreement
            propertyId={property.id}
            userId={user.id}
            tenantId={user.id}
            startDate={lease?.start_date || new Date().toISOString()}
            endDate={lease?.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
            monthlyRent={property.monthly_rent}
            securityDeposit={property.security_deposit}
            onAgreementComplete={handleLeaseComplete}
          />
        )}
      </div>
    </div>
  );
} 