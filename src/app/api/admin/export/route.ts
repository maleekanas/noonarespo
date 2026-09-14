import { NextRequest, NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { dataExportService, type ExportCategory, type ExportFormat } from "@/server/services/DataExportService";

const categories = new Set(["ALL", "STUDENTS", "CLASSES", "FINANCIAL", "AUDIT_LOGS"]);
const formats = new Set(["json", "csv"]);

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== RoleType.SUPER_ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const categoryValue = (searchParams.get("category") || "ALL").toUpperCase();
  const formatValue = (searchParams.get("format") || "json").toLowerCase();
  if (!categories.has(categoryValue) || !formats.has(formatValue)) {
    return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
  }

  try {
    const result = await dataExportService.exportData(
      categoryValue as ExportCategory,
      formatValue as ExportFormat
    );
    return new NextResponse(result.data, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
