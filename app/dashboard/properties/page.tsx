'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Building, Plus, MapPin, Users, X, ArrowLeft, Search, UserPlus, Eye, Mail, Phone } from 'lucide-react';
import TenantOnboardingModal from '@/components/tenant-onboarding/TenantOnboardingModal';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  created_at: string;
  tenants?: Tenant[];
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  unit_id?: string;
  lease_start?: string;
  lease_end?: string;
}

interface Unit {
  id: string;
  unit_number: string;
  status: 'available' | 'occupied';
  tenant_id?: string;
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    units: '',
    propertyType: '',
    monthlyRent: ''
  });

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      // Get properties owned by this landlord
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          address,
          units,
          created_at,
          landlord_id
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (propertiesError) {
        console.error('Error loading properties:', propertiesError);
        toast.error('Failed to load properties');
        setLoading(false);
        return;
      }

      // Get tenants for each property
      const propertiesWithTenants = await Promise.all(
        (properties || []).map(async (property: any) => {
          const { data: tenants, error: tenantsError } = await supabase
            .from('tenants')
            .select(`
              id,
              name,
              email,
              phone,
              status,
              unit_id,
              lease_start,
              lease_end
            `)
            .eq('property_id', property.id);

          if (tenantsError) {
            console.error('Error loading tenants for property:', property.id, tenantsError);
          }

          return {
            ...property,
            tenants: tenants || []
          };
        })
      );

      setProperties(propertiesWithTenants);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProperty.name || !newProperty.address || !newProperty.propertyType) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // For multi-unit properties, units is required
    if (newProperty.propertyType !== 'house' && !newProperty.units) {
      toast.error('Please specify the number of units');
      return;
    }

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to add properties');
        return;
      }

      // Determine units based on property type
      const units = newProperty.propertyType === 'house' ? 1 : parseInt(newProperty.units);
      
      // Save property to database
      const { data: property, error } = await supabase
        .from('properties')
        .insert({
          name: newProperty.name,
          address: newProperty.address,
          units: units,
          landlord_id: user.id,
          property_type: newProperty.propertyType || 'apartment',
          monthly_rent: newProperty.monthlyRent ? parseFloat(newProperty.monthlyRent) : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding property:', error);
        toast.error('Failed to add property');
        return;
      }

      // Reload properties to show the new one
      await loadProperties();
      
      setShowAddModal(false);
      setNewProperty({ name: '', address: '', units: '', propertyType: '', monthlyRent: '' });
      toast.success('Property added successfully!');
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property');
    }
  };

  const handleTenantAdded = (tenant: Tenant) => {
    if (selectedProperty) {
      const updatedProperties = properties.map(prop => {
        if (prop.id === selectedProperty.id) {
          return {
            ...prop,
            tenants: [...(prop.tenants || []), tenant]
          };
        }
        return prop;
      });
      setProperties(updatedProperties);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTenantCount = (tenants?: Tenant[]) => {
    if (!tenants) return 0;
    return tenants.length;
  };

  const getOccupancyRate = (property: Property) => {
    if (!property.tenants || property.units === 0) return 0;
    return Math.round((property.tenants.length / property.units) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600 mt-1">Manage your properties and tenants</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-nook-purple-700">{property.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <p className="text-sm text-gray-600">{property.address}</p>
                    </div>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {getOccupancyRate(property)}% Occupied
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Property Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <p className="text-2xl font-bold text-nook-purple-700">{property.units}</p>
                    <p className="text-xs text-nook-purple-600 font-medium">Total Units</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-2xl font-bold text-blue-700">{getTenantCount(property.tenants)}</p>
                    <p className="text-xs text-blue-600 font-medium">Tenants</p>
                  </div>
                </div>

                {/* Tenants List */}
                {property.tenants && property.tenants.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-nook-purple-700">Current Tenants</h4>
                      <Badge variant="outline" className="text-xs border-nook-purple-200 text-nook-purple-700">
                        {property.tenants.length} tenant{property.tenants.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {property.tenants.slice(0, 3).map((tenant) => (
                        <div key={tenant.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Users className="h-3 w-3 text-nook-purple-500" />
                            <div>
                              <p className="text-sm font-medium text-nook-purple-800">{tenant.name}</p>
                              <p className="text-xs text-nook-purple-600">{tenant.email}</p>
                            </div>
                          </div>
                          <Badge 
                            className={`text-xs ${
                              tenant.status === 'active' 
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200' 
                                : tenant.status === 'pending'
                                ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200'
                                : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {tenant.status}
                          </Badge>
                        </div>
                      ))}
                      {property.tenants.length > 3 && (
                        <p className="text-xs text-nook-purple-500 text-center font-medium">
                          +{property.tenants.length - 3} more tenant{property.tenants.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowTenantModal(true);
                    }}
                    className="flex-1 border-nook-purple-300 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-400 hover:text-nook-purple-800 transition-all duration-200"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Onboard Tenants
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                    className="flex-1 border-nook-purple-300 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-400 hover:text-nook-purple-800 transition-all duration-200"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Property Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProperty} className="space-y-4">
            <div>
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                placeholder="Sunset Apartments"
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newProperty.address}
                onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                placeholder="123 Main St, City, State"
                required
              />
            </div>
            {/* Only show units field for multi-unit properties */}
            {newProperty.propertyType && !['house'].includes(newProperty.propertyType) && (
              <div>
                <Label htmlFor="units">Number of Units</Label>
                <Input
                  id="units"
                  type="number"
                  value={newProperty.units}
                  onChange={(e) => setNewProperty({ ...newProperty, units: e.target.value })}
                  placeholder="24"
                  required
                />
              </div>
            )}
            {/* For single-unit properties, set units to 1 automatically */}
            {newProperty.propertyType === 'house' && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p>Single-unit property - automatically set to 1 unit</p>
              </div>
            )}
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={newProperty.propertyType} onValueChange={(value) => setNewProperty({ ...newProperty, propertyType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthlyRent">Monthly Rent (per unit)</Label>
              <Input
                id="monthlyRent"
                type="number"
                step="0.01"
                value={newProperty.monthlyRent}
                onChange={(e) => setNewProperty({ ...newProperty, monthlyRent: e.target.value })}
                placeholder="2500.00"
              />
            </div>
            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-700">
                Add Property
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tenant Onboarding Modal */}
      {selectedProperty && (
        <TenantOnboardingModal
          property={selectedProperty}
          isOpen={showTenantModal}
          onClose={() => {
            setShowTenantModal(false);
            setSelectedProperty(null);
          }}
          onTenantAdded={handleTenantAdded}
        />
      )}
    </div>
  );
} 