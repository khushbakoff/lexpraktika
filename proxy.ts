import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Majburiy ro'yxatdan o'tish: kirmagan foydalanuvchi faqat kirish, maxfiylik va shartlar sahifalarini ko'ra oladi.
 * Server sozlanmagan bo'lsa (MONGODB_URI/SESSION_SECRET yo'q) bu tekshiruv o'chiq: ilova mahalliy rejimda ishlaydi.
 */
const PUBLIC = ["/kirish", "/maxfiylik", "/shartlar", "/api/auth", "/api/telegram"];

export async function proxy(req: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!process.env.MONGODB_URI || !secret || secret.length < 32) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();

  const token = req.cookies.get("lexsim_session")?.value;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
      return NextResponse.next();
    } catch {
      // muddati o'tgan yoki soxta token
    }
  }
  if (pathname.startsWith("/api/")) return Response.json({ error: "Avval tizimga kiring" }, { status: 401 });
  return NextResponse.redirect(new URL("/kirish", req.url));
}

// Statik fayllar (nuqtali yo'llar) va Next ichki yo'llari tekshirilmaydi
export const config = { matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"] };
