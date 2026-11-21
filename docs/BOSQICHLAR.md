# LexPraktika: loyiha bosqichlari

Maqsad: huquq talabalari uchun **yuridik amaliyot trenajyori**. Talaba real vaziyatni bosqichma-bosqich o'tadi (fakt yig'ish, hujjat, ariza, organ, muddat), tizim baholaydi.
LexHackathon 2026, 02-trek: Huquqiy targ'ibot va ta'lim.

## Qarorlar
- **Barcha huquqiy ma'lumot davlat chiqargan qonunlarga (Lex.uz) asoslanadi.** Sxema har joyda `sources` (hujjat, modda, lex.uz havola) talab qiladi, manbasiz vaziyat `verified` bo'la olmaydi, UI manbani ko'rsatadi
- **Stack:** Next.js (App Router) + TypeScript + Tailwind, mobile-first, keyin webview (PWA, keyin Capacitor yoki Telegram Mini App)
- **Dizayn:** glassmorphism, suzuvchi pastki bar, realistik (3D) ikonkalar. Batafsil: `.claude/skills/glass-mobile-ui`
- **Ma'lumot (MVP):** JSON fayllar + localStorage. Baza yo'q
- **AI:** Claude API, faqat server route'lardan. Kalit `.env.local` ichida, hech qachon brauzerga tushmaydi
- **Tamoyil:** qonuniy tartibni yurist yozadi (JSON shablon), AI faqat mijoz rolini o'ynaydi va ariza matnini baholaydi
- **Til:** interfeys o'zbek (lotin)

## Baholash mezonlari bilan bog'liqlik
Slayd: Texnik (T1–T5), Biznes (B1–B5), Huquqiy (S1–S5), har biri 1–10 ball.
Eng zaif joylar: **T2 (ishlaydigan MVP), B4 (moliya), S4 (muvofiqlik)**. Reja shu tartibda ustuvor.

---

## 0-bosqich. Tayyorgarlik
- [x] `~/lexsim` da Next.js + TS + Tailwind loyihasi
- [ ] `.env.local` (AI kaliti), `.env.example`
- [x] `CLAUDE.md`, skill'lar (`.claude/skills/`)
- [x] Realistik ikonkalar manbasi tanlanadi va `public/icons/` ga yuklanadi (litsenziya tekshiriladi)

## 1-bosqich. Skelet va dizayn tizimi (1-kun)
- [x] Dizayn tokenlari (rang, blur, radius, soya), fon gradienti
- [x] `GlassCard`, `GlassButton`, `GlassSheet`, `ProgressRing` komponentlari
- [x] Suzuvchi pastki bar (Bosh, Vaziyatlar, Profil), safe-area
- [x] Mobil layout (`viewport-fit=cover`), yorug'/qorong'i rejim
- [x] Sahifalar: Bosh, Vaziyatlar ro'yxati, Profil (bo'sh holatda)

**Tayyor mezoni:** telefonda ochilganda bar pastda suzib turadi, kartalar shaffof va o'qiladi.

