import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateLoginCode } from "@/lib/utils";

async function checkAdmin() {
  const session = await getSession();
  return session.isAdmin === true;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
      inviteUsed: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { name, phoneOrTelegram, isActive, regenerateCode } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (phoneOrTelegram !== undefined) updateData.phoneOrTelegram = phoneOrTelegram;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (regenerateCode) updateData.loginCode = generateLoginCode();

  const user = await prisma.user.update({ where: { id }, data: updateData });
  return NextResponse.json({ user });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
