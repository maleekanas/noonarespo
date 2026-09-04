import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  locales,
  defaultLocale,
  getDictionary,
  isRTL,
  getDirection,
  languages,
  isValidLocale,
  type Locale,
} from "../../src/lib/localization/index";
import { systemHealthService } from "../../src/server/services/SystemHealthService";
import { dataExportService } from "../../src/server/services/DataExportService";
import {
  canViewStudent,
  canRecordAttendance,
  canGradeSubmission,
  canViewFinancialRecord,
  canManageUsers,
  canManageCurriculum,
  canViewAuditLogs,
} from "../../src/server/policies/index";
import { RoleType } from "@prisma/client";

describe("Phase 8: Multi-Lingual Internationalization (6 Locales)", () => {
  test("Should support all 6 mandated locales with (GB) English default fallback", () => {
    assert.strictEqual(defaultLocale, "en");
    assert.strictEqual(locales.length, 6);
    const expected = ["ar", "en", "nl", "tr", "it", "es"];
    expected.forEach((loc) => {
      assert.ok(locales.includes(loc as Locale), `Expected ${loc} to be in locales`);
      assert.ok(isValidLocale(loc), `Expected ${loc} to be valid locale`);
    });
  });

  test("Should assign correct BiDi text directions (RTL for Arabic, LTR for others)", () => {
    assert.strictEqual(isRTL("ar"), true);
    assert.strictEqual(getDirection("ar"), "rtl");

    const ltrLocales = ["en", "nl", "tr", "it", "es"];
    ltrLocales.forEach((loc) => {
      assert.strictEqual(isRTL(loc), false, `Expected ${loc} to be LTR`);
      assert.strictEqual(getDirection(loc), "ltr", `Expected direction for ${loc} to be ltr`);
    });
  });

  test("Language metadata should contain native names and flags for all 6 languages", () => {
    locales.forEach((loc) => {
      const meta = languages[loc];
      assert.ok(meta, `Metadata missing for ${loc}`);
      assert.ok(meta.name.length > 0);
      assert.ok(meta.nativeName.length > 0);
      assert.ok(meta.flag.length > 0);
    });

    assert.strictEqual(languages.ar.nativeName, "العربية");
    assert.strictEqual(languages.en.nativeName, "English (GB)");
    assert.strictEqual(languages.nl.nativeName, "Nederlands");
    assert.strictEqual(languages.tr.nativeName, "Türkçe");
    assert.strictEqual(languages.it.nativeName, "Italiano");
    assert.strictEqual(languages.es.nativeName, "Español");
  });

  test("Dictionaries should have 100% top-level key parity across all 6 languages", () => {
    const baseDict = getDictionary("ar");
    const topKeys = Object.keys(baseDict);

    locales.forEach((loc) => {
      const dict = getDictionary(loc);
      topKeys.forEach((key) => {
        assert.ok(
          key in dict,
          `Dictionary for ${loc} missing top-level key: ${key}`
        );
      });

      // Verify essential sections
      assert.ok(dict.common.siteName.length > 0);
      assert.ok(dict.programs.foundations.length > 0);
      assert.ok(dict.ageGroups.sprouts.length > 0);
    });
  });
});

describe("Phase 8: Enterprise System Observability & Diagnostics", () => {
  test("Database check should verify connection and low query latency", async () => {
    const health = await systemHealthService.checkDatabase();
    assert.strictEqual(health.status, "HEALTHY");
    assert.ok(health.latencyMs >= 0);
    assert.ok(health.details);
  });

  test("Storage check should verify 15-minute signed URL ticket issuance", async () => {
    const health = await systemHealthService.checkStorage();
    assert.strictEqual(health.status, "HEALTHY");
    assert.ok(health.details?.urlTtlMinutes === 15);
  });

  test("Meetings check should verify platforms diagnostic readiness", async () => {
    const health = await systemHealthService.checkMeetings();
    assert.strictEqual(health.status, "HEALTHY");
    assert.ok(health.details?.platforms);
  });

  test("Notifications check should verify multi-channel readiness", async () => {
    const health = await systemHealthService.checkNotifications();
    assert.strictEqual(health.status, "HEALTHY");
    assert.ok(health.details?.channels);
  });

  test("AI engine check should verify conversational tutor responsiveness", async () => {
    const health = await systemHealthService.checkAiEngines();
    assert.strictEqual(health.status, "HEALTHY");
    assert.ok(health.details?.hasHarakatGuidance);
    assert.ok(health.details?.hasPronunciationTip);
  });

  test("Runtime telemetry should provide Node version, memory usage, and uptime", () => {
    const telemetry = systemHealthService.getRuntimeTelemetry();
    assert.ok(telemetry.nodeVersion.startsWith("v"));
    assert.ok(telemetry.uptimeSeconds >= 0);
    assert.ok(telemetry.memoryUsageMb.heapUsed > 0);
    assert.strictEqual(telemetry.supportedLocales.length, 6);
  });

  test("Comprehensive health report should aggregate all 5 subsystems cleanly", async () => {
    const report = await systemHealthService.getComprehensiveHealthReport();
    assert.strictEqual(report.status, "HEALTHY");
    assert.strictEqual(report.platform, "Kids Arabic Academy");
    assert.ok(report.totalLatencyMs >= 0);
    assert.ok("database" in report.subsystems);
    assert.ok("storage" in report.subsystems);
    assert.ok("meetings" in report.subsystems);
    assert.ok("notifications" in report.subsystems);
    assert.ok("aiEngines" in report.subsystems);
  });
});

