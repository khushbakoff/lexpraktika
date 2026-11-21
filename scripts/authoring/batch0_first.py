import json, os

OUT = os.path.expanduser("~/lexsim/content/scenarios")

ACT = {
    "M": ("Oʻzbekiston Respublikasining Mehnat kodeksi (2022)", "https://lex.uz/docs/6257288"),
    "F": ("Oʻzbekiston Respublikasining Fuqarolik kodeksi (ikkinchi qism)", "https://lex.uz/docs/-180552"),
    "I": ("«Isteʼmolchilarning huquqlarini himoya qilish toʻgʻrisida»gi Qonun (221-I-son)", "https://lex.uz/docs/-4704"),
}


def S(k, article, quote=""):
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


def fact(id, text, reveal):
    return {"id": id, "fact": text, "revealOn": reveal}


def q(id, text, fact_id, reply):
    return {"id": id, "text": text, "factId": fact_id, "reply": reply}


def write(name, d):
    assert sum(s["points"] for s in d["steps"]) == 100, name
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
        f.write("\n")


# ===================================================================== MEHNAT
write("mehnat-ish-haqi.json", {
    "id": "mehnat-ish-haqi", "title": "Ish haqim 3 oy to'lanmadi", "area": "Mehnat huquqi", "areaId": "mehnat",
    "tracks": ["advokat", "korxona", "davlat", "umumiy"], "level": 1, "status": "sample", "reviewedBy": None,
    "summary": "Mijozga ish haqi 3 oydan beri to'lanmagan. Dalillarni yig'ing, nizoni ko'ruvchi organlarni aniqlang, ariza tuzing, tartib va muddatni belgilang. Barcha asoslar Mehnat kodeksiga (Lex.uz) tayanadi.",
    "client": {
        "persona": "Aziz, 28 yosh, do'konda sotuvchi",
        "openingLine": "Assalomu alaykum. Ish haqim to'lanmayapti, nima qilsam bilmayman.",
        "hiddenFacts": [
            fact("since", "Ish haqi 3 oydan beri to'lanmagan", ["qachondan", "muddat"]),
            fact("amount", "Oylik ish haqi 3 000 000 so'm", ["qancha", "oylik"]),
            fact("contract", "Yozma mehnat shartnomasi bor, nusxasi uyda", ["shartnoma"]),
            fact("others", "Boshqa xodimlarga ham to'lanmagan", ["boshqa", "hamkasb"]),
        ],
    },
    "steps": [
        {"id": "facts", "type": "client-chat", "title": "Faktlarni aniqlang", "sources": [], "points": 15,
         "description": "Mijozdan qachondan, qancha, shartnoma bormi, boshqalarga ham to'lanmaganmi, shuni so'rang.",
         "requiredFactIds": ["since", "amount", "contract"],
         "questions": [
             q("q-since", "Ish haqi qachondan to'lanmayapti?", "since", "Taxminan 3 oydan beri bir tiyin ham bermadi."),
             q("q-amount", "Oylik ish haqingiz qancha?", "amount", "Kelishilgan oylik 3 000 000 so'm."),
             q("q-contract", "Yozma mehnat shartnomangiz bormi?", "contract", "Ha, imzolangan shartnoma bor, nusxasi uyda turibdi."),
             q("q-others", "Boshqa xodimlarga ham to'lanmayaptimi?", "others", "Ha, hamkasblarim ham shikoyat qilyapti."),
             q("q-fired", "Sizni ishdan bo'shatishganmi?", None, "Yo'q, hali ishlayapman."),
             q("q-hobby", "Bo'sh vaqtingizda nima qilasiz?", None, "Bu hozir muhim emas, ish haqim haqida gaplashaylik."),
         ]},
        {"id": "documents", "type": "document-pick", "title": "Dalillarni yig'ing", "sources": [], "points": 20,
         "description": "Arizaga qo'shiladigan dalillarni tanlang. Keraksizlari ham bor.",
         "prompt": "Ariza talablarni tasdiqlovchi dalillar bilan birga beriladi. Kerakli dalillarni belgilang.",
         "submitLabel": "Dalillarni topshirish",
         "options": [
             opt("contract", "Mehnat shartnomasi", True,
                 "Xodim va ish beruvchi o'rtasidagi mehnat munosabati mehnat shartnomasi asosida yuzaga keladi (26-modda).",
                 S("M", "26-modda", "меҳнат шартномаси асосида юзага келади")),
             opt("order", "Ishga qabul qilish buyrug'i", True,
                 "Ishga qabul qilish ish beruvchining buyrug'i bilan rasmiylashtiriladi, buyruq shartnoma asosida chiqariladi (127-modda).",
                 S("M", "127-modda", "Буйруқ чиқариш учун ходим билан тузилган меҳнат шартномаси асос бўлади.")),
             opt("bank", "Bank ko'chirmasi (to'lovlar tarixi)", True,
                 "Ariza xodimda mavjud bo'lgan, talablarni tasdiqlovchi dalillarni ko'rsatishi kerak (549-modda). To'lovlar qachon bo'lgani ko'chirmadan ko'rinadi.",
                 S("M", "549-modda", "ходимнинг важларини тасдиқловчи ўзида мавжуд бўлган важлар")),
             opt("birth", "Tug'ilganlik haqida guvohnoma", False,
                 "Bu hujjat ish haqi talabini tasdiqlamaydi. Arizadagi dalillar xodimning talablarini asoslashi kerak (549-modda).",
                 S("M", "549-modda", "ходимнинг важларини тасдиқловчи ўзида мавжуд бўлган важлар")),
             opt("diploma", "Diplom nusxasi", False,
                 "Ish haqi nizosida talabni tasdiqlovchi dalil emas (549-modda).",
                 S("M", "549-modda", "ходимнинг важларини тасдиқловчи ўзида мавжуд бўлган важлар")),
         ]},
        {"id": "bodies", "type": "document-pick", "title": "Nizoni qaysi organ ko'radi?", "sources": [], "points": 15,
         "description": "Ish haqi bo'yicha yakka tartibdagi mehnat nizosini ko'ruvchi organlarni aniqlang.",
         "prompt": "Yakka tartibdagi mehnat nizosini qaysi organlar ko'rib chiqadi? To'g'ri variantlarning hammasini belgilang.",
         "submitLabel": "Javobni topshirish",
         "options": [
             opt("commission", "Mehnat nizolari bo'yicha komissiya", True,
                 "Yakka tartibdagi mehnat nizolari mehnat nizolari bo'yicha komissiyalar tomonidan ko'riladi (545-modda).",
                 S("M", "545-modda", "меҳнат низолари бўйича комиссиялар томонидан")),
             opt("court", "Sud", True,
                 "Xodim nizoni hal qilish uchun o'z tanloviga ko'ra komissiyaga yoki bevosita sudga murojaat etishga haqli (545-modda).",
                 S("M", "545-modda", "Ходим меҳнат низосини ҳал қилиш учун ўз танловига кўра меҳнат низолари бўйича комиссияга ёки бевосита судга мурожаат этишга ҳақли.")),
             opt("inspection", "Davlat mehnat inspeksiyasi", False,
                 "545-moddada nizoni ko'ruvchi organ sifatida faqat komissiya va sud ko'rsatilgan. Inspeksiya mansabdor shaxslari nizo ko'rilishi uchun sudga murojaat qilish huquqiga ega (559-modda).",
                 S("M", "545-modda", "меҳнат низолари бўйича комиссиялар томонидан"),
                 S("M", "559-modda", "Давлат меҳнат инспекциясининг мансабдор шахслари;")),
             opt("prosecutor", "Prokuratura", False,
                 "Prokuror nizo ko'rilishi uchun sudga murojaat qilish huquqiga ega, lekin nizoni ko'ruvchi organ emas (545, 559-moddalar).",
                 S("M", "559-modda", "прокурор.")),
             opt("employer", "Ish beruvchining rahbari", False,
                 "Pulga oid da'vo xususiyatidagi nizolar komissiya yoki sudda ko'riladi (543, 545-moddalar). Ish beruvchi va kasaba uyushmasi qo'mitasi mehnat shartlarini o'zgartirish haqidagi da'vosiz nizolarni hal etadi (543-modda).",
                 S("M", "543-modda", "иш берувчи ва касаба уюшмаси қўмитаси томонидан ҳал этилади")),
         ]},
        {"id": "application", "type": "form", "title": "Ariza yozing", "sources": [], "points": 20,
         "description": "Komissiyaga beriladigan ariza maydonlarini to'ldiring.", "rubric": [],
         "fields": [
             ch("date", "Arizada qaysi sana ko'rsatiladi?", "knew",
                "Arizada xodim huquqi buzilganini bilgan yoki bilishi kerak bo'lgan sana ko'rsatiladi (549-modda). Murojaat muddati shu sanadan hisoblanadi.",
                [("written", "Arizani yozgan sana"), ("knew", "Huquqi buzilganini bilgan (bilishi kerak bo'lgan) sana"), ("hired", "Ishga kirgan sana")],
                S("M", "549-modda", "сана (ходим ўз ҳуқуқи бузилганлиги тўғрисида билган ёки билиши керак бўлган")),
             ch("demand", "Nimani talab qilasiz?", "pay",
                "Ish beruvchi to'lov muddatini buzsa, har bir kechiktirilgan kun uchun pulli kompensatsiya bilan birga to'laydi (333-modda). Pulga oid talablar asosli bo'lsa, to'liq miqdorda qanoatlantiriladi (546-modda).",
                [("pay", "To'lanmagan ish haqini va kechiktirilgan kunlar uchun pulli kompensatsiyani to'lashni"), ("transfer", "Boshqa lavozimga o'tkazishni"), ("restore", "Ishga tiklashni")],
                S("M", "333-modda", "ҳар бир кечиктирилган кун учун"),
                S("M", "546-modda", "асосли деб топилган тақдирда тўлиқ миқдорда қаноатлантирилади")),
             num("amount", "To'lanmagan jami ish haqi (so'm)", "9000000",
                 "3 oy × 3 000 000 so'm = 9 000 000 so'm. Buni mijozdan so'rab bilasiz. Pulli kompensatsiya (333-modda) bunga qo'shimcha hisoblanadi.",
                 S("M", "546-modda", "Ходимнинг пулга оид талаблари")),
             ch("attach", "Arizada nimalar ko'rsatilishi shart?", "full",
                "Arizada sana, xodimning dalillari, talablari va ilova qilinayotgan hujjatlar ro'yxati ko'rsatiladi (549-modda).",
                [("name", "Faqat ism va telefon raqami"), ("full", "Sana, dalillar, talablar va ilova hujjatlari ro'yxati"), ("bio", "Notarius tasdiqlagan tarjimai hol")],
                S("M", "549-modda", "аризага илова қилинаётган ҳужжатлар рўйхати")),
         ]},
        {"id": "procedure", "type": "authority-pick", "title": "Komissiya tartibi", "sources": [], "points": 15,
         "description": "Komissiya orqali nizo ko'rish tartibini to'g'ri ketma-ketlikda belgilang.",
         "order": [
             {"id": "apply", "label": "Xodim komissiyaga ariza beradi, ariza ro'yxatdan o'tkaziladi",
              "sources": [S("M", "549-modda", "Ходимнинг меҳнат низолари бўйича комиссияга келиб тушган аризаси рўйхатдан ўтказилиши шарт.")]},
             {"id": "consider", "label": "Komissiya nizoni ariza kunidan 10 kalendar kun ichida ko'radi",
              "sources": [S("M", "551-modda", "ўн календарь кун ичида кўриб чиқиши шарт")]},
             {"id": "court", "label": "Ko'rilmasa yoki qaror ma'qul bo'lmasa, sudga murojaat qilinadi",
              "sources": [S("M", "556-modda", "манфаатдор ходим ёки унинг вакили судга мурожаат қилишга ҳақли")]},
         ]},
        {"id": "deadline", "type": "deadline-pick", "title": "Murojaat muddati", "sources": [S("M", "554-modda", "олти ойлик муддат ичида мурожаат қилиши мумкин"), S("M", "560-modda", "олти ой")],
         "description": "Komissiyaga murojaat qilish muddatini belgilang.", "points": 15,
         "options": [{"id": "d10", "label": "10 kun"}, {"id": "m3", "label": "3 oy"}, {"id": "m6", "label": "6 oy"}, {"id": "y1", "label": "1 yil"}],
         "correct": "m6"},
    ],
})

