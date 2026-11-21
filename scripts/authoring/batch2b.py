import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sc_lib import *

TO = ["advokat", "notarius", "sudya", "umumiy"]
TN = ["notarius", "advokat", "umumiy"]
TF = ["advokat", "korxona", "sudya", "umumiy"]
TC = ["sudya", "advokat", "umumiy"]
TA = ["davlat", "huquq-tartibot", "advokat", "umumiy"]
FIL = ("Bugun ob-havo qanday?", "Bu hozir muhim emas, asosiy masalani gaplashaylik.")

# ================================================================ O-A nikoh yoshi
scenario(
    id="oila-nikoh-yoshi", title="17 yoshda nikohga kirish mumkinmi?", area="Oila huquqi", areaId="oila", tracks=TO + ["davlat"], level=1,
    summary="17 yoshli qiz nikohga kirmoqchi. Nikoh yoshi, uni kamaytirish va nikohga to'siq bo'ladigan holatlarni Oila kodeksi bo'yicha belgilang.",
    persona="Malohat, 17 yosh, talaba", opening="Assalomu alaykum. Men 17 yoshdaman, turmush qurmoqchiman. Bu mumkinmi?",
    facts=[("age", "Qiz 17 yoshda", "Necha yoshdasiz?", "17 yoshdaman."),
           ("preg", "Qiz homilador", "Alohida holat bormi?", "Ha, homiladorman."),
           ("single", "Ikkala tomon ham boshqa nikohda emas", "Siz yoki kuyovingiz boshqa nikohdami?", "Yo'q, ikkalamiz ham yolg'izmiz."),
           ("kin", "Ular qarindosh emas", "Qarindoshlikingiz bormi?", "Yo'q.")],
    filler=FIL,
    multi=dict(title="Nikoh yoshi va to'siqlar", desc="Nikoh qoidalarini aniqlang.", prompt="Nikoh haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("age", "Nikoh yoshi erkaklar va ayollar uchun o'n sakkiz yosh", True, "15-modda.", S("O", "15-modda", "Nikoh yoshi erkaklar va ayollar uchun oʻn sakkiz yosh etib belgilanadi")),
                     ("hokim", "Uzrli sabab bo'lsa hokim nikoh yoshini ko'pi bilan bir yilga kamaytirishi mumkin", True, "15-modda.", S("O", "15-modda", "hokimi nikoh yoshini koʻpi bilan bir yilga kamaytirishi mumkin")),
                     ("bigamy", "Ro'yxatga olingan boshqa nikohda turgan shaxs bilan nikoh yo'l qo'yilmaydi", True, "16-modda.", S("O", "16-modda", "loaqal bittasi roʻyxatga olingan boshqa nikohda turgan shaxslar oʻrtasida")),
                     ("kin", "To'g'ri tutashgan qarindoshlar o'rtasida nikoh yo'l qo'yilmaydi", True, "16-modda.", S("O", "16-modda", "nasl-nasab shajarasi boʻyicha toʻgʻri tutashgan qarindoshlar oʻrtasida")),
                     ("never", "Hech qanday uzrli sabab bo'lsa ham 18 yoshdan oldin nikoh mumkin emas", False, "Uzrli sabablarda hokim yoshni kamaytirishi mumkin (15-modda).", S("O", "15-modda", "Uzrli sabablar boʻlganida, alohida hollarda")),
                     ("three", "Hokim nikoh yoshini uch yilgacha kamaytirishi mumkin", False, "Ko'pi bilan bir yilga (15-modda).", S("O", "15-modda", "koʻpi bilan bir yilga kamaytirishi mumkin"))]),
    form=dict(title="Yosh va monelik", desc="Nikoh yoshi va unga monelik qoidalarini belgilang.", fields=[
        ch("age", "Nikoh yoshi", "y18", "O'n sakkiz yosh (15-modda).", [("y16", "16 yosh"), ("y17", "17 yosh"), ("y18", "18 yosh"), ("y21", "21 yosh")], S("O", "15-modda", "Nikoh yoshi erkaklar va ayollar uchun oʻn sakkiz yosh")),
        ch("cut", "Hokim nikoh yoshini eng ko'pi bilan qancha kamaytirishi mumkin?", "y1", "Ko'pi bilan bir yilga (15-modda).", [("m6", "6 oyga"), ("y1", "1 yilga"), ("y2", "2 yilga"), ("y3", "3 yilga")], S("O", "15-modda", "koʻpi bilan bir yilga kamaytirishi mumkin")),
        ch("reason", "Qaysi hol nikoh yoshini kamaytirish uchun uzrli sabab sifatida ko'rsatilgan?", "preg", "Homiladorlik, bola tug'ilishi, emansipatsiya (15-modda).", [("preg", "Homiladorlik"), ("wish", "Ota-onaning xohishi"), ("money", "Mol-mulk masalasi")], S("O", "15-modda", "homiladorlik, bola tugʻilishi, voyaga yetmagan shaxsning toʻla muomalaga layoqatli deb eʼlon qilinishi"))]),
    order=dict(title="Yoshni kamaytirish", desc="Tartibni belgilang.", items=[
        ("age", "Nikoh yoshi 18 yosh deb belgilangan", S("O", "15-modda", "Nikoh yoshi erkaklar va ayollar uchun oʻn sakkiz yosh")),
        ("ask", "Uzrli sabab bo'lsa, nikohga kirishni xohlovchilar iltimos qiladi", S("O", "15-modda", "nikohga kirishni xohlovchilarning iltimosiga koʻra")),
        ("hokim", "Tuman yoki shahar hokimi yoshni ko'pi bilan bir yilga kamaytirishi mumkin", S("O", "15-modda", "hokimi nikoh yoshini koʻpi bilan bir yilga kamaytirishi mumkin"))]),
    quiz=dict(title="Boshqa nikoh", text="Ro'yxatga olingan boshqa nikohda turgan shaxs bilan nikoh tuzish mumkinmi?", opts=[("a", "Yo'l qo'yilmaydi"), ("b", "Mumkin"), ("c", "Hokim ruxsati bilan mumkin"), ("d", "Sud ruxsati bilan mumkin")], correct="a",
              src=S("O", "16-modda", "loaqal bittasi roʻyxatga olingan boshqa nikohda turgan shaxslar oʻrtasida")))

