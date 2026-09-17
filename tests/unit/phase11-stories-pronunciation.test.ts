import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { storyService } from "../../src/server/services/StoryService";
import { storyRepository } from "../../src/server/repositories/StoryRepository";
import { pronunciationService } from "../../src/server/services/PronunciationService";
import { pronunciationRepository } from "../../src/server/repositories/PronunciationRepository";
import { printablesRepository } from "../../src/server/repositories/PrintablesRepository";

describe("Phase 11: Interactive Illustrated Storybook & Prophetic Values Suite", () => {
  test("Story repository should seed curated stories across categories", async () => {
    const stories = await storyService.getStoryCatalog();
    assert.ok(stories.length >= 3, "Expected at least 3 seeded stories");

    const propheticStories = await storyService.getStoryCatalog("PROPHETIC_STORIES");
    assert.ok(propheticStories.length >= 1);
    assert.ok(propheticStories.some((s) => s.id === "story-nuh-ark"));

    const islamicValues = await storyService.getStoryCatalog("ISLAMIC_VALUES");
    assert.ok(islamicValues.length >= 1);
    assert.ok(islamicValues.some((s) => s.id === "story-ant-grain"));

    const languageAdventures = await storyService.getStoryCatalog("LANGUAGE_ADVENTURE");
    assert.ok(languageAdventures.length >= 1);
    assert.ok(languageAdventures.some((s) => s.id === "story-oasis-words"));
  });

  test("Story pages should have vocalized Arabic text, English translation, and illustration emojis", async () => {
    const nuhStory = await storyService.getStoryDetails("story-nuh-ark");
    assert.ok(nuhStory !== null, "Expected story-nuh-ark to exist");
    assert.strictEqual(nuhStory.pages.length, 4);
    assert.strictEqual(nuhStory.xpReward, 35);

    nuhStory.pages.forEach((page, idx) => {
      assert.strictEqual(page.pageNumber, idx + 1);
      assert.ok(page.textAr.length > 10, "Page should have vocalized Arabic text");
      assert.ok(page.textEn.length > 10, "Page should have English translation");
      assert.ok(page.illustrationEmoji.length > 0, "Page should have illustration emoji");
      assert.ok(page.audioTimestampSeconds >= 0, "Timestamp should be non-negative");
    });
  });

  test("Story quiz evaluation should calculate correct answers and award +35 XP on pass", async () => {
    const storyId = "story-nuh-ark";
    const studentId = "student-1";

    const story = await storyRepository.getStoryById(storyId);
    assert.ok(story !== null);

    // Prepare perfect answers map
    const correctAnswers: Record<string, number> = {};
    story.quizQuestions.forEach((q) => {
      correctAnswers[q.id] = q.correctOptionIndex;
    });

    const result = await storyService.evaluateStoryQuiz({
      studentId,
      storyId,
      selectedOptions: correctAnswers,
    });

    assert.strictEqual(result.isPassed, true);
    assert.strictEqual(result.scorePercentage, 100);
    assert.strictEqual(result.correctCount, story.quizQuestions.length);
    assert.strictEqual(result.xpAwarded, 35);
    assert.ok(result.newTotalXp > 0);
    assert.ok(result.feedbackMessage.includes("35"));

    // Check progress was persisted
    const progress = await storyRepository.getProgress(studentId, storyId);
    assert.ok(progress !== null);
    assert.strictEqual(progress.isCompleted, true);
    assert.strictEqual(progress.quizScorePercentage, 100);
  });

  test("Story quiz evaluation should not award XP if passing threshold is not met", async () => {
    const storyId = "story-ant-grain";
    const studentId = "student-test-failed";

    const story = await storyRepository.getStoryById(storyId);
    assert.ok(story !== null);

    // Provide completely incorrect answers
    const wrongAnswers: Record<string, number> = {};
    story.quizQuestions.forEach((q) => {
      wrongAnswers[q.id] = (q.correctOptionIndex + 1) % q.optionsAr.length;
    });

    const result = await storyService.evaluateStoryQuiz({
      studentId,
      storyId,
      selectedOptions: wrongAnswers,
    });

    assert.strictEqual(result.isPassed, false);
    assert.strictEqual(result.scorePercentage, 0);
    assert.strictEqual(result.xpAwarded, 0);
  });
});

