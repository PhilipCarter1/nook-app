'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Mail, Calendar, DollarSign } from 'lucide-react';
import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Property {
  id: string;
  name: string;
  address: string;
  units: Array<{
    id: string;
    number: string;
    rent_amount: number;
    lease_start: string;
    lease_end: string;
    tenants: Array<{
      id: string;
      name: string;
      email: string;
      status: string;
    }>;
  }>;
}

export default function PropertyManagePage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = React.useState<Property | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProperty = async () => {
      if (!params?.id) return;
      
      try {
        const supabase = getClient();
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            name,
            address,
            units:units(
              id,
              number,
              rent_amount,
              lease_start,
              lease_end,
              tenants:unit_tenants(
                id,
                name,
                email,
                status
              )
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (data) {
          setProperty(data);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Property not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{property.name}</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Address: {property.address}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Units: {property.units.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Units</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {property.units.map((unit) => (
                <div
                  key={unit.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/units/${unit.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Unit {unit.number}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${unit.rent_amount}/month
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {unit.tenants.length} {unit.tenants.length === 1 ? 'Tenant' : 'Tenants'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 