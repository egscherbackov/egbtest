import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.instructionCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { steps: true } } },
  });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, description } = body;

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Название и slug обязательны" }, { status: 400 });
  }

  const slugClean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const existing = await prisma.instructionCategory.findUnique({ where: { slug: slugClean } });
  if (existing) {
    return NextResponse.json({ error: "Slug уже используется" }, { status: 400 });
  }

  const maxOrder = await prisma.instructionCategory.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  const category = await prisma.instructionCategory.create({
    data: { title: title.trim(), slug: slugClean, description: description?.trim() || null, sortOrder },
  });
  return NextResponse.json({ category }, { status: 201 });
}
