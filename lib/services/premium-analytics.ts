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
