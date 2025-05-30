import { useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase/client';

interface FeatureFlags {
  legal_assistant: boolean;
  concierge_setup: boolean;
  custom_branding: boolean;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({
    legal_assistant: false,
    concierge_setup: false,
    custom_branding: false,
  });
  const [loading, setLoading] = useState(true);
  const supabase = getClient();

  useEffect(() => {
    async function fetchFeatureFlags() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get the organization ID from the user's metadata
        const orgId = user.user_metadata.organization_id;
        if (!orgId) return;

        // Fetch the organization's client config
        const { data: org } = await supabase
          .from('organizations')
          .select('client_config')
          .eq('id', orgId)
          .single();

        if (org?.client_config) {
          setFlags(org.client_config as FeatureFlags);
        }
      } catch (error) {
        console.error('Error fetching feature flags:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatureFlags();

    // Subscribe to changes in the organization's client config
    const channel = supabase
      .channel('organization_config')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'organizations',
          filter: `id=eq.${user?.user_metadata.organization_id}`,
        },
        (payload) => {
          if (payload.new.client_config) {
            setFlags(payload.new.client_config as FeatureFlags);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { flags, loading };
} 