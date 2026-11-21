import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sc_lib import *

TF = ["advokat", "korxona", "sudya", "umumiy"]
TC = ["sudya", "advokat", "umumiy"]
TA = ["davlat", "huquq-tartibot", "advokat", "umumiy"]
FIL = ("Bugun ob-havo qanday?", "Bu hozir muhim emas, asosiy masalani gaplashaylik.")
FK = "Fuqarolik huquqi"

# ================================================================ F-A xaridor huquqlari (FK 434)
scenario(
    id="fuqarolik-nuqsonli-tovar-pul", title="Sotuvchi pulni to'liq qaytarmayapti", area=FK, areaId="fuqarolik", tracks=TF, level=2,
    summary="Xaridor nuqsonli tovarni qaytardi, sotuvchi foydalanganlik uchun pulning bir qismini ushlab qolmoqchi. Xaridor huquqlarini Fuqarolik kodeksi bo'yicha belgilang.",
    persona="Odil, 33 yosh, haydovchi", opening="Assalomu alaykum. Sotib olgan blenderim nuqsonli chiqdi, qaytardim. Sotuvchi 'ishlatgansiz' deb pulning bir qismini ushlab qolmoqchi. Huquqi bormi?",
    facts=[("defect", "Blender nuqsonli, kamchilik shartnoma tuzishda aytilmagan", "Nuqson nima?", "Motor qizib, o'zi o'chib qoladi, sotuvchi buni aytmagan edi."),
           ("used", "Xaridor tovardan qisman foydalangan", "Ishlatganmisiz?", "Ha, bir necha marta ishlatdim."),
           ("hold", "Sotuvchi qiymat pasayishi uchun pulning bir qismini ushlab qolmoqchi", "Sotuvchi nima deydi?", "Ishlatilgani uchun yarmini ushlab qolaman, deydi."),
           ("wish", "Xaridor shartnomani bekor qilib pulni qaytarishni xohlaydi", "Nimani xohlaysiz?", "Shartnomani bekor qilib, pulimni qaytarib olmoqchiman.")],
    filler=FIL,
    multi=dict(title="Xaridor huquqlari", desc="Sifatsiz tovar sotilganda xaridor huquqlari.", prompt="Sifati tegishli darajada bo'lmagan tovar sotilganda xaridor nimani talab qilishi mumkin? To'g'ri variantlarning hammasini belgilang.",
               opts=[("same", "Xuddi shu markadagi sifatli tovarga almashtirish", True, "434-modda.", S("F", "434-modda", "xuddi shu markadagi (modeldagi, artikuldagi) sifati tegishli darajada boʻlgan tovarga almashtirishni")),
                     ("other", "Boshqa markadagi tovarga almashtirish, narxni qayta hisoblab", True, "434-modda.", S("F", "434-modda", "xarid narxini tegishincha qayta hisoblagan holda boshqa markadagi (modeldagi, artikuldagi) sifati tegishli darajada boʻlgan tovarga almashtirishni")),
                     ("repair", "Kamchiliklarni tekinga bartaraf etish yoki xarajatlarni qoplash", True, "434-modda.", S("F", "434-modda", "tovarning kamchiliklarini tekinga bartaraf etishni")),
                     ("reduce", "Xarid narxini mutanosib kamaytirish", True, "434-modda.", S("F", "434-modda", "xarid narxini mutanosib ravishda kamaytirishni")),
                     ("cancel", "Zarar o'rnini qoplagan holda shartnomani bekor qilish", True, "434-modda.", S("F", "434-modda", "koʻrilgan zarar oʻrnini qoplagan holda shartnoma bekor qilinishini talab qilish huquqiga ega")),
                     ("hold", "Sotuvchi foydalanganlik tufayli qiymat pasayishini ushlab qolishi mumkin", False, "Sotuvchi qiymat pasaygan summani ushlab qolishga haqli emas (434-modda).", S("F", "434-modda", "shuncha summani ushlab qolishga haqli emas"))]),
    form=dict(title="Pulni qaytarish", desc="Pulni qaytarish va javobgarlik qoidalarini belgilang.", fields=[
        ch("choice", "Xaridor huquqni qanday tanlaydi?", "own", "O'z xohishiga ko'ra (434-modda).", [("own", "O'z xohishiga ko'ra"), ("seller", "Sotuvchi tanlaydi"), ("court", "Faqat sud tanlaydi")], S("F", "434-modda", "sotib oluvchi oʻz xohishiga koʻra")),
        ch("hold", "Pulni qaytarishda sotuvchi tovardan foydalanilgani uchun qiymat pasayishini ushlab qolishi mumkinmi?", "no", "Haqli emas (434-modda).", [("yes", "Mumkin"), ("no", "Haqli emas"), ("half", "Faqat yarmini")], S("F", "434-modda", "shuncha summani ushlab qolishga haqli emas")),
        ch("duty", "Zararni qoplash va neustoyka to'lash sotuvchini majburiyatni asl holida bajarishdan", "notfree", "Ozod qilmaydi (436-modda).", [("free", "Ozod qiladi"), ("notfree", "Ozod qilmaydi"), ("half", "Yarim ozod qiladi")], S("F", "436-modda", "sotuvchini majburiyatni asl holida bajarishdan ozod qilmaydi"))]),
    order=dict(title="Xaridor harakatlari", desc="Tartibni belgilang.", items=[
        ("defect", "Tovar kamchiligi shartnoma tuzishda ma'lum qilinmaganligi aniqlanadi", S("F", "434-modda", "agar uning kamchiliklari shartnoma tuzish paytida maʼlum qilinmagan boʻlsa")),
        ("choose", "Xaridor o'z xohishiga ko'ra huquqlardan birini tanlaydi", S("F", "434-modda", "sotib oluvchi oʻz xohishiga koʻra")),
        ("refund", "Pul qaytarilganda sotuvchi qiymat pasayishini ushlab qolmaydi", S("F", "434-modda", "shuncha summani ushlab qolishga haqli emas"))]),
    quiz=dict(title="Majburiyat asl holida", text="Sotuvchi majburiyatni bajarmaganda zararni qoplash va neustoyka to'lash uni majburiyatni asl holida bajarishdan ozod qiladimi?", opts=[("a", "Ozod qilmaydi"), ("b", "Ozod qiladi"), ("c", "Faqat yarmiga ozod qiladi"), ("d", "Sud xohishiga ko'ra")], correct="a",
              src=S("F", "436-modda", "sotuvchini majburiyatni asl holida bajarishdan ozod qilmaydi")))

