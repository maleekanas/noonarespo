import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { communicationService } from "../../src/server/services/CommunicationService";

describe("Parent-Teacher Communication & Meeting Scheduler", () => {
  const parentId = "parent-1";
  const teacherId = "teacher-1"; // Assigned to Zayd's class in seed
  const studentId = "student-1";

  test("Should allow messaging between verified parent and enrolled child's teacher", async () => {
    const msg = await communicationService.sendMessage({
      parentId,
      teacherId,
      studentId,
      senderId: parentId,
      senderRole: "PARENT",
      content: "مرحبا يا أستاذ، شكراً على المتابعة الدائمة.",
    });

    assert.equal(msg.content, "مرحبا يا أستاذ، شكراً على المتابعة الدائمة.");
    assert.equal(msg.senderRole, "PARENT");
  });

  test("Should block messaging if teacher does not teach parent's child", async () => {
    await assert.rejects(
      async () => {
        await communicationService.sendMessage({
          parentId: "parent-stranger",
          teacherId: "teacher-1",
          studentId: "student-stranger",
          senderId: "parent-stranger",
          senderRole: "PARENT",
          content: "رسالة غير مصرح بها",
        });
      },
      {
        message: /COMMUNICATION_UNAUTHORIZED/,
      }
    );
  });

  test("Should create and confirm a 15-minute conference request", async () => {
    const requestedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const meeting = await communicationService.requestMeeting({
      parentId,
      teacherId,
      studentId,
      requestedTimeUtc: requestedDate,
      notes: "استشارة بخصوص حفظ جزء عم",
    });

    assert.equal(meeting.status, "PENDING");
    assert.equal(meeting.notes, "استشارة بخصوص حفظ جزء عم");

    // Teacher confirms
    const confirmed = await communicationService.confirmMeeting(meeting.id);
    assert.equal(confirmed.status, "CONFIRMED");
    assert.ok(confirmed.meetingUrl?.includes("https://"));
  });
});
