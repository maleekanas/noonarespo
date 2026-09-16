import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { meetingManager } from "../../src/lib/integrations/meetings/MeetingManager";

describe("Video Meeting Adapters & Classroom Integration", () => {
  const testParams = {
    sessionId: "sess-test-1",
    classGroupName: "فصل القراءة والطلاقة (A1)",
    teacherName: "الأستاذ أحمد المنصوري",
    startTimeUtc: new Date(),
    durationMinutes: 45,
  };

  test("Zoom Adapter: Should generate structured student join and teacher host URLs", async () => {
    const session = await meetingManager.createSession("ZOOM", testParams);
    assert.equal(session.provider, "ZOOM");
    assert.ok(session.joinUrlStudent.includes("zoom"));
    assert.ok(session.hostUrlTeacher.includes("zoom"));
    assert.equal(session.topic, testParams.classGroupName);
    assert.ok(session.notes);
  });

  test("Microsoft Teams Adapter: Should generate Teams thread ID and meeting link", async () => {
    const session = await meetingManager.createSession("TEAMS", testParams);
    assert.equal(session.provider, "TEAMS");
    assert.ok(session.joinUrlStudent.includes("teams"));
    assert.ok(session.hostUrlTeacher.includes("teams"));
    assert.equal(session.topic, testParams.classGroupName);
  });

  test("Google Meet Adapter: Should generate Google Meet space codes and links", async () => {
    const session = await meetingManager.createSession("MEET", testParams);
    assert.equal(session.provider, "MEET");
    assert.ok(session.joinUrlStudent.includes("meet"));
    assert.ok(session.hostUrlTeacher.includes("meet"));
    assert.equal(session.topic, testParams.classGroupName);
  });

  test("Webex Adapter: Should generate Webex meeting links", async () => {
    const session = await meetingManager.createSession("WEBEX", testParams);
    assert.equal(session.provider, "WEBEX");
    assert.ok(session.joinUrlStudent.includes("webex"));
    assert.ok(session.hostUrlTeacher.includes("webex"));
    assert.equal(session.topic, testParams.classGroupName);
  });

  test("Meeting Manager: Should return configuration diagnostic status for all 4 platforms", () => {
    const statuses = meetingManager.getPlatformStatuses();
    assert.equal(statuses.length, 4);
    const platforms = statuses.map((s) => s.platform);
    assert.ok(platforms.includes("ZOOM"));
    assert.ok(platforms.includes("TEAMS"));
    assert.ok(platforms.includes("MEET"));
    assert.ok(platforms.includes("WEBEX"));
  });

  test("Meeting Manager: createBestAvailableSession falls back to an honest sandbox session when nothing is configured", async () => {
    const session = await meetingManager.createBestAvailableSession(testParams);
    assert.equal(session.isMock, true);
    assert.equal(session.topic, testParams.classGroupName);
  });
});
