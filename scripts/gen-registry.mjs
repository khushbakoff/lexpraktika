// content/scenarios/*.json ro'yxatidan lib/scenario-registry.ts ni yaratadi (yangi vaziyat qo'shganda avtomatik ulanadi).
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "content", "scenarios");
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const name = (f) => "s_" + f.replace(/\.json$/, "").replace(/[^a-zA-Z0-9]/g, "_");
const out =
  "// AVTOMATIK YARATILGAN: scripts/gen-registry.mjs. Qo'lda tahrir qilmang.\n" +
  files.map((f) => `import ${name(f)} from "@/content/scenarios/${f}";`).join("\n") +
  `\n\nexport const RAW_SCENARIOS: unknown[] = [\n${files.map((f) => `  ${name(f)},`).join("\n")}\n];\n`;
writeFileSync(join(import.meta.dirname, "..", "lib", "scenario-registry.ts"), out);
console.log(`registry: ${files.length} vaziyat`);

const edir = join(import.meta.dirname, "..", "content", "employers");
const efiles = readdirSync(edir).filter((f) => f.endsWith(".json")).sort();
const ename = (f) => "e_" + f.replace(/\.json$/, "").replace(/[^a-zA-Z0-9]/g, "_");
writeFileSync(
  join(import.meta.dirname, "..", "lib", "employer-registry.ts"),
  "// AVTOMATIK YARATILGAN: scripts/gen-registry.mjs. Qo'lda tahrir qilmang.\n" +
    efiles.map((f) => `import ${ename(f)} from "@/content/employers/${f}";`).join("\n") +
    `\n\nexport const RAW_EMPLOYERS: unknown[] = [\n${efiles.map((f) => `  ${ename(f)},`).join("\n")}\n];\n`,
);
console.log(`registry: ${efiles.length} ish beruvchi`);
