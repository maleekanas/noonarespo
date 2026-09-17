import type Stripe from "stripe";
import { PlanType, BillingInterval, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";
import { getStripeClient } from "@/lib/integrations/stripe";
import { billingService } from "./BillingService";
import type { SubscriptionPlan } from "../repositories/FinancialRepository";

/**
 * This service bridges the existing in-memory plan catalog (BillingService /
 * FinancialRepository — still used as-is by the admin dashboards and payroll
 * screens) with real, persisted Stripe-backed billing records in Postgres via
 * Prisma. It intentionally does NOT touch BillingService/FinancialRepository,
 * so nothing else that reads from them (admin/finance, admin/reports,
 * teacher/payroll, DataExportService, etc.) is affected.
 */

function mapPlanTypeFromCode(code: string): PlanType {
  switch (code) {
    case "STARTER":
      return PlanType.INDIVIDUAL;
    case "STANDARD_GROUP":
      return PlanType.GROUP;
    case "FAMILY_VIP":
      return PlanType.FAMILY;
    case "PRIVATE_1ON1":
      return PlanType.PRIVATE_1_ON_1;
    default:
      return PlanType.GROUP;
  }
}

function mapBillingInterval(interval: SubscriptionPlan["billingInterval"]): BillingInterval {
  switch (interval) {
    case "QUARTERLY":
      return BillingInterval.QUARTERLY;
    case "ANNUAL":
      return BillingInterval.ANNUALLY;
    case "MONTHLY":
    default:
      return BillingInterval.MONTHLY;
  }
}

function stripeRecurringFromInterval(
  interval: SubscriptionPlan["billingInterval"]
): { interval: "month" | "year"; interval_count: number } {
  switch (interval) {
    case "QUARTERLY":
      return { interval: "month", interval_count: 3 };
    case "ANNUAL":
      return { interval: "year", interval_count: 1 };
    case "MONTHLY":
    default:
      return { interval: "month", interval_count: 1 };
  }
}

function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELLED;
    case "unpaid":
      return SubscriptionStatus.UNPAID;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}

/**
 * Finds (or lazily creates) the Prisma Plan row that corresponds to a given
 * in-memory catalog plan. The Plan model has no natural unique key besides
 * its id, so we match on {type, interval, priceMinorUnits, currency} — good
 * enough for this small, fixed catalog — and create it on first use.
 */
async function findOrCreatePrismaPlan(mockPlan: SubscriptionPlan) {
  const type = mapPlanTypeFromCode(mockPlan.code);
  const interval = mapBillingInterval(mockPlan.billingInterval);

  const existing = await prisma.plan.findFirst({
    where: {
      type,
      interval,
      priceMinorUnits: mockPlan.priceMinorUnits,
      currency: mockPlan.currency,
    },
  });
  if (existing) return existing;

  return prisma.plan.create({
    data: {
      type,
      interval,
      priceMinorUnits: mockPlan.priceMinorUnits,
      currency: mockPlan.currency,
      nameEn: mockPlan.nameEn,
      nameAr: mockPlan.nameAr,
      isActive: true,
    },
  });
}