# ================================================================ F-B maishiy pudrat (FK 665)
scenario(
    id="fuqarolik-maishiy-pudrat", title="Tikuvchi kostyumni yomon tikdi", area=FK, areaId="fuqarolik", tracks=TF, level=2,
    summary="Buyurtmachi tikuvchidan kostyum buyurtma qilgan, ish sifatsiz bajarilgan. Maishiy pudratda buyurtmachi huquqlarini Fuqarolik kodeksi bo'yicha belgilang.",
    persona="Nodir, 35 yosh, menejer", opening="Assalomu alaykum. Kostyum tiktirgandim, o'lchami xato va chok yomon. Tikuvchi tuzatmayapti. Nima qilsam bo'ladi?",
    facts=[("order", "Maishiy pudrat shartnomasi: kostyum tikish", "Nima buyurtma qilgansiz?", "Kostyum tiktirgandim."),
           ("bad", "Ish tegishli darajada bajarilmagan", "Nima yomon?", "O'lchami noto'g'ri, choklari yomon."),
           ("refuse", "Tikuvchi tuzatishdan bosh tortmoqda", "Tikuvchi nima deydi?", "Tuzatmayman, deydi."),
           ("paid", "Buyurtmachi to'lovni to'liq to'lagan", "To'lov qilganmisiz?", "Ha, to'liq to'lagandim.")],
    filler=FIL,
    multi=dict(title="Buyurtmachi huquqlari", desc="Maishiy pudratda huquqlarni aniqlang.", prompt="Maishiy pudrat shartnomasi bo'yicha ish tegishli darajada bajarilmasa, buyurtmachi qaysi huquqlardan foydalanishi mumkin? To'g'ri variantlarning hammasini belgilang.",
               opts=[("rights", "Sotib oluvchiga berilgan huquqlardan foydalanish", True, "665-modda.", S("F", "665-modda", "sotib oluvchiga berilgan huquqlardan foydalanishi mumkin")),
                     ("repair", "Kamchiliklarni tekinga bartaraf etishni talab qilish", True, "434-modda orqali.", S("F", "434-modda", "tovarning kamchiliklarini tekinga bartaraf etishni")),
                     ("reduce", "Narxni mutanosib kamaytirishni talab qilish", True, "434-modda orqali.", S("F", "434-modda", "xarid narxini mutanosib ravishda kamaytirishni")),
                     ("cancel", "Zararni qoplagan holda shartnomani bekor qilishni talab qilish", True, "434-modda orqali.", S("F", "434-modda", "koʻrilgan zarar oʻrnini qoplagan holda shartnoma bekor qilinishini talab qilish huquqiga ega")),
                     ("none", "Buyurtmachining hech qanday huquqi yo'q", False, "Buyurtmachi sotib oluvchi huquqlaridan foydalanishi mumkin (665-modda).", S("F", "665-modda", "sotib oluvchiga berilgan huquqlardan foydalanishi mumkin")),
                     ("buyfix", "Faqat to'lovni yarim kamaytirib, boshqa talab qo'yib bo'lmaydi", False, "Buyurtmachi bir nechta huquqdan birini o'z xohishiga ko'ra tanlaydi (434-modda).", S("F", "434-modda", "sotib oluvchi oʻz xohishiga koʻra"))]),
    form=dict(title="Talab", desc="Talab qoidalarini belgilang.", fields=[
        ch("rule", "Maishiy pudratda ish tegishli darajada bajarilmasa, buyurtmachi huquqlari qaysi kodeks moddalariga havola qiladi?", "buyer", "Sotib oluvchiga berilgan huquqlardan foydalanishi mumkin (665-modda).", [("buyer", "Sotib oluvchiga berilgan huquqlar (434–436-moddalar)"), ("none", "Hech qanday"), ("tax", "Soliq kodeksi")], S("F", "665-modda", "sotib oluvchiga berilgan huquqlardan foydalanishi mumkin")),
        ch("choice", "Buyurtmachi huquqni qanday tanlaydi?", "own", "O'z xohishiga ko'ra (434-modda).", [("own", "O'z xohishiga ko'ra"), ("master", "Usta tanlaydi"), ("court", "Faqat sud")], S("F", "434-modda", "sotib oluvchi oʻz xohishiga koʻra")),
        ch("cancel", "Shartnoma bekor qilinganda qanday talab qo'yish mumkin?", "loss", "Ko'rilgan zarar o'rnini qoplagan holda shartnomani bekor qilish (434-modda).", [("loss", "Ko'rilgan zarar o'rnini qoplash bilan shartnomani bekor qilish"), ("none", "Zararni talab qilib bo'lmaydi"), ("tip", "Faqat uzr")], S("F", "434-modda", "koʻrilgan zarar oʻrnini qoplagan holda shartnoma bekor qilinishini talab qilish huquqiga ega"))]),
    order=dict(title="Buyurtmachi yo'li", desc="Tartibni belgilang.", items=[
        ("found", "Ish tegishli darajada bajarilmaganligi aniqlanadi", S("F", "665-modda", "ish tegishli darajada yoki umuman bajarilmagan taqdirda")),
        ("rights", "Buyurtmachi sotib oluvchiga berilgan huquqlardan foydalanadi", S("F", "665-modda", "sotib oluvchiga berilgan huquqlardan foydalanishi mumkin")),
        ("choose", "Huquqlardan birini (tuzatish, narxni kamaytirish, bekor qilish) o'z xohishiga ko'ra tanlaydi", S("F", "434-modda", "sotib oluvchi oʻz xohishiga koʻra"))]),
    quiz=dict(title="Qaysi modda", text="Maishiy pudratda ish yomon bajarilganda buyurtmachi qaysi shaxsning huquqlaridan foydalanishi mumkin?", opts=[("a", "Sotib oluvchining huquqlaridan"), ("b", "Sotuvchining huquqlaridan"), ("c", "Pudratchining huquqlaridan"), ("d", "Hech kimnikidan")], correct="a",
              src=S("F", "665-modda", "sotib oluvchiga berilgan huquqlardan foydalanishi mumkin")))

