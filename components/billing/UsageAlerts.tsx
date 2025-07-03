import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Users, Home, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getUsageAlerts, checkUsageLimits } from '@/lib/services/usage';
import { formatNumber } from '@/lib/utils';

interface UsageAlertsProps {
  organizationId: string;
}

export function UsageAlerts({ organizationId }: UsageAlertsProps) {
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['usage-alerts', organizationId],
    queryFn: () => getUsageAlerts(organizationId),
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-limits', organizationId],
    queryFn: () => checkUsageLimits(organizationId),
  });

  if (alertsLoading || usageLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-2 bg-muted animate-pulse rounded w-1/3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!usage) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'properties':
        return <Home className="h-4 w-4" />;
      case 'units':
        return <Building2 className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case 'properties':
        return 'Properties';
      case 'units':
        return 'Units';
      case 'users':
        return 'Users';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Properties</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(usage.propertyCount)} / {formatNumber(usage.limits.properties)}
                </span>
              </div>
              <Progress
                value={(usage.propertyCount / usage.limits.properties) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>Units</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(usage.unitCount)} / {formatNumber(usage.limits.units)}
                </span>
              </div>
              <Progress
                value={(usage.unitCount / usage.limits.units) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Superintendents</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(usage.superCount)} / {formatNumber(usage.limits.supers)}
                </span>
              </div>
              <Progress
                value={(usage.superCount / usage.limits.supers) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Administrators</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(usage.adminCount)} / {formatNumber(usage.limits.admins)}
                </span>
              </div>
              <Progress
                value={(usage.adminCount / usage.limits.admins) * 100}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {getTitle(alert.type)} Limit Warning
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have reached {formatNumber(alert.current_value)} out of{' '}
                      {formatNumber(alert.limit_value)} {alert.type}. Consider
                      upgrading your plan to add more {alert.type}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 