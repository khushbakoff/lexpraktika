#!/usr/bin/env python3
"""Har manbaga Lex.uz sahifasidagi modda elementining id'sini (`anchor`) yozadi, shunda "Lex.uz da ochish"
tugmasi aynan shu moddaga olib boradi (https://lex.uz/docs/<hujjat>#<anchor>).
Avval: sh scripts/fetch-lex.sh. Keyin: python3 -I scripts/add-anchors.py"""
import json, re, glob, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
RAW = {"https://lex.uz/docs/6257288": "lex6257288", "https://lex.uz/docs/-180552": "lex180552", "https://lex.uz/docs/-4704": "lex4704",
       "https://lex.uz/docs/-104720": "oila", "https://lex.uz/docs/-4396419": "shaxsiy", "https://lex.uz/docs/-2509996": "murojaat",
       "https://lex.uz/docs/-54458": "notariat", "https://lex.uz/docs/-111460": "jpk", "https://lex.uz/docs/-111453": "jk",
       "https://lex.uz/docs/-97664": "mjtk", "https://lex.uz/docs/-3517337": "fpk", "https://lex.uz/docs/-54503": "advokatura",
       "https://lex.uz/docs/-106197": "prokuratura"}
SUP = {"¹": "1", "²": "2", "³": "3"}
EL = re.compile(r'<div name="(-?\d+)" id="-?\d+">(\d+)(?:([¹²³])|<sup>(\d)</sup>)?-(?:модда|modda)\.')
cache = {}

def anchors(url):
    if url in cache: return cache[url]
    path = os.path.join(ROOT, ".research", "raw", RAW[url] + ".html")
    out, sup = {}, {}
    for m in EL.finditer(open(path, encoding="utf-8").read()):
        d = SUP.get(m.group(3), "") or (m.group(4) or "")
        (sup if m.group(3) is None and m.group(4) else out).setdefault(m.group(2) + d, m.group(1))
    for k, v in sup.items(): out.setdefault(k, v)  # "15<sup>1</sup>" ni "151" deb yozgan bo'lsa ham topiladi
    cache[url] = out
    return out

stats = {"ok": 0, "yo'q": 0, "o'tkazildi": 0}
def walk(o):
    if isinstance(o, dict):
        if "act" in o and "url" in o:
            m = re.match(r"(\d+)([¹²³]?)-modda", o.get("article", ""))
            if o["url"] in RAW and m:
                a = anchors(o["url"]).get(m.group(1) + SUP.get(m.group(2), ""))
                if a: o["anchor"] = a; stats["ok"] += 1
                else: o.pop("anchor", None); stats["yo'q"] += 1; print("TOPILMADI", o["url"], o["article"])
            else: stats["o'tkazildi"] += 1
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)

for f in sorted(glob.glob(os.path.join(ROOT, "content", "scenarios", "*.json"))):
    data = json.load(open(f, encoding="utf-8"))
    walk(data)
    json.dump(data, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2); open(f, "a").write("\n")
print(stats)