export async function createStripeCheckoutSession(params: {
  parentId: string;
  parentEmail: string;
  planId: string;
  couponCode?: string;
  locale: string;
  /** When set, Stripe collects the card now but doesn't charge it until
   * this many days have passed -- used for the public 1-day free trial.
   * Absent/undefined for a normal, immediate-charge checkout. */
  trialDays?: number;
}): Promise<{ url: string }> {
  const stripe = getStripeClient();
  const calculation = await billingService.calculateCheckoutPrice(params.planId, params.couponCode);
  const { plan } = calculation;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const recurring = stripeRecurringFromInterval(plan.billingInterval);

  const description = calculation.couponApplied
    ? `${plan.nameEn} (coupon ${calculation.couponApplied.code} applied)`
    : plan.nameEn;

  // Reuse the parent's existing Stripe Customer if we already have one on
  // file (from a prior checkout/renewal), instead of letting Stripe create a
  // brand new implicit Customer every time -- otherwise the Billing Portal
  // and cancellation flow have no single customer to operate on.
  const existingParent = await prisma.parentProfile.findUnique({
    where: { id: params.parentId },
    select: { stripeCustomerId: true },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    ...(existingParent?.stripeCustomerId
      ? { customer: existingParent.stripeCustomerId }
      : { customer_email: params.parentEmail }),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: plan.currency.toLowerCase(),
          unit_amount: calculation.totalMinorUnits,
          recurring,
          product_data: {
            name: plan.nameEn,
            description,
          },
        },
      },
    ],
    success_url: `${appUrl}/${params.locale}/parent/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${params.locale}/parent/checkout?cancelled=1&planId=${plan.id}`,
    metadata: {
      parentId: params.parentId,
      planId: plan.id,
      couponCode: params.couponCode || "",
      locale: params.locale,
      isTrialSignup: params.trialDays ? "true" : "",
    },
    subscription_data: {
      ...(params.trialDays ? { trial_period_days: params.trialDays } : {}),
      metadata: {
        parentId: params.parentId,
        planId: plan.id,
        couponCode: params.couponCode || "",
        locale: params.locale,
        isTrialSignup: params.trialDays ? "true" : "",
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return { url: session.url };
}

/**
 * Fulfills a completed Checkout Session: creates (or extends) the real
 * Subscription plus a paid Invoice/InvoiceItem/Payment, all tied to the
 * logged-in parent's real ParentProfile.id. Idempotent via Payment's unique
 * idempotencyKey (the Stripe Checkout Session id) — safe to call more than
 * once for the same session (Stripe retries webhooks).
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  const parentId = session.metadata?.parentId;
  const planId = session.metadata?.planId;
  const couponCode = session.metadata?.couponCode || undefined;

  if (!parentId || !planId) {
    console.error("[stripe webhook] checkout.session.completed missing parentId/planId metadata", session.id);
    return;
  }

  const existingPayment = await prisma.payment.findUnique({ where: { idempotencyKey: session.id } });
  if (existingPayment) {
    return; // already fulfilled
  }

  const stripe = getStripeClient();
  const calculation = await billingService.calculateCheckoutPrice(planId, couponCode);
  const prismaPlan = await findOrCreatePrismaPlan(calculation.plan);

  let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  // Defaults to ACTIVE for a normal, immediate-charge checkout. Overwritten
  // below from the real Stripe subscription status whenever we can read it
  // -- most importantly so a 1-day-free-trial checkout (subscription_data:
  // {trial_period_days}) is recorded as TRIALING, not ACTIVE, from the
  // moment it's created. Getting this wrong would mean a trial signup's
  // access-level gate (getParentAccessLevel) never sees TRIALING at all,
  // silently granting full paid access for free.
  let subscriptionStatus: SubscriptionStatus = SubscriptionStatus.ACTIVE;
  if (typeof session.subscription === "string") {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
      // Stripe moved current_period_end from the Subscription object down to
      // its line items (flexible billing mode) — read it from there.
      const periodEnd = stripeSub.items.data[0]?.current_period_end;
      if (periodEnd) currentPeriodEnd = new Date(periodEnd * 1000);
      subscriptionStatus = mapStripeSubscriptionStatus(stripeSub.status);
    } catch (err) {
      console.error("[stripe webhook] failed to retrieve subscription for period end", err);
    }
  }

  const totalMinorUnits = session.amount_total ?? calculation.totalMinorUnits;
  const now = new Date();

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  await prisma.$transaction(async (tx) => {
    // Persist the Stripe Customer id on first sight so the Billing Portal
    // (self-service cancellation) has a customer to operate on.
    if (stripeCustomerId) {
      await tx.parentProfile.updateMany({
        where: { id: parentId, stripeCustomerId: null },
        data: { stripeCustomerId },
      });
    }

    const activeSub = await tx.subscription.findFirst({
      where: { parentId, planId: prismaPlan.id, status: SubscriptionStatus.ACTIVE },
    });

    if (activeSub) {
      await tx.subscription.update({
        where: { id: activeSub.id },
        data: {
          currentPeriodEnd,
          status: subscriptionStatus,
          stripeSubscriptionId: stripeSubscriptionId ?? activeSub.stripeSubscriptionId,
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          parentId,
          planId: prismaPlan.id,
          status: subscriptionStatus,
          currentPeriodStart: now,
          currentPeriodEnd,
          stripeSubscriptionId,
        },
      });
    }

    const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        parentId,
        subtotalMinorUnits: calculation.subtotalMinorUnits,
        taxMinorUnits: calculation.taxMinorUnits,
        totalMinorUnits,
        currency: calculation.plan.currency,
        status: "PAID",
        dueDate: now,
        items: {
          create: [
            {
              description: `${calculation.plan.nameAr} (${calculation.plan.nameEn})`,
              amountMinorUnits: calculation.subtotalMinorUnits,
              quantity: 1,
            },
          ],
        },
      },
    });

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : undefined;

    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        provider: "STRIPE",
        providerTransactionId: paymentIntentId,
        amountMinorUnits: totalMinorUnits,
        currency: calculation.plan.currency,
        status: "SUCCEEDED",
        idempotencyKey: session.id,
      },
    });
  });
}

/**
 * Handles Stripe's recurring `invoice.paid` events (billing cycles after the
 * first) by creating a fresh Invoice/InvoiceItem/Payment for the renewal and
 * extending the local Subscription's currentPeriodEnd. Since the Prisma
 * Subscription model doesn't store a Stripe subscription id, the parent/plan
 * are recovered from the Stripe Subscription's own metadata (set at checkout
 * time in subscription_data.metadata).
 */
export async function recordRenewalInvoice(invoice: Stripe.Invoice): Promise<void> {
  // The very first invoice of a subscription is already handled by
  // fulfillCheckoutSession via checkout.session.completed — skip it here to
  // avoid double-billing.
  if (invoice.billing_reason === "subscription_create") return;

  // Newer Stripe API versions moved the subscription reference from
  // invoice.subscription to invoice.parent.subscription_details.subscription.
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
  if (!subscriptionId) return;

  const idempotencyKey = `stripe-invoice-${invoice.id}`;
  const existingPayment = await prisma.payment.findUnique({ where: { idempotencyKey } });
  if (existingPayment) return;

  const stripe = getStripeClient();
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
  const parentId = stripeSub.metadata?.parentId;
  const planId = stripeSub.metadata?.planId;
  if (!parentId || !planId) {
    console.error("[stripe webhook] renewal invoice missing parentId/planId metadata", invoice.id);
    return;
  }

  const calculation = await billingService.calculateCheckoutPrice(planId, stripeSub.metadata?.couponCode || undefined);
  const prismaPlan = await findOrCreatePrismaPlan(calculation.plan);
  const totalMinorUnits = invoice.amount_paid;
  const periodEnd = stripeSub.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const activeSub = await tx.subscription.findFirst({
      where: { parentId, planId: prismaPlan.id },
      orderBy: { createdAt: "desc" },
    });

    if (activeSub) {
      await tx.subscription.update({
        where: { id: activeSub.id },
        data: {
          currentPeriodEnd,
          status: SubscriptionStatus.ACTIVE,
          // Backfill for subscriptions created before this id was tracked.
          stripeSubscriptionId: activeSub.stripeSubscriptionId ?? subscriptionId,
        },
      });
    }

    const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;
    const dbInvoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        parentId,
        subtotalMinorUnits: calculation.subtotalMinorUnits,
        taxMinorUnits: calculation.taxMinorUnits,
        totalMinorUnits,
        currency: calculation.plan.currency,
        status: "PAID",
        dueDate: now,
        items: {
          create: [
            {
              description: `${calculation.plan.nameAr} (${calculation.plan.nameEn}) — تجديد الاشتراك`,
              amountMinorUnits: calculation.subtotalMinorUnits,
              quantity: 1,
            },
          ],
        },
      },
    });

    await tx.payment.create({
      data: {
        invoiceId: dbInvoice.id,
        provider: "STRIPE",
        providerTransactionId: invoice.id,
        amountMinorUnits: totalMinorUnits,
        currency: calculation.plan.currency,
        status: "SUCCEEDED",
        idempotencyKey,
      },
    });
  });
}

