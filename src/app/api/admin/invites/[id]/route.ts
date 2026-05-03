import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function checkAdmin() {
  const session = await getSession();
  return session.isAdmin === true;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { isActive } = await req.json();
  const invite = await prisma.inviteLink.update({
    where: { id },
    data: { isActive },
  });
  return NextResponse.json({ invite });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.inviteLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
