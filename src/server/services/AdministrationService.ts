import {
  administrationRepository,
  AuditActionCategory,
  AuditLogEntry,
  CurriculumModule,
  StudentAdminRecord,
  TeacherAdminRecord,
} from "../repositories/AdministrationRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { attendanceRepository } from "../repositories/AttendanceRepository";
import { UserStatus, RoleType, EmploymentType } from "@prisma/client";
import { SessionUser } from "@/lib/auth/session";

export interface SchoolAnalyticsOverview {
  totalStudents: number;
  activeStudents: number;
  suspendedStudents: number;
  totalTeachers: number;
  activeClassGroups: number;
  overallAttendanceRate: number;
  retentionRatePercentage: number;
  totalHoursDelivered: number;
  curriculumModulesCount: number;
}

export class AdministrationService {
  async recordAuditLog(params: {
    category: AuditActionCategory;
    action: string;
    actor: SessionUser;
    targetEntityId: string;
    targetEntityType: string;
    ipAddress?: string;
    diffSummary?: string;
  }): Promise<AuditLogEntry> {
    return administrationRepository.addAuditLog({
      category: params.category,
      action: params.action,
      actorId: params.actor.id,
      actorEmail: params.actor.email,
      actorRole: params.actor.role,
      targetEntityId: params.targetEntityId,
      targetEntityType: params.targetEntityType,
      ipAddress: params.ipAddress || "127.0.0.1",
      diffSummary: params.diffSummary,
    });
  }

