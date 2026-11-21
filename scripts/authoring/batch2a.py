import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sc_lib import *

TM = ["advokat", "korxona", "davlat", "umumiy"]
TO = ["advokat", "notarius", "sudya", "umumiy"]
ML = "Mehnat huquqi"

# ================================================================ M-A sinov muddati
scenario(
    id="mehnat-sinov-muddati", title="Sinov muddatida bo'shatmoqchi", area=ML, areaId="mehnat", tracks=TM, level=1,
    summary="Yangi xodimga 5 oylik sinov belgilangan va ogohlantirmay bo'shatishmoqchi. Sinov muddati, ogohlantirish va sabab ko'rsatish qoidalarini Mehnat kodeksi bo'yicha belgilang.",
    persona="Jamshid, 26 yosh, yangi xodim", opening="Assalomu alaykum. Ishga yangi kirdim, menga 5 oy sinov belgilashgan va ogohlantirmay bo'shatmoqchi. Bu to'g'rimi?",
    facts=[("term", "Oddiy xodimga 5 oylik sinov muddati belgilangan", "Sinov muddati qancha?", "5 oy deb yozishgan."),
           ("post", "Jamshid oddiy mutaxassis, rahbar emas", "Lavozimingiz nima?", "Oddiy mutaxassisman, rahbar emasman."),
           ("notice", "Ish beruvchi yozma ogohlantirmoqchi emas, sabab ham ko'rsatmayapti", "Sizni qanday bo'shatishmoqchi?", "Ogohlantirmay, sababsiz."),
           ("sick", "Xodim sinov davrida 10 kun kasal bo'lgan", "Kasal bo'lganmisiz?", "Ha, 10 kun kasal bo'ldim.")],
    filler=("Avvalgi ishingiz nima edi?", "Bu hozir muhim emas, sinov masalasini gaplashaylik."),
    multi=dict(title="Sinov muddati qoidalari", desc="Qaysi qoidalar to'g'ri.", prompt="Dastlabki sinov haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("three", "Sinov muddati uch oydan oshmasligi kerak", True, "130-modda.", S("M", "130-modda", "Дастлабки синов муддати уч ойдан")),
                     ("heads", "Rahbarlar, o'rinbosarlar, bosh hisobchilar va bo'linma rahbarlari uchun olti oydan oshmasligi kerak", True, "130-modda.", S("M", "130-modda", "олти ойдан ошмаслиги керак")),
                     ("sick", "Vaqtincha mehnatga layoqatsizlik davri sinov muddatiga qo'shilmaydi", True, "130-modda.", S("M", "130-modda", "Вақтинча меҳнатга қобилиятсизлик даври ва ходим ҳақиқатда ишда бўлмаган бошқа даврлар дастлабки синов муддатига қўшилмайди")),
                     ("notice", "Tomonlar kamida uch kun oldin yozma ogohlantiradi", True, "132-modda.", S("M", "132-modda", "тарафларнинг ҳар бири иккинчи тарафни камида уч кун олдин ёзма шаклда огоҳлантирган ҳолда меҳнат шартномасини бекор қилишга ҳақли")),
                     ("anyone", "Oddiy xodimga ham sinov 6 oygacha bo'lishi mumkin", False, "Oddiy xodimlar uchun sinov uch oydan oshmasligi kerak (130-modda).", S("M", "130-modda", "Дастлабки синов муддати уч ойдан")),
                     ("noreason", "Ish beruvchi sinovda sababsiz va ogohlantirmay bo'shata oladi", False, "Ish beruvchi sinovdan o'tmagan deb topish sabablarini ko'rsatishi va ogohlantirishi shart (132-modda).", S("M", "132-modda", "ходимни синовдан ўтмаган деб эътироф этиш учун асос бўлиб хизмат қилган сабабларни кўрсатган ҳолда"))]),
    form=dict(title="Sinov va bo'shatish", desc="Sinov qoidalarini belgilang.", fields=[
        ch("max", "Oddiy xodim uchun sinov muddati eng ko'pi bilan", "m3", "Uch oydan oshmasligi kerak (130-modda).", [("m1", "1 oy"), ("m3", "3 oy"), ("m6", "6 oy"), ("y1", "1 yil")], S("M", "130-modda", "Дастлабки синов муддати уч ойдан")),
        ch("notice", "Sinov davrida shartnomani bekor qilish haqida ogohlantirish", "d3", "Tomonlar kamida uch kun oldin yozma ogohlantiradi (132-modda).", [("none", "Kerak emas"), ("d3", "Kamida 3 kun oldin, yozma"), ("d30", "30 kun oldin"), ("oral", "Og'zaki, kunlik")], S("M", "132-modda", "камида уч кун олдин ёзма шаклда огоҳлантирган ҳолда")),
        ch("reason", "Ish beruvchi o'z tashabbusi bilan sinovda bo'shatganda nimani ko'rsatishi shart?", "why", "Xodimni sinovdan o'tmagan deb topishga asos bo'lgan sabablarni (132-modda).", [("none", "Hech narsani"), ("why", "Sinovdan o'tmagan deb topishga asos bo'lgan sabablarni"), ("fine", "Jarimani"), ("poll", "Hamkasblar fikrini")], S("M", "132-modda", "ходимни синовдан ўтмаган деб эътироф этиш учун асос бўлиб хизмат қилган сабабларни кўрсатган ҳолда")),
        ch("sick", "Kasallik davri sinov muddatiga", "no", "Qo'shilmaydi (130-modda).", [("yes", "Qo'shiladi"), ("no", "Qo'shilmaydi"), ("half", "Yarmi qo'shiladi")], S("M", "130-modda", "дастлабки синов муддатига қўшилмайди"))]),
    order=dict(title="Sinovda bo'shatish tartibi", desc="Tartibni belgilang.", items=[
        ("term", "Sinov muddati belgilanadi (oddiy xodim uchun uch oydan oshmasligi kerak)", S("M", "130-modda", "Дастлабки синов муддати уч ойдан")),
        ("notice", "Tomon ikkinchisini kamida uch kun oldin yozma ogohlantiradi", S("M", "132-modda", "камида уч кун олдин ёзма шаклда огоҳлантирган ҳолда")),
        ("reasons", "Ish beruvchi sinovdan o'tmaganlik sabablarini ko'rsatadi", S("M", "132-modda", "сабабларни кўрсатган ҳолда ўз ташаббусига кўра, дастлабки синов даврида бекор қилишга ҳақли"))]),
    quiz=dict(title="Xodim tashabbusi", text="Xodim sinov davrida o'z tashabbusi bilan shartnomani bekor qilsa, nima asos bo'ladi?", opts=[("a", "Xodimning yozma arizasi"), ("b", "Ish beruvchining og'zaki roziligi"), ("c", "Sud qarori"), ("d", "Prokuror ruxsati")], correct="a",
              src=S("M", "132-modda", "ходимнинг ёзма аризаси асос бўлиб")))

