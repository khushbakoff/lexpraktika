#!/usr/bin/env python3
"""Har manbaga modda sarlavhasi (heading) va kerakli qism matni (text) yozadi. Ilovada manba bosilganda shu ko'rsatiladi.
Iqtibos (quote) matnda ⟦ ⟧ belgilari bilan ajratiladi. Avval: sh scripts/fetch-lex.sh. Keyin: python3 -I scripts/fill-source-text.py"""
import json, re, sys, glob, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FILES = {"https://lex.uz/docs/6257288": "mehnat.txt", "https://lex.uz/docs/-180552": "fuqarolik2.txt", "https://lex.uz/docs/-4704": "isteMolchi.txt",
         "https://lex.uz/docs/-104720": "oila.txt", "https://lex.uz/docs/-4396419": "shaxsiy.txt", "https://lex.uz/docs/-2509996": "murojaat.txt", "https://lex.uz/docs/-54458": "notariat.txt",
         "https://lex.uz/docs/-111460": "jpk.txt", "https://lex.uz/docs/-111453": "jk.txt", "https://lex.uz/docs/-97664": "mjtk.txt", "https://lex.uz/docs/-3517337": "fpk.txt",
         "https://lex.uz/docs/-54503": "advokatura.txt", "https://lex.uz/docs/-106197": "prokuratura.txt", "https://lex.uz/docs/-4138215": "yoriqnoma.txt"}
HEAD = re.compile(r"^(\d+)-(?:модда|modda)\.")
JUNK = re.compile(r"(Hujjatga taklif yuborish|Audioni tinglash|Hujjat elementidan havola olish|Ҳужжатга таклиф юбориш|Аудиони тинглаш|Ҳужжат элементидан ҳавола олиш|LexUZ sharhi|LexUZ шарҳи|Oldingi tahrirga qarang|Олдинги таҳрирга қаранг|^\[OKOZ|^\[ОКОЗ|^\d\.\d\d\.\d\d|tahririda —|таҳририда —|Qonunchilik maʼlumotlari milliy bazasi|^Qarang:|^Қаранг:|^\(\d+-modda)")
MAXLEN = 1100

def apos(s):
    for ch in "ʻʼ’‘`´'": s = s.replace(ch, "'")
    return s

def norm1(s):  # 1:1 (uzunlik o'zgarmaydi): kichik harf + apostrof
    return apos(s.lower())

ITEM = re.compile(r"^(\d+1?)\. ")
SUP = {"¹": "1", "²": "2", "³": "3"}
def key_of(article):
    m = re.match(r"(\d+)([¹²³]?)", article)
    return (m.group(1) + SUP.get(m.group(2), "")) if m else None

arts = {}
def load(name):
    if name in arts: return arts[name]
    lines = open(os.path.join(ROOT, ".research", name), encoding="utf-8").read().split("\n")
    if name == "yoriqnoma.txt":
        first = next(i for i, l in enumerate(lines) if l.startswith("1-bob."))
        start = next(i for i, l in enumerate(lines) if i > first + 5 and l.startswith("1-bob."))
        idx = [(i, ITEM.match(l).group(1)) for i, l in enumerate(lines) if i >= start and ITEM.match(l)]
        body = {}
        for k, (i, n) in enumerate(idx):
            end = idx[k + 1][0] if k + 1 < len(idx) else len(lines)
            seg = [re.sub(r"\s+", " ", l).strip() for l in lines[i:end]]
            seg = [l for l in seg if l and not JUNK.search(l)]
            if seg and n not in body:
                first = seg[0].split(". ", 1)[-1]          # "3. Notarius ..." -> "Notarius ..."
                body[n] = [f"{n}-band."] + [first] + seg[1:]   # sarlavha + butun matn
        arts[name] = body
        return body
    idx = [(i, HEAD.match(l).group(1)) for i, l in enumerate(lines) if HEAD.match(l)]
    body = {}
    for k, (i, n) in enumerate(idx):
        end = idx[k + 1][0] if k + 1 < len(idx) else len(lines)
        seg = [re.sub(r"\s+", " ", l).strip() for l in lines[i:end]]
        seg = [l for l in seg if l and not JUNK.search(l)]
        body[n] = seg          # oxirgi uchragan = modda tanasi (mundarija emas)
    arts[name] = body
    return body

def excerpt(seg, quote):
    head, lines = seg[0], seg[1:]
    q = norm1(re.sub(r"\s+", " ", quote).strip())
    for i, l in enumerate(lines):
        j = norm1(l).find(q)
        if j < 0: continue
        picked = [l]
        # ro'yxat bandi bo'lsa, kirish jumlasini ham qo'shamiz
        if i > 0 and (lines[i - 1].rstrip().endswith(":") or (len(l) < 170 and not l.rstrip().endswith("."))):
            picked.insert(0, lines[i - 1])
        txt = "\n".join(picked)
        pos = txt.find(l) + j
        txt = txt[:pos] + "⟦" + txt[pos:pos + len(q)] + "⟧" + txt[pos + len(q):]
        if len(txt) > MAXLEN:  # juda uzun bo'lsa, iqtibos atrofini kesamiz
            a = max(0, txt.find("⟦") - 450); b = min(len(txt), txt.find("⟧") + 450)
            txt = ("…" if a else "") + txt[a:b] + ("…" if b < len(txt) else "")
        return head, txt
    return head, None

def walk(o, out):
    if isinstance(o, dict):
        if {"act", "article", "url", "quote"} <= o.keys(): out.append(o)
        for v in o.values(): walk(v, out)
    elif isinstance(o, list):
        for v in o: walk(v, out)

bad = total = 0
for f in sorted((glob.glob(os.path.join(ROOT, "content", "scenarios", "*.json")) + glob.glob(os.path.join(ROOT, "content", "employers", "*.json")))):
    data = json.load(open(f, encoding="utf-8")); srcs = []; walk(data, srcs)
    for s in srcs:
        total += 1
        name = FILES.get(s["url"]); n = key_of(s["article"])
        seg = load(name).get(n) if name and n else None
        if not seg or not s["quote"]: bad += 1; print("XATO", os.path.basename(f), s["article"]); continue
        head, txt = excerpt(seg, s["quote"])
        if txt is None: bad += 1; print("XATO iqtibos:", os.path.basename(f), s["article"], s["quote"][:50]); continue
        s["heading"] = head; s["text"] = txt
    json.dump(data, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2); open(f, "a").write("\n")
print(f"Matn yozildi: {total} manba, xato: {bad}")
sys.exit(1 if bad else 0)