# ================================================================ O-B ajratish tartibi
scenario(
    id="oila-ajratish-tartibi", title="Nikohdan ajratish: sudda yoki FHDYo'da?", area="Oila huquqi", areaId="oila", tracks=TO, level=2,
    summary="Er-xotin ajrashmoqchi, voyaga yetmagan bolalar va mol-mulk nizosi bor. Nikohdan ajratish qayerda amalga oshirilishini Oila kodeksi bo'yicha belgilang.",
    persona="Shahlo, 34 yosh, ikki bolaning onasi", opening="Assalomu alaykum. Eri bilan ajrashmoqchiman, ikki bolamiz va mol-mulk nizosi bor. Qayerga murojaat qilaman?",
    facts=[("kids", "Ikkita voyaga yetmagan bola bor", "Bolalar bormi?", "Ikki voyaga yetmagan bolamiz bor."),
           ("dispute", "Bolalar va mol-mulk bo'yicha nizo bor", "Nizo bormi?", "Ha, bolalar va mol-mulkni bo'lish bo'yicha."),
           ("agree", "Eri ajrashishga rozi emas", "Eringiz rozimi?", "Yo'q, rozi emas."),
           ("jail", "Er hech qanday jazoga tortilmagan", "Eringiz sudlanganmi?", "Yo'q.")],
    filler=FIL,
    multi=dict(title="Ajratish organlari", desc="Qayerda va qachon.", prompt="Nikohdan ajratish haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("court", "Nikohdan ajratish asosan sud tartibida amalga oshiriladi", True, "38-modda.", S("O", "38-modda", "Nikohdan ajratish sud tartibida")),
                     ("missing", "Er-xotindan biri sud tomonidan bedarak yo'qolgan deb topilsa, FHDYo organida ajratiladi", True, "43-modda.", S("O", "43-modda", "sud tomonidan bedarak yoʻqolgan deb topilgan boʻlsa")),
                     ("incapable", "Er-xotindan biri ruhiyati buzilishi sababli sud tomonidan muomalaga layoqatsiz deb topilsa, FHDYo organida ajratiladi", True, "43-modda.", S("O", "43-modda", "sud tomonidan ruhiyati buzilishi (ruhiy kasalligi yoki aqli zaifligi) sababli muomalaga layoqatsiz deb topilgan boʻlsa")),
                     ("prison", "Er-xotindan biri uch yildan kam bo'lmagan muddatga ozodlikdan mahrum qilinsa, FHDYo organida ajratiladi", True, "43-modda.", S("O", "43-modda", "sodir qilgan jinoyati uchun uch yildan kam boʻlmagan muddatga ozodlikdan mahrum qilingan boʻlsa")),
                     ("kidsdispute", "Bolalar yoki mol-mulk nizosi bo'lsa ham FHDYo'da ajratiladi", False, "Bunday nizo bo'lsa, nikohdan sud tartibida ajratiladi (43-modda).", S("O", "43-modda", "ular nikohdan sud tartibida ajratiladi")),
                     ("oral", "Og'zaki kelishuv bilan ajratiladi", False, "Ajratish sud yoki FHDYo organida amalga oshiriladi (38-modda).", S("O", "38-modda", "Nikohdan ajratish sud tartibida"))]),
    form=dict(title="Ajratish tartibi", desc="Qayerda ajratilishini belgilang.", fields=[
        ch("general", "Nikohdan ajratish asosan qaysi tartibda amalga oshiriladi?", "court", "Sud tartibida (38-modda).", [("court", "Sud tartibida"), ("mahalla", "Mahalla yig'inida"), ("notary", "Notarius")], S("O", "38-modda", "Nikohdan ajratish sud tartibida")),
        ch("nizo", "Bolalar, umumiy mol-mulk bo'yicha nizo bo'lsa", "court", "Nikohdan sud tartibida ajratiladi (43-modda).", [("court", "Nikohdan sud tartibida ajratiladi"), ("fhdyo", "FHDYo organida ajratiladi"), ("none", "Ajratib bo'lmaydi")], S("O", "43-modda", "ular nikohdan sud tartibida ajratiladi")),
        ch("prison", "Er-xotindan biri qanday muddatga ozodlikdan mahrum qilinsa, FHDYo organida ajratiladi?", "y3", "Uch yildan kam bo'lmagan muddatga (43-modda).", [("m6", "6 oydan kam bo'lmagan"), ("y1", "1 yildan kam bo'lmagan"), ("y3", "3 yildan kam bo'lmagan"), ("y10", "10 yildan kam bo'lmagan")], S("O", "43-modda", "uch yildan kam boʻlmagan muddatga ozodlikdan mahrum qilingan boʻlsa"))]),
    order=dict(title="Sudda ajratish", desc="Jarayonni belgilang.", items=[
        ("claim", "Nikohdan ajratish bo'yicha ish sudda da'vo tartibida ko'riladi", S("O", "40-modda", "Nikohdan ajratish toʻgʻrisidagi ishlar sud tomonidan Oʻzbekiston Respublikasi Fuqarolik protsessual kodeksi")),
        ("reconcile", "Sud ishni keyinga qoldirib, yarashish uchun olti oygacha muhlat tayinlashga haqli", S("O", "40-modda", "yarashish uchun olti oygacha muhlat tayinlashga haqli")),
        ("divorce", "Birga yashashga va oilani saqlashga imkon yo'q deb topilsa, sud nikohdan ajratadi", S("O", "41-modda", "ularni nikohdan ajratadi"))]),
    quiz=dict(title="Yarashish muhlati", text="Sud er-xotinga yarashish uchun eng ko'pi bilan qancha muhlat tayinlashi mumkin?", opts=[("a", "Olti oygacha"), ("b", "Bir yilgacha"), ("c", "Uch oygacha"), ("d", "Muhlat tayinlab bo'lmaydi")], correct="a",
              src=S("O", "40-modda", "yarashish uchun olti oygacha muhlat tayinlashga haqli")))