# ================================================================ M-B yillik ta'til
scenario(
    id="mehnat-yillik-tatil", title="Ishdan ketdim, ta'til puli berilmadi", area=ML, areaId="mehnat", tracks=TM, level=1,
    summary="Xodim ishdan ketayotib foydalanilmagan ta'til puli berilmayotganini aytmoqda. Yillik ta'til davomiyligi va ta'til uchun pulli kompensatsiyani Mehnat kodeksi bo'yicha belgilang.",
    persona="Sanjar, 30 yosh, sotuv menejeri", opening="Assalomu alaykum. Ishdan ketdim, ta'tilimni ishlatmagan edim, ish beruvchi pul bermayapti. Haqqim bormi?",
    facts=[("left", "Sanjar mehnat shartnomasi bekor qilingach ishdan ketgan", "Nima bo'ldi?", "Ishdan ketdim, shartnoma bekor qilindi."),
           ("unused", "Foydalanilmagan yillik ta'til bor", "Ta'tilni ishlatganmisiz?", "Yo'q, bu yil umuman ta'tilga chiqmadim."),
           ("refuse", "Ish beruvchi ta'til uchun pul to'lashdan bosh tortmoqda", "Ish beruvchi nima deydi?", "Ketding, endi pul yo'q, deydi."),
           ("sunday", "Hisob-kitobda yakshanba kuni hisobga olinmasligi kerak", "Ish haftasi qanday?", "Haftasiga olti kun ishlayman.")],
    filler=("Qaysi mahsulotlarni sotardingiz?", "Bu hozir muhim emas, ta'til masalasini gaplashaylik."),
    multi=dict(title="Ta'til qoidalari", desc="Ta'til va kompensatsiya qoidalari.", prompt="Yillik ta'til haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("min", "Yillik asosiy eng kam ta'til yigirma bir kalendar kun", True, "217-modda.", S("M", "217-modda", "Ҳар йилги асосий энг кам меҳнат таътилининг давомийлиги йигирма бир календарь кунни ташкил этади")),
                     ("comp", "Shartnoma bekor qilinganda foydalanilmagan ta'tillar uchun pulli kompensatsiya to'lanadi", True, "234-modda.", S("M", "234-modda", "Меҳнат шартномаси бекор қилинганда ходимга барча фойдаланилмаган ҳар йилги асосий ва қўшимча меҳнат таътиллари учун пулли компенсация тўланади")),
                     ("sunday", "Kompensatsiya hisoblashda yakshanba kuni inobatga olinmaydi", True, "234-modda.", S("M", "234-modda", "Пулли компенсация тўлашда якшанба куни инобатга олинмайди")),
                     ("none", "Ishdan ketgan xodimga ta'til uchun pul to'lanmaydi", False, "Foydalanilmagan ta'tillar uchun pulli kompensatsiya to'lanadi (234-modda).", S("M", "234-modda", "пулли компенсация тўланади")),
                     ("fourteen", "Yillik asosiy eng kam ta'til 14 kun", False, "Eng kam ta'til yigirma bir kalendar kun (217-modda).", S("M", "217-modda", "йигирма бир календарь кунни ташкил этади"))]),
    form=dict(title="Hisob-kitob", desc="Ta'til hisob-kitobi qoidalarini belgilang.", fields=[
        ch("days", "Yillik asosiy eng kam ta'til davomiyligi", "d21", "Yigirma bir kalendar kun (217-modda).", [("d14", "14 kalendar kun"), ("d21", "21 kalendar kun"), ("d28", "28 kalendar kun"), ("d30", "30 kalendar kun")], S("M", "217-modda", "йигирма бир календарь кунни ташкил этади")),
        ch("term", "Shartnoma bekor qilinganda foydalanilmagan ta'til uchun", "pay", "Pulli kompensatsiya to'lanadi (234-modda).", [("pay", "Pulli kompensatsiya to'lanadi"), ("none", "Hech narsa to'lanmaydi"), ("next", "Keyingi ish joyida beriladi")], S("M", "234-modda", "Меҳнат шартномаси бекор қилинганда ходимга барча фойдаланилмаган ҳар йилги асосий ва қўшимча меҳнат таътиллари учун пулли компенсация тўланади")),
        ch("sunday", "Kompensatsiya to'lashda yakshanba kuni", "skip", "Inobatga olinmaydi (234-modda).", [("count", "Inobatga olinadi"), ("skip", "Inobatga olinmaydi"), ("double", "Ikki baravar hisoblanadi")], S("M", "234-modda", "Пулли компенсация тўлашда якшанба куни инобатга олинмайди"))]),
    order=dict(title="Ta'til huquqi", desc="Jarayonni belgilang.", items=[
        ("right", "Xodim yillik asosiy ta'tilga (kamida 21 kalendar kun) ega", S("M", "217-modda", "Ҳар йилги асосий энг кам меҳнат таътилининг давомийлиги йигирма бир календарь кунни ташкил этади")),
        ("end", "Mehnat shartnomasi bekor qilinadi, ta'til foydalanilmagan qoladi", S("M", "234-modda", "Меҳнат шартномаси бекор қилинганда")),
        ("pay", "Foydalanilmagan ta'tillar uchun pulli kompensatsiya to'lanadi", S("M", "234-modda", "пулли компенсация тўланади"))]),
    quiz=dict(title="Qo'shimcha kompensatsiya", text="Ish davrida xodimning xohishiga ko'ra ta'til uchun pulli kompensatsiya to'lanishi mumkinmi?", opts=[("a", "Ha, eng kam ta'tildan tashqari qismi uchun"), ("b", "Yo'q, hech qachon"), ("c", "Faqat prokuror ruxsati bilan"), ("d", "Faqat sud qarori bilan")], correct="a",
              src=S("M", "234-modda", "Ходимларга иш даврида уларнинг хоҳишига кўра ҳар йилги меҳнат таътили учун таътилнинг ушбу Кодекснинг 217-моддасида белгиланган энг кам давомийлигидан ташқари пулли компенсация тўланиши мумкин")))

