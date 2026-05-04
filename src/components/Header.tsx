"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { LogOut, ChevronDown, Menu, X } from "lucide-react";
import { createPortal } from "react-dom";

interface MaintenanceState {
  maintenance: boolean;
  accessMode: "global" | "authorized" | "guest";
}

interface HeaderProps {
  user?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export default function Header({ user, isAdmin }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [maintenanceState, setMaintenanceState] = useState<MaintenanceState>({ maintenance: false, accessMode: "global" });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInAdminPanel = pathname?.startsWith("/adminpanel") && !pathname?.includes("/login");

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [mobileOpen]);

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
          {/* Mobile layout - separate pills */}
          <div className="md:hidden relative w-full">
            {/* Hamburger pill on left */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full transition-colors"
              style={{
                color: "rgba(255,255,255,0.6)",
                background: "rgba(10, 14, 24, 0.48)",
                border: "1px solid rgba(255,255,255,0.13)",
                backdropFilter: "blur(18px)",
              }}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo pill centered */}
            <a
              href="/"
              className="flex items-center justify-center px-5 py-3 rounded-full transition-all duration-200 mx-auto"
              style={{
                textDecoration: "none",
                background: "rgba(10, 14, 24, 0.48)",
                border: "1px solid rgba(255,255,255,0.13)",
                backdropFilter: "blur(18px)",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(10, 14, 24, 0.48)";
              }}
            >
              <Logo size="sm" inverted />
            </a>
          </div>

          {/* Desktop layout - single pill */}
          <div
            className="hidden md:flex items-center"
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
            <a
              href="/"
              className="flex items-center px-3 py-2 rounded-full transition-all duration-200"
              style={{ textDecoration: "none" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Logo size="sm" inverted />
            </a>

            {/* Separator */}
            <span style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

            {/* Navigation */}
            <nav className="flex items-center gap-1" style={{ flex: 1, justifyContent: "center" }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                    style={{
                      color: isActive ? "var(--color-cofounder-blue)" : "rgba(255,255,255,0.72)",
                      background: isActive ? "rgba(65,161,207,0.12)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Separator */}
            <span style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

            {/* Right slot */}
            <div className="flex items-center" style={{ justifyContent: "center" }}>
              {user ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap"
                    style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)" }}
                  >
                    {avatar}
                    <span className="max-w-24 truncate">{user.name.split(" ")[0] || user.name}</span>
                    <ChevronDown size={10} style={{ marginLeft: 1 }} />
                  </button>

                  {/* User dropdown */}
                  {menuOpen && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-44 rounded-xl overflow-hidden origin-top z-50"
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
                  className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                  style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  Войти
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar menu */}
      {mobileOpen && typeof window !== "undefined" &&
        createPortal(
          <div>
            {/* Overlay */}
            <div
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              style={{ opacity: 1, transition: "opacity 0.2s ease-out" }}
            />
            {/* Sidebar */}
            <div
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 md:hidden"
              style={{
                background: "rgba(10, 14, 24, 0.98)",
                backdropFilter: "blur(20px)",
                borderRight: "1px solid rgba(255,255,255,0.1)",
                transform: "translateX(0)",
                transition: "transform 0.3s ease-out",
              }}
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <Logo size="md" inverted />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar content */}
              <nav className="flex flex-col px-4 py-6 gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-200"
                      style={{
                        color: isActive ? "var(--color-cofounder-blue)" : "rgba(255,255,255,0.8)",
                        background: isActive ? "rgba(65,161,207,0.12)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>

              {/* Sidebar footer */}
              {user && (
                <div className="absolute bottom-0 left-0 right-0 px-4 py-6 border-t border-white/10">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-cofounder-blue)", color: "white", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 500 }}>
                        {user.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                  >
                    <LogOut size={16} /> Выйти
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
