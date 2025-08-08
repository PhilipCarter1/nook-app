'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Home, MapPin, DollarSign, Users, Building } from 'lucide-react';
import { log } from '@/lib/logger';
import { getClient } from '@/lib/supabase/client';
interface PropertySetupProps {
  data: {
    property: {
      address: string;
      unitCount: number;
      type: string;
    };
  };
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function PropertySetup({ data, onComplete, onBack }: PropertySetupProps) {
  const [formData, setFormData] = React.useState({
    address: data.property.address,
    unitCount: data.property.unitCount,
    type: data.property.type,
  });
  const [loading, setLoading] = React.useState(false);
  const supabase = getClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create property record in Supabase
      const { data: property, error } = await supabase
        .from('properties')
        .insert({
          address: formData.address,
          type: formData.type,
          units: formData.unitCount,
          status: 'available',
          monthly_rent: 0, // Will be set later
          security_deposit: 0, // Will be set later
        })
        .select()
        .single();

      if (error) throw error;

      onComplete({
        property: {
          ...formData,
          id: property.id,
        },
      });
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Property Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter the property address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitCount">Number of Units</Label>
          <Input
            id="unitCount"
            type="number"
            min="1"
            value={formData.unitCount}
            onChange={(e) => setFormData({ ...formData, unitCount: parseInt(e.target.value) })}
            placeholder="Enter number of units"
            required
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Next'}
        </Button>
      </div>
    </form>
  );
} 