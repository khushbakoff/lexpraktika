#!/bin/sh
# LexPraktika ni serverga yuklash: mahalliy build -> arxiv -> serverda almashtirish -> xizmatni qayta ishga tushirish.
# Boshqa loyihalarga tegmaydi: faqat /var/www/lexsim va lexsim xizmati. Sirlar (.env.production) serverda qoladi.
# Ishlatish: sh scripts/deploy.sh        (HOST ni o'zgartirish: LEXSIM_HOST=user@host sh scripts/deploy.sh)
set -e
cd "$(dirname "$0")/.."
HOST="${LEXSIM_HOST:-ismoil12@193.180.213.14}"
URL="${LEXSIM_URL:-https://lex.193-180-213-14.sslip.io}"
STAGE="$(mktemp -d)"

echo "1/5 build..."
npm run build >/dev/null
echo "2/5 paketlash..."
cp -R .next/standalone/. "$STAGE/"
mkdir -p "$STAGE/.next" && cp -R .next/static "$STAGE/.next/static" && cp -R public "$STAGE/public"
rm -rf "$STAGE/node_modules/@img"        # Mac binarylari Linux serverda kerak emas (rasmlar optimallashtirilmaydi)
COPYFILE_DISABLE=1 tar czf "$STAGE.tgz" -C "$STAGE" .
echo "3/5 yuklash ($(du -h "$STAGE.tgz" | cut -f1))..."
scp -q -o BatchMode=yes "$STAGE.tgz" "$HOST:/var/www/lexsim/app.tgz"
echo "4/5 serverda almashtirish..."
ssh -o BatchMode=yes "$HOST" 'cd /var/www/lexsim && rm -rf .next node_modules public server.js package.json && tar xzf app.tgz 2>/dev/null && rm app.tgz && sudo -n systemctl restart lexsim'
rm -rf "$STAGE" "$STAGE.tgz"
echo "5/5 tekshirish..."
sleep 4
CODE=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$URL/kirish")
echo "$URL -> $CODE"
[ "$CODE" = "200" ] || { echo "XATO: sayt 200 qaytarmadi. Loglar: ssh $HOST 'journalctl -u lexsim -n 50'"; exit 1; }
