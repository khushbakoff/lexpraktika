# LexPraktika

Huquq talabalari uchun yuridik amaliyot trenajyori. Talaba haqiqiy hayotiy vaziyatni bosqichma-bosqich o'tadi: mijoz (AI) bilan suhbatlashadi, to'g'ri organ va hujjatni tanlaydi, ariza yozadi, AI esa xatolarni topib ko'rsatadi.

LexHackathon 2026, 02-trek ishtirokchisi. Interfeys tili: o'zbek (lotin).

Demo: https://lex.193-180-213-14.sslip.io

## Muammo

Huquq fakultetlari nazariyani yaxshi o'rgatadi, lekin talaba amaliyotda "mijoz keldi, endi nima qilaman?" savoliga duch keladi. Qaysi organga murojaat qilinadi, qanday hujjat yoziladi, qaysi muddatda, qaysi modda asosida. Buni mashq qiladigan joy yo'q.

## Nima qiladi

- **Vaziyatlar.** 57 ta hayotiy vaziyat (mehnat, oila, iste'molchi, fuqarolik, jinoyat va boshqa sohalar), daraja bo'yicha: boshlang'ich → murakkab. Har biri xarita ko'rinishidagi bosqichlar yo'li.
- **Duolingo uslubi.** Oldingi bosqich bajarilmaguncha keyingisi ochilmaydi. Har bir vaziyatda ariza yozish bosqichi bor.
- **AI mijoz.** Talaba mijozdan savollar so'rab faktlarni aniqlaydi. AI faqat mijoz rolini o'ynaydi.
- **Ariza yozish studiyasi** (kompyuter versiyasi). Word'ga o'xshash bo'sh varaq: talaba "kimga", "kimdan", manzil, sarlavha, talab, asos, sana va imzoni o'zi to'g'ri joyga yozadi. Tekshiruv ikki qismdan iborat:
  - joylashuv va tuzilishni qoidalar bilan tekshirish (AI'siz), masalan imzo to'g'ri joydami, manzil bormi;
  - mazmunni AI rubrika bo'yicha baholaydi.
  Mashqlar kichikdan boshlanadi (faqat "kimga"), keyin sarlavha, sana va imzo, oxirida to'liq ariza. Har mashq oldida qisqa dars bor: nima, qayerga, qanday yoziladi.
- **Huquqiy yordamchi.** Lex.uz asosidagi qidiruv orqali savolga manba bilan javob beradi.
- **Rollar:** talaba, universitet paneli (guruh natijalari), ish beruvchi/tashkilot ko'rinishi.
- **Mobil va kompyuter.** Telegram Mini App / PWA / Android (Capacitor), kompyuterda chap menyuli veb-sayt.

## Asosiy qoida: AI o'ylab topmaydi

Qonuniy tartib (bosqich, hujjat, organ, muddat, modda) AI'dan emas, JSON shablonlardan keladi (`content/scenarios/*.json`), ular Lex.uz manbalariga asoslanadi. Har da'voda `sources` bo'lishi shart. AI faqat mijozni o'ynaydi va yozilgan matnni baholaydi.

Aniq modda raqamlari va muddatlar yurist tasdiqlamaguncha interfeysda **"namunaviy"** deb belgilanadi.

## Texnologiyalar

| Qatlam | Tanlov |
|---|---|
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind v4 |
| Backend | Next.js server actions va API route'lar, zod |
| Ma'lumotlar bazasi | MongoDB |
| AI | OpenAI-mos API (hozir Gemini, `AI_BASE_URL` orqali almashtiriladi), modellar zanjiri (429 bo'lsa keyingisiga o'tadi) |
| Kirish | Telegram orqali, rolga asoslangan ruxsat |
| Mobil | PWA, Capacitor (Android) |
| Server | systemd + nginx, Let's Encrypt |

## Maxfiylik

- AI kaliti faqat serverda, mijoz kodiga chiqmaydi.
- AI'ga yuborishdan oldin telefon, pasport, karta va email avtomatik niqoblanadi (`lib/server/redact.ts`).
- So'rovlar tezligi cheklangan (rate limit).
- Hozircha AI provayderi xorijda. Ma'lumotni O'zbekiston ichida saqlash rejada (`docs/KEYINGI_ISHLAR.md`).

## Ishga tushirish

Kerak: Node.js 20+, MongoDB.

```bash
npm install
cp .env.example .env.local     # qiymatlarni to'ldiring
npm run dev                    # http://localhost:3000
```

`.env.local` asosiy o'zgaruvchilari (`.env.example` da izohlari bor):

| O'zgaruvchi | Nima uchun |
|---|---|
| `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` | AI provayder (`AI_MODEL` vergul bilan bir nechta model bo'lishi mumkin) |
| `MONGODB_URI`, `MONGODB_DB` | Ma'lumotlar bazasi |
| `SESSION_SECRET` | Sessiya imzosi (kamida 32 belgi) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` | Telegram orqali kirish |
| `COOKIE_SECURE` | Faqat HTTPS'da `true` |

Kalitlarni hech qachon GitHub'ga yuklamang: `.env*` fayllari `.gitignore` da.

### Foydali buyruqlar

```bash
npm run check:scenarios   # barcha vaziyat JSON'lari sxema va ballar yig'indisi (100) bo'yicha tekshiriladi
npm run seed              # demo ma'lumotlarni bazaga yuklash
npm run lint
npm run build
```

### Serverga yuklash

`.deploy.env` fayliga o'z serveringizni yozing (git'ga kirmaydi):

```
LEXSIM_HOST=user@server-ip
```

so'ng:

```bash
sh scripts/deploy.sh
```

Batafsil: `docs/SERVER.md`.

## Loyiha tuzilishi

Batafsil: `docs/ARXITEKTURA.md`.

```
app/              sahifalar (marshrutlar), API route'lar, server actions
components/
  layout/         Shell, TabBar, BackLink, mavzu/til, Telegram
  home/           bosh sahifa
  scenarios/      vaziyatlar xaritasi (PathMap), ro'yxat, yo'l, natija
  steps/          vaziyat bosqichi ekranlari
  ariza/          Ariza yozish studiyasi (kompyuter)
  profile/        profil, onboarding, tariflar
  panels/         universitet, tashkilot, ish beruvchi
  auth/  assistant/  ui/
content/          scenarios/ (57 JSON), ariza/ (mashqlar), employers/, lex-index.json
lib/
  content/        sxemalar (zod) va kontentni yuklash
  learning/       ball hisobi, progress, faollik, tavsiyalar
  ariza/          ariza joylashuv tekshiruvi (qoidalar)
  user/           profil, tarif, /me
  ui/             mavzu, orqaga, AI sozlamasi (brauzer)
  server/         AI, baza, sessiya, niqoblash, Lex qidiruv (faqat serverda)
  i18n/           til va lotin/kirill
scripts/          check-scenarios, seed, deploy, gen-registry; lex/ (Lex.uz manbalari), authoring/
docs/             ARXITEKTURA, BOSQICHLAR, KEYINGI_ISHLAR, SERVER
android/          Capacitor Android loyihasi
```

## Yangi vaziyat qo'shish

1. `content/scenarios/` ga JSON qo'shing (sxema: `lib/content/scenario-schema.ts`).
2. Har da'voga `sources` (Lex.uz) yozing, moddani xotiradan yozmang.
3. Bosqich ballari yig'indisi 100 bo'lsin.
4. `npm run check:scenarios` o'tsin.

## Holat va cheklovlar

- Barcha 57 vaziyat va ariza mashqlari yurist tomonidan hali tasdiqlanmagan, shuning uchun "namunaviy".
- Ariza studiyasi natijalari hozircha faqat brauzerda (localStorage) saqlanadi.
- Ariza studiyasi faqat kompyuter versiyasida.
- Avtomatik testlar yo'q, tekshiruv `check:scenarios` va qo'lda sinov bilan.
- Reja: `docs/KEYINGI_ISHLAR.md`.

## Ogohlantirish

LexPraktika o'quv trenajyori. U yuridik maslahat emas va advokat o'rnini bosmaydi.
