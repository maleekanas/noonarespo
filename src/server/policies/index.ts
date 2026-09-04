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
