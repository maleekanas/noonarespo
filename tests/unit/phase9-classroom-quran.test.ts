import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { quranRepository, type TajweedRuleType } from "../../src/server/repositories/QuranRepository";
import { quranService } from "../../src/server/services/QuranService";
import { reviewRepository } from "../../src/server/repositories/ReviewRepository";
import { reviewService } from "../../src/server/services/ReviewService";
import { gamificationService } from "../../src/server/services/GamificationService";

describe("Phase 9: Quran & Tajweed Studio Architecture", () => {
  test("Should seed Juz Amma Surahs with authentic Uthmani text and translations", async () => {
    const surahs = await quranService.getSurahCatalog();
    assert.ok(surahs.length >= 3, "Expected at least 3 seeded Surahs");

    const fatiha = surahs.find((s) => s.number === 1);
    assert.ok(fatiha, "Surah Al-Fatihah missing");
    assert.strictEqual(fatiha.nameAr, "سُورَةُ الْفَاتِحَةِ");
    assert.strictEqual(fatiha.versesCount, 7);

    const ikhlas = surahs.find((s) => s.number === 112);
    assert.ok(ikhlas, "Surah Al-Ikhlas missing");
    assert.strictEqual(ikhlas.versesCount, 4);

    const falaq = surahs.find((s) => s.number === 113);
    assert.ok(falaq, "Surah Al-Falaq missing");
    assert.strictEqual(falaq.versesCount, 5);
  });

  test("Should color-code Tajweed rules according to international Mushaf standards", async () => {
    const ikhlas = await quranService.getSurahDetail("surah-112");
    assert.ok(ikhlas, "Surah 112 detail missing");

    // All annotations across all verses
    const annotations = ikhlas.verses.flatMap((v) => v.tajweedAnnotations);
    assert.ok(annotations.length > 0, "Expected tajweed annotations in Al-Ikhlas");

    // Check Qalqalah is Red (#DC2626)
    const qalqalahRules = annotations.filter((a) => a.ruleType === "QALQALAH");
    assert.ok(qalqalahRules.length > 0, "Expected Qalqalah annotations");
    qalqalahRules.forEach((q) => {
      assert.strictEqual(q.colorHex, "#DC2626", "Qalqalah must be colored red");
      assert.ok(q.ruleTitleAr.includes("قلقلة"));
    });

    // Check Idgham is Blue (#2563EB)
    const idghamRules = annotations.filter((a) => a.ruleType === "IDGHAM");
    assert.ok(idghamRules.length > 0, "Expected Idgham annotations");
    idghamRules.forEach((i) => {
      assert.strictEqual(i.colorHex, "#2563EB", "Idgham must be colored blue");
    });
  });

  test("Should verify Madd (Purple) and Ikhfa/Izhhar (Green) color annotations in Al-Fatiha", async () => {
    const fatiha = await quranService.getSurahDetail("surah-1");
    assert.ok(fatiha);

    const annotations = fatiha.verses.flatMap((v) => v.tajweedAnnotations);

    const maddRules = annotations.filter((a) => a.ruleType === "MADD");
    assert.ok(maddRules.length > 0, "Expected Madd annotations");
    maddRules.forEach((m) => {
      assert.strictEqual(m.colorHex, "#9333EA", "Madd must be purple");
    });

    const ikhfaRules = annotations.filter((a) => a.ruleType === "IKHFA");
    assert.ok(ikhfaRules.length > 0, "Expected Ikhfa/Izhhar annotations");
    ikhfaRules.forEach((ik) => {
      assert.strictEqual(ik.colorHex, "#059669", "Ikhfa must be green");
    });
  });

  test("Should evaluate recitation submission and award +25 XP via GamificationService", async () => {
    const initialGamification = await gamificationService.getStudentGamification("student-1");
    const initialXp = initialGamification.totalXp;

    const result = await quranService.submitRecitation({
      studentId: "student-1",
      surahId: "surah-112",
      durationSeconds: 22,
    });

    assert.ok(result.submission.id.startsWith("rec-"));
    assert.strictEqual(result.submission.studentId, "student-1");
    assert.strictEqual(result.submission.surahId, "surah-112");
    assert.strictEqual(result.submission.xpAwarded, 25);
    assert.ok(result.submission.overallScore >= 90);
    assert.ok(result.feedbackMessageAr.length > 0);

    // Verify XP increased by +25
    assert.strictEqual(result.newStudentXp, initialXp + 25);

    // Verify submission is persisted
    const studentRecitations = await quranService.getStudentRecitations("student-1");
    const found = studentRecitations.find((r) => r.id === result.submission.id);
    assert.ok(found, "Submission not found in student recitation history");
  });
});

describe("Phase 9: Parent Reviews & Quality Moderation System", () => {
  test("Should retrieve verified teacher reviews and aggregate ratings correctly", async () => {
    const summary = await reviewService.getTeacherReviewSummary("teacher-1");
    assert.strictEqual(summary.teacherId, "teacher-1");
    assert.ok(summary.totalReviewsCount >= 2);
    assert.strictEqual(summary.averageRating, 5.0);
    assert.strictEqual(summary.ratingDistribution[5] >= 2, true);
    assert.ok(summary.reviews.length >= 2);
  });

  test("Should create a parent review with clamped rating and verified status", async () => {
    const newReview = await reviewService.submitParentReview({
      parentId: "parent-1",
      parentName: "طارق المنصور",
      teacherId: "teacher-1",
      teacherName: "أ. أحمد حسن",
      rating: 6, // Over max -> should clamp to 5
      titleAr: "تجربة ممتازة في تعليم مخارج الحروف",
      commentAr: "المعلم حريص جداً ويستخدم السبورة التفاعلية بشكل ممتع للأطفال.",
    });

    assert.strictEqual(newReview.rating, 5, "Rating should be clamped to 5");
    assert.strictEqual(newReview.status, "APPROVED");
    assert.strictEqual(newReview.parentName, "طارق المنصور");
  });

  test("Should allow admin to moderate review status and add administrative feedback", async () => {
    const reviews = await reviewService.getAllReviewsForAdmin();
    assert.ok(reviews.length > 0);

    const target = reviews[0];
    const updated = await reviewService.moderateReview(
      target.id,
      "FLAGGED",
      "قيد التدقيق من إدارة الجودة التعليمية"
    );

    assert.ok(updated);
    assert.strictEqual(updated.status, "FLAGGED");
    assert.strictEqual(updated.adminReplyAr, "قيد التدقيق من إدارة الجودة التعليمية");

    // Restore to APPROVED
    const restored = await reviewService.moderateReview(target.id, "APPROVED");
    assert.strictEqual(restored?.status, "APPROVED");
  });
});

describe("Phase 9: PWA Manifest & Web App Capabilities", () => {
  test("public/manifest.json should exist and conform to Web App Manifest specification", () => {
    const manifestPath = path.resolve(process.cwd(), "public", "manifest.json");
    assert.ok(fs.existsSync(manifestPath), "public/manifest.json must exist");

    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    assert.ok(manifest.name.includes("Kids Arabic Academy") || manifest.name.includes("براعم العربية"));
    assert.ok(manifest.short_name);
    assert.strictEqual(manifest.start_url, "/");
    assert.strictEqual(manifest.display, "standalone");
    assert.strictEqual(manifest.theme_color, "#4F46E5");
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);

    // Verify icon file exists
    const iconPath = path.resolve(process.cwd(), "public", manifest.icons[0].src.replace(/^\//, ""));
    assert.ok(fs.existsSync(iconPath), `Icon file ${iconPath} must exist`);
  });
});
