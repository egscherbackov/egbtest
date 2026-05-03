"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Logo from "@/components/Logo";
import PillNav, { type PillNavItem } from "@/components/ui/PillNav";
import { LogOut, ChevronDown } from "lucide-react";

const dropdownVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -6 },
  visible: { opacity: 1, scale: 1,    y:  0, transition: { type: "spring" as const, stiffness: 320, damping: 22 } },
  exit:    { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.14 } },
};

const mobileVariants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.22, ease: "easeOut" as const } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.16, ease: "easeIn"  as const } },
};

interface HeaderProps {
  user?: { id: string; name: string } | null;
  isAdmin?: boolean;
}

export default function Header({ user, isAdmin }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInAdminPanel = pathname?.startsWith("/adminpanel") && !pathname?.includes("/login");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    setMobileOpen(false);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    window.location.href = "/";
  }

  const navItems: PillNavItem[] = [
    { label: "Услуги",        href: "/#services" },
    { label: "Как работает",  href: "/#how" },
    ...(user    ? [{ label: "Кабинет", href: "/instructions" }] : []),
    ...(isAdmin && !isInAdminPanel ? [{ label: "Админ",   href: "/adminpanel"   }] : []),
  ];

  const avatar = user
    ? <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-cofounder-blue)", color: "white", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}>{user.name.charAt(0).toUpperCase()}</span>
    : null;

  const rightItems: PillNavItem[] = user ? [
    {
      label: user.name.split(" ")[0] || user.name,
      prefix: avatar,
      suffix: <ChevronDown size={10} style={{ marginLeft: 1 }} />,
      onClick: () => setMenuOpen((v) => !v),
    },
  ] : [
    { label: "Войти", href: "/login" },
  ];

  const mobileLinks = [
    { href: "/#services",     label: "Услуги" },
    { href: "/#how",          label: "Как работает" },
    ...(user    ? [{ href: "/instructions", label: "Личный кабинет" }] : []),
    ...(isAdmin ? [{ href: "/adminpanel",   label: "Админ панель"  }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Floating ADMIN PANEL button when in admin panel */}
      {isInAdminPanel && (
        <div className="fixed top-3 right-4 sm:right-6 pointer-events-auto">
          <Link
            href="/adminpanel"
            className="px-4 py-2 text-xs font-semibold rounded-full transition-all hover:scale-105"
            style={{
              background: "rgba(65,161,207,0.15)",
              border: "1px solid rgba(65,161,207,0.3)",
              color: "var(--color-action-azure)",
            }}
          >
            АДМИН ПАНЕЛЬ
          </Link>
        </div>
      )}

      {/* Floating pill row */}
      <div className="flex justify-center pt-3 px-4 sm:px-6">
        {/* Wrapper: auto-width on desktop, full-width on mobile */}
        <div ref={dropdownRef} className="relative pointer-events-auto w-full md:w-auto">
          <PillNav
            logoNode={<Logo size="sm" inverted />}
            logoHref="/"
            items={navItems}
            rightItems={rightItems}
            onHamburgerClick={() => setMobileOpen((v) => !v)}
          />

          {/* User dropdown — anchored to right of the pill */}
          {user && (
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  key="user-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 w-44 rounded-xl overflow-hidden origin-top-right"
                  style={{ top: "calc(100% + 8px)", background: "#0e1622", boxShadow: "0 8px 32px rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Link
                    href="/instructions"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    Личный кабинет
                  </Link>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 text-left"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    <LogOut size={14} /> Выйти
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pointer-events-auto overflow-hidden mx-4 mt-2 rounded-2xl"
            style={{ background: "rgba(10,16,28,0.95)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
          >
            <nav className="flex flex-col px-2 py-2 gap-0.5">
              {mobileLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/8"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {label}
                </Link>
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
