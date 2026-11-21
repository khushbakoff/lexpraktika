#!/usr/bin/env python3
"""Yo'nalish x daraja bo'yicha vaziyatlar soni. Maqsad: har katakda 10 ta ko'rinadi (qo'shni darajalar bilan to'ldirib)."""
import json, glob, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
TR = ["advokat", "sudya", "huquq-tartibot", "notarius", "korxona", "davlat", "umumiy"]
rows = [json.load(open(f, encoding="utf-8")) for f in sorted(glob.glob(os.path.join(ROOT, "content", "scenarios", "*.json")))]
print(f"Jami vaziyat: {len(rows)}   (daraja 1/2/3: " + "/".join(str(sum(1 for r in rows if r['level'] == l)) for l in (1, 2, 3)) + ")\n")
print(f"{'yo`nalish':16}{'d1':>4}{'d2':>4}{'d3':>4}{'jami':>6}   daraja tanlansa ko'rinadigan (o'zi+qo'shni)")
bad = False
for t in TR:
    mine = [r for r in rows if t in r["tracks"] or t == "umumiy"]
    c = [sum(1 for r in mine if r["level"] == l) for l in (1, 2, 3)]
    # daraja tanlanganda: o'z darajasi birinchi, yetmasa qo'shni darajalar bilan; kamida min(10, jami)
    shown = [len(mine) if len(mine) < 10 else 10 for _ in (1, 2, 3)]
    flag = "" if len(mine) >= 10 else "  <-- 10 tadan kam"
    if len(mine) < 10: bad = True
    own = " ".join(f"{x:>3}" for x in c)
    print(f"{t:16}{c[0]:>4}{c[1]:>4}{c[2]:>4}{len(mine):>6}   {'10+' if len(mine) >= 10 else len(mine)}{flag}")
print("\nStrict daraja (faqat o'z darajasi, >=10):")
for t in TR:
    mine = [r for r in rows if t in r["tracks"] or t == "umumiy"]
    c = [sum(1 for r in mine if r["level"] == l) for l in (1, 2, 3)]
    print(f"  {t:16}" + "  ".join(("OK " if x >= 10 else f"{x:>2} ") for x in c))
raise SystemExit(1 if bad else 0)
