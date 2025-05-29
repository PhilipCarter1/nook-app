'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building2, CheckCircle2 } from 'lucide-react';

// Import steps
import CompanyInfo from './steps/company-info';
import PropertySetup from './steps/property-setup';
import FeatureSelection from './steps/feature-selection';
import PaymentSetup from './steps/payment-setup';
import OnboardingComplete from './steps/onboarding-complete';

export default function OnboardingPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [onboardingData, setOnboardingData] = React.useState({
    company: {
      name: '',
      email: '',
    },
    property: {
      address: '',
      unitCount: 0,
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

  const steps = [
    { id: 1, title: 'Company Information', component: CompanyInfo },
    { id: 2, title: 'Property Setup', component: PropertySetup },
    { id: 3, title: 'Feature Selection', component: FeatureSelection },
    { id: 4, title: 'Payment Setup', component: PaymentSetup },
    { id: 5, title: 'Complete', component: OnboardingComplete },
  ];

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

  const handleStepComplete = (stepData: any) => {
    setOnboardingData(prev => ({
      ...prev,
      ...stepData,
    }));
    handleNext();
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Nook</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Let's get your property management set up
          </p>
        </div>

        <div className="mb-8">
          <Progress value={(currentStep / steps.length) * 100} />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  step.id <= currentStep ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    step.id < currentStep
                      ? 'bg-primary text-white'
                      : step.id === currentStep
                      ? 'border-2 border-primary'
                      : 'border-2 border-gray-300'
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span className="text-sm">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              data={onboardingData}
              onComplete={handleStepComplete}
              onBack={handleBack}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 