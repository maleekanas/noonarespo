import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { payrollService } from "../../src/server/services/PayrollService";

describe("Teacher Payroll & Finance Reconciliation Engine", () => {
  const teacherId = "teacher-1";

  test("Should calculate teacher payroll by hours and hourly rate in minor units", async () => {
    const now = new Date();
    const payroll = await payrollService.computeTeacherPayroll(
      teacherId,
      now.getUTCFullYear(),
      now.getUTCMonth() + 1
    );

    // These figures now come from real completed ClassSession rows for the
    // current month, not a fixed demo fallback -- a freshly-seeded/test
    // database may genuinely have zero completed sessions this month, so
    // this only asserts internal consistency, not a specific fake number.
    assert.equal(payroll.teacherId, teacherId);
    assert.ok(payroll.hourlyRateMinorUnits > 0);
    assert.ok(payroll.completedSessionsCount >= 0);
    assert.ok(payroll.totalHours >= 0);
    assert.equal(payroll.grossPayMinorUnits, Math.round(payroll.totalHours * payroll.hourlyRateMinorUnits));
    assert.ok(payroll.status === "PENDING" || payroll.status === "PAID");
  });

  test("Should compute finance reconciliation overview KPIs", async () => {
    const overview = await payrollService.getFinanceOverview();

    assert.ok(overview.totalRevenueMinorUnits >= 0);
    assert.ok(overview.paidInvoicesCount >= 0);
    assert.ok(overview.totalTeacherLiabilityMinorUnits >= 0);
    assert.equal(overview.currency, "USD");
  });
});
