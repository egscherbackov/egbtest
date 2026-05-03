import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stepId } = await params;
  const body = await req.json();
  const { title, description, imageUrl, imageAlt, stepOrder } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description.trim();
  if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
  if (imageAlt !== undefined) data.imageAlt = imageAlt?.trim() || null;
  if (stepOrder !== undefined) data.stepOrder = stepOrder;

  const step = await prisma.instructionStep.update({ where: { id: stepId }, data });
  return NextResponse.json({ step });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stepId, id: categoryId } = await params;
  await prisma.instructionStep.delete({ where: { id: stepId } });

  const remaining = await prisma.instructionStep.findMany({
    where: { categoryId },
    orderBy: { stepOrder: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    await prisma.instructionStep.update({
      where: { id: remaining[i].id },
      data: { stepOrder: i + 1 },
    });
  }

  return NextResponse.json({ ok: true });
}
