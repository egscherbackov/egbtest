import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateLoginCode } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invite = await prisma.inviteLink.findUnique({ where: { token } });
  if (!invite || !invite.isActive || invite.usedAt) {
    return NextResponse.json({ valid: false }, {
      status: 404,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  }
  return NextResponse.json({ valid: true }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const invite = await prisma.inviteLink.findUnique({ where: { token } });

  if (!invite || !invite.isActive || invite.usedAt) {
    return NextResponse.json(
      { error: "Ссылка недействительна или уже использована" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }

  const { name, phoneOrTelegram } = await req.json();
  if (!name || !phoneOrTelegram) {
    return NextResponse.json(
      { error: "Имя и контакт обязательны" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown";
  const now = new Date();
  const loginCode = generateLoginCode();

  let country: string | null = null;
  if (ip && ip !== "unknown" && ip !== "127.0.0.1" && !ip.startsWith("192.168.") && !ip.startsWith("10.") && !ip.startsWith("::")) {
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode`, { signal: AbortSignal.timeout(2000) });
      if (geo.ok) { const g = await geo.json(); if (g.country) country = `${g.countryCode} ${g.country}`; }
    } catch { /* ignore geo errors */ }
  }

  const user = await prisma.user.create({
    data: {
      name,
      phoneOrTelegram,
      loginCode,
      firstLoginAt: now,
      lastLoginAt: now,
      lastSeenAt: now,
      lastIp: ip,
      lastUserAgent: userAgent,
      ...(country && { country }),
    },
  });

  await prisma.inviteLink.update({
    where: { id: invite.id },
    data: { usedAt: now, usedByUserId: user.id, isActive: false },
  });

  await prisma.userActivity.create({
    data: { userId: user.id, type: "register_invite", ip, userAgent },
  });

  const session = await getSession();
  session.userId = user.id;
  session.userName = user.name;
  await session.save();

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, loginCode: user.loginCode } }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