## 2-bosqich. Vaziyat ma'lumoti va roadmap (1-kun)
- [x] `ScenarioSchema` (TypeScript + zod). Skill: `scenario-authoring`
- [x] 1-vaziyat: "Ish haqim 3 oy to'lanmadi" (namunaviy, yurist tasdig'i kerak)
- [x] Roadmap ekrani: bosqichlar zanjiri, qulflangan/ochiq/bajarilgan
- [x] Progress localStorage'da saqlanadi

## 3-bosqich. Bosqich ekranlari, deterministik (1–2-kun)
- [x] Hujjat tanlash (kerakli/keraksiz, tap bilan tanlash, tushuntirish)
- [x] Organ tanlash (tartib: ichki → tashqi)
- [x] Muddat belgilash
- [x] Ariza formasi (maydonlar to'ldiriladi, shablon)
- [x] Qoida asosida ball (AI'siz) va xato izohi norma havolasi bilan

## 3.5-bosqich. Yo'nalish tanlash va moslashtirish (bajarildi)
- [x] Birinchi kirishda onboarding: yo'nalish (kasb) → qiziqish sohalari → daraja
- [x] Profil localStorage'da, bosh sahifa va ro'yxat "Sizga mos" bo'yicha saralanadi
- [x] XP va daraja (har 100 XP = 1 daraja), 3D ikonkalar
- [x] Qonunga asoslangan vaziyatlar (42 ta): mehnat, ijara, iste'molchi, oila, notariat, shaxsiy ma'lumot, murojaat, jinoyat-protsessual, jinoyat, ma'muriy, fuqarolik-protsessual. Manbalar Lex.uz matnidan, iqtiboslar skript bilan tekshirilgan (577 manba), yurist tasdig'i kutilmoqda
- [x] Daraja ro'yxatga ta'sir qiladi: tanlangan daraja birinchi, yetmasa qo'shni darajalar bilan to'ldirilib kamida 10 ta ko'rinadi (`npm run coverage`)
- [ ] Har yo'nalish uchun ko'proq vaziyat (YaTT, jinoyat, oila, notarius): har biri Lex.uz matnidan o'qilib yoziladi
- [ ] Qiziqarli elementlar: streak, nishonlar (badge), kunlik missiya

## 4-bosqich. AI qismi (2-kun)
- [x] `/api/client-chat`: AI mijoz, faktlar bosqichma-bosqich ochiladi (kod tayyor, himoyalar sinalgan; AI kaliti bilan jonli sinov kutilmoqda: kalit 401 qaytardi)
- [x] `/api/grade-document`: hujjat matni mezonlar bo'yicha AI bilan baholanadi ("Hujjat yozing" bosqichi, `mehnat-ish-haqi` da; jonli sinov AI kaliti bilan kutilmoqda)
- [x] "Xatoni top" bosqichi (`doc-review`, AI kerak emas) `mehnat-ish-haqi`, `ijara-tolov-buzildi` va `aliment-ota-tolamayapti` da; muzokara bosqichi (`client-chat` + `counterpart`, qarshi tomon) `mehnat-ish-haqi` da
- [ ] Javoblar manbaga bog'lanadi, "ma'lumot, maslahat emas" ogohlantirishi
- [ ] Xatolarni qayta ishlash (tarmoq, limit), yuklanish holatlari
- [ ] Rate limit va kalitni himoyalash

## 5-bosqich. Natija, profil, panel (3-kun)
- [ ] Natija ekrani: ball, xato bosqichlari, keyingi mashq tavsiyasi
- [ ] Ko'nikma profili (mavzu bo'yicha daraja)
- [ ] "Adliya paneli" demo sahifasi (hudud/mavzu statistikasi, namunaviy ma'lumot bo'lsa belgilanadi)

## 5.5-bosqich. Rollar: talaba, mustaqil foydalanuvchi, universitet, tashkilot
Maqsad: universitet talabalar natijasini ko'rsin, yaxshi natija qilganlarni tashkilotlarga yuborsin.

**Rollar**
- **Mustaqil foydalanuvchi:** o'zi ro'yxatdan o'tadi, ilovadan yakka foydalanadi
- **Talaba:** universitet bergan login/parol (yoki taklif kodi) bilan kiradi, guruhga biriktiriladi
- **Universitet (admin/o'qituvchi):** talabalar ro'yxati, guruhlar, natija, zaif mavzular, eksport, nomzod yuborish
- **Tashkilot (firma, bank, Adliya):** universitet yuborgan nomzodlarni ko'radi, taklif qiladi
- **Platforma admini:** universitet va tashkilot hisoblarini yaratadi

**Oqimlar**
1. Universitet talabalarga login/parol yaratadi (CSV bilan ommaviy) yoki taklif kodi beradi
2. Talaba kirib mashq qiladi, natija bazaga yoziladi
3. Universitet panelda talabalarni va natijani ko'radi
4. Universitet yaxshi natijali talabani tashkilotga "nomzod" qilib yuboradi
5. **Talaba rozilik beradi** (rad etishi mumkin). Rozilikdan keyingina tashkilot ma'lumotni ko'radi
6. Tashkilot nomzodga taklif yuboradi, aloqa ma'lumoti talaba qabul qilgandan keyin ochiladi

**Maxfiylik qoidalari**
- Universitet o'z talabalarini ko'radi (talaba qo'shilganda buni ko'rib roziligini beradi)
- Tashkilot talaba rozilik bermaguncha hech narsa ko'rmaydi; rozilik qaytarib olinadi
- Faqat zarur ma'lumot ulashiladi (ball, ko'nikma profili, yo'nalish), shaxsiy ma'lumot emas
- O'zbekiston shaxsiy ma'lumot qonunchiligi talabi: yurist/mutaxassis bilan tekshirish shart

**Qarorlar (tasdiqlandi)**
- Backend: **MongoDB** (umumiy serverdagi alohida `lexsim` bazasi) + o'z autentifikatsiyamiz (scrypt, imzolangan cookie sessiya). Ruxsatlar (kim nimani ko'radi) server kodida tekshiriladi. Supabase'dan voz kechildi. Ma'lumot o'z serverimizda. Batafsil: `docs/SERVER.md`
- Talaba hisobini **universitet yaratadi** (login/parol). Login `users.login` maydonida kichik harfda saqlanadi
- Natija **faqat serverdan** yoziladi: server javobni qayta hisoblaydi (talaba o'ziga to'liq ball qo'ya olmasligi uchun)

**Tayyor**
- [x] `supabase/migrations/0001_init.sql`: jadvallar, RLS, nomzod holat mashinasi, panel funksiyalari. Vaqtinchalik mahalliy Postgres'da tekshirildi (ko'rish huquqlari, rozilik oqimi, aloqa ma'lumoti faqat qabul qilingach ochilishi)
- [x] `lib/supabase/{client,server,admin}.ts`

**Texnik**
- [ ] Backend: baza, autentifikatsiya (login/parol, parol hash), sessiya, rol tekshiruvi
- [ ] Jadvallar: users, universities, groups, organizations, results, consents, nominations
- [ ] localStorage progressini bazaga ko'chirish
- [ ] Panellar: universitet, tashkilot, admin
- [ ] Talaba roziligi ekrani
- [ ] Demo uchun to'ldirilgan (seed) ma'lumot

## 6-bosqich. Telefonda sinov va webview
- [ ] Telefonda sinov: skill `phone-testing`
- [ ] PWA manifest, ikonka, splash
- [ ] Webview variantini tanlash: Capacitor yoki Telegram Mini App
- [ ] Sinov ro'yxati: iOS Safari va Android Chrome

## 7-bosqich. Hackathon uchun tayyorlov
- [ ] 2–3 daqiqalik demo ssenariy (ketma-ketligi aniq)
- [ ] Pitch: muammo (slayddagi 6 ta), yechim, biznes model, raqobat jadvali
- [ ] Moliya jadvali: xarajat va 3 ssenariy daromad (B4)
- [ ] Muvofiqlik sahifasi: shaxsiy ma'lumot, AI javobgarligi (S4)
- [ ] Ta'sir maqsadi: raqamli (S5)

---

## Biznes model (qisqa)
To'lovchilar: universitetlar (talaba boshiga yillik), yuridik firmalar, davlat/Adliya hamkorligi. Talaba asosan bepul kanal.
Daromad raqamlari hozircha **faraz**, universitetlar bilan suhbatda tekshiriladi.

## Xavflar
- AI bahosi noto'g'ri bo'lishi: rubrika qat'iy, deterministik qismlar ko'p, tanlab inson tekshiruvi
- Qonuniy ma'lumot xato bo'lishi: yurist tasdiqlamaguncha "namunaviy" belgisi
- Glass dizaynda matn o'qilmasligi: kontrast qoidalari skill'da
- Vaqt: avval T2 (ishlaydigan demo), keyin sayqal
- [x] Profil: tahrirlash, Ko'nikmalar va Sozlamalar alohida sahifalar, hisobni o'chirish
- [x] Nom LexPraktika, logotip A (L+P monogram): ilova, manifest, Android ikonka
- [x] Bosh sahifa Duolingo uslubida: seriya, kunlik maqsad, 7 kunlik chiziq, yo'l tugunlari. Profil: tahrirlash tugmasi ism kartasida
- [x] Manba havolasi aynan moddaga ochiladi (anchor, scripts/add-anchors.py)
- [x] Logotip: ko'k-kulrang doira, L va P oq bo'shliqda (ilova, PWA, Android ikonka)
- [x] Logotip: oltin-qora halqa, L va P (referens bo'yicha)
- [x] Lex.uz bilan jonli tekshiruv (/api/lex-check) va AI tushuntirish (/api/lex-explain), SourceSheet ichida
- [x] Huquqiy yordamchi (/yordamchi): savol -> Lex.uz moddalar indeksi (4063 modda, scripts/build-lex-index.py) -> AI mos modda va qismni ko'rsatadi
- [x] AI provayder: Groq (OpenAI formati) AI_BASE_URL orqali; Telegram bot @LexPraktika_bot ulandi (.env.local)
- [x] Serverga yuklandi (HTTPS: lex.193-180-213-14.sslip.io), Telegram Mini App: menyu tugmasi, /start webhook, initData orqali kirish
- [x] Yordamchi avval 1 raund aniqlashtiruvchi savol beradi (tayyor javob tugmalari bilan), keyin Lex.uz moddalarini ko'rsatadi
- [x] Google orqali kirish olib tashlandi (faqat parol va Telegram)
- [x] Maxfiylik: PII yashirish (redact.ts), Maxfiy rejim (AI'siz), ogohlantirish; server Daniyada ekani aniqlandi (ko'chirish kerak)
- [x] Ko'nikmalar natijalardan hisoblanadi; slaydlar yangilandi (11 ta); yordamchi aniqlik sinovi: scripts/eval-assistant.mjs

- [x] Har vaziyatga "Arizani o'zingiz yozing" (draft) bosqichi qo'shildi (57 ta), ballar yig'indisi 100. Mezonlar vaziyat faktlari va hujjatlaridan olinadi.
- [x] Bosh sahifada joriy mavzu bosqichlari alohida tugun (Duolingo): oldingisi bajarilmasa keyingisi qulflangan. "Yordamchi" tabi o'rniga "Ariza" tabi (/ariza).
- [x] Kompyuter versiyasi: chap menyu, "Ariza yozish" ustaxonasi (/ariza): bo'sh Word varaq, talaba joyni o'zi belgilaydi, 9 mashq kichikdan murakkabgacha, tuzilish (shapka, sarlavha, manzil, ilova, sana/imzo) va mazmun tekshiruvi, qator raqamlari bilan xatolar. Telefonda Ariza tabi olib tashlandi.
- [x] Ariza ustaxonasi: qiyinlik silliq oshadi (12 mashq). 1-daraja har mashqda bitta yangi qism (yangi: "Ilovalar", "Qonuniy asos"); 2-daraja: ta'til arizasi karkas bilan (har qatorda ko'rsatma, Enter keyingi qatorga o'tadi), keyin karkassiz lekin hamma ma'lumot berilgan ish haqi arizasi; 3-daraja: vaziyatdan ariza (dars ochiq, qismlar ro'yxati, "yangi" belgisi); 4-daraja mustaqil. ish_haqi ga to'liq namuna, tovar/aliment/ijara ga tuzilma namunasi ([qavs] bilan) va dars. Tekshiruvda organ/murojaatchi faqat shapkadan qidiriladi (asosiy matndagi "sotuvchi", "MChJ" endi organ deb olinmaydi), "APELLYATSIYA SHIKOYATI", "... to'g'risida ariza" sarlavhalari taniladi. Varaqni tozalash tugmasi.
- [x] Logotip ilova ranglarida: L yashil (`--success` #0f8f5f), P ko'k (`--accent` #2f5fe8), oq fon. SVG (public/logo.svg, app/icon.svg) va barcha PNG (PWA, iPhone, Android mipmap, Desktop/LexPraktika/logotip) qayta chiqarildi; app/apple-icon.png dagi eski kompas belgisi almashtirildi.
- [x] Kompyuter versiyasida bo'sh joylar yo'qotildi: keng maydon (1100px) hamma sahifada (maxfiylik, shartlar, sozlamalar o'rtacha kenglikda), yo'l xaritasi kompyuterda kartochka to'ri (telefonda zigzag qoladi), vaziyat sahifasi 2 ustun, bosqich ekranida o'ng panel (bosqichlar ro'yxati), profil 2 ustun, tariflar yonma-yon.
- [x] Qorong'i rejim tinch palitrada: neytral grafit fon (#111318), rangli mesh dog'lari deyarli sezilmaydi, matn #e3e6ed (kontrast 13–15:1, ko'z qamashmaydi), kartalar oq 5,5% shaffof; bosh sahifadagi katta "Yo'nalish" bloki qorong'ida tinch tusda.
- [x] Profil (kompyuter): "Natijalarim" kartasi (XP, seriya, bajarilgan bosqichlar, ariza mashqlari). Tariflar: "Tashkilotlar uchun" bo'limi (universitet 180 000 so'm/talaba/yil, ish beruvchi 1 mln so'm/oy, namunaviy), biznes model hujjatiga mos.
- [x] Ariza ustaxonasi haqiqiy Word ko'rinishida: sarlavha satri (Ariza_N.docx — Word, avtomatik saqlash, bekor qilish/qaytarish), lenta (Fayl, Bosh, Ko'rib chiqish, Ko'rinish; Shrift: Times New Roman, o'lcham, B/I/U, KATTA harf; Abzats: tekislash, o'ng yarmiga chekinish, qator oralig'i), chizg'ich (sm), A4 varaq (maydonlar 3/1,5/2/2 sm), holat satri (sahifa, so'z, belgi). Tahrir Word'dagidek: Enter abzatsni kursor joyidan bo'ladi, Backspace/Delete abzatslarni qo'shadi, strelkalar abzatslar orasida yuradi, Ctrl+Z/Y, Ctrl+B/I/U, ko'p qatorli matn qo'yilsa abzatslarga bo'linadi. Chap panel: Topshiriq (vaziyat, qismlar ro'yxati ✓/✗, dars) va Izohlar (Word izohlari, varaq chetida raqamli belgi, xato abzats qizil to'lqinli chiziq). Fayl → Yuklab olish (.doc).
- [x] To'liq arizalarda (2–4-daraja) "Yuborish": organ nomidan javob xati (kiruvchi raqam, sana, qabul qilindi / qabul qilinmadi va sabablari; "o'quv simulyatsiyasi" belgisi). Majburiy qism (kimga, kimdan, sarlavha, talab, asos, ilova, sana, imzo) umuman yo'q bo'lsa ball o'tish chegarasidan past qoladi (scoreResult).
- [x] Ariza: haqiqiy Word fayli kabi uzluksiz hujjat (contentEditable, `components/WordDoc.tsx`): matnni istalgan joydan belgilash, bitta so'zni qalin/kursiv/tagi chizilgan qilish, bir nechta abzatsni birdaniga tekislash, Ctrl+A (faqat hujjat), Ctrl+Z/Y, Tab, nusxalash/qo'yish (faqat oddiy matn, har qator abzats). Qoralama HTML ko'rinishida saqlanadi (`lexsim-ariza-html-v1`, xavfsiz teglar filtri). Word oynasi kompyuterda butun ekranni egallaydi (+ brauzer to'liq ekran tugmasi), mashqlar ro'yxati chap panelda.
- [x] AI yordamchi (Word'dagi Copilot kabi, o'ng panel): `/api/ariza-assist` hujjatni abzatslar bilan ko'radi, savolga javob beradi va varaqqa qo'yiladigan qisqa matn taklif qiladi ("Varaqqa qo'yish"). Qonun moddasi faqat mashq manbalari va Lex.uz indeksidan; ism/fakt to'qimaydi ([qavs] qoldiradi); butun arizani bir yo'la yozib bermaydi. Shaxsiy ma'lumot yashiriladi (redact), limit va kvota bor.
- [x] Ariza (sinov va sayqal, 2026-11-21): varaq Word'dagi "Sahifa kengligi" masshtabida (oynaga moslashadi, holat satrida − % + boshqaruvi), topshiriq paneli har qanday kenglikda yonma-yon ochiq, keng ekranda (≥1600px) AI yordamchi o'zi ochiladi. Sinov: lint, 57 vaziyat JSON, 12 mashq namunasi, 14 sahifa kompyuter/telefonda konsol xatosiz; tahrir, karkas, mashq almashish, .doc yuklab olish, namuna, yuborish, AI yordamchi va qayta yuklashdan keyin izohlar tekshirildi.
