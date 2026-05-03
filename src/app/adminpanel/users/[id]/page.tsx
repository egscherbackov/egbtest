"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { Pencil, RefreshCw, Ban, CheckCircle2, Trash2 } from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";

interface UserActivity {
  id: string;
  type: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  meta: string | null;
}

interface FullUser {
  id: string;
  name: string;
  phoneOrTelegram: string;
  loginCode: string;
  isActive: boolean;
  createdAt: string;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  lastIp: string | null;
  lastUserAgent: string | null;
  country: string | null;
  activities: UserActivity[];
}

function parseUA(ua: string | null): string {
  if (!ua) return "—";
  let browser = "";
  let os = "";
  if (/Chrome\/([\d.]+)/.test(ua) && !/Chromium|Edge|OPR|Edg/.test(ua)) browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1]?.split(".")[0]}`;
  else if (/Edg\/([\d.]+)/.test(ua)) browser = `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1]?.split(".")[0]}`;
  else if (/Firefox\/([\d.]+)/.test(ua)) browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1]?.split(".")[0]}`;
  else if (/Safari\//.test(ua) && /Version\/([\d.]+)/.test(ua)) browser = `Safari ${ua.match(/Version\/([\d.]+)/)?.[1]?.split(".")[0]}`;
  else if (/OPR\/([\d.]+)/.test(ua)) browser = `Opera ${ua.match(/OPR\/([\d.]+)/)?.[1]?.split(".")[0]}`;
  else browser = ua.split(" ")[0]?.split("/")[0] || "Unknown";
  if (/Windows NT ([\d.]+)/.test(ua)) { const v = ua.match(/Windows NT ([\d.]+)/)?.[1]; os = v === "10.0" ? "Windows 10/11" : `Windows NT ${v}`; }
  else if (/Mac OS X ([\d_]+)/.test(ua)) os = `macOS ${ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".")}`;
  else if (/Android ([\d.]+)/.test(ua)) os = `Android ${ua.match(/Android ([\d.]+)/)?.[1]}`;
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, ".")}`;
  else if (/iPad/.test(ua)) os = "iPadOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return [browser, os].filter(Boolean).join(" / ") || "Unknown";
}

const activityLabels: Record<string, string> = {
  login: "Вход",
  register_invite: "Регистрация",
  view_instructions: "Открыл инструкции",
  view_instruction: "Читал инструкцию",
  page_view: "Просмотр страницы",
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [user, setUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editContact, setEditContact] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUser = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${id}`);
    if (res.ok) {
      const d = await res.json();
      setUser(d.user);
      setEditName(d.user.name);
      setEditContact(d.user.phoneOrTelegram);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  async function saveUser() {
    setSaving(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, phoneOrTelegram: editContact }),
    });
    if (res.ok) {
      toast.success("Сохранено");
      setEditing(false);
      loadUser();
    } else toast.error("Ошибка");
    setSaving(false);
  }

  async function toggleStatus() {
    if (!user) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (res.ok) { toast.success("Статус изменён"); loadUser(); }
    else toast.error("Ошибка");
  }

  async function regenerateCode() {
    if (!confirm("Сгенерировать новый код? Старый код перестанет работать.")) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateCode: true }),
    });
    if (res.ok) { toast.success("Новый код сгенерирован"); loadUser(); }
    else toast.error("Ошибка");
  }

  async function deleteUser() {
    if (!confirm("Удалить пользователя? Это действие нельзя отменить.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Пользователь удалён"); router.push("/adminpanel/users"); }
    else toast.error("Ошибка");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-ash-gray)" }}>
        <LoaderOne size="lg" style={{ color: "var(--color-cofounder-blue)" }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-20">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/adminpanel/users" className="text-sm hover:opacity-70" style={{ color: "var(--color-medium-gray)" }}>
            ← Пользователи
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--color-canvas-white)", boxShadow: "var(--shadow-subtle-2)", border: "1px solid var(--color-steel-gray)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <h1 className="font-display text-xl font-medium" style={{ color: "var(--color-dark-charcoal)" }}>
                  {user.name}
                </h1>
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    background: user.isActive ? "rgba(65,161,207,0.12)" : "rgba(239,68,68,0.12)",
                    color: user.isActive ? "var(--color-cofounder-blue)" : "#ef4444",
                  }}
                >
                  {user.isActive ? "Активен" : "Отключён"}
                </span>
              </div>

              {editing ? (
                <div className="flex flex-col gap-3">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm outline-none" style={{ background: "var(--color-ash-gray)", border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-dark-charcoal)" }} />
                  <input value={editContact} onChange={(e) => setEditContact(e.target.value)} className="w-full px-3 py-2 text-sm outline-none" style={{ background: "var(--color-ash-gray)", border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-dark-charcoal)" }} />
                  <div className="flex gap-2">
                    <button onClick={saveUser} disabled={saving} className="px-4 py-2 text-sm font-medium hover:opacity-90" style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "4px" }}>
                      {saving ? "..." : "Сохранить"}
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-medium" style={{ border: "1px solid var(--color-steel-gray)", borderRadius: "4px", color: "var(--color-slate-gray)" }}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { label: "Контакт", value: user.phoneOrTelegram || "—" },
                    { label: "Аккаунт создан", value: formatDate(user.createdAt) },
                    { label: "Первый вход", value: formatDate(user.firstLoginAt) },
                    { label: "Последний вход", value: formatDate(user.lastLoginAt) },
                    { label: "Последняя активность", value: formatDate(user.lastSeenAt) },
                    { label: "Страна", value: user.country || (user.lastIp === "127.0.0.1" || user.lastIp?.startsWith("192.168.") || user.lastIp?.startsWith("10.") || user.lastIp?.startsWith("::") ? "Локальная сеть" : "—") },
                    { label: "IP адрес", value: user.lastIp || "—" },
                    { label: "Браузер / ОС", value: parseUA(user.lastUserAgent) },
                  ].map((f) => (
                    <div key={f.label} className="flex items-start gap-3">
                      <span className="text-xs w-36 shrink-0 pt-0.5 font-semibold" style={{ color: "var(--color-medium-gray)" }}>{f.label}</span>
                      <span className="text-sm" style={{ color: "var(--color-dark-charcoal)" }}>{f.value}</span>
                    </div>
                  ))}
                  {user.lastUserAgent && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer select-none" style={{ color: "var(--color-medium-gray)" }}>Полный User-Agent</summary>
                      <p className="text-xs mt-1 break-all font-mono p-2 rounded-lg" style={{ background: "var(--color-ash-gray)", color: "var(--color-slate-gray)" }}>{user.lastUserAgent}</p>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Activity */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--color-canvas-white)", boxShadow: "var(--shadow-subtle-2)", border: "1px solid var(--color-steel-gray)" }}
            >
              <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--color-cool-gray)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--color-dark-charcoal)" }}>Активность</h2>
              </div>
              {user.activities.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm" style={{ color: "var(--color-medium-gray)" }}>Нет активности</div>
              ) : (
                user.activities.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-6 py-3" style={{ borderBottom: "1px solid var(--color-cool-gray)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-dark-charcoal)" }}>{activityLabels[a.type] || a.type}</p>
                      {a.meta && <p className="text-xs" style={{ color: "var(--color-medium-gray)" }}>{a.meta}</p>}
                    </div>
                    <span className="text-xs" style={{ color: "var(--color-light-gray)" }}>{formatDate(a.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--color-canvas-white)", boxShadow: "var(--shadow-subtle-2)", border: "1px solid var(--color-steel-gray)" }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: "var(--color-medium-gray)" }}>Код входа</p>
              <code className="text-lg font-mono font-bold" style={{ color: "var(--color-cofounder-blue)" }}>{user.loginCode}</code>
              <button onClick={regenerateCode} className="w-full mt-3 py-2 text-xs font-medium hover:opacity-80 transition-all flex items-center justify-center gap-1.5" style={{ border: "1px solid var(--color-steel-gray)", borderRadius: "4px", color: "var(--color-slate-gray)" }}>
                <RefreshCw size={13} /> Обновить код
              </button>
            </div>

            <div
              className="rounded-2xl p-5 flex flex-col gap-2"
              style={{ background: "var(--color-canvas-white)", boxShadow: "var(--shadow-subtle-2)", border: "1px solid var(--color-steel-gray)" }}
            >
              <button onClick={() => setEditing(true)} className="w-full py-2 text-xs font-medium hover:opacity-90 flex items-center justify-center gap-1.5" style={{ background: "var(--color-night-sky)", color: "white", borderRadius: "4px" }}>
                <Pencil size={13} /> Редактировать
              </button>
              <button onClick={toggleStatus} className="w-full py-2 text-xs font-medium hover:opacity-80 flex items-center justify-center gap-1.5" style={{ border: "1px solid var(--color-steel-gray)", borderRadius: "4px", color: user.isActive ? "#ef4444" : "var(--color-cofounder-blue)" }}>
                {user.isActive ? <><Ban size={13} /> Отключить</> : <><CheckCircle2 size={13} /> Активировать</>}
              </button>
              <button onClick={deleteUser} className="w-full py-2 text-xs font-medium hover:opacity-80 flex items-center justify-center gap-1.5" style={{ border: "1px solid rgba(239,68,68,0.3)", borderRadius: "4px", color: "#ef4444" }}>
                <Trash2 size={13} /> Удалить
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
