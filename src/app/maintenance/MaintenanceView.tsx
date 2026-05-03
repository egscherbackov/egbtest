"use client";

import { BackgroundLines } from "@/components/ui/background-lines";

export default function MaintenanceView({ text }: { text: string }) {
  return (
    <BackgroundLines className="fixed inset-0 !h-full flex items-center justify-center w-full flex-col !bg-black px-4 sm:px-8">
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
