export interface CityItem {
  nameEn: string;
  nameAr: string;
}

export interface CountryItem {
  code: string; // ISO 3166-1 alpha-2
  nameEn: string;
  nameAr: string;
  flag: string;
  phoneCode: string;
  cities: CityItem[];
}

export const COUNTRIES_AND_CITIES: CountryItem[] = [
  // --- GCC & Middle East ---
  {
    code: "SA",
    nameEn: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    flag: "🇸🇦",
    phoneCode: "+966",
    cities: [
      { nameEn: "Riyadh", nameAr: "الرياض" },
      { nameEn: "Jeddah", nameAr: "جدة" },
      { nameEn: "Makkah", nameAr: "مكة المكرمة" },
      { nameEn: "Madinah", nameAr: "المدينة المنورة" },
      { nameEn: "Dammam", nameAr: "الدمام" },
      { nameEn: "Khobar", nameAr: "الخبر" },
      { nameEn: "Dhahran", nameAr: "الظهران" },
      { nameEn: "Taif", nameAr: "الطائف" },
      { nameEn: "Tabuk", nameAr: "تبوك" },
      { nameEn: "Abha", nameAr: "أبها" },
      { nameEn: "Khamis Mushait", nameAr: "خميس مشيط" },
      { nameEn: "Buraidah", nameAr: "بريدة" },
      { nameEn: "Unaizah", nameAr: "عنيزة" },
      { nameEn: "Jubail", nameAr: "الجبيل" },
      { nameEn: "Yanbu", nameAr: "ينبع" },
      { nameEn: "Najran", nameAr: "نجران" },
      { nameEn: "Jazan", nameAr: "جازان" },
      { nameEn: "Hail", nameAr: "حائل" },
      { nameEn: "Al-Ahsa", nameAr: "الأحساء" },
      { nameEn: "Al-Qatif", nameAr: "القطيف" },
    ],
  },
  {
    code: "AE",
    nameEn: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    flag: "🇦🇪",
    phoneCode: "+971",
    cities: [
      { nameEn: "Dubai", nameAr: "دبي" },
      { nameEn: "Abu Dhabi", nameAr: "أبوظبي" },
      { nameEn: "Sharjah", nameAr: "الشارقة" },
      { nameEn: "Ajman", nameAr: "عجمان" },
      { nameEn: "Ras Al Khaimah", nameAr: "رأس الخيمة" },
      { nameEn: "Fujairah", nameAr: "الفجيرة" },
      { nameEn: "Umm Al Quwain", nameAr: "أم القيوين" },
      { nameEn: "Al Ain", nameAr: "العين" },
    ],
  },
  {
    code: "QA",
    nameEn: "Qatar",
    nameAr: "قطر",
    flag: "🇶🇦",
    phoneCode: "+974",
    cities: [
      { nameEn: "Doha", nameAr: "الدوحة" },
      { nameEn: "Al Rayyan", nameAr: "الريان" },
      { nameEn: "Al Wakrah", nameAr: "الوكرة" },
      { nameEn: "Al Khor", nameAr: "الخور" },
      { nameEn: "Lusail", nameAr: "لوسيل" },
      { nameEn: "Umm Salal", nameAr: "أم صلال" },
    ],
  },
  {
    code: "KW",
    nameEn: "Kuwait",
    nameAr: "الكويت",
    flag: "🇰🇼",
    phoneCode: "+965",
    cities: [
      { nameEn: "Kuwait City", nameAr: "مدينة الكويت" },
      { nameEn: "Hawalli", nameAr: "حولي" },
      { nameEn: "Salmiya", nameAr: "السالمية" },
      { nameEn: "Al Ahmadi", nameAr: "الأحمدي" },
      { nameEn: "Al Farwaniyah", nameAr: "الفروانية" },
      { nameEn: "Al Jahra", nameAr: "الجهراء" },
      { nameEn: "Mubarak Al-Kabeer", nameAr: "مبارك الكبير" },
    ],
  },
  {
    code: "BH",
    nameEn: "Bahrain",
    nameAr: "البحرين",
    flag: "🇧🇭",
    phoneCode: "+973",
    cities: [
      { nameEn: "Manama", nameAr: "المنامة" },
      { nameEn: "Riffa", nameAr: "الرفاع" },
      { nameEn: "Muharraq", nameAr: "المحرق" },
      { nameEn: "Hamad Town", nameAr: "مدينة حمد" },
      { nameEn: "Isa Town", nameAr: "مدينة عيسى" },
      { nameEn: "Sitra", nameAr: "سترة" },
    ],
  },
  {
    code: "OM",
    nameEn: "Oman",
    nameAr: "سلطنة عمان",
    flag: "🇴🇲",
    phoneCode: "+968",
    cities: [
      { nameEn: "Muscat", nameAr: "مسقط" },
      { nameEn: "Salalah", nameAr: "صلالة" },
      { nameEn: "Sohar", nameAr: "صحار" },
      { nameEn: "Nizwa", nameAr: "نزوى" },
      { nameEn: "Sur", nameAr: "صور" },
      { nameEn: "Seeb", nameAr: "السيب" },
      { nameEn: "Bawshar", nameAr: "بوشر" },
    ],
  },
  {
    code: "EG",
    nameEn: "Egypt",
    nameAr: "مصر",
    flag: "🇪🇬",
    phoneCode: "+20",
    cities: [
      { nameEn: "Cairo", nameAr: "القاهرة" },
      { nameEn: "Alexandria", nameAr: "الإسكندرية" },
      { nameEn: "Giza", nameAr: "الجيزة" },
      { nameEn: "Shubra El Kheima", nameAr: "شبرا الخيمة" },
      { nameEn: "Port Said", nameAr: "بورسعيد" },
      { nameEn: "Suez", nameAr: "السويس" },
      { nameEn: "Mansoura", nameAr: "المنصورة" },
      { nameEn: "Tanta", nameAr: "طنطا" },
      { nameEn: "Asyut", nameAr: "أسيوط" },
      { nameEn: "Ismailia", nameAr: "الإسماعيلية" },
      { nameEn: "Fayoum", nameAr: "الفيوم" },
      { nameEn: "Zagazig", nameAr: "الزقازيق" },
      { nameEn: "Aswan", nameAr: "أسوان" },
      { nameEn: "Damietta", nameAr: "دمياط" },
      { nameEn: "Damanhur", nameAr: "دمنهور" },
      { nameEn: "Beni Suef", nameAr: "بني سويف" },
      { nameEn: "Hurghada", nameAr: "الغردقة" },
      { nameEn: "Qena", nameAr: "قنا" },
      { nameEn: "Sohag", nameAr: "سوهاج" },
      { nameEn: "Minya", nameAr: "المنيا" },
    ],
  },
  {
    code: "JO",
    nameEn: "Jordan",
    nameAr: "الأردن",
    flag: "🇯🇴",
    phoneCode: "+962",
    cities: [
      { nameEn: "Amman", nameAr: "عمان" },
      { nameEn: "Zarqa", nameAr: "الزرقاء" },
      { nameEn: "Irbid", nameAr: "إربد" },
      { nameEn: "Aqaba", nameAr: "العقبة" },
      { nameEn: "Salt", nameAr: "السلط" },
      { nameEn: "Madaba", nameAr: "مأدبا" },
      { nameEn: "Jerash", nameAr: "جرش" },
    ],
  },
  {
    code: "LB",
    nameEn: "Lebanon",
    nameAr: "لبنان",
    flag: "🇱🇧",
    phoneCode: "+961",
    cities: [
      { nameEn: "Beirut", nameAr: "بيروت" },
      { nameEn: "Tripoli", nameAr: "طرابلس" },
      { nameEn: "Sidon", nameAr: "صيدا" },
      { nameEn: "Tyre", nameAr: "صور" },
      { nameEn: "Jounieh", nameAr: "جونيه" },
      { nameEn: "Zahle", nameAr: "زحلة" },
      { nameEn: "Byblos", nameAr: "جبيل" },
    ],
  },
  {
    code: "PS",
    nameEn: "Palestine",
    nameAr: "فلسطين",
    flag: "🇵🇸",
    phoneCode: "+970",
    cities: [
      { nameEn: "Jerusalem", nameAr: "القدس" },
      { nameEn: "Ramallah", nameAr: "رام الله" },
      { nameEn: "Gaza", nameAr: "غزة" },
      { nameEn: "Hebron", nameAr: "الخليل" },
      { nameEn: "Nablus", nameAr: "نابلس" },
      { nameEn: "Bethlehem", nameAr: "بيت لحم" },
      { nameEn: "Jenin", nameAr: "جنين" },
      { nameEn: "Tulkarm", nameAr: "طولكرم" },
      { nameEn: "Qalqilya", nameAr: "قلقيلية" },
      { nameEn: "Jericho", nameAr: "أريحا" },
      { nameEn: "Khan Yunis", nameAr: "خان يونس" },
      { nameEn: "Rafah", nameAr: "رفح" },
    ],
  },
  {
    code: "IQ",
    nameEn: "Iraq",
    nameAr: "العراق",
    flag: "🇮🇶",
    phoneCode: "+964",
    cities: [
      { nameEn: "Baghdad", nameAr: "بغداد" },
      { nameEn: "Basra", nameAr: "البصرة" },
      { nameEn: "Mosul", nameAr: "الموصل" },
      { nameEn: "Erbil", nameAr: "أربيل" },
      { nameEn: "Sulaymaniyah", nameAr: "السليمانية" },
      { nameEn: "Najaf", nameAr: "النجف" },
      { nameEn: "Karbala", nameAr: "كربلاء" },
      { nameEn: "Kirkuk", nameAr: "كركوك" },
      { nameEn: "Hillah", nameAr: "الحلة" },
    ],
  },
  {
    code: "SY",
    nameEn: "Syria",
    nameAr: "سوريا",
    flag: "🇸🇾",
    phoneCode: "+963",
    cities: [
      { nameEn: "Damascus", nameAr: "دمشق" },
      { nameEn: "Aleppo", nameAr: "حلب" },
      { nameEn: "Homs", nameAr: "حمص" },
      { nameEn: "Latakia", nameAr: "اللاذقية" },
      { nameEn: "Hama", nameAr: "حماة" },
      { nameEn: "Tartus", nameAr: "طرطوس" },
    ],
  },
  {
    code: "MA",
    nameEn: "Morocco",
    nameAr: "المغرب",
    flag: "🇲🇦",
    phoneCode: "+212",
    cities: [
      { nameEn: "Casablanca", nameAr: "الدار البيضاء" },
      { nameEn: "Rabat", nameAr: "الرباط" },
      { nameEn: "Fez", nameAr: "فاس" },
      { nameEn: "Marrakech", nameAr: "مراكش" },
      { nameEn: "Tangier", nameAr: "طنجة" },
      { nameEn: "Agadir", nameAr: "أكادير" },
      { nameEn: "Meknes", nameAr: "مكناس" },
      { nameEn: "Oujda", nameAr: "وجدة" },
      { nameEn: "Kenitra", nameAr: "القنيطرة" },
      { nameEn: "Tetouan", nameAr: "تطوان" },
    ],
  },
  {
    code: "DZ",
    nameEn: "Algeria",
    nameAr: "الجزائر",
    flag: "🇩🇿",
    phoneCode: "+213",
    cities: [
      { nameEn: "Algiers", nameAr: "الجزائر العاصمة" },
      { nameEn: "Oran", nameAr: "وهران" },
      { nameEn: "Constantine", nameAr: "قسنطينة" },
      { nameEn: "Annaba", nameAr: "عنابة" },
      { nameEn: "Blida", nameAr: "البليدة" },
      { nameEn: "Batna", nameAr: "باتنة" },
      { nameEn: "Setif", nameAr: "سطيف" },
    ],
  },
  {
    code: "TN",
    nameEn: "Tunisia",
    nameAr: "تونس",
    flag: "🇹🇳",
    phoneCode: "+216",
    cities: [
      { nameEn: "Tunis", nameAr: "تونس العاصمة" },
      { nameEn: "Sfax", nameAr: "صفاقس" },
      { nameEn: "Sousse", nameAr: "سوسة" },
      { nameEn: "Kairouan", nameAr: "القيروان" },
      { nameEn: "Bizerte", nameAr: "بنزرت" },
      { nameEn: "Gabes", nameAr: "قابس" },
      { nameEn: "Monastir", nameAr: "المنستير" },
    ],
  },
  {
    code: "LY",
    nameEn: "Libya",
    nameAr: "ليبيا",
    flag: "🇱🇾",
    phoneCode: "+218",
    cities: [
      { nameEn: "Tripoli", nameAr: "طرابلس" },
      { nameEn: "Benghazi", nameAr: "بنغازي" },
      { nameEn: "Misrata", nameAr: "مصراتة" },
      { nameEn: "Zawiya", nameAr: "الزاوية" },
      { nameEn: "Bayda", nameAr: "البيضاء" },
      { nameEn: "Tobruk", nameAr: "طبرق" },
    ],
  },
  {
    code: "SD",
    nameEn: "Sudan",
    nameAr: "السودان",
    flag: "🇸🇩",
    phoneCode: "+249",
    cities: [
      { nameEn: "Khartoum", nameAr: "الخرطوم" },
      { nameEn: "Omdurman", nameAr: "أم درمان" },
      { nameEn: "Port Sudan", nameAr: "بورتسودان" },
      { nameEn: "Kassala", nameAr: "كسلا" },
      { nameEn: "Wad Madani", nameAr: "ود مدني" },
    ],
  },
  {
    code: "YE",
    nameEn: "Yemen",
    nameAr: "اليمن",
    flag: "🇾🇪",
    phoneCode: "+967",
    cities: [
      { nameEn: "Sana'a", nameAr: "صنعاء" },
      { nameEn: "Aden", nameAr: "عدن" },
      { nameEn: "Taiz", nameAr: "تعز" },
      { nameEn: "Hodeidah", nameAr: "الحديدة" },
      { nameEn: "Ibb", nameAr: "إب" },
      { nameEn: "Mukalla", nameAr: "المكلا" },
    ],
  },

  // --- Europe ---
  {
    code: "NL",
    nameEn: "Netherlands",
    nameAr: "هولندا",
    flag: "🇳🇱",
    phoneCode: "+31",
    cities: [
      { nameEn: "Amsterdam", nameAr: "أمستردام" },
      { nameEn: "Rotterdam", nameAr: "روتردام" },
      { nameEn: "The Hague", nameAr: "لاهاي" },
      { nameEn: "Utrecht", nameAr: "أوتريخت" },
      { nameEn: "Eindhoven", nameAr: "آيندهوفن" },
      { nameEn: "Tilburg", nameAr: "تيلبورخ" },
      { nameEn: "Groningen", nameAr: "خرونينغن" },
      { nameEn: "Almere", nameAr: "ألميره" },
      { nameEn: "Breda", nameAr: "بريدا" },
      { nameEn: "Nijmegen", nameAr: "نايميخن" },
      { nameEn: "Haarlem", nameAr: "هارلم" },
      { nameEn: "Arnhem", nameAr: "آرنهم" },
      { nameEn: "Amersfoort", nameAr: "أمرسفورت" },
      { nameEn: "Enschede", nameAr: "أنشخيده" },
      { nameEn: "Leiden", nameAr: "ليدن" },
    ],
  },
  {
    code: "GB",
    nameEn: "United Kingdom",
    nameAr: "المملكة المتحدة",
    flag: "🇬🇧",
    phoneCode: "+44",
    cities: [
      { nameEn: "London", nameAr: "لندن" },
      { nameEn: "Birmingham", nameAr: "برمنغهام" },
      { nameEn: "Manchester", nameAr: "مانشستر" },
      { nameEn: "Leeds", nameAr: "ليدز" },
      { nameEn: "Glasgow", nameAr: "غلاسكو" },
      { nameEn: "Liverpool", nameAr: "ليفربول" },
      { nameEn: "Newcastle", nameAr: "نيوكاسل" },
      { nameEn: "Sheffield", nameAr: "شفيلد" },
      { nameEn: "Bristol", nameAr: "بريستول" },
      { nameEn: "Edinburgh", nameAr: "إدنبرة" },
      { nameEn: "Leicester", nameAr: "ليستر" },
      { nameEn: "Coventry", nameAr: "كوفنتري" },
      { nameEn: "Bradford", nameAr: "برادفورد" },
      { nameEn: "Cardiff", nameAr: "كارديف" },
      { nameEn: "Belfast", nameAr: "بلفاست" },
      { nameEn: "Nottingham", nameAr: "نوتنغهام" },
      { nameEn: "Cambridge", nameAr: "كامبريدج" },
      { nameEn: "Oxford", nameAr: "أكسفورد" },
    ],
  },
  {
    code: "DE",
    nameEn: "Germany",
    nameAr: "ألمانيا",
    flag: "🇩🇪",
    phoneCode: "+49",
    cities: [
      { nameEn: "Berlin", nameAr: "برلين" },
      { nameEn: "Hamburg", nameAr: "هامبورغ" },
      { nameEn: "Munich", nameAr: "ميونخ" },
      { nameEn: "Cologne", nameAr: "كولونيا" },
      { nameEn: "Frankfurt", nameAr: "فرانكفورت" },
      { nameEn: "Stuttgart", nameAr: "شتوتغارت" },
      { nameEn: "Düsseldorf", nameAr: "دوسلدورف" },
      { nameEn: "Leipzig", nameAr: "لايبزيغ" },
      { nameEn: "Dortmund", nameAr: "دورتموند" },
      { nameEn: "Essen", nameAr: "إسن" },
      { nameEn: "Bremen", nameAr: "بريمن" },
      { nameEn: "Dresden", nameAr: "دريسدن" },
      { nameEn: "Hanover", nameAr: "هانوفر" },
      { nameEn: "Nuremberg", nameAr: "نورنبرغ" },
      { nameEn: "Bonn", nameAr: "بون" },
    ],
  },
  {
    code: "FR",
    nameEn: "France",
    nameAr: "فرنسا",
    flag: "🇫🇷",
    phoneCode: "+33",
    cities: [
      { nameEn: "Paris", nameAr: "باريس" },
      { nameEn: "Marseille", nameAr: "مارسيليا" },
      { nameEn: "Lyon", nameAr: "ليون" },
      { nameEn: "Toulouse", nameAr: "تولوز" },
      { nameEn: "Nice", nameAr: "نيس" },
      { nameEn: "Nantes", nameAr: "نانت" },
      { nameEn: "Strasbourg", nameAr: "ستراسبورغ" },
      { nameEn: "Montpellier", nameAr: "مونبلييه" },
      { nameEn: "Bordeaux", nameAr: "بوردو" },
      { nameEn: "Lille", nameAr: "ليل" },
      { nameEn: "Rennes", nameAr: "رين" },
    ],
  },
  {
    code: "ES",
    nameEn: "Spain",
    nameAr: "إسبانيا",
    flag: "🇪🇸",
    phoneCode: "+34",
    cities: [
      { nameEn: "Madrid", nameAr: "مدريد" },
      { nameEn: "Barcelona", nameAr: "برشلونة" },
      { nameEn: "Valencia", nameAr: "بلنسية" },
      { nameEn: "Seville", nameAr: "إشبيلية" },
      { nameEn: "Zaragoza", nameAr: "سرقسطة" },
      { nameEn: "Malaga", nameAr: "مالقة" },
      { nameEn: "Cordoba", nameAr: "قرطبة" },
      { nameEn: "Granada", nameAr: "غرناطة" },
      { nameEn: "Bilbao", nameAr: "بلباو" },
      { nameEn: "Alicante", nameAr: "أليكانتي" },
    ],
  },
  {
    code: "IT",
    nameEn: "Italy",
    nameAr: "إيطاليا",
    flag: "🇮🇹",
    phoneCode: "+39",
    cities: [
      { nameEn: "Rome", nameAr: "روما" },
      { nameEn: "Milan", nameAr: "ميلانو" },
      { nameEn: "Naples", nameAr: "نابولي" },
      { nameEn: "Turin", nameAr: "تورينو" },
      { nameEn: "Palermo", nameAr: "باليرمو" },
      { nameEn: "Genoa", nameAr: "جنوة" },
      { nameEn: "Bologna", nameAr: "بولونيا" },
      { nameEn: "Florence", nameAr: "فلورنسا" },
      { nameEn: "Venice", nameAr: "البندقية" },
      { nameEn: "Verona", nameAr: "فيرونا" },
    ],
  },
  {
    code: "BE",
    nameEn: "Belgium",
    nameAr: "بلجيكا",
    flag: "🇧🇪",
    phoneCode: "+32",
    cities: [
      { nameEn: "Brussels", nameAr: "بروكسل" },
      { nameEn: "Antwerp", nameAr: "أنتويرب" },
      { nameEn: "Ghent", nameAr: "غينت" },
      { nameEn: "Charleroi", nameAr: "شارلوروا" },
      { nameEn: "Liege", nameAr: "لييج" },
      { nameEn: "Bruges", nameAr: "بروج" },
    ],
  },
  {
    code: "SE",
    nameEn: "Sweden",
    nameAr: "السويد",
    flag: "🇸🇪",
    phoneCode: "+46",
    cities: [
      { nameEn: "Stockholm", nameAr: "ستوكهولم" },
      { nameEn: "Gothenburg", nameAr: "غوتنبرغ" },
      { nameEn: "Malmo", nameAr: "مالمو" },
      { nameEn: "Uppsala", nameAr: "أوبسالا" },
      { nameEn: "Vasteras", nameAr: "فاستيروس" },
      { nameEn: "Orebro", nameAr: "أوريبرو" },
    ],
  },
  {
    code: "NO",
    nameEn: "Norway",
    nameAr: "النرويج",
    flag: "🇳🇴",
    phoneCode: "+47",
    cities: [
      { nameEn: "Oslo", nameAr: "أوسلو" },
      { nameEn: "Bergen", nameAr: "بيرغن" },
      { nameEn: "Trondheim", nameAr: "تروندهايم" },
      { nameEn: "Stavanger", nameAr: "ستافانغر" },
      { nameEn: "Drammen", nameAr: "درامن" },
    ],
  },
  {
    code: "DK",
    nameEn: "Denmark",
    nameAr: "الدنمارك",
    flag: "🇩🇰",
    phoneCode: "+45",
    cities: [
      { nameEn: "Copenhagen", nameAr: "كوبنهاغن" },
      { nameEn: "Aarhus", nameAr: "آرهوس" },
      { nameEn: "Odense", nameAr: "أودنسه" },
      { nameEn: "Aalborg", nameAr: "أولبورغ" },
      { nameEn: "Esbjerg", nameAr: "إسبيرغ" },
    ],
  },
  {
    code: "CH",
    nameEn: "Switzerland",
    nameAr: "سويسرا",
    flag: "🇨🇭",
    phoneCode: "+41",
    cities: [
      { nameEn: "Zurich", nameAr: "زيورخ" },
      { nameEn: "Geneva", nameAr: "جنيف" },
      { nameEn: "Basel", nameAr: "بازل" },
      { nameEn: "Lausanne", nameAr: "لوزان" },
      { nameEn: "Bern", nameAr: "برن" },
      { nameEn: "Lucerne", nameAr: "لوسيرن" },
    ],
  },
  {
    code: "AT",
    nameEn: "Austria",
    nameAr: "النمسا",
    flag: "🇦🇹",
    phoneCode: "+43",
    cities: [
      { nameEn: "Vienna", nameAr: "فيينا" },
      { nameEn: "Graz", nameAr: "غراتس" },
      { nameEn: "Linz", nameAr: "لينز" },
      { nameEn: "Salzburg", nameAr: "سالزبورغ" },
      { nameEn: "Innsbruck", nameAr: "إنسبروك" },
    ],
  },
  {
    code: "TR",
    nameEn: "Turkey",
    nameAr: "تركيا",
    flag: "🇹🇷",
    phoneCode: "+90",
    cities: [
      { nameEn: "Istanbul", nameAr: "إسطنبول" },
      { nameEn: "Ankara", nameAr: "أنقرة" },
      { nameEn: "Izmir", nameAr: "إزمير" },
      { nameEn: "Bursa", nameAr: "بورصة" },
      { nameEn: "Antalya", nameAr: "أنطاليا" },
      { nameEn: "Gaziantep", nameAr: "غازي عنتاب" },
      { nameEn: "Konya", nameAr: "قونية" },
      { nameEn: "Adana", nameAr: "أضنة" },
      { nameEn: "Trabzon", nameAr: "طرابزون" },
    ],
  },
  {
    code: "IE",
    nameEn: "Ireland",
    nameAr: "أيرلندا",
    flag: "🇮🇪",
    phoneCode: "+353",
    cities: [
      { nameEn: "Dublin", nameAr: "دبلن" },
      { nameEn: "Cork", nameAr: "كورك" },
      { nameEn: "Limerick", nameAr: "ليمريك" },
      { nameEn: "Galway", nameAr: "غالواي" },
      { nameEn: "Waterford", nameAr: "واترفورد" },
    ],
  },

  // --- North America ---
  {
    code: "US",
    nameEn: "United States",
    nameAr: "الولايات المتحدة الأمريكية",
    flag: "🇺🇸",
    phoneCode: "+1",
    cities: [
      { nameEn: "New York", nameAr: "نيويورك" },
      { nameEn: "Los Angeles", nameAr: "لوس أنجلوس" },
      { nameEn: "Chicago", nameAr: "شيكاغو" },
      { nameEn: "Houston", nameAr: "هيوستن" },
      { nameEn: "Phoenix", nameAr: "فينيكس" },
      { nameEn: "Philadelphia", nameAr: "فيلادلفيا" },
      { nameEn: "San Antonio", nameAr: "سان أنطونيو" },
      { nameEn: "San Diego", nameAr: "سان دييغو" },
      { nameEn: "Dallas", nameAr: "دالاس" },
      { nameEn: "San Jose", nameAr: "سان خوسيه" },
      { nameEn: "Austin", nameAr: "أوستن" },
      { nameEn: "Jacksonville", nameAr: "جاكسونفيل" },
      { nameEn: "Fort Worth", nameAr: "فورت وورث" },
      { nameEn: "Columbus", nameAr: "كولومبوس" },
      { nameEn: "Charlotte", nameAr: "شارلوت" },
      { nameEn: "San Francisco", nameAr: "سان فرانسيسكو" },
      { nameEn: "Indianapolis", nameAr: "إنديانابوليس" },
      { nameEn: "Seattle", nameAr: "سياتل" },
      { nameEn: "Denver", nameAr: "دنفر" },
      { nameEn: "Washington D.C.", nameAr: "واشنطن العاصمة" },
      { nameEn: "Boston", nameAr: "بوسطن" },
      { nameEn: "Detroit", nameAr: "ديترويت" },
      { nameEn: "Atlanta", nameAr: "أتلانتا" },
      { nameEn: "Miami", nameAr: "ميامي" },
      { nameEn: "Minneapolis", nameAr: "منيابولس" },
      { nameEn: "Dearborn", nameAr: "ديربورن" },
    ],
  },
  {
    code: "CA",
    nameEn: "Canada",
    nameAr: "كندا",
    flag: "🇨🇦",
    phoneCode: "+1",
    cities: [
      { nameEn: "Toronto", nameAr: "تورونتو" },
      { nameEn: "Montreal", nameAr: "مونتريال" },
      { nameEn: "Vancouver", nameAr: "فانكوفر" },
      { nameEn: "Calgary", nameAr: "كالغاري" },
      { nameEn: "Edmonton", nameAr: "إدمونتون" },
      { nameEn: "Ottawa", nameAr: "أوتاوا" },
      { nameEn: "Winnipeg", nameAr: "وينيبيغ" },
      { nameEn: "Quebec City", nameAr: "مدينة كيبك" },
      { nameEn: "Hamilton", nameAr: "هاملتون" },
      { nameEn: "Mississauga", nameAr: "ميسيساغا" },
      { nameEn: "Halifax", nameAr: "هاليفاكس" },
    ],
  },

  // --- Asia & Oceania ---
  {
    code: "AU",
    nameEn: "Australia",
    nameAr: "أستراليا",
    flag: "🇦🇺",
    phoneCode: "+61",
    cities: [
      { nameEn: "Sydney", nameAr: "سيدني" },
      { nameEn: "Melbourne", nameAr: "ملبورن" },
      { nameEn: "Brisbane", nameAr: "بريزبان" },
      { nameEn: "Perth", nameAr: "بيرث" },
      { nameEn: "Adelaide", nameAr: "أديلايد" },
      { nameEn: "Canberra", nameAr: "كانبرا" },
      { nameEn: "Gold Coast", nameAr: "غولد كوست" },
    ],
  },
  {
    code: "NZ",
    nameEn: "New Zealand",
    nameAr: "نيوزيلندا",
    flag: "🇳🇿",
    phoneCode: "+64",
    cities: [
      { nameEn: "Auckland", nameAr: "أوكلاند" },
      { nameEn: "Wellington", nameAr: "ويلينغتون" },
      { nameEn: "Christchurch", nameAr: "كرايستشيرش" },
      { nameEn: "Hamilton", nameAr: "هاملتون" },
    ],
  },
  {
    code: "MY",
    nameEn: "Malaysia",
    nameAr: "ماليزيا",
    flag: "🇲🇾",
    phoneCode: "+60",
    cities: [
      { nameEn: "Kuala Lumpur", nameAr: "كوالالمبور" },
      { nameEn: "George Town", nameAr: "جورج تاون" },
      { nameEn: "Johor Bahru", nameAr: "جوهر بهرو" },
      { nameEn: "Ipoh", nameAr: "إيبوه" },
      { nameEn: "Shah Alam", nameAr: "شاه عالم" },
      { nameEn: "Melaka", nameAr: "ملقا" },
    ],
  },
  {
    code: "ID",
    nameEn: "Indonesia",
    nameAr: "إندونيسيا",
    flag: "🇮🇩",
    phoneCode: "+62",
    cities: [
      { nameEn: "Jakarta", nameAr: "جاكرتا" },
      { nameEn: "Surabaya", nameAr: "سورابايا" },
      { nameEn: "Bandung", nameAr: "باندونغ" },
      { nameEn: "Medan", nameAr: "ميدان" },
      { nameEn: "Semarang", nameAr: "سمارانغ" },
      { nameEn: "Yogyakarta", nameAr: "يوغياكارتا" },
    ],
  },
  {
    code: "PK",
    nameEn: "Pakistan",
    nameAr: "باكستان",
    flag: "🇵🇰",
    phoneCode: "+92",
    cities: [
      { nameEn: "Karachi", nameAr: "كراتشي" },
      { nameEn: "Lahore", nameAr: "لاهور" },
      { nameEn: "Islamabad", nameAr: "إسلام آباد" },
      { nameEn: "Rawalpindi", nameAr: "راولبندي" },
      { nameEn: "Faisalabad", nameAr: "فيصل آباد" },
      { nameEn: "Multan", nameAr: "ملتان" },
      { nameEn: "Peshawar", nameAr: "بيشاور" },
    ],
  },
  {
    code: "IN",
    nameEn: "India",
    nameAr: "الهند",
    flag: "🇮🇳",
    phoneCode: "+91",
    cities: [
      { nameEn: "New Delhi", nameAr: "نيودلهي" },
      { nameEn: "Mumbai", nameAr: "مومباي" },
      { nameEn: "Bengaluru", nameAr: "بنغالور" },
      { nameEn: "Hyderabad", nameAr: "حيدر آباد" },
      { nameEn: "Chennai", nameAr: "تشيناي" },
      { nameEn: "Kolkata", nameAr: "كولكاتا" },
      { nameEn: "Ahmedabad", nameAr: "أحمد آباد" },
    ],
  },
  {
    code: "SG",
    nameEn: "Singapore",
    nameAr: "سنغافورة",
    flag: "🇸🇬",
    phoneCode: "+65",
    cities: [
      { nameEn: "Singapore", nameAr: "سنغافورة" },
    ],
  },
];