/**
 * Keeps the local Subscription.status in sync with Stripe on
 * customer.subscription.updated / .deleted events (cancellations, payment
 * failures, etc). Best-effort: matched by parentId + planId from the Stripe
 * Subscription's own metadata since we don't persist a Stripe subscription id.
 */
export async function syncSubscriptionStatus(stripeSub: Stripe.Subscription): Promise<void> {
  const status = mapStripeSubscriptionStatus(stripeSub.status);
  const periodEnd = stripeSub.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : undefined;

  // Prefer matching on the persisted Stripe subscription id -- this is exact
  // and keeps working even after a parent has cancelled and re-subscribed or
  // changed plans. Fall back to the old {parentId, planId} metadata match
  // for subscriptions created before this id was tracked.
  const localSubById = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSub.id },
  });

  if (localSubById) {
    await prisma.subscription.update({
      where: { id: localSubById.id },
      data: currentPeriodEnd ? { status, currentPeriodEnd } : { status },
    });
    return;
  }

  const parentId = stripeSub.metadata?.parentId;
  const planId = stripeSub.metadata?.planId;
  if (!parentId || !planId) return;

  // planId in Stripe metadata is the in-memory catalog id (e.g. "plan-family"),
  // not the Prisma Plan UUID — resolve it the same way the checkout/renewal
  // paths do before querying Subscription.planId.
  const mockPlan = await billingService.getPlanById(planId);
  if (!mockPlan) return;
  const prismaPlan = await findOrCreatePrismaPlan(mockPlan);

  const localSub = await prisma.subscription.findFirst({
    where: { parentId, planId: prismaPlan.id },
    orderBy: { createdAt: "desc" },
  });
  if (!localSub) return;

  await prisma.subscription.update({
    where: { id: localSub.id },
    data: currentPeriodEnd
      ? { status, currentPeriodEnd, stripeSubscriptionId: stripeSub.id }
      : { status, stripeSubscriptionId: stripeSub.id },
  });
}