# ================================================================ O-C yarashish va zo'ravonlik
scenario(
    id="oila-yarashish-zoravonlik", title="Ajrashish: zo'ravonlikdan jabrlangan ayol", area="Oila huquqi", areaId="oila", tracks=TO, level=3,
    summary="Oilaviy zo'ravonlikdan jabrlangan ayol ajrashmoqchi, er yarashish muhlatini so'ramoqda. Yarashish muhlati qoidalari va istisnolarini Oila kodeksi bo'yicha belgilang.",
    persona="Nodira, 31 yosh", opening="Assalomu alaykum. Eri meni uradi, ajrashmoqchiman. U sudda yarashish uchun muhlat so'rayapti. Muhlat berishadimi?",
    facts=[("viol", "Mijoz oilaviy zo'ravonlikdan jabrlangan", "Nima bo'layapti?", "Eri meni muntazam uradi."),
           ("req", "Er yarashish uchun muhlat so'ramoqda", "Er sudda nima so'rayapti?", "Yarashishga muhlat so'rayapti."),
           ("claim", "Jabrlangan ayol muhlat tayinlanmasligini talab qilmoqda", "Siz nimani xohlaysiz?", "Muhlat berilmasin, deyman."),
           ("kids", "Voyaga yetmagan bola bor", "Bolalar bormi?", "Bitta 5 yoshli bolamiz bor.")],
    filler=FIL,
    multi=dict(title="Yarashish muhlati", desc="Muhlat qoidalarini aniqlang.", prompt="Yarashish muhlati haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("six", "Sud ishni keyinga qoldirib, yarashish uchun olti oygacha muhlat tayinlashga haqli", True, "40-modda.", S("O", "40-modda", "yarashish uchun olti oygacha muhlat tayinlashga haqli")),
                     ("notify", "Muhlat tayinlansa, fuqarolar yig'ini yarashtirish komissiyasi uch kundan kechiktirmay yozma xabardor qilinadi", True, "40-modda.", S("O", "40-modda", "uch kundan kechiktirmasdan yozma ravishda xabardor qilishi kerak")),
                     ("violence", "Oilaviy zo'ravonlikdan jabrlangan shaxsning talabiga ko'ra yarashish uchun muhlat tayinlanmaydi", True, "40-modda.", S("O", "40-modda", "Sud oilaviy (maishiy) zoʻravonlikdan jabrlangan shaxsning talabiga koʻra yarashish uchun muhlat tayinlamaydi")),
                     ("divorce", "Birga yashashga imkoniyat yo'q deb topilsa, sud nikohdan ajratadi", True, "41-modda.", S("O", "41-modda", "ularni nikohdan ajratadi")),
                     ("always", "Zo'ravonlik bo'lsa ham muhlat tayinlanishi majburiy", False, "Zo'ravonlikdan jabrlangan shaxsning talabiga ko'ra muhlat tayinlanmaydi (40-modda).", S("O", "40-modda", "Sud oilaviy (maishiy) zoʻravonlikdan jabrlangan shaxsning talabiga koʻra yarashish uchun muhlat tayinlamaydi")),
                     ("year", "Yarashish muhlati bir yilgacha bo'lishi mumkin", False, "Olti oygacha (40-modda).", S("O", "40-modda", "yarashish uchun olti oygacha muhlat tayinlashga haqli"))]),
    form=dict(title="Muhlat va istisno", desc="Qoidalarni belgilang.", fields=[
        ch("max", "Yarashish uchun eng ko'p muhlat", "m6", "Olti oygacha (40-modda).", [("m1", "1 oygacha"), ("m3", "3 oygacha"), ("m6", "6 oygacha"), ("y1", "1 yilgacha")], S("O", "40-modda", "yarashish uchun olti oygacha muhlat tayinlashga haqli")),
        ch("viol", "Oilaviy zo'ravonlikdan jabrlangan shaxsning talabiga ko'ra", "none", "Yarashish uchun muhlat tayinlanmaydi (40-modda).", [("force", "Muhlat majburiy tayinlanadi"), ("none", "Muhlat tayinlanmaydi"), ("year", "Bir yil muhlat beriladi")], S("O", "40-modda", "Sud oilaviy (maishiy) zoʻravonlikdan jabrlangan shaxsning talabiga koʻra yarashish uchun muhlat tayinlamaydi")),
        ch("notice", "Muhlat tayinlansa, yarashtirish komissiyasi qancha muddatda xabardor qilinadi?", "d3", "Uch kundan kechiktirmay, yozma (40-modda).", [("d1", "1 kundan kechiktirmay"), ("d3", "3 kundan kechiktirmay"), ("d30", "30 kundan kechiktirmay"), ("none", "Xabar berilmaydi")], S("O", "40-modda", "uch kundan kechiktirmasdan yozma ravishda xabardor qilishi kerak"))]),
    order=dict(title="Ish ko'rilishi", desc="Jarayonni belgilang.", items=[
        ("court", "Ish sudda da'vo tartibida ko'riladi", S("O", "40-modda", "Nikohdan ajratish toʻgʻrisidagi ishlar sud tomonidan")),
        ("check", "Zo'ravonlikdan jabrlangan shaxs talab qilsa, yarashish muhlati tayinlanmaydi", S("O", "40-modda", "Sud oilaviy (maishiy) zoʻravonlikdan jabrlangan shaxsning talabiga koʻra yarashish uchun muhlat tayinlamaydi")),
        ("decide", "Birga yashashga imkon yo'q bo'lsa, sud nikohdan ajratadi", S("O", "41-modda", "ularni nikohdan ajratadi"))]),
    quiz=dict(title="Imkon yo'qligi", text="Sud qaysi holatda er-xotinni nikohdan ajratadi?", opts=[("a", "Birgalikda yashashga va oilani saqlab qolishga imkoniyat yo'q deb topsa"), ("b", "Faqat erning roziligi bo'lsa"), ("c", "Mahalla ruxsat bersa"), ("d", "Bola 18 yoshga to'lsa")], correct="a",
              src=S("O", "41-modda", "Agar sud er va xotinning bundan buyon birgalikda yashashiga va oilani saqlab qolishga imkoniyat yoʻq deb topsa")))

