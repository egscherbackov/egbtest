"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BanGuard() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.banned || !data.user) {
          router.replace("/login?banned=1");
        }
      } catch {
        // ignore network errors
      }
    };

    const interval = setInterval(check, 20_000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
