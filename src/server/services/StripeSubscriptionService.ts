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
}): Promise<{ url: string }> {
  const stripe = getStripeClient();
  const calculation = await billingService.calculateCheckoutPrice(params.planId, params.couponCode);
  const { plan } = calculation;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const recurring = stripeRecurringFromInterval(plan.billingInterval);

  const description = calculation.couponApplied
    ? `${plan.nameEn} (coupon ${calculation.couponApplied.code} applied)`
    : plan.nameEn;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.parentEmail,
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
    },
    subscription_data: {
      metadata: {
        parentId: params.parentId,
        planId: plan.id,
        couponCode: params.couponCode || "",
        locale: params.locale,
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
  if (typeof session.subscription === "string") {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
      // Stripe moved current_period_end from the Subscription object down to
      // its line items (flexible billing mode) — read it from there.
      const periodEnd = stripeSub.items.data[0]?.current_period_end;
      if (periodEnd) currentPeriodEnd = new Date(periodEnd * 1000);
    } catch (err) {
      console.error("[stripe webhook] failed to retrieve subscription for period end", err);
    }
  }

  // Idempotent upsert: if the parent already has an ACTIVE subscription for
  // this plan, extend it; otherwise create a new one.
  const existingSubscription = await prisma.subscription.findFirst({
    where: { parentId, planId: prismaPlan.id, status: SubscriptionStatus.ACTIVE },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: { currentPeriodEnd },
    });
  } else {
    await prisma.subscription.create({
      data: {
        parentId,
        planId: prismaPlan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd,
      },
    });
  }

  // Record the payment
  await prisma.payment.create({
    data: {
      parentId,
      idempotencyKey: session.id,
      provider: "STRIPE",
      amountMinorUnits: calculation.totalMinorUnits,
      currency: calculation.plan.currency,
      status: "COMPLETED",
    },
  });

  // Create the invoice with line items
  const invoice = await prisma.invoice.create({
    data: {
      parentId,
      invoiceNumber: `INV-${Date.now()}`,
      status: "PAID",
      subtotalMinorUnits: calculation.subtotalMinorUnits,
      taxMinorUnits: calculation.taxMinorUnits,
      totalMinorUnits: calculation.totalMinorUnits,
      currency: calculation.plan.currency,
      items: {
        create: [
          {
            description: calculation.plan.nameEn,
            quantity: 1,
            amountMinorUnits: calculation.subtotalMinorUnits,
          },
        ],
      },
      payments: {
        connect: [{ idempotencyKey: session.id }],
      },
    },
  });
}

export async function recordRenewalInvoice(invoice: Stripe.Invoice): Promise<void> {
  const parentId = invoice.metadata?.parentId;
  const planId = invoice.metadata?.planId;

  if (!parentId || !planId) {
    console.error("[stripe webhook] invoice.paid missing parentId/planId metadata", invoice.id);
    return;
  }

  const existingPayment = await prisma.payment.findUnique({ where: { idempotencyKey: invoice.id } });
  if (existingPayment) {
    return; // already recorded
  }

  const totalMinorUnits = invoice.total || 0;
  const taxMinorUnits = invoice.tax || 0;
  const subtotalMinorUnits = totalMinorUnits - taxMinorUnits;

  // Get the plan from the database
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    console.error("[stripe webhook] plan not found", planId);
    return;
  }

  // Record the renewal payment
  await prisma.payment.create({
    data: {
      parentId,
      idempotencyKey: invoice.id,
      provider: "STRIPE",
      amountMinorUnits: totalMinorUnits,
      currency: invoice.currency?.toUpperCase() || "USD",
      status: "COMPLETED",
    },
  });

  // Create the renewal invoice
  await prisma.invoice.create({
    data: {
      parentId,
      invoiceNumber: `INV-${Date.now()}`,
      status: "PAID",
      subtotalMinorUnits,
      taxMinorUnits,
      totalMinorUnits,
      currency: invoice.currency?.toUpperCase() || "USD",
      items: {
        create: [
          {
            description: plan.nameEn,
            quantity: 1,
            amountMinorUnits: subtotalMinorUnits,
          },
        ],
      },
      payments: {
        connect: [{ idempotencyKey: invoice.id }],
      },
    },
  });
}

export async function syncSubscriptionStatus(subscription: Stripe.Subscription): Promise<void> {
  const parentId = subscription.metadata?.parentId;
  const planId = subscription.metadata?.planId;

  if (!parentId || !planId) {
    console.error("[stripe webhook] subscription metadata missing parentId/planId", subscription.id);
    return;
  }

  const status = mapStripeSubscriptionStatus(subscription.status);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    console.error("[stripe webhook] plan not found", planId);
    return;
  }

  // Update or create the subscription
  await prisma.subscription.upsert({
    where: { id: `stripe-${subscription.id}` },
    update: {
      status,
      currentPeriodEnd,
    },
    create: {
      id: `stripe-${subscription.id}`,
      parentId,
      planId: plan.id,
      status,
      currentPeriodEnd,
    },
  });
}