# ================================================================ N-A vasiyatnoma
scenario(
    id="notariat-vasiyatnoma", title="Vasiyatnomani vakil orqali tasdiqlatsa bo'ladimi?", area="Notariat", areaId="fuqarolik", tracks=TN, level=2,
    summary="Keksa mijoz vasiyatnomani qarindoshi orqali tasdiqlatmoqchi. Vasiyatnomani tasdiqlash qoidalarini «Notariat to'g'risida»gi Qonun bo'yicha belgilang.",
    persona="Hamida, 70 yosh", opening="Assalomu alaykum. Vasiyatnoma yozdim, uni notariusga nevaram olib borib tasdiqlatsa bo'ladimi?",
    facts=[("will", "Mijoz vasiyatnoma yozgan", "Nima yozgansiz?", "Uyimni nevaramga vasiyat qilganman."),
           ("agent", "Vasiyatnomani nevara orqali tasdiqlatmoqchi", "Kim olib boradi?", "Nevaram olib boradi."),
           ("proof", "Mijozda uyga mulk huquqi hujjatlari uyda", "Uy hujjatlari bormi?", "Hujjatlar uyda qolgan."),
           ("cap", "Mijoz muomalaga layoqatli", "Sog'lig'ingiz qanday?", "O'zim hamma narsani tushunaman.")],
    filler=FIL,
    multi=dict(title="Vasiyatnoma tasdiqlash", desc="Qoidalarni aniqlang.", prompt="Vasiyatnomani tasdiqlash haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("cap", "Notariuslar muomalaga layoqatli fuqarolarning vasiyatnomalarini tasdiqlaydi", True, "45-modda.", S("N", "45-modda", "Notariuslar muomalaga layoqatli fuqarolarning qonunchilik talablariga muvofiq tuzilgan")),
                     ("personal", "Vasiyatnoma notariusga vasiyat qiluvchi shaxsan taqdim etadi", True, "45-modda.", S("N", "45-modda", "ularning oʻzlari notariusga shaxsan taqdim etgan vasiyatnomalarini tasdiqlaydi")),
                     ("agent", "Vasiyatnomalarni vakillar orqali tasdiqlashga yo'l qo'yilmaydi", True, "45-modda.", S("N", "45-modda", "Vasiyatnomalarni vakillar orqali tasdiqlashga yoʻl qoʻyilmaydi")),
                     ("noproof", "Vasiyat qiluvchidan mol-mulkka huquqini tasdiqlovchi dalillar talab qilinmaydi", True, "45-modda.", S("N", "45-modda", "uning vasiyat qilinayotgan mol-mulkka boʻlgan huquqini tasdiqlovchi dalillarni taqdim etish talab qilinmaydi")),
                     ("byagent", "Vasiyatnomani ishonchli vakil orqali tasdiqlatish mumkin", False, "Vakil orqali tasdiqlashga yo'l qo'yilmaydi (45-modda).", S("N", "45-modda", "Vasiyatnomalarni vakillar orqali tasdiqlashga yoʻl qoʻyilmaydi")),
                     ("mustproof", "Vasiyat qiluvchi mulk huquqini isbotlovchi hujjatlarni taqdim etishi shart", False, "Bunday dalillar talab qilinmaydi (45-modda).", S("N", "45-modda", "dalillarni taqdim etish talab qilinmaydi"))]),
    form=dict(title="Tasdiqlash shartlari", desc="Shartlarni belgilang.", fields=[
        ch("who", "Vasiyatnomani notariusga kim taqdim etadi?", "self", "Vasiyat qiluvchining o'zi shaxsan (45-modda).", [("self", "Vasiyat qiluvchining o'zi shaxsan"), ("agent", "Ishonchli vakili"), ("heir", "Merosxo'r")], S("N", "45-modda", "ularning oʻzlari notariusga shaxsan taqdim etgan")),
        ch("agent", "Vasiyatnomani vakil orqali tasdiqlash", "no", "Yo'l qo'yilmaydi (45-modda).", [("yes", "Mumkin"), ("no", "Yo'l qo'yilmaydi"), ("court", "Faqat sud ruxsati bilan")], S("N", "45-modda", "Vasiyatnomalarni vakillar orqali tasdiqlashga yoʻl qoʻyilmaydi")),
        ch("proof", "Mulk huquqini tasdiqlovchi dalillar", "nottr", "Talab qilinmaydi (45-modda).", [("must", "Majburiy taqdim etiladi"), ("nottr", "Talab qilinmaydi"), ("half", "Faqat ko'chmas mulk uchun")], S("N", "45-modda", "dalillarni taqdim etish talab qilinmaydi"))]),
    order=dict(title="Tasdiqlash tartibi", desc="Tartibni belgilang.", items=[
        ("write", "Muomalaga layoqatli fuqaro qonunga muvofiq vasiyatnoma tuzadi", S("N", "45-modda", "qonunchilik talablariga muvofiq tuzilgan")),
        ("bring", "Vasiyat qiluvchi uni notariusga shaxsan taqdim etadi", S("N", "45-modda", "notariusga shaxsan taqdim etgan")),
        ("confirm", "Notarius vasiyatnomani tasdiqlaydi", S("N", "45-modda", "vasiyatnomalarini tasdiqlaydi"))]),
    quiz=dict(title="Mulk huquqi", text="Vasiyatnomani tasdiqlab berishda vasiyat qiluvchidan mulk huquqini tasdiqlovchi dalillar talab qilinadimi?", opts=[("a", "Talab qilinmaydi"), ("b", "Har doim talab qilinadi"), ("c", "Faqat uy-joy uchun"), ("d", "Faqat avtomobil uchun")], correct="a",
              src=S("N", "45-modda", "dalillarni taqdim etish talab qilinmaydi")))