# ================================================================ M-C ish vaqtidan tashqari
scenario(
    id="mehnat-ish-vaqtidan-tashqari", title="Har kuni kechgacha ishlatishmoqda", area=ML, areaId="mehnat", tracks=TM, level=2,
    summary="Xodim har kuni belgilangan vaqtdan ortiq ishlayapti. Ish vaqtidan tashqari ish tushunchasi va eng ko'p davomiyligini Mehnat kodeksi bo'yicha belgilang.",
    persona="Dilfuza, 29 yosh, hisobchi", opening="Assalomu alaykum. Rahbar har kuni kechgacha ishlashga majbur qilyapti, soatlar hisobga olinmayapti. Bu qonuniymi?",
    facts=[("extra", "Dilfuza belgilangan ish vaqtidan ortiq ishlayapti", "Qancha ortiqcha ishlaysiz?", "Har kuni 3–4 soat ortiq."),
           ("days", "Bu bir necha kun ketma-ket davom etmoqda", "Necha kundan beri?", "Ketma-ket bir necha kun."),
           ("count", "Ortiqcha soatlar hisobga olinmayapti", "Soatlar hisoblanyaptimi?", "Yo'q, hech qayerda yozilmaydi."),
           ("nocons", "Xodimning roziligi so'ralmagan", "Sizdan rozilik so'rashdimi?", "Yo'q, shunchaki buyruq berishadi.")],
    filler=("Ofis qaysi qavatda?", "Bu hozir muhim emas, ish vaqti haqida gaplashaylik."),
    multi=dict(title="Ish vaqtidan tashqari ish", desc="Qaysi qoidalar to'g'ri.", prompt="Ish vaqtidan tashqari ish haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("def", "Belgilangan ish vaqti davomiyligidan tashqari ishga jalb etish ish vaqtidan tashqari ish hisoblanadi", True, "189-modda.", S("M", "189-modda", "Иш берувчи томонидан ходимни ходим учун белгиланган иш вақти давомийлигидан ташқари ишга жалб этиш иш вақтидан ташқари иш деб ҳисобланади")),
                     ("daily", "Kunlik hisobda belgilangan smena davomiyligidan oshadigan ish ish vaqtidan tashqari ish", True, "189-modda.", S("M", "189-modda", "Иш вақти кунлик ҳисобга олинганда ходим учун белгиланган ҳар кунги иш (смена) вақтининг давомийлигидан ошадиган иш иш вақтидан ташқари иш деб ҳисобланади")),
                     ("max", "Ketma-ket ikki kun davomida to'rt soatdan oshmasligi kerak", True, "190-modda.", S("M", "190-modda", "сурункасига икки кун давомида тўрт соатдан")),
                     ("track", "Ish beruvchi ortiqcha ish davomiyligini aniq hisobga olinishini ta'minlashi shart", True, "190-modda.", S("M", "190-modda", "Иш берувчи ходимнинг иш вақтидан ташқари ишининг давомийлиги аниқ ҳисобга олинишини таъминлаши шарт")),
                     ("unlim", "Ish beruvchi ortiqcha ishni cheklovsiz buyura oladi", False, "Ortiqcha ish davomiyligi cheklangan (190-modda).", S("M", "190-modda", "сурункасига икки кун давомида тўрт соатдан")),
                     ("untracked", "Ortiqcha soatlarni hisobga olish shart emas", False, "Ish beruvchi aniq hisobga olinishini ta'minlashi shart (190-modda).", S("M", "190-modda", "аниқ ҳисобга олинишини таъминлаши шарт"))]),
    form=dict(title="Ortiqcha ish qoidalari", desc="Ortiqcha ish qoidalarini belgilang.", fields=[
        ch("def", "Ish vaqtidan tashqari ish nima?", "extra", "Xodimni belgilangan ish vaqti davomiyligidan tashqari ishga jalb etish (189-modda).", [("extra", "Belgilangan ish vaqti davomiyligidan tashqari ishga jalb etish"), ("night", "Faqat tungi ish"), ("any", "Har qanday ish")], S("M", "189-modda", "иш вақтидан ташқари иш деб ҳисобланади")),
        ch("max", "Ortiqcha ishning eng ko'p davomiyligi", "four", "Ketma-ket ikki kun davomida to'rt soatdan oshmasligi kerak (190-modda).", [("one", "Bir kunda 1 soat"), ("four", "Ketma-ket ikki kun davomida 4 soatdan"), ("eight", "Kuniga 8 soat"), ("none", "Cheklov yo'q")], S("M", "190-modda", "сурункасига икки кун давомида тўрт соатдан")),
        ch("track", "Ortiqcha ish soatlarini hisobga olish", "must", "Ish beruvchi aniq hisobga olinishini ta'minlashi shart (190-modda).", [("must", "Ish beruvchi aniq hisobga olishni ta'minlashi shart"), ("opt", "Ixtiyoriy"), ("emp", "Faqat xodim hisoblaydi")], S("M", "190-modda", "Иш берувчи ходимнинг иш вақтидан ташқари ишининг давомийлиги аниқ ҳисобга олинишини таъминлаши шарт"))]),
    order=dict(title="Ortiqcha ishni baholash", desc="Baholash ketma-ketligini belgilang.", items=[
        ("plan", "Xodim uchun ish vaqti davomiyligi belgilanadi", S("M", "189-modda", "ходим учун белгиланган иш вақти давомийлигидан ташқари")),
        ("exceed", "Belgilanganidan ortiq ishga jalb etilsa, bu ish vaqtidan tashqari ish hisoblanadi", S("M", "189-modda", "иш вақтидан ташқари иш деб ҳисобланади")),
        ("limit", "Ortiqcha ish davomiyligi ketma-ket ikki kunda to'rt soatdan oshmasligi kerak", S("M", "190-modda", "сурункасига икки кун давомида тўрт соатдан"))]),
    quiz=dict(title="Hisobga olish", text="Ish vaqtidan tashqari ish davomiyligini aniq hisobga olinishini kim ta'minlashi shart?", opts=[("a", "Ish beruvchi"), ("b", "Xodim"), ("c", "Prokuror"), ("d", "Hech kim")], correct="a",
              src=S("M", "190-modda", "Иш берувчи ходимнинг иш вақтидан ташқари ишининг давомийлиги аниқ ҳисобга олинишини таъминлаши шарт")))

