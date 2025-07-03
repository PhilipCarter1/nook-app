import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MaintenanceSettings } from '@/components/settings/MaintenanceSettings';
import { getMaintenanceSettings, updateMaintenanceSettings, type MaintenanceSettings as MaintenanceSettingsType } from '@/lib/services/settings';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MaintenanceSettingsPage() {
  const params = useParams();
  const propertyId = params?.propertyId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['maintenanceSettings', propertyId],
    queryFn: () => getMaintenanceSettings(propertyId),
    enabled: !!propertyId,
  });

  const updateSettings = useMutation({
    mutationFn: (newSettings: Partial<MaintenanceSettingsType>) =>
      updateMaintenanceSettings(propertyId, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceSettings', propertyId] });
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings');
      console.error('Settings update error:', error);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">No settings found</p>
      </div>
    );
  }

  return (
    <MaintenanceSettings
      propertyId={propertyId}
      settings={settings}
      onSave={async (newSettings) => {
        await updateSettings.mutateAsync(newSettings);
      }}
    />
  );
} 