import { RoleType } from "@prisma/client";
import { SessionUser } from "@/lib/auth/session";

/**
 * Checks if the actor has permission to view a student's profile, attendance, and progress records.
 */
export function canViewStudent(
  actor: SessionUser | null,
  targetStudentId: string,
  associatedParentStudentIds: string[] = [],
  teacherClassStudentIds: string[] = []
): boolean {
  if (!actor) return false;

  // Super and School Administrators have full visibility
  if (actor.role === RoleType.SUPER_ADMIN || actor.role === RoleType.SCHOOL_ADMIN || actor.role === RoleType.SUPPORT_AGENT) {
    return true;
  }

  // Parents can only view their verified linked children
  if (actor.role === RoleType.PARENT) {
    return associatedParentStudentIds.includes(targetStudentId);
  }

  // Teachers can view students enrolled in their assigned classes
  if (actor.role === RoleType.TEACHER) {
    return teacherClassStudentIds.includes(targetStudentId);
  }

  // Students can only view their own profile
  if (actor.role === RoleType.STUDENT) {
    return actor.id === targetStudentId;
  }

  return false;
}

/**
 * Checks if the actor has permission to record or modify attendance for a session.
 */
export function canRecordAttendance(
  actor: SessionUser | null,
  assignedTeacherId: string
): boolean {
  if (!actor) return false;

  if (actor.role === RoleType.SUPER_ADMIN || actor.role === RoleType.SCHOOL_ADMIN) {
    return true;
  }

  if (actor.role === RoleType.TEACHER) {
    return actor.id === assignedTeacherId;
  }

  return false;
}

/**
 * Checks if the actor has permission to grade an assignment or exam submission.
 */
export function canGradeSubmission(
  actor: SessionUser | null,
  assignedTeacherId: string
): boolean {
  if (!actor) return false;

  if (actor.role === RoleType.SUPER_ADMIN || actor.role === RoleType.ACADEMIC_ADMIN) {
    return true;
  }

  if (actor.role === RoleType.TEACHER) {
    return actor.id === assignedTeacherId;
  }

  return false;
}

/**
 * Checks if the actor has permission to view a financial invoice or payment record.
 */
export function canViewFinancialRecord(
  actor: SessionUser | null,
  invoiceParentId: string
): boolean {
  if (!actor) return false;

  if (actor.role === RoleType.SUPER_ADMIN || actor.role === RoleType.FINANCE_ADMIN) {
    return true;
  }

  if (actor.role === RoleType.PARENT) {
    return actor.id === invoiceParentId;
  }

  return false;
}

/**
 * Checks if actor can message target user.
 * Direct unmoderated student-to-student or stranger adult-to-child messaging is strictly forbidden.
 */
export function canMessageUser(
  actor: SessionUser | null,
  targetRole: RoleType,
  isLinkedFamilyOrTeacher: boolean
): boolean {
  if (!actor) return false;

  // Student messaging is restricted to supervised class interactions only
  if (actor.role === RoleType.STUDENT || targetRole === RoleType.STUDENT) {
    return false;
  }

  // Admins can communicate with all staff and parents
  if (actor.role === RoleType.SUPER_ADMIN || actor.role === RoleType.SCHOOL_ADMIN) {
    return true;
  }

  // Teachers and parents can only communicate if linked by active enrollment
  if (
    (actor.role === RoleType.TEACHER && targetRole === RoleType.PARENT) ||
    (actor.role === RoleType.PARENT && targetRole === RoleType.TEACHER)
  ) {
    return isLinkedFamilyOrTeacher;
  }

  return false;
}

/**
 * Checks if actor can manage user accounts (activation, suspension, role assignment).
 */
export function canManageUsers(actor: SessionUser | null): boolean {
  if (!actor) return false;
  return actor.role === RoleType.SUPER_ADMIN || actor.role === RoleType.SCHOOL_ADMIN;
}

/**
 * Checks if actor can manage curriculum modules and academic program standards.
 */
export function canManageCurriculum(actor: SessionUser | null): boolean {
  if (!actor) return false;
  return actor.role === RoleType.SUPER_ADMIN || actor.role === RoleType.ACADEMIC_ADMIN;
}

/**
 * Checks if actor has permission to inspect tamper-evident security audit logs.
 */
export function canViewAuditLogs(actor: SessionUser | null): boolean {
  if (!actor) return false;
  return actor.role === RoleType.SUPER_ADMIN;
}

/**
 * Checks if actor can create or publish assessments and quizzes.
 */
export function canManageAssessments(actor: SessionUser | null): boolean {
  if (!actor) return false;
  return (
    actor.role === RoleType.SUPER_ADMIN ||
    actor.role === RoleType.ACADEMIC_ADMIN ||
    actor.role === RoleType.TEACHER
  );
}

/**
 * The superadmin dashboard's 15 hubs. Everything here used to assume one
 * implicit superadmin: requireAdminSession() let SUPER_ADMIN, ACADEMIC_ADMIN
 * and FINANCE_ADMIN straight through to every single hub with no
 * differentiation at all, even though canManageCurriculum() /
 * canViewFinancialRecord() / canViewAuditLogs() / canManageAssessments()
 * above already existed (and were already unit-tested) specifically to
 * express which of those roles should see what. This is the missing piece:
 * one real access matrix, actually consulted by each hub page, so a
 * FINANCE_ADMIN account genuinely cannot open Settings or Integrations, and
 * an ACADEMIC_ADMIN genuinely cannot see payroll or refund an invoice --
 * instead of everyone silently getting superadmin-equivalent access.
 */
export type AdminHub =
  | "students"
  | "teachers"
  | "curriculum"
  | "assessments"
  | "classes"
  | "schedule"
  | "reviews"
  | "reports"
  | "schools"
  | "finance"
  | "data-export"
  | "audit-logs"
  | "integrations"
  | "system-health"
  | "settings";

export function canAccessAdminHub(actor: SessionUser | null, hub: AdminHub): boolean {
  if (!actor) return false;

  // SUPER_ADMIN is the one role with unrestricted platform-wide access --
  // every other admin role's access is a strict subset of this.
  if (actor.role === RoleType.SUPER_ADMIN) return true;

  switch (hub) {
    case "curriculum":
      return canManageCurriculum(actor);
    case "assessments":
      return canManageAssessments(actor);
    case "audit-logs":
      return canViewAuditLogs(actor);
    case "finance":
    case "data-export":
      // Finance's own controls (coupons, plans, invoice refunds/write-offs)
      // and full-data exports are FINANCE_ADMIN's domain.
      return actor.role === RoleType.FINANCE_ADMIN;
    case "students":
    case "teachers":
    case "classes":
    case "schedule":
    case "reviews":
    case "reports":
      // Day-to-day academic operations, plus the reporting dashboard both
      // roles reasonably need to see progress against.
      return actor.role === RoleType.ACADEMIC_ADMIN || actor.role === RoleType.FINANCE_ADMIN;
    case "schools":
    case "integrations":
    case "system-health":
    case "settings":
      // B2B contracts/billing, third-party credentials, infrastructure
      // health, and platform-wide policy are superadmin-only -- these are
      // exactly the kind of thing a limited second admin should NOT be able
      // to touch.
      return false;
    default:
      return false;
  }
}
