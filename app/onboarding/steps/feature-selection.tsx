'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getClient } from '@/lib/supabase/client';
import { Building2, Scale, Palette } from 'lucide-react';

interface FeatureSelectionProps {
  data: {
    features: {
      concierge: boolean;
      legalAssistant: boolean;
      customBranding: boolean;
    };
  };
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function FeatureSelection({ data, onComplete, onBack }: FeatureSelectionProps) {
  const [formData, setFormData] = React.useState({
    concierge: data.features.concierge,
    legalAssistant: data.features.legalAssistant,
    customBranding: data.features.customBranding,
  });
  const [loading, setLoading] = React.useState(false);
  const supabase = getClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update client config in Supabase
      const { error } = await supabase
        .from('clients')
        .update({
          config: {
            enable_concierge: formData.concierge,
            enable_legal_assistant: formData.legalAssistant,
            enable_custom_branding: formData.customBranding,
          },
        })
        .eq('id', data.company.id);

      if (error) throw error;

      onComplete({
        features: formData,
      });
    } catch (error) {
      console.error('Error updating features:', error);
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
                checked={formData.concierge}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, concierge: checked })
                }
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
                checked={formData.legalAssistant}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, legalAssistant: checked })
                }
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
                checked={formData.customBranding}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, customBranding: checked })
                }
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