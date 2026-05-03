import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Users, CheckCircle2, Link2, CircleDot, KeyRound, UserPlus, BookOpen, BookMarked, Eye } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/adminpanel/login");

  const [totalUsers, activeUsers, totalInvites, activeInvites, recentActivity] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.inviteLink.count(),
      prisma.inviteLink.count({ where: { isActive: true, usedAt: null } }),
      prisma.userActivity.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } } },
      }),
    ]);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-20">
        <h1
          className="font-display mb-8"
          style={{ fontSize: "28px", fontWeight: 500, color: "var(--color-dark-charcoal)" }}
        >
          Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Всего пользователей", value: totalUsers, Icon: Users },
            { label: "Активных", value: activeUsers, Icon: CheckCircle2 },
            { label: "Приглашений создано", value: totalInvites, Icon: Link2 },
            { label: "Активных ссылок", value: activeInvites, Icon: CircleDot },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5"
              style={{
                background: "var(--color-canvas-white)",
                boxShadow: "var(--shadow-subtle-2)",
                border: "1px solid var(--color-steel-gray)",
              }}
            >
              <s.Icon size={22} className="mb-2 opacity-50" style={{ color: "var(--color-cofounder-blue)" }} />
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: "var(--color-dark-charcoal)" }}
              >
                {s.value}
              </div>
              <div className="text-xs" style={{ color: "var(--color-medium-gray)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/adminpanel/users"
            className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--color-canvas-white)",
              boxShadow: "var(--shadow-subtle-2)",
              border: "1px solid var(--color-steel-gray)",
            }}
          >
            <Users size={20} style={{ color: "var(--color-cofounder-blue)" }} />
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--color-dark-charcoal)" }}
              >
                Пользователи
              </p>
              <p className="text-xs" style={{ color: "var(--color-medium-gray)" }}>
                Управление аккаунтами
              </p>
            </div>
          </Link>
          <Link
            href="/adminpanel/invites"
            className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--color-canvas-white)",
              boxShadow: "var(--shadow-subtle-2)",
              border: "1px solid var(--color-steel-gray)",
            }}
          >
            <Link2 size={20} style={{ color: "var(--color-cofounder-blue)" }} />
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--color-dark-charcoal)" }}
              >
                Приглашения
              </p>
              <p className="text-xs" style={{ color: "var(--color-medium-gray)" }}>
                Invite links
              </p>
            </div>
          </Link>
          <Link
            href="/adminpanel/instructions"
            className="flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--color-canvas-white)",
              boxShadow: "var(--shadow-subtle-2)",
              border: "1px solid var(--color-steel-gray)",
            }}
          >
            <BookOpen size={20} style={{ color: "var(--color-cofounder-blue)" }} />
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--color-dark-charcoal)" }}
              >
                Инструкции
              </p>
              <p className="text-xs" style={{ color: "var(--color-medium-gray)" }}>
                Управление контентом
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--color-canvas-white)",
            boxShadow: "var(--shadow-subtle-2)",
            border: "1px solid var(--color-steel-gray)",
          }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--color-cool-gray)" }}>
            <h2
              className="font-semibold"
              style={{ fontSize: "15px", color: "var(--color-dark-charcoal)" }}
            >
              Последняя активность
            </h2>
          </div>
          <div>
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center" style={{ color: "var(--color-medium-gray)" }}>
                Нет активности
              </div>
            ) : (
              recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-6 py-3.5"
                  style={{ borderBottom: "1px solid var(--color-cool-gray)" }}
                >
                  <div className="flex items-center gap-3">
                    <ActivityIcon type={a.type} />
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-dark-charcoal)" }}
                      >
                        {a.user.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-medium-gray)" }}>
                        {activityLabel(a.type)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-light-gray)" }}>
                    {formatDate(a.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const props = { size: 16, style: { color: "var(--color-cofounder-blue)" } };
  if (type === "login") return <KeyRound {...props} />;
  if (type === "register_invite") return <UserPlus {...props} />;
  if (type === "view_instructions") return <BookOpen {...props} />;
  if (type === "view_instruction") return <BookMarked {...props} />;
  if (type === "page_view") return <Eye {...props} />;
  return <CircleDot {...props} />;
}

function activityLabel(type: string) {
  const labels: Record<string, string> = {
    login: "Вошёл в аккаунт",
    register_invite: "Зарегистрировался по приглашению",
    view_instructions: "Просмотрел инструкции",
    view_instruction: "Читал инструкцию",
    page_view: "Посетил страницу",
  };
  return labels[type] || type;
}
