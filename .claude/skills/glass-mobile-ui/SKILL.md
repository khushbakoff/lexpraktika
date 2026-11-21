---
name: glass-mobile-ui
description: LexSim uchun glassmorphism mobil UI/UX tizimi. Har qanday ekran, komponent, pastki bar yoki ikonka yozishda ishlating.
---

# Glass mobil UI

## Maqsad
Chiroyli, lekin **tushunarli**. Foydalanuvchi har ekranda 3 soniyada "men qayerdaman, keyingi qadam nima" ni bilishi kerak.

## Dizayn tokenlari (CSS o'zgaruvchi sifatida `globals.css` da)
- Fon: ko'p rangli mesh gradient (ko'k, binafsha, firuza), qorong'i va yorug' variant. Glass faqat rangli/gradient fon ustida chiroyli ko'rinadi, oddiy oq fonda ishlatmang.
- Glass karta: `backdrop-filter: blur(24px) saturate(160%)`, fon `rgba(255,255,255,0.12)` (qorong'i) yoki `rgba(255,255,255,0.55)` (yorug'), chegara `1px solid rgba(255,255,255,0.25)`, ichki yorug'lik `inset 0 1px 0 rgba(255,255,255,0.4)`, tashqi soya `0 8px 32px rgba(0,0,0,0.18)`.
- Radius: karta 24px, tugma 16px, bar 28px.
- Shrift: Inter yoki system-ui, asosiy matn 16px, sarlavha 20–28px, yordamchi 13px dan kichik emas.
- Bo'shliq: 8px tarmoq, ekran chetidan 16px.

## Kontrast (eng ko'p xato shu yerda)
- Matn va glass fon orasidagi kontrast kamida **4.5:1** (WCAG AA). Yorug' rejimda matn to'q, qorong'i rejimda oq.
- Muhim matn to'g'ridan-to'g'ri gradient ustiga yozilmaydi, glass karta ichida bo'ladi.
- `@supports not (backdrop-filter: blur(1px))` uchun zaxira: zich yarim shaffof fon (`rgba(20,24,40,0.85)`).
- `prefers-reduced-transparency` va `prefers-reduced-motion` ni hurmat qiling.

## Pastki bar
- Suzuvchi "tabletka": ekran chetidan 12–16px ichkarida, `bottom: calc(env(safe-area-inset-bottom) + 12px)`, balandligi 64px, to'liq glass.
- 3 ta tab: **Bosh**, **Vaziyatlar**, **Profil**. Yana tab qo'shmang.
- Faol tab: ikonka biroz kattalashadi, ostida yorug' nuqta yoki glass "kapsula" fon, yorlig'i ko'rinadi. Faol bo'lmaganlarda yorliq ham ko'rinib tursin (faqat ikonka bilan qoldirmang).
- Tegish maydoni kamida 44×44px.
- Kontent barning orqasida qolmasin: sahifa pastiga `padding-bottom: 96px + safe-area`.

## Ikonkalar
- **Asosiy:** realistik 3D ikonkalar (masalan, Microsoft Fluent Emoji 3D to'plami). Ularni `public/icons/` ga yuklab, `next/image` bilan ishlating (offline va tez). Yuklashdan oldin litsenziyani tekshiring va `public/icons/LICENSE` ga ko'chiring.
- Bar va asosiy ob'ektlar uchun: uy, hujjat/papka, sud (gavel), tarozi, qalqon, soat, profil.
- **Funksional ikonkalar** (orqaga, yopish, qidirish, chevron): `lucide-react`, 24px, stroke 1.75.
- Bir ekranda ikki uslubni aralashtirmang: 3D faqat "ob'ekt" va bosqich belgilari uchun, lucide faqat boshqaruv uchun.
- Har ikonkaga `alt` yoki `aria-label` bering.

## UX qoidalari
- Har ekranda **bitta asosiy harakat** (katta glass tugma, pastda, bar ustida).
- Roadmap: bajarilgan (yashil belgi), joriy (yorug' ramka va nafas animatsiyasi), qulflangan (xira, qulf). Qulflangan bosqichni bosganda sabab ko'rsating ("avval hujjatlarni to'plang").
- Xato izohi: nima noto'g'ri, nega, to'g'ri variant, norma havolasi. Qizil bilan qo'rqitmang, yumshoq ogohlantirish rangi.
- Bo'sh, yuklanish va xato holatlari har ekranda bo'lishi shart (skeleton, qayta urinish tugmasi).
- Mikro-animatsiya 150–250ms, `transform` va `opacity` bilan. Murakkab blur animatsiyasi telefonni sekinlashtiradi, kattalashtirmang.
- Performance: bir ekranda `backdrop-filter` li element 6 tadan oshmasin. Blur kuchini 24px dan oshirmang.
- Matn qisqa va sodda. Yuridik atamani birinchi uchraganda bir jumla bilan tushuntiring.

## Komponentlar (`components/ui/`)
`GlassCard`, `GlassButton` (primary/secondary), `GlassSheet` (pastdan chiqadigan panel), `ProgressRing`, `StepChip`, `TabBar`. Yangi ekran shularga tayansin, qaytadan stil yozmasin.

## Tekshiruv ro'yxati (ekran tugagach)
- [ ] 390×844 da hech narsa kesilmaydi, gorizontal scroll yo'q
- [ ] Bar kontentni yopmaydi, safe-area ishlaydi
- [ ] Matn kontrasti yetarli (yorug' va qorong'i)
- [ ] Bo'sh/yuklanish/xato holati bor
- [ ] Asosiy harakat bitta va aniq
- [ ] Telefonda haqiqiy sinov (`phone-testing`)
