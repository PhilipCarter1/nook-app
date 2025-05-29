'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getClient } from '@/lib/supabase/client';

interface CompanyInfoProps {
  data: {
    company: {
      name: string;
      email: string;
    };
  };
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function CompanyInfo({ data, onComplete, onBack }: CompanyInfoProps) {
  const [formData, setFormData] = React.useState({
    name: data.company.name,
    email: data.company.email,
  });
  const [loading, setLoading] = React.useState(false);
  const supabase = getClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create client record in Supabase
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          name: formData.name,
          config: {
            enable_legal_assistant: false,
            enable_concierge: false,
            enable_custom_branding: false,
          },
        })
        .select()
        .single();

      if (error) throw error;

      onComplete({
        company: {
          ...formData,
          id: client.id,
        },
      });
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your company name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Company Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your company email"
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