"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";

type MaintenanceAccessMode = "global" | "authorized";

const inputStyle = {
  background: "var(--color-ash-gray)",
  border: "1px solid var(--color-steel-gray)",
  borderRadius: "8px",
  color: "var(--color-dark-charcoal)",
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceAccessMode, setMaintenanceAccessMode] =
    useState<MaintenanceAccessMode>("global");
  const [maintenanceText, setMaintenanceText] = useState("");
  const [totalOrders, setTotalOrders] = useState(1394);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setMaintenanceMode(d.settings.maintenanceMode);
        setMaintenanceAccessMode(d.settings.maintenanceAccessMode ?? "global");
        setMaintenanceText(d.settings.maintenanceText);
        setTotalOrders(d.settings.totalOrders ?? 1394);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceMode, maintenanceAccessMode, maintenanceText, totalOrders }),
      });
      if (res.ok) {
        toast.success("Настройки сохранены");
      } else {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) {
          toast.error("Сессия истекла — войдите заново");
        } else {
          toast.error(`Ошибка ${res.status}: ${body.error ?? "Ошибка сохранения"}`);
        }
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  }

  const cardStyle = {
    background: "var(--color-canvas-white)",
    boxShadow: "var(--shadow-subtle-2)",
    border: "1px solid var(--color-steel-gray)",
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display" style={{ fontSize: "26px", fontWeight: 500, color: "var(--color-dark-charcoal)" }}>
            Настройки сайта
          </h1>
          <button onClick={save} disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "10px" }}>
            {saving ? <LoaderOne size="sm" /> : <Save size={15} />}
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: "var(--color-medium-gray)" }}>
            <LoaderOne style={{ color: "var(--color-action-azure)" }} /> Загрузка...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Maintenance toggle */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} style={{ color: maintenanceMode ? "#f59e0b" : "var(--color-light-gray)" }} />
                    <h2 className="font-semibold text-sm" style={{ color: "var(--color-dark-charcoal)" }}>
                      Режим технических работ
                    </h2>
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-medium-gray)" }}>
                    Выберите полный режим или режим только для гостей. Администратор продолжает работу в обычном режиме.
                  </p>
                </div>
                <button
                  onClick={() => setMaintenanceMode((v) => !v)}
                  className="ml-4 relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none shrink-0"
                  style={{
                    background: maintenanceMode ? "#f59e0b" : "var(--color-steel-gray)",
                  }}>
                  <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                    style={{ transform: maintenanceMode ? "translateX(24px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                style={{
                  background: maintenanceMode ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                  border: `1px solid ${maintenanceMode ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
                  color: maintenanceMode ? "#92400e" : "#166534",
                }}>
                {maintenanceMode
                  ? <><AlertTriangle size={13} /> {maintenanceAccessMode === "global" ? "Глобальный режим — сайт закрыт для всех пользователей" : "Гостевой режим — авторизованные пользователи могут пользоваться сайтом"}</>
                  : <><CheckCircle2 size={13} /> Сайт работает в штатном режиме</>}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: "global" as const,
                    title: "Глобальное обслуживание",
                    desc: "На сайт может зайти только админ-панель.",
                  },
                  {
                    value: "authorized" as const,
                    title: "Только для гостей",
                    desc: "Инвайт, вход и авторизованные пользователи работают.",
                  },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setMaintenanceAccessMode(mode.value)}
                    className="text-left rounded-xl p-3 transition-all"
                    style={{
                      background:
                        maintenanceAccessMode === mode.value
                          ? "rgba(65,161,207,0.10)"
                          : "var(--color-ash-gray)",
                      border: `1px solid ${
                        maintenanceAccessMode === mode.value
                          ? "rgba(65,161,207,0.45)"
                          : "var(--color-cool-gray)"
                      }`,
                    }}
                  >
                    <span className="block text-sm font-semibold" style={{ color: "var(--color-dark-charcoal)" }}>
                      {mode.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5" style={{ color: "var(--color-medium-gray)" }}>
                      {mode.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total orders counter */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h2 className="font-semibold text-sm mb-1" style={{ color: "var(--color-dark-charcoal)" }}>
                Количество заказов (счётчик на главной)
              </h2>
              <p className="text-xs mb-4" style={{ color: "var(--color-medium-gray)" }}>
                Отображается на главной странице с анимацией.
              </p>
              <input
                type="number"
                min={0}
                value={totalOrders}
                onChange={(e) => setTotalOrders(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-action-azure)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-steel-gray)"; }}
              />
            </div>

            {/* Maintenance text */}
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h2 className="font-semibold text-sm mb-1" style={{ color: "var(--color-dark-charcoal)" }}>
                Текст на странице технических работ
              </h2>
              <p className="text-xs mb-4" style={{ color: "var(--color-medium-gray)" }}>
                Этот текст увидят пользователи под названием сайта во время технических работ.
              </p>
              <textarea
                value={maintenanceText}
                onChange={(e) => setMaintenanceText(e.target.value)}
                rows={4}
                placeholder="Сайт временно недоступен. Мы скоро вернёмся."
                className="w-full px-3 py-2.5 text-sm outline-none resize-none"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-action-azure)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-steel-gray)"; }}
              />

              {/* Preview */}
              {maintenanceText.trim() && (
                <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--color-ash-gray)", border: "1px solid var(--color-cool-gray)" }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>Предпросмотр:</p>
                  <p className="text-sm italic" style={{ color: "var(--color-slate-gray)" }}>{maintenanceText}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
