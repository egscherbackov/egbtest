import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.shortLink.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[shortlinks DELETE]", err);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}
