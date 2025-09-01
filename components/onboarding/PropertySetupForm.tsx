'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Building2, Home, Plus, Loader2, CheckCircle } from 'lucide-react';

interface PropertyData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  monthlyRent: number;
  securityDeposit: number;
  description: string;
}

export default function PropertySetupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    monthlyRent: 0,
    securityDeposit: 0,
    description: '',
  });

  const [properties, setProperties] = useState<any[]>([]);

  // Fetch existing properties on component mount
  React.useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .eq('landlord_id', user.id);
        
        if (propertiesData) {
          setProperties(propertiesData);
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add properties.');
        return;
      }

      // Create property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([
          {
            landlord_id: user.id,
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            monthly_rent: formData.monthlyRent,
            security_deposit: formData.securityDeposit,
            description: formData.description,
            status: 'available',
            amenities: [],
            images: [],
            features: {},
            property_manager_id: user.id,
          },
        ])
        .select()
        .single();

      if (propertyError) {
        throw propertyError;
      }

      toast.success(`Property "${formData.name}" added successfully!`);
      
      // Add to properties list
      setProperties(prev => [...prev, property]);

      // Reset form
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        monthlyRent: 0,
        securityDeposit: 0,
        description: '',
      });
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast.error(`Failed to add property: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Add New Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sunset Gardens, Downtown Lofts"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter street address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state"
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="Enter ZIP code"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent *</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyRent: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="securityDeposit">Security Deposit *</Label>
                <Input
                  id="securityDeposit"
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your property, amenities, and features..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Property...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-green-600" />
              Your Properties ({properties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {properties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-gray-600">{property.address}, {property.city}, {property.state} {property.zip_code}</p>
                    <p className="text-xs text-gray-500">
                      ${property.monthly_rent}/month • ${property.security_deposit} deposit
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {property.status}
                    </span>
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
