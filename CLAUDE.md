# LexPraktika

Huquq talabalari uchun yuridik amaliyot trenajyori (LexHackathon 2026). Reja: `docs/BOSQICHLAR.md`. Kelajak ishlari: `docs/KEYINGI_ISHLAR.md`.

## Qoidalar
- Stack: Next.js App Router, TypeScript, Tailwind. Mobile-first (390px asos), keyin webview.
- Interfeys tili: o'zbek (lotin). Kod va o'zgaruvchi nomlari inglizcha.
- AI kaliti faqat serverda (`.env.local`), mijoz kodiga hech qachon chiqmaydi.
- Qonuniy tartibni (bosqich, hujjat, organ, muddat) AI o'ylab topmaydi. U JSON shablondan keladi. AI faqat mijoz rolini o'ynaydi va ariza matnini baholaydi.
- **Hamma huquqiy ma'lumot davlat chiqargan qonunlarga (Lex.uz) asoslanadi.** Har da'voda `sources` bo'lishi shart, modda/muddatni xotiradan yozmang.
- Aniq modda raqami yoki muddat yurist tasdiqlamaguncha UI'da "namunaviy" deb belgilanadi.
- Dizayn: glassmorphism, `.claude/skills/glass-mobile-ui` ga qarang.
- Ish tugaganda: bajarilgan bandni `docs/BOSQICHLAR.md` da belgilang, kelajak ishlarini `docs/KEYINGI_ISHLAR.md` ga yozing.

- Backend: MongoDB (`lib/server/*`, `app/actions/*`). Ruxsat tekshiruvi har server action'da `requireRole`. Server: `docs/SERVER.md`, yuklash: `sh scripts/deploy.sh`.

## Skill'lar
- `glass-mobile-ui`: dizayn tizimi, pastki bar, ikonkalar, kontrast
- `scenario-authoring`: vaziyat JSON sxemasi va yozish tartibi
- `legal-content-safety`: huquqiy kontent va AI xavfsizlik qoidalari
- `phone-testing`: telefonda sinov tartibi
