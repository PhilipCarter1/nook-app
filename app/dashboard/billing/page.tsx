import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/providers/auth-provider';
import { subscriptionPlans, getOrganizationSubscription, calculateSubscriptionCost } from '@/lib/services/billing';
import { Check } from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = React.useState<string>('starter');

  const { data: subscription } = useQuery({
    queryKey: ['organization-subscription'],
    queryFn: () => getOrganizationSubscription('current'), // You'll need to get the current org ID
    enabled: user?.role === 'landlord',
  });

  const { data: costEstimate } = useQuery({
    queryKey: ['subscription-cost', selectedPlan, billingCycle],
    queryFn: () => calculateSubscriptionCost('current', selectedPlan, billingCycle),
    enabled: user?.role === 'landlord',
  });

  if (user?.role !== 'landlord') {
    return (
      <MainLayout>
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Billing</h1>
          <p className="text-muted-foreground">
            Billing is managed by your organization administrator.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing preferences
            </p>
          </div>
          <RadioGroup
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'annual')}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="annual" id="annual" />
              <Label htmlFor="annual">Annual (Save 20%)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                selectedPlan === plan.id ? 'border-primary' : ''
              }`}
            >
              {selectedPlan === plan.id && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      ${billingCycle === 'annual' ? plan.price * 12 * 0.8 : plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Up to {plan.maxProperties === -1 ? 'Unlimited' : plan.maxProperties} properties</p>
                  <p>Up to {plan.maxUnits === -1 ? 'Unlimited' : plan.maxUnits} units</p>
                  <p>Up to {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} users</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={selectedPlan === plan.id ? 'default' : 'outline'}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {costEstimate && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Plan</span>
                  <span>${costEstimate.basePlanCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Additional Users</span>
                  <span>${costEstimate.additionalUsersCost}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${costEstimate.totalCost}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade Now</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </MainLayout>
  );
} 