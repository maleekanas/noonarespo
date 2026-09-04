import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { placementService } from "../../src/server/services/PlacementService";

describe("Placement Assessment Engine", () => {
  const studentId = "student-1";

  test("Should retrieve all 7 required assessment question types", async () => {
    const questions = await placementService.getQuestions();
    assert.equal(questions.length, 7);

    const types = questions.map((q) => q.type);
    assert.ok(types.includes("LETTER_RECOGNITION"));
    assert.ok(types.includes("PHONICS_HARAKAT"));
    assert.ok(types.includes("AUDIO_LISTENING"));
    assert.ok(types.includes("VOCAB_MATCH"));
    assert.ok(types.includes("SENTENCE_CONSTRUCTION"));
    assert.ok(types.includes("READING_COMPREHENSION"));
    assert.ok(types.includes("SPEECH_RECORDING"));
  });

  test("Should evaluate answers with 100% score and place student in Level B1 or A2", async () => {
    const perfectAnswers = {
      q1: "أ",
      q2: "ضمة (بُ)",
      q3: "قَلَم",
      q4: "Book",
      q5: "القراءةُ مفيدةٌ",
      q6: "إلى حديقةِ الحيوانِ",
      q7: "تم التسجيل الصوتي بنجاح",
    };

    const result = await placementService.evaluateAndPlace(studentId, perfectAnswers);
    assert.equal(result.scorePercentage, 100);
    assert.equal(result.recommendedLevelCode, "B1");
    assert.equal(result.correctAnswersCount, 7);
    assert.equal(result.xpAwarded, 50);
  });

  test("Should evaluate low score and recommend Level PRE_A1", async () => {
    const partialAnswers = {
      q1: "أ", // only 1 correct
      q2: "فتحة (بَ)",
      q3: "عَلَم",
      q4: "Pen",
      q5: "مفيدةٌ هي القراءةُ",
      q6: "إلى المدرسةِ",
      q7: "",
    };

    const result = await placementService.evaluateAndPlace("student-2", partialAnswers);
    assert.ok(result.scorePercentage <= 40);
    assert.equal(result.recommendedLevelCode, "PRE_A1");
  });
});
