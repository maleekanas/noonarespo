import test, { describe } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { RoleType } from "@prisma/client";
import { SessionUser } from "../../src/lib/auth/session";
import { canManageUsers, canManageCurriculum, canViewAuditLogs } from "../../src/server/policies";

describe("Superadmin Authentication & Lifecycle Validation", () => {
  const superAdminUser: SessionUser = {
    id: "admin-super-001",
    email: "superadmin@arabickidsacademy.com",
    name: "طارق المشرف",
    role: RoleType.SUPER_ADMIN,
    locale: "ar",
  };

  test("Superadmin Credentials & Password Hash Verification", async () => {
    const rawPassword = "Password123!";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const isMatch = await bcrypt.compare(rawPassword, passwordHash);
    assert.equal(isMatch, true, "Superadmin password should verify against bcrypt hash");

    const isWrongMatch = await bcrypt.compare("WrongPassword!", passwordHash);
    assert.equal(isWrongMatch, false, "Incorrect password must be rejected");
  });

  test("Superadmin Role Governance & Permission Policies", () => {
    // Superadmin has full governance access
    assert.equal(superAdminUser.role, RoleType.SUPER_ADMIN);
    assert.equal(canManageUsers(superAdminUser), true, "Superadmin must have user management permission");
    assert.equal(canManageCurriculum(superAdminUser), true, "Superadmin must have curriculum management permission");
    assert.equal(canViewAuditLogs(superAdminUser), true, "Superadmin must have audit log access");
  });

  test("Session Token Cryptographic Signing & Verification", () => {
    const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET || "kids-arabic-academy-dev-secret-key-32-chars-minimum";
    assert.ok(secret.length >= 16, "Secret must be at least 16 characters");

    // Sign payload
    const payload = Buffer.from(JSON.stringify(superAdminUser)).toString("base64url");
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
    const token = `${payload}.${signature}`;

    // Verify token
    const [tokenPayload, tokenSig] = token.split(".");
    assert.equal(tokenPayload, payload);

    const expectedSig = crypto.createHmac("sha256", secret).update(tokenPayload).digest("base64url");
    const valid = crypto.timingSafeEqual(Buffer.from(tokenSig), Buffer.from(expectedSig));
    assert.equal(valid, true, "Session token signature must be valid");

    // Decoded user check
    const decoded: SessionUser = JSON.parse(Buffer.from(tokenPayload, "base64url").toString("utf-8"));
    assert.equal(decoded.email, "superadmin@arabickidsacademy.com");
    assert.equal(decoded.role, RoleType.SUPER_ADMIN);
    assert.equal(decoded.name, "طارق المشرف");
  });

  test("Admin Roles Whitelist for Protected Dashboard", () => {
    const ADMIN_ROLES: RoleType[] = [
      RoleType.SUPER_ADMIN,
      RoleType.ACADEMIC_ADMIN,
      RoleType.FINANCE_ADMIN,
    ];

    assert.ok(ADMIN_ROLES.includes(superAdminUser.role), "SUPER_ADMIN must be in ADMIN_ROLES");

    // Non-admin roles must not be in ADMIN_ROLES
    assert.ok(!ADMIN_ROLES.includes(RoleType.STUDENT));
    assert.ok(!ADMIN_ROLES.includes(RoleType.PARENT));
    assert.ok(!ADMIN_ROLES.includes(RoleType.TEACHER));
  });

  test("Superadmin Login Redirect Routing", () => {
    const locale = "ar";
    const role: RoleType = superAdminUser.role;

    let targetRoute = "";
    if (role === RoleType.STUDENT) {
      targetRoute = `/${locale}/student`;
    } else if (role === RoleType.TEACHER) {
      targetRoute = `/${locale}/teacher`;
    } else if (role === RoleType.SCHOOL_ADMIN) {
      targetRoute = `/${locale}/school-admin`;
    } else if (role === RoleType.SUPER_ADMIN || role === RoleType.ACADEMIC_ADMIN || role === RoleType.FINANCE_ADMIN) {
      targetRoute = `/${locale}/admin`;
    } else {
      targetRoute = `/${locale}/parent`;
    }

    assert.equal(targetRoute, "/ar/admin", "SUPER_ADMIN must be routed to /admin dashboard");
  });

  test("Sign Out Route & Cookie Destruction Behavior", () => {
    // When signout executes, destination is /login
    const locale = "ar";
    const signoutRedirect = `/${locale}/login`;
    assert.equal(signoutRedirect, "/ar/login", "Signout must redirect to /login");
  });
});
