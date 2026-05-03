"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
  _count: { steps: number };
}

export default function AdminInstructionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/instructions");
    if (res.ok) { const d = await res.json(); setCategories(d.categories); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/instructions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug, description: newDesc }),
    });
    if (res.ok) {
      setNewTitle(""); setNewSlug(""); setNewDesc(""); setShowCreate(false);
      load();
    } else {
      const d = await res.json();
      alert(d.error || "Ошибка");
    }
    setCreating(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/instructions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  }

  async function deleteCategory(id: string, title: string) {
    if (!confirm(`Удалить инструкцию "${title}"? Все шаги будут удалены.`)) return;
    await fetch(`/api/admin/instructions/${id}`, { method: "DELETE" });
    load();
  }

  const card = "rounded-2xl overflow-hidden";
  const cardStyle = {
    background: "var(--color-canvas-white)",
    boxShadow: "var(--shadow-subtle-2)",
    border: "1px solid var(--color-steel-gray)",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--color-dark-charcoal)" }}>
            Инструкции
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: "var(--color-night-sky)", color: "white", borderRadius: "8px" }}
          >
            <Plus size={16} />
            Создать инструкцию
          </button>
        </div>

        {showCreate && (
          <div className={`${card} p-6 mb-5`} style={cardStyle}>
            <h2 className="font-bold text-base mb-4" style={{ color: "var(--color-dark-charcoal)" }}>Новая инструкция</h2>
            <form onSubmit={create} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>Название *</label>
                  <input value={newTitle} onChange={e => { setNewTitle(e.target.value); if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
                    required className="w-full px-3 py-2 text-sm outline-none" style={{ background: "var(--color-ash-gray)", border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-dark-charcoal)" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>Slug (URL) *</label>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    required placeholder="moy-slug" className="w-full px-3 py-2 text-sm outline-none font-mono" style={{ background: "var(--color-ash-gray)", border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-dark-charcoal)" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>Описание</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm outline-none resize-none" style={{ background: "var(--color-ash-gray)", border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-dark-charcoal)" }} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={creating} className="px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50" style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "8px" }}>
                  {creating ? "Создание..." : "Создать"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-semibold hover:bg-gray-100" style={{ border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-slate-gray)" }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={card} style={cardStyle}>
          {loading ? (
            <div className="p-12 text-center" style={{ color: "var(--color-medium-gray)" }}>Загрузка...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--color-medium-gray)" }} />
              <p style={{ color: "var(--color-medium-gray)" }}>Нет инструкций. Создайте первую.</p>
            </div>
          ) : (
            <div>
              {categories.map((cat, idx) => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 gap-3"
                  style={{ borderBottom: idx < categories.length - 1 ? "1px solid var(--color-cool-gray)" : "none" }}>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm truncate" style={{ color: "var(--color-dark-charcoal)" }}>{cat.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: cat.isActive ? "rgba(65,161,207,0.12)" : "rgba(239,68,68,0.1)", color: cat.isActive ? "var(--color-cofounder-blue)" : "#ef4444" }}>
                          {cat.isActive ? "Активна" : "Скрыта"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <code className="text-xs font-mono" style={{ color: "var(--color-medium-gray)" }}>/{cat.slug}</code>
                        <span className="text-xs" style={{ color: "var(--color-light-gray)" }}>{cat._count.steps} шагов</span>
                        <span className="text-xs" style={{ color: "var(--color-light-gray)" }}>{formatDate(cat.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(cat.id, cat.isActive)} title={cat.isActive ? "Скрыть" : "Опубликовать"}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-all" style={{ color: "var(--color-medium-gray)" }}>
                      {cat.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Link href={`/adminpanel/instructions/${cat.id}`}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-all" style={{ color: "var(--color-cofounder-blue)" }}>
                      <Pencil size={16} />
                    </Link>
                    <button onClick={() => deleteCategory(cat.id, cat.title)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-all" style={{ color: "#ef4444" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
