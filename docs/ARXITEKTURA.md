# Arxitektura

## Qatlamlar va bog'liqlik yo'nalishi

```
app/  ──►  components/  ──►  lib/ (content, learning, user, ui, ariza)
 │                                   ▲
 └──────►  lib/server/  ─────────────┘   (server qatlami; mijoz kodi uni import qilmaydi)
```

- **`app/`** faqat marshrutlash va ma'lumot olish: sahifa, `route.ts`, server action. Mantiq `lib/` da, ko'rinish `components/` da.
- **`components/`** ni xususiyat bo'yicha papkalarga bo'lamiz (layout, home, scenarios, steps, ariza, profile, panels...). Faqat bitta xususiyatda ishlatiladigan komponent o'sha papkada turadi; umumiy kichik elementlar `ui/` da.
- **`lib/server/`** faqat serverda: AI kaliti, baza, sessiya, parol, niqoblash. Mijoz komponenti bu papkadan import qilmaydi.
- **Import:** hamma joyda `@/` bilan mutlaq yo'l. Nisbiy yo'l faqat bir papka ichida.

## Kontent oqimi (kontent birinchi)

`content/scenarios/*.json` → `scripts/gen-registry.mjs` (predev/prebuild) → `lib/content/scenario-registry.ts` (avtomatik, qo'lda tahrir qilinmaydi) → `lib/content/scenarios.ts` (zod bilan tekshirib yuklaydi).

Qonuniy tartib faqat JSON'dan keladi; AI uni o'ylab topmaydi. Sxema: `lib/content/scenario-schema.ts`. Tekshiruv: `npm run check:scenarios`.

## AI oqimi

Mijoz → `app/api/*/route.ts` → `lib/server/ai.ts` (`completeJson`, modellar zanjiri, 429 da keyingi modelga) → `lib/server/redact.ts` (shaxsiy ma'lumotni niqoblash) → provayder. Kalit faqat serverda. Har route'da tezlik cheklovi va `ai-guard`.

## Ariza studiyasi

`content/ariza/tasks.json` (mashqlar, darslar) → `lib/ariza/index.ts` (joylashuvni qoidalar bilan tekshirish, AI'siz) + `lib/server/ariza-grade.ts` (mazmunni AI baholaydi) → `app/api/ariza-check` → `components/ariza/ArizaStudio.tsx`.

## Ma'lumot saqlash

- MongoDB: foydalanuvchi, progress, tashkilot/universitet (`lib/server/db.ts`, `app/actions/*`, har actionda `requireRole`).
- Brauzer: progress keshi, ariza qoralamasi (`localStorage`), orqaga yo'li (`sessionStorage`).

## Qoidalar

1. Yangi funksiya: sahifa `app/` da, UI `components/<xususiyat>/`, mantiq `lib/<soha>/`.
2. Serverga tegishli narsa `lib/server/` da, `import "server-only"` yoki faqat server fayllaridan chaqiriladi.
3. Kod nomlari inglizcha, interfeys matni o'zbekcha.
4. Ish tugagach `docs/BOSQICHLAR.md` va `docs/KEYINGI_ISHLAR.md` yangilanadi.
