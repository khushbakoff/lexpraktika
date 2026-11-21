---
name: phone-testing
description: LexSim ni haqiqiy telefonda sinash tartibi (dev server, tunnel, PWA, webview). Ekran tugagach yoki demo oldidan ishlating.
---

# Telefonda sinov

## Variant 1: bir Wi-Fi tarmog'ida (eng tez)
1. Kompyuter va telefon bitta Wi-Fi'da bo'lsin.
2. `npm run dev -- -H 0.0.0.0`
3. Kompyuter IP'sini bilib oling (`ipconfig getifaddr en0`).
4. Telefonda `http://<IP>:3000` oching.
5. Ochilmasa: Mac firewall va Wi-Fi "client isolation" ni tekshiring.

## Variant 2: tunnel (tarmoq farq qilsa yoki do'stga ko'rsatish uchun)
`cloudflared tunnel --url http://localhost:3000` yoki `ngrok http 3000`. Beriladigan https havola vaqtinchalik. Uni internetga ochib qo'yayotganingizni unutmang: AI kaliti serverda, lekin AI route'lar ochiq bo'ladi, rate limit yoqilgan bo'lsin va sinovdan keyin tunnelni o'chiring.

## Telefonda tekshiriladigan narsalar
- [ ] Pastki bar safe-area (iPhone notch/home indicator) bilan to'g'ri turadi
- [ ] Glass blur ishlaydi va matn o'qiladi (yorug'/qorong'i)
- [ ] Barcha tugmalar barmoq bilan oson bosiladi (44px)
- [ ] Klaviatura chiqqanda chat kiritish maydoni yopilmaydi
- [ ] Scroll silliq, blur sababli lag yo'q (bo'lsa blur kamaytiring)
- [ ] Bosqichlar o'tishi, progress saqlanishi (sahifani yangilab ko'ring)
- [ ] AI mijoz javobi kutish holati ko'rinadi
- [ ] Sekin internet holati (Safari/Chrome'da throttle yoki mobil data)

## PWA (webview oldidan)
- `manifest.webmanifest`: nom, `display: standalone`, `theme_color`, 192/512 ikonka.
- iOS: Safari → Ulashish → "Bosh ekranga qo'shish", standalone rejimda qayta tekshiring (safe-area va status bar).

## Webview
- Avval PWA ishlasin. Keyin **Capacitor** (`npx cap add ios/android`) yoki **Telegram Mini App**.
- Webview'da `100vh` muammosi bo'lishi mumkin: `100dvh` ishlating.
- Capacitor/Telegram qo'shilganda safe-area va orqaga tugmasini qayta sinang.

## Xato topilsa
Muammoni `docs/KEYINGI_ISHLAR.md` ga qisqa yozing (qurilma, ekran, nima bo'ldi) yoki hoziroq tuzating.
