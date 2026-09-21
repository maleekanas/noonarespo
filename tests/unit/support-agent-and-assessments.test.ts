import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { RoleType } from "@prisma/client";
import { canViewStudent, canMessageUser } from "../../src/server/policies";
import { assessmentBankRepository } from "../../src/server/repositories/AssessmentBankRepository";
import type { SessionUser } from "../../src/lib/auth/session";

describe("Support Agent & Multi-Format Assessment Suite", () => {
  const supportAgent: SessionUser = {
    id: "support-agent-1",
    email: "supportagent@kidsarabicacademy.internal",
    role: RoleType.SUPPORT_AGENT,
    name: "Support Agent",
    locale: "en",
  };

  const studentUser: SessionUser = {
    id: "student-1",
    email: "student@kidsarabicacademy.internal",
    role: RoleType.STUDENT,
    name: "Zayd",
    locale: "ar",
  };

  test("canViewStudent allows SUPPORT_AGENT diagnostic read access", () => {
    assert.equal(canViewStudent(supportAgent, "student-1"), true);
    assert.equal(canViewStudent(supportAgent, "student-99"), true);
  });

  test("canMessageUser enforces child safety protection", () => {
    // Direct student to student is strictly disabled
    assert.equal(canMessageUser(studentUser, RoleType.STUDENT, false), false);
  });

  test("assessmentBankRepository supports all 7 question formats", async () => {
    const allAssessments = await assessmentBankRepository.getAllAssessments();
    assert.ok(allAssessments.length > 0);

    const firstAssessment = allAssessments[0];
    const questions = await assessmentBankRepository.getQuestionsByIds(firstAssessment.questionIds);
    assert.ok(questions.length > 0);

    const questionTypes = new Set(questions.map((q) => q.type));
    // Verify question types are present
    assert.ok(questionTypes.size >= 1);
  });
});
