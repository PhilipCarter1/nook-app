import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { getOrganization } from '@/lib/services/organization';
import { getSubscription } from '@/lib/services/billing';
import { getOrganizationUsage } from '@/lib/services/usage';
import { subscriptionPlans } from '@/lib/services/billing';

export const metadata: Metadata = {
  title: 'Subscription Settings | Nook',
  description: 'Manage your Nook subscription',
};

export default async function SubscriptionPage() {
  const organization = await getOrganization();
  if (!organization) {
    redirect('/auth/signin');
  }

  const subscription = await getSubscription(organization.id);
  const usage = await getOrganizationUsage(organization.id);

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-8">Subscription & Billing</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {subscription?.plan_id
                  ? subscriptionPlans.find((p) => p.id === subscription.plan_id)
                       ?.name
                  : 'Trial'}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription?.plan_id
                  ? subscriptionPlans.find((p) => p.id === subscription.plan_id)
                       ?.name
                  : 'Free trial'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                Next billing date
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Properties</span>
                <p className="text-lg font-medium">
                  {usage.properties} /{' '}
                  {subscriptionPlans.find((p) => p.id === subscription?.plan_id)
                    ?.maxProperties || '∞'}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span>Units</span>
                <p className="text-lg font-medium">
                  {usage.units} /{' '}
                  {subscriptionPlans.find((p) => p.id === subscription?.plan_id)
                    ?.maxUnits || '∞'}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span>Users</span>
                <p className="text-lg font-medium">
                  {usage.users} /{' '}
                  {subscriptionPlans.find((p) => p.id === subscription?.plan_id)
                    ?.maxUsers || '∞'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 