# ================================================================ F-C pudrat sifati (FK 650)
scenario(
    id="fuqarolik-pudrat-sifati", title="Pudratchi remontni sifatsiz bajardi", area=FK, areaId="fuqarolik", tracks=TF, level=3,
    summary="Buyurtmachi remont uchun pudrat shartnomasi tuzgan, ish shartnomadan chetga chiqib bajarilgan. Buyurtmachi huquqlari va pudratchi javobgarligini Fuqarolik kodeksi bo'yicha belgilang.",
    persona="Abbos, 44 yosh, ofis egasi", opening="Assalomu alaykum. Ofisimni remont qildirdim, ish shartnomadan chetga chiqib, sifatsiz bajarildi. Pudratchi tuzatmayapti. Nima qilishim mumkin?",
    facts=[("deviate", "Ish pudrat shartnomasidan chetga chiqib bajarilgan", "Nima noto'g'ri?", "Shartnomadagi materiallar boshqasi bilan almashtirilgan."),
           ("worse", "Ish natijasi yomonlashgan", "Natija qanday?", "Devor va pol sifatsiz chiqdi."),
           ("reasonable", "Buyurtmachi oqilona muddat belgilab, tuzatishni talab qilgan, bajarilmagan", "Tuzatishni talab qildingizmi?", "Ha, 10 kun muddat berdim, bajarishmadi."),
           ("serious", "Kamchiliklar jiddiy", "Kamchiliklar qanchalik jiddiy?", "Ancha jiddiy, qayta qilish kerak.")],
    filler=FIL,
    multi=dict(title="Buyurtmachi talablari", desc="Pudratda sifat yomon bo'lsa nimani talab qilish mumkin.", prompt="Pudratchi ishni shartnomadan chetga chiqib bajarsa, buyurtmachi nimani talab qilishga haqli? To'g'ri variantlarning hammasini belgilang.",
               opts=[("fix", "Kamchiliklarni oqilona muddatda bepul bartaraf etishni", True, "650-modda.", S("F", "650-modda", "kamchiliklarni oqilona muddatda bepul bartaraf etishni")),
                     ("reduce", "Ish uchun belgilangan bahoni mutanosib kamaytirishni", True, "650-modda.", S("F", "650-modda", "ish uchun belgilangan bahoni mutanosib ravishda kamaytirishni")),
                     ("cost", "Shartnomada kamchiliklarni bartaraf etish huquqi nazarda tutilgan bo'lsa, o'z xarajatlarini qoplashni", True, "650-modda.", S("F", "650-modda", "ularni bartaraf etishga qilgan oʻz xarajatlarini qoplashni talab qilishga haqli")),
                     ("refuse", "Kamchiliklar jiddiy va bartaraf etib bo'lmasa yoki oqilona muddatda bartaraf etilmasa, shartnomani bajarishdan bosh tortish va zararni qoplash", True, "650-modda.", S("F", "650-modda", "buyurtmachi shartnomani bajarishdan bosh tortishga va keltirilgan zararni qoplashni talab qilishga haqli")),
                     ("none", "Buyurtmachi faqat uzr so'rashni talab qila oladi", False, "650-modda buyurtmachiga aniq talablar beradi.", S("F", "650-modda", "oʻz xohishiga koʻra pudratchidan")),
                     ("pay", "Buyurtmachi har qanday holatda ham narxni to'liq to'lashga majbur", False, "Buyurtmachi narxni mutanosib kamaytirishni talab qilishga haqli (650-modda).", S("F", "650-modda", "ish uchun belgilangan bahoni mutanosib ravishda kamaytirishni"))]),
    form=dict(title="Pudratchi javobgarligi", desc="Javobgarlik qoidalarini belgilang.", fields=[
        ch("choice", "Buyurtmachi dastlabki talablardan birini qanday tanlaydi?", "own", "O'z xohishiga ko'ra (650-modda).", [("own", "O'z xohishiga ko'ra"), ("contractor", "Pudratchi tanlaydi"), ("court", "Sud tanlaydi")], S("F", "650-modda", "oʻz xohishiga koʻra pudratchidan")),
        ch("redo", "Pudratchi kamchiliklarni bartaraf etish o'rniga nima qilishga haqli?", "redo", "Zararni qoplagan holda ishni yangidan bepul bajarib berishga haqli (650-modda).", [("redo", "Kechiktirishdan yetkazilgan zararni qoplab, ishni yangidan bepul bajarib berish"), ("none", "Hech narsa"), ("pay", "Pul qaytarish va ketish")], S("F", "650-modda", "ishni yangidan bepul bajarib berishga haqli")),
        ch("serious", "Kamchiliklar jiddiy va bartaraf etib bo'lmasa", "refuse", "Buyurtmachi shartnomani bajarishdan bosh tortishga va zararni qoplashni talab qilishga haqli (650-modda).", [("refuse", "Shartnomani bajarishdan bosh tortib, zararni talab qilishga haqli"), ("wait", "Cheksiz kutishi shart"), ("none", "Hech narsa talab qilolmaydi")], S("F", "650-modda", "shartnomani bajarishdan bosh tortishga va keltirilgan zararni qoplashni talab qilishga haqli"))]),
    order=dict(title="Buyurtmachi harakatlari", desc="Tartibni belgilang.", items=[
        ("found", "Ish shartnomadan chetga chiqib, natijani yomonlashtirib bajarilganligi aniqlanadi", S("F", "650-modda", "Agar ish pudratchi tomonidan pudrat shartnomasidan chetga chiqqan holda bajarilib, ish natijasini yomonlashtirgan boʻlsa")),
        ("demand", "Buyurtmachi oqilona muddatda kamchilikni bepul bartaraf etishni talab qiladi", S("F", "650-modda", "kamchiliklarni oqilona muddatda bepul bartaraf etishni")),
        ("refuse", "Muddatda bartaraf etilmasa, shartnomani bajarishdan bosh tortib, zararni talab qiladi", S("F", "650-modda", "yoxud aniqlangan kamchiliklar buyurtmachi tomonidan belgilangan oqilona muddatda bartaraf etilmagan boʻlsa"))]),
    quiz=dict(title="Narxni kamaytirish", text="Buyurtmachi ish uchun belgilangan bahoni qanday kamaytirishni talab qilishi mumkin?", opts=[("a", "Mutanosib ravishda"), ("b", "Yarmiga"), ("c", "To'liq bekor qilib"), ("d", "Kamaytirish mumkin emas")], correct="a",
              src=S("F", "650-modda", "ish uchun belgilangan bahoni mutanosib ravishda kamaytirishni")))

