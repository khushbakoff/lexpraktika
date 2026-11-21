import json, os
OUT = os.path.expanduser("~/lexsim/content/scenarios")

ACT = {
    "M": ("Oʻzbekiston Respublikasining Mehnat kodeksi (2022)", "https://lex.uz/docs/6257288"),
    "F": ("Oʻzbekiston Respublikasining Fuqarolik kodeksi (ikkinchi qism)", "https://lex.uz/docs/-180552"),
    "I": ("«Isteʼmolchilarning huquqlarini himoya qilish toʻgʻrisida»gi Qonun (221-I-son)", "https://lex.uz/docs/-4704"),
    "O": ("Oʻzbekiston Respublikasining Oila kodeksi", "https://lex.uz/docs/-104720"),
    "P": ("«Shaxsga doir maʼlumotlar toʻgʻrisida»gi Qonun (OʻRQ-547-son)", "https://lex.uz/docs/-4396419"),
    "R": ("«Jismoniy va yuridik shaxslarning murojaatlari toʻgʻrisida»gi Qonun (OʻRQ-378-son)", "https://lex.uz/docs/-2509996"),
    "N": ("«Notariat toʻgʻrisida»gi Qonun (343-I-son)", "https://lex.uz/docs/-54458"),
    "J": ("Oʻzbekiston Respublikasining Jinoyat-protsessual kodeksi", "https://lex.uz/docs/-111460"),
    "K": ("Oʻzbekiston Respublikasining Jinoyat kodeksi", "https://lex.uz/docs/-111453"),
    "A": ("Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi", "https://lex.uz/docs/-97664"),
    "C": ("Oʻzbekiston Respublikasining Fuqarolik protsessual kodeksi", "https://lex.uz/docs/-3517337"),
}


def S(k, article, quote):
    act, url = ACT[k]
    return {"act": act, "article": article, "url": url, "quote": quote}


def opt(id, label, required, why, *sources):
    return {"id": id, "label": label, "required": required, "why": why, "sources": list(sources)}


def ch(id, label, correct, why, options, *sources):
    return {"id": id, "label": label, "kind": "choice", "options": [{"id": a, "label": b} for a, b in options],
            "correct": correct, "why": why, "sources": list(sources)}


def num(id, label, correct, why, *sources):
    return {"id": id, "label": label, "kind": "number", "options": [], "correct": correct, "why": why,
            "sources": list(sources)}


def scenario(*, id, title, area, areaId, tracks, level, summary, persona, opening,
             facts, filler, multi, form, order, quiz):
    """facts: [(id, fakt, savol, javob), ...] (dastlabki 3 tasi majburiy). Ballar: 15/20/25/20/20."""
    req = [f[0] for f in facts[:3]]
    steps = [
        {"id": "facts", "type": "client-chat", "title": "Faktlarni aniqlang", "sources": [], "points": 15,
         "description": "Mijozdan kerakli faktlarni so'rang.", "requiredFactIds": req,
         "questions": [{"id": "q-" + f[0], "text": f[2], "factId": f[0], "reply": f[3]} for f in facts]
                      + [{"id": "q-filler", "text": filler[0], "factId": None, "reply": filler[1]}]},
        {"id": "multi", "type": "document-pick", "title": multi["title"], "sources": [], "points": 20,
         "description": multi["desc"], "prompt": multi["prompt"], "submitLabel": "Javobni topshirish",
         "options": [opt(*o[:4], *o[4:]) for o in multi["opts"]]},
        {"id": "application", "type": "form", "title": form["title"], "sources": [], "points": 25,
         "description": form["desc"], "rubric": [], "fields": form["fields"]},
        {"id": "procedure", "type": "authority-pick", "title": order["title"], "sources": [], "points": 20,
         "description": order["desc"],
         "order": [{"id": i[0], "label": i[1], "sources": [i[2]]} for i in order["items"]]},
        {"id": "deadline", "type": "deadline-pick", "title": quiz["title"], "sources": [quiz["src"]], "points": 20,
         "description": quiz["text"], "options": [{"id": a, "label": b} for a, b in quiz["opts"]], "correct": quiz["correct"]},
    ]
    assert sum(s["points"] for s in steps) == 100
    d = {"id": id, "title": title, "area": area, "areaId": areaId, "tracks": tracks, "level": level, "status": "sample",
         "reviewedBy": None, "summary": summary,
         "client": {"persona": persona, "openingLine": opening,
                    "hiddenFacts": [{"id": f[0], "fact": f[1], "revealOn": []} for f in facts]},
         "steps": steps}
    with open(os.path.join(OUT, id + ".json"), "w", encoding="utf-8") as fh:
        json.dump(d, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    return id