/**
 * Creates a Stripe Billing Portal session for a parent so they can manage or
 * cancel their subscription themselves (updates payment method, cancels,
 * downloads invoices — all handled by Stripe's own hosted UI). Requires a
 * Customer Portal configuration to be active in the Stripe Dashboard for
 * the account/mode in use (Settings -> Billing -> Customer portal).
 *
 * Falls back to looking the customer up by email in Stripe (and persisting
 * the id we find) for parents whose stripeCustomerId wasn't captured yet --
 * e.g. subscriptions created before this field existed, or on a preview
 * deployment where the fulfillment webhook never reached us.
 */
export async function createBillingPortalSession(params: {
  parentId: string;
  parentEmail: string;
  locale: string;
}): Promise<{ url: string } | { error: "NO_STRIPE_CUSTOMER" }> {
  const stripe = getStripeClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const parent = await prisma.parentProfile.findUnique({
    where: { id: params.parentId },
    select: { stripeCustomerId: true },
  });

  let customerId = parent?.stripeCustomerId ?? null;

  if (!customerId) {
    const matches = await stripe.customers.list({ email: params.parentEmail, limit: 1 });
    if (matches.data[0]) {
      customerId = matches.data[0].id;
      await prisma.parentProfile.updateMany({
        where: { id: params.parentId, stripeCustomerId: null },
        data: { stripeCustomerId: customerId },
      });

      // Also backfill the local Subscription's stripeSubscriptionId while
      // we're here, for a subscription created before this id was tracked
      // -- otherwise a cancellation made in the portal a moment from now
      // wouldn't be matchable back to this row by syncSubscriptionStatus.
      const activeStripeSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      const stripeSubId = activeStripeSubs.data[0]?.id;
      if (stripeSubId) {
        await prisma.subscription.updateMany({
          where: { parentId: params.parentId, status: SubscriptionStatus.ACTIVE, stripeSubscriptionId: null },
          data: { stripeSubscriptionId: stripeSubId },
        });
      }
    }
  }

  if (!customerId) {
    return { error: "NO_STRIPE_CUSTOMER" };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/${params.locale}/parent/billing`,
  });

  return { url: portalSession.url };
}

/**
 * Checks whether a subscription has been scheduled to cancel at the end of
 * its current billing period -- the default behavior when a parent cancels
 * through the Stripe Billing Portal (they keep access until currentPeriodEnd
 * rather than losing it immediately). `syncSubscriptionStatus` only reacts to
 * Stripe's top-level `status` field, which stays "active" the whole time a
 * cancellation is pending, so without this the billing page has no way to
 * tell the parent their cancellation actually went through until the
 * subscription flips to CANCELLED at period end -- a self-service flow that
 * looks like it silently failed. Reads live from Stripe rather than adding a
 * new persisted column, so it needs no schema migration. Best-effort: a
 * failed lookup (network hiccup, deleted subscription) returns null and the
 * page simply omits the banner rather than failing to render.
 */
export async function getSubscriptionCancellationState(
  stripeSubscriptionId: string
): Promise<{ cancelAtPeriodEnd: boolean } | null> {
  try {
    const stripe = getStripeClient();
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return { cancelAtPeriodEnd: Boolean(stripeSub.cancel_at_period_end) };
  } catch (err) {
    console.error("[billing] failed to check subscription cancellation state", err);
    return null;
  }
}
