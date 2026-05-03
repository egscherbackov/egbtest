"use client";

import { BackgroundLines } from "@/components/ui/background-lines";
import Link from "next/link";

export default function MaintenanceView({ text }: { text: string }) {
  return (
    <BackgroundLines className="fixed inset-0 !h-full flex items-center justify-center w-full flex-col !bg-black px-4 sm:px-8">
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
      <h2
        className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-600 to-white font-sans font-bold tracking-tight relative z-20 leading-none"
        style={{ fontSize: "clamp(1.9rem, 9vw, 9rem)", paddingTop: "clamp(0.5rem, 3vh, 3rem)", paddingBottom: "clamp(0.5rem, 3vh, 3rem)" }}
      >
        EGORBUYER.COM
      </h2>
      {text && (
        <p
          className="mx-auto text-neutral-400 text-center relative z-20 px-4"
          style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)", maxWidth: "clamp(280px, 55vw, 640px)", lineHeight: 1.65 }}
        >
          {text}
        </p>
      )}
    </BackgroundLines>
  );
}
