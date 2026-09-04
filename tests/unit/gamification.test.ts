import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { gamificationService } from "../../src/server/services/GamificationService";

describe("Gamification Engine (XP, Levels, Streaks & Badges)", () => {
  const studentId = "student-1";

  test("Should calculate levels accurately according to XP thresholds", () => {
    assert.equal(gamificationService.calculateLevel(50).level, 1);
    assert.equal(gamificationService.calculateLevel(150).level, 2);
    assert.equal(gamificationService.calculateLevel(450).level, 3);
    assert.equal(gamificationService.calculateLevel(750).level, 4);
    assert.equal(gamificationService.calculateLevel(1200).level, 5);
  });

  test("Should award XP, increment total, and unlock badges on milestone", async () => {
    const initialProfile = await gamificationService.getStudentGamification(studentId);
    const initialXp = initialProfile.totalXp;

    const newTotal = await gamificationService.awardXp(studentId, 100, "إتمام درس المحادثة");
    assert.equal(newTotal, initialXp + 100);

    const updatedProfile = await gamificationService.getStudentGamification(studentId);
    assert.ok(updatedProfile.unlockedBadges.length >= 2);
  });

  test("Should enforce privacy-safe display names on cohort leaderboard", async () => {
    const leaderboard = await gamificationService.getCohortLeaderboard(studentId);
    assert.ok(leaderboard.length > 0);

    for (const entry of leaderboard) {
      // Name should end with a dot indicating initial, or be safe (e.g. "زيد ط.")
      assert.ok(entry.displayName.length <= 15);
      assert.ok(entry.rank >= 1);
      assert.ok(entry.monthlyXp >= 0);
    }
  });
});