# ================================================================ F-D sotuvchini xabardor qilish (FK 416)
scenario(
    id="fuqarolik-sotuvchini-xabardor-qilish", title="Kamchilikni kech aniqladim: sotuvchiga qachon aytaman?", area=FK, areaId="fuqarolik", tracks=TF, level=3,
    summary="Xaridor tovar miqdori/sifati shartlari buzilganini kech aniqlagan. Sotuvchini xabardor qilish majburiyati va oqibatlarini Fuqarolik kodeksi bo'yicha belgilang.",
    persona="Murod, 39 yosh, do'kon egasi", opening="Assalomu alaykum. Olingan tovar partiyasida sifat shartiga mos kelmaydigan mahsulot chiqdi, ammo sotuvchiga kech aytdim. Endi talabim rad etilishi mumkinmi?",
    facts=[("breach", "Tovar sifat/miqdor shartlari buzilgan", "Nima buzilgan?", "Partiyada sifati past tovar chiqdi."),
           ("late", "Sotuvchiga oqilona muddatdan keyin xabar berilgan", "Sotuvchiga qachon aytdingiz?", "Aniqlaganimdan ancha keyin."),
           ("knew", "Sotuvchi tovar shartnomaga mos kelmasligini bilgan", "Sotuvchi bilganmi?", "Ha, u bilgan deb o'ylayman."),
           ("cost", "Kech xabar sotuvchiga nomutanosib xarajat keltirishi mumkin", "Xabarning kechikishi sotuvchiga ziyon keltirdimi?", "Ehtimol.")],
    filler=FIL,
    multi=dict(title="Xabardor qilish qoidalari", desc="Qoidalarni aniqlang.", prompt="Sotuvchini xabardor qilish haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("must", "Xaridor shartlar buzilganligini sotuvchiga oqilona muddatda ma'lum qilishi shart", True, "416-modda.", S("F", "416-modda", "sotuvchiga maʼlum qilishi shart")),
                     ("refuse", "Xabar bermagan xaridorning talablarini sotuvchi to'liq yoki qisman rad etishga haqli bo'lishi mumkin", True, "416-modda ikkinchi qismi.", S("F", "416-modda", "talablarini qondirishdan toʻliq yoki qisman bosh tortishga haqli")),
                     ("knew", "Sotuvchi shartlarga mos kelmasligini bilgan bo'lsa, xaridorning xabar bermaganini vaj qilib ko'rsata olmaydi", True, "416-modda uchinchi qismi.", S("F", "416-modda", "vaj qilib koʻrsatishga haqli emas")),
                     ("never", "Xaridor sotuvchini xabardor qilishi shart emas", False, "Xaridor xabardor qilishi shart (416-modda).", S("F", "416-modda", "sotuvchiga maʼlum qilishi shart")),
                     ("always", "Xabar bermagan xaridor har doim barcha talablaridan mahrum bo'ladi", False, "Sotuvchi buni isbotlasa va bilmagan bo'lsa rad etishga haqli, bilgan bo'lsa haqli emas (416-modda).", S("F", "416-modda", "vaj qilib koʻrsatishga haqli emas"))]),
    form=dict(title="Xabar qilish", desc="Xabardor qilish qoidalarini belgilang.", fields=[
        ch("who", "Shartlar buzilganligi haqida kim kimni xabardor qilishi shart?", "buyer", "Sotib oluvchi sotuvchini (416-modda).", [("buyer", "Sotib oluvchi sotuvchini"), ("seller", "Sotuvchi sotib oluvchini"), ("court", "Sud tomonlarni")], S("F", "416-modda", "sotuvchiga maʼlum qilishi shart")),
        ch("late", "Xabar bermasa, sotuvchi", "may", "Isbotlasa, talablarni to'liq yoki qisman rad etishga haqli (416-modda).", [("may", "Talablarni qondirishdan to'liq yoki qisman bosh tortishga haqli bo'lishi mumkin"), ("never", "Hech narsa qila olmaydi"), ("fine", "Xaridorni jarimaga tortadi")], S("F", "416-modda", "talablarini qondirishdan toʻliq yoki qisman bosh tortishga haqli")),
        ch("knew", "Sotuvchi tovar shartnomaga mos kelmasligini bilgan bo'lsa", "noexcuse", "Xaridor xabar bermaganligini vaj qilib ko'rsatishga haqli emas (416-modda).", [("excuse", "Xabar bermaganligini vaj qilib ko'rsatishi mumkin"), ("noexcuse", "Bunday vajga haqli emas"), ("half", "Yarmini vaj qiladi")], S("F", "416-modda", "vaj qilib koʻrsatishga haqli emas"))]),
    order=dict(title="Xabardor qilish tartibi", desc="Tartibni belgilang.", items=[
        ("find", "Xaridor shartlar buzilganligini aniqlaydi", S("F", "416-modda", "oldi-sotdi shartnomasining tovarlar miqdori, assortimenti, sifati, butligi, idishi")),
        ("notify", "Oqilona muddatda sotuvchiga ma'lum qiladi", S("F", "416-modda", "oqilona muddatda sotuvchiga maʼlum qilishi shart")),
        ("claim", "Talablarini qo'yadi; sotuvchi bilgan bo'lsa, kech xabarni vaj qila olmaydi", S("F", "416-modda", "vaj qilib koʻrsatishga haqli emas"))]),
    quiz=dict(title="Xabar muddati", text="Xaridor shartlar buzilganini qanday muddatda ma'lum qilishi shart?", opts=[("a", "Qonunchilikda yoki shartnomada belgilangan, bo'lmasa oqilona muddatda"), ("b", "Hech qachon shart emas"), ("c", "Ertasi kuni"), ("d", "Bir yildan keyin")], correct="a",
              src=S("F", "416-modda", "qonunchilikda yoki shartnomada koʻzda tutilgan muddatda, agar bunday muddat belgilangan boʻlmasa")))

