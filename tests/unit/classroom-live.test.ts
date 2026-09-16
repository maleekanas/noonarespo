import test, { describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/database/prisma";
import { academicRepository } from "../../src/server/repositories/AcademicRepository";
import { schedulingRepository } from "../../src/server/repositories/SchedulingRepository";
import { classroomLiveService } from "../../src/server/services/ClassroomLiveService";
import { RoleType, ClassType, AgeGroup, ProgramType } from "@prisma/client";
import type { SessionUser } from "../../src/lib/auth/session";

/**
 * Creates a real, throwaway student account (User + StudentProfile + STUDENT
 * role) with no parent link -- ClassroomLiveService only needs a real
 * enrollment, not a parent relationship.
 */
async function createTestStudent(label: string) {
  const studentRole = await prisma.role.findUniqueOrThrow({ where: { name: RoleType.STUDENT } });
  const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
  const email = `classroom-live-test.${label}.${crypto.randomBytes(4).toString("hex")}@kidsarabicacademy.internal`;

  return prisma.$transaction(async (tx) => {
    const student = await tx.studentProfile.create({
      data: {
        firstName: label,
        lastName: "التجربة",
        dateOfBirth: new Date("2016-01-01"),
        ageGroup: AgeGroup.AGE_7_10,
        nativeLanguage: "ar",
        user: { create: { email, passwordHash, localePreference: "ar" } },
      },
    });
    await tx.userRole.create({ data: { userId: student.userId, roleId: studentRole.id } });
    return student;
  });
}

describe("ClassroomLiveService: real session/roster resolution & participant authorization", () => {
  test("authorizes the assigned teacher and an enrolled student, rejects a non-enrolled student, and reports a nonexistent session honestly", async () => {
    // Real teacher seeded by prisma/seed.ts
    const teacherUser = await prisma.user.findUniqueOrThrow({
      where: { email: "ustadh.ahmed@kidsarabicacademy.internal" },
      include: { teacherProfile: true },
    });
    assert.ok(teacherUser.teacherProfile, "Seeded teacher profile missing -- run `npm run db:seed` first");
    const teacherProfile = teacherUser.teacherProfile!;

    // Minimal real course catalog chain for this test (Program is real seed
    // data and is only read, never modified).
    const program = await prisma.program.findUniqueOrThrow({
      where: { type: ProgramType.ARABIC_FOUNDATIONS },
    });
    const course = await prisma.course.create({
      data: { programId: program.id, titleEn: "Classroom Live Test Course", titleAr: "مقرر اختبار البث المباشر" },
    });
    const courseLevel = await prisma.courseLevel.create({
      data: {
        courseId: course.id,
        levelCode: "TEST",
        titleEn: "Test Level",
        titleAr: "مستوى اختبار",
        targetAge: AgeGroup.AGE_7_10,
      },
    });

    const classGroup = await academicRepository.createClassGroup({
      courseLevelId: courseLevel.id,
      name: "فصل اختبار البث المباشر",
      classType: ClassType.GROUP,
      capacityMax: 6,
    });
    await academicRepository.assignTeacherToClass(teacherProfile.id, classGroup.id);

    const enrolledStudent = await createTestStudent("مسجل");
    const outsiderStudent = await createTestStudent("غريب");
    await academicRepository.enrollStudentInClass(enrolledStudent.id, classGroup.id);
    // outsiderStudent is deliberately left unenrolled.

    const now = new Date();
    const classSession = await schedulingRepository.createSession({
      classGroupId: classGroup.id,
      teacherId: teacherProfile.id,
      startTimeUtc: now,
      endTimeUtc: new Date(now.getTime() + 45 * 60 * 1000),
    });

    const enrolledUser = await prisma.user.findUniqueOrThrow({ where: { id: enrolledStudent.userId } });
    const outsiderUser = await prisma.user.findUniqueOrThrow({ where: { id: outsiderStudent.userId } });

    const teacherSessionUser: SessionUser = {
      id: teacherUser.id,
      email: teacherUser.email,
      name: `${teacherProfile.firstName} ${teacherProfile.lastName}`,
      role: RoleType.TEACHER,
      locale: "ar",
    };
    const enrolledSessionUser: SessionUser = {
      id: enrolledUser.id,
      email: enrolledUser.email,
      name: enrolledStudent.firstName,
      role: RoleType.STUDENT,
      locale: "ar",
    };
    const outsiderSessionUser: SessionUser = {
      id: outsiderUser.id,
      email: outsiderUser.email,
      name: outsiderStudent.firstName,
      role: RoleType.STUDENT,
      locale: "ar",
    };

    // The assigned teacher is authorized and sees the real, live roster.
    const teacherResult = await classroomLiveService.getClassroomContext(classSession.id, teacherSessionUser);
    assert.equal(teacherResult.status, "OK");
    if (teacherResult.status === "OK") {
      assert.equal(teacherResult.context.viewerRole, "TEACHER");
      assert.equal(teacherResult.context.classGroupId, classGroup.id);
      assert.equal(teacherResult.context.roster.length, 1);
      assert.equal(teacherResult.context.roster[0].studentId, enrolledStudent.id);
    }

    // The actually-enrolled student is authorized.
    const studentResult = await classroomLiveService.getClassroomContext(classSession.id, enrolledSessionUser);
    assert.equal(studentResult.status, "OK");
    if (studentResult.status === "OK") {
      assert.equal(studentResult.context.viewerRole, "STUDENT");
      assert.equal(studentResult.context.viewerParticipantId, enrolledStudent.id);
    }

    // A real, valid student account that is simply NOT enrolled in *this*
    // class must be rejected -- a guessed/shared session id must not work.
    const outsiderResult = await classroomLiveService.getClassroomContext(classSession.id, outsiderSessionUser);
    assert.equal(outsiderResult.status, "FORBIDDEN");

    // A nonexistent session id is reported honestly, not silently allowed.
    const missingResult = await classroomLiveService.getClassroomContext(
      "nonexistent-session-id",
      teacherSessionUser
    );
    assert.equal(missingResult.status, "NOT_FOUND");
  });
});
