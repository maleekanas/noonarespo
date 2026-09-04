import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/localization";
import { systemHealthService } from "@/server/services/SystemHealthService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isFullCheck = searchParams.get("full") === "true";

  if (isFullCheck) {
    const report = await systemHealthService.getComprehensiveHealthReport();
    return NextResponse.json(report, {
      status: report.status === "DOWN" ? 503 : 200,
    });
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    platform: "Kids Arabic Academy",
    supportedLocales: locales,
    defaultLocale: defaultLocale,
  });
}
