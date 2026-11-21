import LegalDoc from "@/components/layout/LegalDoc";

export const metadata = { title: "Maxfiylik siyosati · LexPraktika" };

export default function Maxfiylik() {
  return (
    <LegalDoc title="Maxfiylik siyosati" updated="2026-yil 20-noyabr">
      <p>
        LexPraktika huquq talabalari uchun yuridik amaliyot trenajyori. Bu hujjat qanday shaxsiy ma&apos;lumotlarni yig&apos;ishimiz, nima uchun
        ishlatishimiz va sizning huquqlaringiz haqida.
      </p>

      <h2>1. Qanday ma&apos;lumotlarni yig&apos;amiz</h2>
      <ul>
        <li>Hisob: ism familiya, login yoki email. Telegram orqali kirsangiz, shu xizmat bergan Telegram identifikatori va nomi.</li>
        <li>O&apos;quv ma&apos;lumoti: tanlagan yo&apos;nalish, qiziqishlar, daraja, bosqichlar bo&apos;yicha javob va ballaringiz.</li>
        <li>Siz yozgan matnlar: AI mijoz bilan suhbat, &quot;Arizani o&apos;zingiz yozing&quot; bosqichidagi matn va Huquqiy yordamchiga yozgan savollaringiz.</li>
        <li>Texnik: sessiya cookie-fayli (kirgan holatda qolish uchun). Reklama cookie-fayllari ishlatilmaydi.</li>
      </ul>

      <h2>2. Nima uchun ishlatamiz</h2>
      <ul>
        <li>Hisobingizni yuritish va natijangizni saqlash.</li>
        <li>Mashqlarni sizning yo&apos;nalishingiz va darajangizga moslash.</li>
        <li>Yozgan matningizni AI orqali tekshirish va mijoz rolini o&apos;ynatish.</li>
      </ul>

      <h2>3. Kimlarga ko&apos;rinadi</h2>
      <ul>
        <li>Universitet hisobi orqali kirgan bo&apos;lsangiz, universitetingiz sizning natijangizni ko&apos;radi.</li>
        <li>Ish beruvchi tashkilotlar sizning ma&apos;lumotingizni faqat siz alohida rozilik bergandan keyin ko&apos;radi. Rozilikni istalgan vaqtda qaytarib olishingiz mumkin.</li>
        <li>AI xizmat ko&apos;rsatuvchisi (Groq, AQSh): suhbat, hujjat matni va yordamchiga yozgan savolingiz javob olish uchun unga yuboriladi, ya&apos;ni ma&apos;lumot chet elga uzatiladi. Bu matnlarga shaxsiy ma&apos;lumot (pasport, telefon, manzil) yozmang. Yuborishdan oldin telefon, email, pasport va karta raqami avtomatik yashiriladi, lekin ism va manzilni avtomatik aniqlab bo&apos;lmaydi, shuning uchun ularni yozmang. Aniq AI xizmati o&apos;zgarishi mumkin, o&apos;zgarsa shu sahifada yoziladi.</li>
        <li>Ma&apos;lumotingiz sotilmaydi va reklama uchun uchinchi shaxslarga berilmaydi.</li>
      </ul>

      <h2>4. Saqlash va xavfsizlik</h2>
      <ul>
        <li>Parollar to&apos;g&apos;ridan-to&apos;g&apos;ri saqlanmaydi, faqat xeshlangan holda (scrypt).</li>
        <li>Sessiya imzolangan cookie orqali yuritiladi.</li>
        <li>Ma&apos;lumot hisobingiz o&apos;chirilgunga qadar saqlanadi. Profil, Sozlamalar bo&apos;limida hisobni o&apos;zingiz o&apos;chirishingiz mumkin.</li>
        <li>Ma&apos;lumotlar bazasi hozir Daniyadagi (Yevropa) serverda saqlanadi. Ma&apos;lumotni O&apos;zbekiston hududida saqlash talabiga muvofiqlik uchun serverni O&apos;zbekistondagi hostingga ko&apos;chirish rejalashtirilgan, bu yurist tomonidan tasdiqlanadi.</li>
      </ul>

      <h2>5. Sizning huquqlaringiz</h2>
      <p>
        «Shaxsga doir ma&apos;lumotlar to&apos;g&apos;risida»gi Qonun (O&apos;RQ-547-son) bo&apos;yicha siz o&apos;z ma&apos;lumotingiz bilan tanishish,
        uni tuzatish, o&apos;chirish va rozilikni qaytarib olishni talab qilishingiz mumkin. Qonun matni:{" "}
        <a className="font-semibold text-accent underline" href="https://lex.uz/docs/-4396419" target="_blank" rel="noreferrer">
          lex.uz/docs/-4396419
        </a>
        .
      </p>

      <h2>6. Bog&apos;lanish</h2>
      <p>So&apos;rovlar uchun loyiha jamoasiga murojaat qiling. Aloqa ma&apos;lumoti ishga tushirishdan oldin shu yerga yoziladi.</p>

      <h2>7. O&apos;zgarishlar</h2>
      <p>Siyosat o&apos;zgarsa, shu sahifada yangi sana bilan e&apos;lon qilinadi.</p>
    </LegalDoc>
  );
}
