import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { AgeGroup } from "@prisma/client";
import { curriculumLessonRepository } from "../../src/server/repositories/CurriculumLessonRepository";
import { administrationService } from "../../src/server/services/AdministrationService";
import { administrationRepository } from "../../src/server/repositories/AdministrationRepository";
import { assignmentRepository } from "../../src/server/repositories/AssignmentRepository";
import { storyRepository } from "../../src/server/repositories/StoryRepository";
import { printablesRepository } from "../../src/server/repositories/PrintablesRepository";

describe("Curriculum Architecture & 75+ Lessons Per Age Group Verification", () => {
  const ageGroups = [
    AgeGroup.AGE_4_6,
    AgeGroup.AGE_7_10,
    AgeGroup.AGE_11_13,
    AgeGroup.AGE_14_16,
  ];

  const mandatedProgramIds = [
    "prog-foundations",
    "prog-reading",
    "prog-writing",
    "prog-speaking",
    "prog-listening",
    "prog-quran",
    "prog-islamic",
  ];

  test("Every age group must have more than 75 structured lessons (80+ lessons)", async () => {
    const counts = await administrationService.getLessonsCountByAgeGroup();

    for (const ageGroup of ageGroups) {
      const count = counts[ageGroup] || 0;
      assert.ok(
        count > 75,
        `Age group ${ageGroup} must have more than 75 lessons, found ${count}`
      );
      assert.strictEqual(
        count,
        80,
        `Age group ${ageGroup} should have exactly 80 structured lessons`
      );
    }

    const totalLessons = (await curriculumLessonRepository.getAllLessons()).length;
    assert.strictEqual(totalLessons, 320, "Total lessons across 4 age groups must equal 320");
  });

  test("All 7 accredited programs must be covered within each age group", async () => {
    for (const ageGroup of ageGroups) {
      const lessons = await curriculumLessonRepository.getLessonsByAgeGroup(ageGroup);
      const programIdsInAgeGroup = new Set(lessons.map((l) => l.programId));

      for (const progId of mandatedProgramIds) {
        assert.ok(
          programIdsInAgeGroup.has(progId),
          `Program ${progId} must have lessons in age group ${ageGroup}`
        );
      }
    }
  });

  test("Every lesson must have complete pedagogical metadata and interactive classroom tools", async () => {
    const allLessons = await curriculumLessonRepository.getAllLessons();

    for (const lesson of allLessons) {
      assert.ok(lesson.id.length > 0, "Lesson must have an id");
      assert.ok(lesson.titleAr.length > 0, `Lesson ${lesson.id} must have Arabic title`);
      assert.ok(lesson.titleEn.length > 0, `Lesson ${lesson.id} must have English title`);
      assert.ok(lesson.descriptionAr.length > 0, `Lesson ${lesson.id} must have Arabic description`);
      assert.ok(lesson.descriptionEn.length > 0, `Lesson ${lesson.id} must have English description`);
      assert.ok(lesson.objectivesAr.length >= 2, `Lesson ${lesson.id} must have at least 2 Arabic objectives`);
      assert.ok(lesson.objectivesEn.length >= 2, `Lesson ${lesson.id} must have at least 2 English objectives`);
      assert.ok(lesson.targetVocabulary.length > 0, `Lesson ${lesson.id} must have target vocabulary`);
      assert.ok(lesson.durationMinutes >= 30, `Lesson ${lesson.id} duration must be at least 30 minutes`);
      assert.ok(lesson.interactiveTools.length > 0, `Lesson ${lesson.id} must have interactive tools`);
      assert.ok(lesson.homeworkTitleAr.length > 0, `Lesson ${lesson.id} must have homework title`);
    }
  });

  test("AdministrationRepository modules must cover all age groups including AGE_14_16", async () => {
    const modules = await administrationRepository.getAllCurriculumModules();
    assert.ok(modules.length >= 28, `Expected at least 28 curriculum modules, found ${modules.length}`);

    for (const ageGroup of ageGroups) {
      const modulesForAge = modules.filter((m) => m.targetAgeGroup === ageGroup);
      assert.ok(
        modulesForAge.length >= 1,
        `Age group ${ageGroup} must have curriculum modules registered, found ${modulesForAge.length}`
      );
    }

    const scholarsModules = modules.filter((m) => m.targetAgeGroup === AgeGroup.AGE_14_16);
    assert.strictEqual(
      scholarsModules.length,
      7,
      "Scholars (AGE_14_16) must have modules for all 7 programs"
    );
  });

  test("Homework assignments must exist for all 4 age groups", async () => {
    const assignments = await assignmentRepository.getAllAssignments();
    assert.ok(assignments.length >= 12, `Expected at least 12 assignments, found ${assignments.length}`);

    // Verify homework assignments covering sprouts, explorers, pioneers, and scholars
    const sproutsHw = assignments.filter((a) => a.id.includes("sprouts"));
    const pioneersHw = assignments.filter((a) => a.id.includes("pioneers"));
    const scholarsHw = assignments.filter((a) => a.id.includes("scholars"));

    assert.ok(sproutsHw.length >= 2, `Sprouts must have homework assignments, found ${sproutsHw.length}`);
    assert.ok(pioneersHw.length >= 2, `Pioneers must have homework assignments, found ${pioneersHw.length}`);
    assert.ok(scholarsHw.length >= 2, `Scholars must have homework assignments, found ${scholarsHw.length}`);

    for (const hw of assignments) {
      assert.ok(hw.titleAr.length > 0, `Assignment ${hw.id} must have Arabic title`);
      assert.ok(hw.titleEn.length > 0, `Assignment ${hw.id} must have English title`);
      assert.ok(hw.instructions.length > 0, `Assignment ${hw.id} must have instructions`);
    }
  });

  test("Digital library stories must cover all 4 age groups with quizzes", async () => {
    const stories = await storyRepository.getAllStories();
    assert.ok(stories.length >= 6, `Expected at least 6 digital stories, found ${stories.length}`);

    for (const ageGroup of ageGroups) {
      const storiesForAge = stories.filter((s) => s.ageGroup === ageGroup);
      assert.ok(
        storiesForAge.length >= 1,
        `Age group ${ageGroup} must have digital library stories, found ${storiesForAge.length}`
      );
    }

    for (const story of stories) {
      assert.ok(story.titleAr.length > 0, `Story ${story.id} must have Arabic title`);
      assert.ok(story.titleEn.length > 0, `Story ${story.id} must have English title`);
      assert.ok(story.pages.length >= 4, `Story ${story.id} must have at least 4 pages`);
      assert.ok(story.quizQuestions.length >= 1, `Story ${story.id} must have quiz questions`);
      assert.ok(story.audioNarrationUrl.length > 0, `Story ${story.id} must have audio narration URL`);
    }
  });

  test("Printables repository must cover all 4 age groups", async () => {
    const printables = await printablesRepository.getAllPrintables();
    assert.ok(printables.length >= 10, `Expected at least 10 printable packets, found ${printables.length}`);

    for (const ageGroup of ageGroups) {
      const packetsForAge = printables.filter((p) => p.targetAgeGroup === ageGroup);
      assert.ok(
        packetsForAge.length >= 1,
        `Age group ${ageGroup} must have printable packets, found ${packetsForAge.length}`
      );
    }

    for (const packet of printables) {
      assert.ok(packet.titleAr.length > 0, `Printable ${packet.id} must have Arabic title`);
      assert.ok(packet.titleEn.length > 0, `Printable ${packet.id} must have English title`);
      assert.ok(packet.items.length >= 1, `Printable ${packet.id} must have items`);
    }
  });
});
