import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { RoleType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";

// TEMPORARY, SECRET-PROTECTED, ONE-TIME UTILITY.
//
// There is currently no signup/registration page anywhere in the app, and
// the Prisma-backed seed script only creates a superadmin + one teacher —
// no parent account exists in the real (Stripe-connected) database. This
// route exists only so the site owner can create ONE real test parent
// account to walk through the Stripe checkout flow, without needing shell
// or database access.
//
// It is gated by SEED_ADMIN_SECRET (set in Vercel env vars) and is safe to
// call more than once: it upserts, it never resets an existing password,
// and it only ever touches the single fixed test account below — it can't
// be used to create arbitrary accounts. Delete this file (or unset the env
// var) once you no longer need it.

const TEST_PARENT_EMAIL = "test.parent@arabickidsacademy.com";
const TEST_PARENT_PASSWORD = "TestParent2026!";

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.SEED_ADMIN_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "SEED_ADMIN_SECRET is not configured on the server." },
      { status: 500 }
    );
  }

  const providedSecret = request.nextUrl.searchParams.get("secret");
  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const parentRole = await prisma.role.findUnique({
    where: { name: RoleType.PARENT },
  });

  if (!parentRole) {
    return NextResponse.json(
      {
        error:
          "The PARENT role does not exist in the database yet. Run the normal seed script (npm run db:seed) at least once first.",
      },
      { status: 500 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: TEST_PARENT_EMAIL },
  });

  let userId: string;

  if (existingUser) {
    // Already created on a previous visit — don't touch the password again.
    userId = existingUser.id;
  } else {
    const passwordHash = await bcrypt.hash(TEST_PARENT_PASSWORD, 10);
    const createdUser = await prisma.user.create({
      data: {
        email: TEST_PARENT_EMAIL,
        passwordHash,
        localePreference: "ar",
        parentProfile: {
          create: {
            firstName: "والد",
            lastName: "تجريبي",
            phoneNumber: "+10000000000",
          },
        },
      },
    });
    userId = createdUser.id;
  }

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: parentRole.id } },
    update: {},
    create: { userId, roleId: parentRole.id },
  });

  return NextResponse.json({
    message: existingUser
      ? "Test parent account already existed — here are its login details again."
      : "Test parent account created.",
    email: TEST_PARENT_EMAIL,
    password: TEST_PARENT_PASSWORD,
    loginUrl: "/ar/login",
    reminder:
      "Delete this route (src/app/api/admin/seed-test-parent) or remove SEED_ADMIN_SECRET from Vercel once you're done testing.",
  });
}
