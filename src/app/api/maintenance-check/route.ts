import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "1" },
    });

    const maintenance = settings?.maintenanceMode ?? false;
    const accessMode = settings?.maintenanceAccessMode ?? "global";

    return NextResponse.json({
      maintenance,
      accessMode,
      text: settings?.maintenanceText ?? "Совсем скоро",
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ maintenance: false, accessMode: "global", text: "" }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }
}