# ================================================================ C-A sud buyrug'i (FPK 171,177,180)
scenario(
    id="protsessual-sud-buyrugi", title="Ish haqi qarzini sud buyrug'i bilan undirish", area="Fuqarolik protsessi", areaId="mehnat", tracks=TC + ["korxona"], level=2,
    summary="Xodim hisoblangan, ammo to'lanmagan ish haqini sud buyrug'i orqali undirmoqchi. Sud buyrug'i beriladigan hollar, tartibi va kuchga kirishini Fuqarolik protsessual kodeksi bo'yicha belgilang.",
    persona="Shuhrat, 42 yosh, xodim", opening="Assalomu alaykum. Hisoblangan ish haqim to'lanmadi. Sud buyrug'i bilan tez undirsa bo'ladimi?",
    facts=[("wage", "Hisoblangan, lekin to'lanmagan ish haqi bor", "Qarz nima?", "Hisoblangan ish haqim to'lanmagan."),
           ("clear", "Talab bahssiz, qo'shimcha shaxslarni jalb etish talab qilinmaydi", "Nizo bormi?", "Qarz summasi aniq, bahs yo'q."),
           ("fast", "Mijoz tez natija xohlaydi", "Nimani xohlaysiz?", "Tezroq undirishni."),
           ("debtor", "Qarzdor e'tiroz bildirishi mumkin", "Ish beruvchi rozimi?", "Bilmayman, e'tiroz bildirishi mumkin.")],
    filler=FIL,
    multi=dict(title="Sud buyrug'i hollari", desc="Qaysi talablar bo'yicha sud buyrug'i beriladi.", prompt="Sud buyrug'i qaysi hollarda beriladi? To'g'ri variantlarning hammasini belgilang.",
               opts=[("wage", "Hisoblangan, lekin xodimga to'lanmagan ish haqini undirish", True, "171-modda 5-band.", S("C", "171-modda", "hisoblangan, lekin xodimga toʻlanmagan ish haqini va unga tenglashtirilgan toʻlovlarni undirish haqida talab arz qilingan boʻlsa")),
                     ("alimony", "Voyaga yetmagan bolalar uchun aliment (otalikni belgilashsiz)", True, "171-modda 4-band.", S("C", "171-modda", "voyaga yetmagan bolalar uchun alimentlar undirish toʻgʻrisidagi, otalikni belgilash bilan yoki uchinchi shaxslarni jalb etish zarurati bilan bogʻliq boʻlmagan talab arz qilingan boʻlsa")),
                     ("rent", "Ijara shartnomasida belgilangan to'lovlar muddatida to'lanmaganligi sababli ularni undirish", True, "171-modda 7-band.", S("C", "171-modda", "ijara shartnomasida belgilangan ijara toʻlovlari muddatida toʻlanmaganligi sababli ushbu toʻlovlarni undirish toʻgʻrisida talab arz qilingan boʻlsa")),
                     ("notary", "Talab notarial tasdiqlangan bitimga asoslangan bo'lsa", True, "171-modda 1-band.", S("C", "171-modda", "talab notarial tasdiqlangan bitimga asoslangan boʻlsa")),
                     ("divorce", "Nikohdan ajratish talabi", False, "171-modda ro'yxatida nikohdan ajratish yo'q.", S("C", "171-modda", "Sud buyrugʻi quyidagi hollarda beriladi, agar:")),
                     ("moral", "Ma'naviy zararni undirish talabi", False, "171-modda ro'yxatida bunday talab yo'q.", S("C", "171-modda", "Sud buyrugʻi quyidagi hollarda beriladi, agar:"))]),
    form=dict(title="Sud buyrug'i tartibi", desc="Tartib va muddatlarni belgilang.", fields=[
        ch("days", "Sud buyrug'i ariza kelib tushgan kundan necha kun ichida beriladi?", "d3", "Uch kun ichida (177-modda).", [("d1", "1 kun"), ("d3", "3 kun"), ("d10", "10 kun"), ("m1", "1 oy")], S("C", "177-modda", "ariza sudga kelib tushgan kundan eʼtiboran uch kun ichida sudya tomonidan beriladi")),
        ch("hearing", "Sud buyrug'i qanday beriladi?", "nohear", "Taraflarni chaqirmasdan, tushuntirishlarni eshitmasdan, sud muhokamasisiz (177-modda).", [("hear", "Sud majlisida taraflar ishtirokida"), ("nohear", "Taraflarni chaqirmasdan, sud muhokamasisiz"), ("video", "Faqat video aloqa orqali")], S("C", "177-modda", "undiruvchi va qarzdorni sudga chaqirmasdan, ularning tushuntirishlarini eshitmasdan yakka tartibda, sud muhokamasisiz beriladi")),
        ch("force", "Sud buyrug'i qachon qonuniy kuchga kiradi?", "d10", "Berilgandan so'ng o'n kunlik muddat o'tgach (180-modda).", [("now", "Berilgan zahoti"), ("d10", "10 kun o'tgach"), ("d30", "30 kun o'tgach"), ("y1", "1 yildan keyin")], S("C", "180-modda", "Sud buyrugʻi u berilgandan soʻng oʻn kunlik muddat oʻtgach qonuniy kuchga kiradi"))]),
    order=dict(title="Sud buyrug'i jarayoni", desc="Tartibni belgilang.", items=[
        ("apply", "Undiruvchi sud buyrug'ini berish haqida ariza beradi", S("C", "177-modda", "ariza sudga kelib tushgan kundan")),
        ("issue", "Sudya uch kun ichida taraflarni chaqirmasdan sud buyrug'ini beradi", S("C", "177-modda", "ariza sudga kelib tushgan kundan eʼtiboran uch kun ichida sudya tomonidan beriladi")),
        ("copy", "Qarzdor e'tiroz bermasa, muhr bilan tasdiqlangan nusxa ijroga beriladi", S("C", "177-modda", "Agar belgilangan muddatda qarzdordan sudga eʼtiroz kelib tushmasa, sudya undiruvchiga sudning muhri bilan tasdiqlangan buyruq koʻchirma nusxasini ijroga taqdim etish uchun beradi"))]),
    quiz=dict(title="Kuchga kirish", text="Sud buyrug'i qachon qonuniy kuchga kiradi?", opts=[("a", "Berilgandan so'ng o'n kun o'tgach"), ("b", "Berilgan kuni"), ("c", "Bir oydan keyin"), ("d", "Apellyatsiyadan keyin")], correct="a",
              src=S("C", "180-modda", "Sud buyrugʻi u berilgandan soʻng oʻn kunlik muddat oʻtgach qonuniy kuchga kiradi")))

