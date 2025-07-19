'use client';

import React, { useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Import steps
import CompanyInfo from './steps/company-info';
import PropertySetup from './steps/property-setup';
import FeatureSelection from './steps/feature-selection';
import PaymentSetup from './steps/payment-setup';
import OnboardingComplete from './steps/onboarding-complete';

const MotionDiv = motion.div;

const steps = [
  {
    id: 1,
    title: 'Personal Info',
    component: CompanyInfo,
  },
  {
    id: 2,
    title: 'Property Details',
    component: PropertySetup,
  },
  {
    id: 3,
    title: 'Preferences',
    component: FeatureSelection,
  },
  {
    id: 4,
    title: 'Payment Setup',
    component: PaymentSetup,
  },
  {
    id: 5,
    title: 'Complete',
    component: OnboardingComplete,
  },
];

export default function OnboardingPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    company: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    },
    property: {
      address: '',
      unitCount: 1,
      type: '',
    },
    features: {
      concierge: false,
      legalAssistant: false,
      customBranding: false,
    },
    payment: {
      method: '',
      stripeConnected: false,
    },
  });

  // Redirect if not a landlord
  React.useEffect(() => {
    if (role !== 'landlord') {
      router.push('/dashboard');
    }
  }, [role, router]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepData: any) => {
    setOnboardingData(prev => ({
      ...prev,
      ...stepData,
    }));
    handleNext();
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome to Nook
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Let's get your property management set up
          </p>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-nook-purple-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step.id < currentStep
                      ? 'bg-nook-purple-600 text-white'
                      : step.id === currentStep
                      ? 'border-2 border-nook-purple-600'
                      : 'border-2 border-gray-300'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <CurrentStepComponent
                onComplete={handleStepComplete}
                onBack={handleBack}
                data={onboardingData}
                {...(currentStep === steps.length ? { isLastStep: true } : {})}
              />
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
} 