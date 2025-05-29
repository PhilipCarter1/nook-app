'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PropertiesPage() {
  const { role } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [propertyType, setPropertyType] = React.useState<string>('all');
  const [properties, setProperties] = React.useState<any[]>([]);

  // Mock data for now - will be replaced with actual data fetching
  const mockProperties = [
    {
      id: '1',
      name: 'Sunset Apartments',
      address: '123 Main St, San Francisco, CA',
      type: 'apartment',
      units: 12,
      status: 'available',
      monthly_rent: 2500,
    },
    {
      id: '2',
      name: 'Ocean View Condos',
      address: '456 Beach Rd, San Francisco, CA',
      type: 'condo',
      units: 8,
      status: 'leased',
      monthly_rent: 3500,
    },
  ];

  React.useEffect(() => {
    // TODO: Fetch properties based on role
    setProperties(mockProperties);
  }, [role]);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = propertyType === 'all' || property.type === propertyType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Properties</h1>
        {role === 'landlord' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle>{property.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{property.address}</p>
                <div className="flex justify-between text-sm">
                  <span>Type: {property.type}</span>
                  <span>Units: {property.units}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status: {property.status}</span>
                  <span>${property.monthly_rent}/month</span>
                </div>
                {role === 'tenant' && property.status === 'available' && (
                  <Button className="w-full">Apply Now</Button>
                )}
                {role === 'landlord' && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Edit</Button>
                    <Button variant="outline" className="flex-1">View Details</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 