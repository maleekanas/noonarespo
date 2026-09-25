"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Building2,
  Users,
  Award,
  Upload,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Layers,
  Download,
  KeyRound,
  UserPlus,
  Sliders,
  Edit3,
  Search,
  Copy,
  Check,
  RotateCw,
  Power,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  PartnerSchool,
  OnboardedStudentAccount,
  OnboardedSchoolAdminAccount,
  ResetAdminPasswordResult,
  InstitutionType,
  BundleTier,
  ContractStatus,
} from "@/server/repositories/SchoolRepository";
import { InstitutionalOverviewKPIs } from "@/server/services/SchoolService";
import { getDictionary } from "@/lib/localization";

type AgeGroup = "AGE_4_6" | "AGE_7_10" | "AGE_11_13" | "AGE_14_16";

interface SchoolManagementClientProps {
  initialSchools: PartnerSchool[];
  kpis: InstitutionalOverviewKPIs;
  locale: string;
  onOnboardBatch: (params: {
    schoolId: string;
    students: { fullName: string; email?: string }[];
    ageGroup: AgeGroup;
  }) => Promise<{
    createdAccounts: OnboardedStudentAccount[];
    feedback: string;
  }>;
  onCreateSchoolAdmin: (params: {
    schoolId: string;
    fullName: string;
    email?: string;
  }) => Promise<
    | { account: OnboardedSchoolAdminAccount | null; error: string | null }
    | OnboardedSchoolAdminAccount
  >;
  onEditSchool?: (params: {
    schoolId: string;
    data: {
      nameAr?: string;
      nameEn?: string;
      type?: InstitutionType;
      country?: string;
      city?: string;
      curriculumTrackAr?: string;
      contactPerson?: string;
      contactEmail?: string;
    };
  }) => Promise<PartnerSchool>;
  onAdjustLicenses?: (params: {
    schoolId: string;
    licenseSeatsTotal: number;
    bundleTier: BundleTier;
    contractStatus?: ContractStatus;
  }) => Promise<PartnerSchool>;
  onResetAdminPassword?: (params: {
    schoolId: string;
    customPassword?: string;
  }) => Promise<ResetAdminPasswordResult>;
  onToggleSchoolStatus?: (params: {
    schoolId: string;
  }) => Promise<PartnerSchool>;
}

function parseRosterText(raw: string): { fullName: string; email?: string }[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [namePart, emailPart] = line.split(",").map((p) => p.trim());
      return emailPart ? { fullName: namePart, email: emailPart } : { fullName: namePart };
    })
    .filter((entry) => entry.fullName.length > 0);
}

