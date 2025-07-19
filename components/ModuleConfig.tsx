import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { log } from '@/lib/logger';
import { getClient } from '@/lib/supabase/client';
import { Shield, Building2, Scale } from 'lucide-react';
interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isBeta?: boolean;
}

const MODULES: Module[] = [
  {
    id: 'concierge',
    name: 'Concierge',
    description: 'Property management and tenant services',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    id: 'branding',
    name: 'Branding',
    description: 'Customize your property appearance',
    icon: <Shield className="w-6 h-6" />,
  },
  {
    id: 'legal_assistant',
    name: 'Legal Assistant',
    description: 'AI-powered legal document review',
    icon: <Scale className="w-6 h-6" />,
    isBeta: true,
  },
];

interface ModuleConfigProps {
  propertyId?: string;
  unitId?: string;
  level: 'property' | 'unit';
  isOnboarding?: boolean;
}

export function ModuleConfig({ propertyId, unitId, level, isOnboarding = false }: ModuleConfigProps) {
  const [config, setConfig] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);
  const supabase = getClient();

  React.useEffect(() => {
    fetchConfig();
  }, [propertyId, unitId]);

  const fetchConfig = async () => {
    try {
      // First, get client-level config to check available modules
      const { data: clientConfig, error: clientError } = await supabase
        .from('client_config')
        .select('enabled_modules')
        .single();

      if (clientError) throw clientError;

      // Then get property/unit specific config
      const table = level === 'property' ? 'properties' : 'units';
      const id = level === 'property' ? propertyId : unitId;

      const { data, error } = await supabase
        .from(table)
        .select('module_config')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Initialize config with client-level settings
      const initialConfig = MODULES.reduce((acc, module) => ({
        ...acc,
        [module.id]: clientConfig.enabled_modules.includes(module.id),
      }), {});

      // Override with property/unit specific settings if they exist
      if (data?.module_config) {
        Object.assign(initialConfig, data.module_config);
      }

      setConfig(initialConfig);
    } catch (error) {
      log.error('Error fetching module config:', error);
      toast.error('Failed to load module configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (moduleId: string, enabled: boolean) => {
    try {
      const updatedConfig = {
        ...config,
        [moduleId]: enabled,
      };

      const table = level === 'property' ? 'properties' : 'units';
      const id = level === 'property' ? propertyId : unitId;

      const { error } = await supabase
        .from(table)
        .update({ module_config: updatedConfig })
        .eq('id', id);

      if (error) throw error;

      setConfig(updatedConfig);
      toast.success(`Module ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      log.error('Error updating module config:', error);
      toast.error('Failed to update module configuration');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {MODULES.map((module) => {
        const isAvailable = config[module.id];
        const isEnabled = config[module.id];

        return (
          <Card
            key={module.id}
            className={`p-6 transition-opacity ${
              !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {module.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <Label className="text-lg font-medium">
                        {module.name}
                      </Label>
                      {module.isBeta && (
                        <Badge variant="secondary">Beta</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {module.description}
                    </p>
                  </div>
                </div>
                {!isOnboarding && (
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(module.id, checked)}
                    disabled={!isAvailable}
                  />
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
} 