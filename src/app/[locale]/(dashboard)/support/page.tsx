import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireSupportAgentSession } from "@/lib/auth/currentUser";
import { crmService } from "@/server/services/CrmService";
import { userRepository } from "@/server/repositories/UserRepository";
import { schedulingRepository } from "@/server/repositories/SchedulingRepository";
import { getDictionary, isRtlLocale } from "@/lib/localization";
import {
  LifeBuoy,
  Search,
  Users,
  ShieldCheck,
  Video,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const SUPPORT_I18N: Record<
  string,
  {
    consoleBadge: string;
    hubTitle: string;
    agentSubtext: (email: string) => string;
    openInquiries: string;
    activeSessions: string;
    searchHeading: string;
    searchPlaceholder: string;
    lookupButton: string;
    studentProfiles: string;
    noStudentsFound: string;
    certifiedTeachers: string;
    noTeachersFound: string;
    inquiriesInbox: string;
    inquiriesCount: (c: number) => string;
    thName: string;
    thEmailPhone: string;
    thInquiryType: string;
    thStatusNotes: string;
    thSourceDate: string;
    thAction: string;
    statusResolved: string;
    statusInProgress: string;
    statusNew: string;
    updateBtn: string;
    changeStatus: string;
    followUpNotes: string;
    notePlaceholder: string;
    saveUpdate: string;
    liveDiagnostics: string;
    sessionsCount: (c: number) => string;
    thSessionId: string;
    thClassGroup: string;
    thStatus: string;
    thMeetingLink: string;
    thScheduledTime: string;
  }
> = {
  ar: {
    consoleBadge: "لوحة وكيل الدعم الفني والأكاديمي",
    hubTitle: "تشخيص الحسابات والدعم الفني",
    agentSubtext: (email) =>
      `وكيل الدعم النشط: ${email} • الصلاحيات: فحص الحسابات، تشخيص الجلسات، واستفسارات التسجيل.`,
    openInquiries: "استفسارات جديدة",
    activeSessions: "الجلسات المجدولة",
    searchHeading: "البحث التشخيصي عن المستخدمين (طلاب، أولياء أمور، معلمين)",
    searchPlaceholder: "ابحث بالاسم أو البريد الإلكتروني...",
    lookupButton: "بحث",
    studentProfiles: "ملفات الطلاب",
    noStudentsFound: "لا توجد نتائج مطابقة",
    certifiedTeachers: "ملفات المعلمين المعتمدين",
    noTeachersFound: "لا توجد نتائج مطابقة",
    inquiriesInbox: "صندوق استفسارات أولياء الأمور وطلبات التسجيل",
    inquiriesCount: (c) => `${c} استفسارات`,
    thName: "الاسم",
    thEmailPhone: "البريد / الهاتف",
    thInquiryType: "نوع الطلب",
    thStatusNotes: "الحالة والملاحظات",
    thSourceDate: "المصدر والتاريخ",
    thAction: "الإجراء",
    statusResolved: "مكتمل ومغلق ✓",
    statusInProgress: "قيد المتابعة ⏳",
    statusNew: "جديد ✉",
    updateBtn: "تحديث ✎",
    changeStatus: "تغيير الحالة",
    followUpNotes: "ملاحظات المتابعة",
    notePlaceholder: "تم التواصل مع ولي الأمر...",
    saveUpdate: "حفظ التحديث",
    liveDiagnostics: "تشخيص الجلسات المباشرة وروابط الغرف",
    sessionsCount: (c) => `${c} جلسات`,
    thSessionId: "معرف الجلسة",
    thClassGroup: "المجموعة",
    thStatus: "الحالة",
    thMeetingLink: "رابط الغرفة",
    thScheduledTime: "الوقت (UTC)",
  },
  en: {
    consoleBadge: "Support & Operations Console",
    hubTitle: "Customer Support & Diagnostic Hub",
    agentSubtext: (email) =>
      `Active Agent: ${email} • Diagnostic scope: Account lookups, session checks, and inquiries.`,
    openInquiries: "Open Inquiries",
    activeSessions: "Active Sessions",
    searchHeading: "User Diagnostic Lookup",
    searchPlaceholder: "Search by student/teacher name, email, or account ID...",
    lookupButton: "Lookup",
    studentProfiles: "Student Profiles",
    noStudentsFound: "No student records found",
    certifiedTeachers: "Certified Teachers",
    noTeachersFound: "No teacher records found",
    inquiriesInbox: "Parent Inquiries & Admissions Inbox",
    inquiriesCount: (c) => `${c} inquiries`,
    thName: "Contact Name",
    thEmailPhone: "Email & Phone",
    thInquiryType: "Inquiry Type",
    thStatusNotes: "Status & Notes",
    thSourceDate: "Source & Date",
    thAction: "Action",
    statusResolved: "Resolved ✓",
    statusInProgress: "In Progress ⏳",
    statusNew: "New ✉",
    updateBtn: "Update ✎",
    changeStatus: "Change Status",
    followUpNotes: "Follow-up Notes",
    notePlaceholder: "Follow-up note...",
    saveUpdate: "Save Update",
    liveDiagnostics: "Live Session & Meeting Diagnostics",
    sessionsCount: (c) => `${c} sessions`,
    thSessionId: "Session ID",
    thClassGroup: "Class Group",
    thStatus: "Status",
    thMeetingLink: "Meeting Link",
    thScheduledTime: "Scheduled Time (UTC)",
  },
  nl: {
    consoleBadge: "Support- & Beheerconsole",
    hubTitle: "Klantenservice & Diagnostische Hub",
    agentSubtext: (email) =>
      `Actieve Agent: ${email} • Diagnostische scope: Accountzoekopdrachten, sessiecontroles en aanvragen.`,
    openInquiries: "Open Aanvragen",
    activeSessions: "Actieve Sessies",
    searchHeading: "Diagnostisch Zoeken naar Gebruikers",
    searchPlaceholder: "Zoek op naam, e-mail of account-ID...",
    lookupButton: "Zoeken",
    studentProfiles: "Leerlingprofielen",
    noStudentsFound: "Geen leerlingendossiers gevonden",
    certifiedTeachers: "Gecertificeerde Docenten",
    noTeachersFound: "Geen docentengegevens gevonden",
    inquiriesInbox: "Inbox voor Ouderaanvragen & Toelating",
    inquiriesCount: (c) => `${c} aanvragen`,
    thName: "Naam",
    thEmailPhone: "E-mail & Telefoon",
    thInquiryType: "Type Aanvraag",
    thStatusNotes: "Status & Notities",
    thSourceDate: "Bron & Datum",
    thAction: "Actie",
    statusResolved: "Afgehandeld ✓",
    statusInProgress: "In Behandeling ⏳",
    statusNew: "Nieuw ✉",
    updateBtn: "Bijwerken ✎",
    changeStatus: "Status Wijzigen",
    followUpNotes: "Vervolgnotities",
    notePlaceholder: "Contact opgenomen met ouder...",
    saveUpdate: "Update Opslaan",
    liveDiagnostics: "Diagnostiek van Live Sessies & Ruimtelinks",
    sessionsCount: (c) => `${c} sessies`,
    thSessionId: "Sessie-ID",
    thClassGroup: "Klasgroep",
    thStatus: "Status",
    thMeetingLink: "Meetinglink",
    thScheduledTime: "Geplande Tijd (UTC)",
  },
  tr: {
    consoleBadge: "Destek ve Operasyon Konsolu",
    hubTitle: "Müşteri Desteği ve Tanı Merkezi",
    agentSubtext: (email) =>
      `Aktif Temsilci: ${email} • Tanı kapsamı: Hesap sorgulama, oturum kontrolleri ve talepler.`,
    openInquiries: "Açık Talepler",
    activeSessions: "Aktif Oturumlar",
    searchHeading: "Kullanıcı Tanı Araması",
    searchPlaceholder: "Öğrenci/öğretmen adı, e-posta veya hesap ID ile ara...",
    lookupButton: "Ara",
    studentProfiles: "Öğrenci Profilleri",
    noStudentsFound: "Eşleşen öğrenci kaydı bulunamadı",
    certifiedTeachers: "Sertifikalı Öğretmenler",
    noTeachersFound: "Eşleşen öğretmen kaydı bulunamadı",
    inquiriesInbox: "Veli Talepleri ve Kayıt Başvuruları Gelen Kutusu",
    inquiriesCount: (c) => `${c} talep`,
    thName: "İletişim Adı",
    thEmailPhone: "E-posta ve Telefon",
    thInquiryType: "Talep Türü",
    thStatusNotes: "Durum ve Notlar",
    thSourceDate: "Kaynak ve Tarih",
    thAction: "İşlem",
    statusResolved: "Çözüldü ✓",
    statusInProgress: "İşlemde ⏳",
    statusNew: "Yeni ✉",
    updateBtn: "Güncelle ✎",
    changeStatus: "Durumu Değiştir",
    followUpNotes: "Takip Notları",
    notePlaceholder: "Veli ile görüşüldü...",
    saveUpdate: "Güncellemeyi Kaydet",
    liveDiagnostics: "Canlı Oturum ve Toplantı Bağlantısı Tanısı",
    sessionsCount: (c) => `${c} oturum`,
    thSessionId: "Oturum Kimliği",
    thClassGroup: "Sınıf Grubu",
    thStatus: "Durum",
    thMeetingLink: "Toplantı Bağlantısı",
    thScheduledTime: "Planlanan Saat (UTC)",
  },
  it: {
    consoleBadge: "Console Supporto e Operazioni",
    hubTitle: "Hub Diagnostico e Supporto Clienti",
    agentSubtext: (email) =>
      `Agente Attivo: ${email} • Ambito diagnostico: Ricerca account, controlli sessioni e richieste.`,
    openInquiries: "Richieste Aperte",
    activeSessions: "Sessioni Attive",
    searchHeading: "Ricerca Diagnostica Utente",
    searchPlaceholder: "Cerca per nome studente/insegnante, email o ID account...",
    lookupButton: "Cerca",
    studentProfiles: "Profili Studenti",
    noStudentsFound: "Nessun record studente trovato",
    certifiedTeachers: "Insegnanti Certificati",
    noTeachersFound: "Nessun record insegnante trovato",
    inquiriesInbox: "Posta in Arrivo Richieste Genitori e Ammissioni",
    inquiriesCount: (c) => `${c} richieste`,
    thName: "Nome Contatto",
    thEmailPhone: "Email e Telefono",
    thInquiryType: "Tipo di Richiesta",
    thStatusNotes: "Stato e Note",
    thSourceDate: "Origine e Data",
    thAction: "Azione",
    statusResolved: "Risolto ✓",
    statusInProgress: "In Corso ⏳",
    statusNew: "Nuovo ✉",
    updateBtn: "Aggiorna ✎",
    changeStatus: "Cambia Stato",
    followUpNotes: "Note di Follow-up",
    notePlaceholder: "Contattato il genitore...",
    saveUpdate: "Salva Aggiornamento",
    liveDiagnostics: "Diagnostica Sessioni Live e Link Aula",
    sessionsCount: (c) => `${c} sessioni`,
    thSessionId: "ID Sessione",
    thClassGroup: "Gruppo Classe",
    thStatus: "Stato",
    thMeetingLink: "Link Riunione",
    thScheduledTime: "Orario Previsto (UTC)",
  },
  es: {
    consoleBadge: "Consola de Soporte y Operaciones",
    hubTitle: "Centro de Soporte al Cliente y Diagnóstico",
    agentSubtext: (email) =>
      `Agente Activo: ${email} • Alcance diagnóstico: Búsqueda de cuentas, verificación de sesiones y consultas.`,
    openInquiries: "Consultas Abiertas",
    activeSessions: "Sesiones Activas",
    searchHeading: "Búsqueda Diagnóstica de Usuarios",
    searchPlaceholder: "Buscar por nombre de alumno/profesor, email o ID de cuenta...",
    lookupButton: "Buscar",
    studentProfiles: "Perfiles de Alumnos",
    noStudentsFound: "No se encontraron alumnos",
    certifiedTeachers: "Profesores Certificados",
    noTeachersFound: "No se encontraron profesores",
    inquiriesInbox: "Bandeja de Consultas de Padres y Admisiones",
    inquiriesCount: (c) => `${c} consultas`,
    thName: "Nombre de Contacto",
    thEmailPhone: "Email y Teléfono",
    thInquiryType: "Tipo de Consulta",
    thStatusNotes: "Estado y Notas",
    thSourceDate: "Origen y Fecha",
    thAction: "Acción",
    statusResolved: "Resuelto ✓",
    statusInProgress: "En Proceso ⏳",
    statusNew: "Nuevo ✉",
    updateBtn: "Actualizar ✎",
    changeStatus: "Cambiar Estado",
    followUpNotes: "Notas de Seguimiento",
    notePlaceholder: "Contacto realizado con el padre...",
    saveUpdate: "Guardar Actualización",
    liveDiagnostics: "Diagnóstico de Sesiones en Vivo y Enlaces",
    sessionsCount: (c) => `${c} sesiones`,
    thSessionId: "ID de Sesión",
    thClassGroup: "Grupo de Clase",
    thStatus: "Estado",
    thMeetingLink: "Enlace de Reunión",
    thScheduledTime: "Hora Programada (UTC)",
  },
};

export default async function SupportAgentDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const isRtl = isRtlLocale(locale);
  const t = SUPPORT_I18N[locale] || SUPPORT_I18N.en;
  const session = await requireSupportAgentSession(locale);

  async function handleUpdateLeadStatus(formData: FormData) {
    "use server";
    const leadId = formData.get("leadId")?.toString();
    const status = formData.get("status")?.toString() as "NEW" | "IN_PROGRESS" | "RESOLVED";
    const notes = formData.get("notes")?.toString();

    if (!leadId || !status) return;

    crmService.updateLeadStatus(leadId, status, notes);
    revalidatePath(`/${locale}/support`);
  }

  // Diagnostic data
  const [allStudents, allTeachers, leads, sessions] = await Promise.all([
    userRepository.getAllStudents(),
    userRepository.getAllTeachers(),
    Promise.resolve(crmService.getAllLeads()),
    schedulingRepository.getSessionsByDateRange(
      new Date(Date.now() - 86400000 * 7),
      new Date(Date.now() + 86400000 * 7)
    ),
  ]);

  const query = (q || "").trim().toLowerCase();

  const filteredStudents = query
    ? allStudents.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.user.email.toLowerCase().includes(query)
      )
    : allStudents.slice(0, 5);

  const filteredTeachers = query
    ? allTeachers.filter(
        (t) =>
          t.firstName.toLowerCase().includes(query) ||
          t.lastName.toLowerCase().includes(query) ||
          t.user.email.toLowerCase().includes(query)
      )
    : allTeachers.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Agent Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.consoleBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {t.hubTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.agentSubtext(session.email)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right rtl:text-left bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700">
            <div className="text-xs text-slate-400">{t.openInquiries}</div>
            <div className="text-xl font-black text-brand-400">{leads.length}</div>
          </div>
          <div className="text-right rtl:text-left bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700">
            <div className="text-xs text-slate-400">{t.activeSessions}</div>
            <div className="text-xl font-black text-emerald-400">{sessions.length}</div>
          </div>
        </div>
      </div>

      {/* Diagnostic Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          {t.searchHeading}
        </h2>
        <form method="GET" className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 rtl:left-auto rtl:right-4 top-3.5" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 rtl:pl-4 rtl:pr-11 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 gradient-brand text-white font-bold text-sm rounded-xl hover:opacity-95 transition-all"
          >
            {t.lookupButton}
          </button>
        </form>
      </div>

      {/* User Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {t.studentProfiles}
              </h3>
            </div>
            <span className="text-xs text-slate-400">{filteredStudents.length} matching</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {t.noStudentsFound}
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div key={s.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {s.firstName} {s.lastName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{s.user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {s.ageGroup}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {s.user.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/admin/students`}
                    className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {t.certifiedTeachers}
              </h3>
            </div>
            <span className="text-xs text-slate-400">{filteredTeachers.length} matching</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTeachers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {t.noTeachersFound}
              </div>
            ) : (
              filteredTeachers.map((tRec) => (
                <div key={tRec.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {tRec.firstName} {tRec.lastName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{tRec.user.email}</div>
                    <div className="text-xs text-brand-600 font-medium mt-0.5">
                      {tRec.languagesSpoken || "Arabic"} • {tRec.experienceYears} yrs exp
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/admin/teachers`}
                    className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Inquiries & CRM Leads Inbox */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {t.inquiriesInbox}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {t.inquiriesCount(leads.length)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{t.thName}</th>
                <th className="px-6 py-4">{t.thEmailPhone}</th>
                <th className="px-6 py-4">{t.thInquiryType}</th>
                <th className="px-6 py-4">{t.thStatusNotes}</th>
                <th className="px-6 py-4">{t.thSourceDate}</th>
                <th className="px-6 py-4">{t.thAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{l.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-800">{l.email}</div>
                    {l.phone && <div className="text-xs text-slate-400 font-mono">{l.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      {l.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          l.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : l.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {l.status === "RESOLVED"
                          ? t.statusResolved
                          : l.status === "IN_PROGRESS"
                          ? t.statusInProgress
                          : t.statusNew}
                      </span>
                      {l.notes && (
                        <p className="text-xs text-slate-500 max-w-xs truncate" title={l.notes}>
                          {l.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div>{l.source}</div>
                    <div className="text-slate-400 mt-0.5">{new Date(l.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <details className="group relative">
                      <summary className="cursor-pointer text-xs font-bold text-slate-600 hover:text-brand-600 select-none bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                        {t.updateBtn}
                      </summary>
                      <form
                        action={handleUpdateLeadStatus}
                        className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 bg-white p-3 rounded-2xl shadow-xl border border-slate-200 z-20 space-y-2.5 text-xs text-right"
                      >
                        <input type="hidden" name="leadId" value={l.id} />
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            {t.changeStatus}
                          </label>
                          <select
                            name="status"
                            defaultValue={l.status}
                            className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                          >
                            <option value="NEW">{t.statusNew}</option>
                            <option value="IN_PROGRESS">{t.statusInProgress}</option>
                            <option value="RESOLVED">{t.statusResolved}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            {t.followUpNotes}
                          </label>
                          <input
                            name="notes"
                            defaultValue={l.notes || ""}
                            placeholder={t.notePlaceholder}
                            className="w-full p-1.5 rounded-lg border border-slate-200 text-xs"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-1.5 rounded-lg gradient-brand text-white font-bold text-xs shadow-sm hover:opacity-95"
                        >
                          {t.saveUpdate}
                        </button>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Session Diagnostics */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {t.liveDiagnostics}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {t.sessionsCount(sessions.length)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">{t.thSessionId}</th>
                <th className="px-6 py-4">{t.thClassGroup}</th>
                <th className="px-6 py-4">{t.thStatus}</th>
                <th className="px-6 py-4">{t.thMeetingLink}</th>
                <th className="px-6 py-4">{t.thScheduledTime}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{sess.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{sess.classGroup?.name || "Class"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                      {sess.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {sess.meetingUrl ? (
                      <a
                        href={sess.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>{sess.meetingUrl.slice(0, 30)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">Internal Classroom</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(sess.startTimeUtc).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
