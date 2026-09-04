import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { administrationService } from "../../src/server/services/AdministrationService";
import {
  canManageUsers,
  canManageCurriculum,
  canViewAuditLogs,
  canManageAssessments,
} from "../../src/server/policies";
import { RoleType, UserStatus } from "@prisma/client";
import { SessionUser } from "../../src/lib/auth/session";

describe("School Administration & Governance Engine", () => {
  const superAdminActor: SessionUser = {
    id: "user-superadmin",
    email: "superadmin@kidsarabicacademy.internal",
    name: "المشرف العام",
    role: RoleType.SUPER_ADMIN,
    locale: "ar",
  };

  const teacherActor: SessionUser = {
    id: "user-teacher-1",
    email: "ustadh.ahmed@kidsarabicacademy.internal",
    name: "الأستاذ أحمد",
    role: RoleType.TEACHER,
    locale: "ar",
  };

  const parentActor: SessionUser = {
    id: "user-parent-1",
    email: "parent.tariq@example.com",
    name: "طارق المنصور",
    role: RoleType.PARENT,
    locale: "ar",
  };

  test("Policy Guards: Should restrict admin capabilities strictly to authorized roles", () => {
    // User management
    assert.equal(canManageUsers(superAdminActor), true);
    assert.equal(canManageUsers(teacherActor), false);
    assert.equal(canManageUsers(parentActor), false);

    // Curriculum management
    assert.equal(canManageCurriculum(superAdminActor), true);
    assert.equal(canManageCurriculum(teacherActor), false);

    // Audit logs (strictly SUPER_ADMIN)
    assert.equal(canViewAuditLogs(superAdminActor), true);
    assert.equal(canViewAuditLogs(teacherActor), false);

    // Assessment management (Admins + Teachers)
    assert.equal(canManageAssessments(superAdminActor), true);
    assert.equal(canManageAssessments(teacherActor), true);
    assert.equal(canManageAssessments(parentActor), false);
  });

  test("Audit Trail: Should generate cryptographically verifiable SHA-256 audit log entry", async () => {
    const entry = await administrationService.recordAuditLog({
      category: "SECURITY",
      action: "FIREWALL_POLICY_UPDATED",
      actor: superAdminActor,
      targetEntityId: "fw-rule-1",
      targetEntityType: "SecurityConfig",
      ipAddress: "10.0.0.1",
      diffSummary: "تحديث قيود أمان الوصول السحابي",
    });

    assert.ok(entry.id);
    assert.equal(entry.category, "SECURITY");
    assert.ok(entry.hash);
    assert.equal(entry.hash.length, 64); // SHA-256 hex length

    const isIntact = await administrationService.verifyLogIntegrity(entry.id);
    assert.equal(isIntact, true);
  });

  test("Student Governance: Should toggle student status and log audit record", async () => {
    const studentId = "student-2";
    await administrationService.setStudentStatus(
      studentId,
      UserStatus.SUSPENDED,
      "طلب ولي الأمر تجميد الحساب مؤقتاً للسفر",
      superAdminActor
    );

    const students = await administrationService.getAllStudents();
    const student = students.find((s) => s.id === studentId);
    assert.equal(student?.status, UserStatus.SUSPENDED);

    const logs = await administrationService.getAuditLogs({ category: "USER_MANAGEMENT" });
    const match = logs.find((l) => l.targetEntityId === studentId && l.action === "STUDENT_SUSPENDED");
    assert.ok(match);
    assert.match(match.diffSummary || "", /تجميد الحساب/);

    // Re-activate
    await administrationService.setStudentStatus(
      studentId,
      UserStatus.ACTIVE,
      "انتهاء فترة السفر واستئناف الدراسة",
      superAdminActor
    );
    const updated = (await administrationService.getAllStudents()).find((s) => s.id === studentId);
    assert.equal(updated?.status, UserStatus.ACTIVE);
  });

  test("Teacher Governance: Should adjust teacher hourly rate in minor units with audit trail", async () => {
    const teacherId = "teacher-1";
    // Increase to $35.00/hr = 3500 minor units
    await administrationService.updateTeacherHourlyRate(teacherId, 3500, superAdminActor);

    const teachers = await administrationService.getAllTeachers();
    const teacher = teachers.find((t) => t.id === teacherId);
    assert.equal(teacher?.hourlyRateMinorUnits, 3500);

    const logs = await administrationService.getAuditLogs({ category: "FINANCE" });
    const match = logs.find((l) => l.targetEntityId === teacherId && l.action === "TEACHER_HOURLY_RATE_MODIFIED");
    assert.ok(match);
    assert.match(match.diffSummary || "", /\$35\.00/);
  });

  test("Analytics: Should compute school-wide executive KPIs correctly", async () => {
    const stats = await administrationService.getSchoolAnalyticsOverview();
    assert.ok(stats.totalStudents >= 4);
    assert.ok(stats.totalTeachers >= 1);
    assert.ok(stats.overallAttendanceRate > 90);
    assert.ok(stats.curriculumModulesCount >= 7);
  });
});
