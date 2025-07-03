import React from 'react';
import { Button } from '@/components/ui/button';
import { premiumComponents } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
          <div className="max-w-md w-full p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => window.location.reload()}
                  className={cn(
                    premiumComponents.button.base,
                    premiumComponents.button.primary
                  )}
                >
                  Refresh Page
                </Button>
                <Button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className={cn(
                    premiumComponents.button.base,
                    premiumComponents.button.outline
                  )}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 