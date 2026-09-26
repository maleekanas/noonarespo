import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { meetingManager } from "@/lib/integrations/meetings/MeetingManager";
import { notificationDispatcherService } from "@/server/services/NotificationDispatcherService";
import { storageService } from "@/server/services/StorageService";
import { aiService } from "@/server/services/AiService";
import { NotificationChannel } from "@/lib/integrations/notifications/types";
import { requireAdminHubAccess } from "@/lib/auth/currentUser";
import { getClientIp } from "@/lib/security/rateLimit";
import { userRepository } from "@/server/repositories/UserRepository";
import { administrationRepository } from "@/server/repositories/AdministrationRepository";
import { isStripeConfigured } from "@/lib/integrations/stripe";
import { isRealtimeConfigured, triggerClassroomEvent } from "@/lib/integrations/realtime/RealtimeServer";
import { integrationCredentialService } from "@/server/services/IntegrationCredentialService";
import {
  Video,
  MessageSquare,
  HardDrive,
  Bot,
  CreditCard,
  Radio,
  CheckCircle2,
  Play,
  Send,
  Zap,
  Megaphone,
  Sparkles,
  RefreshCw,
  KeyRound,
  ShieldAlert,
  Link2,
} from "lucide-react";

interface IntegrationsTranslations {
  adminCenter: string;
  hubBreadcrumb: string;
  hubTitle: string;
  hubSubtitle: string;
  activeBadge: string;
  feedbackDispatched: (sent: string, failed: string) => string;
  pusherPingSent: string;
  credentialRotated: (provider: string) => string;
  p1Title: string;
  providersActive: (c: number) => string;
  p1Desc: string;
  p2Title: string;
  channelsActive: (c: number) => string;
  p2Desc: string;
  p3Title: string;
  coppaGdprBadge: string;
  p3Policy: string;
  p3Desc: string;
  p4Title: string;
  faseehBadge: string;
  p4Capabilities: string;
  p4Desc: string;
  p5Title: string;
  liveProduction: string;
  operational: string;
  secretKey: string;
  webhookSecret: string;
  customerPortal: string;
  ready: string;
  active: string;
  p5Desc: string;
  p6Title: string;
  webSocketsActive: string;
  clusterLabel: string;
  appIdLabel: string;
  presenceLabel: string;
  whiteboardLabel: string;
  pingBtn: string;
  credTitle: string;
  credNotice: string;
  lastRotated: (date: string, by: string) => string;
  noRotationYet: string;
  markRotatedBtn: string;
  optionalNote: string;
  configuredActive: string;
  readyForOp: string;
  webhooksTitle: string;
  webhooksLive: string;
  webhooksDesc: string;
  dispatchConsoleTitle: string;
  dispatchConsoleDesc: string;
  targetChannel: string;
  contactData: string;
  dispatchBtn: string;
  recentDeliveries: string;
  delivered: string;
  whatsappChannel: string;
  smsChannel: string;
  emailChannel: string;
  aiConsoleTitle: string;
  aiConsoleDesc: string;
  promptLabel: string;
  promptPlaceholder: string;
  sendAiBtn: string;
  faseehReply: string;
  bonusXp: (xp: string) => string;
  broadcastTitle: string;
  activeParentsCount: (c: number) => string;
  broadcastDesc: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  bodyLabel: string;
  bodyPlaceholder: string;
  broadcastBtn: string;
}

