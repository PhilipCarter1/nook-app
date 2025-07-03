import { db } from '@/lib/db';
import { usageAlerts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendUsageAlert } from './email';

export interface UsageMetrics {
  properties: number;
  units: number;
  users: number;
}

export async function getOrganizationUsage(organizationId: string): Promise<UsageMetrics> {
  const [properties, units, users] = await Promise.all([
    db.query.properties.count({
      where: eq(properties.organizationId, organizationId),
    }),
    db.query.units.count({
      where: eq(units.organizationId, organizationId),
    }),
    db.query.organizationMembers.count({
      where: eq(organizationMembers.organizationId, organizationId),
    }),
  ]);

  return {
    properties,
    units,
    users,
  };
}

export async function checkUsageLimits(organizationId: string): Promise<void> {
  const usage = await getOrganizationUsage(organizationId);
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, organizationId),
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, organizationId),
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  const plan = await db.query.subscriptionPlans.findFirst({
    where: eq(subscriptionPlans.id, subscription.planId),
  });

  if (!plan) {
    throw new Error('Subscription plan not found');
  }

  // Check each metric against limits
  const metrics = [
    { type: 'properties', current: usage.properties, limit: plan.maxProperties },
    { type: 'units', current: usage.units, limit: plan.maxUnits },
    { type: 'users', current: usage.users, limit: plan.includedUsers },
  ];

  for (const metric of metrics) {
    const alertThreshold = Math.floor(metric.limit * 0.8); // Alert at 80% of limit

    if (metric.current >= alertThreshold) {
      // Check if alert already exists
      const existingAlert = await db.query.usageAlerts.findFirst({
        where: eq(usageAlerts.organizationId, organizationId),
      });

      if (!existingAlert) {
        // Create new alert
        await db.insert(usageAlerts).values({
          organizationId,
          type: metric.type,
          currentValue: metric.current,
          limitValue: metric.limit,
          status: 'active',
        });

        // Send email notification
        const organizationMember = await db.query.organizationMembers.findFirst({
          where: eq(organizationMembers.organizationId, organizationId),
        });

        if (organizationMember) {
          const user = await db.query.users.findFirst({
            where: eq(users.id, organizationMember.userId),
          });

          if (user?.email) {
            await sendUsageAlert(
              user.email,
              metric.type,
              metric.current,
              metric.limit
            );
          }
        }
      }
    }
  }
}

export async function getActiveAlerts(organizationId: string) {
  return db.query.usageAlerts.findMany({
    where: eq(usageAlerts.organizationId, organizationId),
  });
}

export async function dismissAlert(alertId: string) {
  await db
    .update(usageAlerts)
    .set({ status: 'dismissed' })
    .where(eq(usageAlerts.id, alertId));
} 