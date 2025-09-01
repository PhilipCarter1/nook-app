'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Mail, User, Building2, Send, Loader2, CheckCircle } from 'lucide-react';

interface TenantInvitationData {
  firstName: string;
  lastName: string;
  email: string;
  propertyId: string;
  unitId?: string;
  message?: string;
}

export default function TenantInvitationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TenantInvitationData>({
    firstName: '',
    lastName: '',
    email: '',
    propertyId: '',
    unitId: '',
    message: '',
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [invitedTenants, setInvitedTenants] = useState<any[]>([]);

  // Fetch properties and units on component mount
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

  const fetchUnits = async (propertyId: string) => {
    try {
      const supabase = createClient();
      const { data: unitsData } = await supabase
        .from('units')
        .select('*')
        .eq('property_id', propertyId);
      
      if (unitsData) {
        setUnits(unitsData);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handlePropertyChange = (propertyId: string) => {
    setFormData(prev => ({ ...prev, propertyId, unitId: '' }));
    setUnits([]);
    if (propertyId) {
      fetchUnits(propertyId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to invite tenants.');
        return;
      }

      // Create tenant invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('tenant_invitations')
        .insert([
          {
            landlord_id: user.id,
            property_id: formData.propertyId,
            unit_id: formData.unitId || null,
            tenant_email: formData.email,
            tenant_first_name: formData.firstName,
            tenant_last_name: formData.lastName,
            message: formData.message || `You've been invited to join ${properties.find(p => p.id === formData.propertyId)?.name || 'a property'} on Nook.`,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          },
        ])
        .select()
        .single();

      if (invitationError) {
        throw invitationError;
      }

      // Send invitation email (you can implement this with your email service)
      // For now, we'll just show a success message
      
      toast.success(`Invitation sent to ${formData.email}!`);
      
      // Add to invited tenants list
      setInvitedTenants(prev => [...prev, {
        ...invitation,
        propertyName: properties.find(p => p.id === formData.propertyId)?.name,
        unitNumber: units.find(u => u.id === formData.unitId)?.unit_number,
      }]);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        propertyId: '',
        unitId: '',
        message: '',
      });
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(`Failed to send invitation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Invite New Tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="propertyId">Property *</Label>
              <Select
                value={formData.propertyId}
                onValueChange={handlePropertyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {property.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.propertyId && (
              <div>
                <Label htmlFor="unitId">Unit (Optional)</Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, unitId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific unit</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.unit_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Input
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message to your invitation"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.propertyId}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {invitedTenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recently Invited Tenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitedTenants.map((tenant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{tenant.tenant_first_name} {tenant.tenant_last_name}</p>
                    <p className="text-sm text-gray-600">{tenant.tenant_email}</p>
                    <p className="text-xs text-gray-500">
                      {tenant.propertyName}
                      {tenant.unitNumber && ` - Unit ${tenant.unitNumber}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires {new Date(tenant.expires_at).toLocaleDateString()}
                    </p>
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
