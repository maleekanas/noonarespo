import test from "node:test";
import assert from "node:assert/strict";
import { systemSettingsService } from "@/server/services/SystemSettingsService";
import { billingService } from "@/server/services/BillingService";
import { systemHealthService } from "@/server/services/SystemHealthService";

test("Superadmin Tools & Governance - SystemSettingsService", async (t) => {
  // NOTE: getSettings/updateSettings/resetDefaults are now async -- they
  // read/write a real `SystemSetting` DB row instead of an in-memory class
  // field, so settings actually survive a deploy or server restart instead
  // of silently resetting to defaults. Without a database this falls back
  // to an in-memory copy for the duration of the process (same behavior as
  // before), which is what these tests exercise in a DB-less test run.
  await t.test("returns expected platform default settings", async () => {
    const settings = await systemSettingsService.getSettings();
    assert.equal(settings.allowRegistration, true);
    assert.equal(settings.allowB2cTrial, true);
    assert.equal(settings.allowB2bTrial, true);
    assert.equal(settings.aiTutorEnabled, true);
    assert.equal(settings.maintenanceMode, false);
    assert.equal(settings.defaultCurrency, "USD");
    assert.equal(settings.sessionDurationDays, 30);
  });

  await t.test("updates feature flags and announcement settings", async () => {
    await systemSettingsService.updateSettings(
      {
        allowB2cTrial: false,
        announcementActive: true,
        announcementType: "URGENT",
        announcementTextAr: "تنبيه هام للجميع",
      },
      "superadmin-tester"
    );

    const updated = await systemSettingsService.getSettings();
    assert.equal(updated.allowB2cTrial, false);
    assert.equal(updated.announcementActive, true);
    assert.equal(updated.announcementType, "URGENT");
    assert.equal(updated.announcementTextAr, "تنبيه هام للجميع");
    assert.equal(updated.lastUpdatedBy, "superadmin-tester");
  });

  await t.test("flushes in-memory rate limits and cache", () => {
    const flushRes = systemSettingsService.flushCache();
    assert.equal(flushRes.success, true);
    assert.ok(flushRes.message.includes("flushed"));
  });

  await t.test("resets back to platform defaults", async () => {
    await systemSettingsService.resetDefaults("superadmin-tester");
    const restored = await systemSettingsService.getSettings();
    assert.equal(restored.allowB2cTrial, true);
    assert.equal(restored.announcementActive, false);
    assert.equal(restored.maintenanceMode, false);
  });
});

test("Superadmin Tools & Governance - Financial Management & Coupon Engine", async (t) => {
  await t.test("retrieves seeded coupons", async () => {
    const coupons = await billingService.getAllCoupons();
    assert.ok(coupons.length >= 2);
    const codes = coupons.map((c) => c.code);
    assert.ok(codes.includes("WELCOME10"));
    assert.ok(codes.includes("SIBLING20"));
  });

  await t.test("creates, applies, toggles, and deletes custom coupon", async () => {
    // 1. Create coupon TEST30
    await billingService.saveCoupon({
      code: "TEST30",
      discountPercentage: 30,
      descriptionAr: "خصم اختباري 30%",
      isActive: true,
    });

    const created = await billingService.getAllCoupons();
    assert.ok(created.some((c) => c.code === "TEST30"));

    // 2. Apply coupon to Individual Plan ($51.35 = 5135 minor units)
    const calculation = await billingService.calculateCheckoutPrice("plan-individual", "TEST30");
    assert.equal(calculation.plan.id, "plan-individual");
    assert.ok(calculation.couponApplied);
    assert.equal(calculation.couponApplied.code, "TEST30");
    assert.equal(calculation.couponApplied.discountPercentage, 30);
    // 30% of 5135 = 1541
    assert.equal(calculation.discountMinorUnits, 1541);
    assert.equal(calculation.totalMinorUnits, 5135 - 1541);

    // 3. Toggle coupon to inactive
    await billingService.toggleCoupon("TEST30");
    const inactiveCalc = await billingService.calculateCheckoutPrice("plan-individual", "TEST30");
    assert.equal(inactiveCalc.couponApplied, undefined);
    assert.equal(inactiveCalc.discountMinorUnits, 0);

    // 4. Delete coupon
    const deleted = await billingService.deleteCoupon("TEST30");
    assert.equal(deleted, true);
    const afterDelete = await billingService.getAllCoupons();
    assert.ok(!afterDelete.some((c) => c.code === "TEST30"));
  });
});

test("Superadmin Tools & Governance - 7-Pillar System Health Telemetry", async (t) => {
  await t.test("checks payments subsystem", async () => {
    const payments = await systemHealthService.checkPayments();
    assert.equal(payments.name, "Commercial Payment Gateway (Stripe)");
    assert.ok(["HEALTHY", "DEGRADED"].includes(payments.status));
    assert.ok(payments.details);
    assert.ok(payments.latencyMs >= 0);
  });

  await t.test("checks real-time sync subsystem", async () => {
    const realtime = await systemHealthService.checkRealTimeSync();
    assert.equal(realtime.name, "Real-Time Classroom Sync (Pusher Channels)");
    assert.ok(["HEALTHY", "DEGRADED"].includes(realtime.status));
    assert.ok(realtime.details);
    assert.ok(realtime.latencyMs >= 0);
  });

  await t.test("generates comprehensive 7-pillar report", async () => {
    const report = await systemHealthService.getComprehensiveHealthReport();
    assert.ok(report.timestamp);
    assert.ok(["HEALTHY", "DEGRADED", "DOWN"].includes(report.status));

    const subsystemKeys = Object.keys(report.subsystems);
    assert.equal(subsystemKeys.length, 7);
    assert.ok(subsystemKeys.includes("database"));
    assert.ok(subsystemKeys.includes("storage"));
    assert.ok(subsystemKeys.includes("meetings"));
    assert.ok(subsystemKeys.includes("notifications"));
    assert.ok(subsystemKeys.includes("aiEngines"));
    assert.ok(subsystemKeys.includes("payments"));
    assert.ok(subsystemKeys.includes("realTimeSync"));

    assert.ok(report.telemetry.nodeVersion);
    assert.ok(report.telemetry.supportedLocales.length >= 6);
  });
});
