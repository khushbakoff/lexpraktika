import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { redactPii } from "./redact";

/** Model: AI_MODEL env bilan almashtiriladi. Kalit faqat serverda (AI_API_KEY). */
export const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
/** AI_MODEL vergul bilan bir nechta model bo'lishi mumkin: biri kunlik limitga yetsa (429) keyingisi sinaladi. */
const MODELS = MODEL.split(",").map((m) => m.trim()).filter(Boolean);

/**
 * AI_BASE_URL berilsa, OpenAI formatiga mos xizmat ishlatiladi (masalan Groq: https://api.groq.com/openai/v1),
 * aks holda Anthropic. Kalit ikkala holatda ham AI_API_KEY va faqat serverda turadi.
 */
const BASE_URL = process.env.AI_BASE_URL?.replace(/\/$/, "");

let client: Anthropic | null = null;
const getAnthropic = () => {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  client ??= new Anthropic({ apiKey, maxRetries: 1, timeout: 60_000 });
  return client;
};
export const isAiConfigured = () => Boolean(process.env.AI_API_KEY);

export type JsonCall = {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  schema: Record<string, unknown>;
  maxTokens: number;
};

/** Tuzilgan (JSON sxemali) javob oladi. Qaytgan matnni chaqiruvchi JSON.parse qiladi va tekshiradi. */
export async function completeJson(call: JsonCall): Promise<{ text: string; refused: boolean }> {
  const key = process.env.AI_API_KEY;
  if (!key) throw new ChatError("AI sozlanmagan", 503);
  // Tashqi xizmatga chiqishdan oldin foydalanuvchi matnidagi shaxsiy ma'lumot yashiriladi (barcha AI chaqiruvlari shu yerdan o'tadi)
  call = { ...call, messages: call.messages.map((m) => ({ ...m, content: redactPii(m.content) })) };

  if (BASE_URL) {
    const send = (model: string) => fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: call.system }, ...call.messages],
        // Fikrlovchi modellarda fikrlash tokenlari ham hisobga olinadi
        max_tokens: call.maxTokens + 2000,
        temperature: 0.3,
        ...(model.includes("gpt-oss") ? { reasoning_effort: "low" } : {}),
        response_format: { type: "json_schema", json_schema: { name: "out", schema: call.schema } },
      }),
    });
    let res = await send(MODELS[0]);
    // Limitga yetgan model o'rniga ro'yxatdagi keyingisi sinaladi
    for (let m = 1; res.status === 429 && m < MODELS.length; m++) res = await send(MODELS[m]);
    // Tekin tarifdagi daqiqalik limit: qisqa kutish bo'lsa bir marta qayta urinadi
    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after"));
      if (Number.isFinite(wait) && wait > 0 && wait <= 15) {
        await new Promise((r) => setTimeout(r, wait * 1000 + 300));
        res = await send(MODELS[0]);
      }
    }
    if (!res.ok) {
      console.error("[ai]", res.status, (await res.text()).slice(0, 300));
      if (res.status === 429) throw new ChatError("AI hozir band, birozdan keyin urinib ko'ring", 429);
      throw new ChatError("AI xizmatida xato", 502);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new ChatError("AI bo'sh javob qaytardi");
    return { text, refused: false };
  }

  const c = getAnthropic();
  if (!c) throw new ChatError("AI sozlanmagan", 503);
  const res = await c.beta.messages.create({
    model: MODELS[0],
    max_tokens: call.maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: call.system,
    messages: call.messages,
    output_config: { effort: "low", format: { type: "json_schema", schema: call.schema } },
  });
  const text = res.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text ?? "";
  return { text, refused: res.stop_reason === "refusal" };
}

export class ChatError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

/** SDK xatosini foydalanuvchiga tushunarli ChatError'ga aylantiradi. */
export function mapAiError(e: unknown, tag: string): ChatError {
  if (e instanceof ChatError) return e;
  if (e instanceof Anthropic.APIError) console.error(`[${tag}]`, e.status, e.message.slice(0, 300));
  if (e instanceof Anthropic.RateLimitError) return new ChatError("AI hozir band, birozdan keyin urinib ko'ring", 429);
  if (e instanceof Anthropic.APIConnectionError) return new ChatError("AI bilan aloqa yo'q", 503);
  if (e instanceof Anthropic.APIError) return new ChatError("AI xizmatida xato", 502);
  return new ChatError("AI javobini o'qib bo'lmadi");
}

export { Anthropic };