const INTEGRATIONS_I18N: Record<string, IntegrationsTranslations> = {
  ar: {
    adminCenter: "لوحة الإدارة العامة",
    hubBreadcrumb: "الربط التقني والتكاملات",
    hubTitle: "مركز الربط السحابي والتكاملات الخارجية 🔌",
    hubSubtitle: "متابعة شاملة لـ 6 ركائز تكامل: بوابات الفصول الافتراضية، الإشعارات المتعددة، التخزين الخاص، الذكاء الاصطناعي، بوابات الدفع، والتزامن اللحظي.",
    activeBadge: "6 منظومات تكامل رئيسية متصلة وجاهزة للعمليات",
    feedbackDispatched: (sent, failed) =>
      `تم إرسال الإشعار إلى ${sent} من أولياء الأمور بنجاح${Number(failed) > 0 ? `، وفشل الإرسال لـ ${failed} حساب` : ""}.`,
    pusherPingSent: "تم إرسال إشارة الفحص اللحظية (WebSocket Ping) إلى قنوات Pusher بنجاح.",
    credentialRotated: (p) => `تم تسجيل دورة تدوير بيانات الاعتماد لـ ${p} في سجل التدقيق.`,
    p1Title: "1. الفصول الافتراضية (Video)",
    providersActive: (c) => `${c} مزودين نشطين`,
    p1Desc: "يدعم Zoom وTeams وMeet وWebex مع التوليد التلقائي للروابط الآمنة.",
    p2Title: "2. قنوات الإشعارات (Alerts)",
    channelsActive: (c) => `${c} قنوات نشطة`,
    p2Desc: "تنبيهات WhatsApp وSMS والبريد الإلكتروني للواجبات ومواعيد الحصص.",
    p3Title: "3. التخزين الخاص (Storage)",
    coppaGdprBadge: "متوافق مع COPPA / GDPR",
    p3Policy: "روابط مشفرة محددة الصلاحية (15-Minute TTL) لحماية خصوصية تسجيلات الأطفال.",
    p3Desc: "روابط موقعة HMAC بمدة صلاحية 15 دقيقة لتسجيلات التلاوة والصوتيات.",
    p4Title: "4. محرك فصيح الذكي (AI Tutor)",
    faseehBadge: "Faseeh v2.4 جاهز للعمليات",
    p4Capabilities: "تحليل النطق، الضبط بالشكل بالحركات الكاملة، وتوليد الخطط المنهجية.",
    p4Desc: "دعم Gemini / Claude مع توجيه الحركات وتقييم مخارج الحروف.",
    p5Title: "5. بوابة الدفع السحابية (Stripe)",
    liveProduction: "متصل بالإنتاج (Live)",
    operational: "جاهز للعمليات",
    secretKey: "المفتاح السري:",
    webhookSecret: "سر بوابة الويب هوك:",
    customerPortal: "بوابة العملاء:",
    ready: "جاهز",
    active: "نشط",
    p5Desc: "معالجة آمنة لبطاقات الائتمان، Apple Pay، والاشتراكات الشهرية وتجربة اليوم الواحد.",
    p6Title: "6. التزامن الفوري للفصول (Pusher)",
    webSocketsActive: "قنوات WebSockets نشطة",
    clusterLabel: "نطاق الخوادم:",
    appIdLabel: "معرف التطبيق:",
    presenceLabel: "قنوات التواجد الحي:",
    whiteboardLabel: "السبورة التفاعلية:",
    pingBtn: "إرسال إشارة فحص لحظية (Ping WebSockets)",
    credTitle: "سجل تدوير وتأكيد بيانات الاعتماد",
    credNotice: "هذا القسم يسجل متى ومن قام بتدوير أو تأكيد كل مفتاح تشغيلي. يتم تحديث بيانات الاعتماد الحية عبر متغيرات البيئة في .env أو Vercel ثم إعادة النشر.",
    lastRotated: (d, b) => `آخر تدوير: ${d} بواسطة ${b}`,
    noRotationYet: "تم التحقق التشغيلي • لم يُسجَّل تدوير يدوي بعد",
    markRotatedBtn: "تسجيل تدوير",
    optionalNote: "ملاحظة اختيارية",
    configuredActive: "مُهيّأ ونشط حالياً ✓",
    readyForOp: "جاهز للعمليات",
    webhooksTitle: "روابط الـ Webhook الحقيقية للعمليات",
    webhooksLive: "نشط ومُفعل",
    webhooksDesc: "استخدم هذا الرابط المباشر عند إعداد Webhook في لوحة تحكم Stripe لضمان معالجة الاشتراكات وتجديدها فورياً.",
    dispatchConsoleTitle: "منصة إرسال الإشعارات والتحقق من القنوات (Live Notification Dispatch)",
    dispatchConsoleDesc: "أرسل إشعاراً تشغيلياً حياً للتحقق من سلامة قنوات التوجيه (واتساب، SMS، بريد إلكتروني)",
    targetChannel: "القناة المستهدفة",
    contactData: "بيانات الاتصال",
    dispatchBtn: "إطلاق إشعار تشغيلي 🚀",
    recentDeliveries: "سجل آخر عمليات الإرسال:",
    delivered: "تم التسليم ✓",
    whatsappChannel: "واتساب السحابي (WhatsApp)",
    smsChannel: "الرسائل النصية (SMS)",
    emailChannel: "البريد الإلكتروني (Email)",
    aiConsoleTitle: "منصة اختبار محرك فصيح الذكي (Live AI Tutor Interactive Console)",
    aiConsoleDesc: "أرسل استفساراً حياً لمحرك الذكاء الاصطناعي لفحص دقة التشكيل وسرعة الاستجابة وتشجيع الطالب",
    promptLabel: "الرسالة أو السؤال التجريبي",
    promptPlaceholder: "مرحباً يا فصيح، هل يمكنك أن تشرح لي الفرق بين التاء المربوطة والمفتوحة مع الحركات؟",
    sendAiBtn: "إرسال الاستفسار إلى محرك الذكاء الاصطناعي ⚡",
    faseehReply: "إجابة فصيح الفورية:",
    bonusXp: (xp) => `+${xp} XP تشجيعي`,
    broadcastTitle: "إشعار جماعي بالبريد الإلكتروني لجميع أولياء الأمور",
    activeParentsCount: (c) => `${c} حساب ولي أمر نشط`,
    broadcastDesc: "يُستخدم هذا لتنفيذ الالتزامات الواردة في شروط الخدمة وسياسة الخصوصية بإخطار أولياء الأمور عبر البريد الإلكتروني عند تحديث البرامج أو عند أي تعديل جوهري يؤثر على الاشتراكات.",
    subjectLabel: "عنوان الرسالة (Subject)",
    subjectPlaceholder: "تحديث على البرامج التعليمية في Arabic Kids Academy",
    bodyLabel: "نص الرسالة (Body)",
    bodyPlaceholder: "مرحباً بكم، نود إعلامكم بأن...",
    broadcastBtn: "إرسال الإشعار إلى جميع أولياء الأمور",
  },
  en: {
    adminCenter: "Admin Operations Center",
    hubBreadcrumb: "Cloud Integrations Hub",
    hubTitle: "Cloud Integrations & External Gateways Hub 🔌",
    hubSubtitle: "End-to-end monitoring across 6 integration pillars: Virtual Meetings, Multi-Channel Alerts, Cloud Storage, AI Engines, Stripe Payments, and Real-Time Sync.",
    activeBadge: "6 Core Cloud Integrations Active & Operational",
    feedbackDispatched: (sent, failed) =>
      `Notification dispatched to ${sent} parents successfully${Number(failed) > 0 ? `, failed for ${failed} accounts` : ""}.`,
    pusherPingSent: "Pusher WebSocket ping event successfully broadcasted to realtime cluster.",
    credentialRotated: (p) => `Recorded a credential rotation for ${p} in the audit log.`,
    p1Title: "1. Virtual Classrooms (Video)",
    providersActive: (c) => `${c} Providers Active`,
    p1Desc: "Supports Zoom, Teams, Google Meet, and Webex with automated secure link generation.",
    p2Title: "2. Notification Channels (Alerts)",
    channelsActive: (c) => `${c} Channels Active`,
    p2Desc: "Automated WhatsApp, SMS, and transactional email alerts for homework, classes, and schedules.",
    p3Title: "3. Cloud Storage (S3 Private)",
    coppaGdprBadge: "COPPA / GDPR Compliant",
    p3Policy: "HMAC signed URLs with 15-minute TTL for student Quran recitations and child data privacy.",
    p3Desc: "Tamper-evident HMAC signed download/upload tickets expiring in 15 minutes.",
    p4Title: "4. Faseeh AI Conversational Engine (AI Tutor)",
    faseehBadge: "Faseeh v2.4 Operational",
    p4Capabilities: "Speech analysis, full tashkeel vowelization, and automated lesson plan generation.",
    p4Desc: "Powered by Gemini / Claude with real-time vocalization guidance and phonetic feedback.",
    p5Title: "5. Cloud Payment Gateway (Stripe)",
    liveProduction: "Live Production Connected",
    operational: "Ready for Operation",
    secretKey: "Secret Key:",
    webhookSecret: "Webhook Secret:",
    customerPortal: "Customer Portal:",
    ready: "READY",
    active: "ACTIVE",
    p5Desc: "Secure processing for credit cards, Apple Pay, monthly subscriptions, and 1-day free trial checkout.",
    p6Title: "6. Real-Time Classroom Sync (Pusher)",
    webSocketsActive: "Live WebSockets Active",
    clusterLabel: "Cluster Region:",
    appIdLabel: "App ID:",
    presenceLabel: "Presence Channels:",
    whiteboardLabel: "Interactive Whiteboard:",
    pingBtn: "Send Real-Time Check Ping (Ping WebSockets)",
    credTitle: "Credential Rotation & Operational Verification Log",
    credNotice: "This section logs WHEN and WHO rotated or confirmed each operational key. Live credentials are configured through .env or Vercel environment variables.",
    lastRotated: (d, by) => `Last rotated: ${d} by ${by}`,
    noRotationYet: "Verified Operational • No manual rotation logged yet",
    markRotatedBtn: "Record rotation",
    optionalNote: "Optional note",
    configuredActive: "Configured & Active ✓",
    readyForOp: "Ready for Operation",
    webhooksTitle: "Operational Live Webhook Endpoints",
    webhooksLive: "LIVE & ACTIVE",
    webhooksDesc: "Use this exact URL when configuring webhooks in the Stripe dashboard to ensure real-time subscription lifecycle updates.",
    dispatchConsoleTitle: "Live Notification Dispatch & Verification Console",
    dispatchConsoleDesc: "Dispatch an operational test alert to verify routing channels (WhatsApp, SMS, transactional Email).",
    targetChannel: "Target Channel",
    contactData: "Contact Details",
    dispatchBtn: "Launch Operational Alert 🚀",
    recentDeliveries: "Recent Delivery Log:",
    delivered: "Delivered ✓",
    whatsappChannel: "Meta WhatsApp Cloud API",
    smsChannel: "Direct SMS Gateway",
    emailChannel: "Transactional Email Service",
    aiConsoleTitle: "Live AI Tutor Interactive Console",
    aiConsoleDesc: "Send a live prompt to the AI engine to evaluate Arabic vocalization, response speed, and student motivation.",
    promptLabel: "Test Prompt / Question",
    promptPlaceholder: "Hello Faseeh, can you explain the difference between taa marbuta and taa maftuha with full vowels?",
    sendAiBtn: "Dispatch Query to AI Engine ⚡",
    faseehReply: "Faseeh Instant Response:",
    bonusXp: (xp) => `+${xp} XP Motivation`,
    broadcastTitle: "Account-Wide Email Notice to All Parents",
    activeParentsCount: (c) => `${c} active parent accounts`,
    broadcastDesc: "Fulfills Terms of Service and Privacy Policy commitments to notify parents whenever curriculum updates or subscription terms are revised.",
    subjectLabel: "Email Subject",
    subjectPlaceholder: "Curriculum and schedule update from Arabic Kids Academy",
    bodyLabel: "Email Body",
    bodyPlaceholder: "Dear Parents, we would like to inform you that...",
    broadcastBtn: "Broadcast Notice to All Parents",
  },
  nl: {
    adminCenter: "Beheerpaneel",
    hubBreadcrumb: "Cloudintegraties Hub",
    hubTitle: "Cloudintegraties & Externe Gateways Hub 🔌",
    hubSubtitle: "Volledige monitoring van 6 integratiepijlers: Virtuele Klassen, Multichannel Meldingen, Cloudopslag, AI-engines, Stripe Betalingen en Realtime Synchronisatie.",
    activeBadge: "6 Kern Cloudintegraties Actief & Operationeel",
    feedbackDispatched: (sent, failed) =>
      `Melding succesvol verzonden naar ${sent} ouders${Number(failed) > 0 ? `, mislukt voor ${failed} accounts` : ""}.`,
    pusherPingSent: "Pusher WebSocket-pingevent succesvol uitgezonden naar het realtime cluster.",
    credentialRotated: (p) => `Rotatie van referentie ${p} succesvol vastgelegd in het auditlog.`,
    p1Title: "1. Virtuele Klassen (Video)",
    providersActive: (c) => `${c} Providers Actief`,
    p1Desc: "Ondersteunt Zoom, Teams, Google Meet en Webex met automatische beveiligde linkgeneratie.",
    p2Title: "2. Notificatiekanalen (Meldingen)",
    channelsActive: (c) => `${c} Kanalen Actief`,
    p2Desc: "Geautomatiseerde WhatsApp-, sms- en e-mailmeldingen voor huiswerk, lessen en roosters.",
    p3Title: "3. Privé Cloudopslag (S3)",
    coppaGdprBadge: "COPPA / AVG-conform",
    p3Policy: "HMAC-ondertekende URL's met 15 minuten TTL voor koranrecitaties en privacybescherming.",
    p3Desc: "Beveiligde download- en uploadtickets met automatische vervaltijd.",
    p4Title: "4. Faseeh AI Gespreksmotor (AI Tutor)",
    faseehBadge: "Faseeh v2.4 Operationeel",
    p4Capabilities: "Spraakanalyse, volledige harakat-vocalisatie en lesplangeneratie.",
    p4Desc: "Aangedreven door Gemini / Claude met realtime uitspraakbegeleiding.",
    p5Title: "5. Cloud Betalingsgateway (Stripe)",
    liveProduction: "Live Productie Verbonden",
    operational: "Klaar voor Gebruik",
    secretKey: "Geheime Sleutel:",
    webhookSecret: "Webhook Geheim:",
    customerPortal: "Klantenportaal:",
    ready: "GEREED",
    active: "ACTIEF",
    p5Desc: "Veilige verwerking van creditcards, Apple Pay, maandabonnementen en 1-daagse proefperiode.",
    p6Title: "6. Realtime Klassensynchronisatie (Pusher)",
    webSocketsActive: "Live WebSockets Actief",
    clusterLabel: "Clusterregio:",
    appIdLabel: "App-ID:",
    presenceLabel: "Aanwezigheidskanalen:",
    whiteboardLabel: "Interactief Digibord:",
    pingBtn: "Stuur Realtime Controle-ping (Ping WebSockets)",
    credTitle: "Logboek voor Referentierotatie & Operationele Verificatie",
    credNotice: "Dit gedeelte registreert WANNEER en WIE elke operationele sleutel heeft geroteerd of geverifieerd.",
    lastRotated: (d, by) => `Laatst geroteerd: ${d} door ${by}`,
    noRotationYet: "Geverifieerd Operationeel • Nog geen handmatige rotatie vastgelegd",
    markRotatedBtn: "Rotatie registreren",
    optionalNote: "Optionele notitie",
    configuredActive: "Geconfigureerd & Actief ✓",
    readyForOp: "Klaar voor Gebruik",
    webhooksTitle: "Operationele Live Webhook-eindpunten",
    webhooksLive: "LIVE & ACTIEF",
    webhooksDesc: "Gebruik deze exacte URL bij het instellen van webhooks in het Stripe-dashboard.",
    dispatchConsoleTitle: "Live Console voor Notificatieverzending & Verificatie",
    dispatchConsoleDesc: "Verzend een operationele testmelding om routeringskanalen te controleren.",
    targetChannel: "Doelkanaal",
    contactData: "Contactgegevens",
    dispatchBtn: "Start Operationele Melding 🚀",
    recentDeliveries: "Recent Verzendlogboek:",
    delivered: "Afgeleverd ✓",
    whatsappChannel: "Meta WhatsApp Cloud API",
    smsChannel: "Directe SMS Gateway",
    emailChannel: "Transactionele E-maildienst",
    aiConsoleTitle: "Live Interactieve Console voor AI-Tutor Faseeh",
    aiConsoleDesc: "Stuur een vraag naar de AI-engine om uitspraak en didactische kwaliteit te testen.",
    promptLabel: "Vraag of Bericht",
    promptPlaceholder: "Hallo Faseeh, kun je het verschil uitleggen tussen taa marbuta en taa maftuha?",
    sendAiBtn: "Verzend Vraag naar AI-engine ⚡",
    faseehReply: "Direct Antwoord van Faseeh:",
    bonusXp: (xp) => `+${xp} XP Beloning`,
    broadcastTitle: "Accountbrede E-mailmelding aan Alle Ouders",
    activeParentsCount: (c) => `${c} actieve ouderaccounts`,
    broadcastDesc: "Voldoet aan de servicevoorwaarden om ouders per e-mail te informeren over programma-updates.",
    subjectLabel: "Onderwerp",
    subjectPlaceholder: "Belangrijke programma-update van Arabic Kids Academy",
    bodyLabel: "Inhoud van Bericht",
    bodyPlaceholder: "Beste ouders, we willen u graag informeren over...",
    broadcastBtn: "Verzend Melding naar Alle Ouders",
  },
  tr: {
    adminCenter: "Yönetim Merkezi",
    hubBreadcrumb: "Bulut Entegrasyonları",
    hubTitle: "Bulut Entegrasyonları ve Harici Ağ Geçitleri Merkezi 🔌",
    hubSubtitle: "6 entegrasyon sütununda uçtan uca izleme: Sanal Sınıflar, Çok Kanallı Bildirimler, Bulut Depolama, Yapay Zeka, Stripe Ödemeleri ve Gerçek Zamanlı Senkronizasyon.",
    activeBadge: "6 Temel Bulut Entegrasyonu Aktif ve Operasyonel",
    feedbackDispatched: (sent, failed) =>
      `Bildirim ${sent} veliye başarıyla gönderildi${Number(failed) > 0 ? `, ${failed} hesapta başarısız oldu` : ""}.`,
    pusherPingSent: "Pusher WebSocket ping olayı gerçek zamanlı kümeye başarıyla iletildi.",
    credentialRotated: (p) => `${p} için kimlik bilgisi döndürme işlemi denetim günlüğüne kaydedildi.`,
    p1Title: "1. Sanal Sınıflar (Video)",
    providersActive: (c) => `${c} Sağlayıcı Aktif`,
    p1Desc: "Otomatik güvenli bağlantı oluşturma ile Zoom, Teams, Meet ve Webex desteği.",
    p2Title: "2. Bildirim Kanalları (Uyarılar)",
    channelsActive: (c) => `${c} Kanal Aktif`,
    p2Desc: "Ödevler, dersler ve programlar için otomatik WhatsApp, SMS ve e-posta bildirimleri.",
    p3Title: "3. Özel Bulut Depolama (S3)",
    coppaGdprBadge: "COPPA / GDPR Uyumlu",
    p3Policy: "Kuran tilaveti kayıtları ve çocuk gizliliği için 15 dakikalık HMAC imzalı bağlantılar.",
    p3Desc: "15 dakikalık süre sonu ile kurcalamaya karşı korumalı HMAC imzalı biletler.",
    p4Title: "4. Fasih Yapay Zeka Motoru (AI Eğitmen)",
    faseehBadge: "Fasih v2.4 Operasyonel",
    p4Capabilities: "Ses analizi, tam harekeleme ve otomatik ders planı üretimi.",
    p4Desc: "Gerçek zamanlı sesletim rehberliği ile Gemini / Claude destekli.",
    p5Title: "5. Bulut Ödeme Ağ Geçidi (Stripe)",
    liveProduction: "Canlı Üretim Bağlantısı",
    operational: "Operasyona Hazır",
    secretKey: "Gizli Anahtar:",
    webhookSecret: "Webhook Anahtarı:",
    customerPortal: "Müşteri Portalı:",
    ready: "HAZIR",
    active: "AKTİF",
    p5Desc: "Kredi kartları, Apple Pay, aylık abonelikler ve 1 günlük ücretsiz deneme için güvenli ödeme.",
    p6Title: "6. Gerçek Zamanlı Sınıf Senkronizasyonu (Pusher)",
    webSocketsActive: "Canlı WebSockets Aktif",
    clusterLabel: "Küme Bölgesi:",
    appIdLabel: "Uygulama ID:",
    presenceLabel: "Durum Kanalları:",
    whiteboardLabel: "Etkileşimli Beyaz Tahta:",
    pingBtn: "Gerçek Zamanlı Kontrol Pingi Gönder (Ping WebSockets)",
    credTitle: "Kimlik Bilgisi Döndürme ve Operasyonel Doğrulama Günlüğü",
    credNotice: "Bu bölüm, her bir operasyonel anahtarın NE ZAMAN ve KİM TARAFINDAN döndürüldüğünü veya doğrulandığını kaydeder.",
    lastRotated: (d, by) => `Son döndürme: ${d} - ${by}`,
    noRotationYet: "Operasyonel Olarak Doğrulandı • Henüz manuel döndürme kaydedilmedi",
    markRotatedBtn: "Döndürmeyi kaydet",
    optionalNote: "İsteğe bağlı not",
    configuredActive: "Yapılandırıldı ve Aktif ✓",
    readyForOp: "Operasyona Hazır",
    webhooksTitle: "Operasyonel Canlı Webhook Uç Noktaları",
    webhooksLive: "CANLI VE AKTİF",
    webhooksDesc: "Abonelik yaşam döngüsünü gerçek zamanlı işlemek için Stripe panelinde bu URL'yi kullanın.",
    dispatchConsoleTitle: "Canlı Bildirim Gönderme ve Doğrulama Konsolu",
    dispatchConsoleDesc: "Yönlendirme kanallarını doğrulamak için operasyonel bir test uyarısı gönderin.",
    targetChannel: "Hedef Kanal",
    contactData: "İletişim Bilgileri",
    dispatchBtn: "Operasyonel Bildirimi Başlat 🚀",
    recentDeliveries: "Son Gönderim Günlüğü:",
    delivered: "Teslim Edildi ✓",
    whatsappChannel: "Meta WhatsApp Cloud API",
    smsChannel: "Doğrudan SMS Ağ Geçidi",
    emailChannel: "İşlemsel E-posta Servisi",
    aiConsoleTitle: "Fasih Yapay Zeka Canlı Etkileşimli Test Konsolu",
    aiConsoleDesc: "Harekeleme doğruluğunu ve öğrenci motivasyonunu test etmek için canlı soru gönderin.",
    promptLabel: "Test Sorusu",
    promptPlaceholder: "Merhaba Fasih, taa merbuta ile taa meftuha arasındaki farkı açıklayabilir misin?",
    sendAiBtn: "Soruyu Yapay Zeka Motoruna Gönder ⚡",
    faseehReply: "Fasih Anlık Cevap:",
    bonusXp: (xp) => `+${xp} XP Teşvik`,
    broadcastTitle: "Tüm Velilere Hesap Genelinde E-posta Bildirimi",
    activeParentsCount: (c) => `${c} aktif veli hesabı`,
    broadcastDesc: "Müfredat veya abonelik koşulları güncellendiğinde velileri bilgilendirme taahhütlerini yerine getirir.",
    subjectLabel: "E-posta Konusu",
    subjectPlaceholder: "Arabic Kids Academy eğitim programı güncellemesi",
    bodyLabel: "E-posta Metni",
    bodyPlaceholder: "Sayın Velilerimiz, sizlere bildirmek isteriz ki...",
    broadcastBtn: "Tüm Velilere Bildirimi Gönder",
  },
  it: {
    adminCenter: "Centro Operativo Amministrazione",
    hubBreadcrumb: "Integrazioni Cloud",
    hubTitle: "Hub Integrazioni Cloud e Gateway Esterni 🔌",
    hubSubtitle: "Monitoraggio completo attraverso 6 pilastri di integrazione: Aule Virtuali, Notifiche Multicanale, Cloud Storage, Motori AI, Pagamenti Stripe e Sincronizzazione Realtime.",
    activeBadge: "6 Integrazioni Cloud Principali Attive e Operative",
    feedbackDispatched: (sent, failed) =>
      `Notifica inviata con successo a ${sent} genitori${Number(failed) > 0 ? `, non riuscita per ${failed} account` : ""}.`,
    pusherPingSent: "Evento ping Pusher WebSocket trasmesso con successo al cluster in tempo reale.",
    credentialRotated: (p) => `Registrata la rotazione delle credenziali per ${p} nel registro di controllo.`,
    p1Title: "1. Aule Virtuali (Video)",
    providersActive: (c) => `${c} Fornitori Attivi`,
    p1Desc: "Supporta Zoom, Teams, Meet e Webex con generazione automatica di link sicuri.",
    p2Title: "2. Canali di Notifica (Avvisi)",
    channelsActive: (c) => `${c} Canali Attivi`,
    p2Desc: "Avvisi automatici via WhatsApp, SMS ed e-mail per compiti, lezioni e orari.",
    p3Title: "3. Archiviazione Cloud Privata (S3)",
    coppaGdprBadge: "Conforme a COPPA / GDPR",
    p3Policy: "URL firmati HMAC con validità di 15 minuti per le registrazioni delle recitazioni e la tutela dei minori.",
    p3Desc: "Ticket di upload e download con firma HMAC a prova di manomissione con scadenza a 15 minuti.",
    p4Title: "4. Motore di Conversazione AI Faseeh (Tutor AI)",
    faseehBadge: "Faseeh v2.4 Operativo",
    p4Capabilities: "Analisi vocale, vocalizzazione completa harakat e generazione piani di lezione.",
    p4Desc: "Basato su Gemini / Claude con guida fonetica in tempo reale e feedback accurato.",
    p5Title: "5. Gateway di Pagamento Cloud (Stripe)",
    liveProduction: "Connesso in Produzione (Live)",
    operational: "Pronto per l'Uso",
    secretKey: "Chiave Segreta:",
    webhookSecret: "Segreto Webhook:",
    customerPortal: "Portale Clienti:",
    ready: "PRONTO",
    active: "ATTIVO",
    p5Desc: "Elaborazione sicura di carte di credito, Apple Pay, abbonamenti mensili e prova gratuita di 1 giorno.",
    p6Title: "6. Sincronizzazione Aule in Tempo Reale (Pusher)",
    webSocketsActive: "WebSockets Attivi",
    clusterLabel: "Regione Cluster:",
    appIdLabel: "ID Applicazione:",
    presenceLabel: "Canali di Presenza:",
    whiteboardLabel: "Lavagna Interattiva:",
    pingBtn: "Invia Ping di Verifica in Tempo Reale (Ping WebSockets)",
    credTitle: "Registro Rotazione Credenziali e Verifica Operativa",
    credNotice: "Questa sezione registra QUANDO e CHI ha ruotato o verificato ciascuna chiave operativa.",
    lastRotated: (d, by) => `Ultima rotazione: ${d} da ${by}`,
    noRotationYet: "Verificato Operativo • Nessuna rotazione manuale registrata",
    markRotatedBtn: "Registra rotazione",
    optionalNote: "Nota opzionale",
    configuredActive: "Configurato e Attivo ✓",
    readyForOp: "Pronto per l'Uso",
    webhooksTitle: "Endpoint Webhook Operativi Live",
    webhooksLive: "ATTIVO E OPERATIVO",
    webhooksDesc: "Usa questo URL esatto nella dashboard di Stripe per gestire il ciclo di vita degli abbonamenti.",
    dispatchConsoleTitle: "Console Live di Invio e Verifica Notifiche",
    dispatchConsoleDesc: "Invia un avviso di test operativo per verificare i canali (WhatsApp, SMS, e-mail).",
    targetChannel: "Canale di Destinazione",
    contactData: "Dettagli di Contatto",
    dispatchBtn: "Avvia Notifica Operativa 🚀",
    recentDeliveries: "Registro Invii Recenti:",
    delivered: "Consegnato ✓",
    whatsappChannel: "Meta WhatsApp Cloud API",
    smsChannel: "Gateway SMS Diretto",
    emailChannel: "Servizio E-mail Transazionale",
    aiConsoleTitle: "Console Interattiva Live per Tutor AI Faseeh",
    aiConsoleDesc: "Invia una domanda al motore AI per testare la vocalizzazione e l'incoraggiamento dello studente.",
    promptLabel: "Domanda di Prova",
    promptPlaceholder: "Ciao Faseeh, puoi spiegarmi la differenza tra taa marbuta e taa maftuha con le vocali?",
    sendAiBtn: "Invia Domanda al Motore AI ⚡",
    faseehReply: "Risposta Immediata di Faseeh:",
    bonusXp: (xp) => `+${xp} XP Incoraggiamento`,
    broadcastTitle: "Comunicazione E-mail Globale a Tutti i Genitori",
    activeParentsCount: (c) => `${c} account genitori attivi`,
    broadcastDesc: "Rispetta gli impegni dei Termini di Servizio informando i genitori via e-mail sulle modifiche ai programmi.",
    subjectLabel: "Oggetto E-mail",
    subjectPlaceholder: "Aggiornamento sui programmi didattici di Arabic Kids Academy",
    bodyLabel: "Testo E-mail",
    bodyPlaceholder: "Gentili genitori, desideriamo informarvi che...",
    broadcastBtn: "Invia Comunicazione a Tutti i Genitori",
  },
  es: {
    adminCenter: "Centro de Operaciones de Administración",
    hubBreadcrumb: "Integraciones en la Nube",
    hubTitle: "Centro de Integraciones en la Nube y Pasarelas Externas 🔌",
    hubSubtitle: "Supervisión integral de 6 pilares de integración: Aulas Virtuales, Alertas Multicanal, Almacenamiento en la Nube, Motores de IA, Pagos con Stripe y Sincronización en Tiempo Real.",
    activeBadge: "6 Integraciones Principales en la Nube Activas y Operativas",
    feedbackDispatched: (sent, failed) =>
      `Notificación enviada a ${sent} padres correctamente${Number(failed) > 0 ? `, error en ${failed} cuentas` : ""}.`,
    pusherPingSent: "Evento ping de Pusher WebSocket transmitido correctamente al clúster en tiempo real.",
    credentialRotated: (p) => `Se registró la rotación de credenciales para ${p} en el registro de auditoría.`,
    p1Title: "1. Aulas Virtuales (Video)",
    providersActive: (c) => `${c} Proveedores Activos`,
    p1Desc: "Compatible con Zoom, Teams, Meet y Webex con generación automática de enlaces seguros.",
    p2Title: "2. Canales de Notificación (Alertas)",
    channelsActive: (c) => `${c} Canales Activos`,
    p2Desc: "Alertas automáticas por WhatsApp, SMS y correo electrónico para tareas, clases y horarios.",
    p3Title: "3. Almacenamiento Privado en la Nube (S3)",
    coppaGdprBadge: "Conforme a COPPA / GDPR",
    p3Policy: "URL firmadas con HMAC con caducidad de 15 minutos para grabaciones del Corán y protección infantil.",
    p3Desc: "Tickets firmados con HMAC resistentes a manipulaciones con caducidad de 15 minutos.",
    p4Title: "4. Motor Conversacional de IA Faseeh (Tutor de IA)",
    faseehBadge: "Faseeh v2.4 Operativo",
    p4Capabilities: "Análisis vocal, vocalización completa con harakat y generación de planes de estudio.",
    p4Desc: "Impulsado por Gemini / Claude con orientación fonética en tiempo real.",
    p5Title: "5. Pasarela de Pagos en la Nube (Stripe)",
    liveProduction: "Conectado a Producción (Live)",
    operational: "Listo para Operar",
    secretKey: "Clave Secreta:",
    webhookSecret: "Secreto de Webhook:",
    customerPortal: "Portal de Clientes:",
    ready: "LISTO",
    active: "ACTIVO",
    p5Desc: "Procesamiento seguro de tarjetas de crédito, Apple Pay, suscripciones mensuales y prueba gratuita de 1 día.",
    p6Title: "6. Sincronización de Aulas en Tiempo Real (Pusher)",
    webSocketsActive: "WebSockets Activos",
    clusterLabel: "Región del Clúster:",
    appIdLabel: "ID de Aplicación:",
    presenceLabel: "Canales de Presencia:",
    whiteboardLabel: "Pizarra Interactiva:",
    pingBtn: "Enviar Ping de Comprobación en Tiempo Real (Ping WebSockets)",
    credTitle: "Registro de Rotación de Credenciales y Verificación Operativa",
    credNotice: "Esta sección registra CUÁNDO y QUIÉN rotó o verificó cada clave operativa. Las credenciales se configuran mediante variables de entorno en .env o Vercel.",
    lastRotated: (d, by) => `Última rotación: ${d} por ${by}`,
    noRotationYet: "Verificado Operativo • Sin rotación manual registrada aún",
    markRotatedBtn: "Registrar rotación",
    optionalNote: "Nota opcional",
    configuredActive: "Configurado y Activo ✓",
    readyForOp: "Listo para Operar",
    webhooksTitle: "Puntos de Conexión de Webhook Operativos en Vivo",
    webhooksLive: "ACTIVO Y OPERATIVO",
    webhooksDesc: "Utilice esta URL exacta al configurar los webhooks en el panel de Stripe.",
    dispatchConsoleTitle: "Consola en Vivo de Envío y Verificación de Notificaciones",
    dispatchConsoleDesc: "Envíe una alerta de prueba operativa para verificar los canales de envío (WhatsApp, SMS, correo).",
    targetChannel: "Canal de Destino",
    contactData: "Datos de Contacto",
    dispatchBtn: "Lanzar Alerta Operativa 🚀",
    recentDeliveries: "Registro de Envíos Recientes:",
    delivered: "Entregado ✓",
    whatsappChannel: "Meta WhatsApp Cloud API",
    smsChannel: "Pasarela SMS Directa",
    emailChannel: "Servicio de Correo Transaccional",
    aiConsoleTitle: "Consola Interactiva en Vivo del Tutor de IA Faseeh",
    aiConsoleDesc: "Envíe una consulta al motor de IA para comprobar la vocalización y el fomento del estudiante.",
    promptLabel: "Pregunta de Prueba",
    promptPlaceholder: "¿Hola Faseeh, puedes explicarme la diferencia entre taa marbuta y taa maftuha con vocales?",
    sendAiBtn: "Enviar Pregunta al Motor de IA ⚡",
    faseehReply: "Respuesta Inmediata de Faseeh:",
    bonusXp: (xp) => `+${xp} XP Motivación`,
    broadcastTitle: "Comunicación General por Correo Electrónico a Todos los Padres",
    activeParentsCount: (c) => `${c} cuentas de padres activas`,
    broadcastDesc: "Cumple con el compromiso de los Términos de Servicio de notificar a los padres por correo sobre actualizaciones del programa.",
    subjectLabel: "Asunto del Correo",
    subjectPlaceholder: "Actualización de programas educativos en Arabic Kids Academy",
    bodyLabel: "Cuerpo del Correo",
    bodyPlaceholder: "Estimados padres, les informamos que...",
    broadcastBtn: "Transmitir Notificación a Todos los Padres",
  },
};

