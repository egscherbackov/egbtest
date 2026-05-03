"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import PillNav, { type PillNavItem } from "@/components/ui/PillNav";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const mobileVariants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.22, ease: "easeOut" as const } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.16, ease: "easeIn"  as const } },
};

interface AdminNavProps { adminUsername: string }

export default function AdminNav({ adminUsername: _ }: AdminNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try { await fetch("/api/admin/logout", { method: "POST" }); } catch {}
    window.location.href = "/adminpanel/login";
  }

  const navItems: PillNavItem[] = [
    { label: "Dashboard",    href: "/adminpanel" },
    { label: "Пользователи", href: "/adminpanel/users" },
    { label: "Приглашения",  href: "/adminpanel/invites" },
    { label: "Ссылки",       href: "/adminpanel/shortlinks" },
    { label: "Инструкции",   href: "/adminpanel/instructions" },
    { label: "Настройки",    href: "/adminpanel/settings" },
  ];

  const rightItems: PillNavItem[] = [
    {
      label: "Открыть сайт",
      href: "/",
    },
    {
      label: "Выйти",
      prefix: <LogOut size={11} />,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(6,11,20,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-5 flex items-center h-14">
        <PillNav
          logoNode={<Logo size="sm" inverted />}
          logoHref="/adminpanel"
          items={navItems}
          rightItems={rightItems}
          onHamburgerClick={() => setMobileOpen((v) => !v)}
        />
      </div>

      {/* Mobile scrollable nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="admin-mobile"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex overflow-x-auto gap-0.5 px-3 py-2">
              {navItems.map((l) => (
                <Link
                  key={l.href}
                  href={l.href!}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    color: pathname === l.href || pathname.startsWith(l.href + "/") ? "white" : "rgba(255,255,255,0.55)",
                    background: pathname === l.href || pathname.startsWith(l.href + "/") ? "rgba(255,255,255,0.1)" : "transparent",
                  }}
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                <LogOut size={11} /> Выйти
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
