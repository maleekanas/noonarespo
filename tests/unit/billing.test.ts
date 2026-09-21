import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { billingService } from "../../src/server/services/BillingService";

describe("Billing & Subscription Engine (Minor Units Precision)", () => {
  const planId = "plan-family"; // $96.85 = 9685 minor units (reduced 35% from $149.00)

  test("Should verify all plans have 35% reduced prices in minor units", async () => {
    const plans = await billingService.getAllPlans();
    assert.equal(plans.length, 4);

    const starter = plans.find((p) => p.id === "plan-starter");
    assert.equal(starter?.priceMinorUnits, 3185); // $31.85
    assert.equal(billingService.formatPrice(starter!.priceMinorUnits), "$31.85");

    const group = plans.find((p) => p.id === "plan-group");
    assert.equal(group?.priceMinorUnits, 5785); // $57.85
    assert.equal(billingService.formatPrice(group!.priceMinorUnits), "$57.85");

    const family = plans.find((p) => p.id === "plan-family");
    assert.equal(family?.priceMinorUnits, 9685); // $96.85
    assert.equal(billingService.formatPrice(family!.priceMinorUnits), "$96.85");

    const privatePlan = plans.find((p) => p.id === "plan-private");
    assert.equal(privatePlan?.priceMinorUnits, 14300); // $143.00
    assert.equal(billingService.formatPrice(privatePlan!.priceMinorUnits), "$143.00");
  });

  test("Should calculate base checkout price without coupons accurately in minor units", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId);
    assert.equal(calc.subtotalMinorUnits, 9685);
    assert.equal(calc.discountMinorUnits, 0);
    assert.equal(calc.totalMinorUnits, 9685);
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$96.85");
  });

  test("Should apply 10% coupon (WELCOME10) accurately without rounding drift", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId, "WELCOME10");
    // 10% of 9685 = 968.5 -> rounded to 969
    assert.equal(calc.discountMinorUnits, 969);
    assert.equal(calc.totalMinorUnits, 9685 - 969); // 8716 ($87.16)
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$87.16");
  });

  test("Should apply 20% coupon (SIBLING20) accurately", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId, "SIBLING20");
    // 20% of 9685 = 1937
    assert.equal(calc.discountMinorUnits, 1937);
    assert.equal(calc.totalMinorUnits, 9685 - 1937); // 7748 ($77.48)
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$77.48");
  });

  // Real checkout (charging Stripe, creating the real Subscription/Invoice)
  // is exercised via createStripeCheckoutSession / fulfillCheckoutSession in
  // StripeSubscriptionService, which needs a real Stripe client and isn't
  // covered by this plain-unit-test file. BillingService itself no longer
  // has a processCheckout() -- that was a second, unused mock-payment path
  // that nothing in the app actually called.
});
