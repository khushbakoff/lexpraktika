import "server-only";
import { MongoClient, ObjectId, type Collection, type Db } from "mongodb";

export type Role = "individual" | "student" | "university_admin" | "org_member" | "platform_admin";

export type UserDoc = {
  _id: ObjectId;
  login: string;
  fullName: string | null;
  role: Role;
  passwordHash: string;
  universityId?: ObjectId;
  organizationId?: ObjectId;
  groupId?: ObjectId;
  trackId?: string;
  employerId?: string;
  /** Kirish usuli: parol (universitet/email) yoki Telegram. */
  provider?: "password" | "telegram";
  email?: string;
  /** Foydalanish shartlari va maxfiylik siyosatiga rozilik vaqti. */
  consentAt?: Date;
  /** Tarif: yo'q bo'lsa DEFAULT_PLAN (demo) yoki "free". */
  plan?: "free" | "pro";
  interests: string[];
  level?: string;
  /** Aloqa: tashkilotga faqat talaba taklifni qabul qilgandan keyin ko'rinadi. */
  contact?: string;
  mustChangePassword: boolean;
  createdAt: Date;
};

export type NominationStatus = "pending" | "consented" | "declined" | "invited" | "accepted" | "rejected";

export type NominationDoc = {
  _id: ObjectId;
  studentId: ObjectId;
  universityId: ObjectId;
  organizationId: ObjectId;
  nominatedBy: ObjectId;
  status: NominationStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type StepResultDoc = {
  userId: ObjectId;
  scenarioId: string;
  stepId: string;
  score: number;
  max: number;
  graded: boolean;
  answer: unknown;
  feedback: unknown;
  updatedAt: Date;
};

export type NamedDoc = { _id: ObjectId; name: string; kind?: string; createdAt: Date };
export type GroupDoc = { _id: ObjectId; universityId: ObjectId; name: string };
export type AttemptDoc = { key: string; at: Date };

const g = globalThis as unknown as { _lexsimMongo?: Promise<MongoClient>; _lexsimIndexes?: Promise<void> };

export function isBackendConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("users").createIndex({ login: 1 }, { unique: true }),
    db.collection("users").createIndex({ universityId: 1, role: 1 }),
    db.collection("stepResults").createIndex({ userId: 1, scenarioId: 1, stepId: 1 }, { unique: true }),
    db.collection("nominations").createIndex({ studentId: 1, organizationId: 1 }, { unique: true }),
    db.collection("nominations").createIndex({ organizationId: 1, status: 1 }),
    db.collection("groups").createIndex({ universityId: 1, name: 1 }, { unique: true }),
    db.collection("universities").createIndex({ name: 1 }, { unique: true }),
    db.collection("organizations").createIndex({ name: 1 }, { unique: true }),
    // Kirish urinishlari 15 daqiqadan keyin o'zi o'chadi
    db.collection("loginAttempts").createIndex({ at: 1 }, { expireAfterSeconds: 900 }),
    db.collection("loginAttempts").createIndex({ key: 1 }),
  ]);
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI o'rnatilmagan");
  if (!g._lexsimMongo) {
    const p = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 }).connect();
    g._lexsimMongo = p;
    // Ulanish xato bo'lsa keshlanmaydi: baza keyin yoqilsa, keyingi so'rov qayta urinadi
    p.catch(() => {
      if (g._lexsimMongo === p) g._lexsimMongo = undefined;
      g._lexsimIndexes = undefined;
    });
  }
  const client = await g._lexsimMongo;
  const db = client.db(process.env.MONGODB_DB || "lexsim");
  g._lexsimIndexes ??= ensureIndexes(db);
  await g._lexsimIndexes;
  return db;
}

export const col = {
  users: (db: Db): Collection<UserDoc> => db.collection<UserDoc>("users"),
  universities: (db: Db): Collection<NamedDoc> => db.collection<NamedDoc>("universities"),
  organizations: (db: Db): Collection<NamedDoc> => db.collection<NamedDoc>("organizations"),
  groups: (db: Db): Collection<GroupDoc> => db.collection<GroupDoc>("groups"),
  results: (db: Db): Collection<StepResultDoc> => db.collection<StepResultDoc>("stepResults"),
  nominations: (db: Db): Collection<NominationDoc> => db.collection<NominationDoc>("nominations"),
  attempts: (db: Db): Collection<AttemptDoc> => db.collection<AttemptDoc>("loginAttempts"),
};

export function toObjectId(id: string): ObjectId | null {
  return /^[0-9a-f]{24}$/i.test(id) ? new ObjectId(id) : null;
}
