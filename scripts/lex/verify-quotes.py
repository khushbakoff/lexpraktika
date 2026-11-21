#!/usr/bin/env python3
"""Vaziyatlardagi har bir manba iqtibosi Lex.uz matnining ko'rsatilgan moddasida aynan borligini tekshiradi.
Avval: sh scripts/lex/fetch-lex.sh   Keyin: python3 -I scripts/lex/verify-quotes.py"""
import json, re, sys, glob, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
FILES = {"https://lex.uz/docs/6257288": "mehnat.txt", "https://lex.uz/docs/-180552": "fuqarolik2.txt", "https://lex.uz/docs/-4704": "isteMolchi.txt",
         "https://lex.uz/docs/-104720": "oila.txt", "https://lex.uz/docs/-4396419": "shaxsiy.txt", "https://lex.uz/docs/-2509996": "murojaat.txt", "https://lex.uz/docs/-54458": "notariat.txt",
         "https://lex.uz/docs/-111460": "jpk.txt", "https://lex.uz/docs/-111453": "jk.txt", "https://lex.uz/docs/-97664": "mjtk.txt", "https://lex.uz/docs/-3517337": "fpk.txt",
         "https://lex.uz/docs/-54503": "advokatura.txt", "https://lex.uz/docs/-106197": "prokuratura.txt", "https://lex.uz/docs/-4138215": "yoriqnoma.txt"}
HEAD = re.compile(r"^(\d+)-(?:модда|modda)\.")

def norm(s):
    s = s.lower()
    for ch in "ʻʼ’‘`´'": s = s.replace(ch, "'")
    return re.sub(r"\s+", " ", s).strip()

ITEM = re.compile(r"^(\d+1?)\. ")
SUP = {"¹": "1", "²": "2", "³": "3"}
def key_of(article):
    m = re.match(r"(\d+)([¹²³]?)", article)
    return (m.group(1) + SUP.get(m.group(2), "")) if m else None

docs = {}
def articles(name):
    if name in docs: return docs[name]
    path = os.path.join(ROOT, ".research", name)
    if not os.path.exists(path):
        sys.exit(f"{path} yo'q. Avval: sh scripts/lex/fetch-lex.sh")
    lines = open(path, encoding="utf-8").read().split("\n")
    if name == "yoriqnoma.txt":   # bandlar: "3. Notarius ..." (asosiy matn 1-bobdan keyin)
        start = next(i for i, l in enumerate(lines) if l.startswith("1-bob."))
        start = next(i for i, l in enumerate(lines) if i > start + 5 and l.startswith("1-bob."))
        pat = ITEM
        idx = [(i, ITEM.match(l).group(1)) for i, l in enumerate(lines) if i >= start and ITEM.match(l)]
        body = {}
        for k, (i, n) in enumerate(idx):
            end = idx[k + 1][0] if k + 1 < len(idx) else len(lines)
            body.setdefault(n, norm(" ".join(lines[i:end])))      # birinchi uchragan (asosiy matn)
        docs[name] = body
        return body
    idx = [(i, HEAD.match(l).group(1)) for i, l in enumerate(lines) if HEAD.match(l)]
    body = {}
    for k, (i, n) in enumerate(idx):
        end = idx[k + 1][0] if k + 1 < len(idx) else len(lines)
        body[n] = norm(" ".join(lines[i:end]))   # oxirgi uchragan (tana) yozadi, mundarija emas
    docs[name] = body
    return body

def walk(o, out):
    if isinstance(o, dict):
        if {"act", "article", "url", "quote"} <= o.keys(): out.append(o)
        for v in o.values(): walk(v, out)
    elif isinstance(o, list):
        for v in o: walk(v, out)

bad = total = 0
for f in sorted((glob.glob(os.path.join(ROOT, "content", "scenarios", "*.json")) + glob.glob(os.path.join(ROOT, "content", "employers", "*.json")))):
    srcs = []; walk(json.load(open(f, encoding="utf-8")), srcs)
    for s in srcs:
        total += 1
        name = FILES.get(s["url"])
        n = key_of(s["article"])
        if not name or not n: print(f"XATO {os.path.basename(f)}: noma'lum manba {s['url']} / {s['article']}"); bad += 1; continue
        art = articles(name).get(n)
        if art is None: print(f"XATO {os.path.basename(f)}: {s['article']} topilmadi"); bad += 1; continue
        if not s["quote"]: print(f"OGOH {os.path.basename(f)}: {s['article']} iqtibossiz"); continue
        if norm(s["quote"]) not in art:
            print(f"XATO {os.path.basename(f)}: {s['article']} da iqtibos topilmadi: {s['quote'][:70]}..."); bad += 1
print(f"Tekshirildi: {total} manba, xato: {bad}")
sys.exit(1 if bad else 0)
