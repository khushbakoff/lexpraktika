import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Ilova serverdagi LexPraktika'ni ochadi (kabel va kompyuter kerak emas).
 * Mahalliy ishlab chiqish uchun: CAP_DEV=1 npx cap sync android (localhost:3000, `adb reverse tcp:3000 tcp:3000` bilan).
 * DIQQAT: server hozircha HTTP (domen va HTTPS yo'q). Haqiqiy foydalanuvchilar uchun domen va HTTPS kerak.
 */
const url = process.env.CAP_DEV ? "http://localhost:3000" : "http://193.180.213.14:3200";

const config: CapacitorConfig = {
  appId: "uz.lexsim.app",
  appName: "LexPraktika",
  webDir: "public",
  server: { url, cleartext: true },
  android: { backgroundColor: "#0a1022" },
};

export default config;
