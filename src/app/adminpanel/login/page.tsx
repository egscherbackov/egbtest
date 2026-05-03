"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ошибка входа");
      } else {
        window.location.href = "/adminpanel";
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-night-sky)" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-2">
          <Logo size="lg" inverted />
          <p className="text-white/30 text-xs tracking-widest uppercase font-semibold">
            Admin Panel
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h1
            className="text-white font-display text-center mb-6"
            style={{ fontSize: "24px", fontWeight: 500 }}
          >
            Вход в систему
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/60">
                Логин
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-action-azure)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-white/60">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  color: "white",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-action-azure)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{
                background: "var(--color-cofounder-blue)",
                color: "white",
                borderRadius: "4px",
              }}
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
