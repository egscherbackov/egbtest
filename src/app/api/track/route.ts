import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ ok: false });

  const { type, meta } = await req.json();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  await prisma.user.update({
    where: { id: session.userId },
    data: { lastSeenAt: new Date(), lastIp: ip, lastUserAgent: userAgent },
  });

  await prisma.userActivity.create({
    data: {
      userId: session.userId,
      type: type || "page_view",
      ip,
      userAgent,
      meta,
    },
  });

  return NextResponse.json({ ok: true });
}