# ===================================================================== IJARA
write("ijara-tolov-buzildi.json", {
    "id": "ijara-tolov-buzildi", "title": "Ijarachi ijara haqini to'lamayapti", "area": "Fuqarolik huquqi (ijara)", "areaId": "fuqarolik",
    "tracks": ["advokat", "notarius", "korxona", "sudya", "umumiy"], "level": 2, "status": "sample", "reviewedBy": None,
    "summary": "Bino egasi (ijaraga beruvchi) mijoz. Ijarachi MChJ uch oydan beri ijara haqini to'lamayapti. Dalillar, bekor qilish asoslari, ariza va tartibni Fuqarolik kodeksi bo'yicha belgilang.",
    "client": {
        "persona": "Shavkat, 45 yosh, tijorat binosi egasi",
        "openingLine": "Assalomu alaykum. Binomni bir MChJ ga ijaraga berganman. Uch oydan beri ijara haqini to'lamayapti.",
        "hiddenFacts": [
            fact("missed", "Ijara haqi ketma-ket 3 oy to'lanmagan", ["qachondan", "muddat"]),
            fact("amount", "Oylik ijara haqi 5 000 000 so'm", ["qancha", "oylik"]),
            fact("written", "Shartnoma yozma, 2 yilga tuzilgan, davlat ro'yxatidan o'tgan", ["shartnoma"]),
            fact("warning", "Ijarachiga hali yozma ogohlantirish yuborilmagan", ["ogohlantir", "xat"]),
            fact("care", "Ijarachi binoni yaxshi saqlayapti", ["bino", "holat"]),
        ],
    },
    "steps": [
        {"id": "facts", "type": "client-chat", "title": "Faktlarni aniqlang", "sources": [], "points": 15,
         "description": "Qachondan to'lamayapti, qancha, shartnoma qanday, ogohlantirish yuborilganmi.",
         "requiredFactIds": ["missed", "amount", "written", "warning"],
         "questions": [
             q("q-missed", "Ijara haqi qachondan to'lanmayapti?", "missed", "Uch oy ketma-ket, birorta to'lov bo'lmadi."),
             q("q-amount", "Oylik ijara haqi qancha?", "amount", "Oyiga 5 000 000 so'm."),
             q("q-written", "Shartnoma yozma tuzilganmi, ro'yxatdan o'tganmi?", "written", "Yozma, ikki yilga, davlat ro'yxatidan o'tkazilgan."),
             q("q-warning", "Ijarachiga yozma ogohlantirish yuborganmisiz?", "warning", "Yo'q, hozircha faqat og'zaki aytganman."),
             q("q-care", "Ijarachi binoni qanday saqlayapti?", "care", "Bino toza, yaxshi holatda."),
             q("q-fav", "Sevimli taomingiz nima?", None, "Bu hozir muhim emas, ijara masalasini gaplashaylik."),
         ]},
        {"id": "documents", "type": "document-pick", "title": "Hujjatlarni yig'ing", "sources": [], "points": 20,
         "description": "Nizo uchun kerakli hujjatlarni tanlang.", "prompt": "Ijara nizosi uchun kerakli hujjatlarni belgilang.",
         "submitLabel": "Hujjatlarni topshirish",
         "options": [
             opt("contract", "Yozma ijara shartnomasi", True,
                 "Taraflardan biri yuridik shaxs bo'lsa, ijara shartnomasi muddatidan qat'i nazar yozma shaklda tuzilishi shart (539-modda).",
                 S("F", "539-modda", "taraflardan birontasi yuridik shaxs boʻlgan hollarda esa, muddatidan qatʼi nazar, yozma shaklda tuzilishi shart.")),
             opt("registration", "Shartnomaning davlat ro'yxatidan o'tganligi va soliq organida hisobga qo'yilganligi haqidagi hujjat", True,
                 "Ko'chmas mulk ijarasi shartnomasi davlat ro'yxatidan o'tkazilishi va soliq organlarida hisobga qo'yilishi lozim (539-modda).",
                 S("F", "539-modda", "Koʻchmas mulk ijarasi shartnomasi davlat roʻyxatidan oʻtkazilishi va soliq organlarida hisobga qoʻyilishi lozim")),
             opt("bank", "To'lovlar bo'yicha bank ko'chirmasi", True,
                 "Ijarachi ijara haqini o'z vaqtida to'lashi shart (544-modda). To'lov muddatini ketma-ket ikki martadan ortiq buzish bekor qilish asosi (551-modda). Ko'chirma buzilishni ko'rsatadi.",
                 S("F", "544-modda", "Ijaraga oluvchi mol-mulkdan foydalanganlik uchun haqni oʻz vaqtida toʻlab turishi shart."),
                 S("F", "551-modda", "shartnomada belgilangan toʻlov muddatini ketma-ket ikki martadan ortiq buzib")),
             opt("family", "Ijarachi direktorining oilaviy ahvoli haqida ma'lumotnoma", False,
                 "551-moddadagi bekor qilish asoslari ro'yxatida bunday holat yo'q.",
                 S("F", "551-modda", "Mulk ijarasi shartnomasi ijaraga beruvchining talabi bilan sud tomonidan muddatidan oldin bekor qilinishi mumkin")),
             opt("photos", "Binoning reklama suratlari", False,
                 "Ijara haqi to'lanmaganligini yoki bekor qilish asosini tasdiqlamaydi (551-modda).",
                 S("F", "551-modda", "Mulk ijarasi shartnomasi ijaraga beruvchining talabi bilan sud tomonidan muddatidan oldin bekor qilinishi mumkin")),
         ]},
        {"id": "grounds", "type": "document-pick", "title": "Bekor qilish asoslari", "sources": [], "points": 15,
         "description": "Qaysi holatlar muddatidan oldin bekor qilish asosi bo'ladi.",
         "prompt": "Quyidagilardan qaysilari ijaraga beruvchiga shartnomani sud orqali muddatidan oldin bekor qildirish asosi bo'ladi? Hammasini belgilang.",
         "submitLabel": "Javobni topshirish",
         "options": [
             opt("pay", "To'lov muddatini ketma-ket ikki martadan ortiq buzib, ijara haqini to'lamaslik", True,
                 "551-moddaning to'g'ridan-to'g'ri asosi.",
                 S("F", "551-modda", "shartnomada belgilangan toʻlov muddatini ketma-ket ikki martadan ortiq buzib, mol-mulkdan foydalanganlik uchun haq toʻlamasa")),
             opt("damage", "Mol-mulkni jiddiy yomonlashtirish", True, "551-moddaning asosi.",
                 S("F", "551-modda", "mol-mulkni jiddiy yomonlashtirsa")),
             opt("misuse", "Yozma ogohlantirishga qaramay shartnomaga zid foydalanish", True, "551-moddaning asosi.",
                 S("F", "551-modda", "ijaraga beruvchining yozma ogohlantirishiga qaramasdan")),
             opt("repairs", "Kapital ta'mir ijarachi zimmasida bo'lgan holda uni belgilangan muddatda bajarmaslik", True, "551-moddaning asosi.",
                 S("F", "551-modda", "kapital taʼmirlash ishlarini bajarish ijaraga oluvchi zimmasidagi majburiyat boʻlgan hollarda")),
             opt("once", "Ijara haqini bir marta bir necha kunga kechiktirish", False,
                 "Asos ketma-ket ikki martadan ortiq buzishdir. Bir marta kechikish asos emas (551-modda).",
                 S("F", "551-modda", "ketma-ket ikki martadan ortiq buzib")),
             opt("market", "Bozorda boshqa ijarachi ko'proq to'lashni taklif qilgani", False,
                 "551-moddaning asoslari ro'yxatida bunday holat yo'q.",
                 S("F", "551-modda", "Mulk ijarasi shartnomasi ijaraga beruvchining talabi bilan sud tomonidan muddatidan oldin bekor qilinishi mumkin")),
         ]},
        {"id": "application", "type": "form", "title": "Talab va ariza", "sources": [], "points": 20,
         "description": "Talab shaklini to'ldiring.", "rubric": [],
         "fields": [
             ch("who", "Shartnomani muddatidan oldin kim bekor qiladi?", "court",
                "Ijaraga beruvchining talabi bilan shartnoma sud tomonidan muddatidan oldin bekor qilinadi (551-modda).",
                [("self", "Ijaraga beruvchi o'zi, sudsiz"), ("court", "Sud, ijaraga beruvchining talabi bilan"), ("notary", "Notarius")],
                S("F", "551-modda", "sud tomonidan muddatidan oldin bekor qilinishi mumkin")),
             ch("before", "Sudga murojaat qilishdan oldin nima qilish shart?", "warn",
                "Ijaraga beruvchi ijarachini yozma ogohlantirgandan va unga majburiyatlarini bajarish uchun imkoniyat bergandan keyingina bekor qilishni talab qilishga haqli (551-modda).",
                [("none", "Hech narsa, to'g'ridan-to'g'ri sudga"), ("warn", "Yozma ogohlantirish va majburiyatni bajarishga imkon berish"), ("lock", "Binoni qulflab qo'yish")],
                S("F", "551-modda", "yozma ravishda ogohlantirganidan va unga oʻz majburiyatlarini bajarish uchun imkoniyat berganidan keyingina")),
             num("amount", "To'lanmagan jami ijara haqi (so'm)", "15000000",
                 "3 oy × 5 000 000 so'm = 15 000 000 so'm. Ijarachi haqni o'z vaqtida to'lashi shart (544-modda).",
                 S("F", "544-modda", "Ijaraga oluvchi mol-mulkdan foydalanganlik uchun haqni oʻz vaqtida toʻlab turishi shart.")),
             ch("return", "Bekor qilingach ijarachi binoni qaytarmasa nimani talab qilish mumkin?", "fee",
                "Ijarachi mol-mulkni qaytarmasa yoki kechiktirsa, ijaraga beruvchi kechiktirilgan butun vaqt uchun haq, u zararni qoplamasa zararning o'zini ham talab qilishga haqli (554-modda).",
                [("none", "Faqat binoni qaytarish, haq talab qilib bo'lmaydi"), ("fee", "Kechiktirilgan butun vaqt uchun haq va qoplanmagan zarar"), ("swap", "Ijarachining mol-mulkini o'ziniki qilib olish")],
                S("F", "554-modda", "kechiktirilgan barcha vaqt davomida mol-mulkdan foydalanganlik uchun haq toʻlashni talab qilishga haqli")),
         ]},
        {"id": "procedure", "type": "authority-pick", "title": "Harakatlar tartibi", "sources": [], "points": 15,
         "description": "Ijaraga beruvchi harakatlarini to'g'ri ketma-ketlikda belgilang.",
         "order": [
             {"id": "warn", "label": "Ijarachini yozma ogohlantirish",
              "sources": [S("F", "551-modda", "yozma ravishda ogohlantirganidan")]},
             {"id": "chance", "label": "Majburiyatni bajarish uchun imkoniyat berish",
              "sources": [S("F", "551-modda", "unga oʻz majburiyatlarini bajarish uchun imkoniyat berganidan")]},
             {"id": "court", "label": "Sudga muddatidan oldin bekor qilish talabi bilan murojaat qilish",
              "sources": [S("F", "551-modda", "sud tomonidan muddatidan oldin bekor qilinishi mumkin")]},
             {"id": "return", "label": "Shartnoma bekor bo'lgach, mol-mulkni qaytarishni talab qilish",
              "sources": [S("F", "554-modda", "Mulk ijarasi shartnomasi bekor boʻlganidan keyin ijaraga oluvchi ijaraga beruvchiga mol-mulkni")]},
         ]},
        {"id": "deadline", "type": "deadline-pick", "title": "Bekor qilish sharti",
         "sources": [S("F", "551-modda", "ketma-ket ikki martadan ortiq buzib")],
         "description": "To'lov buzilishi bo'yicha qachon bekor qilishni talab qilish mumkin.", "points": 15,
         "options": [{"id": "once", "label": "Bir marta kechiksa"}, {"id": "two", "label": "Ketma-ket ikki martadan ortiq buzsa"},
                     {"id": "monthly", "label": "Har oyda bir marta kechiksa ham"}, {"id": "any", "label": "Ijaraga beruvchi xohlasa"}],
         "correct": "two"},
    ],
})