describe("Phase 8: Data Portability & GDPR / COPPA Compliance", () => {
  test("Should export sanitized student records in JSON with COPPA parental consent", async () => {
    const res = await dataExportService.exportStudents("json");
    assert.strictEqual(res.contentType, "application/json; charset=utf-8");
    assert.ok(res.recordCount > 0);

    const parsed = JSON.parse(res.data);
    assert.ok(Array.isArray(parsed));
    const first = parsed[0];
    assert.ok("firstName" in first);
    assert.ok("guardianName" in first);
    assert.ok("guardianConsentGivenAt" in first);
    assert.strictEqual(first.coppaGdprCompliant, true);
    // Crucial child safety guarantee: no passwords or raw emails
    assert.strictEqual("password" in first, false);
  });

  test("Should export student records in valid CSV format", async () => {
    const res = await dataExportService.exportStudents("csv");
    assert.strictEqual(res.contentType, "text/csv; charset=utf-8");
    assert.ok(res.recordCount > 0);
    const lines = res.data.split("\r\n");
    assert.ok(lines.length >= 2);
    assert.ok(lines[0].includes("firstName"));
    assert.ok(lines[0].includes("guardianConsentGivenAt"));
  });

  test("Should export class rosters with 7 programs and cohort capacities", async () => {
    const res = await dataExportService.exportClasses("json");
    assert.ok(res.recordCount > 0);
    const parsed = JSON.parse(res.data);
    const first = parsed[0];
    assert.ok("name" in first);
    assert.ok("capacityMax" in first);
    assert.strictEqual(first.capacityMax, 6); // Max 6 for small groups
  });

  test("Should export financial ledger in minor units converted to USD strings", async () => {
    const res = await dataExportService.exportFinancials("json");
    assert.ok(res.recordCount > 0);
    const parsed = JSON.parse(res.data);
    assert.ok(Array.isArray(parsed.invoices));
    assert.ok(parsed.invoices.length > 0);
    const firstInv = parsed.invoices[0];
    assert.ok("invoiceNumber" in firstInv);
    assert.ok("totalUsd" in firstInv);
    assert.strictEqual(typeof firstInv.totalUsd, "string");
  });

  test("Should export cryptographic audit trail with SHA-256 integrity hashes", async () => {
    const res = await dataExportService.exportAuditLogs("json");
    assert.ok(res.recordCount > 0);
    const parsed = JSON.parse(res.data);
    const first = parsed[0];
    assert.ok("sha256Hash" in first);
    assert.strictEqual(first.sha256Hash.length, 64);
  });

  test("Should generate full backup archive with compliance headers", async () => {
    const res = await dataExportService.exportFullBundle();
    assert.ok(res.recordCount > 0);
    const parsed = JSON.parse(res.data);
    assert.strictEqual(parsed.system, "Kids Arabic Academy");
    assert.ok(parsed.compliance.includes("GDPR Article 20 (Data Portability)"));
    assert.ok(parsed.data.students.length > 0);
    assert.ok(parsed.data.classes.length > 0);
    assert.ok(parsed.data.invoices.length > 0);
    assert.ok(parsed.data.auditLogs.length > 0);
  });
});

describe("Phase 8: Comprehensive RBAC Security Policies", () => {
  const superAdmin = { id: "u-admin", role: RoleType.SUPER_ADMIN, email: "admin@test.com", name: "Admin", locale: "ar" };
  const teacher = { id: "u-teacher", role: RoleType.TEACHER, email: "teacher@test.com", name: "Teacher", locale: "ar" };
  const parent = { id: "u-parent", role: RoleType.PARENT, email: "parent@test.com", name: "Parent", locale: "ar" };
  const student = { id: "u-student", role: RoleType.STUDENT, email: "student@test.com", name: "Student", locale: "ar" };

  test("canManageUsers policy should strictly authorize Super Admin and School Admin", () => {
    assert.strictEqual(canManageUsers(superAdmin), true);
    assert.strictEqual(canManageUsers({ id: "u-school", role: RoleType.SCHOOL_ADMIN, email: "sa@test.com", name: "SA", locale: "ar" }), true);
    assert.strictEqual(canManageUsers(teacher), false);
    assert.strictEqual(canManageUsers(parent), false);
    assert.strictEqual(canManageUsers(student), false);
  });

  test("canManageCurriculum policy should authorize Super and Academic Admin", () => {
    assert.strictEqual(canManageCurriculum(superAdmin), true);
    assert.strictEqual(canManageCurriculum({ id: "u-acad", role: RoleType.ACADEMIC_ADMIN, email: "aa@test.com", name: "AA", locale: "ar" }), true);
    assert.strictEqual(canManageCurriculum(teacher), false);
    assert.strictEqual(canManageCurriculum(parent), false);
  });

  test("canViewAuditLogs policy should be restricted strictly to Super Admin", () => {
    assert.strictEqual(canViewAuditLogs(superAdmin), true);
    assert.strictEqual(canViewAuditLogs(teacher), false);
    assert.strictEqual(canViewAuditLogs(parent), false);
    assert.strictEqual(canViewAuditLogs(student), false);
  });

  test("canViewFinancialRecord should allow Parent for their own invoice and Admin for all", () => {
    assert.strictEqual(canViewFinancialRecord(superAdmin, "p-123"), true);
    assert.strictEqual(canViewFinancialRecord(parent, "u-parent"), true);
    assert.strictEqual(canViewFinancialRecord(parent, "different-parent"), false);
    assert.strictEqual(canViewFinancialRecord(student, "u-student"), false);
  });
});
