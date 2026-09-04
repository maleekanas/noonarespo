import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { schedulingService } from "../../src/server/services/SchedulingService";

describe("Scheduling Engine & Conflict Detection", () => {
  const teacherId = "teacher-1";
  const classGroupId = "class-reading-a1-cohort1";

  test("Should detect teacher overlap when a new session conflicts with existing session", async () => {
    // In our seed, session-today-1 runs from 16:00 to 16:45 on today's date
    const today = new Date();
    const overlapStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 15, 0); // overlaps
    const overlapEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0, 0);

    const report = await schedulingService.checkTeacherConflict(teacherId, overlapStart, overlapEnd);
    assert.equal(report.hasConflict, true);
    assert.equal(report.conflictType, "TEACHER_OVERLAP");
  });

  test("Should allow scheduling when time slots do not overlap", async () => {
    const today = new Date();
    // Non-overlapping time slot (e.g. 18:00 to 18:45)
    const slotStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0);
    const slotEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 45, 0);

    const report = await schedulingService.checkTeacherConflict(teacherId, slotStart, slotEnd);
    assert.equal(report.hasConflict, false);
    assert.equal(report.conflictType, "NONE");
  });

  test("Should prevent scheduleSession when conflict exists and throw error", async () => {
    const today = new Date();
    const conflictingStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 10, 0);

    await assert.rejects(
      async () => {
        await schedulingService.scheduleSession({
          classGroupId,
          teacherId,
          startTimeUtc: conflictingStart,
          durationMinutes: 45,
        });
      },
      {
        message: /SCHEDULE_CONFLICT/,
      }
    );
  });
});
