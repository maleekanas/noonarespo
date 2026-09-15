import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus, SessionStatus, InvoiceStatus, BillingInterval } from "@prisma/client";
import { userRepository } from "../repositories/UserRepository";

export interface TeacherPayrollRecord {
  id: string;
  teacherId: string;
  monthString: string; // "2026-09"
  completedSessionsCount: number;
  totalHours: number;
  hourlyRateMinorUnits: number;
  grossPayMinorUnits: number;
  status: "PAID" | "PENDING";
  paidAt?: Date;
}

export interface FinanceOverview {
  mrrMinorUnits: number;
  totalRevenueMinorUnits: number;
  paidInvoicesCount: number;
  pendingInvoicesCount: number;
  totalTeacherLiabilityMinorUnits: number;
  currency: string;
}

// Divisor used to normalize a non-monthly plan's price into a comparable
// Monthly Recurring Revenue contribution (a quarterly plan's MRR share is
// its price / 3, an annual plan's is its price / 12).
const MONTHLY_DIVISOR: Record<BillingInterval, number> = {
  [BillingInterval.MONTHLY]: 1,
  [BillingInterval.QUARTERLY]: 3,
  [BillingInterval.ANNUALLY]: 12,
};

/**
 * Real, Prisma-backed financial reporting.
 *
 * This used to read from FinancialRepository, an in-memory-only mock with
 * a handful of hardcoded demo invoices/subscriptions/payroll records (and
 * fallback numbers like "sessions.length || 16" and "totalLiability ||
 * 36000") -- meaning the admin finance dashboard and every teacher's
 * payroll page always showed the same fabricated figures no matter what
 * really happened on the site, even though real Stripe-backed
 * Subscription/Invoice/Payment rows have been written to Postgres all
 * along (see StripeSubscriptionService). This service now computes every
 * number from that real data, and persists computed teacher payroll into
 * the TeacherCompensation table (which existed in the schema but nothing
 * ever wrote to).
 */
export class PayrollService {
  /**
   * Computes a teacher's real compensation for one calendar month from
   * their actually-completed class sessions, and upserts it into
   * TeacherCompensation (by teacher + period) so it persists and can later
   * be marked paid. Safe to call more than once for the same month.
   */
  async computeTeacherPayroll(
    teacherId: string,
    periodYear: number,
    periodMonth: number // 1-12
  ): Promise<TeacherPayrollRecord> {
    const teacher = await userRepository.findTeacherProfileById(teacherId);
    const hourlyRate = teacher?.hourlyRateMinorUnits || 3000; // $30.00/hr fallback only if the teacher has no rate on file

    const monthStart = new Date(Date.UTC(periodYear, periodMonth - 1, 1));
    const monthEnd = new Date(Date.UTC(periodYear, periodMonth, 1));

    const completedSessions = await prisma.classSession.findMany({
      where: {
        teacherId,
        status: SessionStatus.COMPLETED,
        startTimeUtc: { gte: monthStart, lt: monthEnd },
      },
      select: { startTimeUtc: true, endTimeUtc: true },
    });

    const rawHours = completedSessions.reduce((sum, s) => {
      return sum + (s.endTimeUtc.getTime() - s.startTimeUtc.getTime()) / (1000 * 60 * 60);
    }, 0);
    const totalHours = Math.round(rawHours * 100) / 100;
    const grossPay = Math.round(totalHours * hourlyRate);

    const existing = await prisma.teacherCompensation.findFirst({
      where: { teacherId, periodYear, periodMonth },
    });

    const saved = existing
      ? await prisma.teacherCompensation.update({
          where: { id: existing.id },
          data: {
            hoursTaught: totalHours,
            rateMinorUnits: hourlyRate,
            totalMinorUnits: grossPay + existing.bonusMinorUnits,
          },
        })
      : await prisma.teacherCompensation.create({
          data: {
            teacherId,
            periodYear,
            periodMonth,
            hoursTaught: totalHours,
            rateMinorUnits: hourlyRate,
            bonusMinorUnits: 0,
            totalMinorUnits: grossPay,
          },
        });

    return {
      id: saved.id,
      teacherId,
      monthString: `${periodYear}-${String(periodMonth).padStart(2, "0")}`,
      completedSessionsCount: completedSessions.length,
      totalHours,
      hourlyRateMinorUnits: hourlyRate,
      grossPayMinorUnits: saved.totalMinorUnits,
      status: saved.isPaid ? "PAID" : "PENDING",
      paidAt: saved.paidAt ?? undefined,
    };
  }

  /**
   * Computes platform-wide financial KPIs from real billing data: MRR from
   * active Subscriptions/Plans, revenue from paid Invoices, and pending
   * teacher liability from unpaid TeacherCompensation rows. Returns real
   * zeros when there's nothing yet, rather than a fabricated placeholder.
   */
  async getFinanceOverview(): Promise<FinanceOverview> {
    const [activeSubs, paidInvoiceAgg, invoiceStatusCounts, unpaidCompensationAgg] =
      await Promise.all([
        prisma.subscription.findMany({
          where: { status: SubscriptionStatus.ACTIVE },
          include: { plan: true },
        }),
        prisma.invoice.aggregate({
          where: { status: InvoiceStatus.PAID },
          _sum: { totalMinorUnits: true },
        }),
        prisma.invoice.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        prisma.teacherCompensation.aggregate({
          where: { isPaid: false },
          _sum: { totalMinorUnits: true },
        }),
      ]);

    const mrrMinorUnits = activeSubs.reduce((sum, sub) => {
      const divisor = MONTHLY_DIVISOR[sub.plan.interval] ?? 1;
      return sum + Math.round(sub.plan.priceMinorUnits / divisor);
    }, 0);

    const paidInvoicesCount =
      invoiceStatusCounts.find((g) => g.status === InvoiceStatus.PAID)?._count._all ?? 0;
    const pendingInvoicesCount =
      invoiceStatusCounts.find((g) => g.status === InvoiceStatus.ISSUED)?._count._all ?? 0;

    return {
      mrrMinorUnits,
      totalRevenueMinorUnits: paidInvoiceAgg._sum.totalMinorUnits ?? 0,
      paidInvoicesCount,
      pendingInvoicesCount,
      totalTeacherLiabilityMinorUnits: unpaidCompensationAgg._sum.totalMinorUnits ?? 0,
      currency: "USD",
    };
  }

  /**
   * Alias for comprehensive financial reconciliation metrics.
   */
  async getFinanceReconciliationOverview() {
    const overview = await this.getFinanceOverview();
    const netAcademyMargin = Math.max(
      0,
      overview.totalRevenueMinorUnits - overview.totalTeacherLiabilityMinorUnits
    );
    return {
      monthlyRecurringRevenueMinorUnits: overview.mrrMinorUnits,
      grossRevenueMinorUnits: overview.totalRevenueMinorUnits,
      totalTeacherPayrollMinorUnits: overview.totalTeacherLiabilityMinorUnits,
      netAcademyMarginMinorUnits: netAcademyMargin,
      paidInvoicesCount: overview.paidInvoicesCount,
      pendingInvoicesCount: overview.pendingInvoicesCount,
      currency: overview.currency,
    };
  }
}

export const payrollService = new PayrollService();
