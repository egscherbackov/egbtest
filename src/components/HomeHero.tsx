"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Logo from "@/components/Logo";
import CountUp from "@/components/ui/CountUp";

const Prism = dynamic(() => import("@/components/ui/Prism"), { ssr: false });

interface HomeHeroProps {
  user: { id: string; name: string } | null;
  totalOrders: number;
}

export default function HomeHero({ user, totalOrders }: HomeHeroProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#060b14" }}
    >
      {/* Prism WebGL background */}
      <div className="absolute inset-0">
        <Prism
          animationType="rotate"
          timeScale={0.4}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={0.8}
          transparent
          suspendWhenOffscreen
          quality="low"
        />
      </div>

      {/* Gradient overlay — softens top and bottom edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #060b14 0%, transparent 20%, transparent 70%, #060b14 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <Logo size="xl" inverted />

        <p
          className="text-white/60"
          style={{ fontSize: "clamp(15px,2.5vw,18px)", fontWeight: 500, lineHeight: 1.6 }}
        >
          Профессиональный байинг сервис.<br className="hidden sm:block" />
          Покупаем товары с Amazon, eBay, Taobao и других зарубежных маркетплейсов.
        </p>

        {/* Counter */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="tabular-nums"
            style={{ fontSize: "clamp(52px,8vw,88px)", fontWeight: 600, color: "white", letterSpacing: "-3px", lineHeight: 1, fontFamily: "var(--font-nunito-sans), sans-serif" }}
          >
            <CountUp from={0} to={totalOrders} separator=" " duration={2.5} />
          </div>
          <p className="text-white/45 text-sm font-medium tracking-widest uppercase">
            заказов выполнено
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
          {user ? (
            <Link
              href="/instructions"
              className="px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "8px" }}
            >
              Личный кабинет
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "8px" }}
            >
              Войти в аккаунт
            </Link>
          )}
          <a
            href="https://t.me/egor6p"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-sm font-semibold transition-all hover:bg-white/10 active:scale-95"
            style={{ border: "1px solid rgba(65,161,207,0.5)", color: "var(--color-action-azure)", borderRadius: "8px" }}
          >
            Написать в Telegram
          </a>
        </div>
      </div>

    </section>
  );
}
