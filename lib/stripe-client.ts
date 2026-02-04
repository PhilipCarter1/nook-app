import Stripe from 'stripe';

declare global {
  // allow caching Stripe instance on globalThis during dev/hot-reload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // `var` here is required for a global declaration; disable the rule.
  // eslint-disable-next-line no-var
  var __stripe_client__: any | undefined;
}

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!globalThis.__stripe_client__) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const StripeLib = Stripe as any;
    globalThis.__stripe_client__ = new StripeLib(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return globalThis.__stripe_client__ as Stripe;
}

export function requireStripe(): Stripe {
  const s = getStripe();
  if (!s) throw new Error('Missing STRIPE_SECRET_KEY');
  return s;
}