describe("Phase 11: Voice Pronunciation & Audio Waveform Studio Architecture", () => {
  test("Pronunciation repository should contain all 6 core challenging phonemes", async () => {
    const phonemes = await pronunciationService.getPhonemeCatalog();
    assert.strictEqual(phonemes.length, 6);

    const letters = phonemes.map((p) => p.letter);
    assert.ok(letters.includes("ض"), "Missing Dhad (ض)");
    assert.ok(letters.includes("ص"), "Missing Sad (ص)");
    assert.ok(letters.includes("ط"), "Missing Ta (ط)");
    assert.ok(letters.includes("ظ"), "Missing Dha (ظ)");
    assert.ok(letters.includes("ع"), "Missing 'Ayn (ع)");
    assert.ok(letters.includes("ق"), "Missing Qaf (ق)");

    phonemes.forEach((p) => {
      assert.ok(p.makhrajAr.length > 15, `Makhraj missing for ${p.letter}`);
      assert.ok(p.tipsAr.length >= 2, `Tips missing for ${p.letter}`);
      assert.ok(p.sampleWords.length >= 3, `Sample words missing for ${p.letter}`);
    });
  });

  test("Minimal pairs dataset should validate light vs emphatic phonemes and semantic shifts", async () => {
    const pairs = await pronunciationService.getMinimalPairs();
    assert.ok(pairs.length >= 4, "Expected at least 4 minimal pairs");

    const seenSadPair = pairs.find((p) => p.id === "pair-seen-sad");
    assert.ok(seenSadPair !== undefined);
    assert.strictEqual(seenSadPair.wordA.wordAr, "سَيْفٌ");
    assert.strictEqual(seenSadPair.wordB.wordAr, "صَيْفٌ");
    assert.ok(seenSadPair.distinctionExplanationAr.length > 15);

    const kafQafPair = pairs.find((p) => p.id === "pair-kaf-qaf");
    assert.ok(kafQafPair !== undefined);
    assert.strictEqual(kafQafPair.wordA.wordAr, "كَلْبٌ");
    assert.strictEqual(kafQafPair.wordB.wordAr, "قَلْبٌ");
  });

  test("Pronunciation evaluation should score pitch and clarity and award +20 XP on pass", async () => {
    const studentId = "student-1";
    const phonemeId = "phoneme-dhad";

    const result = await pronunciationService.evaluatePronunciation({
      studentId,
      phonemeId,
      audioDurationMs: 1400,
    });

    assert.strictEqual(result.phonemeId, "phoneme-dhad");
    assert.strictEqual(result.letter, "ض");
    assert.ok(result.scorePercentage >= 70, "Score should pass 70% threshold");
    assert.strictEqual(result.isPassed, true);
    assert.strictEqual(result.xpAwarded, 20);
    assert.ok(result.feedback.length > 10);
    assert.ok(result.makhrajAdviceAr.length > 10);

    // Verify practice history was recorded
    const history = await pronunciationService.getStudentHistory(studentId);
    assert.ok(history.length >= 1);
    assert.strictEqual(history[0].phonemeId, "phoneme-dhad");
  });
});

describe("Phase 11: Offline Learning Packet & Printables Hub Architecture", () => {
  test("Printables repository should contain A4 printable packets with QR verification", async () => {
    const printables = await printablesRepository.getAllPrintables();
    assert.ok(printables.length >= 5, "Expected at least 5 printable packets");

    printables.forEach((packet) => {
      assert.ok(packet.id.startsWith("printable-"));
      assert.ok(packet.titleAr.length > 5);
      assert.ok(packet.pageCount >= 1);
      assert.ok(["A4_PORTRAIT", "A4_LANDSCAPE"].includes(packet.paperFormat));
      assert.ok(packet.qrCodeDestinationUrl.startsWith("/"));
      assert.ok(packet.qrCodeLabelAr.length > 5);
      assert.ok(packet.items.length >= 1);
    });
  });

  test("Printables repository should support retrieving packets by specific category and ID", async () => {
    const comic = await printablesRepository.getPrintableById("printable-nuh-ark-comic");
    assert.ok(comic !== null);
    assert.strictEqual(comic.category, "PROPHETIC_COMICS");
    assert.strictEqual(comic.paperFormat, "A4_LANDSCAPE");
    assert.ok(comic.qrCodeDestinationUrl.includes("nuh-ark"));

    const coloring = await printablesRepository.getPrintablesByCategory("COLORING_HARAKAT");
    assert.ok(coloring.length >= 1);
    assert.strictEqual(coloring[0].thumbnailEmoji, "🎨");

    const adhkar = await printablesRepository.getPrintableById("printable-daily-adhkar");
    assert.ok(adhkar !== null);
    assert.strictEqual(adhkar.category, "VOCABULARY_FLASHCARDS");
  });
});

