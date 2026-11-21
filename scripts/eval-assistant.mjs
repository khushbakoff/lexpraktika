// Huquqiy yordamchi aniqligini o'lchaydi. To'g'ri javob = vaziyat JSON'idagi manbalar (Lex.uz bilan tekshirilgan).
// Savol = mijozning ochilish gapi. Ishlatish: SESSION_COOKIE=<lexsim_session> node scripts/eval-assistant.mjs [baseUrl] [N]
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] || "http://localhost:3000";
const N = Number(process.argv[3] || 20);
const cookie = process.env.SESSION_COOKIE;
if (!cookie) throw new Error("SESSION_COOKIE kerak");

const files = fs.readdirSync("content/scenarios").filter((f) => f.endsWith(".json")).sort();
const byArea = new Map();
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join("content/scenarios", f), "utf-8"));
  if (!byArea.has(s.areaId)) byArea.set(s.areaId, []);
  byArea.get(s.areaId).push(s);
}
// Sohalar bo'yicha navbat bilan N ta vaziyat
const picked = [];
for (let i = 0; picked.length < N; i++) {
  let any = false;
  for (const list of byArea.values()) if (list[i] && picked.length < N) { picked.push(list[i]); any = true; }
  if (!any) break;
}

const num = (a) => (a.match(/^(\d+[¹²³]?)-modda/) || [])[1];
const sources = (o, acc = new Set()) => {
  if (Array.isArray(o)) o.forEach((x) => sources(x, acc));
  else if (o && typeof o === "object") {
    if (o.url && o.article && num(o.article)) acc.add(`${o.url}|${num(o.article)}`);
    Object.values(o).forEach((v) => sources(v, acc));
  }
  return acc;
};

let candHit = 0, aiHit = 0, aiAnswered = 0, rows = [];
for (const s of picked) {
  const q = s.client.openingLine;
  const want = sources(s);
  const body = { question: "Boshqa tafsilot yo'q.", history: [{ role: "user", text: q }, { role: "assistant", text: "Aniqlashtiruvchi savollar", kind: "ask" }] };
  
  let r;
  try {
    r = await (await fetch(`${base}/api/lex-ask`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: `lexsim_session=${cookie}`, ...(process.env.NO_AI ? { "x-lexpraktika-no-ai": "1" } : {}) }, body: JSON.stringify(body) })).json();
  } catch (e) { rows.push({ id: s.id, error: String(e) }); continue; }
  const cands = (r.candidates || []).map((c) => `${c.url}|${num(c.article)}`);
  const inCand = cands.some((c) => want.has(c));
  const matched = (r.ai?.matches || []).map((m) => r.candidates[m.ref]).filter(Boolean).map((c) => `${c.url}|${num(c.article)}`);
  const inAi = matched.some((c) => want.has(c));
  if (inCand) candHit++;
  if (r.ai) { aiAnswered++; if (inAi) aiHit++; }
  rows.push({ id: s.id, q: q.slice(0, 60), want: [...want].length, inCand, ai: r.ai ? (inAi ? "TOGRI" : r.ai.notFound ? "topilmadi" : "NOTOGRI") : (r.aiError || "AI yo'q") });
  console.log(rows.at(-1));
  await new Promise((res) => setTimeout(res, process.env.NO_AI ? 2300 : 11000)); // tekin tarif limiti
}
console.log(JSON.stringify({ total: picked.length, qidiruvdaBor: candHit, aiJavob: aiAnswered, aiTogri: aiHit }));
