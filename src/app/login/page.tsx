"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Suspense } from "react";

function LoginForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBanned = searchParams.get("banned") === "1";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) router.replace("/instructions"); })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    if (!welcomeName) return;
    const lines = [`Добро пожаловать,`, `${welcomeName}!`];
    const full = lines.join("\n");
    let i = 0;
    setTypedText("");
    intervalRef.current = setInterval(() => {
      i++;
      setTypedText(full.slice(0, i));
      if (i >= full.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          router.push("/instructions");
          router.refresh();
        }, 900);
      }
    }, 55);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [welcomeName, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Неверный код входа");
      } else {
        setWelcomeName(data.user.name);
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (welcomeName) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
        style={{ background: "var(--color-night-sky)" }}>
        <div className="mb-8 opacity-95">
          <Logo size="md" inverted />
        </div>
        <div className="text-center px-6">
          {typedText.split("\n").map((line, i) => (
            <p key={i}
              className={i === 0 ? "text-2xl font-light mb-1" : "text-4xl font-bold"}
              style={{ color: "white", fontFamily: "var(--font-nunito-sans), sans-serif" }}>
              {line}
              {i === typedText.split("\n").length - 1 && (
                <span className="inline-block w-0.5 h-8 ml-1 align-middle animate-pulse"
                  style={{ background: "rgba(255,255,255,0.7)" }} />
              )}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000000" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8 hover:opacity-80 transition-opacity duration-150">
          <Logo size="md" inverted />
        </Link>

        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <h1 className="text-center mb-2"
            style={{ fontSize: "28px", fontWeight: 500, letterSpacing: "-0.5px", color: "white", fontFamily: "var(--font-nunito-sans), sans-serif" }}>
            Вход
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
            Введите ваш код доступа
          </p>

          {isBanned && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium text-center"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#dc2626" }}>
              Ваш аккаунт был заблокирован администратором
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                Код входа
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                placeholder="XXXXXXXX"
                className="w-full px-4 py-3 text-base font-mono tracking-widest transition-all outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: "8px",
                  color: "white",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = error ? "#ef4444" : "var(--color-action-azure)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.15)"; }}
                autoFocus
                autoComplete="off"
              />
              {error && <p className="mt-1.5 text-xs" style={{ color: "#ef4444" }}>{error}</p>}
            </div>

            <button type="submit" disabled={loading || !code.trim()}
              className="w-full py-3 text-base font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "8px" }}>
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Нет кода?{" "}
              <a href="https://t.me/egorbuyer" target="_blank" rel="noopener noreferrer"
                className="font-medium hover:opacity-80" style={{ color: "var(--color-cofounder-blue)" }}>
                Написать администратору
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
