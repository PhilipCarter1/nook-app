#!/bin/bash

echo "🎨 Starting Premium Platform Enhancement..."

# Create premium theme configuration
cat > lib/premium-theme.ts << 'EOF'
export const premiumTheme = {
  colors: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    nook: {
      50: '#f8f7ff',
      100: '#f0eeff',
      200: '#e6e2ff',
      300: '#d4ccff',
      400: '#b8a9ff',
      500: '#9b7aff',
      600: '#7c5af6',
      700: '#6b46c1',
      800: '#553c9a',
      900: '#463366',
    }
  },
  animations: {
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out',
    'scale-in': 'scaleIn 0.2s ease-out',
  }
};
EOF

# Create premium loading component
cat > components/ui/premium-loading.tsx << 'EOF'
import React from 'react';
import { motion } from 'framer-motion';

interface PremiumLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'nook' | 'gradient';
}

export function PremiumLoading({ 
  message = "Loading your experience...", 
  size = 'md',
  variant = 'nook'
}: PremiumLoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const variantClasses = {
    default: 'border-gray-300 border-t-gray-600',
    nook: 'border-nook-purple-200 border-t-nook-purple-600',
    gradient: 'border-gradient-to-r from-nook-purple-500 to-purple-500 border-t-white'
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center space-y-4">
        <motion.div
          className={`${sizeClasses[size]} border-4 border-t-transparent rounded-full mx-auto ${variantClasses[variant]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}
EOF

# Create premium error boundary
cat > components/ui/premium-error-boundary.tsx << 'EOF'
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { PremiumButton } from './PremiumButton';
import { PremiumCard } from './PremiumCard';

interface State {
  hasError: boolean;
  error?: Error;
}

export class PremiumErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Premium Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <PremiumCard className="max-w-md w-full text-center">
            <div className="p-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="space-y-3">
                <PremiumButton
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      );
    }

    return this.props.children;
  }
}
EOF

# Create premium form validation
cat > lib/premium-validation.ts << 'EOF'
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PremiumValidator {
  static validate(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('This field is required');
    }

    if (value && rules.minLength && value.toString().length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (value && rules.maxLength && value.toString().length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    if (value && rules.pattern && !rules.pattern.test(value.toString())) {
      errors.push('Invalid format');
    }

    if (value && rules.custom) {
      const customResult = rules.custom(value);
      if (typeof customResult === 'string') {
        errors.push(customResult);
      } else if (!customResult) {
        errors.push('Invalid value');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateEmail(email: string): ValidationResult {
    return this.validate(email, {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    });
  }

  static validatePassword(password: string): ValidationResult {
    return this.validate(password, {
      required: true,
      minLength: 8,
      custom: (value) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
        if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
        if (!hasNumbers) return 'Password must contain at least one number';
        if (!hasSpecialChar) return 'Password must contain at least one special character';
        
        return true;
      }
    });
  }
}
EOF

# Create premium analytics service
cat > lib/services/premium-analytics.ts << 'EOF'
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export class PremiumAnalytics {
  private static instance: PremiumAnalytics;
  private events: AnalyticsEvent[] = [];

  static getInstance(): PremiumAnalytics {
    if (!PremiumAnalytics.instance) {
      PremiumAnalytics.instance = new PremiumAnalytics();
    }
    return PremiumAnalytics.instance;
  }

  track(event: AnalyticsEvent) {
    const fullEvent = {
      ...event,
      timestamp: event.timestamp || new Date()
    };
    
    this.events.push(fullEvent);
    
    // Send to analytics service (implement as needed)
    if (typeof window !== 'undefined') {
      // Example: Google Analytics, Mixpanel, etc.
      console.log('Analytics Event:', fullEvent);
    }
  }

  trackPageView(page: string) {
    this.track({
      name: 'page_view',
      properties: { page }
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>) {
    this.track({
      name: 'user_action',
      properties: { action, ...properties }
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track({
      name: 'error',
      properties: { 
        message: error.message,
        stack: error.stack,
        ...context
      }
    });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

export const analytics = PremiumAnalytics.getInstance();
EOF

# Create premium notification service
cat > lib/services/premium-notifications.ts << 'EOF'
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
EOF

echo "✅ Premium components and services created successfully!"

# Update package.json with premium dependencies
echo "📦 Adding premium dependencies..."
npm install framer-motion @radix-ui/react-toast @radix-ui/react-slot class-variance-authority sonner

# Create premium CSS variables
cat > styles/premium.css << 'EOF'
:root {
  /* Premium Color Palette */
  --nook-purple-50: #f8f7ff;
  --nook-purple-100: #f0eeff;
  --nook-purple-200: #e6e2ff;
  --nook-purple-300: #d4ccff;
  --nook-purple-400: #b8a9ff;
  --nook-purple-500: #9b7aff;
  --nook-purple-600: #7c5af6;
  --nook-purple-700: #6b46c1;
  --nook-purple-800: #553c9a;
  --nook-purple-900: #463366;

  /* Premium Animations */
  --premium-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --premium-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Premium Shadows */
  --premium-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --premium-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --premium-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --premium-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --premium-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --premium-shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --premium-shadow-glow: 0 0 30px rgb(147 51 234 / 0.3);
}

/* Premium Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
}

/* Premium Utility Classes */
.premium-transition { transition: var(--premium-transition); }
.premium-shadow { box-shadow: var(--premium-shadow); }
.premium-shadow-lg { box-shadow: var(--premium-shadow-lg); }
.premium-shadow-glow { box-shadow: var(--premium-shadow-glow); }
.premium-gradient { background: linear-gradient(135deg, var(--nook-purple-500), #a855f7); }
.premium-glass { backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.1); }
EOF

echo "🎨 Premium styles created successfully!"

# Create premium configuration
cat > lib/premium-config.ts << 'EOF'
export const premiumConfig = {
  app: {
    name: 'Nook',
    description: 'Premium Property Management Platform',
    version: '1.0.0',
    supportEmail: 'support@rentwithnook.com',
  },
  features: {
    darkMode: true,
    animations: true,
    analytics: true,
    notifications: true,
    premiumUI: true,
  },
  branding: {
    primaryColor: '#7c5af6',
    secondaryColor: '#a855f7',
    accentColor: '#9b7aff',
    logo: '/logo.svg',
  },
  performance: {
    enableLazyLoading: true,
    enableCaching: true,
    enableCompression: true,
  },
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
  }
};
EOF

echo "⚙️ Premium configuration created successfully!"

# Create premium hooks
cat > lib/hooks/use-premium.ts << 'EOF'
import { useState, useEffect, useCallback } from 'react';
import { analytics } from '@/lib/services/premium-analytics';
import { notifications } from '@/lib/services/premium-notifications';

export function usePremiumAnalytics() {
  const trackEvent = useCallback((name: string, properties?: Record<string, any>) => {
    analytics.track({ name, properties });
  }, []);

  const trackPageView = useCallback((page: string) => {
    analytics.trackPageView(page);
  }, []);

  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    analytics.trackUserAction(action, properties);
  }, []);

  return { trackEvent, trackPageView, trackUserAction };
}

export function usePremiumNotifications() {
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = notifications.subscribe(setNotification);
    return unsubscribe;
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    notifications.success(title, message);
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    notifications.error(title, message);
  }, []);

  const showWarning = useCallback((title: string, message?: string) => {
    notifications.warning(title, message);
  }, []);

  const showInfo = useCallback((title: string, message?: string) => {
    notifications.info(title, message);
  }, []);

  return { 
    notification, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo 
  };
}

export function usePremiumTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const updateTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  }, []);

  return { theme, updateTheme };
}
EOF

echo "🎣 Premium hooks created successfully!"

# Create premium utilities
cat > lib/premium-utils.ts << 'EOF'
import { premiumConfig } from './premium-config';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(dateObj, { month: 'short', day: 'numeric' });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password) && 
         /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getAppConfig() {
  return premiumConfig;
}
EOF

echo "🔧 Premium utilities created successfully!"

echo "🎉 Premium Platform Enhancement Complete!"
echo ""
echo "✨ What's been enhanced:"
echo "  • Premium UI components with animations"
echo "  • Enhanced authentication forms"
echo "  • Professional admin dashboard"
echo "  • Premium toast notifications"
echo "  • Advanced form validation"
echo "  • Analytics and tracking"
echo "  • Premium styling and theming"
echo "  • Error boundaries and loading states"
echo "  • Utility functions and hooks"
echo ""
echo "🚀 Your platform is now premium-ready!" 