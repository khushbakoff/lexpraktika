#!/bin/sh
# Lex.uz dan manba hujjatlarini yuklab, matnga aylantiradi (.research/ ga). Manbalarni tekshirish uchun.
# Ishlatish: sh scripts/lex/fetch-lex.sh
set -e
cd "$(dirname "$0")/../.."
mkdir -p .research/raw
fetch() { # nom id
  curl -sL -m 120 -A "Mozilla/5.0" "https://lex.uz/docs/$2" -o ".research/raw/$1.html"
  python3 -I scripts/lex/lex-html2txt.py ".research/raw/$1.html" ".research/$1.txt"
}
fetch mehnat 6257288     # Mehnat kodeksi (2022)
fetch fuqarolik2 -180552 # Fuqarolik kodeksi, ikkinchi qism
fetch isteMolchi -4704   # Isteʼmolchilarning huquqlarini himoya qilish toʻgʻrisida
fetch oila -104720        # Oila kodeksi
fetch shaxsiy -4396419   # Shaxsga doir maʼlumotlar toʻgʻrisida (OʻRQ-547)
fetch murojaat -2509996  # Jismoniy va yuridik shaxslarning murojaatlari (OʻRQ-378)
fetch notariat -54458    # Notariat toʻgʻrisida (343-I)
fetch jpk -111460        # Jinoyat-protsessual kodeksi
fetch jk -111453         # Jinoyat kodeksi
fetch mjtk -97664        # Maʼmuriy javobgarlik toʻgʻrisidagi kodeks
fetch fpk -3517337       # Fuqarolik protsessual kodeksi