# ================================================================ C-B da'voni ta'minlash (FPK 105,106,112)
scenario(
    id="protsessual-davoni-taminlash", title="Javobgar mol-mulkni sotib yuborishi mumkin", area="Fuqarolik protsessi", areaId="fuqarolik", tracks=TC, level=3,
    summary="Da'vogar javobgar mol-mulkni sotib yuborishidan xavotirda. Da'voni ta'minlash asoslari, choralari va saqlanish muddatini Fuqarolik protsessual kodeksi bo'yicha belgilang.",
    persona="Akmal, 46 yosh, da'vogar", opening="Assalomu alaykum. Sudda da'vo qo'zg'atdim, javobgar mol-mulkini sotib yuborishi mumkin. Sud hujjati ijrosi qiyin bo'lib qolmaydimi? Nima qilsam bo'ladi?",
    facts=[("claim", "Da'vogar pul undirish bo'yicha da'vo qo'zg'atgan", "Da'voingiz nima haqida?", "Qarz undirish."),
           ("risk", "Javobgar mol-mulkini sotib yuborishi mumkin", "Nimadan xavotirdasiz?", "Javobgar mol-mulkini sotib yuborishidan."),
           ("stage", "Ish hali sudda ko'rilmoqda", "Ish qaysi bosqichda?", "Sudda ko'rilmoqda."),
           ("prop", "Javobgarning bank hisobi va avtomobili bor", "Javobgarning nimasi bor?", "Bank hisobi va avtomobil.")],
    filler=FIL,
    multi=dict(title="Da'voni ta'minlash choralari", desc="Qaysilari da'voni ta'minlash chorasi.", prompt="Quyidagilardan qaysilari da'voni ta'minlash choralari bo'lishi mumkin? To'g'ri variantlarning hammasini belgilang.",
               opts=[("seize", "Javobgarga tegishli mol-mulk yoki pul mablag'larini xatlash", True, "106-modda 1-band.", S("C", "106-modda", "javobgarga tegishli boʻlgan va uning oʻzida yoki boshqa shaxsda turgan mol-mulkni yoxud pul mablagʻlarini xatlash")),
                     ("ban", "Javobgar muayyan harakatlarni amalga oshirishini taqiqlash", True, "106-modda 2-band.", S("C", "106-modda", "javobgar muayyan harakatlarni amalga oshirishini taqiqlash")),
                     ("third", "Boshqa shaxslarning javobgarga mol-mulk berishini yoki majburiyatlarni bajarishini taqiqlash", True, "106-modda 3-band.", S("C", "106-modda", "boshqa shaxslarning javobgarga mol-mulk berishini yoki unga nisbatan boshqa majburiyatlarni bajarishini taqiqlash")),
                     ("keeper", "Nizoli mol-mulkni saqlash uchun uchinchi shaxsga topshirish", True, "106-modda 7-band.", S("C", "106-modda", "nizoli mol-mulkni saqlash uchun uchinchi shaxsga (saqlovchiga) topshirish")),
                     ("arrest", "Javobgarni qamoqqa olish", False, "106-modda ro'yxatida bunday chora yo'q.", S("C", "106-modda", "Quyidagilar daʼvoni taʼminlash choralari boʻlishi mumkin")),
                     ("disproportion", "Da'vo talabiga nomutanosib, juda katta choralar", False, "Choralar talabga mutanosib bo'lishi kerak (106-modda).", S("C", "106-modda", "Daʼvoni taʼminlash choralari daʼvogar arz qilgan talabga mutanosib boʻlishi kerak"))]),
    form=dict(title="Asoslar va muddat", desc="Da'voni ta'minlash qoidalarini belgilang.", fields=[
        ch("when", "Da'voni ta'minlashga sud protsessining qaysi bosqichida yo'l qo'yiladi?", "any", "Har qanday bosqichida (105-modda).", [("start", "Faqat boshida"), ("any", "Har qanday bosqichida"), ("end", "Faqat hal qiluv qaroridan keyin")], S("C", "105-modda", "Daʼvoni taʼminlashga sud protsessining har qanday bosqichida yoʻl qoʻyiladi")),
        ch("ground", "Da'voni ta'minlashga qachon yo'l qo'yiladi?", "hard", "Choralarni ko'rmaslik sud hujjati ijrosini qiyinlashtirsa yoki uni bajarib bo'lmaydigan qilib qo'ysa (105-modda).", [("any", "Har qanday holatda"), ("hard", "Choralarni ko'rmaslik sud hujjati ijrosini qiyinlashtirsa yoki imkonsiz qilsa"), ("never", "Hech qachon")], S("C", "105-modda", "Agar daʼvoni taʼminlash choralarini koʻrmaslik sud hujjati ijrosini qiyinlashtirsa yoki uni bajarib boʻlmaydigan qilib qoʻysa, daʼvoni taʼminlashga yoʻl qoʻyiladi")),
        ch("kept", "Da'vo qanoatlantirilsa, choralar qancha saqlanadi?", "execute", "Hal qiluv qarori amalda ijro etilguniga qadar (112-modda).", [("date", "Qaror chiqqan kunigacha"), ("execute", "Hal qiluv qarori amalda ijro etilguniga qadar"), ("m1", "1 oy")], S("C", "112-modda", "daʼvoni taʼminlash choralari hal qiluv qarori amalda ijro etilguniga qadar oʻz kuchini saqlab qoladi"))]),
    order=dict(title="Ta'minlash jarayoni", desc="Tartibni belgilang.", items=[
        ("app", "Ishda ishtirok etuvchi shaxs ariza beradi, unda asoslar va zaruriyat ko'rsatiladi", S("C", "105-modda", "Daʼvoni taʼminlash toʻgʻrisidagi arizada daʼvoni taʼminlash choralarini koʻrish asoslari va zaruriyati koʻrsatilgan boʻlishi lozim")),
        ("measure", "Sud mutanosib chorani (masalan, xatlash) ko'radi", S("C", "106-modda", "Daʼvoni taʼminlash choralari daʼvogar arz qilgan talabga mutanosib boʻlishi kerak")),
        ("kept", "Da'vo qanoatlantirilsa, choralar qaror ijrosigacha saqlanadi", S("C", "112-modda", "daʼvoni taʼminlash choralari hal qiluv qarori amalda ijro etilguniga qadar oʻz kuchini saqlab qoladi"))]),
    quiz=dict(title="Da'vo rad etilsa", text="Da'vo rad qilinsa, da'voni ta'minlash choralari qancha saqlanadi?", opts=[("a", "Hal qiluv qarori qonuniy kuchga kirguniga qadar"), ("b", "Darhol bekor bo'ladi"), ("c", "Bir yil"), ("d", "Abadiy")], correct="a",
              src=S("C", "112-modda", "daʼvoni taʼminlash choralari hal qiluv qarori qonuniy kuchga kirguniga qadar saqlanib qoladi")))

