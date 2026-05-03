"use client";

import { usePathname } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/adminpanel/login";

  return (
    <>
      {!isLogin && <AdminNav adminUsername="admin" />}
      {children}
    </>
  );
}
