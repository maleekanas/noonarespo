import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { payrollService } from "../../src/server/services/PayrollService";

describe("Teacher Payroll & Finance Reconciliation Engine", () => {
  const teacherId = "teacher-1";

  test("Should calculate teacher payroll by hours and hourly rate in minor units", async () => {
    const payroll = await payrollService.computeTeacherPayroll(teacherId, "2026-09");

    assert.equal(payroll.teacherId, teacherId);
    assert.equal(payroll.hourlyRateMinorUnits, 3000); // $30.00 / hr
    assert.ok(payroll.completedSessionsCount > 0);
    assert.ok(payroll.totalHours > 0);
    assert.equal(payroll.grossPayMinorUnits, payroll.totalHours * 3000);
    assert.equal(payroll.status, "PENDING");
  });

  test("Should compute finance reconciliation overview KPIs", async () => {
    const overview = await payrollService.getFinanceOverview();

    assert.ok(overview.totalRevenueMinorUnits >= 0);
    assert.ok(overview.paidInvoicesCount >= 0);
    assert.ok(overview.totalTeacherLiabilityMinorUnits >= 0);
    assert.equal(overview.currency, "USD");
  });
});
