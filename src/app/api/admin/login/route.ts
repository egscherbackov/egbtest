import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверные данные" }, { status: 401 });
    }

    const session = await getSession();
    session.isAdmin = true;
    session.adminUsername = admin.username;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
