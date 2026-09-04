import { administrationRepository } from "@/server/repositories/AdministrationRepository";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { financialRepository } from "@/server/repositories/FinancialRepository";

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
      guardianConsentGivenAt: s.guardianConsentGivenAt.toISOString(),
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
   * Export financial transactions, invoices, and payroll in minor units
   */
  async exportFinancials(format: ExportFormat = "json"): Promise<ExportResult> {
    const invoices = await financialRepository.getAllInvoices();
    const subscriptions = await financialRepository.getAllSubscriptions();
    const payroll = await financialRepository.getAllPayrollRecords();

    const invoiceRows = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      parentId: inv.parentId,
      subtotalUsd: (inv.subtotalMinorUnits / 100).toFixed(2),
      discountUsd: (inv.discountMinorUnits / 100).toFixed(2),
      taxUsd: (inv.taxMinorUnits / 100).toFixed(2),
      totalUsd: (inv.totalMinorUnits / 100).toFixed(2),
      currency: inv.currency,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      createdAt: inv.createdAt.toISOString(),
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : "",
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
        status: s.status,
        currentPeriodStart: s.currentPeriodStart.toISOString(),
        currentPeriodEnd: s.currentPeriodEnd.toISOString(),
      })),
      payroll: payroll.map((p) => ({
        id: p.id,
        teacherId: p.teacherId,
        monthString: p.monthString,
        totalHours: p.totalHours,
        grossPayUsd: (p.grossPayMinorUnits / 100).toFixed(2),
        status: p.status,
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
    const [students, classes, invoices, subscriptions, payroll, auditLogs] = await Promise.all([
      administrationRepository.getAllStudentsAdmin(),
      academicRepository.getAllClassGroups(),
      financialRepository.getAllInvoices(),
      financialRepository.getAllSubscriptions(),
      financialRepository.getAllPayrollRecords(),
      administrationRepository.getAuditLogs(),
    ]);

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
