// Telegram botni sozlaydi: webhook (/start), pastdagi menyu tugmasi (Mini App), tavsif.
// Ishlatish (serverda): node --env-file=/var/www/lexsim/.env.production scripts/telegram-setup.mjs
import { createHmac } from "node:crypto";

const token = process.env.TELEGRAM_BOT_TOKEN;
const app = process.env.APP_URL;
if (!token || !app || !process.env.SESSION_SECRET) throw new Error("TELEGRAM_BOT_TOKEN, APP_URL va SESSION_SECRET kerak");
const secret = createHmac("sha256", process.env.SESSION_SECRET).update("telegram-webhook").digest("hex").slice(0, 48);

const call = async (method, body) => {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  console.log(method, d.ok ? "ok" : `XATO: ${d.description}`);
};

await call("setWebhook", { url: `${app}/api/telegram/webhook`, secret_token: secret, allowed_updates: ["message"], drop_pending_updates: true });
await call("setChatMenuButton", { menu_button: { type: "web_app", text: "LexPraktika", web_app: { url: app } } });
await call("setMyCommands", { commands: [{ command: "start", description: "Ilovani ochish" }] });
await call("setMyShortDescription", { short_description: "Yuridik amaliyot trenajyori: real vaziyatlar va Lex.uz moddalari." });
await call("setMyDescription", { description: "LexPraktika: huquq talabalari uchun amaliyot trenajyori. Mijoz bilan suhbat, hujjatdagi xatoni topish va Lex.uz qonun moddalarini topuvchi yordamchi. Ilovani ochish uchun pastdagi tugmani bosing." });
