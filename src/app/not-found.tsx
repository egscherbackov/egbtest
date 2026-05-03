import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--color-night-sky)" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,129,192,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 404 number */}
        <p
          className="font-black select-none"
          style={{
            fontSize: "clamp(90px, 20vw, 180px)",
            lineHeight: 1,
            letterSpacing: "-0.06em",
            color: "rgba(255,255,255,0.04)",
            fontFamily: "'Nunito Sans', sans-serif",
            userSelect: "none",
          }}
        >
          404
        </p>

        {/* Logo */}
        <div className="mt-[-0.6em] mb-6">
          <span
            className="inline-flex items-baseline select-none"
            style={{ lineHeight: 1 }}
          >
            <span
              style={{
                fontSize: "clamp(32px, 6vw, 56px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                fontFamily: "'Nunito Sans', sans-serif",
              }}
            >
              egorbuyer
            </span>
            <span
              style={{
                fontSize: "clamp(32px, 6vw, 56px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0081c0",
                fontFamily: "'Nunito Sans', sans-serif",
              }}
            >
              .com
            </span>
          </span>
        </div>

        {/* Message */}
        <p
          className="mb-10"
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "clamp(14px, 2vw, 16px)",
            maxWidth: "340px",
            lineHeight: 1.6,
            fontFamily: "'Nunito Sans', sans-serif",
          }}
        >
          Страница не найдена. Возможно, ссылка устарела или адрес введён неверно.
        </p>

        {/* Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "#0081c0",
            color: "white",
            borderRadius: "10px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          На главную страницу
        </Link>
      </div>
    </div>
  );
}
