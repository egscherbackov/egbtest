import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const [fullUser, categories] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.instructionCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { steps: true } } },
    }),
  ]);

  if (!fullUser) redirect("/login");

  const user = { id: fullUser.id, name: fullUser.name };

  const initials = fullUser.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/track`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view_instructions" }),
      cache: "no-store",
    }
  ).catch(() => {});

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
  };

  return (
    <>
      <Header user={user} />
      <main className="min-h-screen pt-14" style={{ background: "#000000" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

          {/* ── Profile card ── */}
          <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-5" style={cardStyle}>
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 font-display font-semibold text-xl select-none"
              style={{ background: "rgba(255,255,255,0.1)", color: "white", letterSpacing: "-0.5px" }}
            >
              {initials || "?"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1
                className="font-display mb-0.5"
                style={{ fontSize: "22px", fontWeight: 600, color: "white", letterSpacing: "-0.3px" }}
              >
                {fullUser.name}
              </h1>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={fullUser.phoneOrTelegram.startsWith("@")
                        ? "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z"
                        : "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      }
                    />
                  </svg>
                  {fullUser.phoneOrTelegram}
                </span>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  С нами с {formatDate(fullUser.createdAt.toISOString())}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span
              className="shrink-0 self-start sm:self-center text-xs font-semibold px-3 py-1.5 rounded-full"
              style={fullUser.isActive
                ? { background: "rgba(65,161,207,0.1)", color: "var(--color-cofounder-blue)" }
                : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
            >
              {fullUser.isActive ? "Активен" : "Заблокирован"}
            </span>
          </div>

          {/* ── Instructions section ── */}
          <div className="mb-6">
            <h2
              className="font-display mb-1"
              style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.3px", color: "white" }}
            >
              Инструкции
            </h2>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Пошаговые руководства по работе с сервисом
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={cardStyle}>
              <svg className="w-10 h-10 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "white" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p style={{ color: "rgba(255,255,255,0.45)" }}>Инструкции скоро появятся</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <Link
                  href={`/instructions/${cat.slug}`}
                  key={cat.id}
                  className="group rounded-2xl p-6 transition-all hover:-translate-y-0.5"
                  style={cardStyle}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "white" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold mb-1.5" style={{ fontSize: "16px", color: "white" }}>
                        {cat.title}
                      </h3>
                      {cat.description && (
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 mt-1 flex-shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "white" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="mt-4 pt-4 flex items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {cat._count.steps} шагов
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <a
        href="https://t.me/egor6p"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium shadow-lg hover:opacity-90 transition-all z-40"
        style={{ background: "var(--color-cofounder-blue)", color: "white" }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
        </svg>
        <span className="hidden sm:block">Связаться</span>
      </a>
    </>
  );
}
