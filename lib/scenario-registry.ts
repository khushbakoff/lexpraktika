// AVTOMATIK YARATILGAN: scripts/gen-registry.mjs. Qo'lda tahrir qilmang.
import s_aliment_ota_tolamayapti from "@/content/scenarios/aliment-ota-tolamayapti.json";
import s_fuqarolik_maishiy_pudrat from "@/content/scenarios/fuqarolik-maishiy-pudrat.json";
import s_fuqarolik_nuqsonli_tovar_pul from "@/content/scenarios/fuqarolik-nuqsonli-tovar-pul.json";
import s_fuqarolik_pudrat_sifati from "@/content/scenarios/fuqarolik-pudrat-sifati.json";
import s_fuqarolik_sotuvchini_xabardor_qilish from "@/content/scenarios/fuqarolik-sotuvchini-xabardor-qilish.json";
import s_ijara_tolov_buzildi from "@/content/scenarios/ijara-tolov-buzildi.json";
import s_ish_advokat_advokatlik_siri from "@/content/scenarios/ish-advokat-advokatlik-siri.json";
import s_ish_advokat_manfaatlar_tonashuvi from "@/content/scenarios/ish-advokat-manfaatlar-tonashuvi.json";
import s_ish_advokat_sorovi from "@/content/scenarios/ish-advokat-sorovi.json";
import s_ish_advokat_talablari from "@/content/scenarios/ish-advokat-talablari.json";
import s_ish_notarius_ekspertiza from "@/content/scenarios/ish-notarius-ekspertiza.json";
import s_ish_notarius_hujjat_qabul from "@/content/scenarios/ish-notarius-hujjat-qabul.json";
import s_ish_notarius_muomala_layoqati from "@/content/scenarios/ish-notarius-muomala-layoqati.json";
import s_ish_notarius_rad_etish_yoriqnoma from "@/content/scenarios/ish-notarius-rad-etish-yoriqnoma.json";
import s_ish_notarius_shaxsni_aniqlash from "@/content/scenarios/ish-notarius-shaxsni-aniqlash.json";
import s_ish_notarius_talablari from "@/content/scenarios/ish-notarius-talablari.json";
import s_ish_notarius_vakil_vakolati from "@/content/scenarios/ish-notarius-vakil-vakolati.json";
import s_ish_notarius_xato_aniqlandi from "@/content/scenarios/ish-notarius-xato-aniqlandi.json";
import s_ish_notarius_yuridik_shaxs from "@/content/scenarios/ish-notarius-yuridik-shaxs.json";
import s_ish_prokuratura_talablari from "@/content/scenarios/ish-prokuratura-talablari.json";
import s_ish_prokuror_talablari_majburiyligi from "@/content/scenarios/ish-prokuror-talablari-majburiyligi.json";
import s_iste_molchi_kafolat_tamir from "@/content/scenarios/iste-molchi-kafolat-tamir.json";
import s_jinoyat_ayblanuvchi_huquqlari from "@/content/scenarios/jinoyat-ayblanuvchi-huquqlari.json";
import s_jinoyat_dalillar from "@/content/scenarios/jinoyat-dalillar.json";
import s_jinoyat_dastlabki_tergov_muddati from "@/content/scenarios/jinoyat-dastlabki-tergov-muddati.json";
import s_jinoyat_ehtiyot_chorasi from "@/content/scenarios/jinoyat-ehtiyot-chorasi.json";
import s_jinoyat_guvoh from "@/content/scenarios/jinoyat-guvoh.json";
import s_jinoyat_himoyachi_majburiy from "@/content/scenarios/jinoyat-himoyachi-majburiy.json";
import s_jinoyat_ish_qozgatish from "@/content/scenarios/jinoyat-ish-qozgatish.json";
import s_jinoyat_jabrlanuvchi from "@/content/scenarios/jinoyat-jabrlanuvchi.json";
import s_jinoyat_pushaymon_iqrorlik from "@/content/scenarios/jinoyat-pushaymon-iqrorlik.json";
import s_jinoyat_qamoqqa_olish_iltimosnoma from "@/content/scenarios/jinoyat-qamoqqa-olish-iltimosnoma.json";
import s_jinoyat_tuhmat_haqorat from "@/content/scenarios/jinoyat-tuhmat-haqorat.json";
import s_jinoyat_ushlab_turish from "@/content/scenarios/jinoyat-ushlab-turish.json";
import s_jinoyat_zaruriy_mudofaa from "@/content/scenarios/jinoyat-zaruriy-mudofaa.json";
import s_mamuriy_jarima_tolash from "@/content/scenarios/mamuriy-jarima-tolash.json";
import s_mamuriy_yosh_shikoyat from "@/content/scenarios/mamuriy-yosh-shikoyat.json";
import s_mehnat_bekor_qilish_ogohlantirish from "@/content/scenarios/mehnat-bekor-qilish-ogohlantirish.json";
import s_mehnat_ish_haqi from "@/content/scenarios/mehnat-ish-haqi.json";
import s_mehnat_ish_vaqtidan_tashqari from "@/content/scenarios/mehnat-ish-vaqtidan-tashqari.json";
import s_mehnat_ishga_tiklash from "@/content/scenarios/mehnat-ishga-tiklash.json";
import s_mehnat_sinov_muddati from "@/content/scenarios/mehnat-sinov-muddati.json";
import s_mehnat_yillik_tatil from "@/content/scenarios/mehnat-yillik-tatil.json";
import s_murojaat_javob_yoq from "@/content/scenarios/murojaat-javob-yoq.json";
import s_notariat_ishonib_topshirish from "@/content/scenarios/notariat-ishonib-topshirish.json";
import s_notariat_meros_guvohnomasi from "@/content/scenarios/notariat-meros-guvohnomasi.json";
import s_notariat_nusxa_shahodati from "@/content/scenarios/notariat-nusxa-shahodati.json";
import s_notariat_vasiyatnoma from "@/content/scenarios/notariat-vasiyatnoma.json";
import s_notarius_rad_etdi from "@/content/scenarios/notarius-rad-etdi.json";
import s_oila_ajratish_tartibi from "@/content/scenarios/oila-ajratish-tartibi.json";
import s_oila_nikoh_yoshi from "@/content/scenarios/oila-nikoh-yoshi.json";
import s_oila_yarashish_zoravonlik from "@/content/scenarios/oila-yarashish-zoravonlik.json";
import s_protsessual_davoni_taminlash from "@/content/scenarios/protsessual-davoni-taminlash.json";
import s_protsessual_sud_buyrugi from "@/content/scenarios/protsessual-sud-buyrugi.json";
import s_shaxsiy_malumot_ochirish from "@/content/scenarios/shaxsiy-malumot-ochirish.json";
import s_shaxsiy_malumot_transchegaraviy from "@/content/scenarios/shaxsiy-malumot-transchegaraviy.json";
import s_sifatsiz_tovar from "@/content/scenarios/sifatsiz-tovar.json";

