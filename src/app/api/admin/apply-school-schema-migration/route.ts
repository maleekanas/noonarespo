import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export const runtime = "nodejs";
// Same reasoning as the other apply-*-schema-migration routes: force this to
// run only when actually requested, not during the Vercel build's
// static-render pass.
export const dynamic = "force-dynamic";

// TEMPORARY, SECRET-PROTECTED, ONE-TIME UTILITY.
//
// This project uses `prisma db push` (no migrations folder) and nothing in
// package.json/Vercel build settings runs it automatically on deploy. Adding
// the new PartnerSchool model to prisma/schema.prisma therefore does NOT, by
// itself, create the table on the live Neon database. This route applies
// exactly that schema change with raw SQL, so the site owner can trigger it
// from a browser without shell/DB access.
//
// Unlike the other apply-*-schema-migration routes, this one also seeds the
// 4 partner schools that previously only existed as in-memory demo data --
// otherwise the B2B license seat/enrollment counters (previously reset to
// these same starting values on every cold start) would start completely
// empty instead. The INSERT uses ON CONFLICT DO NOTHING so it never
// overwrites real data from a later re-run.
//
// It is idempotent and gated by the same SEED_ADMIN_SECRET already used by
// the other one-time admin routes. Delete this file (or unset the env var)
// once you've visited it once successfully.

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

  const statements = [
    `CREATE TABLE IF NOT EXISTS "partner_schools" (
      "id" TEXT NOT NULL,
      "nameAr" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "country" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "licenseSeatsTotal" INTEGER NOT NULL,
      "licenseSeatsUsed" INTEGER NOT NULL,
      "classesCount" INTEGER NOT NULL,
      "studentsCount" INTEGER NOT NULL,
      "contactPerson" TEXT NOT NULL,
      "contactEmail" TEXT NOT NULL,
      "contractStatus" TEXT NOT NULL,
      "curriculumTrackAr" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "partner_schools_pkey" PRIMARY KEY ("id")
    );`,
    `INSERT INTO "partner_schools"
      ("id", "nameAr", "nameEn", "type", "country", "city", "licenseSeatsTotal", "licenseSeatsUsed", "classesCount", "studentsCount", "contactPerson", "contactEmail", "contractStatus", "curriculumTrackAr", "createdAt")
    VALUES
      ('school-al-noor', 'أكاديمية النور الإسلامية الدولية', 'Al-Noor International Islamic Academy', 'ISLAMIC_SCHOOL', 'المملكة المتحدة (UK)', 'لندن', 150, 138, 8, 138, 'د. طارق السعدي', 'admin@alnoor-london.edu', 'ACTIVE', 'منهاج براعم المتكامل (اللغة والقرآن)', '2026-01-15'),
      ('school-al-fath', 'مدرسة الفتح للغات والقرآن', 'Al-Fath Arabic & Quran School', 'ISLAMIC_SCHOOL', 'هولندا (NL)', 'روتردام', 80, 74, 5, 74, 'أ. فاطمة الزهراء فان دن بيرغ', 'contact@alfath-rotterdam.nl', 'ACTIVE', 'المسار الأوروبي لغير الناطقين بالعربية', '2026-02-10'),
      ('school-dar-al-hijra', 'مجمع دار الهجرة التعليمي المجتمعي', 'Dar Al-Hijra Community Learning Center', 'COMMUNITY_CENTER', 'الولايات المتحدة (USA)', 'دالاس، تكساس', 120, 105, 7, 105, 'المهندس عمر خليل', 'academy@daralhijra-dallas.org', 'ACTIVE', 'منهاج نهاية الأسبوع المكثف', '2026-03-01'),
      ('school-riyadh-coop', 'تعاونية التعليم المنزلي الميسر', 'Homeschooling Arabic Cooperative', 'HOMESCHOOL_COOP', 'المملكة العربية السعودية (KSA)', 'الرياض', 40, 38, 3, 38, 'أ. سارة المنصور', 'homeschool@riyadh-coop.sa', 'ACTIVE', 'مسار الطلاقة المتقدمة والخط العربي', '2026-04-05')
    ON CONFLICT ("id") DO NOTHING;`,
  ];

  const applied: string[] = [];
  try {
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
      applied.push(statement);
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: "Migration failed partway through.",
        detail: err instanceof Error ? err.message : String(err),
        appliedBeforeFailure: applied,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "School schema migration applied successfully (safe to re-run).",
    appliedStatements: applied,
    reminder:
      "Delete this route (src/app/api/admin/apply-school-schema-migration) or remove SEED_ADMIN_SECRET from Vercel once you're done.",
  });
}
