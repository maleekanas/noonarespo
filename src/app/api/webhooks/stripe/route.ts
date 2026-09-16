import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { getStripeClient } from "@/lib/integrations/stripe";
import {
  fulfillCheckoutSession,
  recordRenewalInvoice,
  syncSubscriptionStatus,
} from "@/server/services/StripeSubscriptionService";

// Must run on the Node.js runtime (not edge) — the Stripe SDK's signature
// verification relies on Node's crypto module.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // The raw request body is required (unparsed) to verify Stripe's signature.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.payment_status === "paid") {
          await fulfillCheckoutSession(session);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await recordRenewalInvoice(invoice);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionStatus(subscription);
        break;
      }

      default:
        // Unhandled event types are ignored — Stripe expects a 2xx response
        // for any event it sends, whether or not we act on it.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Returning a non-2xx status tells Stripe to retry this event later,
    // which is what we want for a transient failure (e.g. a DB hiccup).
    // This is real money/subscription state failing to record, so it's
    // worth surfacing beyond an ephemeral console line -- captureException
    // is a no-op until SENTRY_DSN is configured (see src/instrumentation.ts).
    console.error(`[stripe webhook] failed to process ${event.type}`, err);
    Sentry.captureException(err, {
      tags: { stripeEventType: event.type, stripeEventId: event.id },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
