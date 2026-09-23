import { financialRepository, SubscriptionPlan, DiscountCoupon } from "../repositories/FinancialRepository";

export interface CheckoutCalculation {
  plan: SubscriptionPlan;
  subtotalMinorUnits: number;
  discountMinorUnits: number;
  taxMinorUnits: number;
  totalMinorUnits: number;
  couponApplied?: {
    code: string;
    discountPercentage: number;
  };
}

export class BillingService {
  formatPrice(minorUnits: number, currency = "USD"): string {
    const major = (minorUnits / 100).toFixed(2);
    return currency === "USD" ? `$${major}` : `${major} ${currency}`;
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await financialRepository.getAllPlans();
  }

  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    return await financialRepository.getPlanById(planId);
  }

  async getAllCoupons(): Promise<DiscountCoupon[]> {
    return await financialRepository.getAllCoupons();
  }

  async saveCoupon(coupon: DiscountCoupon): Promise<DiscountCoupon> {
    return await financialRepository.createOrUpdateCoupon(coupon);
  }

  async toggleCoupon(code: string): Promise<DiscountCoupon | null> {
    return await financialRepository.toggleCouponActive(code);
  }

  async deleteCoupon(code: string): Promise<boolean> {
    return await financialRepository.deleteCoupon(code);
  }

  /**
   * Calculates checkout price in 64-bit integer minor units with optional coupon application.
   */
  async calculateCheckoutPrice(
    planId: string,
    couponCode?: string
  ): Promise<CheckoutCalculation> {
    const plan = await financialRepository.getPlanById(planId);
    if (!plan) {
      throw new Error(`PLAN_NOT_FOUND: Plan ${planId} does not exist`);
    }

    const subtotal = plan.priceMinorUnits;
    let discount = 0;
    let couponApplied = undefined;

    if (couponCode && couponCode.trim()) {
      const coupon = await financialRepository.getCoupon(couponCode.trim());
      if (coupon) {
        discount = Math.round((subtotal * coupon.discountPercentage) / 100);
        couponApplied = {
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
        };
      }
    }

    const net = Math.max(0, subtotal - discount);
    const tax = 0; // Tax-exempt educational subscription or included in price
    const total = net + tax;

    return {
      plan,
      subtotalMinorUnits: subtotal,
      discountMinorUnits: discount,
      taxMinorUnits: tax,
      totalMinorUnits: total,
      couponApplied,
    };
  }

  // Real checkout (charging a real card, creating the real Subscription and
  // Invoice) happens via createStripeCheckoutSession / fulfillCheckoutSession
  // in StripeSubscriptionService, backed by Prisma and Stripe. This class
  // used to also have a second, parallel processCheckout() path that
  // "charged" a mock payment gateway and wrote to the in-memory
  // FinancialRepository -- nothing in the app ever called it (the real
  // /parent/checkout page has always used the Stripe path), so it was dead
  // code that just made it look like there were two checkout systems.
}

export const billingService = new BillingService();