# ================================================================ N-B meros guvohnomasi
scenario(
    id="notariat-meros-guvohnomasi", title="Merosga bo'lgan huquq guvohnomasi", area="Notariat", areaId="oila", tracks=TN + ["sudya"], level=2,
    summary="Ota vafot etgan, merosxo'rlar orasida voyaga yetmagan bola bor. Merosga bo'lgan huquq guvohnomasini olish tartibini «Notariat to'g'risida»gi Qonun bo'yicha belgilang.",
    persona="Bekzod, 38 yosh, merosxo'r", opening="Assalomu alaykum. Otamiz vafot etdi, uch merosxo'rmiz, biri voyaga yetmagan. Meros guvohnomasini qanday olamiz?",
    facts=[("died", "Ota vafot etgan, meros ochilgan", "Nima bo'ldi?", "Otamiz vafot etdi."),
           ("heirs", "Uch merosxo'r bor, biri voyaga yetmagan", "Merosxo'rlar kimlar?", "Uchimiz, kenjamiz hali 15 yoshda."),
           ("place", "Meros otaning so'nggi yashash joyida ochilgan", "Ota qayerda yashagan?", "Samarqandda."),
           ("accepted", "Merosxo'rlar merosni qabul qilganlar", "Merosni qabul qildingizmi?", "Ha, hammamiz qabul qildik.")],
    filler=FIL,
    multi=dict(title="Meros guvohnomasi qoidalari", desc="Qoidalarni aniqlang.", prompt="Merosga bo'lgan huquq guvohnomasi haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("place", "Guvohnomani meros ochilgan joydagi notarius beradi", True, "58-modda.", S("N", "58-modda", "Meros ochilgan joydagi notarius merosxoʻrlarning yozma arizalariga koʻra merosga boʻlgan huquq toʻgʻrisida guvohnomalar beradi")),
                     ("written", "Guvohnoma merosxo'rlarning yozma arizalariga ko'ra beriladi", True, "58-modda.", S("N", "58-modda", "merosxoʻrlarning yozma arizalariga koʻra")),
                     ("together", "Guvohnoma barcha merosxo'rlarga birgalikda yoki xohishiga ko'ra har biriga alohida beriladi", True, "59-modda.", S("N", "59-modda", "barcha merosxoʻrlarga birgalikda yoki ularning xohishiga bogʻliq ravishda har biriga alohida berilishi mumkin")),
                     ("minor", "Voyaga yetmagan merosxo'r bo'lsa, vasiylik va homiylik organlariga xabar qilinadi", True, "59-modda.", S("N", "59-modda", "vasiylik va homiylik organlariga xabar qiladi")),
                     ("anyplace", "Guvohnomani istalgan shahardagi notarius beradi", False, "Meros ochilgan joydagi notarius beradi (58-modda).", S("N", "58-modda", "Meros ochilgan joydagi notarius")),
                     ("oral", "Guvohnoma og'zaki arizaga ko'ra beriladi", False, "Yozma arizaga ko'ra (58-modda).", S("N", "58-modda", "yozma arizalariga koʻra"))]),
    form=dict(title="Guvohnoma berish", desc="Qoidalarni belgilang.", fields=[
        ch("who", "Guvohnomani qaysi notarius beradi?", "open", "Meros ochilgan joydagi notarius (58-modda).", [("any", "Istalgan notarius"), ("open", "Meros ochilgan joydagi notarius"), ("heir", "Merosxo'r yashaydigan joydagi notarius")], S("N", "58-modda", "Meros ochilgan joydagi notarius")),
        ch("app", "Guvohnoma qanday ariza asosida beriladi?", "written", "Merosxo'rlarning yozma arizasi (58-modda).", [("written", "Yozma ariza"), ("oral", "Og'zaki ariza"), ("none", "Arizasiz")], S("N", "58-modda", "merosxoʻrlarning yozma arizalariga koʻra")),
        ch("minor", "Voyaga yetmagan merosxo'r bo'lsa notarius nima qiladi?", "guard", "Vasiylik va homiylik organlariga xabar qiladi (59-modda).", [("none", "Hech narsa"), ("guard", "Vasiylik va homiylik organlariga xabar qiladi"), ("refuse", "Guvohnoma bermaydi")], S("N", "59-modda", "vasiylik va homiylik organlariga xabar qiladi"))]),
    order=dict(title="Guvohnoma olish", desc="Tartibni belgilang.", items=[
        ("apply", "Merosxo'rlar meros ochilgan joydagi notariusga yozma ariza beradi", S("N", "58-modda", "merosxoʻrlarning yozma arizalariga koʻra")),
        ("issue", "Notarius guvohnomani qonunchilikda belgilangan muddatlarda beradi", S("N", "58-modda", "Guvohnomalar qonunchilikda belgilangan muddatlarda beriladi")),
        ("notify", "Voyaga yetmagan merosxo'r bo'lsa, vasiylik organiga xabar qilinadi", S("N", "59-modda", "vasiylik va homiylik organlariga xabar qiladi"))]),
    quiz=dict(title="Guvohnoma shakli", text="Guvohnoma merosxo'rlarga qanday beriladi?", opts=[("a", "Birgalikda yoki xohishiga ko'ra har biriga alohida"), ("b", "Faqat bittasiga"), ("c", "Faqat katta merosxo'rga"), ("d", "Faqat sud orqali")], correct="a",
              src=S("N", "59-modda", "barcha merosxoʻrlarga birgalikda yoki ularning xohishiga bogʻliq ravishda har biriga alohida berilishi mumkin")))