# ================================================================ M-D ogohlantirish muddatlari
scenario(
    id="mehnat-bekor-qilish-ogohlantirish", title="Shtat qisqarishi: qancha oldin ogohlantiriladi?", area=ML, areaId="mehnat", tracks=TM, level=2,
    summary="Kompaniya shtatni qisqartirib xodimni bo'shatmoqchi. Ish beruvchi tashabbusi bilan bekor qilishda ogohlantirish shakli va muddatlarini Mehnat kodeksi bo'yicha belgilang.",
    persona="Zafar, 41 yosh, kompaniya yuristi", opening="Assalomu alaykum. Shtat qisqartirilyapti, bir xodimni bo'shatmoqchimiz. Uni qancha oldin va qanday ogohlantirish kerak?",
    facts=[("reason", "Bo'shatish sababi: ishlar hajmining qisqarishi tufayli shtat o'zgarishi", "Bo'shatish sababi nima?", "Ishlar hajmi qisqarib, shtat o'zgardi."),
           ("form", "Ogohlantirish hali berilmagan", "Ogohlantirish berilganmi?", "Hali yo'q."),
           ("emp", "Xodim 3 yildan beri ishlaydi", "U qancha ishlagan?", "Uch yildan beri."),
           ("other", "Boshqa xodim malakasizligi sababli ham ko'rib chiqilmoqda", "Boshqa holat bormi?", "Boshqa xodimning malakasi yetarli emas.")],
    filler=("Kompaniya qayerda joylashgan?", "Bu hozir muhim emas, ogohlantirish muddatini gaplashaylik."),
    multi=dict(title="Ogohlantirish muddatlari", desc="Asos bo'yicha muddatlarni aniqlang.", prompt="Ish beruvchi tashabbusi bilan bekor qilishda qaysi ogohlantirish muddatlari to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("written", "Ogohlantirish yozma shaklda, imzo qo'ydirib beriladi", True, "165-modda.", S("M", "165-modda", "ёзма шаклда (имзо қўйдириб) огоҳлантириши шарт")),
                     ("twomonths", "Ishlar hajmi qisqarishi sababli shtat o'zgarsa kamida ikki oy oldin", True, "165-modda 1-band.", S("M", "165-modda", "камида икки ой олдин")),
                     ("twoweeks", "Malakasi yetarli emasligi sababli kamida ikki hafta oldin", True, "165-modda 2-band.", S("M", "165-modda", "камида икки ҳафта олдин")),
                     ("threedays", "Xodimning aybli harakatlari sababli kamida uch kun oldin", True, "165-modda 3-band.", S("M", "165-modda", "камида уч кун олдин")),
                     ("oral", "Og'zaki ogohlantirish yetarli", False, "Ogohlantirish yozma shaklda, imzo qo'ydirib beriladi (165-modda).", S("M", "165-modda", "ёзма шаклда (имзо қўйдириб) огоҳлантириши шарт")),
                     ("none", "Shtat qisqarishida ogohlantirish shart emas", False, "Kamida ikki oy oldin ogohlantirish kerak (165-modda).", S("M", "165-modda", "камида икки ой олдин"))]),
    form=dict(title="Muddat hisobi", desc="Har bir asos bo'yicha muddatni belgilang.", fields=[
        ch("cut", "Shtat/ishlar hajmi qisqarishi bilan bekor qilishda ogohlantirish", "m2", "Kamida ikki oy oldin (165-modda).", [("d3", "3 kun"), ("w2", "2 hafta"), ("m2", "2 oy"), ("m6", "6 oy")], S("M", "165-modda", "камида икки ой олдин")),
        ch("qual", "Malaka yetarli emasligi sababli bekor qilishda", "w2", "Kamida ikki hafta oldin (165-modda).", [("d3", "3 kun"), ("w2", "2 hafta"), ("m2", "2 oy"), ("m6", "6 oy")], S("M", "165-modda", "камида икки ҳафта олдин")),
        ch("fault", "Xodimning aybli harakatlari sababli bekor qilishda", "d3", "Kamida uch kun oldin (165-modda).", [("d3", "3 kun"), ("w2", "2 hafta"), ("m2", "2 oy"), ("m6", "6 oy")], S("M", "165-modda", "камида уч кун олдин")),
        ch("form", "Ogohlantirish shakli", "written", "Yozma, imzo qo'ydirib (165-modda).", [("written", "Yozma, imzo qo'ydirib"), ("oral", "Og'zaki"), ("sms", "Faqat SMS")], S("M", "165-modda", "ёзма шаклда (имзо қўйдириб) огоҳлантириши шарт"))]),
    order=dict(title="Bekor qilish tartibi", desc="Ish beruvchi harakatlarini belgilang.", items=[
        ("decide", "Ish beruvchi shartnomani bekor qilish niyatini belgilaydi (masalan, shtat o'zgarishi)", S("M", "165-modda", "Иш берувчи ўзининг меҳнат шартномасини бекор қилиш нияти ҳақида ходимни")),
        ("notice", "Xodimni yozma, imzo qo'ydirib ogohlantiradi", S("M", "165-modda", "ёзма шаклда (имзо қўйдириб) огоҳлантириши шарт")),
        ("wait", "Asosga mos muddat (masalan, kamida ikki oy) o'tgach shartnoma bekor qilinadi", S("M", "165-modda", "камида икки ой олдин"))]),
    quiz=dict(title="Aybli harakat", text="Xodimning aybli harakatlari sababli bekor qilishda ogohlantirish muddati qancha?", opts=[("a", "Kamida 3 kun"), ("b", "Kamida 2 oy"), ("c", "Kamida 6 oy"), ("d", "Ogohlantirish shart emas")], correct="a",
              src=S("M", "165-modda", "камида уч кун олдин")))

