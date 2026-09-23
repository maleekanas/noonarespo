import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { AgeGroup } from "@prisma/client";
import {
  curriculumLessonRepository,
  BloomStage,
  BidePillar,
  SteamDomain,
} from "../../src/server/repositories/CurriculumLessonRepository";

describe("Holistic Learning Framework (Bloom's Taxonomy, BIDE Model & STEAM Methodology)", () => {
  const validBloomStages: BloomStage[] = [
    "REMEMBER",
    "UNDERSTAND",
    "APPLY",
    "ANALYZE",
    "EVALUATE",
    "CREATE",
  ];

  const validBidePillars: BidePillar[] = [
    "BROAD",
    "INSPIRING",
    "DEEP",
    "EFFICIENT",
  ];

  const validSteamDomains: SteamDomain[] = [
    "SCIENCE",
    "TECHNOLOGY",
    "ENGINEERING",
    "ARTS",
    "MATHS",
  ];

  test("1. All 320 lessons must possess valid Bloom, BIDE, and STEAM attributes", async () => {
    const allLessons = await curriculumLessonRepository.getAllLessons();
    assert.strictEqual(allLessons.length, 320, "Total curriculum lessons must equal 320");

    for (const lesson of allLessons) {
      // Bloom's Taxonomy
      assert.ok(
        validBloomStages.includes(lesson.bloomStage),
        `Lesson ${lesson.id} has invalid Bloom stage: ${lesson.bloomStage}`
      );

      // BIDE Pillars
      assert.ok(
        Array.isArray(lesson.bidePillars) && lesson.bidePillars.length > 0,
        `Lesson ${lesson.id} must have non-empty BIDE pillars`
      );
      for (const pillar of lesson.bidePillars) {
        assert.ok(
          validBidePillars.includes(pillar),
          `Lesson ${lesson.id} has invalid BIDE pillar: ${pillar}`
        );
      }

      // STEAM Domain
      assert.ok(
        validSteamDomains.includes(lesson.steamDomain),
        `Lesson ${lesson.id} has invalid STEAM domain: ${lesson.steamDomain}`
      );

      // STEAM Connection explanations
      assert.ok(
        typeof lesson.steamConnectionAr === "string" && lesson.steamConnectionAr.length > 5,
        `Lesson ${lesson.id} must have informative Arabic STEAM connection`
      );
      assert.ok(
        typeof lesson.steamConnectionEn === "string" && lesson.steamConnectionEn.length > 5,
        `Lesson ${lesson.id} must have informative English STEAM connection`
      );
    }
  });

  test("2. Cognitive progression aligns with age groups across Bloom's Taxonomy", async () => {
    // Sprouts (AGE_4_6): Foundational recall & understanding
    const sprouts = await curriculumLessonRepository.getLessonsByAgeGroup(AgeGroup.AGE_4_6);
    assert.strictEqual(sprouts.length, 80);
    const sproutsStages = new Set(sprouts.map((l) => l.bloomStage));
    assert.ok(sproutsStages.has("REMEMBER"));
    assert.ok(sproutsStages.has("UNDERSTAND"));

    // Explorers (AGE_7_10): Application & analysis
    const explorers = await curriculumLessonRepository.getLessonsByAgeGroup(AgeGroup.AGE_7_10);
    assert.strictEqual(explorers.length, 80);
    const explorerStages = new Set(explorers.map((l) => l.bloomStage));
    assert.ok(explorerStages.has("APPLY"));
    assert.ok(explorerStages.has("ANALYZE"));

    // Pioneers (AGE_11_13): Critical analysis & evaluation
    const pioneers = await curriculumLessonRepository.getLessonsByAgeGroup(AgeGroup.AGE_11_13);
    assert.strictEqual(pioneers.length, 80);
    const pioneerStages = new Set(pioneers.map((l) => l.bloomStage));
    assert.ok(pioneerStages.has("ANALYZE"));
    assert.ok(pioneerStages.has("EVALUATE"));

    // Scholars (AGE_14_16): Advanced evaluation & original creation
    const scholars = await curriculumLessonRepository.getLessonsByAgeGroup(AgeGroup.AGE_14_16);
    assert.strictEqual(scholars.length, 80);
    const scholarStages = new Set(scholars.map((l) => l.bloomStage));
    assert.ok(scholarStages.has("EVALUATE"));
    assert.ok(scholarStages.has("CREATE"));
  });

  test("3. All 5 STEAM domains are represented across curriculum tracks", async () => {
    const allLessons = await curriculumLessonRepository.getAllLessons();
    const representedDomains = new Set(allLessons.map((l) => l.steamDomain));

    for (const domain of validSteamDomains) {
      assert.ok(
        representedDomains.has(domain),
        `STEAM domain ${domain} must be represented in curriculum`
      );
      const domainLessons = await curriculumLessonRepository.getLessonsBySteamDomain(domain);
      assert.ok(domainLessons.length > 0, `Query for ${domain} must return lessons`);
    }
  });

  test("4. All 4 BIDE model dimensions are actively targeted", async () => {
    const allLessons = await curriculumLessonRepository.getAllLessons();
    const representedPillars = new Set<BidePillar>();
    for (const l of allLessons) {
      for (const p of l.bidePillars) {
        representedPillars.add(p);
      }
    }

    for (const pillar of validBidePillars) {
      assert.ok(
        representedPillars.has(pillar),
        `BIDE pillar ${pillar} must be represented in curriculum`
      );
    }
  });

  test("5. Filtering by Bloom stage works accurately", async () => {
    for (const stage of validBloomStages) {
      const lessons = await curriculumLessonRepository.getLessonsByBloomStage(stage);
      assert.ok(lessons.length > 0, `Lessons must exist for Bloom stage ${stage}`);
      for (const l of lessons) {
        assert.strictEqual(l.bloomStage, stage);
      }
    }
  });

  test("6. Custom lesson creation automatically derives holistic learning attributes", async () => {
    const created = await curriculumLessonRepository.createLesson({
      ageGroup: AgeGroup.AGE_7_10,
      programId: "prog-reading",
      programTitleAr: "برنامج القراءة",
      programTitleEn: "Reading Program",
      courseLevelCode: "A1",
      lessonNumber: 82,
      titleAr: "درس قراءة تفاعلي جديد",
      titleEn: "New Interactive Reading Lesson",
      descriptionAr: "وصف الدرس",
      descriptionEn: "Lesson description",
      objectivesAr: ["الهدف 1"],
      objectivesEn: ["Objective 1"],
      targetVocabulary: ["كتاب"],
      durationMinutes: 40,
      interactiveTools: ["WHITEBOARD"],
      homeworkTitleAr: "واجب القراءة",
      homeworkTitleEn: "Reading Homework",
    });

    assert.ok(created.id);
    assert.ok(validBloomStages.includes(created.bloomStage));
    assert.ok(created.bidePillars.length > 0);
    assert.strictEqual(created.steamDomain, "SCIENCE");
    assert.ok(created.steamConnectionAr.length > 0);
  });
});
