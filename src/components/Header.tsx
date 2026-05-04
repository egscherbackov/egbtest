"use client";

import { useState, useRef, useEffect } from "react";
import Logo from "@/components/Logo";
import { LogOut, ChevronDown, Menu, X } from "lucide-react";

interface MaintenanceState {
  maintenance: boolean;
  accessMode: "global" | "authorized" | "guest";
}

interface HeaderProps {
  user?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export default function Header({ user, isAdmin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [maintenanceState, setMaintenanceState] = useState<MaintenanceState>({ maintenance: false, accessMode: "global" });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInAdminPanel = typeof window !== "undefined" && window.location.pathname?.startsWith("/adminpanel") && !window.location.pathname?.includes("/login");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    async function fetchMaintenance() {
      try {
        const res = await fetch("/api/maintenance-check");
        const data = await res.json();
        setMaintenanceState({ maintenance: data.maintenance, accessMode: data.accessMode });
      } catch {
        setMaintenanceState({ maintenance: false, accessMode: "global" });
      }
    }
    fetchMaintenance();
    const interval = setInterval(fetchMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    setMobileOpen(false);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    window.location.href = "/";
  }

  const navItems = [
    { href: "/uslugi", label: "Услуги" },
    { href: "/otzyvy", label: "Отзывы" },
    { href: "/o-nas", label: "О нас" },
  ];

  const avatar = user
    ? <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-cofounder-blue)", color: "white", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}>{user.name.charAt(0).toUpperCase()}</span>
    : null;

  const mobileLinks = [
    { href: "/uslugi", label: "Услуги" },
    { href: "/otzyvy", label: "Отзывы" },
    { href: "/o-nas", label: "О нас" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Floating ADMIN PANEL button when in admin panel */}
      {isInAdminPanel && (
        <div className="fixed top-3 right-4 sm:right-6 pointer-events-auto">
          <a
            href="/adminpanel"
            className="px-4 py-2 text-xs font-semibold rounded-full transition-all hover:opacity-80"
            style={{
              background: "rgba(65,161,207,0.15)",
              border: "1px solid rgba(65,161,207,0.3)",
              color: "var(--color-action-azure)",
            }}
          >
            АДМИН ПАНЕЛЬ
          </a>
        </div>
      )}

      {/* Floating pill row */}
      <div className="flex justify-center pt-3 px-4 sm:px-6">
        <div className="relative pointer-events-auto w-full md:w-auto">
          <div
            className="flex items-center"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minWidth: "clamp(400px, 52vw, 720px)",
              height: "46px",
              background: "rgba(10, 14, 24, 0.48)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: "9999px",
              padding: "4px",
              backdropFilter: "blur(18px)",
            }}
          >
            {/* Logo */}
            <a href="/" className="flex items-center px-3 py-2" style={{ textDecoration: "none" }}>
              <Logo size="sm" inverted />
            </a>

            {/* Separator */}
            <span style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

            {/* Navigation */}
            <nav className="flex items-center gap-1" style={{ flex: 1, justifyContent: "center" }}>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                  style={{
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Separator */}
            <span style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

            {/* Right slot */}
            <div className="flex items-center" style={{ width: "80px", justifyContent: "center" }}>
              {user ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all"
                    style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)" }}
                  >
                    {avatar}
                    {user.name.split(" ")[0] || user.name}
                    <ChevronDown size={10} style={{ marginLeft: 1 }} />
                  </button>

                  {/* User dropdown */}
                  {menuOpen && (
                    <div
                      className="absolute right-0 w-44 rounded-xl overflow-hidden origin-top-right"
                      style={{
                        top: "calc(100% + 8px)",
                        background: "#0e1622",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <a
                        href="/instructions"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 block"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        Личный кабинет
                      </a>
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 text-left"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        <LogOut size={14} /> Выйти
                      </button>
                    </div>
                  )}
                </div>
              ) : !maintenanceState.maintenance || maintenanceState.accessMode === "guest" ? (
                <a
                  href="/login"
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all"
                  style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)" }}
                >
                  Войти
                </a>
              ) : null}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.6)" }}
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="pointer-events-auto overflow-hidden mx-4 mt-2 rounded-2xl"
          style={{ background: "rgba(10,16,28,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)" }}
        >
          <nav className="flex flex-col px-2 py-2 gap-0.5">
            {mobileLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/8"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                {label}
              </a>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/8 text-left"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Выйти
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
