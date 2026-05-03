import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalUsers, activeUsers, totalInvites, activeInvites, recentActivity] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.inviteLink.count(),
      prisma.inviteLink.count({ where: { isActive: true } }),
      prisma.userActivity.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    activeUsers,
    totalInvites,
    activeInvites,
    recentActivity,
  });
}
