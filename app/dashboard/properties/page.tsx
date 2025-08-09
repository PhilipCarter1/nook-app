'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building, Plus, MapPin, Users, X } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  created_at: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    units: ''
  });

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // TEMPORARY: Use simulated data
        setProperties([
          {
            id: '1',
            name: 'Sunset Apartments',
            address: '123 Main St, City, State',
            units: 24,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Riverside Condos',
            address: '456 Oak Ave, City, State',
            units: 12,
            created_at: new Date().toISOString()
          }
        ]);
        
        /* Comment out actual Supabase code for now
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });

        setProperties(propertiesData || []);
        */
      } catch (error) {
        console.error('Error loading properties:', error);
        toast.error('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [router]);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProperty.name || !newProperty.address || !newProperty.units) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // TEMPORARY: Add to local state
      const property = {
        id: Date.now().toString(),
        name: newProperty.name,
        address: newProperty.address,
        units: parseInt(newProperty.units),
        created_at: new Date().toISOString()
      };
      
      setProperties([property, ...properties]);
      setShowAddModal(false);
      setNewProperty({ name: '', address: '', units: '' });
      toast.success('Property added successfully!');
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      const { error } = await supabase
        .from('properties')
        .insert([{
          name: newProperty.name,
          address: newProperty.address,
          units: parseInt(newProperty.units)
        }]);

      if (error) {
        toast.error('Failed to add property');
        return;
      }

      toast.success('Property added successfully!');
      setShowAddModal(false);
      setNewProperty({ name: '', address: '', units: '' });
      loadProperties();
      */
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600">Manage your properties</p>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-nook-purple-600 hover:bg-nook-purple-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {properties.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first property</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-nook-purple-600 hover:bg-nook-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-white" onClick={() => toast.info('Property details coming soon!')}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-nook-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-nook-purple-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{property.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {property.address}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {property.units} units
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Add New Property</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <Label htmlFor="name">Property Name</Label>
                  <Input
                    id="name"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                    placeholder="Enter property name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                    placeholder="Enter property address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="units">Number of Units</Label>
                  <Input
                    id="units"
                    type="number"
                    value={newProperty.units}
                    onChange={(e) => setNewProperty({...newProperty, units: e.target.value})}
                    placeholder="Enter number of units"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-500">
                    Add Property
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 