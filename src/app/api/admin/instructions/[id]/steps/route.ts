import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: categoryId } = await params;
  const body = await req.json();
  const { title, description, imageUrl, imageAlt } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Заголовок шага обязателен" }, { status: 400 });
  }

  const maxOrder = await prisma.instructionStep.aggregate({
    where: { categoryId },
    _max: { stepOrder: true },
  });
  const stepOrder = (maxOrder._max.stepOrder ?? 0) + 1;

  const step = await prisma.instructionStep.create({
    data: {
      categoryId,
      title: title.trim(),
      description: description?.trim() || "",
      imageUrl: imageUrl || null,
      imageAlt: imageAlt?.trim() || null,
      stepOrder,
    },
  });
  return NextResponse.json({ step }, { status: 201 });
}
