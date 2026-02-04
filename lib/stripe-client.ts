import Stripe from 'stripe';

declare global {
  // allow caching Stripe instance on globalThis during dev/hot-reload
  // `var` here is required for a global declaration.
  // eslint-disable-next-line no-var
  var __stripe_client__: Stripe | undefined;
}

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!globalThis.__stripe_client__) {
    globalThis.__stripe_client__ = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return globalThis.__stripe_client__ ?? null;
}

export function requireStripe(): Stripe {
  const s = getStripe();
  if (!s) throw new Error('Missing STRIPE_SECRET_KEY');
  return s;
}
