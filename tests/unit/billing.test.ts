import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { billingService } from "../../src/server/services/BillingService";

describe("Billing & Subscription Engine (Minor Units Precision)", () => {
  const planId = "plan-family"; // $74.50 = 7450 minor units (reduced 50% from $149.00: 35% + 15% extra)

  test("Should verify all plans have reduced prices in minor units (35% Starter/Group, 50% Family, 55% Private)", async () => {
    const plans = await billingService.getAllPlans();
    assert.equal(plans.length, 4);

    const starter = plans.find((p) => p.id === "plan-starter");
    assert.equal(starter?.priceMinorUnits, 3185); // $31.85 (35% off)
    assert.equal(billingService.formatPrice(starter!.priceMinorUnits), "$31.85");

    const group = plans.find((p) => p.id === "plan-group");
    assert.equal(group?.priceMinorUnits, 5785); // $57.85 (35% off)
    assert.equal(billingService.formatPrice(group!.priceMinorUnits), "$57.85");

    const family = plans.find((p) => p.id === "plan-family");
    assert.equal(family?.priceMinorUnits, 7450); // $74.50 (50% off: 35% + 15% extra)
    assert.equal(billingService.formatPrice(family!.priceMinorUnits), "$74.50");

    const privatePlan = plans.find((p) => p.id === "plan-private");
    assert.equal(privatePlan?.priceMinorUnits, 9900); // $99.00 (55% off: 35% + 20% extra)
    assert.equal(billingService.formatPrice(privatePlan!.priceMinorUnits), "$99.00");
  });

  test("Should calculate base checkout price without coupons accurately in minor units", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId);
    assert.equal(calc.subtotalMinorUnits, 7450);
    assert.equal(calc.discountMinorUnits, 0);
    assert.equal(calc.totalMinorUnits, 7450);
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$74.50");
  });

  test("Should apply 10% coupon (WELCOME10) accurately without rounding drift", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId, "WELCOME10");
    // 10% of 7450 = 745
    assert.equal(calc.discountMinorUnits, 745);
    assert.equal(calc.totalMinorUnits, 7450 - 745); // 6705 ($67.05)
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$67.05");
  });

  test("Should apply 20% coupon (SIBLING20) accurately", async () => {
    const calc = await billingService.calculateCheckoutPrice(planId, "SIBLING20");
    // 20% of 7450 = 1490
    assert.equal(calc.discountMinorUnits, 1490);
    assert.equal(calc.totalMinorUnits, 7450 - 1490); // 5960 ($59.60)
    assert.equal(billingService.formatPrice(calc.totalMinorUnits), "$59.60");
  });

  // Real checkout (charging Stripe, creating the real Subscription/Invoice)
  // is exercised via createStripeCheckoutSession / fulfillCheckoutSession in
  // StripeSubscriptionService, which needs a real Stripe client and isn't
  // covered by this plain-unit-test file. BillingService itself no longer
  // has a processCheckout() -- that was a second, unused mock-payment path
  // that nothing in the app actually called.
});
