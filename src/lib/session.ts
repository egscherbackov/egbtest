import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  userName?: string;
  isAdmin?: boolean;
  adminUsername?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || "fallback-secret-min-32-chars-long!!",
  cookieName: "egorbuyer_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return { id: session.userId, name: session.userName };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getCurrentAdmin() {
  const session = await getSession();
  if (!session.isAdmin) return null;
  return { username: session.adminUsername };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}
