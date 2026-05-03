import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer
      className="py-8 px-4 sm:px-6"
      style={{
        background: "#000000",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size="sm" inverted />
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
          © 2026 EGORBUYER.COM. Все права защищены.
        </p>
        <a
          href="https://t.me/egorbuyercom"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #0088cc, #00aaff)",
            color: "white",
            boxShadow: "0 4px 14px rgba(0,136,204,0.3)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.534-1.544 1.006-.824 1.23-.824 1.23-.824 1.23-.168.28.024.536.29.536.266 0 2.815 1.274 3.06 1.636.245.362.532.965.532 1.636 0 1.908-1.418 3.9-3.636 3.9-3.636 0-4.49-2.892-4.49-6.29 0-3.398 2.732-6.29 6.29-6.29 3.558 0 6.29 2.892 6.29 6.29z"/>
          </svg>
          Telegram
        </a>
      </div>
    </footer>
  );
}
