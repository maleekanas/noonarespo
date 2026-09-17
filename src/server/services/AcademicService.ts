import { academicRepository } from "../repositories/AcademicRepository";
import { userRepository } from "../repositories/UserRepository";
import { DomainClassEnrollment, DomainClassGroup } from "../repositories/types";
import { ClassType } from "@prisma/client";

export class AcademicService {
  /**
   * Enrolls a student into a class group, enforcing strict capacity constraints (max 6 students for GROUP)
   * and student existence checks.
   */
  async enrollStudent(studentId: string, classGroupId: string): Promise<DomainClassEnrollment> {
    const student = await userRepository.findStudentProfileById(studentId);
    if (!student) {
      throw new Error(`STUDENT_NOT_FOUND: Student ${studentId} does not exist`);
    }

    const classGroup = await academicRepository.getClassGroupById(classGroupId);
    if (!classGroup) {
      throw new Error(`CLASS_NOT_FOUND: Class group ${classGroupId} does not exist`);
    }

    if (!classGroup.isActive) {
      throw new Error("CLASS_INACTIVE: Cannot enroll in an inactive class group");
    }

    // Multi-tenancy boundary: a class scoped to a partner school (the B2B
    // "Real-Time Collaborative Classroom") may only enroll that school's
    // own roster students, and a school's roster student may not be
    // enrolled into another school's class or a general-platform class
    // meant for individually-enrolled families. Two unscoped (null/null)
    // sides are the normal individual-enrollment path and remain allowed.
    if ((classGroup.schoolId ?? null) !== (student.schoolId ?? null)) {
      throw new Error(
        "SCHOOL_SCOPE_MISMATCH: This student and class group belong to different schools -- a student can only be enrolled in classes scoped to their own institution."
      );
    }

    // Check existing enrollments in this class
    const currentEnrollments = await academicRepository.getEnrollmentsByClassGroupId(classGroupId);
    const alreadyEnrolled = currentEnrollments.some((e) => e.studentId === studentId);
    if (alreadyEnrolled) {
      throw new Error("ALREADY_ENROLLED: Student is already actively enrolled in this class group");
    }

    // Enforce capacity constraint (default max 6 for group, 1 for private)
    if (currentEnrollments.length >= classGroup.capacityMax) {
      throw new Error(
        `CAPACITY_EXCEEDED: Class group has reached its maximum capacity of ${classGroup.capacityMax} students`
      );
    }

    return await academicRepository.enrollStudentInClass(studentId, classGroupId);
  }

  /**
   * Creates a class group with defined capacity constraints.
   */
  async createClassGroup(data: {
    courseLevelId: string;
    name: string;
    classType: ClassType;
    capacityMax?: number;
    schoolId?: string | null;
  }): Promise<DomainClassGroup> {
    const defaultCapacity = data.classType === ClassType.PRIVATE_1_ON_1 ? 1 : 6;
    const capacity = data.capacityMax !== undefined ? data.capacityMax : defaultCapacity;

    if (capacity <= 0) {
      throw new Error("INVALID_CAPACITY: Class capacity must be greater than zero");
    }

    if (data.classType === ClassType.GROUP && capacity > 10) {
      throw new Error("CAPACITY_TOO_LARGE: Group class capacity for children cannot exceed 10 students");
    }

    return await academicRepository.createClassGroup({
      ...data,
      capacityMax: capacity,
    });
  }

  /** Real, school-scoped class list for the Institutional Admin Dashboard. */
  async getClassGroupsForSchool(schoolId: string): Promise<DomainClassGroup[]> {
    return academicRepository.getClassGroupsBySchoolId(schoolId);
  }

  /**
   * Assigns a teacher to a class group.
   */
  async assignTeacherToClass(teacherId: string, classGroupId: string) {
    const teacher = await userRepository.findTeacherProfileById(teacherId);
    if (!teacher) {
      throw new Error(`TEACHER_NOT_FOUND: Teacher ${teacherId} does not exist`);
    }

    const classGroup = await academicRepository.getClassGroupById(classGroupId);
    if (!classGroup) {
      throw new Error(`CLASS_NOT_FOUND: Class group ${classGroupId} does not exist`);
    }

    return await academicRepository.assignTeacherToClass(teacherId, classGroupId);
  }
}

export const academicService = new AcademicService();
