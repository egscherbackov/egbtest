import { prisma } from "@/lib/db";
import MaintenanceView from "./MaintenanceView";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "1" } });
  const text = settings?.maintenanceText || "Сайт временно недоступен. Мы скоро вернёмся.";
  return <MaintenanceView text={text} />;
}
