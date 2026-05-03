import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";
import Footer from "@/components/Footer";

export default async function HomePage() {
  const session = await getSession();
  const user = session.userId
    ? { id: session.userId, name: session.userName || "" }
    : null;
  const isAdmin = session.isAdmin === true;

  const settings = await prisma.siteSettings.findUnique({ where: { id: "1" } });
  const totalOrders = settings?.totalOrders ?? 1394;

  return (
    <>
      <Header user={user} isAdmin={isAdmin} />

      <main style={{ background: "#000000" }}>
        {/* Hero with Prism WebGL */}
        <HomeHero user={user} totalOrders={totalOrders} />

        <Footer />
      </main>
    </>
  );
}

