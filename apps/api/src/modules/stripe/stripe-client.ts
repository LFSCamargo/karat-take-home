import Stripe from 'stripe';

type StripeClient = InstanceType<typeof Stripe>;

let stripeClient: StripeClient | undefined;

export function getStripeClient(): StripeClient {
  if (!stripeClient) {
    stripeClient = new Stripe(
      process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder',
    );
  }

  return stripeClient;
}

export function resetStripeClientForTests() {
  stripeClient = undefined;
}
