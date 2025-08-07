import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { log } from '@/lib/logger';

interface FeatureFlags {
  legal_assistant: boolean;
  payment_processing: boolean;
  maintenance_tracking: boolean;
  document_management: boolean;
  analytics: boolean;
  tenant_portal: boolean;
  landlord_portal: boolean;
  admin_portal: boolean;
  premium_features: boolean;
  advanced_analytics: boolean;
  custom_branding: boolean;
  priority_support: boolean;
}

interface UseFeatureFlagsReturn {
  featureFlags: FeatureFlags;
  loading: boolean;
  error: string | null;
  hasFeature: (feature: keyof FeatureFlags) => boolean;
  refreshFlags: () => Promise<void>;
}

export function useFeatureFlags(): UseFeatureFlagsReturn {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    legal_assistant: false,
    payment_processing: false,
    maintenance_tracking: false,
    document_management: false,
    analytics: false,
    tenant_portal: false,
    landlord_portal: false,
    admin_portal: false,
    premium_features: false,
    advanced_analytics: false,
    custom_branding: false,
    priority_support: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Default flags for unauthenticated users
        setFeatureFlags({
          legal_assistant: true,
          payment_processing: true,
          maintenance_tracking: true,
          document_management: true,
          analytics: false,
          tenant_portal: true,
          landlord_portal: true,
          admin_portal: false,
          premium_features: false,
          advanced_analytics: false,
          custom_branding: false,
          priority_support: false,
        });
        return;
      }

      // Fetch user's feature flags from the database
      const { data: userFlags, error: fetchError } = await supabase
        .from('user_feature_flags')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Merge with default flags
      const flags = {
        legal_assistant: true,
        payment_processing: true,
        maintenance_tracking: true,
        document_management: true,
        analytics: false,
        tenant_portal: true,
        landlord_portal: true,
        admin_portal: false,
        premium_features: false,
        advanced_analytics: false,
        custom_branding: false,
        priority_support: false,
        ...userFlags?.flags,
      };

      setFeatureFlags(flags);

      // Set up real-time subscription for feature flag changes
      const channel = supabase
        .channel('feature_flags')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_feature_flags',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            if (payload.new) {
              setFeatureFlags(prev => ({
                ...prev,
                ...payload.new.flags,
              }));
            }
          }
        )
        .subscribe();
    } catch (error) {
      log.error('Error fetching feature flags:', error as Error);
      setError('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const hasFeature = (feature: keyof FeatureFlags): boolean => {
    return featureFlags[feature] || false;
  };

  const refreshFlags = async () => {
    await fetchFeatureFlags();
  };

  return {
    featureFlags,
    loading,
    error,
    hasFeature,
    refreshFlags,
  };
} 