import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import BanGuard from "@/components/BanGuard";

export default async function InstructionsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { isActive: true },
  });

  if (!dbUser || !dbUser.isActive) {
    redirect("/login?banned=1");
  }

  return (
    <>
      <BanGuard />
      {children}
    </>
  );
}
