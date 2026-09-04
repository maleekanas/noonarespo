import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { assessmentBankService } from "../../src/server/services/AssessmentBankService";
import { administrationService } from "../../src/server/services/AdministrationService";
import { RoleType } from "@prisma/client";
import { SessionUser } from "../../src/lib/auth/session";

describe("Assessment Bank & Examination Builder Engine", () => {
  const teacherActor: SessionUser = {
    id: "user-teacher-1",
    email: "ustadh.ahmed@kidsarabicacademy.internal",
    name: "الأستاذ أحمد",
    role: RoleType.TEACHER,
    locale: "ar",
  };

  test("Question Bank: Should return questions covering all 7 assessment formats", async () => {
    const allQuestions = await assessmentBankService.getQuestionBank();
    assert.ok(allQuestions.length >= 7);

    const types = new Set(allQuestions.map((q) => q.type));
    assert.equal(types.has("MULTIPLE_CHOICE"), true);
    assert.equal(types.has("TRUE_FALSE"), true);
    assert.equal(types.has("WORD_MATCHING"), true);
    assert.equal(types.has("FILL_IN_THE_BLANK"), true);
    assert.equal(types.has("ESSAY"), true);
    assert.equal(types.has("AUDIO_LISTENING"), true);
    assert.equal(types.has("SPEECH_RECORDING"), true);
  });

  test("Examination Builder: Should create a managed exam with passing threshold and calculate points", async () => {
    const exam = await assessmentBankService.createAssessment(
      {
        titleAr: "اختبار نهاية الوحدة - حروف الهجاء والأصوات",
        titleEn: "End of Unit Exam - Alphabet & Sounds",
        descriptionAr: "تقييم تحصيلي شامل لنهاية الوحدة الأولى",
        courseLevelCode: "PRE_A1",
        passingScorePercentage: 70,
        durationMinutes: 25,
        questionIds: ["bq-1", "bq-3"], // points: 10 + 15 = 25
        isPublished: true,
      },
      teacherActor
    );

    assert.ok(exam.id);
    assert.equal(exam.passingScorePercentage, 70);
    assert.equal(exam.totalPoints, 25);
    assert.equal(exam.isPublished, true);

    // Verify audit log
    const logs = await administrationService.getAuditLogs({ category: "ACADEMIC" });
    const log = logs.find((l) => l.targetEntityId === exam.id);
    assert.ok(log);
    assert.equal(log?.action, "ASSESSMENT_EXAM_CREATED");
  });

  test("Publish Controls: Should toggle published status and generate audit entry", async () => {
    const allExams = await assessmentBankService.getAllAssessments();
    const target = allExams[0];
    const initialStatus = target.isPublished;

    const toggled = await assessmentBankService.togglePublishAssessment(target.id, teacherActor);
    assert.equal(toggled?.isPublished, !initialStatus);

    // Restore status
    await assessmentBankService.togglePublishAssessment(target.id, teacherActor);
  });
});
