import { NextRequest, NextResponse } from "next/server";
import { dataExportService, type ExportCategory, type ExportFormat } from "@/server/services/DataExportService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "ALL").toUpperCase() as ExportCategory;
  const format = (searchParams.get("format") || "json").toLowerCase() as ExportFormat;

  try {
    const result = await dataExportService.exportData(category, format);

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
