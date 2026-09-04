import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { recommendationService } from "../../src/server/services/RecommendationService";
import { recommendationRepository } from "../../src/server/repositories/RecommendationRepository";
import { gradebookService } from "../../src/server/services/GradebookService";
import { gradebookRepository } from "../../src/server/repositories/GradebookRepository";
import { gamificationService } from "../../src/server/services/GamificationService";
import { communicationRepository } from "../../src/server/repositories/CommunicationRepository";

describe("Phase 10: Phonics & Word Builder Arcade Architecture", () => {
  test("Word Builder challenges should contain valid Arabic letter assemblies and unscramble keys", () => {
    const challenges = [
      { wordFull: "قَلَم", correct: ["ق", "ل", "م"], scrambled: ["ل", "م", "ق"] },
      { wordFull: "شَمْس", correct: ["ش", "م", "س"], scrambled: ["س", "ش", "م"] },
      { wordFull: "نَجْم", correct: ["ن", "ج", "م"], scrambled: ["ج", "ن", "م"] },
      { wordFull: "كِتَاب", correct: ["ك", "ت", "ا", "ب"], scrambled: ["ت", "ب", "ك", "ا"] },
    ];

    challenges.forEach((ch) => {
      // 1. Scrambled letters must have identical length
      assert.strictEqual(ch.scrambled.length, ch.correct.length);
      // 2. All letters in correct must exist in scrambled
      ch.correct.forEach((char) => {
        assert.ok(ch.scrambled.includes(char), `Scrambled missing letter ${char} for ${ch.wordFull}`);
      });
      // 3. Joining correct letters should match base word letters
      assert.strictEqual(ch.correct.join(""), ch.wordFull.replace(/[\u064B-\u0652]/g, ""));
    });
  });

  test("Memory Match dataset must consist of matching image-to-word pairs", () => {
    const pairs = [
      { key: "lion", emoji: "🦁", word: "أَسَد" },
      { key: "rabbit", emoji: "🐰", word: "أَرْنَب" },
      { key: "duck", emoji: "🦆", word: "بَطَّة" },
    ];

    pairs.forEach((p) => {
      assert.ok(p.key.length > 0);
      assert.ok(p.emoji.length > 0);
      assert.ok(p.word.length > 0);
    });
  });
});

describe("Phase 10: AI Parent Recommendations & CEFR Milestone Tracker", () => {
  test("Should synthesize complete parent recommendation overview for active student", async () => {
    const overview = await recommendationService.getParentRecommendationOverview("student-1");

    assert.strictEqual(overview.studentId, "student-1");
    assert.strictEqual(overview.studentName, "زيد طارق");
    assert.ok(overview.totalXp >= 380);
    assert.ok(overview.streakDays >= 5);
    assert.ok(overview.recommendedDailyMinutes >= 15);

    // Verify 5 competencies radar overview
    assert.ok(overview.competencies.listeningScore >= 90);
    assert.ok(overview.competencies.speakingScore >= 90);
    assert.ok(overview.competencies.readingScore >= 90);
    assert.ok(overview.competencies.overallAverage >= 90);

    // Verify recommendations
    assert.ok(overview.recommendations.length >= 3);
    const tajweedRec = overview.recommendations.find((r) => r.category === "TAJWEED");
    assert.ok(tajweedRec, "Expected Tajweed recommendation for Zayd");
    assert.strictEqual(tajweedRec.priority, "HIGH");
    assert.ok(tajweedRec.titleAr.includes("القلقلة"));
    assert.ok(tajweedRec.estimatedMinutesPerDay > 0);

    // Verify CEFR Milestones
    assert.strictEqual(overview.milestoneProgress.currentLevel, "A1");
    assert.strictEqual(overview.milestoneProgress.targetLevel, "A2");
    assert.strictEqual(overview.milestoneProgress.overallProgressPercent, 72);
    assert.strictEqual(overview.milestoneProgress.milestones.length, 4);

    const phonicsMilestone = overview.milestoneProgress.milestones.find((m) => m.code === "M1_PHONICS");
    assert.ok(phonicsMilestone);
    assert.strictEqual(phonicsMilestone.isAchieved, true);

    const quranMilestone = overview.milestoneProgress.milestones.find((m) => m.code === "M3_QURAN_JUZ_AMMA");
    assert.ok(quranMilestone);
    assert.strictEqual(quranMilestone.isAchieved, false);
  });

  test("Should curate age-appropriate learning resources matching student age group", async () => {
    const resources = await recommendationService.getCuratedResourcesForStudent("student-1");
    assert.ok(resources.length >= 3);

    const story = resources.find((r) => r.type === "STORY");
    assert.ok(story, "Expected story in curated resources");
    assert.strictEqual(story.ageGroup, "AGE_7_10");
    assert.ok(story.titleAr.length > 0);
  });
});

describe("Phase 10: Teacher Live Session Gradebook & Quick Rubric Assessment", () => {
  test("Should record live in-class evaluation, award XP, and dispatch parent notification", async () => {
    const initialGamification = await gamificationService.getStudentGamification("student-1");
    const initialXp = initialGamification.totalXp;

    const evalResult = await gradebookService.recordLiveEvaluation({
      studentId: "student-1",
      classGroupId: "class-reading-a1-cohort1",
      wordsPerMinute: 42,
      makharijScore: 96,
      participationStars: 5,
      teacherNotesAr: "تألق استثنائي اليوم في قراءة سورة الفلق وتطبيق أحكام القلقلة بطلاقة تامة!",
    });

    assert.ok(evalResult.gradeEntry.id.startsWith("grade-"));
    assert.strictEqual(evalResult.gradeEntry.studentId, "student-1");
    assert.strictEqual(evalResult.gradeEntry.wordsPerMinute, 42);
    assert.strictEqual(evalResult.gradeEntry.makharijScore, 96);
    assert.strictEqual(evalResult.gradeEntry.participationStars, 5);
    assert.strictEqual(evalResult.gradeEntry.xpAwarded, 20); // 10 + 5*2
    assert.strictEqual(evalResult.parentAlertSent, true);

    // Verify XP increment
    assert.strictEqual(evalResult.newStudentXp, initialXp + 20);

    // Verify parent notification in communication repository
    const notifications = await communicationRepository.getNotificationsByUserId("parent-1");
    const foundAlert = notifications.find((n) => n.type === "LIVE_SESSION_EVALUATION");
    assert.ok(foundAlert, "Expected LIVE_SESSION_EVALUATION notification in parent notifications");
    assert.ok(foundAlert.title.includes("تقييم الحصة المباشرة"));

    // Verify entry in grade history
    const classGrades = await gradebookService.getClassSessionGrades("class-reading-a1-cohort1");
    const recorded = classGrades.find((g) => g.id === evalResult.gradeEntry.id);
    assert.ok(recorded, "Grade entry missing from class session history");
  });

  test("Should clamp gradebook scores and stars within safe bounds", async () => {
    const evalResult = await gradebookService.recordLiveEvaluation({
      studentId: "student-2",
      classGroupId: "class-reading-a1-cohort1",
      wordsPerMinute: 300, // over max
      makharijScore: 150, // over max
      participationStars: 10, // over max 5
      teacherNotesAr: "قراءة جيدة",
    });

    assert.strictEqual(evalResult.gradeEntry.wordsPerMinute, 150);
    assert.strictEqual(evalResult.gradeEntry.makharijScore, 100);
    assert.strictEqual(evalResult.gradeEntry.participationStars, 5);
  });
});
