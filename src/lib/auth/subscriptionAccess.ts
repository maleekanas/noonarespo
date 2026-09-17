import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus, type Subscription, type Plan } from "@prisma/client";

/**
 * "TRIAL" = on the 1-day free trial and still within it, so restricted-
 * feature gates below apply. "ACTIVE" = a real paid subscription in good
 * standing, full access. "NONE" = no subscription, an expired/lapsed
 * trial, or a subscription Stripe has flagged PAST_DUE -- no access to
 * anything a subscription is required for.
 */
export type ParentAccessLevel = "TRIAL" | "ACTIVE" | "NONE";

export interface ParentAccessInfo {
  level: ParentAccessLevel;
  subscription: (Subscription & { plan: Plan }) | null;
  trialEndsAt: Date | null;
  /** Hours remaining in the trial, rounded up. Only set when level is "TRIAL". */
  trialHoursRemaining: number | null;
}

/**
 * Resolves what a parent's account can currently do, from the same
 * "most recent ACTIVE/TRIALING/PAST_DUE subscription" query the parent
 * dashboard and billing page already use for display -- this just adds a
 * decision on top of it.
 *
 * Trial expiry is enforced lazily by comparing `currentPeriodEnd` against
 * the current time, the same convention already used by
 * PasswordResetToken/EmailVerificationToken's `expiresAt`, rather than
 * relying on a background job. Stripe's webhook will eventually flip
 * `status` from TRIALING to ACTIVE/PAST_DUE/CANCELLED on its own once the
 * trial-end charge attempt resolves, but this check doesn't wait on that:
 * a trial whose `currentPeriodEnd` has already passed is treated as
 * expired here even if the webhook hasn't landed yet.
 */
export async function getParentAccessLevel(parentId: string): Promise<ParentAccessInfo> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      parentId,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE],
      },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    return { level: "NONE", subscription: null, trialEndsAt: null, trialHoursRemaining: null };
  }

  if (subscription.status === SubscriptionStatus.TRIALING) {
    const msRemaining = subscription.currentPeriodEnd.getTime() - Date.now();
    if (msRemaining > 0) {
      return {
        level: "TRIAL",
        subscription,
        trialEndsAt: subscription.currentPeriodEnd,
        trialHoursRemaining: Math.max(1, Math.ceil(msRemaining / (60 * 60 * 1000))),
      };
    }
    // Locally expired, even if Stripe hasn't told us yet via webhook.
    return {
      level: "NONE",
      subscription,
      trialEndsAt: subscription.currentPeriodEnd,
      trialHoursRemaining: 0,
    };
  }

  if (subscription.status === SubscriptionStatus.ACTIVE) {
    return { level: "ACTIVE", subscription, trialEndsAt: null, trialHoursRemaining: null };
  }

  // PAST_DUE -- Stripe already tried and failed to charge the card (at
  // trial end or a later renewal). No access until it's resolved.
  return { level: "NONE", subscription, trialEndsAt: null, trialHoursRemaining: null };
}
