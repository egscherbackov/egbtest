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
      style={{ background: "#000000" }}
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
            "linear-gradient(to bottom, #000000 0%, rgba(0,0,0,0.35) 18%, rgba(0,0,0,0.25) 52%, rgba(0,0,0,0.45) 82%, #000000 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.15)" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 flex flex-col items-center gap-6 max-w-2xl mx-auto">
        <Logo size="xl" inverted />

        <p
          className="text-white"
          style={{
            fontSize: "clamp(15px,2.5vw,18px)",
            fontWeight: 600,
            lineHeight: 1.6,
            textShadow: "0 2px 18px rgba(0,0,0,0.85)",
          }}
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
          <p
            className="text-white text-sm font-semibold tracking-widest uppercase"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
          >
            заказов выполнено
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2">
          {user ? (
            <Link
              href="/instructions"
              className="px-6 py-3 text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #0081c0, #41a1cf)",
                color: "white",
                borderRadius: "10px",
                boxShadow: "0 14px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12) inset",
              }}
            >
              Личный кабинет
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-6 py-3 text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #0081c0, #41a1cf)",
                color: "white",
                borderRadius: "10px",
                boxShadow: "0 14px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12) inset",
              }}
            >
              Войти в аккаунт
            </Link>
          )}
          <a
            href="https://t.me/egorbuyercom"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 text-sm font-semibold transition-all hover:bg-white active:scale-95"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(255,255,255,0.85)",
              color: "#063a55",
              borderRadius: "10px",
              boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
            }}
          >
            Написать в Telegram
          </a>
        </div>
      </div>

    </section>
  );
}
