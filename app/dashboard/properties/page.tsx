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
import { Building, Plus, MapPin, Users, X, ArrowLeft, Search } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/admin')}
                className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Properties</h1>
                <p className="text-gray-600 text-lg">Manage your property portfolio</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Property
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                <span className="text-sm font-medium text-gray-600">Total Properties:</span>
                <span className="ml-2 text-lg font-bold text-nook-purple-600">{properties.length}</span>
              </div>
            </div>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-10 w-10 text-nook-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No properties yet</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">Get started by adding your first property to begin managing your portfolio</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg bg-white group" onClick={() => toast.info('Property details coming soon!')}>
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Building className="h-8 w-8 text-nook-purple-600" />
                    </div>
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 font-semibold px-3 py-1">Active</Badge>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-3 group-hover:text-nook-purple-600 transition-colors duration-200">{property.name}</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center bg-gray-50 rounded-lg p-3">
                      <MapPin className="h-4 w-4 mr-3 text-nook-purple-500" />
                      <span className="font-medium">{property.address}</span>
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-lg p-3">
                      <Users className="h-4 w-4 mr-3 text-nook-purple-500" />
                      <span className="font-medium">{property.units} units</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Add New Property</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddProperty} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">Property Name</Label>
                  <Input
                    id="name"
                    value={newProperty.name}
                    onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                    placeholder="Enter property name"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700 mb-2 block">Address</Label>
                  <Input
                    id="address"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                    placeholder="Enter property address"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="units" className="text-sm font-semibold text-gray-700 mb-2 block">Number of Units</Label>
                  <Input
                    id="units"
                    type="number"
                    value={newProperty.units}
                    onChange={(e) => setNewProperty({...newProperty, units: e.target.value})}
                    placeholder="Enter number of units"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Add Property
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
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