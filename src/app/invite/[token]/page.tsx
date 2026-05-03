"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Logo from "@/components/Logo";
import { Copy, Check, ArrowRight } from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "rgba(255,255,255,0.88)",
};

function isTelegram(value: string): boolean {
  const v = value.trim();
  return v.startsWith("@") || /[a-zA-Z]/.test(v);
}

function validateContact(value: string): string | null {
  const v = value.trim();
  if (!v) return "Введите телефон или Telegram";
  if (isTelegram(v)) {
    const username = v.startsWith("@") ? v.slice(1) : v;
    if (username.length < 5) return "Telegram: минимум 5 символов";
    if (username.length > 32) return "Telegram username слишком длинный";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Только буквы, цифры и _";
    return null;
  }
  const digits = v.replace(/\D/g, "");
  if (digits.length < 7) return "Номер телефона слишком короткий (минимум 7 цифр)";
  if (digits.length > 15) return "Номер телефона слишком длинный (максимум 15 цифр)";
  return null;
}

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [valid, setValid] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [registered, setRegistered] = useState<{ name: string; loginCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) router.replace("/instructions"); })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((d) => setValid(d.valid))
      .catch(() => setValid(false));
  }, [token]);

  function handleContactChange(v: string) {
    // Allow only digits, English letters, @, +, spaces, hyphens, parentheses
    const filtered = v.replace(/[^a-zA-Z0-9@+\-() ]/g, "");
    setContact(filtered);
    if (contactError) setContactError(validateContact(filtered));
  }

  const copyCode = useCallback(() => {
    if (!registered) return;
    const text = registered.loginCode;

    const finish = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(finish).catch(() => {
        // Fallback: textarea execCommand
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        finish();
      });
    } else {
      // Clipboard API unavailable — direct fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      finish();
    }
  }, [registered]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateContact(contact);
    if (err) { setContactError(err); return; }
    if (!name.trim()) return;
    setLoading(true);
    try {
      // Normalise: if detected as Telegram and missing @, add it
      const raw = contact.trim();
      const normalized = isTelegram(raw) && !raw.startsWith("@") ? "@" + raw : raw;
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phoneOrTelegram: normalized }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Ошибка");
      } else {
        setRegistered({ name: data.user.name, loginCode: data.user.loginCode });
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }

  if (valid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000000" }}>
        <LoaderOne size="lg" style={{ color: "var(--color-action-azure)" }} />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000000" }}>
        <div className="text-center rounded-2xl p-10 max-w-sm w-full"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.15)" }}>
            <span className="text-2xl">⚠</span>
          </div>
          <h1 className="font-display mb-3" style={{ fontSize: "22px", fontWeight: 600, color: "white" }}>
            Ссылка недействительна
          </h1>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
            Эта ссылка уже была использована или отключена.
          </p>
          <Link href="/" className="inline-block px-5 py-2.5 text-sm font-medium hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0081c0, #41a1cf)", color: "white", borderRadius: "10px" }}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000000" }}>
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Logo size="md" inverted />
          </div>
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(65,161,207,0.15)" }}>
              <Check size={28} style={{ color: "var(--color-cofounder-blue)" }} />
            </div>
            <h1 className="font-display mb-1" style={{ fontSize: "22px", fontWeight: 600, color: "white" }}>
              Аккаунт создан!
            </h1>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
              Добро пожаловать, <strong style={{ color: "white" }}>{registered.name}</strong>!
            </p>

            <div className="rounded-xl p-4 mb-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                Ваш код для входа
              </p>
              <p className="text-2xl font-mono font-bold tracking-widest mb-3" style={{ color: "white" }}>
                {registered.loginCode}
              </p>
              <button onClick={copyCode}
                className="flex items-center gap-2 mx-auto px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-90"
                style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(65,161,207,0.15)", color: copied ? "#22c55e" : "var(--color-cofounder-blue)" }}>
                {copied ? <><Check size={14} /> Скопировано!</> : <><Copy size={14} /> Скопировать код</>}
              </button>
            </div>
            <p className="text-xs mb-6" style={{ color: "rgba(239,68,68,0.85)" }}>
              ⚠ Сохраните этот код — он нужен для входа в аккаунт
            </p>

            <button onClick={() => router.push("/instructions")}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg, #0081c0, #41a1cf)", color: "white", borderRadius: "10px" }}>
              Перейти к инструкциям
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000000" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8 hover:opacity-80 transition-opacity">
          <Logo size="md" inverted />
        </Link>

        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
          <h1 className="font-display text-center mb-2"
            style={{ fontSize: "26px", fontWeight: 500, letterSpacing: "-0.4px", color: "white" }}>
            Активация аккаунта
          </h1>
          <p className="text-center text-sm mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
            Заполните данные для регистрации
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                Имя
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя" required
                className="w-full px-4 py-3 text-sm transition-all outline-none" style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(65,161,207,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                Телефон или Telegram
              </label>
              <input type="text" value={contact} onChange={(e) => handleContactChange(e.target.value)}
                placeholder="+7 999 123 45 67 или @username" required
                className="w-full px-4 py-3 text-sm transition-all outline-none"
                style={{ ...inputStyle, borderColor: contactError ? "#ef4444" : "rgba(255,255,255,0.12)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = contactError ? "#ef4444" : "rgba(65,161,207,0.5)"; }}
                onBlur={(e) => {
                  const err = validateContact(e.target.value);
                  setContactError(err);
                  e.currentTarget.style.borderColor = err ? "#ef4444" : "rgba(255,255,255,0.12)";
                }} />
              <div className="mt-1.5 flex items-center justify-between">
                {contactError
                  ? <p className="text-xs" style={{ color: "#ef4444" }}>{contactError}</p>
                  : <span />}
                {contact.trim() && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={isTelegram(contact)
                      ? { background: "rgba(65,161,207,0.12)", color: "var(--color-cofounder-blue)" }
                      : { background: "rgba(34,197,94,0.1)", color: "#16a34a" }}
                  >
                    {isTelegram(contact) ? "Telegram" : "Телефон"}
                  </span>
                )}
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label
              className="flex items-start gap-3 cursor-pointer select-none mt-1"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              <span
                className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all"
                style={{
                  border: confirmed ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                  background: confirmed ? "var(--color-cofounder-blue)" : "rgba(255,255,255,0.06)",
                }}
              >
                {confirmed && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm leading-snug">
                Подтверждаю правильность введённых данных
              </span>
            </label>

            <button type="submit" disabled={loading || !name.trim() || !contact.trim() || !confirmed}
              className="w-full py-3 text-base font-medium transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #0081c0, #41a1cf)", color: "white", borderRadius: "10px", boxShadow: "0 10px 24px rgba(0,0,0,0.35)" }}>
              {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
