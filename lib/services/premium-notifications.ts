export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class PremiumNotificationService {
  private static instance: PremiumNotificationService;
  private listeners: ((notification: Notification) => void)[] = [];

  static getInstance(): PremiumNotificationService {
    if (!PremiumNotificationService.instance) {
      PremiumNotificationService.instance = new PremiumNotificationService();
    }
    return PremiumNotificationService.instance;
  }

  subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(notification: Notification) {
    this.listeners.forEach(listener => listener(notification));
  }

  success(title: string, message?: string, options?: Partial<Notification>) {
    this.notify({
      id: Date.now().toString(),
      title,
      message: message || '',
      type: 'success',
      duration: 5000,
      ...options
    });
  }

  error(title: string, message?: string, options?: Partial<Notification>) {
    this.notify({
      id: Date.now().toString(),
      title,
      message: message || '',
      type: 'error',
      duration: 8000,
      ...options
    });
  }

  warning(title: string, message?: string, options?: Partial<Notification>) {
    this.notify({
      id: Date.now().toString(),
      title,
      message: message || '',
      type: 'warning',
      duration: 6000,
      ...options
    });
  }

  info(title: string, message?: string, options?: Partial<Notification>) {
    this.notify({
      id: Date.now().toString(),
      title,
      message: message || '',
      type: 'info',
      duration: 4000,
      ...options
    });
  }
}

export const notifications = PremiumNotificationService.getInstance();
