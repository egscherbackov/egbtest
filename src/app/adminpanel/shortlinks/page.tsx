"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Copy, Check, ExternalLink, Link2 } from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";

interface ShortLink {
  id: string;
  shortCode: string;
  targetUrl: string;
  clicks: number;
  createdAt: string;
}

const cardStyle = {
  background: "var(--color-canvas-white)",
  boxShadow: "var(--shadow-subtle-2)",
  border: "1px solid var(--color-steel-gray)",
};

const inputStyle = {
  background: "var(--color-ash-gray)",
  border: "1px solid var(--color-steel-gray)",
  borderRadius: "8px",
  color: "var(--color-dark-charcoal)",
};

export default function ShortlinksPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [siteUrl, setSiteUrl] = useState("");

  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/shortlinks");
    const d = await r.json();
    setLinks(d.links ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    setSiteUrl(window.location.origin);
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/shortlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, customCode }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      toast.success("Ссылка создана");
      setTargetUrl("");
      setCustomCode("");
      load();
    } finally {
      setCreating(false);
    }
  }

  async function deleteLink(id: string) {
    if (!confirm("Удалить ссылку?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/shortlinks/${id}`, { method: "DELETE" });
      setLinks((l) => l.filter((x) => x.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function copyLink(id: string, code: string) {
    const url = `${siteUrl}/${code}`;
    const finish = () => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(finish).catch(() => {
        const ta = document.createElement("textarea");
        ta.value = url; ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta);
        finish();
      });
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-20">

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display" style={{ fontSize: "26px", fontWeight: 500, color: "var(--color-dark-charcoal)" }}>
            Сокращатель ссылок
          </h1>
        </div>

        {/* Create form */}
        <div className="rounded-2xl p-6 mb-6" style={cardStyle}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-dark-charcoal)" }}>
            Новая короткая ссылка
          </h2>
          <form onSubmit={create} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>
                Целевой URL *
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com/very-long-url"
                required
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-action-azure)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-steel-gray)"; }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>
                Свой код (необязательно)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0" style={{ color: "var(--color-medium-gray)" }}>
                  {siteUrl}/
                </span>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="my-link"
                  maxLength={30}
                  className="flex-1 px-3 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-action-azure)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-steel-gray)"; }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--color-light-gray)" }}>
                Оставьте пустым — сгенерируется автоматически
              </p>
            </div>

            <button
              type="submit"
              disabled={creating || !targetUrl.trim()}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold self-start hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              style={{ background: "var(--color-night-sky)", color: "white", borderRadius: "10px" }}
            >
              {creating ? <LoaderOne size="sm" /> : <Plus size={15} />}
              {creating ? "Создание..." : "Создать ссылку"}
            </button>
          </form>
        </div>

        {/* Links list */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-3" style={{ color: "var(--color-medium-gray)" }}>
              <LoaderOne style={{ color: "var(--color-action-azure)" }} /> Загрузка...
            </div>
          ) : links.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-center" style={{ color: "var(--color-medium-gray)" }}>
              <Link2 size={32} style={{ color: "var(--color-steel-gray)" }} />
              <p className="text-sm">Нет коротких ссылок</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-cool-gray)" }}>
              {links.map((link) => {
                const shortUrl = `${siteUrl}/${link.shortCode}`;
                const isCopied = copiedId === link.id;
                const isDeleting = deletingId === link.id;

                return (
                  <div
                    key={link.id}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors"
                    style={{ background: isDeleting ? "rgba(239,68,68,0.03)" : undefined }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold" style={{ color: "var(--color-cofounder-blue)" }}>
                          {shortUrl}
                        </code>
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(65,161,207,0.1)", color: "var(--color-cofounder-blue)" }}>
                          {link.clicks} кл.
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--color-medium-gray)" }}>
                        → {link.targetUrl}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-light-gray)" }}>
                        {formatDate(link.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyLink(link.id, link.shortCode)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 hover:shadow-sm"
                        style={{
                          border: `1px solid ${isCopied ? "rgba(34,197,94,0.4)" : "var(--color-steel-gray)"}`,
                          borderRadius: "8px",
                          background: isCopied ? "rgba(34,197,94,0.08)" : "transparent",
                          color: isCopied ? "#16a34a" : "var(--color-dark-charcoal)",
                        }}
                      >
                        {isCopied ? <><Check size={13} /> Скопировано</> : <><Copy size={13} /> Копировать</>}
                      </button>

                      <a
                        href={link.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-all hover:bg-opacity-10"
                        style={{ color: "var(--color-medium-gray)" }}
                        title="Открыть"
                      >
                        <ExternalLink size={14} />
                      </a>

                      <button
                        onClick={() => deleteLink(link.id)}
                        disabled={isDeleting}
                        title="Удалить"
                        className="p-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        style={{
                          color: "#ef4444",
                          background: isDeleting ? "rgba(239,68,68,0.08)" : "transparent",
                        }}
                      >
                        {isDeleting ? <LoaderOne size="sm" /> : <Trash2 size={14} />}
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
