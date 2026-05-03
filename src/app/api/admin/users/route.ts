import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateLoginCode } from "@/lib/utils";

async function checkAdmin() {
  const session = await getSession();
  if (!session.isAdmin) return false;
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { name, phoneOrTelegram } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });
    }

    const loginCode = generateLoginCode();
    const user = await prisma.user.create({
      data: { name, phoneOrTelegram: phoneOrTelegram || "", loginCode },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
