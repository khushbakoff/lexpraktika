import "server-only";
import { randomInt } from "node:crypto";

const MAP: Record<string, string> = { "o'": "o", "g'": "g", "oʻ": "o", "gʻ": "g", "ʼ": "", "'": "", "`": "" };

/** "Aziz Karimov" -> "aziz.karimov" (faqat lotin harf, raqam, nuqta). */
export function loginBase(fullName: string): string {
  let s = fullName.toLowerCase().trim();
  for (const [k, v] of Object.entries(MAP)) s = s.split(k).join(v);
  s = s.replace(/[^a-z0-9\s.]/g, "").replace(/\s+/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "");
  return (s || "talaba").slice(0, 24);
}

export function randomSuffix(): string {
  return String(randomInt(10, 100));
}

// Chalkashtiradigan belgilarsiz (0/O, 1/l/I)
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomPassword(length = 10): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
