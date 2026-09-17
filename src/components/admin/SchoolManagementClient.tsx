"use client";

import React, { useRef, useState } from "react";
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
} from "lucide-react";
import {
  PartnerSchool,
  OnboardedStudentAccount,
  OnboardedSchoolAdminAccount,
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
  }) => Promise<OnboardedSchoolAdminAccount>;
}

// Parses the free-text roster box: one student per line, optionally
// "Full Name, email@domain.com". Also what a pasted-in CSV's text lands as
// once read client-side, so no separate parser is needed for the upload path.
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

export function SchoolManagementClient({
  initialSchools,
  kpis,
  locale,
  onOnboardBatch,
  onCreateSchoolAdmin,
}: SchoolManagementClientProps) {
  const dict = getDictionary(locale);
  const sm = dict.schoolManagementClient;
  const [schools, setSchools] = useState<PartnerSchool[]>(initialSchools);
  const [selectedSchool, setSelectedSchool] = useState<PartnerSchool | null>(null);
  const [rosterText, setRosterText] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("AGE_7_10");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdAccounts, setCreatedAccounts] = useState<OnboardedStudentAccount[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create-school-admin modal state (separate from the batch-roster
  // modal above, since it's a different flow: one account, not a roster).
  const [adminModalSchool, setAdminModalSchool] = useState<PartnerSchool | null>(null);
  const [adminFullName, setAdminFullName] = useState<string>("");
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [createdAdminAccount, setCreatedAdminAccount] = useState<OnboardedSchoolAdminAccount | null>(null);

  async function handleCreateAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adminModalSchool || !adminFullName.trim()) return;

    setIsCreatingAdmin(true);
    setAdminError(null);
    try {
      const account = await onCreateSchoolAdmin({
        schoolId: adminModalSchool.id,
        fullName: adminFullName.trim(),
        email: adminEmail.trim() || undefined,
      });
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

  const parsedRoster = parseRosterText(rosterText);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      // Naively strip a "Name,Email" header row if the CSV includes one.
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

  function closeModal() {
    setSelectedSchool(null);
    setFeedbackMessage(null);
    setErrorMessage(null);
    setCreatedAccounts([]);
    setRosterText("");
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
            <div className="text-xs text-slate-500 font-bold">
              {sm.partnerInstitutionsLabel}
            </div>
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
            <div className="text-xs text-slate-500 font-bold">
              {sm.licensedSeatsLabel}
            </div>
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
            <div className="text-xs text-slate-500 font-bold">
              {sm.enrolledStudentsLabel}
            </div>
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
            <div className="text-xs text-slate-500 font-bold">
              {sm.seatUtilizationLabel}
            </div>
            <div className="text-2xl font-black text-slate-900">
              {kpis.overallUtilizationPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Schools Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {sm.directoryHeading}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {sm.directorySubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              ● {kpis.totalInstitutionalClasses} {sm.activeCohortClassesLabel}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">{sm.tableInstitutionHeader}</th>
                <th className="p-4">{sm.tableLocationHeader}</th>
                <th className="p-4">{sm.tableTypeHeader}</th>
                <th className="p-4">{sm.tableSeatCapacityHeader}</th>
                <th className="p-4">{sm.tableCurriculumTrackHeader}</th>
                <th className="p-4 text-center">{sm.tableActionsHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schools.map((school) => {
                const usedPercent = Math.round(
                  (school.licenseSeatsUsed / school.licenseSeatsTotal) * 100
                );
                return (
                  <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900 text-sm">
                        {school.nameAr}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {school.nameEn}
                      </div>
                    </td>

                    <td className="p-4 font-medium text-slate-700">
                      {school.country} - {school.city}
                    </td>

                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold">
                        {school.type === "ISLAMIC_SCHOOL"
                          ? sm.schoolTypeIslamicSchool
                          : school.type === "COMMUNITY_CENTER"
                          ? sm.schoolTypeCommunityCenter
                          : sm.schoolTypeHomeschoolCoop}
                      </span>
                    </td>

                    <td className="p-4 min-w-[180px]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>
                          {school.licenseSeatsUsed} / {school.licenseSeatsTotal} {sm.seatsUnitLabel}
                        </span>
                        <span>{usedPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${usedPercent}%` }}
                          className={`h-full rounded-full ${
                            usedPercent >= 90
                              ? "bg-amber-500"
                              : "bg-brand-600"
                          }`}
                        />
                      </div>
                    </td>

                    <td className="p-4 text-slate-600 font-medium">
                      {school.curriculumTrackAr}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchool(school);
                            setFeedbackMessage(null);
                            setErrorMessage(null);
                            setCreatedAccounts([]);
                          }}
                          className="py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{sm.onboardRosterButton}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdminModalSchool(school);
                            setAdminError(null);
                            setCreatedAdminAccount(null);
                          }}
                          className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{sm.createSchoolAdminButton}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Roster Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-black text-slate-900">
                  {sm.batchModalHeading}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
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
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{sm.downloadCsvButton}</span>
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {sm.doneButton}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {sm.ageGroupLabel}
                  </label>
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
                    <label className="block text-xs font-bold text-slate-700">
                      {sm.studentRosterLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-brand-700 hover:underline inline-flex items-center gap-1"
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
                      <span className="text-rose-600 font-bold">
                        {" "}
                        -- {sm.exceedsAvailableSeatsLabel}
                      </span>
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
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSubmitting ? sm.creatingAccountsLabel : sm.confirmBatchOnboardButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    {sm.cancelButton}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create School Admin Modal */}
      {adminModalSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  {sm.createSchoolAdminModalHeading}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAdminModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
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
                  <span className="font-bold text-slate-800 font-sans block">
                    {createdAdminAccount.fullName}
                  </span>
                  <span className="text-slate-600 block">{createdAdminAccount.email}</span>
                  <span className="text-brand-700">{createdAdminAccount.tempPassword}</span>
                </div>

                <button
                  type="button"
                  onClick={closeAdminModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isCreatingAdmin ? sm.creatingAccountsLabel : sm.createSchoolAdminConfirmButton}</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeAdminModal}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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