export const RAW_SCENARIOS: unknown[] = [
  s_aliment_ota_tolamayapti,
  s_fuqarolik_maishiy_pudrat,
  s_fuqarolik_nuqsonli_tovar_pul,
  s_fuqarolik_pudrat_sifati,
  s_fuqarolik_sotuvchini_xabardor_qilish,
  s_ijara_tolov_buzildi,
  s_ish_advokat_advokatlik_siri,
  s_ish_advokat_manfaatlar_tonashuvi,
  s_ish_advokat_sorovi,
  s_ish_advokat_talablari,
  s_ish_notarius_ekspertiza,
  s_ish_notarius_hujjat_qabul,
  s_ish_notarius_muomala_layoqati,
  s_ish_notarius_rad_etish_yoriqnoma,
  s_ish_notarius_shaxsni_aniqlash,
  s_ish_notarius_talablari,
  s_ish_notarius_vakil_vakolati,
  s_ish_notarius_xato_aniqlandi,
  s_ish_notarius_yuridik_shaxs,
  s_ish_prokuratura_talablari,
  s_ish_prokuror_talablari_majburiyligi,
  s_iste_molchi_kafolat_tamir,
  s_jinoyat_ayblanuvchi_huquqlari,
  s_jinoyat_dalillar,
  s_jinoyat_dastlabki_tergov_muddati,
  s_jinoyat_ehtiyot_chorasi,
  s_jinoyat_guvoh,
  s_jinoyat_himoyachi_majburiy,
  s_jinoyat_ish_qozgatish,
  s_jinoyat_jabrlanuvchi,
  s_jinoyat_pushaymon_iqrorlik,
  s_jinoyat_qamoqqa_olish_iltimosnoma,
  s_jinoyat_tuhmat_haqorat,
  s_jinoyat_ushlab_turish,
  s_jinoyat_zaruriy_mudofaa,
  s_mamuriy_jarima_tolash,
  s_mamuriy_yosh_shikoyat,
  s_mehnat_bekor_qilish_ogohlantirish,
  s_mehnat_ish_haqi,
  s_mehnat_ish_vaqtidan_tashqari,
  s_mehnat_ishga_tiklash,
  s_mehnat_sinov_muddati,
  s_mehnat_yillik_tatil,
  s_murojaat_javob_yoq,
  s_notariat_ishonib_topshirish,
  s_notariat_meros_guvohnomasi,
  s_notariat_nusxa_shahodati,
  s_notariat_vasiyatnoma,
  s_notarius_rad_etdi,
  s_oila_ajratish_tartibi,
  s_oila_nikoh_yoshi,
  s_oila_yarashish_zoravonlik,
  s_protsessual_davoni_taminlash,
  s_protsessual_sud_buyrugi,
  s_shaxsiy_malumot_ochirish,
  s_shaxsiy_malumot_transchegaraviy,
  s_sifatsiz_tovar,
];
