/**
 * i18n.js — Kamus Terjemahan Dwibahasa (Bahasa Indonesia & Bahasa Arab)
 * Asy-Syafee (الشافعي)
 */

export const DICTIONARY = {
  id: {
    // Brand & Meta
    brandLatin: "Asy-Syafee",
    brandArabic: "الشافعي",
    pageTitleHome: "Asy-Syafee: Konjugasi Kata Kerja Bahasa Arab",
    pageTitleVerb: "Asy-Syafee | Konjugasi الفعل ",

    // Nav
    navHome: "Beranda",
    navDoc: "Dokumentasi",
    navDownload: "Unduhan",
    navProjects: "Proyek",
    navContact: "Kontak",
    navApi: "Antarmuka API",
    searchTooltip: "Cari kata kerja",
    settingsTooltip: "Pengaturan tampilan",

    // Hero
    heroHeadline: "Konjugasi Kata Kerja Arab<br>dalam Sekejap",
    heroSubtitle: "Mesin cerdas Asy-Syafee mengonjugasi lebih dari 22.000 kata kerja bahasa Arab ke seluruh bentuk waktu, ragam gramatika, dan subjek/dhamir.",
    heroCta: "Mulai Konjugasi",
    statVerbsCount: "٢٢،٥١٧",
    statVerbsLabel: "Kata Kerja",
    statTensesCount: "١٢",
    statTensesLabel: "Bentuk & Waktu",
    arcBadgeText: "صرّف · تعلّم · اكتشف · الشافعي · ",

    // Converter Bar
    inputPlaceholder: "Ketik kata kerja Arab (misal: كتب)...",
    inputAria: "Masukkan kata kerja Arab",
    futureVowelAria: "Vokal Fi'il Mudhari'",
    futureVowelFatha: "Fathah (يَفْعَل)",
    futureVowelDamma: "Dhammah (يَفْعُل)",
    futureVowelKasra: "Kasrah (يَفْعِل)",
    transitiveActive: "Transitif (Muta'addi)",
    transitivePassive: "Intransitif (Lazim)",
    conjugateBtn: "Konjugasi",
    examplesLabel: "Contoh:",
    randomBtn: "Acak",
    advancedToggle: "Opsi Lanjutan",

    // Advanced Checkboxes
    checkAll: "Semua Waktu",
    checkPast: "Fi'il Madhi",
    checkFuture: "Fi'il Mudhari'",
    checkImperative: "Fi'il Amar",
    checkPassive: "Bentuk Pasif (Majhul)",
    checkFutureMoode: "Mudhari' Manshub & Majzum",
    checkConfirmed: "Muakkad (Ber-Nun Taukid)",

    // Voice tabs
    voiceActive: "Bentuk Aktif (Ma'lum)",
    voicePassive: "Bentuk Pasif (Majhul)",
    voiceAll: "Semua Bentuk",

    // States & Feedback
    stateLoading: "Sedang mengonjugasi kata kerja…",
    stateEmptyTitle: "Masukkan kata kerja terlebih dahulu",
    stateEmptySub: "Ketik kata kerja bahasa Arab di kolom input lalu klik «Konjugasi»",
    stateInvalidTitle: "Kata kerja tidak ditemukan",
    stateInvalidSub: "Coba salah satu saran di bawah, atau periksa kembali ejaan dan harakatnya.",
    stateErrorTitle: "Terjadi kendala koneksi",
    stateErrorSub: "Gagal menghubungi server. Periksa koneksi Anda lalu coba lagi.",
    retryBtn: "Coba Lagi",
    suggestLabel: "Apakah maksud Anda?",
    toastCopied: "Teks disalin: ",
    toastCopyFail: "Gagal menyalin teks",
    toastCsvCopied: "Tabel berhasil disalin dalam format CSV",
    toastCsvDownloading: "Mengunduh berkas CSV...",
    toastRandomFail: "Gagal memuat kata kerja acak",

    // Toolbar
    toolCopyCsv: "Salin Tabel CSV",
    toolDownloadCsv: "Unduh CSV",
    toolPrint: "Cetak",

    // Settings Popover
    settingsFontSize: "Ukuran Teks",
    settingsColorTashkeel: "Warna Harakat",
    settingsReset: "Reset Pengaturan",
    fontDecAria: "Perkecil ukuran font",
    fontIncAria: "Perbesar ukuran font",

    // Features Strip
    feat1Title: "Konjugasi Lengkap & Akurat",
    feat1Sub: "Mencakup semua waktu, bentuk, dan dhomir untuk kata kerja tsulatsi maupun mazid.",
    feat2Title: "API Terbuka & Gratis",
    feat2Sub: "Disediakan endpoint REST API gratis dengan format JSON standar.",
    feat3Title: "Harakat Berwarna Dinamis",
    feat3Sub: "Sorotan warna pada harakat untuk mempermudah pembacaan dan pembelajaran.",

    // Footer
    footerDesc: "Mesin cerdas terintegrasi untuk konjugasi kata kerja bahasa Arab. Terbuka dan bebas digunakan.",
    footerLicense: "Lisensi GPL © Taha Zerrouki & Komunitas Pengembang",
    footerHosting: "Dioptimalkan untuk pembelajaran bahasa Arab",
  },

  ar: {
    // Brand & Meta
    brandLatin: "Asy-Syafee",
    brandArabic: "الشافعي",
    pageTitleHome: "الشافعي: تصريف الأفعال العربية",
    pageTitleVerb: "الشافعي | تصريف الفعل ",

    // Nav
    navHome: "الرئيسية",
    navDoc: "التوثيق",
    navDownload: "التحميل",
    navProjects: "المشاريع",
    navContact: "اتصل بنا",
    navApi: "واجهة API",
    searchTooltip: "بحث",
    settingsTooltip: "إعدادات العرض",

    // Hero
    heroHeadline: "الفعل العربي<br>بكل أزمنـ<span style=\"display:inline-block;width:0.15em\"></span>ـته<br>في لحظة",
    heroSubtitle: "محرّك الشافعي يُصرّف أكثر من ٢٢ ألف فعل عربي بكل أزمنتها، صيغها، وضمائرها؛ مع خيارات الإعراب والتعدية والبناء للمجهول.",
    heroCta: "ابدأ التصريف",
    statVerbsCount: "٢٢،٥١٧",
    statVerbsLabel: "فعل",
    statTensesCount: "١٢",
    statTensesLabel: "زمن وصيغة",
    arcBadgeText: "صرّف · اكتشف · تعلّم · الشافعي · ",

    // Converter Bar
    inputPlaceholder: "أَكْتُبُ…",
    inputAria: "أدخل الفعل",
    futureVowelAria: "حركة المضارع",
    futureVowelFatha: "فتحة (يَفعَل)",
    futureVowelDamma: "ضمة (يَفعُل)",
    futureVowelKasra: "كسرة (يَفعِل)",
    transitiveActive: "متعدٍّ",
    transitivePassive: "لازم",
    conjugateBtn: "صرّف",
    examplesLabel: "أمثلة:",
    randomBtn: "عشوائي",
    advancedToggle: "خيارات متقدمة",

    // Advanced Checkboxes
    checkAll: "جميع الأزمنة",
    checkPast: "الماضي",
    checkFuture: "المضارع",
    checkImperative: "الأمر",
    checkPassive: "المبني للمجهول",
    checkFutureMoode: "المضارع المنصوب والمجزوم",
    checkConfirmed: "المؤكد بالنون",

    // Voice tabs
    voiceActive: "المبني للمعلوم",
    voicePassive: "المبني للمجهول",
    voiceAll: "جميع الصيغ",

    // States & Feedback
    stateLoading: "جارٍ التصريف…",
    stateEmptyTitle: "أدخل فعلاً أولاً",
    stateEmptySub: "اكتب فعلاً في خانة الإدخال ثم اضغط «صرّف»",
    stateInvalidTitle: "لم نجد هذا الفعل",
    stateInvalidSub: "جرّب أحد الاقتراحات أدناه، أو تأكد من التشكيل والكتابة",
    stateErrorTitle: "حدث خطأ في الاتصال",
    stateErrorSub: "تعذّر الوصول إلى الخادم. تحقق من الاتصال ثم أعد المحاولة.",
    retryBtn: "إعادة المحاولة",
    suggestLabel: "هل تقصد؟",
    toastCopied: "تم النسخ: ",
    toastCopyFail: "تعذّر النسخ",
    toastCsvCopied: "تم نسخ الجدول",
    toastCsvDownloading: "جارٍ التنزيل...",
    toastRandomFail: "تعذّر جلب فعل عشوائي",

    // Toolbar
    toolCopyCsv: "نسخ الجدول CSV",
    toolDownloadCsv: "تنزيل CSV",
    toolPrint: "طباعة",

    // Settings Popover
    settingsFontSize: "حجم الخط",
    settingsColorTashkeel: "تلوين الحركات",
    settingsReset: "إعادة الضبط",
    fontDecAria: "تصغير الخط",
    fontIncAria: "تكبير الخط",

    // Features Strip
    feat1Title: "تصريف كامل وشامل",
    feat1Sub: "جميع الأزمنة والصيغ والضمائر للأفعال الثلاثية والمزيدة",
    feat2Title: "واجهة برمجية مفتوحة",
    feat2Sub: "API مجاني للمطوّرين بصيغة JSON متوافقة مع التطبيقات",
    feat3Title: "تلوين الحركات",
    feat3Sub: "عرض الحركات بالألوان لتسهيل القراءة والتعلم",

    // Footer
    footerDesc: "محرّك متكامل لتصريف الأفعال العربية بكل أزمنتها وصيغها. مفتوح المصدر، مجاني للجميع.",
    footerLicense: "رخصة GPL © طه زروقي — مجموعة عربايز",
    footerHosting: "استضافة بدعم كويت-نت",
  }
};

