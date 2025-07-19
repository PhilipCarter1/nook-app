'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
import { PropertyCard } from "./property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/lib/hooks/use-toast';
import { AddPropertyForm } from './add-property-form';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export default function PropertiesPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [propertyType, setPropertyType] = React.useState<string>('all');
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddPropertyForm, setShowAddPropertyForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    units: '',
  });

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        setError('Failed to load properties. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load properties. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleEditProperty = async (property: Property) => {
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      const updatedProperty = await response.json();
      setProperties(properties.map(p => p.id === property.id ? updatedProperty : p));
      
      toast({
        title: "Success",
        description: "Property updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = async (property: Property) => {
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      setProperties(properties.filter(p => p.id !== property.id));
      
      toast({
        title: "Success",
        description: "Property deleted successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddProperty = async (data: any) => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to add property');
      }

      const newProperty = await response.json();
      setProperties([...properties, newProperty]);
      setShowAddPropertyForm(false);
      
      toast({
        title: "Success",
        description: "Property added successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = propertyType === 'all' || property.status === propertyType;
    return matchesSearch && matchesType;
  });

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Button
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your properties and units</p>
        </div>
        <Button onClick={() => setShowAddPropertyForm(true)}>
          Add Property
        </Button>
      </div>

      {showAddPropertyForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <AddPropertyForm
              onSubmit={handleAddProperty}
              onCancel={() => setShowAddPropertyForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">No properties found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Add your first property to get started'}
            </p>
          </div>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
            />
          ))
        )}
      </div>
    </div>
  );
} 