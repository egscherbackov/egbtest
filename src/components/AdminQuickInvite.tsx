"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Sparkles, Wand2 } from "lucide-react";

export default function AdminQuickInvite() {
  const [creating, setCreating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  async function createInvite() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/invites", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Не удалось создать приглашение");
        return;
      }

      const url = `${window.location.origin}/invite/${data.invite.token}`;
      setInviteUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success("Инвайт создан и скопирован");
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setCreating(false);
    }
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать");
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-8"
      style={{
        background: "linear-gradient(135deg, #101827 0%, #0b1220 50%, #111827 100%)",
        boxShadow: "var(--shadow-subtle-2)",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div
        className="absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl"
        style={{ background: "rgba(65,161,207,0.25)" }}
      />
      <div
        className="absolute -bottom-14 left-10 h-32 w-32 rounded-full blur-3xl"
        style={{ background: "rgba(0,129,192,0.18)" }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,255,255,0.08)", color: "#41a1cf" }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Быстрый инвайт</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">
              Создай одноразовую ссылку для нового пользователя прямо с Dashboard. Ссылка автоматически копируется в буфер.
            </p>
            {inviteUrl && (
              <button
                onClick={copyInvite}
                className="mt-3 flex max-w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.72)" }}
              >
                <Copy size={14} />
                <span className="truncate">{inviteUrl}</span>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={createInvite}
          disabled={creating}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #0081c0, #41a1cf)" }}
        >
          <Wand2 size={17} />
          {creating ? "Создаю..." : "Создать инвайт"}
        </button>
      </div>
    </div>
  );
}
