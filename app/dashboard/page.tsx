'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getProperties, getPaymentsByProperty, getTicketsByProperty } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CreditCard, Wrench } from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [properties, setProperties] = React.useState<any[]>([]);
  const [payments, setPayments] = React.useState<any[]>([]);
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const propertiesData = await getProperties();
        setProperties(propertiesData || []);

        // For tenants, only show their property's data
        if (role === 'tenant') {
          const propertyId = propertiesData?.[0]?.id;
          if (propertyId) {
            const [paymentsData, ticketsData] = await Promise.all([
              getPaymentsByProperty(propertyId),
              getTicketsByProperty(propertyId),
            ]);
            setPayments(paymentsData || []);
            setTickets(ticketsData || []);
          }
        } else {
          // For landlords and admins, show all data
          const paymentsData = await Promise.all(
            propertiesData.map((property) => getPaymentsByProperty(property.id))
          );
          const ticketsData = await Promise.all(
            propertiesData.map((property) => getTicketsByProperty(property.id))
          );
          setPayments(paymentsData.flat() || []);
          setTickets(ticketsData.flat() || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">
              Total properties managed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">
              Total payments processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Tickets</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Total maintenance tickets
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Properties</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id}>
              <CardHeader>
                <CardTitle>{property.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{property.address}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {property.units} units
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 