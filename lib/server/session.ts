import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "lexsim_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 kun

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET kamida 32 belgi bo'lishi kerak");
  return new TextEncoder().encode(s);
}

export async function startSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    // HTTPS ostida COOKIE_SECURE=true: cookie Telegram Mini App (iframe) ichida ham ishlashi uchun SameSite=None
    sameSite: process.env.COOKIE_SECURE === "true" ? "none" : "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.COOKIE_SECURE === "true",
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Cookie'dagi tokenni tekshirib, foydalanuvchi id'sini qaytaradi. */
export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
