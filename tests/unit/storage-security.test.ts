import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { storageService } from "../../src/server/services/StorageService";

describe("Private Cloud Storage & Child Voice Security (COPPA / GDPR)", () => {
  const studentId = "student-1";
  const assignmentId = "hw-1";

  test("Signed Upload Ticket: Should generate pre-signed upload URL with 15-minute expiration", async () => {
    const ticket = await storageService.createStudentAudioUploadTicket({
      studentId,
      assignmentId,
      fileExtension: "mp3",
    });

    assert.ok(ticket.uploadUrl);
    assert.ok(ticket.uploadUrl.includes("X-Amz-Signature="));
    assert.ok(ticket.uploadUrl.includes("X-Amz-Expires=900"));
    assert.equal(ticket.expiresInSeconds, 900); // 15 minutes
    assert.ok(ticket.objectKey.startsWith(`submissions/${studentId}/${assignmentId}`));
    assert.ok(ticket.objectKey.endsWith(".mp3"));
  });

  test("Signed Playback URL: Should generate time-limited download URL with expiration timestamp", async () => {
    const objectKey = `submissions/${studentId}/${assignmentId}-test.mp3`;
    const playback = await storageService.getSecurePlaybackUrl(objectKey, 900);

    assert.ok(playback.downloadUrl);
    assert.ok(playback.downloadUrl.includes("token="));
    assert.ok(playback.downloadUrl.includes("expires="));
    assert.equal(playback.objectKey, objectKey);
    assert.ok(playback.expiresAt.getTime() > Date.now());
  });

  test("Storage Status: Should report secure private configuration and child privacy policy", () => {
    const status = storageService.getStorageStatus();
    assert.ok(status.providerName.includes("S3"));
    assert.ok(status.securityPolicy.includes("15-Minute TTL"));
  });
});
