import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { billingService } from "../../src/server/services/BillingService";

describe("Billing & Subscription Engine (Minor Units Precision)", () => {
  const planId = "plan-family"; // $149.00 = 14900 minor units
  const parentId = "parent-1";

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

  test("Should process checkout and create active subscription and paid invoice", async () => {
    const result = await billingService.processCheckout({
      parentId,
      planId: "plan-group", // $89.00 = 8900 minor units
      couponCode: "WELCOME10", // 10% off -> 8010 minor units
      paymentMethod: "CREDIT_CARD",
    });

    assert.equal(result.subscription.status, "ACTIVE");
    assert.equal(result.invoice.status, "PAID");
    assert.equal(result.invoice.totalMinorUnits, 8010);
    assert.ok(result.invoice.invoiceNumber.startsWith("INV-"));
  });
});
