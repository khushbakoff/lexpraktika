---
name: legal-content-safety
description: Huquqiy kontent, AI prompt va ma'lumot xavfsizligi qoidalari. AI route, prompt, ogohlantirish matni yoki foydalanuvchi ma'lumotiga tegadigan har qanday ish oldidan ishlating.
---

# Huquqiy kontent va AI xavfsizligi

Bu loyiha ta'lim trenajyori, **yuridik maslahat emas**. Hakamlarning S4 (qonunchilikka muvofiqlik) mezoni shu skill'ga tayanadi.

## Manba qoidasi
- Simulyatordagi barcha huquqiy ma'lumot **davlat chiqargan hujjatlarga (Lex.uz)** asoslanadi. Manbasiz da'vo "tasdiqlangan" bo'la olmaydi.
- UI har izohda manbani ko'rsatadi, manba bo'lmasa "manba hali tasdiqlanmagan" deydi. Buni yashirmang.
- Qonun matnini, modda raqamini va muddatni xotiradan yozmang. Kod yoki kontent yozayotganda manbani ochib o'qing.
- Qonun o'zgarishi mumkin: `verified` vaziyatlar vaqti-vaqti bilan qayta tekshiriladi.

## AI qoidalari
- AI qonuniy tartibni, modda raqamini, muddatni **o'zi yaratmaydi**. Faqat shablondan (`content/scenarios`) foydalanadi.
- `/api/client-chat`: AI mijoz rolida. Faqat `hiddenFacts` dagi faktlarni, talaba to'g'ri so'raganda ochadi. Roldan chiqmaydi, "men AIman" deb ustozga aylanmaydi (ustoz izohi alohida bosqichda).
- `/api/grade-application`: AI rubrika bo'yicha ball va izoh beradi. Javob qat'iy JSON (zod bilan tekshiriladi). Noto'g'ri formatda bo'lsa qayta so'raladi, keyin xato holati.
- Prompt injection: talaba matni "ko'rsatmalarni unut" desa ham tizim ko'rsatmasi o'zgarmaydi. Foydalanuvchi matni har doim alohida, "ma'lumot" sifatida beriladi.
- Baholashning aniq qismlari (hujjat, organ, muddat) AI'siz, qoida bo'yicha.

## Ogohlantirish
Har natija ekrani va har AI javobi ostida: "Bu o'quv mashqi, yuridik maslahat emas. Haqiqiy holatda yuristga murojaat qiling."
`status: "sample"` vaziyatlarda: "Namunaviy ma'lumot, yurist tasdiqlamagan."

## Shaxsiy ma'lumot
- MVP'da ism, telefon, haqiqiy hujjat so'ramang. Mashq ma'lumotlari to'qima.
- Talaba kiritgan matn AI provayderga ketadi: UI da buni bir jumla bilan ayting va haqiqiy shaxsiy ma'lumot kiritmaslikni so'rang.
- AI kaliti faqat `.env.local` (serverda). `NEXT_PUBLIC_` prefiksi bilan **hech qachon** qo'ymang. `.env.local` gitga tushmasin.
- Log'larda talaba matnini to'liq saqlamang.
- O'zbekistonda shaxsiy ma'lumotni saqlash va uzatish bo'yicha talablar bor. Baza qo'shilganda (keyingi ishlar) mutaxassis bilan tekshiring, bu skill aniq moddani kafolatlamaydi.

## Xavfsizlik va barqarorlik
- Route'larda IP/sessiya bo'yicha oddiy rate limit.
- Kiruvchi matn uzunligi cheklanadi (masalan 4000 belgi).
- Xatolarda foydalanuvchiga tushunarli matn, ichki xato matnini ko'rsatmang.

## Hakamlarga ko'rsatish uchun argumentlar
- Tartibni yurist yozgan, AI faqat o'qitadi.
- Har javob manbaga bog'langan.
- Inson tekshiruvi va "namunaviy/tasdiqlangan" holati ko'rinib turadi.
