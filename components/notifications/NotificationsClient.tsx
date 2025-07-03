import { useEffect } from 'react';
import { NotificationList } from './NotificationList';
import { useNotifications } from '@/lib/contexts/NotificationContext';

export function NotificationsClient() {
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    // Initial load
    refreshNotifications();

    // Set up polling
    const interval = setInterval(refreshNotifications, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return <NotificationList />;
} 