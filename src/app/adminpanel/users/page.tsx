"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  phoneOrTelegram: string;
  loginCode: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
  lastIp: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const d = await res.json();
      setUsers(d.users);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, phoneOrTelegram: newContact }),
    });
    const d = await res.json();
    if (res.ok) {
      toast.success(`Пользователь создан! Код: ${d.user.loginCode}`);
      setNewName(""); setNewContact(""); setShowCreate(false);
      loadUsers();
    } else {
      toast.error(d.error || "Ошибка");
    }
    setCreating(false);
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phoneOrTelegram.toLowerCase().includes(search.toLowerCase()) ||
      u.loginCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="font-display"
            style={{ fontSize: "26px", fontWeight: 500, color: "var(--color-dark-charcoal)" }}
          >
            Пользователи
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:opacity-90 transition-all"
            style={{ background: "var(--color-night-sky)", color: "white", borderRadius: "4px" }}
          >
            + Создать
          </button>
        </div>

        {showCreate && (
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: "var(--color-canvas-white)",
              boxShadow: "var(--shadow-subtle-2)",
              border: "1px solid var(--color-steel-gray)",
            }}
          >
            <h2 className="font-semibold mb-4" style={{ color: "var(--color-dark-charcoal)" }}>
              Новый пользователь
            </h2>
            <form onSubmit={createUser} className="flex flex-col sm:flex-row gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Имя"
                required
                className="flex-1 px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--color-ash-gray)",
                  border: "1px solid var(--color-steel-gray)",
                  borderRadius: "8px",
                  color: "var(--color-dark-charcoal)",
                }}
              />
              <input
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Телефон или Telegram"
                className="flex-1 px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--color-ash-gray)",
                  border: "1px solid var(--color-steel-gray)",
                  borderRadius: "8px",
                  color: "var(--color-dark-charcoal)",
                }}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "4px" }}
                >
                  {creating ? "..." : "Создать"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-gray-100"
                  style={{ border: "1px solid var(--color-steel-gray)", borderRadius: "4px", color: "var(--color-slate-gray)" }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, контакту или коду..."
            className="w-full sm:w-80 px-4 py-2 text-sm outline-none"
            style={{
              background: "var(--color-canvas-white)",
              border: "1px solid var(--color-steel-gray)",
              borderRadius: "8px",
              color: "var(--color-dark-charcoal)",
            }}
          />
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--color-canvas-white)",
            boxShadow: "var(--shadow-subtle-2)",
            border: "1px solid var(--color-steel-gray)",
          }}
        >
          {loading ? (
            <div className="p-12 text-center" style={{ color: "var(--color-medium-gray)" }}>
              Загрузка...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" style={{ color: "var(--color-medium-gray)" }}>
              {search ? "Ничего не найдено" : "Нет пользователей"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-cool-gray)" }}>
                    {["Имя", "Контакт", "Код входа", "Статус", "Создан", "Посл. вход", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--color-medium-gray)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: "1px solid var(--color-cool-gray)" }}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium" style={{ color: "var(--color-dark-charcoal)" }}>
                          {u.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm" style={{ color: "var(--color-slate-gray)" }}>
                          {u.phoneOrTelegram || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="text-xs px-2 py-1 rounded font-mono"
                          style={{ background: "var(--color-ash-gray)", color: "var(--color-cofounder-blue)" }}
                        >
                          {u.loginCode}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{
                            background: u.isActive ? "rgba(65,161,207,0.12)" : "rgba(239,68,68,0.12)",
                            color: u.isActive ? "var(--color-cofounder-blue)" : "#ef4444",
                          }}
                        >
                          {u.isActive ? "Активен" : "Отключён"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--color-light-gray)" }}>
                          {formatDate(u.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: "var(--color-light-gray)" }}>
                          {formatDate(u.lastLoginAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/adminpanel/users/${u.id}`}
                          className="text-xs font-medium hover:opacity-70 transition-opacity"
                          style={{ color: "var(--color-cofounder-blue)" }}
                        >
                          Открыть →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
