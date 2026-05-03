"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Copy, Check, Power, PowerOff, Trash2 } from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";

interface Invite {
  id: string;
  token: string;
  createdAt: string;
  usedAt: string | null;
  isActive: boolean;
  usedBy: { name: string; phoneOrTelegram: string } | null;
}

function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(ta);
      resolve();
    } catch (err) {
      document.body.removeChild(ta);
      reject(err);
    }
  });
}

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const loadInvites = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/invites");
    if (res.ok) {
      const d = await res.json();
      setInvites(d.invites);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadInvites(); }, [loadInvites]);

  async function createInvite() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/invites", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        await loadInvites();
        try {
          await copyToClipboard(`${siteUrl}/invite/${d.invite.token}`);
          toast.success("Ссылка создана и скопирована!");
        } catch {
          toast.success("Ссылка создана!");
        }
      } else {
        const e = await res.json().catch(() => ({}));
        toast.error(e.error || "Ошибка создания");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setCreating(false);
    }
  }

  async function copyLink(id: string, token: string) {
    try {
      await copyToClipboard(`${siteUrl}/invite/${token}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Скопировано!");
    } catch {
      toast.error("Не удалось скопировать — разрешите доступ к буферу обмена");
    }
  }

  async function toggleInvite(id: string, isActive: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/invites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? "Ссылка отключена" : "Ссылка активирована");
        await loadInvites();
      } else toast.error("Ошибка");
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteInvite(id: string) {
    if (!confirm("Удалить приглашение?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Удалено"); await loadInvites(); }
      else toast.error("Ошибка");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display" style={{ fontSize: "26px", fontWeight: 500, color: "var(--color-dark-charcoal)" }}>
            Приглашения
          </h1>
          <button
            onClick={createInvite}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            style={{ background: "var(--color-night-sky)", color: "white", borderRadius: "10px" }}
          >
            {creating ? <LoaderOne size="sm" /> : <Plus size={15} />}
            {creating ? "Создание..." : "Создать ссылку"}
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ background: "var(--color-canvas-white)", boxShadow: "var(--shadow-subtle-2)", border: "1px solid var(--color-steel-gray)" }}>
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-3" style={{ color: "var(--color-medium-gray)" }}>
              <LoaderOne style={{ color: "var(--color-action-azure)" }} /> Загрузка...
            </div>
          ) : invites.length === 0 ? (
            <div className="p-12 text-center" style={{ color: "var(--color-medium-gray)" }}>Нет приглашений</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-cool-gray)" }}>
              {invites.map((inv) => {
                const isCopied = copiedId === inv.id;
                const isToggling = togglingId === inv.id;
                const isDeleting = deletingId === inv.id;

                return (
                  <div key={inv.id}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors"
                    style={{ background: isDeleting ? "rgba(239,68,68,0.03)" : undefined }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: inv.usedAt ? "rgba(100,100,100,0.08)" : inv.isActive ? "rgba(65,161,207,0.12)" : "rgba(239,68,68,0.1)",
                            color: inv.usedAt ? "var(--color-medium-gray)" : inv.isActive ? "var(--color-cofounder-blue)" : "#ef4444",
                          }}>
                          {inv.usedAt ? "Использована" : inv.isActive ? "Активна" : "Отключена"}
                        </span>
                        <span className="text-xs" style={{ color: "var(--color-light-gray)" }}>
                          {formatDate(inv.createdAt)}
                        </span>
                      </div>
                      <code className="text-xs font-mono break-all" style={{ color: "var(--color-slate-gray)" }}>
                        {siteUrl}/invite/{inv.token}
                      </code>
                      {inv.usedBy && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-medium-gray)" }}>
                          Использовал: <span className="font-semibold">{inv.usedBy.name}</span> ({inv.usedBy.phoneOrTelegram})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!inv.usedAt && (
                        <>
                          <button
                            onClick={() => copyLink(inv.id, inv.token)}
                            disabled={isCopied}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 hover:shadow-sm"
                            style={{
                              border: `1px solid ${isCopied ? "rgba(34,197,94,0.4)" : "var(--color-steel-gray)"}`,
                              borderRadius: "8px",
                              background: isCopied ? "rgba(34,197,94,0.08)" : "transparent",
                              color: isCopied ? "#16a34a" : "var(--color-dark-charcoal)",
                            }}>
                            {isCopied
                              ? <><Check size={13} /> Скопировано</>
                              : <><Copy size={13} /> Копировать</>}
                          </button>

                          <button
                            onClick={() => toggleInvite(inv.id, inv.isActive)}
                            disabled={isToggling}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 hover:shadow-sm disabled:opacity-60"
                            style={{
                              border: `1px solid ${inv.isActive ? "rgba(239,68,68,0.3)" : "rgba(65,161,207,0.3)"}`,
                              borderRadius: "8px",
                              color: inv.isActive ? "#ef4444" : "var(--color-cofounder-blue)",
                            }}>
                            {isToggling
                              ? <><LoaderOne size="sm" /> Сохранение...</>
                              : inv.isActive
                                ? <><PowerOff size={13} /> Отключить</>
                                : <><Power size={13} /> Активировать</>}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => deleteInvite(inv.id)}
                        disabled={isDeleting}
                        title="Удалить"
                        className="p-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        style={{
                          color: "#ef4444",
                          background: isDeleting ? "rgba(239,68,68,0.08)" : "transparent",
                        }}>
                        {isDeleting
                          ? <LoaderOne size="sm" />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
