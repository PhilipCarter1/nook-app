'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getClient } from '@/lib/supabase/client';
import { Building2, Scale, Palette } from 'lucide-react';
import { toast } from 'sonner';

// Define the OnboardingData type based on the structure in page.tsx
export type OnboardingData = {
  company: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    id?: string;
  };
  property: {
    address: string;
    unitCount: number;
    type: string;
    id?: string;
  };
  features: {
    concierge: boolean;
    legalAssistant: boolean;
    customBranding: boolean;
  };
  payment: {
    method: string;
    stripeConnected: boolean;
  };
};

interface FeatureSelectionProps {
  onComplete: (data: OnboardingData) => void;
  onBack: () => void;
  data: OnboardingData;
}

export default function FeatureSelection({ onComplete, onBack, data }: FeatureSelectionProps) {
  const [features, setFeatures] = useState(data.features);
  const [loading, setLoading] = React.useState(false);
  const supabase = getClient();

  const handleFeatureToggle = (feature: keyof typeof features) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          config: {
            enable_legal_assistant: features.legalAssistant,
            enable_concierge: features.concierge,
            enable_custom_branding: features.customBranding,
          },
        })
        .eq('id', data.company.id);

      if (error) throw error;

      toast.success('Features updated successfully');
      onComplete({
        ...data,
        features,
      });
    } catch (error) {
      console.error('Error updating features:', error);
      toast.error('Failed to update features');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Concierge Service</h3>
                  <p className="text-sm text-gray-500">
                    Get dedicated support for your property management needs
                  </p>
                </div>
              </div>
              <Switch
                checked={features.concierge}
                onCheckedChange={() => handleFeatureToggle('concierge')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Legal Assistant</h3>
                  <p className="text-sm text-gray-500">
                    Access legal templates and document review services
                  </p>
                </div>
              </div>
              <Switch
                checked={features.legalAssistant}
                onCheckedChange={() => handleFeatureToggle('legalAssistant')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Palette className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Custom Branding</h3>
                  <p className="text-sm text-gray-500">
                    Customize the portal with your brand colors and logo
                  </p>
                </div>
              </div>
              <Switch
                checked={features.customBranding}
                onCheckedChange={() => handleFeatureToggle('customBranding')}
              />
            </div>
          </CardContent>
        </Card>
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
          {loading ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </form>
  );
} 