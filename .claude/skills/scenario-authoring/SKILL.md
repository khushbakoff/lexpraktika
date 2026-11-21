---
name: scenario-authoring
description: LexSim vaziyat (scenario) JSON sxemasi va yozish tartibi. Yangi vaziyat qo'shganda yoki bosqich logikasini o'zgartirganda ishlating.
---

# Vaziyat yozish

Vaziyat = qonuniy ketma-ketlikdagi bosqichlar zanjiri. **Tartibni yurist belgilaydi**, kod va AI uni o'zgartirmaydi.

## Fayl
`content/scenarios/<slug>.json`, `lib/content/scenario-schema.ts` (zod) bilan tekshiriladi.

## Sxema
```json
{
  "id": "mehnat-ish-haqi",
  "title": "Ish haqim 3 oy to'lanmadi",
  "area": "mehnat",
  "level": 1,
  "status": "sample",
  "reviewedBy": null,
  "client": {
    "persona": "Aziz, 28 yosh, sotuvchi",
    "openingLine": "Assalomu alaykum, ish haqim to'lanmayapti...",
    "hiddenFacts": [
      { "id": "since", "fact": "3 oydan beri", "revealOn": ["qachondan", "muddat"] }
    ]
  },
  "steps": [
    {
      "id": "facts",
      "type": "client-chat",
      "title": "Faktlarni aniqlang",
      "requiredFactIds": ["since", "amount", "contract"],
      "points": 15
    },
    {
      "id": "documents",
      "type": "document-pick",
      "title": "Hujjatlarni yig'ing",
      "options": [
        { "id": "contract", "label": "Mehnat shartnomasi", "required": true, "why": "Munosabat mavjudligini isbotlaydi", "sources": [] },
        { "id": "birth", "label": "Tug'ilganlik guvohnomasi", "required": false, "why": "Bu nizoga aloqasiz" }
      ],
      "points": 25
    },
    { "id": "application", "type": "form", "title": "Ariza yozing", "fields": [], "rubric": [], "points": 25 },
    {
      "id": "authority",
      "type": "authority-pick",
      "title": "Qayerga murojaat qilasiz?",
      "order": ["employer", "dispute-commission", "labor-inspection", "court"],
      "points": 20
    },
    { "id": "deadline", "type": "deadline-pick", "title": "Muddat", "correct": "", "points": 15 }
  ]
}
```

## Qonuniy asos (majburiy tamoyil)
Simulyatordagi **har bir huquqiy da'vo davlat tomonidan chiqarilgan hujjatga asoslanishi shart**. Bu hujjat variantlari, organlar tartibi, forma maydonlari va muddatlarga tegishli.
- Har joyda `sources: [{ "act": "Hujjat nomi", "article": "modda/band", "url": "https://lex.uz/..." }]`.
- Faqat rasmiy manba: Lex.uz (Qonunchilik ma'lumotlari milliy bazasi) yoki shunga teng rasmiy nashr. Sharh, maqola, forum, AI xotirasi manba EMAS.
- Modda raqami, muddat, organ nomini xotiradan yozmang. Manbani ochib, matnni o'qib, keyin yozing. Topolmasangiz `sources: []` qoldiring: UI "manba tasdiqlanmagan" deb ko'rsatadi.
- `status: "verified"` faqat hamma joyda `act` + `article` + `https://lex.uz/` havolasi bo'lganda va yurist `reviewedBy` bo'lganda mumkin. Sxema shuni majburlaydi (`missingSources`).
- Hujjat o'zgarsa (qonun yangilansa) vaziyat qayta tekshiriladi; `status` qayta `sample` ga tushadi.
- `npm run check:scenarios` manbasi yo'q joylarni sanab beradi.
- Ish tartibi: `sh scripts/lex/fetch-lex.sh` (matnlarni `.research/` ga yuklaydi) → moddani `python3 -I scripts/lex/lex-article.py .research/mehnat.txt 545` bilan o'qing → iqtibosni (`quote`) matndan aynan ko'chiring → `python3 -I scripts/lex/verify-quotes.py` har iqtibosni moddada qidirib tekshiradi.
- Bosqich id'larini o'zgartirsangiz `lib/learning/progress.ts` dagi saqlash versiyasini (`lexsim:progress:vN`) oshiring, aks holda eski natijalar yangi bosqichlarga aralashadi.
- Qiyin savol turlari: `document-pick` ni umumiy ko'p tanlovli savol sifatida ishlating (`prompt`, `submitLabel`), `authority-pick` ni tartib (ketma-ketlik) uchun.

## Qoidalar
- `status`: `"sample"` (yurist tasdiqlamagan) yoki `"verified"`. `sample` bo'lsa UI da "Namunaviy ma'lumot" belgisi chiqadi.
- Bosqich ballari yig'indisi **100**.
- Ketma-ketlik `steps` massivi tartibida. Oldingi bosqich bajarilmasa keyingisi qulflanadi.
- Moddalar raqami, muddat va organ nomlarini **o'ylab topmang**. Bilmasangiz maydonni bo'sh qoldiring va `docs/KEYINGI_ISHLAR.md` ga "yurist tekshirsin" deb yozing.
- Keraksiz (`required: false`) variantlar real ko'rinsin, lekin aniq aloqasiz bo'lsin, aks holda mashq ma'nosiz bo'ladi.
- Har variantda `why` (nega kerak/kerak emas) bo'lsin: shu tushuntirish natija ekranida chiqadi.
- AI mijoz faqat `hiddenFacts` ni ochadi, o'zi yangi fakt o'ylab topmaydi.

## Yangi vaziyat qo'shish tartibi
1. Yurist bilan ketma-ketlikni yozib oling (bosqich, hujjat, organ, muddat, norma).
2. JSON yozing, `status: "sample"`.
3. Sxema tekshiruvi (`npm run check:scenarios`) o'tsin.
4. Telefonda bir marta to'liq o'ting.
5. Yurist tasdiqlasa `status: "verified"`, `reviewedBy` to'ldiriladi.
