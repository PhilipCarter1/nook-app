import { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Welcome to Nook | Nook',
  description: 'Get started with Nook',
};

export default async function WelcomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Check if user has completed onboarding
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.organization_id)
    .single();

  if (organization?.onboarding_completed) {
    redirect('/dashboard');
  }

  const steps = [
    {
      title: 'Complete Your Profile',
      description: 'Add your contact information and preferences',
      href: '/dashboard/settings/profile',
    },
    {
      title: 'Add Your Properties',
      description: 'Start by adding your first property',
      href: '/dashboard/properties/new',
    },
    {
      title: 'Invite Your Team',
      description: 'Add property managers and administrators',
      href: '/dashboard/team/invite',
    },
    {
      title: 'Set Up Billing',
      description: 'Configure your payment method',
      href: '/dashboard/billing',
    },
  ];

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to Nook!</h1>
            <p className="text-xl text-muted-foreground">
              Let's get your account set up. Follow these steps to get started.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={step.title}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle>{step.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      'use server';
                      if (index === steps.length - 1) {
                        // Mark onboarding as completed
                        await supabase
                          .from('organizations')
                          .update({ onboarding_completed: true })
                          .eq('id', user.organization_id);
                      }
                      redirect(step.href);
                    }}
                  >
                    {index === steps.length - 1 ? 'Complete Setup' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{' '}
              <a
                href="mailto:support@rentwithnook.com"
                className="text-primary hover:underline"
              >
                support@rentwithnook.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 