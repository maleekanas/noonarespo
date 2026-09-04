import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { roadmapService } from "../../src/server/services/RoadmapService";
import { roadmapRepository } from "../../src/server/repositories/RoadmapRepository";
import { vocabularyService } from "../../src/server/services/VocabularyService";
import { vocabularyRepository } from "../../src/server/repositories/VocabularyRepository";
import { certificateService } from "../../src/server/services/CertificateService";
import { schoolService } from "../../src/server/services/SchoolService";
import { schoolRepository } from "../../src/server/repositories/SchoolRepository";

describe("Phase 12: Visual Learning Journey & Quest Map Architecture", () => {
  test("Student roadmap should seed 10 adventure nodes across 5 distinct biome stages", async () => {
    const studentId = "student-test-roadmap";
    const progress = await roadmapService.getStudentRoadmap(studentId);

    assert.strictEqual(progress.nodes.length, 10, "Expected 10 sequential quest nodes");
    assert.ok(progress.chests.length >= 3, "Expected at least 3 milestone chests");

    // Verify all 5 stages exist
    const stageIds = new Set(progress.nodes.map((n) => n.stageId));
    assert.ok(stageIds.has("stage-oasis"));
    assert.ok(stageIds.has("stage-dunes"));
    assert.ok(stageIds.has("stage-river"));
    assert.ok(stageIds.has("stage-citadel"));
    assert.ok(stageIds.has("stage-palace"));
  });

  test("Completing a node should award stars, grant XP, and unlock the next milestone", async () => {
    const studentId = "student-test-completion";
    const initial = await roadmapService.getStudentRoadmap(studentId);
    const activeNodeId = initial.currentActiveNodeId;

    assert.ok(activeNodeId.length > 0);

    const result = await roadmapService.completeNodeAndAward({
      studentId,
      nodeId: activeNodeId,
      starsEarned: 3,
    });

    assert.strictEqual(result.completedNode.id, activeNodeId);
    assert.strictEqual(result.completedNode.status, "COMPLETED");
    assert.ok(result.xpAwarded >= 20);
    assert.ok(result.newTotalXp > 0);

    // Verify next node became ACTIVE
    const nextNode = result.updatedProgress.nodes.find((n) => n.order === result.completedNode.order + 1);
    if (nextNode) {
      assert.strictEqual(nextNode.status, "ACTIVE");
    }
  });

  test("Milestone chest should be claimable when required stars are reached", async () => {
    const studentId = "student-test-chest";
    const progress = await roadmapRepository.getStudentProgress(studentId);

    // Oasis chest requires 8 stars and starts unlocked in default seed
    const oasisChest = progress.chests.find((c) => c.id === "chest-oasis");
    assert.ok(oasisChest !== undefined);
    assert.strictEqual(oasisChest.isUnlocked, true);

    const claim = await roadmapService.claimMilestoneChest({
      studentId,
      chestId: "chest-oasis",
    });

    assert.strictEqual(claim.chestTitleAr, oasisChest.titleAr);
    assert.strictEqual(claim.xpBonusAwarded, oasisChest.xpBonus);
    assert.ok(claim.newTotalXp > 0);
  });
});