# ================================================================ M-E ishga tiklash
scenario(
    id="mehnat-ishga-tiklash", title="Qonunsiz bo'shatildim: ishga tiklanmoqchiman", area=ML, areaId="mehnat", tracks=TM + ["sudya"], level=3,
    summary="Xodim qonunsiz bo'shatilganini aytib ishga tiklanmoqchi. Qaysi organ ko'radi, qanday muddatda murojaat qilinadi, Mehnat kodeksi bo'yicha belgilang.",
    persona="Ravshan, 36 yosh, ombor mudiri", opening="Assalomu alaykum. Meni asossiz ishdan bo'shatishdi. Ishga tiklanmoqchiman, qayerga va qachongacha murojaat qilishim kerak?",
    facts=[("fired", "Ravshan ish beruvchi buyrug'i bilan bo'shatilgan", "Nima bo'ldi?", "Buyruq bilan ishdan bo'shatishdi."),
           ("copy", "Buyruqning ko'chirma nusxasi 20 kun oldin topshirilgan", "Buyruq nusxasini qachon oldingiz?", "Taxminan 20 kun oldin."),
           ("goal", "Mijoz ishga tiklanishni xohlaydi", "Nimani xohlaysiz?", "Ishga qaytishni xohlayman."),
           ("comm", "Korxonada mehnat nizolari komissiyasi tuzilgan", "Komissiya bormi?", "Ha, komissiya tuzilgan.")],
    filler=("Omborda nima saqlanadi?", "Bu hozir muhim emas, ishga tiklash masalasini gaplashaylik."),
    multi=dict(title="Qaysi organ ko'radi", desc="Ishga tiklash bo'yicha nizo qayerda ko'riladi.", prompt="Ishga tiklash to'g'risidagi nizo bo'yicha qaysi to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("court", "Ishga tiklash haqidagi nizo bevosita sudda ko'riladi", True, "558-modda 2-band.", S("M", "558-modda", "ишга тиклаш тўғрисидаги")),
                     ("direct", "Komissiya tuzilgan bo'lsa ham bu nizo bevosita sudda ko'riladi", True, "558-modda.", S("M", "558-modda", "Қуйидаги якка тартибдаги меҳнат низолари бевосита судда кўриб чиқилади")),
                     ("copy", "Murojaat muddati buyruq ko'chirma nusxasi topshirilgan kundan hisoblanadi", True, "560-modda.", S("M", "560-modda", "ишга тиклаш тўғрисидаги низолар бўйича")),
                     ("labins", "Davlat mehnat inspeksiyasi nizoni hal qiladi", False, "Nizoni komissiya yoki sud ko'radi; inspeksiya sudga murojaat qilish huquqiga ega (545, 559-moddalar).", S("M", "559-modda", "Давлат меҳнат инспекциясининг мансабдор шахслари")),
                     ("employer", "Ish beruvchining o'zi nizoni oxirgi hal qiladi", False, "Yakka tartibdagi mehnat nizolari komissiya yoki sud tomonidan ko'riladi (545-modda).", S("M", "545-modda", "меҳнат низолари бўйича комиссиялар томонидан"))]),
    form=dict(title="Muddat va organ", desc="Ishga tiklash nizosining muddat va organlarini belgilang.", fields=[
        ch("deadline", "Ishga tiklash bo'yicha sudga murojaat muddati", "m3", "Buyruq ko'chirma nusxasi topshirilgan kundan boshlab uch oy (560-modda).", [("m1", "1 oy"), ("m3", "3 oy"), ("m6", "6 oy"), ("y1", "1 yil")], S("M", "560-modda", "ишга тиклаш тўғрисидаги низолар бўйича — ходимга у билан меҳнат шартномаси бекор қилинганлиги ҳақидаги иш берувчи буйруғининг кўчирма нусхаси топширилган кундан эътиборан уч ой")),
        ch("other", "Boshqa mehnat nizolari bo'yicha murojaat muddati", "m6", "Xodim huquqi buzilganini bilgan yoki bilishi kerak bo'lgan kundan olti oy (560-modda).", [("m1", "1 oy"), ("m3", "3 oy"), ("m6", "6 oy"), ("y1", "1 yil")], S("M", "560-modda", "бошқа меҳнат низолари бўйича — ходим ўзининг ҳуқуқи бузилганлиги тўғрисида билган ёки билиши керак бўлган кундан эътиборан олти ой")),
        ch("who", "Ishga tiklash nizosi qayerda ko'riladi?", "court", "Bevosita sudda (558-modda).", [("court", "Bevosita sudda"), ("comm", "Faqat komissiyada"), ("insp", "Mehnat inspeksiyasida")], S("M", "558-modda", "ишга тиклаш тўғрисидаги"))]),
    order=dict(title="Ishga tiklash yo'li", desc="Harakatlar ketma-ketligini belgilang.", items=[
        ("copy", "Ish beruvchi buyrug'ining ko'chirma nusxasi xodimga topshiriladi", S("M", "560-modda", "иш берувчи буйруғининг кўчирма нусхаси топширилган кундан эътиборан уч ой")),
        ("court", "Xodim uch oy ichida bevosita sudga murojaat qiladi", S("M", "558-modda", "ишга тиклаш тўғрисидаги")),
        ("mediation", "Nizo istalgan bosqichda mediatorga o'tkazilishi mumkin", S("M", "545-modda", "«Медиация тўғрисида»ги Ўзбекистон Республикаси Қонунига мувофиқ кўриб чиқиш учун медиаторга ўтказилиши мумкин"))]),
    quiz=dict(title="Mediatsiya", text="Mehnat nizosi mediatsiya tartibida ko'rilayotgan davrda murojaat muddati nima bo'ladi?", opts=[("a", "To'xtatib turiladi"), ("b", "Tezlashadi"), ("c", "Bekor bo'ladi"), ("d", "O'zgarmaydi")], correct="a",
              src=S("M", "560-modda", "Якка тартибдаги меҳнат низоларини кўриб чиқиш бўйича судга мурожаат этиш муддатининг ўтиши якка тартибдаги меҳнат низосини медиация тартибида кўриб чиқиш даврида тўхтатиб турилади")))
print("batch2a: mehnat yozildi")
