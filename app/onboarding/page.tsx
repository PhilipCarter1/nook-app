'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/providers/auth-provider';
import { getClient } from '@/lib/supabase/client';

const steps = [
  {
    title: 'Personal Information',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
    ],
  },
  {
    title: 'Company Details',
    fields: [
      { name: 'companyName', label: 'Company Name', type: 'text', required: true },
      { name: 'companyType', label: 'Company Type', type: 'select', options: ['LLC', 'Corporation', 'Sole Proprietorship'], required: true },
      { name: 'taxId', label: 'Tax ID / EIN', type: 'text', required: true },
    ],
  },
  {
    title: 'Property Information',
    fields: [
      { name: 'propertyName', label: 'Property Name', type: 'text', required: true },
      { name: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { name: 'propertyType', label: 'Property Type', type: 'select', options: ['Apartment', 'House', 'Condo', 'Commercial'], required: true },
      { name: 'units', label: 'Number of Units', type: 'number', required: true },
    ],
  },
  {
    title: 'Payment Setup',
    fields: [
      { name: 'bankName', label: 'Bank Name', type: 'text', required: true },
      { name: 'accountNumber', label: 'Account Number', type: 'text', required: true },
      { name: 'routingNumber', label: 'Routing Number', type: 'text', required: true },
    ],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Create company record
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companyName,
          type: formData.companyType,
          tax_id: formData.taxId,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create property record
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          name: formData.propertyName,
          address: formData.propertyAddress,
          type: formData.propertyType,
          units: parseInt(formData.units),
          company_id: company.id,
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          company_id: company.id,
          role: 'landlord',
        })
        .eq('id', user.id);

      if (userError) throw userError;

      router.push('/dashboard');
    } catch (error) {
      console.error('Error during onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {currentStepData.title}
            </CardTitle>
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="mt-4" />
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
              {currentStepData.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      required={field.required}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-between pt-4">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button type="submit" className="ml-auto" disabled={loading}>
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 