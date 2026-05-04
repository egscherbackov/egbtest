import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const { loginCode } = await req.json();
    if (!loginCode || typeof loginCode !== "string") {
      return NextResponse.json({ error: "Код входа обязателен" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { loginCode: loginCode.trim().toUpperCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "Неверный код входа" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Аккаунт отключён" }, { status: 403 });
    }

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";
    const now = new Date();

    let country: string | null = null;
    if (ip && ip !== "unknown" && ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode`, { signal: AbortSignal.timeout(2000) });
        if (geo.ok) { const g = await geo.json(); if (g.country) country = `${g.countryCode} ${g.country}`; }
      } catch { /* ignore geo errors */ }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: now,
        lastSeenAt: now,
        lastIp: ip,
        lastUserAgent: userAgent,
        ...(country && { country }),
        ...(!user.firstLoginAt && { firstLoginAt: now }),
      },
    });

    await prisma.userActivity.create({
      data: { userId: user.id, type: "login", ip, userAgent },
    });

    const session = await getSession();
    session.userId = user.id;
    session.userName = user.name;
    await session.save();

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name } }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка сервера" }, {
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }
}
