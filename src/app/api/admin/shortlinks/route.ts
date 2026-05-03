import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const RESERVED = new Set([
  "login", "instructions", "invite", "adminpanel",
  "maintenance", "api", "not-found", "_next", "favicon.ico",
]);

function genCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const links = await prisma.shortLink.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ links });
  } catch (err) {
    console.error("[shortlinks GET]", err);
    return NextResponse.json({ error: "Внутренняя ошибка" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUrl, customCode } = await req.json();

    if (!targetUrl || !/^https?:\/\/.+/.test(targetUrl.trim())) {
      return NextResponse.json({ error: "Укажите корректный URL (начиная с http:// или https://)" }, { status: 400 });
    }

    let shortCode = (customCode ?? "").trim().toLowerCase();

    if (shortCode) {
      if (RESERVED.has(shortCode)) {
        return NextResponse.json({ error: "Этот код зарезервирован системой" }, { status: 400 });
      }
      if (!/^[a-z0-9_-]{2,30}$/.test(shortCode)) {
        return NextResponse.json({ error: "Код: только a-z, 0-9, дефис, подчёркивание (2–30 символов)" }, { status: 400 });
      }
      const exists = await prisma.shortLink.findUnique({ where: { shortCode } });
      if (exists) return NextResponse.json({ error: "Такой код уже занят" }, { status: 400 });
    } else {
      let attempts = 0;
      do {
        shortCode = genCode();
        attempts++;
      } while (await prisma.shortLink.findUnique({ where: { shortCode } }) && attempts < 10);
    }

    const link = await prisma.shortLink.create({
      data: { shortCode, targetUrl: targetUrl.trim() },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (err) {
    console.error("[shortlinks POST]", err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