/**
 * Returns all configured countries.
 */
export function getAllCountries(): CountryItem[] {
  return COUNTRIES_AND_CITIES;
}

/**
 * Finds a country by 2-letter ISO code (case-insensitive).
 */
export function getCountryByCode(code: string): CountryItem | undefined {
  const normalized = code.trim().toUpperCase();
  return COUNTRIES_AND_CITIES.find((c) => c.code === normalized);
}

/**
 * Finds a country by Arabic name, English name, or ISO code.
 */
export function findCountryByName(nameOrCode: string): CountryItem | undefined {
  const query = nameOrCode.trim().toLowerCase();
  return COUNTRIES_AND_CITIES.find(
    (c) =>
      c.code.toLowerCase() === query ||
      c.nameEn.toLowerCase() === query ||
      c.nameAr.toLowerCase() === query
  );
}

/**
 * Searches countries matching a query string across Arabic, English, and ISO codes.
 */
export function searchCountries(query: string, locale?: string): CountryItem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return COUNTRIES_AND_CITIES;

  return COUNTRIES_AND_CITIES.filter((c) => {
    return (
      c.code.toLowerCase().includes(clean) ||
      c.nameEn.toLowerCase().includes(clean) ||
      c.nameAr.toLowerCase().includes(clean) ||
      c.phoneCode.includes(clean)
    );
  });
}

/**
 * Returns the list of cities for a given country code or name, sorted with localized display names.
 */
export function getCitiesByCountryCode(
  countryCodeOrName: string,
  locale: string = "ar"
): CityItem[] {
  const country =
    getCountryByCode(countryCodeOrName) || findCountryByName(countryCodeOrName);
  if (!country) return [];
  return country.cities;
}
