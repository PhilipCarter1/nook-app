'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import { DocumentUpload } from '@/components/DocumentUpload';
import DepositPayment from '@/components/DepositPayment';
import LeaseAgreement from '@/components/LeaseAgreement';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { log } from '@/lib/logger';
const MotionDiv = motion.div;

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

const steps = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Enter tenant details and lease terms',
  },
  {
    id: 2,
    title: 'Document Upload',
    description: 'Upload required documents and agreements',
  },
  {
    id: 3,
    title: 'Review & Submit',
    description: 'Review all information and submit for approval',
  },
];

export default function PreLeasePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getClient();

  const [property, setProperty] = React.useState<Property | null>(null);
  const [lease, setLease] = React.useState<Lease | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [currentStep, setCurrentStep] = useState(1);
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
        log.error('Error fetching data:', error as Error);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id, user?.id]);

  const handleDocumentUpload = async (file: File) => {
    try {
      const supabase = getClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setDocuments((prev) => [...prev, publicUrl]);
      if (documents.length >= 2) {
        setCurrentStep(2);
      }
    } catch (error) {
      log.error('Error uploading document:', error as Error);
      toast.error('Failed to upload document');
    }
  };

  const handleDepositComplete = () => {
    setCurrentStep(3);
  };

  const handleLeaseComplete = () => {
    router.push('/dashboard');
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                {property.name}
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                {property.address}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</div>
              <div className="flex gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      step.id <= currentStep ? 'bg-nook-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  {steps[currentStep - 1].title}
                </CardTitle>
                <p className="text-muted-foreground">
                  {steps[currentStep - 1].description}
                </p>
              </CardHeader>
              <CardContent>
                {currentStep === 1 && (
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
                      onUpload={handleDocumentUpload}
                      accept={{
                        'application/pdf': ['.pdf'],
                        'image/*': ['.png', '.jpg', '.jpeg']
                      }}
                      maxSize={5 * 1024 * 1024}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <DocumentUpload
                      onUpload={handleDocumentUpload}
                      accept={{
                        'application/pdf': ['.pdf'],
                        'image/*': ['.png', '.jpg', '.jpeg']
                      }}
                      maxSize={5 * 1024 * 1024}
                    />
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Uploaded Documents</h3>
                        <ul className="space-y-2">
                          {documents.map((url, index) => (
                            <li key={url} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Document {index + 1}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <DepositPayment
                    propertyId={property.id}
                    userId={user.id}
                    amount={property.security_deposit}
                    onPaymentComplete={handleDepositComplete}
                  />
                )}

                <div className="mt-6 flex justify-between">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="text-nook-purple-600 border-nook-purple-600 hover:bg-nook-purple-50"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    className="bg-nook-purple-600 hover:bg-nook-purple-500 ml-auto"
                  >
                    {currentStep === steps.length ? (
                      <>
                        Submit <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
} 