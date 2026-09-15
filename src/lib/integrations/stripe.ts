import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripeClient: Stripe | undefined;
};

/**
 * Lazily creates the Stripe SDK client. This is intentionally NOT constructed
 * at module load time: importing this file must never crash a page/build that
 * doesn't actually need Stripe (e.g. if STRIPE_SECRET_KEY isn't configured yet).
 * The error only surfaces when a checkout/webhook path actually calls this.
 */
export function getStripeClient(): Stripe {
  if (globalForStripe.stripeClient) {
    return globalForStripe.stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add it in your environment variables to enable real payments."
    );
  }

  const client = new Stripe(secretKey);

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.stripeClient = client;
  }

  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
