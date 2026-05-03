import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  const link = await prisma.shortLink.findUnique({ where: { shortCode } });

  if (!link) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  // Increment click counter (fire-and-forget)
  prisma.shortLink.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.redirect(link.targetUrl, { status: 302 });
}
