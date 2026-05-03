import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateInviteToken } from "@/lib/utils";

async function checkAdmin() {
  const session = await getSession();
  return session.isAdmin === true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const invites = await prisma.inviteLink.findMany({
    orderBy: { createdAt: "desc" },
    include: { usedBy: { select: { name: true, phoneOrTelegram: true } } },
  });
  return NextResponse.json({ invites });
}

export async function POST(_req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = generateInviteToken();
  const invite = await prisma.inviteLink.create({ data: { token } });
  return NextResponse.json({ invite }, { status: 201 });
}
