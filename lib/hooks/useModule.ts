import { useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase/client';

export function useModule(moduleId: string, propertyId?: string, unitId?: string) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = getClient();

  useEffect(() => {
    checkModuleAvailability();
  }, [moduleId, propertyId, unitId]);

  const checkModuleAvailability = async () => {
    try {
      // First check client-level availability
      const { data: clientConfig, error: clientError } = await supabase
        .from('client_config')
        .select('enabled_modules')
        .single();

      if (clientError) throw clientError;

      const isClientEnabled = clientConfig.enabled_modules.includes(moduleId);
      setIsAvailable(isClientEnabled);

      if (!isClientEnabled) {
        setIsEnabled(false);
        setLoading(false);
        return;
      }

      // Then check property/unit specific settings
      if (propertyId || unitId) {
        const table = unitId ? 'units' : 'properties';
        const id = unitId || propertyId;

        const { data, error } = await supabase
          .from(table)
          .select('module_config')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data?.module_config) {
          setIsEnabled(data.module_config[moduleId] ?? false);
        } else {
          setIsEnabled(true); // Default to enabled if no specific config
        }
      } else {
        setIsEnabled(true); // Default to enabled if no property/unit context
      }
    } catch (error) {
      console.error('Error checking module availability:', error);
      setIsAvailable(false);
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAvailable,
    isEnabled,
    loading,
  };
} 