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

type MaintenanceState = {
  maintenance: boolean;
  accessMode: "global" | "authorized";
};

// In-process maintenance cache (10s TTL)
const _mc: MaintenanceState & { t: number } = { maintenance: false, accessMode: "global", t: 0 };

async function getMaintenanceState(origin: string): Promise<MaintenanceState> {
  const now = Date.now();
  if (now - _mc.t < 10_000) return { maintenance: _mc.maintenance, accessMode: _mc.accessMode };
  try {
    const r = await fetch(`${origin}/api/maintenance-check`, {
      headers: { "x-middleware-internal": "1" },
    });
    if (r.ok) {
      const d = await r.json();
      _mc.maintenance = !!d.maintenance;
      _mc.accessMode = d.accessMode === "authorized" ? "authorized" : "global";
      _mc.t = now;
    }
  } catch { /* keep stale value */ }
  return { maintenance: _mc.maintenance, accessMode: _mc.accessMode };
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
    const maintenanceState = await getMaintenanceState(origin);

    if (maintenanceState.maintenance) {
      const response = NextResponse.next();
      const session = await getIronSession<SessionData>(request, response, sessionOptions);
      const allowedInAuthorizedMode =
        maintenanceState.accessMode === "authorized" &&
        (pathname === "/login" || pathname.startsWith("/invite") || !!session.userId);

      if (!onMaintPage && !allowedInAuthorizedMode) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }

      if (onMaintPage && allowedInAuthorizedMode) {
        return NextResponse.redirect(new URL(session.userId ? "/" : "/login", request.url));
      }

      return response;
    }
    if (!maintenanceState.maintenance && onMaintPage) {
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
