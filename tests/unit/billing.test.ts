import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { billingService } from "../../src/server/services/BillingService";

describe("Billing & Subscription Engine (Minor Units Precision)", () => {
  const planId = "plan-family"; // $149.00 = 14900 minor units

  test("Should calculate base checkout price without coupons accurately in minor units", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId);
    assert.equal(calc.subtotalMinorUnits, 14900);
    assert.equal(calc.discountMinorUnits, 0);
    assert.equal(calc.totalMinorUnits, 14900);
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$149.00");
  });

  test("Should apply 10% coupon (WELCOME10) accurately without rounding drift", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId, "WELCOME10");
    // 10% of 14900 = 1490
    assert.equal(calc.discountMinorUnits, 1490);
    assert.equal(calc.totalMinorUnits, 14900 - 1490); // 13410 ($134.10)
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$134.10");
  });

  test("Should apply 20% coupon (SIBLING20) accurately", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId, "SIBLING20");
    // 20% of 14900 = 2980
    assert.equal(calc.discountMinorUnits, 2980);
    assert.equal(calc.totalMinorUnits, 14900 - 2980); // 11920 ($119.20)
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$119.20");
  });

  // Real checkout (charging Stripe, creating the real Subscription/Invoice)
  // is exercised via createStripeCheckoutSession / fulfillCheckoutSession in
  // StripeSubscriptionService, which needs a real Stripe client and isn't
  // covered by this plain-unit-test file. BillingService itself no longer
  // has a processCheckout() -- that was a second, unused mock-payment path
  // that nothing in the app actually called.
});
