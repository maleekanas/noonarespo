import {
  DomainProgram,
  DomainCourse,
  DomainCourseLevel,
  DomainClassGroup,
  DomainClassEnrollment,
  DomainTeacherAssignment,
} from "./types";
import { ClassType, EnrollmentStatus, ProgramType, TeacherRoleInClass } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

/**
 * Program.id in the database is a random UUID (`@default(uuid())`), but a
 * stable, human-readable "prog-xxx" slug is used everywhere else a program
 * needs to be referenced outside the database itself: the hardcoded
 * CurriculumModule catalog (AdministrationRepository), the localization
 * dictionaries (programsCatalog.meta), and public links (e.g. the homepage
 * linking into /programs?program=prog-foundations). This map is the single
 * source of truth translating the real, stable `ProgramType` enum into that
 * slug, so pages can look up curriculum/dictionary content for a program
 * without depending on its unstable database id.
 */
export const PROGRAM_TYPE_TO_SLUG: Record<ProgramType, string> = {
  ARABIC_FOUNDATIONS: "prog-foundations",
  READING_PROGRAM: "prog-reading",
  WRITING_PROGRAM: "prog-writing",
  SPEAKING_PROGRAM: "prog-speaking",
  LISTENING_PROGRAM: "prog-listening",
  QURAN_TAJWEED: "prog-quran",
  ISLAMIC_STUDIES: "prog-islamic",
};

export function getProgramSlug(type: ProgramType): string {
  return PROGRAM_TYPE_TO_SLUG[type] || "prog-foundations";
}

/**
 * Prisma-backed repository for the academic catalog (programs, courses,
 * levels, class groups) and the enrollment / teacher-assignment data that
 * links a real child to a real class and a real teacher.
 *
 * This used to be an in-memory-only catalog: real, but never actually
 * written to the database, so it reset on every serverless cold start and
 * was keyed by fixed demo ids ("class-reading-a1-cohort1", "teacher-1",
 * "student-1", ...) that never matched a real signed-up family's data.
 * The catalog itself (courses/levels/class groups/teacher assignments) is
 * now seeded for real via the one-time /api/admin/seed-academic-catalog
 * route; this repository reads and writes those real rows.
 */
class AcademicRepository {
  async getAllPrograms(): Promise<DomainProgram[]> {
    return prisma.program.findMany({ orderBy: { titleAr: "asc" } });
  }

  async getProgramById(id: string): Promise<DomainProgram | null> {
    return prisma.program.findUnique({ where: { id } });
  }

  async getAllCourses(): Promise<DomainCourse[]> {
    return prisma.course.findMany();
  }

  async getCourseById(id: string): Promise<DomainCourse | null> {
    return prisma.course.findUnique({ where: { id } });
  }

  async getCoursesByProgramId(programId: string): Promise<DomainCourse[]> {
    return prisma.course.findMany({ where: { programId } });
  }

  async getAllLevels(): Promise<DomainCourseLevel[]> {
    return prisma.courseLevel.findMany();
  }

  async getLevelById(id: string): Promise<DomainCourseLevel | null> {
    return prisma.courseLevel.findUnique({ where: { id } });
  }

  async getLevelsByCourseId(courseId: string): Promise<DomainCourseLevel[]> {
    return prisma.courseLevel.findMany({ where: { courseId } });
  }

  async getAllClassGroups(): Promise<DomainClassGroup[]> {
    return prisma.classGroup.findMany();
  }

  async getClassGroupById(id: string): Promise<DomainClassGroup | null> {
    return prisma.classGroup.findUnique({ where: { id } });
  }

  async getEnrollmentsByClassGroupId(classGroupId: string): Promise<DomainClassEnrollment[]> {
    return prisma.classEnrollment.findMany({
      where: { classGroupId, status: EnrollmentStatus.ACTIVE },
    });
  }

  async getEnrollmentsByStudentId(studentId: string): Promise<DomainClassEnrollment[]> {
    return prisma.classEnrollment.findMany({ where: { studentId } });
  }

  async getTeacherAssignmentsByClassGroupId(classGroupId: string): Promise<DomainTeacherAssignment[]> {
    return prisma.teacherAssignment.findMany({ where: { classGroupId } });
  }

  async getTeacherAssignmentsByTeacherId(teacherId: string): Promise<DomainTeacherAssignment[]> {
    return prisma.teacherAssignment.findMany({ where: { teacherId } });
  }

  // Mutations
  async createClassGroup(data: {
    courseLevelId: string;
    name: string;
    classType: ClassType;
    capacityMax?: number;
  }): Promise<DomainClassGroup> {
    return prisma.classGroup.create({
      data: {
        courseLevelId: data.courseLevelId,
        name: data.name,
        classType: data.classType,
        capacityMax: data.capacityMax || (data.classType === ClassType.PRIVATE_1_ON_1 ? 1 : 6),
        isActive: true,
      },
    });
  }

  async enrollStudentInClass(studentId: string, classGroupId: string): Promise<DomainClassEnrollment> {
    return prisma.classEnrollment.create({
      data: { studentId, classGroupId, status: EnrollmentStatus.ACTIVE },
    });
  }

  async assignTeacherToClass(
    teacherId: string,
    classGroupId: string,
    role: TeacherRoleInClass = TeacherRoleInClass.PRIMARY
  ): Promise<DomainTeacherAssignment> {
    return prisma.teacherAssignment.upsert({
      where: { teacherId_classGroupId: { teacherId, classGroupId } },
      update: { role },
      create: { teacherId, classGroupId, role },
    });
  }
}

export const academicRepository = new AcademicRepository();