# ================================================================ A-A jarima to'lash (MJtK 332)
scenario(
    id="mamuriy-jarima-tolash", title="Ma'muriy jarimani qachongacha to'lash kerak?", area="Ma'muriy huquq", areaId="mamuriy", tracks=TA, level=1,
    summary="Haydovchiga ma'muriy jarima solingan. Jarima to'lash muddatlari, shikoyat berilgandagi muddat va 16–18 yoshdagilar uchun qoidalarni Ma'muriy javobgarlik to'g'risidagi kodeks bo'yicha belgilang.",
    persona="Javlon, 28 yosh, haydovchi", opening="Assalomu alaykum. Yo'l harakati qoidasini buzganim uchun jarima solishdi. Qachongacha to'lashim kerak?",
    facts=[("fine", "Yo'l harakati qoidalarini buzganlik uchun jarima solingan", "Nima uchun jarima solishdi?", "Yo'l harakati qoidasini buzganim uchun."),
           ("date", "Qaror chiqarilgan kundan bir necha kun o'tgan", "Qaror qachon chiqqan?", "Taxminan 10 kun oldin."),
           ("appeal", "Mijoz qarorga shikoyat qilmoqchi", "Shikoyat qilmoqchimisiz?", "Ha, shikoyat qilmoqchiman."),
           ("age", "Mijoz voyaga yetgan", "Necha yoshdasiz?", "28 yoshdaman.")],
    filler=FIL,
    multi=dict(title="Jarima muddatlari", desc="Qoidalarni aniqlang.", prompt="Jarima to'lash haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("general", "Umumiy qoida: jarima qaror topshirilgan kundan o'ttiz kundan kechiktirmay to'lanadi", True, "332-modda.", S("A", "332-modda", "qaror topshirilgan kundan boshlab oʻttiz kundan kechiktirmay")),
                     ("appeal", "Shikoyat qanoatlantirilmasa, xabar berilgan kundan o'n besh kundan kechiktirmay to'lanadi", True, "332-modda.", S("A", "332-modda", "shikoyat yoki protest qanoatlantirilmaganligi toʻgʻrisida xabar berilgan kundan boshlab oʻn besh kundan kechiktirmay toʻlanishi lozim")),
                     ("traffic", "Yo'l harakati qoidalari uchun jarima qaror chiqarilgan kundan oltmish kundan kechiktirmay to'lanadi", True, "332-modda.", S("A", "332-modda", "jarima solish toʻgʻrisidagi qaror chiqarilgan kundan eʼtiboran oltmish kundan kechiktirmay")),
                     ("minor", "16–18 yoshdagilarda mustaqil ish haqi bo'lmasa, jarima ota-onalaridan undiriladi", True, "332-modda.", S("A", "332-modda", "jarima ularning ota-onalari yoki ular oʻrnini bosuvchi shaxslardan undirib olinadi")),
                     ("never", "Jarima to'lash muddati belgilanmagan", False, "Muddatlar 332-moddada belgilangan.", S("A", "332-modda", "qaror topshirilgan kundan boshlab oʻttiz kundan kechiktirmay")),
                     ("bankless", "Jarima har doim naqd pulda joyida to'lanadi", False, "Jarima tegishli bank muassasasiga to'lanadi (joyida undiriladigan jarima bundan mustasno).", S("A", "332-modda", "tegishli bank muassasasiga toʻlanadi"))]),
    form=dict(title="Muddat hisobi", desc="Jarima muddatlarini belgilang.", fields=[
        ch("general", "Umumiy qoida bo'yicha jarima to'lash muddati", "d30", "Qaror topshirilgan kundan o'ttiz kundan kechiktirmay (332-modda).", [("d10", "10 kun"), ("d30", "30 kun"), ("d60", "60 kun"), ("y1", "1 yil")], S("A", "332-modda", "qaror topshirilgan kundan boshlab oʻttiz kundan kechiktirmay")),
        ch("traffic", "Yo'l harakati qoidalarini buzganlik uchun jarima to'lash muddati", "d60", "Qaror chiqarilgan kundan oltmish kundan kechiktirmay (332-modda).", [("d10", "10 kun"), ("d30", "30 kun"), ("d60", "60 kun"), ("y1", "1 yil")], S("A", "332-modda", "jarima solish toʻgʻrisidagi qaror chiqarilgan kundan eʼtiboran oltmish kundan kechiktirmay")),
        ch("appeal", "Umumiy qoidada shikoyat qanoatlantirilmasa, to'lash muddati", "d15", "Xabar berilgan kundan o'n besh kundan kechiktirmay (332-modda).", [("d5", "5 kun"), ("d15", "15 kun"), ("d30", "30 kun"), ("d60", "60 kun")], S("A", "332-modda", "shikoyat yoki protest qanoatlantirilmaganligi toʻgʻrisida xabar berilgan kundan boshlab oʻn besh kundan kechiktirmay toʻlanishi lozim"))]),
    order=dict(title="Jarima to'lash", desc="Tartibni belgilang.", items=[
        ("decision", "Jarima solish haqida qaror chiqariladi va topshiriladi", S("A", "332-modda", "Jarima huquqbuzar tomonidan unga jarima solish toʻgʻrisidagi qaror topshirilgan kundan boshlab")),
        ("pay", "Huquqbuzar belgilangan muddatda jarimani bank muassasasiga to'laydi", S("A", "332-modda", "tegishli bank muassasasiga toʻlanadi")),
        ("appeal", "Shikoyat qilinsa va qanoatlantirilmasa, xabar berilgan kundan o'n besh kunda to'lanadi", S("A", "332-modda", "shikoyat yoki protest qanoatlantirilmaganligi toʻgʻrisida xabar berilgan kundan boshlab oʻn besh kundan kechiktirmay toʻlanishi lozim"))]),
    quiz=dict(title="16–18 yoshdagilar", text="16–18 yoshdagi shaxsning mustaqil ish haqi bo'lmasa, jarima kimdan undiriladi?", opts=[("a", "Ota-onalari yoki ularning o'rnini bosuvchi shaxslardan"), ("b", "Maktabdan"), ("c", "Qo'shnilaridan"), ("d", "Undirilmaydi")], correct="a",
              src=S("A", "332-modda", "jarima ularning ota-onalari yoki ular oʻrnini bosuvchi shaxslardan undirib olinadi")))

