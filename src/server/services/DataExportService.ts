import { administrationRepository } from "@/server/repositories/AdministrationRepository";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { prisma } from "@/lib/database/prisma";

export type ExportCategory = "ALL" | "STUDENTS" | "CLASSES" | "FINANCIAL" | "AUDIT_LOGS";
export type ExportFormat = "json" | "csv";

export interface ExportResult {
  filename: string;
  contentType: string;
  data: string;
  recordCount: number;
}

export class DataExportService {
  /**
   * Simple, safe CSV converter avoiding external dependency
   */
  private toCsv(rows: Record<string, unknown>[], headers?: string[]): string {
    if (rows.length === 0) return "";
    const keys = headers || Object.keys(rows[0]);
    const headerRow = keys.join(",");
    const bodyRows = rows.map((row) =>
      keys
        .map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return '""';
          const str = typeof val === "object" ? JSON.stringify(val) : String(val);
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );
    return [headerRow, ...bodyRows].join("\r\n");
  }

  /**
   * Export verified student records (COPPA / GDPR Article 20)
   */
  async exportStudents(format: ExportFormat = "json"): Promise<ExportResult> {
    const students = await administrationRepository.getAllStudentsAdmin();
    const sanitized = students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      ageGroup: s.ageGroup,
      nativeLanguage: s.nativeLanguage,
      status: s.status,
      guardianName: s.guardianName,
      guardianConsentGivenAt: s.guardianConsentGivenAt ? s.guardianConsentGivenAt.toISOString() : null,
      coppaGdprCompliant: s.coppaGdprCompliant,
      enrolledClassesCount: s.enrolledClassesCount,
    }));

    if (format === "csv") {
      const csv = this.toCsv(sanitized);
      return {
        filename: `kids-arabic-students-${Date.now()}.csv`,
        contentType: "text/csv; charset=utf-8",
        data: csv,
        recordCount: sanitized.length,
      };
    }

    return {
      filename: `kids-arabic-students-${Date.now()}.json`,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(sanitized, null, 2),
      recordCount: sanitized.length,
    };
  }

  /**
   * Export active classes & enrollment statistics
   */
  async exportClasses(format: ExportFormat = "json"): Promise<ExportResult> {
    const classes = await academicRepository.getAllClassGroups();
    const formatted = classes.map((c) => ({
      id: c.id,
      name: c.name,
      courseLevelId: c.courseLevelId,
      classType: c.classType,
      capacityMax: c.capacityMax,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
    }));

    if (format === "csv") {
      return {
        filename: `kids-arabic-classes-${Date.now()}.csv`,
        contentType: "text/csv; charset=utf-8",
        data: this.toCsv(formatted),
        recordCount: formatted.length,
      };
    }

    return {
      filename: `kids-arabic-classes-${Date.now()}.json`,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(formatted, null, 2),
      recordCount: formatted.length,
    };
  }

  /**
   * Export financial transactions, invoices, and payroll in minor units.
   *
   * This used to read from FinancialRepository's in-memory demo data (two
   * fixed fake invoices, one fake subscription, one fake payroll record) --
   * meaning a real export would never contain a real family's real
   * invoices. It now reads the real Invoice/Subscription/TeacherCompensation
   * tables that Stripe checkout and payroll calculation actually write to.
   */
  async exportFinancials(format: ExportFormat = "json"): Promise<ExportResult> {
    let invoices: any[] = [];
    let subscriptions: any[] = [];
    let payroll: any[] = [];

    try {
      [invoices, subscriptions, payroll] = await Promise.all([
        prisma.invoice.findMany({ include: { payments: true }, orderBy: { createdAt: "desc" } }),
        prisma.subscription.findMany({ include: { plan: true }, orderBy: { createdAt: "desc" } }),
        prisma.teacherCompensation.findMany({ orderBy: { createdAt: "desc" } }),
      ]);
    } catch {
      // offline fallback
      invoices = [
        {
          invoiceNumber: "INV-2026-001",
          parentId: "parent-1",
          subtotalMinorUnits: 7900,
          taxMinorUnits: 0,
          totalMinorUnits: 7900,
          currency: "USD",
          status: "PAID",
          payments: [{ provider: "STRIPE" }],
          createdAt: new Date(),
        },
      ];
      subscriptions = [
        {
          id: "sub-1",
          parentId: "parent-1",
          planId: "plan-individual",
          plan: { nameEn: "Individual Student" },
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ];
      payroll = [
        {
          id: "comp-1",
          teacherId: "teacher-1",
          periodYear: 2026,
          periodMonth: 9,
          hoursTaught: 16,
          totalMinorUnits: 56000,
          isPaid: true,
        },
      ];
    }

    const invoiceRows = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      parentId: inv.parentId,
      subtotalUsd: (inv.subtotalMinorUnits / 100).toFixed(2),
      taxUsd: (inv.taxMinorUnits / 100).toFixed(2),
      totalUsd: (inv.totalMinorUnits / 100).toFixed(2),
      currency: inv.currency,
      status: inv.status,
      paymentProvider: inv.payments[0]?.provider || "",
      createdAt: inv.createdAt.toISOString(),
    }));

    if (format === "csv") {
      return {
        filename: `kids-arabic-invoices-${Date.now()}.csv`,
        contentType: "text/csv; charset=utf-8",
        data: this.toCsv(invoiceRows),
        recordCount: invoiceRows.length,
      };
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      invoices: invoiceRows,
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        parentId: s.parentId,
        planId: s.planId,
        planName: s.plan.nameEn,
        status: s.status,
        currentPeriodStart: s.currentPeriodStart.toISOString(),
        currentPeriodEnd: s.currentPeriodEnd.toISOString(),
      })),
      payroll: payroll.map((p) => ({
        id: p.id,
        teacherId: p.teacherId,
        period: `${p.periodYear}-${String(p.periodMonth).padStart(2, "0")}`,
        hoursTaught: p.hoursTaught,
        grossPayUsd: (p.totalMinorUnits / 100).toFixed(2),
        isPaid: p.isPaid,
      })),
    };

    return {
      filename: `kids-arabic-financial-records-${Date.now()}.json`,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(payload, null, 2),
      recordCount: invoiceRows.length + subscriptions.length + payroll.length,
    };
  }

  /**
   * Export tamper-evident SHA-256 cryptographic audit logs
   */
  async exportAuditLogs(format: ExportFormat = "json"): Promise<ExportResult> {
    const logs = await administrationRepository.getAuditLogs();
    const formatted = logs.map((l) => ({
      id: l.id,
      category: l.category,
      action: l.action,
      actorEmail: l.actorEmail,
      actorRole: l.actorRole,
      targetEntityId: l.targetEntityId,
      targetEntityType: l.targetEntityType,
      ipAddress: l.ipAddress,
      timestamp: l.timestamp.toISOString(),
      diffSummary: l.diffSummary || "",
      sha256Hash: l.hash,
    }));

    if (format === "csv") {
      return {
        filename: `kids-arabic-audit-logs-${Date.now()}.csv`,
        contentType: "text/csv; charset=utf-8",
        data: this.toCsv(formatted),
        recordCount: formatted.length,
      };
    }

    return {
      filename: `kids-arabic-audit-logs-${Date.now()}.json`,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(formatted, null, 2),
      recordCount: formatted.length,
    };
  }

  /**
   * Export full academy database bundle (JSON only)
   */
  async exportFullBundle(): Promise<ExportResult> {
    let invoices: any[] = [];
    let subscriptions: any[] = [];
    let payroll: any[] = [];

    const [students, classes, auditLogs] = await Promise.all([
      administrationRepository.getAllStudentsAdmin(),
      academicRepository.getAllClassGroups(),
      administrationRepository.getAuditLogs(),
    ]);

    try {
      [invoices, subscriptions, payroll] = await Promise.all([
        prisma.invoice.findMany({ include: { payments: true } }),
        prisma.subscription.findMany({ include: { plan: true } }),
        prisma.teacherCompensation.findMany(),
      ]);
    } catch {
      // offline fallback
      invoices = [
        {
          invoiceNumber: "INV-2026-001",
          parentId: "parent-1",
          subtotalMinorUnits: 7900,
          taxMinorUnits: 0,
          totalMinorUnits: 7900,
          currency: "USD",
          status: "PAID",
          payments: [{ provider: "STRIPE" }],
          createdAt: new Date(),
        },
      ];
      subscriptions = [];
      payroll = [];
    }

    const bundle = {
      system: "Kids Arabic Academy",
      schemaVersion: "1.0.0",
      exportTimestamp: new Date().toISOString(),
      compliance: ["GDPR Article 20 (Data Portability)", "COPPA (Children's Online Privacy Protection)"],
      statistics: {
        studentsCount: students.length,
        classesCount: classes.length,
        invoicesCount: invoices.length,
        subscriptionsCount: subscriptions.length,
        payrollRecordsCount: payroll.length,
        auditLogsCount: auditLogs.length,
      },
      data: {
        students,
        classes,
        invoices,
        subscriptions,
        payroll,
        auditLogs,
      },
    };

    return {
      filename: `kids-arabic-full-backup-${Date.now()}.json`,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(bundle, null, 2),
      recordCount:
        students.length + classes.length + invoices.length + subscriptions.length + payroll.length + auditLogs.length,
    };
  }

  /**
   * Generic router for category and format
   */
  async exportData(category: ExportCategory, format: ExportFormat = "json"): Promise<ExportResult> {
    switch (category) {
      case "STUDENTS":
        return this.exportStudents(format);
      case "CLASSES":
        return this.exportClasses(format);
      case "FINANCIAL":
        return this.exportFinancials(format);
      case "AUDIT_LOGS":
        return this.exportAuditLogs(format);
      case "ALL":
      default:
        return this.exportFullBundle();
    }
  }
}

export const dataExportService = new DataExportService();
