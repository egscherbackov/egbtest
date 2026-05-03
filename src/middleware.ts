import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/session";

const sessionOptions = {
  password: process.env.SESSION_SECRET || "fallback-secret-min-32-chars-long!!",
  cookieName: "egorbuyer_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

// In-process maintenance cache (10s TTL)
const _mc: { v: boolean; t: number } = { v: false, t: 0 };

async function isMaintenanceOn(origin: string): Promise<boolean> {
  const now = Date.now();
  if (now - _mc.t < 10_000) return _mc.v;
  try {
    const r = await fetch(`${origin}/api/maintenance-check`, {
      headers: { "x-middleware-internal": "1" },
    });
    if (r.ok) {
      const d = await r.json();
      _mc.v = !!d.maintenance;
      _mc.t = now;
    }
  } catch { /* keep stale value */ }
  return _mc.v;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.nextUrl.origin;

  // ── Admin panel ─────────────────────────────────────────────
  if (pathname.startsWith("/adminpanel") && pathname !== "/adminpanel/login") {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/adminpanel/login", request.url));
    }
    return response;
  }

  // ── Public / user routes — maintenance check ────────────────
  if (!pathname.startsWith("/adminpanel") && !pathname.startsWith("/api")) {
    const onMaintPage = pathname === "/maintenance";
    const maintenance = await isMaintenanceOn(origin);

    if (maintenance && !onMaintPage) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    if (!maintenance && onMaintPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── Instructions — require auth ──────────────────────────────
  if (pathname.startsWith("/instructions")) {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    if (!session.userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/adminpanel/:path*",
    "/instructions/:path*",
    "/maintenance",
    "/",
    "/login",
    "/invite/:path*",
  ],
};