# ================================================================ A-B yosh va shikoyat (MJtK 13, 316)
scenario(
    id="mamuriy-yosh-shikoyat", title="Ma'muriy qarorga shikoyat qilish muddati", area="Ma'muriy huquq", areaId="mamuriy", tracks=TA, level=1,
    summary="Mijoz ma'muriy huquqbuzarlik qaroriga shikoyat qilmoqchi. Ma'muriy javobgarlik yoshi va shikoyat berish muddatini Ma'muriy javobgarlik to'g'risidagi kodeks bo'yicha belgilang.",
    persona="Sherzod, 25 yosh, tadbirkor", opening="Assalomu alaykum. Menga ma'muriy jarima solishdi, qaror noto'g'ri deb o'ylayman. Qancha muddat ichida shikoyat qilishim mumkin?",
    facts=[("decision", "Ma'muriy huquqbuzarlik to'g'risidagi ish bo'yicha qaror chiqarilgan", "Qanday qaror?", "Jarima solish haqida qaror."),
           ("copy", "Qarorning nusxasi 5 kun oldin olingan", "Nusxani qachon oldingiz?", "Taxminan 5 kun oldin."),
           ("court", "Qaror sud tomonidan chiqarilmagan", "Qaror kim chiqargan?", "Ma'muriy organ mansabdor shaxsi."),
           ("age", "Mijoz huquqbuzarlik paytida 25 yoshda", "Necha yoshda edingiz?", "25 yoshda.")],
    filler=FIL,
    multi=dict(title="Yosh va shikoyat qoidalari", desc="Qoidalarni aniqlang.", prompt="Ma'muriy javobgarlik va shikoyat haqida qaysi qoidalar to'g'ri? To'g'ri variantlarning hammasini belgilang.",
               opts=[("age", "Huquqbuzarlik sodir etgan paytda o'n olti yoshga to'lgan shaxslar ma'muriy javobgarlikka tortiladi", True, "13-modda.", S("A", "13-modda", "Maʼmuriy huquqbuzarlik sodir etgan paytda oʻn olti yoshga toʻlgan shaxslar")),
                     ("ten", "Qaror nusxasi olingan kundan o'n kun ichida shikoyat berilishi mumkin", True, "316-modda.", S("A", "316-modda", "shu qarorning nusxasi olingan kundan eʼtiboran oʻn kun ichida shikoyat berilishi mumkin")),
                     ("court", "Sud qarori uchun bu 10 kunlik qoida tatbiq etilmaydi", True, "316-modda.", S("A", "316-modda", "bundan sud qarori mustasno")),
                     ("restore", "Uzrli sabab bilan o'tkazib yuborilgan muddat vakolatli organ tomonidan tiklanishi mumkin", True, "316-modda.", S("A", "316-modda", "bu muddat shikoyatni koʻrib chiqishga vakolatli organ (mansabdor shaxs) tomonidan qayta tiklanishi mumkin")),
                     ("age14", "O'n to'rt yoshdan ma'muriy javobgarlik umumiy qoida bo'yicha boshlanadi", False, "Umumiy qoida bo'yicha o'n olti yosh (13-modda).", S("A", "13-modda", "oʻn olti yoshga toʻlgan shaxslar")),
                     ("year", "Shikoyat muddati bir yil", False, "Shikoyat qaror nusxasi olingan kundan o'n kun ichida beriladi (316-modda).", S("A", "316-modda", "oʻn kun ichida shikoyat berilishi mumkin"))]),
    form=dict(title="Yosh va muddat", desc="Qoidalarni belgilang.", fields=[
        ch("age", "Umumiy qoida bo'yicha ma'muriy javobgarlik yoshi", "y16", "O'n olti yosh (13-modda).", [("y14", "14 yosh"), ("y16", "16 yosh"), ("y18", "18 yosh"), ("y21", "21 yosh")], S("A", "13-modda", "oʻn olti yoshga toʻlgan shaxslar")),
        ch("term", "Shikoyat berish muddati (nusxa olingan kundan)", "d10", "O'n kun ichida (316-modda).", [("d3", "3 kun"), ("d10", "10 kun"), ("d30", "30 kun"), ("y1", "1 yil")], S("A", "316-modda", "shu qarorning nusxasi olingan kundan eʼtiboran oʻn kun ichida shikoyat berilishi mumkin")),
        ch("restore", "Muddat uzrli sabab bilan o'tkazib yuborilsa", "restore", "Vakolatli organ muddatni qayta tiklashi mumkin (316-modda).", [("none", "Hech qachon tiklanmaydi"), ("restore", "Vakolatli organ tiklashi mumkin"), ("auto", "Avtomatik tiklanadi")], S("A", "316-modda", "bu muddat shikoyatni koʻrib chiqishga vakolatli organ (mansabdor shaxs) tomonidan qayta tiklanishi mumkin"))]),
    order=dict(title="Shikoyat tartibi", desc="Tartibni belgilang.", items=[
        ("copy", "Mijoz qarorning nusxasini oladi", S("A", "316-modda", "shu qarorning nusxasi olingan kundan")),
        ("appeal", "Nusxa olingan kundan o'n kun ichida shikoyat beradi", S("A", "316-modda", "oʻn kun ichida shikoyat berilishi mumkin")),
        ("restore", "Uzrli sabab bilan o'tkazib yuborilsa, muddat qayta tiklanishi mumkin", S("A", "316-modda", "qayta tiklanishi mumkin"))]),
    quiz=dict(title="Javobgarlik yoshi", text="Ma'muriy huquqbuzarlik sodir etgan paytda necha yoshga to'lgan shaxslar (umumiy qoida bo'yicha) ma'muriy javobgarlikka tortiladi?", opts=[("a", "O'n olti"), ("b", "O'n to'rt"), ("c", "O'n sakkiz"), ("d", "Yigirma bir")], correct="a",
              src=S("A", "13-modda", "Maʼmuriy huquqbuzarlik sodir etgan paytda oʻn olti yoshga toʻlgan shaxslar")))
print("batch2c yozildi")
