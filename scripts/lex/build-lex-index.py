#!/usr/bin/env python3
"""Lex.uz dan yuklangan hujjatlardan modda indeksi (content/lex-index.json): huquqiy yordamchi shu moddalar ichidan qidiradi.
Avval: sh scripts/lex/fetch-lex.sh. Keyin: python3 -I scripts/lex/build-lex-index.py"""
import json, re, glob, os, html as H

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
RAW = {"lex6257288": "https://lex.uz/docs/6257288", "lex180552": "https://lex.uz/docs/-180552", "lex4704": "https://lex.uz/docs/-4704",
       "oila": "https://lex.uz/docs/-104720", "shaxsiy": "https://lex.uz/docs/-4396419", "murojaat": "https://lex.uz/docs/-2509996",
       "notariat": "https://lex.uz/docs/-54458", "jpk": "https://lex.uz/docs/-111460", "jk": "https://lex.uz/docs/-111453",
       "mjtk": "https://lex.uz/docs/-97664", "fpk": "https://lex.uz/docs/-3517337", "advokatura": "https://lex.uz/docs/-54503",
       "prokuratura": "https://lex.uz/docs/-106197"}

# Hujjat nomlari: vaziyat JSON'laridagi `act` maydonidan
ACT = {}
def walk(o):
    if isinstance(o, dict):
        if "act" in o and "url" in o and o["url"] not in ACT: ACT[o["url"]] = o["act"]
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
for f in glob.glob(os.path.join(ROOT, "content", "scenarios", "*.json")): walk(json.load(open(f, encoding="utf-8")))

HEAD = re.compile(r'<div name="(-?\d+)" id="-?\d+">(\d+)(?:<sup>(\d)</sup>|([¹²³]))?-(?:модда|modda)\.')
NOISE = re.compile(r"^\[(?:ОКОЗ|OKOZ)|Hujjatga taklif|Audioni tinglash|Hujjat elementidan|Ҳужжатга таклиф|Аудиони тинглаш|Ҳужжат элементидан|LexUZ sharhi|LexUZ шарҳи|^Oldingi tahrirga|^Олдинги таҳрирга")
SUPD = {"¹": "1", "²": "2", "³": "3"}

def lines(frag):
    frag = re.sub(r"<(script|style)[\s\S]*?</\1>", "", frag)
    frag = re.sub(r"</(div|p|li|tr|h\d)>|<br\s*/?>", "\n", frag)
    frag = H.unescape(re.sub(r"<[^>]+>", "", frag))
    out = [re.sub(r"\s+", " ", l).strip() for l in frag.split("\n")]
    return [l for l in out if l and not NOISE.search(l)]

items = []
for name, url in RAW.items():
    h = open(os.path.join(ROOT, ".research", "raw", name + ".html"), encoding="utf-8").read()
    ms = list(HEAD.finditer(h))
    seen = set()
    for i, m in enumerate(ms):
        end = ms[i + 1].start() if i + 1 < len(ms) else m.start() + 60000
        ln = lines(h[m.start():end])
        if len(ln) < 2: continue
        sup = m.group(3) or SUPD.get(m.group(4) or "", "")
        num = m.group(2) + (f"¹²³"[int(sup) - 1] if sup in ("1", "2", "3") else sup)
        if m.group(1) in seen: continue
        seen.add(m.group(1))
        items.append({"u": url, "a": ACT.get(url, name), "n": f"{num}-modda", "id": m.group(1), "h": ln[0][:200], "t": " ".join(ln[1:])[:2500]})
    print(name, len(seen))
json.dump({"builtAt": __import__("datetime").date.fromtimestamp(max(os.path.getmtime(os.path.join(ROOT, ".research", "raw", n + ".html")) for n in RAW)).isoformat(), "items": items}, open(os.path.join(ROOT, "content", "lex-index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("jami", len(items), os.path.getsize(os.path.join(ROOT, "content", "lex-index.json")) // 1024, "KB")
