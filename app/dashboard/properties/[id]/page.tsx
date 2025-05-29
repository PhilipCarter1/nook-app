'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, DollarSign, Wrench, FileText } from 'lucide-react';

export default function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const { role } = useAuth();
  const [property, setProperty] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState('overview');

  // Mock data for now - will be replaced with actual data fetching
  const mockProperty = {
    id: params.id,
    name: 'Sunset Apartments',
    address: '123 Main St, San Francisco, CA',
    type: 'apartment',
    units: 12,
    status: 'available',
    monthly_rent: 2500,
    security_deposit: 2500,
    description: 'Beautiful apartment complex with ocean views',
    amenities: ['Parking', 'Pool', 'Gym', 'Laundry'],
    current_tenants: 8,
    maintenance_tickets: 2,
    upcoming_payments: 3,
  };

  React.useEffect(() => {
    // TODO: Fetch property details
    setProperty(mockProperty);
  }, [params.id]);

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{property.address}</p>
        </div>
        {role === 'landlord' && (
          <Button>Edit Property</Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Units</CardTitle>
                <Building2 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{property.units}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Tenants</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{property.current_tenants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <Wrench className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{property.maintenance_tickets}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{property.upcoming_payments}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Type</h3>
                  <p className="text-gray-500">{property.type}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="text-gray-500">{property.status}</p>
                </div>
                <div>
                  <h3 className="font-medium">Monthly Rent</h3>
                  <p className="text-gray-500">${property.monthly_rent}</p>
                </div>
                <div>
                  <h3 className="font-medium">Security Deposit</h3>
                  <p className="text-gray-500">${property.security_deposit}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-500">{property.description}</p>
              </div>
              <div>
                <h3 className="font-medium">Amenities</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {property.amenities.map((amenity: string) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle>Current Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Tenant list will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Maintenance tickets will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Payment history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Property Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Property documents will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 