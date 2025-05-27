'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getProperties, getPaymentsByProperty, getTicketsByProperty } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Building2, Users, CreditCard, Wrench } from 'lucide-react';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<any[]>([]);
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [propertiesData, paymentsData, ticketsData] = await Promise.all([
          getProperties(),
          getPaymentsByProperty(user.property_id ?? ''),
          getTicketsByProperty(user.property_id ?? ''),
        ]);

        setProperties(propertiesData);
        setPayments(paymentsData);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <MainLayout userRole="landlord">
        <div>Loading...</div>
      </MainLayout>
    );
  }

  const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0);
  const openTickets = tickets.filter((ticket) => ticket.status === 'open');
  const occupancyRate = (properties.reduce((sum, property) => sum + (property.occupied_units || 0), 0) /
    properties.reduce((sum, property) => sum + (property.total_units || 0), 0)) * 100;

  return (
    <MainLayout userRole="landlord">
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-xs text-muted-foreground">
                {properties.length === 1 ? 'Property' : 'Properties'} managed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {properties.reduce((sum, property) => sum + (property.tenants?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Active tenants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTickets.length}</div>
              <p className="text-xs text-muted-foreground">
                Pending requests
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Property Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {property.occupied_units}/{property.total_units} Units
                      </p>
                      <Progress
                        value={(property.occupied_units / property.total_units) * 100}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...payments, ...tickets]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {item.type === 'payment' ? 'Payment Received' : item.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.type === 'payment' ? (
                          <p className="font-medium text-green-600">
                            {formatCurrency(item.amount)}
                          </p>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.status === 'open'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => window.location.href = '/properties'}>
            Manage Properties
          </Button>
          <Button onClick={() => window.location.href = '/tenants'}>
            View Tenants
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 