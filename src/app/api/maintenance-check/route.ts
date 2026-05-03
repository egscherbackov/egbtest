import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "1" } });
    return NextResponse.json(
      {
        maintenance: settings?.maintenanceMode ?? false,
        accessMode: settings?.maintenanceAccessMode ?? "global",
        text: settings?.maintenanceText ?? "",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ maintenance: false, accessMode: "global", text: "" });
  }
}
