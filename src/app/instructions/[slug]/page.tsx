"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoaderOne } from "@/components/ui/loader";

interface Step {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string | null;
  stepOrder: number;
}

interface Category {
  id: string;
  title: string;
  slug: string;
  steps: Step[];
}

export default function InstructionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
        else router.push("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/instructions/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => {
        setCategory(d.category);
        setLoading(false);
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "view_instruction", meta: slug }),
        });
      })
      .catch(() => router.push("/instructions"));
  }, [slug, user, router]);

  // Keyboard arrow navigation
  useEffect(() => {
    if (!category) return;
    const steps = category.steps;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        if (currentStep < steps.length - 1) {
          setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
        }
      }
      if (e.key === "ArrowLeft") {
        if (currentStep > 0) {
          setCurrentStep((s) => Math.max(0, s - 1));
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [category, currentStep]);

  if (loading || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000000" }}>
        <LoaderOne size="lg" style={{ color: "var(--color-action-azure)" }} />
      </div>
    );
  }

  const step = category.steps[currentStep];
  const total = category.steps.length;
  const progress = ((currentStep + 1) / total) * 100;

  return (
    <>
      <Header user={user} />
      <main
        className="pt-14 flex flex-col min-h-screen overflow-y-auto"
        style={{ background: "#000000" }}
      >
        <div className="flex-1 flex flex-col md:min-h-0 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 pb-24 md:pb-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <Link
              href="/instructions"
              className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Инструкции
            </Link>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>/</span>
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
              {category.title}
            </span>
          </div>

          {/* Progress */}
          <div className="mb-6 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                Шаг {currentStep + 1} из {total}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--color-cofounder-blue)" }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--color-cofounder-blue), var(--color-action-azure))",
                }}
              />
            </div>
          </div>

          {/* Step Card — fills remaining space on desktop, scrollable inside */}
          <div
            className="rounded-2xl overflow-hidden mb-6 md:flex-1 md:min-h-0 md:flex md:flex-col"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            {step.imageUrl && (
              <div
                className="w-full aspect-video shrink-0 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <img
                  src={step.imageUrl}
                  alt={step.imageAlt || step.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="p-6 sm:p-8 md:overflow-y-auto">
              <h2
                className="font-display mb-4"
                style={{ fontSize: "22px", fontWeight: 500, color: "white", letterSpacing: "-0.3px" }}
              >
                {step.title}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.7 }}>
                {step.description}
              </p>
            </div>
          </div>

          {/* Navigation — always at bottom on desktop, fixed on mobile */}
          <div className="shrink-0 md:static fixed bottom-0 left-0 right-0 px-4 sm:px-6 py-3 md:py-0"
               style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all hover:opacity-80 disabled:opacity-30"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                  borderRadius: "4px",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <div className="flex gap-1.5">
                {category.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === currentStep ? "20px" : "8px",
                      height: "8px",
                      background:
                        i === currentStep
                          ? "var(--color-cofounder-blue)"
                          : i < currentStep
                          ? "var(--color-action-azure)"
                          : "rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>

              {currentStep < total - 1 ? (
                <button
                  onClick={() => setCurrentStep((s) => Math.min(total - 1, s + 1))}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "4px" }}
                >
                  Далее
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <Link
                  href="/instructions"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90"
                  style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "4px" }}
                >
                  Готово
                </Link>
              )}
            </div>

            {/* Keyboard hint — desktop only */}
            <div className="hidden md:flex items-center justify-center gap-2 mt-3 pb-2 select-none">
              <kbd
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
              >
                ←
              </kbd>
              <kbd
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}
              >
                →
              </kbd>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                стрелки для навигации по шагам
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <a
        href="https://t.me/egor6p"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium shadow-lg hover:opacity-90 transition-all z-40"
        style={{ background: "var(--color-cofounder-blue)", color: "white" }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
        </svg>
        <span className="hidden sm:block">Помощь</span>
      </a>
    </>
  );
}
