import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { aiService } from "../../src/server/services/AiService";

describe("AI-Powered Arabic Tutoring & Teacher Copilot", () => {
  const studentId = "student-1";

  test("Student AI Conversation: Should reply to greeting with Harakat and pronunciation tip", async () => {
    const result = await aiService.sendStudentMessage({
      studentId,
      message: "مرحبا يا فصيح، كيف حالك؟",
    });

    assert.ok(result.reply.content);
    assert.match(result.reply.content, /أَهْلاً وَسَهْلاً/);
    assert.ok(result.reply.harakatHighlighted);
    assert.ok(result.reply.pronunciationTip);
    assert.ok(result.reply.encouragementXp && result.reply.encouragementXp > 0);
    assert.ok(result.newTotalXp > 0);
  });

  test("Student AI Conversation: Should handle animal vocabulary discussion", async () => {
    const result = await aiService.sendStudentMessage({
      studentId,
      message: "أحب حيوان الأسد القوي!",
    });

    assert.ok(result.reply.content);
    assert.match(result.reply.content, /أَسَد/);
    assert.ok(result.reply.pronunciationTip);
  });

  test("Teacher AI Assistant: Should generate comprehensive structured lesson plan", async () => {
    const plan = await aiService.generateTeacherLessonPlan({
      programTitle: "برنامج القراءة والطلاقة",
      courseLevel: "A1",
      topicTitle: "المد بالألف والواو والياء",
      targetAgeGroup: "7-10 سنوات",
      durationMinutes: 45,
    });

    assert.ok(plan.titleAr.includes("المد"));
    assert.ok(plan.warmupActivity);
    assert.ok(plan.coreConcepts.length >= 3);
    assert.ok(plan.interactiveGame);
    assert.ok(plan.assessmentQuestion);
    assert.equal(plan.isAiGenerated, true);
  });
});
