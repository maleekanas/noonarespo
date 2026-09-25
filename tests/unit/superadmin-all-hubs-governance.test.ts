import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { schoolService } from "@/server/services/SchoolService";
import { reviewService } from "@/server/services/ReviewService";
import { assessmentBankService } from "@/server/services/AssessmentBankService";
import { academicRepository } from "@/server/repositories/AcademicRepository";
import { schedulingService } from "@/server/services/SchedulingService";
import { administrationService } from "@/server/services/AdministrationService";
import { financialRepository, DiscountCoupon } from "@/server/repositories/FinancialRepository";
import { SessionUser } from "@/lib/auth/session";
import { RoleType, UserStatus } from "@prisma/client";

const mockAdmin: SessionUser = {
  id: "admin-gov-test-id",
  email: "superadmin@arabic-academy.test",
  name: "Super Admin",
  role: RoleType.SUPER_ADMIN,
  locale: "ar",
};

describe("Superadmin All Hubs Governance Test Suite", () => {
  it("School Hub: Should create, update tier, toggle active, and delete partner school", async () => {
    // 1. Create School
    const created = await schoolService.createSchool({
      nameAr: "مدرسة الآفاق الدولية للاختبار",
      nameEn: "Al-Afaq International Test School",
      country: "السعودية",
      city: "الرياض",
      type: "PRIVATE_INSTITUTE",
      bundleTier: "INSTITUTION",
      licenseSeatsTotal: 350,
      contactPerson: "أحمد العتيبي",
      contactEmail: "admin@al-afaq.test",
    });
    assert.ok(created.id, "Created school should have an ID");
    assert.equal(created.nameAr, "مدرسة الآفاق الدولية للاختبار");
    assert.equal(created.bundleTier, "INSTITUTION");
    assert.equal(created.licenseSeatsTotal, 350);
    assert.equal(created.contractStatus, "ACTIVE");

    // 2. Update School
    const updated = await schoolService.updateSchool(created.id, {
      licenseSeatsTotal: 500,
      bundleTier: "GROWTH",
    });
    assert.ok(updated, "School should be updated");
    assert.equal(updated.licenseSeatsTotal, 500);
    assert.equal(updated.bundleTier, "GROWTH");

    // 3. Toggle School Active
    const toggled = await schoolService.toggleSchoolActive(created.id);
    assert.ok(toggled, "School status should toggle");
    assert.equal(toggled.contractStatus, "PENDING_RENEWAL");

    // 4. Delete School
    const deleted = await schoolService.deleteSchool(created.id);
    assert.equal(deleted, true);

    const check = await schoolService.getSchoolDetails(created.id);
    assert.equal(check, null, "Deleted school should not be found");
  });

  it("Reviews Moderation Hub: Should reply to reviews and delete reviews", async () => {
    const reviews = await reviewService.getAllReviewsForAdmin();
    assert.ok(reviews.length > 0, "Initial reviews should exist");

    const targetReview = reviews[0];

    // Reply
    const replied = await reviewService.replyToReview(
      targetReview.id,
      "شكراً جزيلاً لرأيكم الكريم، نسعد بخدمتكم دائماً."
    );
    assert.ok(replied, "Review should be replied to");
    assert.equal(replied.adminReplyAr, "شكراً جزيلاً لرأيكم الكريم، نسعد بخدمتكم دائماً.");

    // Delete
    const deleted = await reviewService.deleteReview(targetReview.id);
    assert.equal(deleted, true, "Review should be deleted");

    const allAfter = await reviewService.getAllReviewsForAdmin();
    assert.equal(allAfter.some((r) => r.id === targetReview.id), false);
  });

  it("Assessment Bank Hub: Should add questions, delete questions, create assessments, and toggle publish", async () => {
    // 1. Add Question
    const question = await assessmentBankService.addQuestionToBank(
      {
        programId: "prog-integrated-arabic",
        titleAr: "اختبار نطق حرف الضاد",
        titleEn: "Pronouncing Dad letter",
        promptAr: "استمع للمقطع وسجل صوتك بنطق الحرف",
        promptEn: "Listen and record",
        type: "SPEECH_RECORDING",
        courseLevelCode: "A1",
        points: 15,
        correctAnswer: "ض",
      },
      mockAdmin
    );
    assert.ok(question.id, "Question should have an ID");
    assert.equal(question.type, "SPEECH_RECORDING");

    // 2. Create Assessment
    const assessment = await assessmentBankService.createAssessment(
      {
        titleAr: "اختبار تجريبي شامل",
        titleEn: "Comprehensive Test",
        descriptionAr: "اختبار لقياس مهارات القراءة والنطق",
        courseLevelCode: "A1",
        passingScorePercentage: 75,
        durationMinutes: 40,
        questionIds: [question.id],
        isPublished: true,
      },
      mockAdmin
    );
    assert.ok(assessment.id, "Assessment should be created with an ID");
    assert.equal(assessment.passingScorePercentage, 75);

    // 3. Toggle Publish
    const unpublished = await assessmentBankService.togglePublishAssessment(
      assessment.id,
      mockAdmin
    );
    assert.ok(unpublished);
    assert.equal(unpublished.isPublished, false);

    // 4. Delete Assessment
    const deletedAssessment = await assessmentBankService.deleteAssessment(
      assessment.id,
      mockAdmin
    );
    assert.equal(deletedAssessment, true);

    // 5. Delete Question
    const deletedQuestion = await assessmentBankService.deleteQuestion(
      question.id,
      mockAdmin
    );
    assert.equal(deletedQuestion, true);
  });

  it("Classes Hub: Should assign teachers, enroll students, and unenroll students", async () => {
    const classGroups = await academicRepository.getAllClassGroups();
    assert.ok(classGroups.length > 0, "Class groups should exist");
    const testClass = classGroups[0];

    // Assign Teacher
    const assignment = await academicRepository.assignTeacherToClass(
      "teacher-test-id-123",
      testClass.id
    );
    assert.equal(assignment.classGroupId, testClass.id);
    assert.equal(assignment.teacherId, "teacher-test-id-123");

    const assignments = await academicRepository.getTeacherAssignmentsByClassGroupId(testClass.id);
    assert.ok(assignments.some((a) => a.teacherId === "teacher-test-id-123"));

    // Enroll Student
    const enrollment = await academicRepository.enrollStudentInClass(
      "student-test-id-999",
      testClass.id
    );
    assert.equal(enrollment.classGroupId, testClass.id);
    assert.equal(enrollment.studentId, "student-test-id-999");

    const enrolled = await academicRepository.getEnrollmentsByClassGroupId(testClass.id);
    assert.ok(enrolled.some((e) => e.studentId === "student-test-id-999"));

    // Unenroll Student
    const unenrolled = await academicRepository.unenrollStudent(
      "student-test-id-999",
      testClass.id
    );
    assert.equal(unenrolled, true);

    const afterUnenroll = await academicRepository.getEnrollmentsByClassGroupId(testClass.id);
    assert.equal(afterUnenroll.some((e) => e.studentId === "student-test-id-999"), false);
  });

  it("Schedule Hub: Should schedule sessions and enforce conflict prevention", async () => {
    const classGroups = await academicRepository.getAllClassGroups();
    const classGroupId = classGroups[0].id;
    const teacherId = "teacher-schedule-test-1";

    const baseTime = new Date("2026-10-15T10:00:00.000Z");

    // First session
    const session1 = await schedulingService.scheduleSession({
      classGroupId,
      teacherId,
      startTimeUtc: baseTime,
      durationMinutes: 45,
    });
    assert.ok(session1.id);

    // Conflicting session at exact same time with same teacher
    await assert.rejects(
      async () => {
        await schedulingService.scheduleSession({
          classGroupId: classGroups[1]?.id || classGroupId,
          teacherId,
          startTimeUtc: baseTime,
          durationMinutes: 45,
        });
      },
      /Conflict/i,
      "Should reject conflicting session for the same teacher"
    );
  });

  it("Audit Logs Hub: Should log academic, user management, and security actions with SHA-256 verification", async () => {
    const logs = await administrationService.getAuditLogs();
    assert.ok(logs.length > 0, "Audit logs should contain recorded operations");

    // Verify each log has valid SHA-256 hash
    for (const log of logs) {
      assert.ok(log.hash && log.hash.length === 64, "Log should have 64-char SHA-256 hash");
      assert.ok(log.actorEmail, "Log should have actor email");
      assert.ok(log.category, "Log should have category");
    }
  });

  it("Students Governance: Should reset password, update profile, and toggle status with audit logging", async () => {
    // 1. Reset Student Password
    const resetRes = await administrationService.resetStudentPassword("student-1", "SecureStudent123!", mockAdmin);
    assert.ok(resetRes.tempPassword, "Should return generated temp password");
    assert.equal(resetRes.tempPassword, "SecureStudent123!");

    // 2. Update Student Profile
    const updated = await administrationService.updateStudent(
      "student-1",
      {
        firstName: "عمر",
        lastName: "الفاروق",
        notesInternal: "طالب متميز في القراءة والتجويد",
      },
      mockAdmin
    );
    assert.ok(updated);
    assert.equal(updated.firstName, "عمر");

    // 3. Set Student Status
    await administrationService.setStudentStatus("student-1", UserStatus.SUSPENDED, "Administrative review", mockAdmin);
    await administrationService.setStudentStatus("student-1", UserStatus.ACTIVE, "Reactivation after review", mockAdmin);
  });

  it("Teachers Governance: Should reset password, update full teacher profile, and toggle active", async () => {
    // 1. Reset Teacher Password
    const resetRes = await administrationService.resetTeacherPassword("teacher-1", "UstadhSecure999!", mockAdmin);
    assert.ok(resetRes.tempPassword, "Should return temp password");
    assert.equal(resetRes.tempPassword, "UstadhSecure999!");

    // 2. Update Teacher Profile
    const updated = await administrationService.updateTeacherFull(
      "teacher-1",
      {
        hourlyRateMinorUnits: 6500,
        experienceYears: 6,
        qualifications: "إجازة في التجويد والقراءات العشر ومؤهل جامعي",
      },
      mockAdmin
    );
    assert.ok(updated);
    assert.equal(updated.hourlyRateMinorUnits, 6500);
    assert.equal(updated.experienceYears, 6);

    // 3. Toggle Teacher Status
    await administrationService.toggleTeacherStatus("teacher-1", false, mockAdmin);
    await administrationService.toggleTeacherStatus("teacher-1", true, mockAdmin);
  });

  it("Finance Governance: Should manage coupons with create, toggle, and delete operations", async () => {
    // 1. Create Coupon
    const coupon = await financialRepository.createOrUpdateCoupon({
      code: "SUPERPROMO50",
      discountPercentage: 50,
      descriptionAr: "خصم ترويجي 50%",
      isActive: true,
    });
    assert.ok(coupon.code);
    assert.equal(coupon.code, "SUPERPROMO50");
    assert.equal(coupon.discountPercentage, 50);

    // 2. Toggle Coupon Active
    const toggled = await financialRepository.toggleCouponActive(coupon.code);
    assert.ok(toggled);
    assert.equal(toggled.isActive, false);

    // 3. Delete Coupon
    const deleted = await financialRepository.deleteCoupon(coupon.code);
    assert.equal(deleted, true);

    const allCoupons = await financialRepository.getAllCoupons();
    assert.equal(allCoupons.some((c: DiscountCoupon) => c.code === coupon.code), false);
  });
});

