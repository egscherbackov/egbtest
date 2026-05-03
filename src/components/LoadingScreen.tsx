"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("site_loaded")) {
      setHidden(true);
      return;
    }
    sessionStorage.setItem("site_loaded", "1");
    const timer = setTimeout(() => setHidden(true), 3100);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="animate-loading-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "var(--color-night-sky)" }}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="animate-loading-text" style={{ opacity: 0 }}>
          <Logo size="xl" inverted />
        </div>

        <div className="w-48 h-[3px] rounded-full overflow-hidden bg-white/10">
          <div
            className="h-full rounded-full animate-loading-bar"
            style={{
              background:
                "linear-gradient(90deg, var(--color-cofounder-blue), var(--color-action-azure))",
            }}
          />
        </div>

      </div>
    </div>
  );
}
