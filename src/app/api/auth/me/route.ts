import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (session.userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isActive: true, name: true },
    });
    if (!dbUser || !dbUser.isActive) {
      session.userId = undefined;
      session.userName = undefined;
      await session.save();
      return NextResponse.json({ user: null, banned: true });
    }
    return NextResponse.json({
      user: { id: session.userId, name: session.userName },
      isAdmin: session.isAdmin || false,
    });
  }
  if (session.isAdmin) {
    return NextResponse.json({ isAdmin: true, adminUsername: session.adminUsername });
  }
  return NextResponse.json({ user: null });
}
