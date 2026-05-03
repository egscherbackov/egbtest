import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import HomeHero from "@/components/HomeHero";
import Logo from "@/components/Logo";

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

        {/* Footer */}
        <footer
          className="py-8 px-4 sm:px-6"
          style={{
            background: "#000000",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" inverted />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
              © 2026 EGORBUYER.COM. Все права защищены.
            </p>
            <a
              href="https://t.me/egorbuyercom"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-action-azure)" }}
            >
              @egorbuyercom
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}