describe("Phase 12: Spaced Repetition (SRS) Vocabulary Studio Architecture", () => {
  test("Vocabulary catalog should contain root families, plurals, and opposites", async () => {
    const allCards = await vocabularyService.getAllCards();
    assert.ok(allCards.length >= 10, "Expected at least 10 vocabulary cards");

    // Root family check (K-T-B)
    const ktbCards = allCards.filter((c) => c.rootLetters === "ك - ت - ب");
    assert.ok(ktbCards.length >= 2);
    assert.ok(ktbCards.some((c) => c.wordAr.includes("كِتَاب")));
    assert.ok(ktbCards.some((c) => c.wordAr.includes("مَكْتَبَة")));

    // Plurals check
    const pluralCard = allCards.find((c) => c.id === "card-plural-qalam");
    assert.ok(pluralCard !== undefined);
    assert.strictEqual(pluralCard.singularAr, "قَلَمٌ");
    assert.strictEqual(pluralCard.pluralAr, "أَقْلَامٌ");

    // Opposites check
    const oppCard = allCards.find((c) => c.id === "card-opp-kabir-saghir");
    assert.ok(oppCard !== undefined);
    assert.strictEqual(oppCard.oppositeAr, "صَغِيرٌ");
  });

  test("Leitner SRS algorithm should advance box on EASY/GOOD and reset on AGAIN", async () => {
    const studentId = "student-test-srs";
    const cardId = "card-ktb-kitab";

    // Grade EASY -> should advance +2 boxes
    const state1 = await vocabularyRepository.updateSrsState(studentId, cardId, "EASY");
    assert.strictEqual(state1.box, 3);
    assert.strictEqual(state1.consecutiveCorrect, 1);

    // Grade GOOD -> should advance +1 box
    const state2 = await vocabularyRepository.updateSrsState(studentId, cardId, "GOOD");
    assert.strictEqual(state2.box, 4);

    // Grade AGAIN -> should demote back to box 1
    const state3 = await vocabularyRepository.updateSrsState(studentId, cardId, "AGAIN");
    assert.strictEqual(state3.box, 1);
    assert.strictEqual(state3.consecutiveCorrect, 0);
  });

  test("Completing an SRS study session should calculate recall accuracy and award +15 XP", async () => {
    const studentId = "student-test-session";
    const result = await vocabularyService.completeSession({
      studentId,
      totalCards: 8,
      againCount: 1, // 7 out of 8 correct = 88%
    });

    assert.strictEqual(result.cardsReviewedCount, 8);
    assert.strictEqual(result.accuracyPercentage, 88);
    assert.strictEqual(result.xpAwarded, 15);
    assert.ok(result.newTotalXp > 0);
    assert.ok(result.streakDays >= 5);
  });
});

describe("Phase 12: Public Tamper-Evident Certificate Verification Architecture", () => {
  test("Should verify authentic certificate by credential ID with SHA-256 validation", async () => {
    const validId = "KAA-CERT-2026-1-A1";
    const result = await certificateService.verifyCertificate(validId);

    assert.strictEqual(result.isValid, true);
    assert.ok(result.certificate !== null);
    assert.strictEqual(result.certificate.credentialId, validId);
    assert.strictEqual(result.certificate.studentNameAr, "زيد طارق");
    assert.ok(result.certificate.verificationHash.length > 8);
    assert.strictEqual(result.digitalSignatureAlgorithm, "SHA-256 with RSA-2048");
  });

  test("Should reject invalid or counterfeit credential IDs", async () => {
    const invalidId = "FAKE-CERT-99999";
    const result = await certificateService.verifyCertificate(invalidId);

    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.certificate, null);
  });
});

describe("Phase 12: Institutional B2B & Islamic School Management Architecture", () => {
  test("Should aggregate institutional KPIs and partner schools across countries", async () => {
    const schools = await schoolService.getAllSchools();
    assert.ok(schools.length >= 4, "Expected at least 4 partner institutions");

    const kpis = await schoolService.getInstitutionalKPIs();
    assert.strictEqual(kpis.totalPartners, schools.length);
    assert.ok(kpis.totalSeatsLicensed >= 350);
    assert.ok(kpis.totalSeatsUsed >= 300);
    assert.ok(kpis.overallUtilizationPercentage >= 80);
    assert.ok(kpis.totalInstitutionalClasses >= 20);
  });

  test("Should onboard student batch and enforce license seat limits", async () => {
    const schoolId = "school-riyadh-coop";
    const school = await schoolRepository.getSchoolById(schoolId);
    assert.ok(school !== null);

    const availableSeats = school.licenseSeatsTotal - school.licenseSeatsUsed;
    assert.strictEqual(availableSeats, 2); // 40 - 38 = 2 seats

    // Onboard 2 students -> should succeed
    const onboardResult = await schoolService.onboardBatchRoster({
      schoolId,
      studentCount: 2,
    });
    assert.strictEqual(onboardResult.school.licenseSeatsUsed, 40);

    // Attempting 1 more student should throw an insufficient seats error
    await assert.rejects(
      async () => {
        await schoolService.onboardBatchRoster({
          schoolId,
          studentCount: 1,
        });
      },
      /Insufficient license seats/
    );
  });
});