# ================================================================ N-C nusxa shahodati
scenario(
    id="notariat-nusxa-shahodati", title="Diplom nusxasini notarius tasdiqlaydimi?", area="Notariat", areaId="fuqarolik", tracks=TN, level=1,
    summary="Mijoz hujjat nusxasi to'g'riligini tasdiqlatmoqchi. Qanday nusxa notarial shahodatlanishi mumkinligini «Notariat to'g'risida»gi Qonun bo'yicha belgilang.",
    persona="Ulug'bek, 24 yosh, bitiruvchi", opening="Assalomu alaykum. Diplom nusxasini notarius tasdiqlashi kerak. Qanday nusxa olib kelaman?",
    facts=[("doc", "Mijoz diplom nusxasini tasdiqlatmoqchi", "Qanday hujjat?", "Diplomning nusxasi."),
           ("source", "Nusxa universitet tomonidan berilgan", "Nusxani kim bergan?", "Universitet bergan."),
           ("stamp", "Universitet nusxani muhr bilan tasdiqlagan", "Muhr bormi?", "Ha, muhr bosilgan."),
           ("where", "Nusxada asl hujjat universitetda ekanligi yozilmagan", "Asli qayerda deb yozilganmi?", "Yo'q, yozilmagan.")],
    filler=FIL,
    multi=dict(title="Nusxa shahodati shartlari", desc="Qaysi nusxa shahodatlanadi.", prompt="Hujjat nusxasidan ko'chirilgan nusxa to'g'riligini shahodatlash haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("notarized", "Avvalgi nusxaning to'g'riligi notarial tartibda shahodatlangan bo'lsa", True, "66-modda.", S("N", "66-modda", "basharti avvalgi nusxaning toʻgʻriligi notarial tartibda shahodatlangan boʻlsa")),
                     ("issued", "Nusxa asl nusxa tayyorlangan korxona, muassasa, tashkilot tomonidan berilgan bo'lsa", True, "66-modda.", S("N", "66-modda", "hujjatning nusxasi uning asl nusxasi tayyorlangan korxona, muassasa, tashkilot tomonidan berilgan boʻlsa")),
                     ("written", "Bunday nusxa yuridik shaxsning ish qog'ozida bayon etilgan va muhr bilan tasdiqlangan bo'lishi kerak", True, "66-modda.", S("N", "66-modda", "ish qogʻozida bayon etilgan, muhr bosib tasdiqlangan")),
                     ("original", "Nusxada hujjatning asli shu tashkilotda ekanligi yozib qo'yilgan bo'lishi kerak", True, "66-modda.", S("N", "66-modda", "unda shu hujjatning asli mazkur korxona, muassasa, tashkilotda ekanligi yozib qoʻyilgan boʻlishi kerak")),
                     ("anycopy", "Istalgan fotonusxa shahodatlanadi", False, "Faqat 66-modda shartlariga mos nusxa shahodatlanadi.", S("N", "66-modda", "Hujjat nusxasidan koʻchirilgan nusxaning toʻgʻriligini notariuslar")),
                     ("noseal", "Muhrsiz nusxa ham yetarli", False, "Nusxa muhr bilan tasdiqlangan bo'lishi kerak (66-modda).", S("N", "66-modda", "muhr bosib tasdiqlangan"))]),
    form=dict(title="Nusxa shartlari", desc="Shartlarni belgilang.", fields=[
        ch("who", "Nusxa qaysi holda shahodatlanishi mumkin?", "issued", "Asl nusxa tayyorlangan tashkilot bergan yoki avval notarial shahodatlangan bo'lsa (66-modda).", [("any", "Har qanday fotonusxa"), ("issued", "Asl nusxani tayyorlagan tashkilot bergan yoki avval notarial shahodatlangan"), ("web", "Internetdan olingan nusxa")], S("N", "66-modda", "hujjatning nusxasi uning asl nusxasi tayyorlangan korxona, muassasa, tashkilot tomonidan berilgan boʻlsa")),
        ch("note", "Nusxada nima yozib qo'yilgan bo'lishi kerak?", "orig", "Hujjatning asli shu tashkilotda ekanligi (66-modda).", [("none", "Hech narsa"), ("orig", "Hujjatning asli shu tashkilotda ekanligi"), ("price", "Nusxa narxi")], S("N", "66-modda", "unda shu hujjatning asli mazkur korxona, muassasa, tashkilotda ekanligi yozib qoʻyilgan boʻlishi kerak")),
        ch("seal", "Nusxa qanday tasdiqlangan bo'lishi kerak?", "seal", "Muhr bosib tasdiqlangan (66-modda).", [("none", "Tasdiqlash shart emas"), ("seal", "Muhr bosib tasdiqlangan"), ("sign", "Faqat imzo bilan")], S("N", "66-modda", "muhr bosib tasdiqlangan"))]),
    order=dict(title="Nusxa tayyorlash", desc="Tartibni belgilang.", items=[
        ("issue", "Tashkilot hujjat nusxasini o'z ish qog'ozida beradi", S("N", "66-modda", "ish qogʻozida bayon etilgan")),
        ("seal", "Nusxa muhr bosib tasdiqlanadi va unda asli tashkilotda ekanligi yoziladi", S("N", "66-modda", "unda shu hujjatning asli mazkur korxona, muassasa, tashkilotda ekanligi yozib qoʻyilgan boʻlishi kerak")),
        ("notary", "Notarius nusxaning to'g'riligini shahodatlaydi", S("N", "66-modda", "toʻgʻriligini notariuslar"))]),
    quiz=dict(title="Avvalgi nusxa", text="Avvalgi nusxaning to'g'riligi notarial tartibda shahodatlangan bo'lsa, notarius undan ko'chirilgan nusxani shahodatlaydimi?", opts=[("a", "Ha, shahodatlaydi"), ("b", "Yo'q, hech qachon"), ("c", "Faqat sud ruxsati bilan"), ("d", "Faqat prokuror ruxsati bilan")], correct="a",
              src=S("N", "66-modda", "basharti avvalgi nusxaning toʻgʻriligi notarial tartibda shahodatlangan boʻlsa")))
print("batch2b-1 yozildi")
