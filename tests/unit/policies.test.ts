import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { RoleType } from "@prisma/client";
import {
  canViewStudent,
  canRecordAttendance,
  canGradeSubmission,
  canViewFinancialRecord,
  canMessageUser,
} from "../../src/server/policies/index";
import { SessionUser } from "../../src/lib/auth/session";

describe("Server Authorization Policies & Child Safety Guards", () => {
  const superAdmin: SessionUser = {
    id: "admin-1",
    email: "superadmin@kidsarabicacademy.internal",
    name: "Super Admin",
    role: RoleType.SUPER_ADMIN,
    locale: "ar",
  };

  const teacher: SessionUser = {
    id: "teacher-1",
    email: "ustadh.ahmed@kidsarabicacademy.internal",
    name: "Ustadh Ahmed",
    role: RoleType.TEACHER,
    locale: "ar",
  };

  const parent: SessionUser = {
    id: "parent-1",
    email: "parent.tariq@example.com",
    name: "Tariq",
    role: RoleType.PARENT,
    locale: "ar",
  };

  const student: SessionUser = {
    id: "student-zayd",
    email: "zayd@kidsarabicacademy.internal",
    name: "Zayd Tariq",
    role: RoleType.STUDENT,
    locale: "ar",
  };

  test("canViewStudent: Super Admin can view any student", () => {
    assert.equal(canViewStudent(superAdmin, "student-zayd"), true);
  });

  test("canViewStudent: Parent can only view their linked children", () => {
    // Linked child
    assert.equal(canViewStudent(parent, "student-zayd", ["student-zayd", "student-maryam"]), true);
    // Unlinked stranger child
    assert.equal(canViewStudent(parent, "student-stranger", ["student-zayd", "student-maryam"]), false);
  });

  test("canViewStudent: Teacher can only view students in their assigned classes", () => {
    assert.equal(canViewStudent(teacher, "student-zayd", [], ["student-zayd"]), true);
    assert.equal(canViewStudent(teacher, "student-other-class", [], ["student-zayd"]), false);
  });

  test("canViewStudent: Student can only view their own record", () => {
    assert.equal(canViewStudent(student, "student-zayd"), true);
    assert.equal(canViewStudent(student, "student-other"), false);
  });

  test("canRecordAttendance: Only assigned teacher or admin can record", () => {
    assert.equal(canRecordAttendance(teacher, "teacher-1"), true);
    assert.equal(canRecordAttendance(teacher, "teacher-other"), false);
    assert.equal(canRecordAttendance(superAdmin, "teacher-other"), true);
    assert.equal(canRecordAttendance(parent, "teacher-1"), false);
  });

  test("canGradeSubmission: Only assigned teacher or academic admin can grade", () => {
    assert.equal(canGradeSubmission(teacher, "teacher-1"), true);
    assert.equal(canGradeSubmission(teacher, "teacher-other"), false);
    assert.equal(canGradeSubmission(parent, "teacher-1"), false);
  });

  test("canViewFinancialRecord: Parent can only view own invoices", () => {
    assert.equal(canViewFinancialRecord(parent, "parent-1"), true);
    assert.equal(canViewFinancialRecord(parent, "parent-other"), false);
    assert.equal(canViewFinancialRecord(superAdmin, "parent-other"), true);
    assert.equal(canViewFinancialRecord(student, "parent-1"), false);
  });

  test("canMessageUser: Direct student messaging is strictly blocked at the policy layer", () => {
    // Student to Student -> Strictly blocked
    assert.equal(canMessageUser(student, RoleType.STUDENT, false), false);
    // Adult to Student -> Direct messaging disabled
    assert.equal(canMessageUser(teacher, RoleType.STUDENT, true), false);
    // Teacher to enrolled Parent -> Allowed
    assert.equal(canMessageUser(teacher, RoleType.PARENT, true), true);
    // Teacher to stranger Parent -> Blocked
    assert.equal(canMessageUser(teacher, RoleType.PARENT, false), false);
  });
});
