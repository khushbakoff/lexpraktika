import { z } from "zod";
import { col, getDb } from "@/lib/server/db";
import { startSession } from "@/lib/server/session";
import { verifyInitData } from "@/lib/server/telegram-webapp";

const body = z.object({ initData: z.string().min(10).max(4000), accepted: z.boolean().default(false) });
const json = (data: unknown, status = 200) => Response.json(data, { status });

/**
 * Telegram Mini App ichida kirish: initData imzosi tekshiriladi, hisob topiladi yoki (rozilik bilan) yaratiladi.
 * Mavjud hisob rozilik so'ramaydi, yangi hisob uchun `accepted: true` kerak.
 */
export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return json({ error: "telegram-off" }, 503);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "bad-request" }, 400);

  const user = verifyInitData(parsed.data.initData, token);
  if (!user) return json({ error: "invalid" }, 401);

  const db = await getDb();
  const login = `tg:${user.id}`;
  const existing = await col.users(db).findOne({ login });
  if (existing) {
    await startSession(existing._id.toHexString());
    return json({ ok: true });
  }
  if (!parsed.data.accepted) return json({ error: "consent" }, 403);
  const res = await col.users(db).insertOne({
    login,
    fullName: user.name?.slice(0, 100) ?? null,
    role: "individual",
    passwordHash: "",
    interests: [],
    mustChangePassword: false,
    provider: "telegram",
    consentAt: new Date(),
    createdAt: new Date(),
  } as never);
  await startSession(res.insertedId.toHexString());
  return json({ ok: true, created: true });
}
