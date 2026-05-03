import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const category = await prisma.instructionCategory.findUnique({
    where: { id },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
  });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, slug, description, isActive, sortOrder } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (isActive !== undefined) data.isActive = isActive;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (slug !== undefined) {
    const slugClean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const existing = await prisma.instructionCategory.findFirst({
      where: { slug: slugClean, NOT: { id } },
    });
    if (existing) return NextResponse.json({ error: "Slug уже используется" }, { status: 400 });
    data.slug = slugClean;
  }

  const category = await prisma.instructionCategory.update({ where: { id }, data });
  return NextResponse.json({ category });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.instructionCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