  async getAuditLogs(filters?: {
    category?: AuditActionCategory;
    actorRole?: RoleType;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    return administrationRepository.getAuditLogs(filters);
  }

  async verifyLogIntegrity(logId: string): Promise<boolean> {
    return administrationRepository.verifyLogIntegrity(logId);
  }

  // --- Student Governance ---
  async getAllStudents(): Promise<StudentAdminRecord[]> {
    return administrationRepository.getAllStudentsAdmin();
  }

  async setStudentStatus(
    studentId: string,
    newStatus: UserStatus,
    reason: string,
    actor: SessionUser
  ): Promise<void> {
    await administrationRepository.setStudentStatus(studentId, newStatus);

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: newStatus === UserStatus.ACTIVE ? "STUDENT_ACTIVATED" : "STUDENT_SUSPENDED",
      actor,
      targetEntityId: studentId,
      targetEntityType: "StudentProfile",
      diffSummary: `تعديل حالة حساب الطالب إلى [${newStatus}] - السبب: ${reason}`,
    });
  }

  // --- Teacher Governance ---
  async getAllTeachers(): Promise<TeacherAdminRecord[]> {
    return administrationRepository.getAllTeachersAdmin();
  }

  async updateTeacherHourlyRate(
    teacherId: string,
    newRateMinorUnits: number,
    actor: SessionUser
  ): Promise<void> {
    const oldTeachers = await administrationRepository.getAllTeachersAdmin();
    const oldTeacher = oldTeachers.find((t) => t.id === teacherId);
    const oldRate = oldTeacher ? oldTeacher.hourlyRateMinorUnits : 0;

    await administrationRepository.updateTeacherRate(teacherId, newRateMinorUnits);

    await this.recordAuditLog({
      category: "FINANCE",
      action: "TEACHER_HOURLY_RATE_MODIFIED",
      actor,
      targetEntityId: teacherId,
      targetEntityType: "TeacherProfile",
      diffSummary: `تعديل أجر ساعة المعلم من $${(oldRate / 100).toFixed(2)} إلى $${(newRateMinorUnits / 100).toFixed(2)}`,
    });
  }

  async toggleTeacherStatus(
    teacherId: string,
    isActive: boolean,
    actor: SessionUser
  ): Promise<void> {
    await administrationRepository.updateTeacherActiveStatus(teacherId, isActive);

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: isActive ? "TEACHER_ACTIVATED" : "TEACHER_SUSPENDED",
      actor,
      targetEntityId: teacherId,
      targetEntityType: "TeacherProfile",
      diffSummary: `تعديل حالة نشاط المعلم إلى [${isActive ? "نشط ومتاح للتدريس" : "معلق مؤقتاً"}]`,
    });
  }

  async updateTeacherCertification(
    teacherId: string,
    isCertified: boolean,
    employmentType: EmploymentType,
    actor: SessionUser
  ): Promise<void> {
    await administrationRepository.updateTeacherCertification(teacherId, isCertified, employmentType);

    await this.recordAuditLog({
      category: "ACADEMIC",
      action: "TEACHER_CERTIFICATION_UPDATED",
      actor,
      targetEntityId: teacherId,
      targetEntityType: "TeacherProfile",
      diffSummary: `تحديث حالة الاعتماد إلى [${isCertified ? "معتمد" : "غير معتمد"}] ونوع التوظيف إلى [${employmentType}]`,
    });
  }

  // --- Curriculum Standards ---
  async getCurriculumModules(programId?: string): Promise<CurriculumModule[]> {
    if (programId) {
      return administrationRepository.getCurriculumModulesByProgram(programId);
    }
    return administrationRepository.getAllCurriculumModules();
  }

  async addCurriculumModule(
    data: Omit<CurriculumModule, "id">,
    actor: SessionUser
  ): Promise<CurriculumModule> {
    const created = await administrationRepository.addCurriculumModule(data);

    await this.recordAuditLog({
      category: "ACADEMIC",
      action: "CURRICULUM_MODULE_CREATED",
      actor,
      targetEntityId: created.id,
      targetEntityType: "CurriculumModule",
      diffSummary: `إضافة وحدة منهجية جديدة [${created.titleAr}] للمستوى [${created.courseLevelCode}]`,
    });

    return created;
  }

  // --- Analytics Overview ---
  async getSchoolAnalyticsOverview(): Promise<SchoolAnalyticsOverview> {
    const students = await administrationRepository.getAllStudentsAdmin();
    const teachers = await administrationRepository.getAllTeachersAdmin();
    const classes = await academicRepository.getAllClassGroups();
    const modules = await administrationRepository.getAllCurriculumModules();
    const attendance = await attendanceRepository.calculateOverallAttendanceRate();

    const activeStudents = students.filter((s) => s.status === UserStatus.ACTIVE).length;
    const suspendedStudents = students.length - activeStudents;
    const totalHoursDelivered = teachers.reduce((sum, t) => sum + t.totalHoursTaught, 0);

    // Retention = the share of every enrolled student account that is
    // still ACTIVE (not suspended/archived), rather than the hardcoded
    // 98.2% literal this used to return unconditionally. This replaces a
    // fabricated number with a real, if simple, definition computed from
    // the same student records the "totalStudents"/"activeStudents"
    // figures above already use.
    const retentionRatePercentage =
      students.length > 0 ? Math.round((activeStudents / students.length) * 1000) / 10 : 100;

    return {
      totalStudents: students.length,
      activeStudents,
      suspendedStudents,
      totalTeachers: teachers.length,
      activeClassGroups: classes.length,
      overallAttendanceRate: attendance.ratePercentage,
      retentionRatePercentage,
      totalHoursDelivered,
      curriculumModulesCount: modules.length,
    };
  }

  /**
   * The same overview, scoped to one partner school's own roster and
   * classes -- what the Institutional Admin Dashboard's Attendance &
   * Progress Reporting section is built from, instead of a platform-wide
   * (or fabricated) number every school would otherwise see.
   */
  async getSchoolAnalyticsOverviewForSchool(schoolId: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalClasses: number;
    attendanceRatePercentage: number;
    attendanceRecordsCount: number;
  }> {
    const [classes, attendance, schoolStudentCount] = await Promise.all([
      academicRepository.getClassGroupsBySchoolId(schoolId),
      attendanceRepository.calculateOverallAttendanceRate(schoolId),
      administrationRepository.countStudentsBySchool(schoolId),
    ]);

    return {
      totalStudents: schoolStudentCount.total,
      activeStudents: schoolStudentCount.active,
      totalClasses: classes.length,
      attendanceRatePercentage: attendance.ratePercentage,
      attendanceRecordsCount: attendance.totalRecords,
    };
  }
}

export const administrationService = new AdministrationService();