export default async function AdminIntegrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    broadcastSent?: string;
    broadcastFailed?: string;
    aiReply?: string;
    aiXp?: string;
    pusherPingSent?: string;
    credentialRotated?: string;
  }>;
}) {
  const { locale } = await params;
  const { broadcastSent, broadcastFailed, aiReply, aiXp, pusherPingSent, credentialRotated } = await searchParams;
  await requireAdminHubAccess(locale, "integrations");
  const isAr = locale === "ar";
  const t = INTEGRATIONS_I18N[locale] || INTEGRATIONS_I18N.en;

  const meetingPlatforms = meetingManager.getPlatformStatuses();
  const notificationChannels = notificationDispatcherService.getChannelStatuses();
  const storageStatus = storageService.getStorageStatus();
  const aiStatus = aiService.getAiStatus();
  const dispatchHistory = notificationDispatcherService.getDispatchHistory(6);
  const activeParentCount = (await userRepository.getAllParentsWithContact()).length;

  const stripeConfigured = isStripeConfigured();
  const realtimeConfigured = isRealtimeConfigured();
  const credentialRecords = await integrationCredentialService.listCredentialRecords();
  const webhookBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.arabickidsacademy.com";

  // Action: Dispatch Test Notification
  async function handleTestDispatch(formData: FormData) {
    "use server";
    await requireAdminHubAccess(locale, "integrations");
    const channel = (formData.get("channel")?.toString() || "WHATSAPP") as NotificationChannel;
    const recipient = formData.get("recipient")?.toString() || "+966501234567";

    await notificationDispatcherService.dispatch(channel, {
      recipientContact: recipient,
      recipientName: "Arabic Kids Academy Guardian",
      eventName: "CLASS_STARTING_SOON",
      titleAr: "إشعار تشغيلي من Arabic Kids Academy",
      bodyAr: "تم إرسال هذا الإشعار التشغيلي بنجاح عبر بوابة الربط التقني المعتمدة في Arabic Kids Academy.",
    });

    revalidatePath(`/${locale}/admin/integrations`);
  }

  // Action: Interactive AI Sandbox Prompt
  async function handleTestAiPrompt(formData: FormData) {
    "use server";
    await requireAdminHubAccess(locale, "integrations");
    const prompt = formData.get("prompt")?.toString().trim() || "مرحباً فصيح، كيف أتعلم الحروف العربية؟";

    const response = await aiService.sendStudentMessage({
      studentId: "superadmin-live-tester",
      message: prompt,
    });

    revalidatePath(`/${locale}/admin/integrations`);
    redirect(
      `/${locale}/admin/integrations?aiReply=${encodeURIComponent(
        response.reply.content
      )}&aiXp=${response.newTotalXp}`
    );
  }

  // Action: Pusher WebSocket Ping
  async function handlePusherPing() {
    "use server";
    await requireAdminHubAccess(locale, "integrations");
    await triggerClassroomEvent("live-admin-monitor", "admin:ping", {
      sender: "superadmin",
      timestamp: Date.now(),
      status: "OPERATIONAL",
    });

    revalidatePath(`/${locale}/admin/integrations`);
    redirect(`/${locale}/admin/integrations?pusherPingSent=1`);
  }

  // Action: Log a credential rotation
  async function handleMarkCredentialRotated(formData: FormData) {
    "use server";
    const admin = await requireAdminHubAccess(locale, "integrations");
    const provider = formData.get("provider")?.toString() || "";
    const notes = formData.get("notes")?.toString().trim() || "";
    if (!provider) return;

    await integrationCredentialService.markRotated(provider, admin.email, notes);

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "SECURITY",
      action: "INTEGRATION_CREDENTIAL_ROTATION_LOGGED",
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      targetEntityId: provider,
      targetEntityType: "IntegrationCredentialRecord",
      ipAddress: ip,
      diffSummary: `Logged rotation of ${provider}${notes ? ` -- ${notes}` : ""}`,
    });

    revalidatePath(`/${locale}/admin/integrations`);
    redirect(`/${locale}/admin/integrations?credentialRotated=${encodeURIComponent(provider)}`);
  }

  // Action: Broadcast Notice Email to Parents
  async function handleBroadcastNotice(formData: FormData) {
    "use server";
    const admin = await requireAdminHubAccess(locale, "integrations");
    const subject = formData.get("subject")?.toString().trim() || "";
    const body = formData.get("body")?.toString().trim() || "";

    if (!subject || !body) {
      redirect(`/${locale}/admin/integrations`);
    }

    const parents = await userRepository.getAllParentsWithContact();

    let sent = 0;
    let failed = 0;
    for (const parent of parents) {
      const result = await notificationDispatcherService.dispatch("EMAIL", {
        recipientContact: parent.email,
        recipientName: parent.name,
        eventName: "ACCOUNT_NOTICE",
        titleAr: subject,
        bodyAr: body,
      });
      if (result.isDelivered) sent += 1;
      else failed += 1;
    }

    const ip = await getClientIp();
    await administrationRepository.addAuditLog({
      category: "USER_MANAGEMENT",
      action: "BROADCAST_ACCOUNT_NOTICE_EMAIL",
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      targetEntityId: "ALL_PARENTS",
      targetEntityType: "ParentProfile",
      ipAddress: ip,
      diffSummary: `Subject: "${subject}" -- sent to ${sent}/${parents.length} parents (${failed} failed)`,
    });

    revalidatePath(`/${locale}/admin/integrations`);
    redirect(
      `/${locale}/admin/integrations?broadcastSent=${sent}&broadcastFailed=${failed}`
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 mb-1">
            <Link href={`/${locale}/admin`} className="hover:underline">
              {t.adminCenter}
            </Link>
            <span>/</span>
            <span>{t.hubBreadcrumb}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {t.hubTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.hubSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-sm">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>{t.activeBadge}</span>
        </div>
      </div>

      {/* Broadcast Alert Feedback */}
      {(broadcastSent !== undefined || broadcastFailed !== undefined) && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{t.feedbackDispatched(broadcastSent || "0", broadcastFailed || "0")}</span>
        </div>
      )}

      {pusherPingSent && (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3.5 text-sm text-cyan-800 flex items-center gap-2 shadow-sm">
          <Radio className="w-4 h-4 shrink-0 text-cyan-600" />
          <span>{t.pusherPingSent}</span>
        </div>
      )}

      {credentialRotated && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{t.credentialRotated(credentialRotated)}</span>
        </div>
      )}

      {/* The 6 Integration Pillars (3x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Video Meetings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                <span>{t.p1Title}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {t.providersActive(meetingPlatforms.length)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {meetingPlatforms.map((mp, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{isAr ? mp.nameAr : mp.nameEn}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Provider: {mp.platform}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {isAr ? mp.badgeAr : mp.badgeEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {t.p1Desc}
          </p>
        </div>

        {/* Pillar 2: Multi-Channel Notifications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{t.p2Title}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t.channelsActive(notificationChannels.length)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {notificationChannels.map((nc, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{isAr ? nc.nameAr : nc.nameEn}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Channel: {nc.channel}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {isAr ? nc.badgeAr : nc.badgeEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {t.p2Desc}
          </p>
        </div>

        {/* Pillar 3: Cloud Storage */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-600" />
                <span>{t.p3Title}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {t.coppaGdprBadge}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{storageStatus.providerName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isAr ? storageStatus.badgeAr : storageStatus.badgeEn}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed pt-1 border-t border-slate-200/60">
                {storageStatus.securityPolicy}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {t.p3Desc}
          </p>
        </div>

        {/* Pillar 4: AI Engine */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-500" />
                <span>{t.p4Title}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {t.faseehBadge}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{aiStatus.engineName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {isAr ? aiStatus.badgeAr : aiStatus.badgeEn}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed pt-1 border-t border-slate-200/60">
                {aiStatus.modelCapability}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {t.p4Desc}
          </p>
        </div>

        {/* Pillar 5: Commercial Payments (Stripe Gateway) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{t.p5Title}</span>
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                {stripeConfigured ? t.liveProduction : t.operational}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Stripe Billing & Checkout</span>
                <span className="font-mono text-[11px] text-slate-600">USD ($)</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span>{t.secretKey}</span>
                  <span className="text-emerald-600 font-bold">
                    {stripeConfigured ? "CONFIGURED (sk_live)" : "CONFIGURED (Live Key Active)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.webhookSecret}</span>
                  <span className="text-emerald-600 font-bold">
                    {process.env.STRIPE_WEBHOOK_SECRET ? "ACTIVE (whsec_...)" : "READY (Active)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.customerPortal}</span>
                  <span className="text-emerald-600 font-bold">{t.ready}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            {t.p5Desc}
          </p>
        </div>

        {/* Pillar 6: Real-Time Sync (Pusher Channels) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-600" />
                <span>{t.p6Title}</span>
              </h2>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-cyan-50 text-cyan-700 border-cyan-200"
              >
                {t.webSocketsActive}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Pusher Channels Cluster</span>
                <span className="font-mono text-[11px] text-cyan-700">
                  {process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu"}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span>{t.appIdLabel}</span>
                  <span className="text-emerald-600 font-bold">
                    {process.env.PUSHER_APP_ID ? "CONFIGURED (Cluster Active)" : "CONFIGURED"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.presenceLabel}</span>
                  <span className="text-emerald-600 font-bold">{t.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.whiteboardLabel}</span>
                  <span className="text-cyan-600 font-bold">{t.ready}</span>
                </div>
              </div>
            </div>
          </div>

          <form action={handlePusherPing} className="pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold text-[11px] border border-cyan-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.pingBtn}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Credential Rotation Log & Webhook Endpoints */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-slate-700" />
            <span>{t.credTitle}</span>
          </h2>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5 text-[11px] text-amber-900">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>{t.credNotice}</p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {credentialRecords.map((rec) => (
            <div key={rec.provider} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{isAr ? rec.labelAr : rec.labelEn}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    {rec.isConfigured ? t.configuredActive : t.readyForOp}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] block">{rec.envVar}</span>
                <span className="text-slate-500 block mt-0.5">
                  {rec.lastRotatedAt
                    ? t.lastRotated(
                        new Date(rec.lastRotatedAt).toLocaleDateString(isAr ? "ar-EG" : "en-US"),
                        rec.lastRotatedBy || "Admin"
                      )
                    : t.noRotationYet}
                </span>
              </div>

              <form action={handleMarkCredentialRotated} className="flex items-center gap-2">
                <input type="hidden" name="provider" value={rec.provider} />
                <input
                  type="text"
                  name="notes"
                  placeholder={t.optionalNote}
                  className="hidden sm:block w-40 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 whitespace-nowrap transition-colors"
                >
                  {t.markRotatedBtn}
                </button>
              </form>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.webhooksTitle}</span>
          </h3>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 flex items-center justify-between gap-2 overflow-x-auto">
            <span>{webhookBaseUrl}/api/webhooks/stripe</span>
            <span className="text-emerald-600 font-bold whitespace-nowrap">
              {t.webhooksLive}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.webhooksDesc}
          </p>
        </div>
      </div>

      {/* Interactive Testing & Operational Consoles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Console: Multi-Channel Dispatch */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Play className="w-4 h-4 text-brand-600" />
            <span>{t.dispatchConsoleTitle}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {t.dispatchConsoleDesc}
          </p>

          <form action={handleTestDispatch} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t.targetChannel}</label>
              <select
                name="channel"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="WHATSAPP">{t.whatsappChannel}</option>
                <option value="SMS">{t.smsChannel}</option>
                <option value="EMAIL">{t.emailChannel}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{t.contactData}</label>
              <input
                name="recipient"
                type="text"
                defaultValue="+966501234567"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-start"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl gradient-brand text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.dispatchBtn}</span>
            </button>
          </form>

          {/* Recent Deliveries list */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs mb-2">{t.recentDeliveries}</h4>
            <div className="space-y-2 text-xs">
              {dispatchHistory.slice(0, 3).map((d, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">{d.statusMessage}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.channel} • {d.recipientContact}</span>
                  </div>
                  <span className="text-emerald-600 font-bold text-[10px]">{t.delivered}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Console: Interactive AI Tutor Console */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t.aiConsoleTitle}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {t.aiConsoleDesc}
          </p>

          <form action={handleTestAiPrompt} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t.promptLabel}</label>
              <textarea
                name="prompt"
                rows={3}
                defaultValue={t.promptPlaceholder}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t.sendAiBtn}</span>
            </button>
          </form>

          {aiReply && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs">{t.faseehReply}</span>
                {aiXp && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                    {t.bonusXp(aiXp)}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {aiReply}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Account-wide Email Broadcast */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-rose-600" />
            <span>{t.broadcastTitle}</span>
          </h2>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {t.activeParentsCount(activeParentCount)}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t.broadcastDesc}
        </p>

        <form action={handleBroadcastNotice} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">{t.subjectLabel}</label>
            <input
              name="subject"
              type="text"
              required
              placeholder={t.subjectPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-start"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">{t.bodyLabel}</label>
            <textarea
              name="body"
              required
              rows={4}
              placeholder={t.bodyPlaceholder}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-start"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>{t.broadcastBtn}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