# ===================================================================== ISTE'MOLCHI
write("sifatsiz-tovar.json", {
    "id": "sifatsiz-tovar", "title": "Sotib olingan telefon nuqsonli chiqdi", "area": "Iste'molchi huquqi", "areaId": "iste'molchi",
    "tracks": ["advokat", "davlat", "korxona", "umumiy"], "level": 1, "status": "sample", "reviewedBy": None,
    "summary": "Mijoz 25 kun oldin telefon sotib olgan, u nuqsonli chiqdi, sotuvchi almashtirmayapti. Iste'molchi huquqlari, muddatlar va tartibni Iste'molchilar huquqlarini himoya qilish to'g'risidagi Qonun bo'yicha belgilang.",
    "client": {
        "persona": "Dilshod, 30 yosh, dasturchi",
        "openingLine": "Assalomu alaykum. Do'kondan telefon olgandim, ekrani o'z-o'zidan o'chib qolyapti. Sotuvchi almashtirmayapti.",
        "hiddenFacts": [
            fact("defect", "Telefon ekrani o'z-o'zidan o'chib qoladi (ishlab chiqarish nuqsoni)", ["nuqson", "nima bo'ldi"]),
            fact("when", "Telefon 25 kun oldin sotib olingan, kafolat muddati 12 oy", ["qachon", "kafolat"]),
            fact("receipt", "Kassa cheki va kafolat hujjati bor", ["chek", "hujjat"]),
            fact("refusal", "Sotuvchi og'zaki almashtirishni rad etdi", ["sotuvchi", "rad"]),
            fact("wants", "Mijoz ayni shunday modelli telefonga almashtirishni xohlaydi", ["xohlay", "talab"]),
        ],
    },
    "steps": [
        {"id": "facts", "type": "client-chat", "title": "Faktlarni aniqlang", "sources": [], "points": 15,
         "description": "Nuqson nima, qachon sotib olingan, chek bor-yo'qligi, sotuvchi nima degan.",
         "requiredFactIds": ["defect", "when", "receipt", "refusal"],
         "questions": [
             q("q-defect", "Telefonda aynan nima nuqson?", "defect", "Ekran o'z-o'zidan o'chib qoladi, ishlab chiqarish nuqsoniga o'xshaydi."),
             q("q-when", "Qachon sotib olgansiz, kafolat qancha?", "when", "25 kun oldin. Kafolat 12 oy."),
             q("q-receipt", "Chek va kafolat hujjati bormi?", "receipt", "Ha, kassa cheki ham, kafolat hujjati ham bor."),
             q("q-refusal", "Sotuvchi nima dedi?", "refusal", "Og'zaki almashtirmayman, dedi."),
             q("q-wants", "Siz nimani xohlaysiz?", "wants", "Ayni shunday telefonga almashtirib berishsin."),
             q("q-color", "Telefon rangi qanday?", None, "Qora, lekin bu muhim emas."),
         ]},
        {"id": "documents", "type": "document-pick", "title": "Hujjatlarni yig'ing", "sources": [], "points": 20,
         "description": "Talab uchun kerakli hujjatlarni tanlang.", "prompt": "Talab uchun kerakli hujjatlarni belgilang.",
         "submitLabel": "Hujjatlarni topshirish",
         "options": [
             opt("receipt", "Kassa cheki yoki tovar cheki", True,
                 "Oldi-sotdi amalga oshirilganda iste'molchiga kassa yoki tovar cheki beriladi. U xaridni tasdiqlaydi (10-modda).",
                 S("I", "10-modda", "Oldi-sotdi amalga oshirilganda isteʼmolchiga kassa yoki tovar cheki beriladi.")),
             opt("warranty", "Kafolat hujjati (tovar pasporti)", True,
                 "Kafolat muddati tovarning pasportida yoki tovar bilan birga beriladigan boshqa hujjatda ko'rsatiladi (11-modda).",
                 S("I", "11-modda", "Kafolat muddati tovar (xizmat)ning pasportida yoki tovarni sotish yoxud xizmat koʻrsatish paytida tovar bilan birgalikda isteʼmolchiga beriladigan boshqa hujjatda koʻrsatiladi.")),
             opt("friend", "Do'stingizning pasporti nusxasi", False,
                 "Xaridni va kafolatni tasdiqlamaydi (10, 11-moddalar).",
                 S("I", "10-modda", "Oldi-sotdi amalga oshirilganda isteʼmolchiga kassa yoki tovar cheki beriladi.")),
             opt("othershop", "Boshqa do'kondan olingan chek", False,
                 "Bu sotuvchidan sotib olinganini tasdiqlamaydi (10-modda).",
                 S("I", "10-modda", "Oldi-sotdi amalga oshirilganda isteʼmolchiga kassa yoki tovar cheki beriladi.")),
             opt("booklet", "Telefon qutisidagi reklama bukleti", False,
                 "Kafolat hujjati o'rnini bosmaydi (11-modda).",
                 S("I", "11-modda", "Kafolat muddati tovar (xizmat)ning pasportida")),
         ]},
        {"id": "rights", "type": "document-pick", "title": "Iste'molchi huquqlari", "sources": [], "points": 15,
         "description": "Nuqsonli tovar sotilganda iste'molchi nimani talab qilishi mumkin.",
         "prompt": "Nuqsonli tovar sotilganda iste'molchi nimani talab qilishga haqli? To'g'ri variantlarning hammasini belgilang.",
         "submitLabel": "Javobni topshirish",
         "options": [
             opt("same", "Ayni shunday markali (modelli) sifatli tovarga almashtirib berish", True, "13-moddaning birinchi talabi.",
                 S("I", "13-modda", "tovarni ayni shunday markali (modelli, artikulli) maqbul sifatli tovarga almashtirib berish;")),
             opt("other", "Boshqa markali tovarga almashtirish va narxni qayta hisob-kitob qilish", True, "13-modda.",
                 S("I", "13-modda", "tovarni boshqa markali (modelli, artikulli) shunday tovarga almashtirib, uning xarid narxini tegishincha qayta hisob-kitob qilish;")),
             opt("repair", "Nuqsonlarni bepul bartaraf etish yoki xarajatlarni qoplash", True, "13-modda.",
                 S("I", "13-modda", "tovarning nuqsonlarini bepul bartaraf etish yoki isteʼmolchining yoxud uchinchi shaxsning nuqsonlarni bartaraf etishga qilgan xarajatlarini qoplash;")),
             opt("reduce", "Xarid narxini nuqsonga mutanosib ravishda kamaytirish", True, "13-modda.",
                 S("I", "13-modda", "xarid narxini nuqsonga mutanosib ravishda kamaytirish;")),
             opt("cancel", "Shartnomani bekor qilib, ko'rilgan zararni qoplash", True, "13-modda.",
                 S("I", "13-modda", "shartnomani bekor qilib, koʻrilgan zararni qoplash.")),
             opt("double", "Tovar narxining ikki baravarini talab qilish", False,
                 "13-moddadagi talablar ro'yxatida bunday talab yo'q.",
                 S("I", "13-modda", "oʻz xohishiga qarab quyidagilardan birini talab qilishga haqli")),
             opt("close", "Do'kon faoliyatini to'xtatishni talab qilish", False,
                 "13-moddadagi iste'molchi talablari ro'yxatida yo'q.",
                 S("I", "13-modda", "oʻz xohishiga qarab quyidagilardan birini talab qilishga haqli")),
         ]},
        {"id": "application", "type": "form", "title": "Talabnoma", "sources": [], "points": 20,
         "description": "Sotuvchiga talabnoma maydonlarini to'ldiring.", "rubric": [],
         "fields": [
             ch("demand", "Mijoz nimani talab qiladi?", "same",
                "Mijoz ayni shunday modelli tovarga almashtirishni xohlaydi: bu 13-moddadagi birinchi talab.",
                [("same", "Ayni shunday markali (modelli) sifatli tovarga almashtirib berishni"), ("double", "Tovar narxining ikki baravarini"), ("close", "Do'kon litsenziyasini bekor qildirishni")],
                S("I", "13-modda", "tovarni ayni shunday markali (modelli, artikulli) maqbul sifatli tovarga almashtirib berish;")),
             ch("days", "Sotuvchi tovarni almashtirib berishi shart bo'lgan muddat (qo'shimcha tekshiruv talab qilinmasa)", "d7",
                "Sotuvchi ayni shunday tovarga yetti kunlik muddatda almashtirib berishi shart (14-modda).",
                [("d3", "3 kun"), ("d7", "7 kun"), ("d30", "30 kun"), ("m3", "3 oy")],
                S("I", "14-modda", "yetti kunlik muddatda")),
             ch("extra", "Sotuvchi sifatni qo'shimcha tekshirishi zarur bo'lsa, muddat", "d20",
                "Tovar sifatini qo'shimcha tekshirish zarur bo'lganda talab qo'yilgan paytdan yigirma kun ichida (14-modda).",
                [("d10", "10 kun"), ("d20", "20 kun"), ("d45", "45 kun"), ("d60", "60 kun")],
                S("I", "14-modda", "isteʼmolchi talab qoʻygan paytdan eʼtiboran yigirma kun ichida")),
             ch("penalty", "Muddat o'tkazib yuborilgan har kun uchun sotuvchi qancha neustoyka (penya) to'laydi?", "p1",
                "O'tkazib yuborilgan har bir kun uchun tovar bahosining bir foizi miqdorida neustoyka (14-modda).",
                [("p01", "Tovar bahosining 0,1 foizi"), ("p1", "Tovar bahosining 1 foizi"), ("p5", "Tovar bahosining 5 foizi"), ("none", "Neustoyka yo'q")],
                S("I", "14-modda", "tovar bahosining bir foizi miqdorida neustoyka (penya) toʻlaydi")),
         ]},
        {"id": "procedure", "type": "authority-pick", "title": "Harakatlar tartibi", "sources": [], "points": 15,
         "description": "Iste'molchi harakatlarini to'g'ri ketma-ketlikda belgilang.",
         "order": [
             {"id": "demand", "label": "Sotuvchiga almashtirib berish talabini qo'yish",
              "sources": [S("I", "13-modda", "oʻz xohishiga qarab quyidagilardan birini talab qilishga haqli")]},
             {"id": "deadline", "label": "Sotuvchi 7 kun ichida (zarur bo'lsa 20 kun) almashtirib berishi shart",
              "sources": [S("I", "14-modda", "yetti kunlik muddatda")]},
             {"id": "fallback", "label": "Bajarmasa: narxni kamaytirish yoki shartnomani bekor qilish va zararni qoplashni talab qilish",
              "sources": [S("I", "16-modda", "isteʼmolchi tovarning xarid narxini nuqsonga mutanosib ravishda kamaytirishni yoki shartnomani bekor qilib")]},
             {"id": "court", "label": "Huquqlar buzilgan bo'lsa, sudga murojaat qilish",
              "sources": [S("I", "29-modda", "Isteʼmolchining huquqlari buzilgan taqdirda, u sudga murojaat qilishga haqlidir.")]},
         ]},
        {"id": "deadline", "type": "deadline-pick", "title": "Nuqsonni aniqlash muddati",
         "sources": [S("I", "13-modda", "kafolat muddati va yaroqlilik muddati belgilanmagan tovarlar boʻyicha olti oy mobaynida")],
         "description": "Kafolat va yaroqlilik muddati belgilanmagan tovarda nuqson qancha muddatda aniqlansa, iste'molchi 13-modda huquqlaridan foydalanadi.",
         "points": 15,
         "options": [{"id": "m1", "label": "1 oy"}, {"id": "m3", "label": "3 oy"}, {"id": "m6", "label": "6 oy"}, {"id": "y2", "label": "2 yil"}],
         "correct": "m6"},
    ],
})
print("yozildi")
