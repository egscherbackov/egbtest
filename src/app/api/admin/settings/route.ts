import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function checkAdmin() {
  const session = await getSession();
  console.log("[settings] session.isAdmin=", session.isAdmin, "userId=", session.userId);
  return session.isAdmin === true;
}

async function getOrCreate() {
  return prisma.siteSettings.upsert({
    where: { id: "1" },
    create: { id: "1" },
    update: {},
  });
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getOrCreate();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data: {
      maintenanceMode?: boolean;
      maintenanceText?: string;
      totalOrders?: number;
    } = {};
    if (body.maintenanceMode !== undefined) data.maintenanceMode = Boolean(body.maintenanceMode);
    if (body.maintenanceText !== undefined) data.maintenanceText = String(body.maintenanceText);
    if (body.totalOrders !== undefined) {
      const n = Number(body.totalOrders);
      data.totalOrders = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "1" },
      create: { id: "1", ...data },
      update: data,
    });
    return NextResponse.json({ settings });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[settings PATCH]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
