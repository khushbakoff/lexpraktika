// Demo ma'lumot: universitet, tashkilotlar, 10 ta talaba, natijalar, nomzodlar.
// Ishga tushirish: npm run seed   (MONGODB_URI, MONGODB_DB .env.local dan olinadi)
// Hamma ism va ma'lumotlar to'qima (demo, "(demo)" belgisi bilan). Qayta ishga tushirsa parollar yangilanadi.
import { randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MongoClient, type ObjectId } from "mongodb";
import { hashPassword } from "../lib/password.ts";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI .env.local da bo'lishi kerak");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "lexsim";
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const pw = () => Array.from({ length: 10 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const scenario = JSON.parse(
  readFileSync(join(import.meta.dirname, "..", "content", "scenarios", "mehnat-ish-haqi.json"), "utf8"),
) as { id: string; steps: { id: string; points: number; type: string; correct?: string }[] };

type Cred = { role: string; name: string; login: string; password: string };
const creds: Cred[] = [];

async function main() {
  const client = await new MongoClient(uri!, { serverSelectionTimeoutMS: 5000 }).connect();
  const db = client.db(dbName);
  const users = db.collection("users");
  await users.createIndex({ login: 1 }, { unique: true });
  await db.collection("stepResults").createIndex({ userId: 1, scenarioId: 1, stepId: 1 }, { unique: true });
  await db.collection("nominations").createIndex({ studentId: 1, organizationId: 1 }, { unique: true });
  await db.collection("groups").createIndex({ universityId: 1, name: 1 }, { unique: true });
  await db.collection("universities").createIndex({ name: 1 }, { unique: true });
  await db.collection("organizations").createIndex({ name: 1 }, { unique: true });

  const byName = async (coll: string, name: string, extra: object = {}): Promise<ObjectId> => {
    const r = await db
      .collection(coll)
      .findOneAndUpdate({ name }, { $setOnInsert: { name, createdAt: new Date(), ...extra } }, { upsert: true, returnDocument: "after" });
    return r!._id as ObjectId;
  };

  const uniId = await byName("universities", "Namuna Yuridik Universiteti (demo)");
  const firmId = await byName("organizations", "Namuna Advokatlik Firmasi (demo)", { kind: "Advokatlik" });
  const bankId = await byName("organizations", "Namuna Bank, yuridik bo'lim (demo)", { kind: "Bank" });

  const groups: Record<string, ObjectId> = {};
  for (const name of ["301-guruh", "302-guruh"]) {
    const r = await db
      .collection("groups")
      .findOneAndUpdate({ universityId: uniId, name }, { $setOnInsert: { universityId: uniId, name } }, { upsert: true, returnDocument: "after" });
    groups[name] = r!._id as ObjectId;
  }

  const makeUser = async (login: string, fullName: string, role: string, fields: Record<string, unknown>): Promise<ObjectId> => {
    const password = pw();
    const r = await users.findOneAndUpdate(
      { login },
      {
        $set: { fullName, role, passwordHash: hashPassword(password), mustChangePassword: false, ...fields },
        $setOnInsert: { login, createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );
    creds.push({ role, name: fullName, login, password });
    return r!._id as ObjectId;
  };

  await makeUser("demo.universitet", "Universitet admini (demo)", "university_admin", { universityId: uniId, interests: [] });
  await makeUser("demo.firma", "Firma xodimi (demo)", "org_member", { organizationId: firmId, interests: [] });
  await makeUser("demo.bank", "Bank xodimi (demo)", "org_member", { organizationId: bankId, interests: [] });

  // [ism, guruh, yo'nalish, sifat (0..1), qiziqishlar]
  const students: [string, string, string, number, string[]][] = [
    ["Aziz Karimov", "301-guruh", "advokat", 0.95, ["mehnat", "fuqarolik"]],
    ["Madina Yusupova", "301-guruh", "korxona", 0.9, ["mehnat", "tadbirkorlik"]],
    ["Sardor Rahimov", "301-guruh", "advokat", 0.82, ["fuqarolik", "oila"]],
    ["Dilnoza Aliyeva", "301-guruh", "notarius", 0.78, ["fuqarolik"]],
    ["Jasur Tursunov", "301-guruh", "davlat", 0.65, ["mehnat"]],
    ["Nilufar Ergasheva", "302-guruh", "advokat", 0.55, ["oila", "mehnat"]],
    ["Bobur Saidov", "302-guruh", "huquq-tartibot", 0.4, ["jinoyat"]],
    ["Gulnora Nazarova", "302-guruh", "korxona", 0.7, ["shaxsiy-malumot", "tadbirkorlik"]],
    ["Otabek Mirzayev", "302-guruh", "umumiy", 0.3, ["mehnat"]],
    ["Zarina Qodirova", "302-guruh", "sudya", 0.88, ["fuqarolik", "jinoyat"]],
  ];

  const ids: ObjectId[] = [];
  for (let i = 0; i < students.length; i++) {
    const [name, group, track, q, interests] = students[i];
    const id = await makeUser(`demo.talaba${i + 1}`, `${name} (demo)`, "student", {
      universityId: uniId,
      groupId: groups[group],
      trackId: track,
      interests,
      level: q > 0.8 ? "ilgor" : q > 0.5 ? "orta" : "boshlovchi",
      plan: "pro",
      contact: `+998 90 000 00 ${String(i + 1).padStart(2, "0")}`,
    });
    ids.push(id);
    for (const st of scenario.steps) {
      const ungraded = st.type === "deadline-pick" && !st.correct;
      await db.collection("stepResults").updateOne(
        { userId: id, scenarioId: scenario.id, stepId: st.id },
        {
          $set: {
            score: ungraded ? 0 : Math.round(st.points * Math.min(1, Math.max(0, q + randomInt(-10, 11) / 100))),
            max: ungraded ? 0 : st.points,
            graded: !ungraded,
            answer: null,
            feedback: [],
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
  }

  // Nomzodlar: har holat uchun bittadan
  const nom = async (idx: number, organizationId: ObjectId, status: string, note: string) => {
    await db.collection("nominations").deleteOne({ studentId: ids[idx], organizationId });
    await db.collection("nominations").insertOne({
      studentId: ids[idx], universityId: uniId, organizationId, nominatedBy: ids[idx], status, note,
      createdAt: new Date(), updatedAt: new Date(),
    });
  };
  await nom(0, firmId, "consented", "Mehnat nizolari bo'yicha eng yuqori natija");
  await nom(1, firmId, "invited", "Korxona huquqi yo'nalishi, 90% natija");
  await nom(9, firmId, "accepted", "Fuqarolik ishlari bo'yicha kuchli");
  await nom(2, bankId, "pending", "Shartnoma huquqi bo'yicha yaxshi natija");

  console.log(`\nDEMO HISOBLAR (baza: ${dbName}; parollar faqat hozir ko'rinadi):\n`);
  for (const c of creds) console.log(`${c.role.padEnd(17)} ${c.login.padEnd(18)} ${c.password}   ${c.name}`);
  console.log("\nTayyor.");
  await client.close();
}

main().catch((e) => {
  console.error("Seed xatosi:", e.message);
  process.exit(1);
});
