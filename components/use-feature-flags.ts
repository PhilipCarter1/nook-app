import { useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase/client';
interface FeatureFlags {
  legal_assistant: boolean;
  concierge_setup: boolean;
  custom_branding: boolean;
  maintenance_tickets: boolean;
  split_payments: boolean;
  pre_lease_flow: boolean;
  document_upload: boolean;
  dark_mode: boolean;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({
    legal_assistant: false,
    concierge_setup: false,
    custom_branding: false,
    maintenance_tickets: true,
    split_payments: true,
    pre_lease_flow: true,
    document_upload: true,
    dark_mode: true,
  });
  const [loading, setLoading] = useState(true);
  const supabase = getClient();

  useEffect(() => {
    let channel: any;
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

        // Subscribe to changes in the organization's client config
        channel = supabase
          .channel('organization_config')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'organizations',
              filter: `id=eq.${orgId}`,
            },
            (payload: any) => {
              if (payload.new.client_config) {
                setFlags(payload.new.client_config as FeatureFlags);
              }
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error fetching feature flags:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatureFlags();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  return { flags, loading };
} 