// Ishga tushirish: npm run check:scenarios
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { missingSources, scenarioSchema } from "../lib/content/scenario-schema.ts";

const dir = join(import.meta.dirname, "..", "content", "scenarios");
let failed = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const result = scenarioSchema.safeParse(JSON.parse(readFileSync(join(dir, file), "utf8")));
  if (result.success) {
    const missing = missingSources(result.data);
    console.log(`OK    ${file}  [${result.data.status}]`);
    if (missing.length > 0) {
      console.log(`      Qonuniy asosi yo'q (${missing.length}): ${missing.join(", ")}`);
      console.log("      Bu vaziyat 'verified' bo'la olmaydi: har joyga hujjat nomi, modda va lex.uz havolasi kerak.");
    }
  } else {
    failed = true;
    console.error(`XATO  ${file}`);
    for (const issue of result.error.issues) console.error(`      ${issue.path.join(".")}: ${issue.message}`);
  }
}
process.exit(failed ? 1 : 0);
