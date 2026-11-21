import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Parol hash: scrypt + tasodifiy tuz. Format: scrypt$<tuz hex>$<hash hex>. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [alg, saltHex, hashHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

/** Login har doim kichik harfda va bo'shliqsiz saqlanadi. */
export function normalizeLogin(login: string): string {
  return login.trim().toLowerCase();
}