function downloadCredentialsCsv(schoolNameEn: string, accounts: OnboardedStudentAccount[]) {
  const header = "Full Name,Email,Temporary Password\n";
  const rows = accounts
    .map((a) => `"${a.fullName.replace(/"/g, '""')}",${a.email},${a.tempPassword}`)
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${schoolNameEn.toLowerCase().replace(/\s+/g, "-")}-student-logins.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSchoolsSummaryCsv(schools: PartnerSchool[], filename: string) {
  const header =
    "ID,Name (Ar),Name (En),Type,Country,City,Tier,Status,Seats Licensed,Seats Used,Utilization (%),Enrolled Students,Classes,Contact Person,Contact Email\n";
  const rows = schools
    .map((s) => {
      const util = s.licenseSeatsTotal > 0 ? Math.round((s.licenseSeatsUsed / s.licenseSeatsTotal) * 100) : 0;
      return [
        `"${s.id}"`,
        `"${s.nameAr.replace(/"/g, '""')}"`,
        `"${s.nameEn.replace(/"/g, '""')}"`,
        `"${s.type}"`,
        `"${s.country}"`,
        `"${s.city}"`,
        `"${s.bundleTier}"`,
        `"${s.contractStatus}"`,
        s.licenseSeatsTotal,
        s.licenseSeatsUsed,
        `${util}%`,
        s.studentsCount,
        s.classesCount,
        `"${s.contactPerson.replace(/"/g, '""')}"`,
        `"${s.contactEmail.replace(/"/g, '""')}"`,
      ].join(",");
    })
    .join("\n");

  const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function SchoolManagementClient({
  initialSchools,
  kpis,
  locale,
  onOnboardBatch,
  onCreateSchoolAdmin,
  onEditSchool,
  onAdjustLicenses,
  onResetAdminPassword,
  onToggleSchoolStatus,
}: SchoolManagementClientProps) {
  const isAr = locale === "ar";
  const dict = getDictionary(locale);
  const sm = dict.schoolManagementClient as Record<string, string>;

  const [schools, setSchools] = useState<PartnerSchool[]>(initialSchools);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Batch Roster Modal
  const [selectedSchool, setSelectedSchool] = useState<PartnerSchool | null>(null);
  const [rosterText, setRosterText] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("AGE_7_10");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdAccounts, setCreatedAccounts] = useState<OnboardedStudentAccount[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create School Admin Modal
  const [adminModalSchool, setAdminModalSchool] = useState<PartnerSchool | null>(null);
  const [adminFullName, setAdminFullName] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [createdAdminAccount, setCreatedAdminAccount] = useState<OnboardedSchoolAdminAccount | null>(null);

  // Edit School Modal
  const [editingSchool, setEditingSchool] = useState<PartnerSchool | null>(null);
  const [editForm, setEditForm] = useState<{
    nameAr: string;
    nameEn: string;
    type: InstitutionType;
    country: string;
    city: string;
    curriculumTrackAr: string;
    contactPerson: string;
    contactEmail: string;
  }>({
    nameAr: "",
    nameEn: "",
    type: "ISLAMIC_SCHOOL",
    country: "",
    city: "",
    curriculumTrackAr: "",
    contactPerson: "",
    contactEmail: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Adjust Licenses & Tier Modal
  const [licenseModalSchool, setLicenseModalSchool] = useState<PartnerSchool | null>(null);
  const [licenseForm, setLicenseForm] = useState<{
    bundleTier: BundleTier;
    licenseSeatsTotal: number;
    contractStatus: ContractStatus;
  }>({
    bundleTier: "STARTER",
    licenseSeatsTotal: 25,
    contractStatus: "ACTIVE",
  });
  const [isSavingLicenses, setIsSavingLicenses] = useState<boolean>(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseSuccess, setLicenseSuccess] = useState<string | null>(null);

  // Reset Admin Password Modal
  const [resetModalSchool, setResetModalSchool] = useState<PartnerSchool | null>(null);
  const [customResetPassword, setCustomResetPassword] = useState<string>("");
  const [isResettingPassword, setIsResettingPassword] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<ResetAdminPasswordResult | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Inline Status Toggling
  const [togglingSchoolId, setTogglingSchoolId] = useState<string | null>(null);

  // Filtered schools calculation
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        school.nameAr.toLowerCase().includes(q) ||
        school.nameEn.toLowerCase().includes(q) ||
        school.city.toLowerCase().includes(q) ||
        school.country.toLowerCase().includes(q) ||
        school.contactPerson.toLowerCase().includes(q) ||
        school.contactEmail.toLowerCase().includes(q);

      const matchesType = typeFilter === "ALL" || school.type === typeFilter;
      const matchesTier = tierFilter === "ALL" || school.bundleTier === tierFilter;
      const matchesStatus = statusFilter === "ALL" || school.contractStatus === statusFilter;

      return matchesQuery && matchesType && matchesTier && matchesStatus;
    });
  }, [schools, searchQuery, typeFilter, tierFilter, statusFilter]);

  // Handle Edit School Open
  function openEditModal(school: PartnerSchool) {
    setEditingSchool(school);
    setEditForm({
      nameAr: school.nameAr,
      nameEn: school.nameEn,
      type: school.type,
      country: school.country,
      city: school.city,
      curriculumTrackAr: school.curriculumTrackAr,
      contactPerson: school.contactPerson,
      contactEmail: school.contactEmail,
    });
    setEditError(null);
    setEditSuccess(null);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSchool || !onEditSchool) return;

    setIsSavingEdit(true);
    setEditError(null);
    try {
      const updated = await onEditSchool({
        schoolId: editingSchool.id,
        data: editForm,
      });

      setSchools((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      setEditSuccess(isAr ? "تم تحديث بيانات المؤسسة بنجاح!" : "Institution details updated successfully!");
      setTimeout(() => {
        setEditingSchool(null);
        setEditSuccess(null);
      }, 900);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Error updating school");
    } finally {
      setIsSavingEdit(false);
    }
  }

  // Handle Adjust Licenses Open
  function openLicenseModal(school: PartnerSchool) {
    setLicenseModalSchool(school);
    setLicenseForm({
      bundleTier: school.bundleTier,
      licenseSeatsTotal: school.licenseSeatsTotal,
      contractStatus: school.contractStatus,
    });
    setLicenseError(null);
    setLicenseSuccess(null);
  }

  async function handleLicenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!licenseModalSchool || !onAdjustLicenses) return;

    if (licenseForm.licenseSeatsTotal < licenseModalSchool.licenseSeatsUsed) {
      setLicenseError(
        isAr
          ? `لا يمكن تقليص المقاعد إلى أقل من المقاعد المستخدمة حالياً (${licenseModalSchool.licenseSeatsUsed} مقعد).`
          : `Total seats cannot be less than currently assigned seats (${licenseModalSchool.licenseSeatsUsed}).`
      );
      return;
    }

    setIsSavingLicenses(true);
    setLicenseError(null);
    try {
      const updated = await onAdjustLicenses({
        schoolId: licenseModalSchool.id,
        licenseSeatsTotal: licenseForm.licenseSeatsTotal,
        bundleTier: licenseForm.bundleTier,
        contractStatus: licenseForm.contractStatus,
      });

      setSchools((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      setLicenseSuccess(isAr ? "تم تحديث تراخيص ومقاعد المؤسسة بنجاح!" : "Licenses and quota updated successfully!");
      setTimeout(() => {
        setLicenseModalSchool(null);
        setLicenseSuccess(null);
      }, 900);
    } catch (err: unknown) {
      setLicenseError(err instanceof Error ? err.message : "Error adjusting licenses");
    } finally {
      setIsSavingLicenses(false);
    }
  }

  // Handle Reset Password Open
  function openResetPasswordModal(school: PartnerSchool) {
    setResetModalSchool(school);
    setCustomResetPassword("");
    setResetError(null);
    setResetResult(null);
    setCopiedNotification(false);
  }

  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalSchool || !onResetAdminPassword) return;

    setIsResettingPassword(true);
    setResetError(null);
    try {
      const result = await onResetAdminPassword({
        schoolId: resetModalSchool.id,
        customPassword: customResetPassword.trim() || undefined,
      });
      setResetResult(result);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Error resetting admin password");
    } finally {
      setIsResettingPassword(false);
    }
  }

  // Quick Inline Toggle Status
  async function handleToggleStatus(schoolId: string) {
    if (!onToggleSchoolStatus) return;
    setTogglingSchoolId(schoolId);
    try {
      const updated = await onToggleSchoolStatus({ schoolId });
      setSchools((prev) => prev.map((s) => (s.id === schoolId ? { ...s, ...updated } : s)));
    } catch (err: unknown) {
      console.error("Toggle error:", err);
    } finally {
      setTogglingSchoolId(null);
    }
  }

  // Copy helper
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  }

  // Handlers for Batch Roster
  const parsedRoster = parseRosterText(rosterText);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const withoutHeader = text.replace(/^\s*(full\s*name|name)\s*,.*$/im, "");
      setRosterText((prev) => (prev ? `${prev}\n${withoutHeader.trim()}` : withoutHeader.trim()));
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleBatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchool || parsedRoster.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await onOnboardBatch({
        schoolId: selectedSchool.id,
        students: parsedRoster,
        ageGroup,
      });

      const addedCount = res.createdAccounts.length;
      setSchools((prev) =>
        prev.map((s) =>
          s.id === selectedSchool.id
            ? {
                ...s,
                licenseSeatsUsed: s.licenseSeatsUsed + addedCount,
                studentsCount: s.studentsCount + addedCount,
              }
            : s
        )
      );

      setCreatedAccounts(res.createdAccounts);
      setFeedbackMessage(res.feedback);
      setRosterText("");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error onboarding roster");
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeBatchModal() {
    setSelectedSchool(null);
    setFeedbackMessage(null);
    setErrorMessage(null);
    setCreatedAccounts([]);
    setRosterText("");
  }

  // Handlers for Create Admin Modal
  async function handleCreateAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adminModalSchool || !adminFullName.trim()) return;

    setIsCreatingAdmin(true);
    setAdminError(null);
    try {
      const res = await onCreateSchoolAdmin({
        schoolId: adminModalSchool.id,
        fullName: adminFullName.trim(),
        email: adminEmail.trim() || undefined,
      });

      if (res && "error" in res && res.error) {
        setAdminError(res.error);
        return;
      }

      const account = res && "account" in res ? res.account : (res as OnboardedSchoolAdminAccount);
      if (!account) {
        setAdminError("Failed to create admin account");
        return;
      }

      setCreatedAdminAccount(account);
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Error creating school admin account");
    } finally {
      setIsCreatingAdmin(false);
    }
  }

  function closeAdminModal() {
    setAdminModalSchool(null);
    setAdminFullName("");
    setAdminEmail("");
    setAdminError(null);
    setCreatedAdminAccount(null);
  }

  return (
    <div className="space-y-8">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">{sm.partnerInstitutionsLabel}</div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.totalPartners} {sm.schoolsUnitLabel}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">{sm.licensedSeatsLabel}</div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.totalSeatsLicensed} {sm.seatsUnitLabel}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">{sm.enrolledStudentsLabel}</div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.totalEnrolledStudents} {sm.studentsUnitLabel}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">{sm.seatUtilizationLabel}</div>
            <div className="text-2xl font-black text-slate-900">{kpis.overallUtilizationPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Main Directory & B2B Control Hub */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
        {/* Header Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              {sm.directoryHeading}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{sm.directorySubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                exportSchoolsSummaryCsv(
                  filteredSchools,
                  sm.partnerSummaryCsvName || (isAr ? "ملخص-المؤسسات-الشريكة" : "partner-schools-summary")
                )
              }
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{sm.exportSummaryCsv || (isAr ? "تصدير ملخص الشركاء (CSV)" : "Export Partner Summary (CSV)")}</span>
            </button>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              ● {kpis.totalInstitutionalClasses} {sm.activeCohortClassesLabel}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className={`w-4 h-4 text-slate-400 absolute top-3 ${isAr ? "right-3" : "left-3"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                sm.searchPlaceholder ||
                (isAr ? "البحث بالاسم، المدينة، الدولة، أو البريد الإلكتروني..." : "Search by name, city, country, or contact email...")
              }
              className={`w-full py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 ${
                isAr ? "pr-9 pl-3" : "pl-9 pr-3"
              }`}
            />
          </div>

          {/* Filter by Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">{sm.filterAllTypes || (isAr ? "جميع أنواع المؤسسات" : "All Institution Types")}</option>
              <option value="ISLAMIC_SCHOOL">{sm.schoolTypeIslamicSchool || "مدرسة إسلامية"}</option>
              <option value="PRIVATE_INSTITUTE">{sm.schoolTypePrivateInstitute || "معهد لغات خاص"}</option>
              <option value="COMMUNITY_CENTER">{sm.schoolTypeCommunityCenter || "مركز مجتمعي"}</option>
              <option value="HOMESCHOOL_COOP">{sm.schoolTypeHomeschoolCoop || "تعاونية منزلية"}</option>
              <option value="FREELANCER_TEACHER">{sm.schoolTypeFreelancerTeacher || "معلم مستقل / حلقة فردية"}</option>
            </select>
          </div>

          {/* Filter by Tier */}
          <div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">{sm.filterAllTiers || (isAr ? "جميع الباقات" : "All Bundle Tiers")}</option>
              <option value="STARTER">{sm.tierStarter || "الباقة الأساسية (STARTER)"}</option>
              <option value="GROWTH">{sm.tierGrowth || "باقة النمو (GROWTH)"}</option>
              <option value="INSTITUTION">{sm.tierInstitution || "باقة المؤسسات (INSTITUTION)"}</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">{sm.filterAllStatuses || (isAr ? "جميع حالات التعاقد" : "All Contract Statuses")}</option>
              <option value="ACTIVE">{sm.statusActive || (isAr ? "نشط ومفعل" : "Active")}</option>
              <option value="PENDING_RENEWAL">{sm.statusPendingRenewal || (isAr ? "بانتظار التجديد" : "Pending Renewal")}</option>
              <option value="TRIAL">{sm.statusTrial || (isAr ? "فترة تجريبية" : "Trial")}</option>
            </select>
          </div>
        </div>

        {/* Schools Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
              <tr>
                <th className="p-4">{sm.tableInstitutionHeader}</th>
                <th className="p-4">{sm.tableLocationHeader}</th>
                <th className="p-4">{sm.tableTypeHeader}</th>
                <th className="p-4">{isAr ? "الباقة والحالة" : "Tier & Status"}</th>
                <th className="p-4">{sm.tableSeatCapacityHeader}</th>
                <th className="p-4">{isAr ? "مسؤول التواصل" : "Contact Lead"}</th>
                <th className="p-4 text-center">{sm.tableActionsHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {isAr ? "لا توجد مؤسسات مطابقة لمعايير البحث الحالية." : "No partner institutions match the current search filters."}
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => {
                  const usedPercent =
                    school.licenseSeatsTotal > 0
                      ? Math.round((school.licenseSeatsUsed / school.licenseSeatsTotal) * 100)
                      : 0;

                  return (
                    <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name */}
                      <td className="p-4">
                        <div className="font-black text-slate-900 text-sm">{school.nameAr}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{school.nameEn}</div>
                        <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">{school.curriculumTrackAr}</div>
                      </td>

                      {/* Location */}
                      <td className="p-4 font-medium text-slate-700">
                        <div>{school.city}</div>
                        <div className="text-[11px] text-slate-400">{school.country}</div>
                      </td>

                      {/* Type */}
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                          {school.type === "ISLAMIC_SCHOOL"
                            ? sm.schoolTypeIslamicSchool || "مدرسة إسلامية"
                            : school.type === "COMMUNITY_CENTER"
                            ? sm.schoolTypeCommunityCenter || "مركز مجتمعي"
                            : school.type === "HOMESCHOOL_COOP"
                            ? sm.schoolTypeHomeschoolCoop || "تعاونية منزلية"
                            : school.type === "FREELANCER_TEACHER"
                            ? sm.schoolTypeFreelancerTeacher || "معلم مستقل"
                            : sm.schoolTypePrivateInstitute || "معهد لغات"}
                        </span>
                      </td>

                      {/* Tier & Status */}
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {school.bundleTier}
                          </span>
                          <button
                            type="button"
                            title={isAr ? "انقر للتبديل السريع لحالة التعاقد" : "Click to quickly toggle contract status"}
                            disabled={togglingSchoolId === school.id}
                            onClick={() => handleToggleStatus(school.id)}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              school.contractStatus === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : school.contractStatus === "TRIAL"
                                ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                school.contractStatus === "ACTIVE"
                                  ? "bg-emerald-500 animate-pulse"
                                  : school.contractStatus === "TRIAL"
                                  ? "bg-purple-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span>
                              {school.contractStatus === "ACTIVE"
                                ? sm.statusActive || (isAr ? "نشط" : "Active")
                                : school.contractStatus === "TRIAL"
                                ? sm.statusTrial || (isAr ? "تجربة 3 أيام" : "Trial")
                                : sm.statusPendingRenewal || (isAr ? "بانتظار التجديد" : "Pending Renewal")}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Seat Capacity Gauge */}
                      <td className="p-4 min-w-[170px]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                          <span>
                            {school.licenseSeatsUsed} / {school.licenseSeatsTotal} {sm.seatsUnitLabel}
                          </span>
                          <span className={usedPercent >= 90 ? "text-amber-600" : "text-slate-600"}>{usedPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(usedPercent, 100)}%` }}
                            className={`h-full rounded-full transition-all ${
                              usedPercent >= 90 ? "bg-rose-500" : usedPercent >= 70 ? "bg-amber-500" : "bg-brand-600"
                            }`}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {isAr ? "المقاعد المتبقية:" : "Remaining:"}{" "}
                          <span className="font-bold text-slate-700">
                            {Math.max(0, school.licenseSeatsTotal - school.licenseSeatsUsed)}
                          </span>
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-xs">{school.contactPerson}</div>
                        <div className="text-[11px] text-slate-500 select-all">{school.contactEmail}</div>
                      </td>

                      {/* Action Hub */}
                      <td className="p-4 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {/* 1. Edit School Info */}
                          <button
                            type="button"
                            onClick={() => openEditModal(school)}
                            title={sm.editSchoolButton || (isAr ? "تعديل بيانات المؤسسة" : "Edit Institution Info")}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Adjust Licenses & Tier */}
                          <button
                            type="button"
                            onClick={() => openLicenseModal(school)}
                            title={sm.adjustLicensesButton || (isAr ? "إدارة التراخيص والباقة" : "Adjust Licenses & Tier")}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Reset School Admin Password */}
                          <button
                            type="button"
                            onClick={() => openResetPasswordModal(school)}
                            title={sm.resetAdminPasswordButton || (isAr ? "إعادة تعيين كلمة مرور المدير" : "Reset Admin Password")}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. Batch Roster Import */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSchool(school);
                              setFeedbackMessage(null);
                              setErrorMessage(null);
                              setCreatedAccounts([]);
                            }}
                            title={sm.onboardRosterButton || (isAr ? "استيراد دفعة طلاب" : "Onboard Roster")}
                            className="p-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>

                          {/* 5. Create School Admin Account */}
                          <button
                            type="button"
                            onClick={() => {
                              setAdminModalSchool(school);
                              setAdminError(null);
                              setCreatedAdminAccount(null);
                            }}
                            title={sm.createSchoolAdminButton || (isAr ? "إنشاء حساب مشرف" : "Create Admin Account")}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: Edit School Information                         */}
      {/* ======================================================== */}
      {editingSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {sm.editSchoolModalHeading || (isAr ? "تعديل بيانات المؤسسة الشريكة" : "Edit Partner Institution Details")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {sm.editSchoolModalDesc || (isAr ? "تحديث معلومات التواصل، النوع، الموقع والمسار المعتمد للمؤسسة." : "Update contact info, institution type, location, and curriculum track.")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchool(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم المؤسسة (بالعربية)" : "Institution Name (Arabic)"}
                  </label>
                  <input
                    value={editForm.nameAr}
                    onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم المؤسسة (بالإنجليزية)" : "Institution Name (English)"}
                  </label>
                  <input
                    value={editForm.nameEn}
                    onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "نوع الكيان المؤسسي" : "Institution Type"}
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as InstitutionType })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="ISLAMIC_SCHOOL">{sm.schoolTypeIslamicSchool || (isAr ? "مدرسة إسلامية نظامية" : "Islamic School")}</option>
                    <option value="PRIVATE_INSTITUTE">{sm.schoolTypePrivateInstitute || (isAr ? "معهد لغات خاص" : "Private Language Institute")}</option>
                    <option value="COMMUNITY_CENTER">{sm.schoolTypeCommunityCenter || (isAr ? "مركز إسلامي / مجتمعي" : "Community Center")}</option>
                    <option value="HOMESCHOOL_COOP">{sm.schoolTypeHomeschoolCoop || (isAr ? "مجموعة تعليم منزلي (Co-Op)" : "Homeschool Co-Op")}</option>
                    <option value="FREELANCER_TEACHER">{sm.schoolTypeFreelancerTeacher || (isAr ? "معلم مستقل / حلقة فردية" : "Freelance Teacher")}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "المسار الأكاديمي المعتمد" : "Curriculum Track"}
                  </label>
                  <input
                    value={editForm.curriculumTrackAr}
                    onChange={(e) => setEditForm({ ...editForm, curriculumTrackAr: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isAr ? "الدولة" : "Country"}</label>
                  <input
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isAr ? "المدينة" : "City"}</label>
                  <input
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "اسم مسؤول التواصل" : "Contact Person"}
                  </label>
                  <input
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isAr ? "البريد الإلكتروني للتواصل" : "Contact Email"}
                  </label>
                  <input
                    type="email"
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">
                  {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {editSuccess}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSavingEdit ? (isAr ? "جارِ الحفظ..." : "Saving...") : sm.saveChangesButton || (isAr ? "حفظ التعديلات" : "Save Changes")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {sm.cancelButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Adjust Licenses, Tier & Status                   */}
      {/* ======================================================== */}
      {licenseModalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {sm.adjustLicensesModalHeading || (isAr ? "تعديل الباقة وحصص المقاعد المرخصة" : "Adjust License Seats & Bundle Tier")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {sm.adjustLicensesModalDesc || (isAr ? "إعادة تخصيص المقاعد، ترقية باقة الاشتراك، أو تعديل حالة تعاقد المؤسسة." : "Allocate student seat capacity, upgrade bundle tier, or update contract lifecycle status.")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLicenseModalSchool(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Utilization Progress Bar Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{licenseModalSchool.nameAr}</span>
                <span className="text-indigo-600">{licenseModalSchool.bundleTier}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  {isAr ? "المقاعد المستخدمة حالياً:" : "Current Seats In Use:"}{" "}
                  <strong className="text-slate-900">{licenseModalSchool.licenseSeatsUsed}</strong>
                </span>
                <span>
                  {isAr ? "إجمالي المقاعد المرخصة:" : "Total Licensed:"}{" "}
                  <strong className="text-slate-900">{licenseForm.licenseSeatsTotal}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      Math.round(
                        (licenseModalSchool.licenseSeatsUsed / Math.max(licenseForm.licenseSeatsTotal, 1)) * 100
                      ),
                      100
                    )}%`,
                  }}
                  className="bg-brand-600 h-full rounded-full transition-all"
                />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>
                  {sm.remainingSeatsLabel || (isAr ? "المقاعد الشاغرة:" : "Available Remaining:")}{" "}
                  <strong className="text-emerald-700">
                    {Math.max(0, licenseForm.licenseSeatsTotal - licenseModalSchool.licenseSeatsUsed)}
                  </strong>
                </span>
                <span>
                  {licenseModalSchool.licenseSeatsTotal > 0
                    ? Math.round((licenseModalSchool.licenseSeatsUsed / licenseForm.licenseSeatsTotal) * 100)
                    : 0}
                  % {isAr ? "نسبة الإشغال" : "utilized"}
                </span>
              </div>
            </div>

            <form onSubmit={handleLicenseSubmit} className="space-y-4 text-xs">
              {/* Bundle Tier */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isAr ? "باقة الاشتراك المؤسسي" : "Subscription Bundle Tier"}
                </label>
                <select
                  value={licenseForm.bundleTier}
                  onChange={(e) => {
                    const newTier = e.target.value as BundleTier;
                    const defaultSeats = newTier === "STARTER" ? 25 : newTier === "GROWTH" ? 100 : 250;
                    setLicenseForm({
                      ...licenseForm,
                      bundleTier: newTier,
                      licenseSeatsTotal: Math.max(licenseForm.licenseSeatsTotal, defaultSeats),
                    });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="STARTER">{sm.tierStarter || (isAr ? "الباقة الأساسية (STARTER - حتى 25 مقعداً)" : "Starter (Up to 25 seats)")}</option>
                  <option value="GROWTH">{sm.tierGrowth || (isAr ? "باقة النمو (GROWTH - حتى 100 مقعد)" : "Growth (Up to 100 seats)")}</option>
                  <option value="INSTITUTION">{sm.tierInstitution || (isAr ? "باقة المؤسسات الكبرى (INSTITUTION - 100+ مقعد)" : "Institution (100+ seats)")}</option>
                </select>
              </div>

              {/* Total Seats Allocation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    {isAr ? "إجمالي المقاعد المرخصة (Seat Quota)" : "Total Licensed Seat Quota"}
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {sm.quickAddSeats || (isAr ? "إضافة سريعة:" : "Quick add:")}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {[10, 25, 50, 100].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() =>
                        setLicenseForm({
                          ...licenseForm,
                          licenseSeatsTotal: licenseForm.licenseSeatsTotal + inc,
                        })
                      }
                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      +{inc}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={licenseModalSchool.licenseSeatsUsed}
                  max={10000}
                  value={licenseForm.licenseSeatsTotal}
                  onChange={(e) =>
                    setLicenseForm({
                      ...licenseForm,
                      licenseSeatsTotal: parseInt(e.target.value || "0", 10),
                    })
                  }
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              {/* Contract Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {sm.contractStatusLabel || (isAr ? "حالة التعاقد" : "Contract Status")}
                </label>
                <select
                  value={licenseForm.contractStatus}
                  onChange={(e) =>
                    setLicenseForm({
                      ...licenseForm,
                      contractStatus: e.target.value as ContractStatus,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="ACTIVE">{sm.statusActive || (isAr ? "نشط ومفعل (ACTIVE)" : "Active")}</option>
                  <option value="PENDING_RENEWAL">{sm.statusPendingRenewal || (isAr ? "بانتظار التجديد (PENDING_RENEWAL)" : "Pending Renewal")}</option>
                  <option value="TRIAL">{sm.statusTrial || (isAr ? "فترة تقييم تجريبية (TRIAL)" : "Trial Evaluation")}</option>
                </select>
              </div>

              {licenseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">
                  {licenseError}
                </div>
              )}

              {licenseSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {licenseSuccess}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingLicenses}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSavingLicenses
                    ? isAr
                      ? "جارِ التحديث..."
                      : "Updating..."
                    : isAr
                    ? "اعتماد تحديث التراخيص والمقاعد"
                    : "Confirm License & Seat Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setLicenseModalSchool(null)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {sm.cancelButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Reset School Admin Password                     */}
      {/* ======================================================== */}
      {resetModalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {sm.resetAdminPasswordModalHeading || (isAr ? "إعادة تعيين كلمة مرور المشرف" : "Reset School Admin Password")}
                  </h3>
                  <p className="text-xs text-slate-500">{resetModalSchool.nameAr}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalSchool(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* School & Target Account Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">
                {isAr ? "المسؤول المعين:" : "Assigned Administrator:"} {resetModalSchool.contactPerson}
              </div>
              <div className="text-slate-600 select-all font-mono text-[11px]">{resetModalSchool.contactEmail}</div>
            </div>

            {resetResult ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isAr
                      ? "تم تعيين كلمة المرور الجديدة لمدير المؤسسة بنجاح!"
                      : "New administrator password was successfully set!"}
                  </span>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-4 font-mono text-xs space-y-2 relative">
                  <div>
                    <span className="text-slate-400 text-[10px] block">{isAr ? "البريد الإلكتروني:" : "Login Email:"}</span>
                    <span className="font-bold">{resetResult.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{isAr ? "كلمة المرور الجديدة:" : "New Password:"}</span>
                    <span className="text-amber-400 font-black text-sm tracking-wide">{resetResult.tempPassword}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `${isAr ? "بيانات دخول لوحة المشرف المؤسسي:" : "Institutional Admin Logins:"}\nEmail: ${resetResult.email}\nPassword: ${resetResult.tempPassword}`
                      )
                    }
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedNotification ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNotification ? (sm.credentialsCopiedToast || (isAr ? "تم النسخ!" : "Copied!")) : sm.copyCredentialsButton || (isAr ? "نسخ البيانات" : "Copy Credentials")}</span>
                  </button>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px]">
                  {isAr
                    ? "💡 يمكنك نسخ البيانات وإرسالها مباشرة إلى مدير المدرسة عبر البريد أو واتساب."
                    : "💡 You can copy and send these credentials directly to the school principal."}
                </div>

                <button
                  type="button"
                  onClick={() => setResetModalSchool(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {sm.doneButton}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {sm.customPasswordLabel || (isAr ? "كلمة مرور مخصصة (اختياري)" : "Custom Password (optional)")}
                  </label>
                  <input
                    type="text"
                    value={customResetPassword}
                    onChange={(e) => setCustomResetPassword(e.target.value)}
                    placeholder={isAr ? "اتركها فارغة لتوليد كلمة مرور عشوائية قوية" : "Leave blank to auto-generate a strong password"}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    {sm.customPasswordHint ||
                      (isAr
                        ? "إذا تركت الحقل فارغاً، سيتم توليد كلمة مرور مؤقتة فريدة وتشفيرها في النظام."
                        : "Leaving this blank generates a cryptographically secure random password.")}
                  </p>
                </div>

                {resetError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">
                    {resetError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>
                      {isResettingPassword
                        ? isAr
                          ? "جارِ إعادة التعيين..."
                          : "Resetting..."
                        : isAr
                        ? "تأكيد وإعادة تعيين كلمة المرور 🔑"
                        : "Confirm & Reset Password 🔑"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetModalSchool(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {sm.cancelButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: Batch Roster Import (Existing Enhanced)         */}
      {/* ======================================================== */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-black text-slate-900">{sm.batchModalHeading}</h3>
              </div>
              <button
                type="button"
                onClick={closeBatchModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedSchool.nameAr}</div>
              <div className="text-slate-500">
                {sm.availableLicenseSeatsLabel}{" "}
                <span className="font-bold text-emerald-700">
                  {selectedSchool.licenseSeatsTotal - selectedSchool.licenseSeatsUsed} {sm.seatsUnitLabel}
                </span>
              </div>
            </div>

            {createdAccounts.length > 0 ? (
              <div className="space-y-3">
                {feedbackMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feedbackMessage}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>{sm.generatedLoginsNote}</span>
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-[11px] font-mono">
                  {createdAccounts.map((a, i) => (
                    <div key={i} className="p-2.5 flex flex-col bg-white">
                      <span className="font-bold text-slate-800 font-sans">{a.fullName}</span>
                      <span className="text-slate-600">{a.email}</span>
                      <span className="text-brand-700">{a.tempPassword}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => downloadCredentialsCsv(selectedSchool.nameEn, createdAccounts)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{sm.downloadCsvButton}</span>
                </button>

                <button
                  type="button"
                  onClick={closeBatchModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {sm.doneButton}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{sm.ageGroupLabel}</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="AGE_4_6">4-6</option>
                    <option value="AGE_7_10">7-10</option>
                    <option value="AGE_11_13">11-13</option>
                    <option value="AGE_14_16">14-16</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">{sm.studentRosterLabel}</label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-brand-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      {sm.uploadCsvButton}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv,text/plain"
                      onChange={handleFileSelected}
                      className="hidden"
                    />
                  </div>
                  <textarea
                    value={rosterText}
                    onChange={(e) => setRosterText(e.target.value)}
                    rows={6}
                    placeholder={"Ahmad Al-Amin\nSara Youssef, sara@example.com"}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1">
                    {parsedRoster.length} {sm.studentsWillBeOnboardedSuffix}
                    {parsedRoster.length > selectedSchool.licenseSeatsTotal - selectedSchool.licenseSeatsUsed && (
                      <span className="text-rose-600 font-bold"> -- {sm.exceedsAvailableSeatsLabel}</span>
                    )}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      parsedRoster.length === 0 ||
                      parsedRoster.length > selectedSchool.licenseSeatsTotal - selectedSchool.licenseSeatsUsed
                    }
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSubmitting ? sm.creatingAccountsLabel : sm.confirmBatchOnboardButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeBatchModal}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {sm.cancelButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: Create School Admin Account (Existing Enhanced) */}
      {/* ======================================================== */}
      {adminModalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">{sm.createSchoolAdminModalHeading}</h3>
              </div>
              <button
                type="button"
                onClick={closeAdminModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{adminModalSchool.nameAr}</div>
              <div className="text-slate-500">{sm.createSchoolAdminScopeNote}</div>
            </div>

            {createdAdminAccount ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{sm.createSchoolAdminSuccessMessage}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>{sm.generatedLoginsNote}</span>
                </div>

                <div className="rounded-xl border border-slate-200 p-2.5 text-[11px] font-mono bg-white">
                  <span className="font-bold text-slate-800 font-sans block">{createdAdminAccount.fullName}</span>
                  <span className="text-slate-600 block">{createdAdminAccount.email}</span>
                  <span className="text-brand-700">{createdAdminAccount.tempPassword}</span>
                </div>

                <button
                  type="button"
                  onClick={closeAdminModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {sm.doneButton}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {sm.createSchoolAdminFullNameLabel}
                  </label>
                  <input
                    value={adminFullName}
                    onChange={(e) => setAdminFullName(e.target.value)}
                    required
                    placeholder="Layla Haddad"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {sm.createSchoolAdminEmailLabel}
                  </label>
                  <input
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    type="email"
                    placeholder="admin@partner-school.example"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{sm.createSchoolAdminEmailHint}</p>
                </div>

                {adminError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                    {adminError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingAdmin || !adminFullName.trim()}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isCreatingAdmin ? sm.creatingAccountsLabel : sm.createSchoolAdminConfirmButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeAdminModal}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {sm.cancelButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
