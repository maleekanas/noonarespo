import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";
// Without this, Next.js tries to statically pre-render this GET route at
// build time by actually executing it — with no real request and no
// database connection available yet — which is what caused the build to
// fail. Forcing dynamic makes it run only when someone actually visits it.
export const dynamic = "force-dynamic";

// TEMPORARY, SECRET-PROTECTED, ONE-TIME UTILITY.
//
// This route creates a parent account for testing the organization
// multi-account features.

export async function GET(request: Request) {
  const secretKey = process.env.ADMIN_SECRET_KEY;
  const authHeader = request.headers.get("authorization");

  if (!secretKey || !authHeader || authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const testParent = await prisma.account.create({
      data: {
        email: "test-parent@example.com",
        name: "Test Parent Account",
        role: RoleType.PARENT,
      },
    });

    return NextResponse.json(
      {
        message: "Test parent account created successfully",
        account: testParent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test parent:", error);
    return NextResponse.json(
      { error: "Failed to create test parent account" },
      { status: 500 }
    );
  }
}
