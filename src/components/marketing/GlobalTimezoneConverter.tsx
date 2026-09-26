"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";

interface GlobalTimezoneConverterProps {
  locale: string;
  isRtl?: boolean;
}

interface TimezoneOption {
  id: string;
  name: Record<string, string>;
  offsetHours: number;
  cohortWeekday: Record<string, string>;
  cohortWeekend: Record<string, string>;
}

const TZ_TEXT: Record<string, {
  badge: string;
  title: string;
  desc: string;
  selectLabel: string;
  weekdayLabel: string;
  weekendLabel: string;
}> = {
  ar: {
    badge: "محوّل مواعيد الحصص المباشرة حسب مدينتك",
    title: "تعرّف على مواعيد الحصص بتوقيت مدينتك المحلي",
    desc: "نوفر مجموعات صباحية ومسائية تناسب توقيت المدارس في أوروبا، أمريكا الشمالية، ودول الخليج العربي.",
    selectLabel: "اختر مدينتك أو منطقتك الزمنية:",
    weekdayLabel: "المجموعة المسائية:",
    weekendLabel: "مجموعة عطلة الأسبوع:",
  },
  nl: {
    badge: "Tijdzoneconverter voor live lessen",
    title: "Bekijk lestijden in uw lokale tijdzone",
    desc: "We organiseren doordeweekse naschoolse en weekendgroepen die aansluiten op schoolkalenders in Europa, het VK, de VS, Canada en de Golf.",
    selectLabel: "Kies uw stad of tijdzone:",
    weekdayLabel: "Doordeweekse groep:",
    weekendLabel: "Weekendgroep:",
  },
  tr: {
    badge: "Canlı Ders Saat Dilimi Dönüştürücü",
    title: "Canlı Ders Saatlerini Yerel Saatinizde Görün",
    desc: "Avrupa, İngiltere, ABD, Kanada ve Körfez'deki okul takvimlerine uygun hafta içi okul sonrası ve hafta sonu sabah grupları düzenliyoruz.",
    selectLabel: "Şehrinizi veya saat diliminizi seçin:",
    weekdayLabel: "Hafta İçi Grubu:",
    weekendLabel: "Hafta Sonu Grubu:",
  },
  it: {
    badge: "Convertitore Fusi Orari per Lezioni dal Vivo",
    title: "Visualizza gli orari delle lezioni nel tuo fuso locale",
    desc: "Organizziamo gruppi pomeridiani infrasettimanali e mattutini nel weekend sincronizzati con i calendari scolastici in Europa, Regno Unito, Stati Uniti, Canada e Golfo.",
    selectLabel: "Seleziona la tua città o fuso orario:",
    weekdayLabel: "Gruppo Infrasettimanale:",
    weekendLabel: "Gruppo Weekend:",
  },
  es: {
    badge: "Conversor de Horarios para Clases en Vivo",
    title: "Consulta los horarios en tu zona horaria local",
    desc: "Organizamos grupos después de la escuela entre semana y por la mañana los fines de semana sincronizados con calendarios escolares en Europa, Reino Unido, EE.UU., Canadá y el Golfo.",
    selectLabel: "Selecciona tu ciudad o zona horaria:",
    weekdayLabel: "Cohorte Semanal:",
    weekendLabel: "Cohorte de Fin de Semana:",
  },
  en: {
    badge: "Global Timezone Live Class Converter",
    title: "See Live Cohort Times in Your Local Time",
    desc: "We organize weekday after-school and weekend morning cohorts synchronized to school calendars across the UK, EU, US, Canada, and the GCC.",
    selectLabel: "Select your city / timezone:",
    weekdayLabel: "Weekday Cohort:",
    weekendLabel: "Weekend Cohort:",
  },
};

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    id: "london",
    name: {
      ar: "لندن (توقيت غرينتش • UTC+0)",
      nl: "Londen (GMT/BST • UTC+0)",
      tr: "Londra (GMT/BST • UTC+0)",
      it: "Londra (GMT/BST • UTC+0)",
      es: "Londres (GMT/BST • UTC+0)",
      en: "London (GMT/BST • UTC+0)",
    },
    offsetHours: 0,
    cohortWeekday: {
      ar: "الإثنين والأربعاء • 16:30 - 17:15",
      nl: "Ma & Wo • 16:30 - 17:15",
      tr: "Pzt & Çar • 16:30 - 17:15",
      it: "Lun & Mer • 16:30 - 17:15",
      es: "Lun y Mié • 16:30 - 17:15",
      en: "Mon & Wed • 16:30 - 17:15",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 10:00 - 10:45",
      nl: "Za & Zo • 10:00 - 10:45",
      tr: "Cmt & Paz • 10:00 - 10:45",
      it: "Sab & Dom • 10:00 - 10:45",
      es: "Sáb y Dom • 10:00 - 10:45",
      en: "Sat & Sun • 10:00 - 10:45",
    },
  },
  {
    id: "amsterdam",
    name: {
      ar: "أمستردام / برلين / باريس (توقيت وسط أوروبا • UTC+1)",
      nl: "Amsterdam / Berlijn / Parijs (CET • UTC+1)",
      tr: "Amsterdam / Berlin / Paris (CET • UTC+1)",
      it: "Amsterdam / Berlino / Parigi (CET • UTC+1)",
      es: "Ámsterdam / Berlín / París (CET • UTC+1)",
      en: "Amsterdam / Berlin / Paris (CET • UTC+1)",
    },
    offsetHours: 1,
    cohortWeekday: {
      ar: "الإثنين والأربعاء • 17:30 - 18:15",
      nl: "Ma & Wo • 17:30 - 18:15",
      tr: "Pzt & Çar • 17:30 - 18:15",
      it: "Lun & Mer • 17:30 - 18:15",
      es: "Lun y Mié • 17:30 - 18:15",
      en: "Mon & Wed • 17:30 - 18:15",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 11:00 - 11:45",
      nl: "Za & Zo • 11:00 - 11:45",
      tr: "Cmt & Paz • 11:00 - 11:45",
      it: "Sab & Dom • 11:00 - 11:45",
      es: "Sáb y Dom • 11:00 - 11:45",
      en: "Sat & Sun • 11:00 - 11:45",
    },
  },
  {
    id: "newyork",
    name: {
      ar: "نيويورك / تورونتو (توقيت شرق أمريكا • UTC-5)",
      nl: "New York / Toronto (EST • UTC-5)",
      tr: "New York / Toronto (EST • UTC-5)",
      it: "New York / Toronto (EST • UTC-5)",
      es: "Nueva York / Toronto (EST • UTC-5)",
      en: "New York / Toronto (EST • UTC-5)",
    },
    offsetHours: -5,
    cohortWeekday: {
      ar: "الثلاثاء والخميس • 17:00 - 17:45",
      nl: "Di & Do • 17:00 - 17:45",
      tr: "Sal & Per • 17:00 - 17:45",
      it: "Mar & Gio • 17:00 - 17:45",
      es: "Mar y Jue • 17:00 - 17:45",
      en: "Tue & Thu • 17:00 - 17:45",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 10:30 - 11:15",
      nl: "Za & Zo • 10:30 - 11:15",
      tr: "Cmt & Paz • 10:30 - 11:15",
      it: "Sab & Dom • 10:30 - 11:15",
      es: "Sáb y Dom • 10:30 - 11:15",
      en: "Sat & Sun • 10:30 - 11:15",
    },
  },
  {
    id: "chicago",
    name: {
      ar: "شيكاغو / دالاس (توقيت وسط أمريكا • UTC-6)",
      nl: "Chicago / Dallas (CST • UTC-6)",
      tr: "Chicago / Dallas (CST • UTC-6)",
      it: "Chicago / Dallas (CST • UTC-6)",
      es: "Chicago / Dallas (CST • UTC-6)",
      en: "Chicago / Dallas (CST • UTC-6)",
    },
    offsetHours: -6,
    cohortWeekday: {
      ar: "الثلاثاء والخميس • 16:30 - 17:15",
      nl: "Di & Do • 16:30 - 17:15",
      tr: "Sal & Per • 16:30 - 17:15",
      it: "Mar & Gio • 16:30 - 17:15",
      es: "Mar y Jue • 16:30 - 17:15",
      en: "Tue & Thu • 16:30 - 17:15",
    },
    cohortWeekend: {
      ar: "السبت والأحد • 09:30 - 10:15",
      nl: "Za & Zo • 09:30 - 10:15",
      tr: "Cmt & Paz • 09:30 - 10:15",
      it: "Sab & Dom • 09:30 - 10:15",
      es: "Sáb y Dom • 09:30 - 10:15",
      en: "Sat & Sun • 09:30 - 10:15",
    },
  },
  {
    id: "riyadh",
    name: {
      ar: "الرياض / مكة المكرمة (توقيت السعودية • UTC+3)",
      nl: "Riyad / Mekka (AST • UTC+3)",
      tr: "Riyad / Mekke (AST • UTC+3)",
      it: "Riad / La Mecca (AST • UTC+3)",
      es: "Riad / La Meca (AST • UTC+3)",
      en: "Riyadh / Mecca (AST • UTC+3)",
    },
    offsetHours: 3,
    cohortWeekday: {
      ar: "الأحد والثلاثاء • 17:00 - 17:45",
      nl: "Zo & Di • 17:00 - 17:45",
      tr: "Paz & Sal • 17:00 - 17:45",
      it: "Dom & Mar • 17:00 - 17:45",
      es: "Dom y Mar • 17:00 - 17:45",
      en: "Sun & Tue • 17:00 - 17:45",
    },
    cohortWeekend: {
      ar: "الجمعة والسبت • 16:00 - 16:45",
      nl: "Vr & Za • 16:00 - 16:45",
      tr: "Cum & Cmt • 16:00 - 16:45",
      it: "Ven & Sab • 16:00 - 16:45",
      es: "Vie y Sáb • 16:00 - 16:45",
      en: "Fri & Sat • 16:00 - 16:45",
    },
  },
  {
    id: "dubai",
    name: {
      ar: "دبي / أبوظبي (توقيت الإمارات • UTC+4)",
      nl: "Dubai / Abu Dhabi (GST • UTC+4)",
      tr: "Dubai / Abu Dabi (GST • UTC+4)",
      it: "Dubai / Abu Dhabi (GST • UTC+4)",
      es: "Dubái / Abu Dabi (GST • UTC+4)",
      en: "Dubai / Abu Dhabi (GST • UTC+4)",
    },
    offsetHours: 4,
    cohortWeekday: {
      ar: "الأحد والثلاثاء • 18:00 - 18:45",
      nl: "Zo & Di • 18:00 - 18:45",
      tr: "Paz & Sal • 18:00 - 18:45",
      it: "Dom & Mar • 18:00 - 18:45",
      es: "Dom y Mar • 18:00 - 18:45",
      en: "Sun & Tue • 18:00 - 18:45",
    },
    cohortWeekend: {
      ar: "الجمعة والسبت • 17:00 - 17:45",
      nl: "Vr & Za • 17:00 - 17:45",
      tr: "Cum & Cmt • 17:00 - 17:45",
      it: "Ven & Sab • 17:00 - 17:45",
      es: "Vie y Sáb • 17:00 - 17:45",
      en: "Fri & Sat • 17:00 - 17:45",
    },
  },
];

export function GlobalTimezoneConverter({ locale, isRtl }: GlobalTimezoneConverterProps) {
  const [selectedTz, setSelectedTz] = useState<string>("amsterdam");
  const activeTz = TIMEZONE_OPTIONS.find((t) => t.id === selectedTz) || TIMEZONE_OPTIONS[0];
  const t = TZ_TEXT[locale] || TZ_TEXT.en;

  const tzName = activeTz.name[locale] || activeTz.name.en;
  const tzWeekday = activeTz.cohortWeekday[locale] || activeTz.cohortWeekday.en;
  const tzWeekend = activeTz.cohortWeekend[locale] || activeTz.cohortWeekend.en;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.badge}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            {t.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {t.desc}
          </p>
        </div>

        <div className="space-y-3 shrink-0 lg:w-80">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            {t.selectLabel}
          </label>
          <select
            value={selectedTz}
            onChange={(e) => setSelectedTz(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {tz.name[locale] || tz.name.en}
              </option>
            ))}
          </select>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{t.weekdayLabel}</span>
              <span className="font-bold text-emerald-400">
                {tzWeekday}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{t.weekendLabel}</span>
              <span className="font-bold text-amber-300">
                {tzWeekend}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
