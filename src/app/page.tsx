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
              className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-action-azure)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 9.09 13.87 11.57 13.87 11.57C13.54 12.29 13.23 12.97 12.9 13.63C12.23 14.96 11.57 16.28 10.91 17.6C10.86 17.7 10.79 17.76 10.7 17.76C10.61 17.76 10.53 17.71 10.48 17.63C10.43 17.55 10.42 17.45 10.45 17.36C10.52 17.15 10.6 16.94 10.68 16.73C10.76 16.52 10.85 16.31 10.93 16.1C10.97 16 11.05 15.94 11.14 15.94C11.23 15.94 11.31 15.99 11.36 16.07C11.41 16.15 11.42 16.25 11.39 16.34C11.32 16.55 11.24 16.76 11.16 16.97C11.08 17.18 11 17.39 10.91 17.6C10.86 17.7 10.79 17.76 10.7 17.76C10.61 17.76 10.53 17.71 10.48 17.63C10.43 17.55 10.42 17.45 10.45 17.36C10.52 17.15 10.6 16.94 10.68 16.73C10.76 16.52 10.85 16.31 10.93 16.1C10.97 16 11.05 15.94 11.14 15.94C11.23 15.94 11.31 15.99 11.36 16.07C11.41 16.15 11.42 16.25 11.39 16.34C11.32 16.55 11.24 16.76 11.16 16.97C11.08 17.18 11 17.39 10.91 17.6C10.86 17.7 10.79 17.76 10.7 17.76C10.61 17.76 10.53 17.71 10.48 17.63C10.43 17.55 10.42 17.45 10.45 17.36C10.52 17.15 10.6 16.94 10.68 16.73C10.76 16.52 10.85 16.31 10.93 16.1C10.97 16 11.05 15.94 11.14 15.94C11.23 15.94 11.31 15.99 11.36 16.07C11.41 16.15 11.42 16.25 11.39 16.34C11.32 16.55 11.24 16.76 11.16 16.97C11.08 17.18 11 17.39 10.91 17.6" fill="currentColor"/>
                <path d="M17.07 8.17C16.89 8.17 16.71 8.22 16.56 8.32C16.41 8.42 16.29 8.56 16.22 8.72C16.15 8.88 16.13 9.06 16.17 9.23C16.21 9.4 16.3 9.56 16.43 9.68C16.56 9.8 16.72 9.88 16.89 9.91C17.06 9.94 17.24 9.92 17.4 9.85C17.56 9.78 17.7 9.66 17.8 9.51C17.9 9.36 17.95 9.18 17.95 9C17.95 8.82 17.9 8.64 17.8 8.49C17.7 8.34 17.56 8.22 17.4 8.15C17.24 8.08 17.06 8.06 16.89 8.09C16.89 8.09 16.89 8.09 16.89 8.09L17.07 8.17ZM7.31 10.59C7.31 10.59 7.31 10.59 7.31 10.59C7.31 10.59 7.31 10.59 7.31 10.59L7.31 10.59ZM8.12 10.25C8.12 10.25 8.12 10.25 8.12 10.25C8.12 10.25 8.12 10.25 8.12 10.25L8.12 10.25ZM16.95 8.14C16.95 8.14 16.95 8.14 16.95 8.14C16.95 8.14 16.95 8.14 16.95 8.14L16.95 8.14Z" fill="currentColor"/>
                <path d="M8.5 15.5L9.5 13.5L16 9L9.5 12.5L8.5 15.5Z" fill="currentColor"/>
              </svg>
              @egorbuyercom
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}

