import test from "node:test";
import assert from "node:assert/strict";
import { generateTotp, verifyTotp, generateTotpSecret, encryptMfaSecret, decryptMfaSecret, generateRecoveryCodes, hashRecoveryCode } from "../../src/lib/auth/mfa";

process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-only-session-secret-that-is-longer-than-32-characters";

test("TOTP accepts current code and rejects malformed code", () => {
  const secret = generateTotpSecret();
  const now = 1_700_000_000_000;
  const code = generateTotp(secret, now);
  assert.equal(code.length, 6);
  assert.equal(verifyTotp(secret, code, now), true);
  assert.equal(verifyTotp(secret, "12345", now), false);
});

test("TOTP accepts one 30-second drift window", () => {
  const secret = generateTotpSecret();
  const now = 1_700_000_000_000;
  const previous = generateTotp(secret, now - 30_000);
  assert.equal(verifyTotp(secret, previous, now), true);
});

test("MFA secret encryption round trips without storing plaintext", () => {
  const secret = generateTotpSecret();
  const encrypted = encryptMfaSecret(secret);
  assert.notEqual(encrypted, secret);
  assert.equal(decryptMfaSecret(encrypted), secret);
});

test("recovery codes are stored only as hashes", () => {
  const { plain, hashes } = generateRecoveryCodes(8);
  assert.equal(plain.length, 8);
  assert.equal(hashes.length, 8);
  assert.equal(hashes[0], hashRecoveryCode(plain[0]));
  assert.notEqual(hashes[0], plain[0]);
});