// Pemetaan Dhomir Bahasa Arab -> Bahasa Indonesia yang ramah pembelajar
export const PRONOUN_MAP_ID = {
  "هو": "هُوَ (Dia - lk)",
  "هما": "هُمَا (Mereka berdua - lk)",
  "هما (مذكر)": "هُمَا (Mereka berdua - lk)",
  "هم": "هُمْ (Mereka - lk)",
  "هي": "هِيَ (Dia - pr)",
  "هما (مؤنث)": "هُمَا (Mereka berdua - pr)",
  "هن": "هُنَّ (Mereka - pr)",
  "أنت": "أَنْتَ (Kamu - lk)",
  "أنتما": "أَنْتُمَا (Kalian berdua)",
  "أنتما (مذكر)": "أَنْتُمَا (Kalian berdua - lk)",
  "أنتم": "أَنْتُمْ (Kalian - lk)",
  "أنتِ": "أَنْتِ (Kamu - pr)",
  "أنتما (مؤنث)": "أَنْتُمَا (Kalian berdua - pr)",
  "أنتن": "أَنْتُنَّ (Kalian - pr)",
  "أنا": "أَنَا (Saya)",
  "نحن": "نَحْنُ (Kami / Kita)"
};

let _currentLang = "id";

export function getLang() {
  return _currentLang;
}

export function setLang(lang) {
  _currentLang = (lang === "ar") ? "ar" : "id";
  try {
    localStorage.setItem("asy_syafee_lang", _currentLang);
  } catch {}
  return _currentLang;
}

export function initLang() {
  try {
    const saved = localStorage.getItem("asy_syafee_lang");
    if (saved === "ar" || saved === "id") {
      _currentLang = saved;
    } else {
      _currentLang = "id"; // Default Bahasa Indonesia
    }
  } catch {
    _currentLang = "id";
  }
  return _currentLang;
}

export function t(key) {
  const dict = DICTIONARY[_currentLang] || DICTIONARY.id;
  return dict[key] !== undefined ? dict[key] : (DICTIONARY.id[key] || key);
}
