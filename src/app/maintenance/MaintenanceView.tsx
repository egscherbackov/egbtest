"use client";

import { BackgroundLines } from "@/components/ui/background-lines";
import ShinyText from "@/components/ui/ShinyText";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MaintenanceView({ text }: { text: string }) {
  const [accessMode, setAccessMode] = useState<"global" | "authorized" | "guest">("global");

  useEffect(() => {
    async function fetchMaintenance() {
      try {
        const res = await fetch("/api/maintenance-check");
        const data = await res.json();
        setAccessMode(data.accessMode || "global");
      } catch {
        setAccessMode("global");
      }
    }
    fetchMaintenance();
  }, []);

  return (
    <BackgroundLines className="fixed inset-0 !h-full flex items-center justify-center w-full flex-col !bg-black px-4 sm:px-8">
      {accessMode === "guest" && (
        <Link
          href="/login"
          className="fixed right-4 top-4 z-30 rounded-full px-3 py-2 text-xs font-semibold text-white/65 transition hover:text-white"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          Вход в аккаунт
        </Link>
      )}
      <h2
        className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-600 to-white font-sans font-bold tracking-tight relative z-20 leading-none"
        style={{ fontSize: "clamp(1.9rem, 9vw, 9rem)", paddingTop: "clamp(0.5rem, 3vh, 3rem)", paddingBottom: "clamp(0.5rem, 3vh, 3rem)" }}
      >
        EGORBUYER.COM
      </h2>
      <div className="relative z-20 mb-4">
        <ShinyText
          text="Совсем скоро"
          speed={3}
          delay={0}
          color="rgba(255,255,255,0.6)"
          shineColor="#ffffff"
          spread={120}
          direction="left"
          className="text-2xl md:text-4xl"
        />
      </div>
    </BackgroundLines>
  );
}
