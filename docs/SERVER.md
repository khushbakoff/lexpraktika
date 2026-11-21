# Server (production)

- **Manzil:** https://lex.193-180-213-14.sslip.io (nginx + Let's Encrypt; sslip.io domen IP ga o'zi yo'naltiradi). To'g'ridan-to'g'ri http://193.180.213.14:3200 ham ochiq, lekin `COOKIE_SECURE=true` bo'lgani uchun kirish faqat HTTPS orqali ishlaydi. nginx sozlamasi: `/etc/nginx/sites-available/lexpraktika` (qalqon-vpn bloki bilan bir xil sslip hostini ishlatmaslik uchun `lex.` prefiksi bor).
- **Server:** Ubuntu 24.04, boshqa loyihalar bilan umumiy (logistik, olimjon-market va h.k.). Xotira tig'iz (14 GB dan ~12 GB band, swap deyarli to'la), shuning uchun LexPraktika xotirasi cheklangan.
- **LexPraktika joyi:** `/var/www/lexsim` (egasi: deploy foydalanuvchisi), xizmat: `systemd` `lexsim.service`, port **3200**, xotira `MemoryHigh=300M`, `MemoryMax=400M`.
- **Baza:** umumiy MongoDB (`127.0.0.1:27017`), **alohida `lexsim` bazasi**. Boshqa bazalarga tegilmaydi. Autentifikatsiya serverda yoqilmagan (mongod faqat localhost'da), bu LexPraktika'ga bog'liq emas.
- **Sirlar:** `/var/www/lexsim/.env.production` (mode 600): `MONGODB_URI`, `MONGODB_DB`, `SESSION_SECRET`, `COOKIE_SECURE`. Ixtiyoriy: `AI_API_KEY`, `AI_MODEL`, `DEFAULT_PLAN`, `APP_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` (`.env.example` ga qarang). Git'ga yoki chatga qo'ymang.
- **Firewall:** `ufw allow 3200/tcp` (faqat LexPraktika porti qo'shilgan).

## Yangilash (deploy)
```
sh scripts/deploy.sh
```
Mahalliy build qiladi, paketlaydi, serverga yuklaydi, xizmatni qayta ishga tushiradi va 200 qaytishini tekshiradi. `.env.production` o'zgarmaydi.

## Foydali buyruqlar
```
ssh "$LEXSIM_HOST" 'systemctl status lexsim --no-pager'
ssh "$LEXSIM_HOST" 'journalctl -u lexsim -n 100 --no-pager'
ssh "$LEXSIM_HOST" 'sudo systemctl restart lexsim'
```
Demo ma'lumot yuklash (SSH tunnel orqali): `ssh -f -N -L 27018:127.0.0.1:27017 "$LEXSIM_HOST"` so'ng `MONGODB_URI=mongodb://127.0.0.1:27018 MONGODB_DB=lexsim npm run seed`.

## LexPraktika'ni serverdan to'liq olib tashlash (boshqa loyihalarga ta'sir qilmaydi)
```
sudo systemctl disable --now lexsim && sudo rm /etc/systemd/system/lexsim.service && sudo systemctl daemon-reload
sudo ufw delete allow 3200/tcp
rm -rf /var/www/lexsim
mongosh mongodb://127.0.0.1:27017/lexsim --eval 'db.dropDatabase()'
```

## Mahalliy ishlab chiqish
`.env.local` da `MONGODB_URI`/`MONGODB_DB`/`SESSION_SECRET` bo'lishi kerak. Mahalliy mongod: `mongod --dbpath <papka> --port 27099`, `MONGODB_URI=mongodb://127.0.0.1:27099`, `MONGODB_DB=lexsim_test`. Android ilovani mahalliy serverga ulash: `CAP_DEV=1 npx cap sync android` va `adb reverse tcp:3000 tcp:3000`.

## Majburiy ro'yxatdan o'tish
`proxy.ts` kirmagan foydalanuvchini `/kirish` ga yo'naltiradi (ochiq: `/kirish`, `/maxfiylik`, `/shartlar`, `/api/auth/*`). `MONGODB_URI` yoki `SESSION_SECRET` yo'q bo'lsa tekshiruv o'chadi (mahalliy rejim).

## Telegram bot va Mini App
Bot: @LexPraktika_bot. Mini App manzili `APP_URL`. Kirish: `/api/auth/telegram-webapp` (initData imzosi tekshiriladi), `/start` javobi: `/api/telegram/webhook`.
Qayta sozlash (token yoki manzil o'zgarsa): `cat scripts/telegram-setup.mjs | ssh HOST 'cat > /tmp/s.mjs && node --env-file=/var/www/lexsim/.env.production /tmp/s.mjs'`.
Xotira: `/etc/systemd/system/lexsim.service.d/override.conf` (heap 256 MB, MemoryMax 480M): huquqiy yordamchi moddalar indeksi (~35 MB) uchun.
