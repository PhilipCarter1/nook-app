import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/services/notifications';
import type { Notification } from '@/lib/services/notifications';
import { log } from '@/lib/logger';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
  userId: string;
  initialNotifications: Notification[];
}

export function NotificationProvider({
  children,
  userId,
  initialNotifications,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refreshNotifications = async () => {
    try {
      const newNotifications = await getNotifications(userId);
      setNotifications(newNotifications);
    } catch (error) {
      log.error('Error refreshing notifications:', error as Error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      log.error('Error marking notification as read:', error as Error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      log.error('Error marking all notifications as read:', error as Error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      log.error('Error deleting notification:', error as Error);
    }
  };

  // Poll for new notifications every minute
  useEffect(() => {
    const pollInterval = setInterval(refreshNotifications, 60000);
    return () => clearInterval(pollInterval);
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification: handleDelete,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 