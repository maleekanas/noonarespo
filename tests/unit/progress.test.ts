import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { progressService } from "../../src/server/services/ProgressService";

describe("Progress Service & Competency Analytics", () => {
  const studentId = "student-1"; // Zayd

  test("Should calculate 5 core Arabic competencies for a student", async () => {
    const competencies = await progressService.getStudentCompetencies(studentId);

    assert.equal(competencies.length, 5);
    const keys = competencies.map((c) => c.skillKey);
    assert.deepEqual(keys, ["listening", "speaking", "reading", "writing", "tajweed"]);

    for (const comp of competencies) {
      assert.ok(comp.scorePercentage >= 0 && comp.scorePercentage <= 100);
      assert.ok(comp.nameAr.length > 0);
    }
  });

  test("Should generate a comprehensive weekly educational summary report card", async () => {
    const summary = await progressService.generateWeeklySummary(studentId);

    assert.equal(summary.studentId, studentId);
    assert.ok(summary.studentName.includes("زيد"));
    assert.ok(summary.attendanceRatePercentage > 0);
    assert.ok(summary.competencies.length === 5);
    assert.ok(summary.nextWeekFocusAreas.length > 0);
    assert.ok(summary.teacherSummaryComment.length > 0);
  });
});
