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
import {
  curriculumLessonRepository,
  CurriculumLesson,
} from "../repositories/CurriculumLessonRepository";
import { userRepository } from "../repositories/UserRepository";
import { UserStatus, RoleType, EmploymentType, AgeGroup, RelationshipType } from "@prisma/client";
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
    const actorId = params.actor?.id || "admin-system";
    const actorEmail = params.actor?.email || "admin@kidsarabicacademy.internal";
    const actorRole = params.actor?.role || RoleType.SUPER_ADMIN;

    return administrationRepository.addAuditLog({
      category: params.category,
      action: params.action,
      actorId,
      actorEmail,
      actorRole,
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

  async addStudent(
    data: {
      firstName: string;
      lastName: string;
      dateOfBirth: Date;
      ageGroup: AgeGroup;
      guardianName: string;
      guardianPhone: string;
      notesInternal?: string;
    },
    actor: SessionUser
  ): Promise<any> {
    const parentId = `parent-admin-${Date.now()}`;
    const student = await userRepository.createChildWithParentLink(parentId, {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      ageGroup: data.ageGroup,
      relationshipType: RelationshipType.FATHER,
      notesInternal: data.notesInternal,
    });

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "STUDENT_REGISTERED_ADMIN",
      actor,
      targetEntityId: student.id,
      targetEntityType: "StudentProfile",
      diffSummary: `تسجيل طالب جديد [${data.firstName} ${data.lastName}] عبر لوحة الإدارة العامة`,
    });

    return student;
  }

  async updateStudent(
    studentId: string,
    data: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: Date;
      ageGroup?: AgeGroup;
      notesInternal?: string;
    },
    actor: SessionUser
  ): Promise<any> {
    const updated = await userRepository.updateStudentProfile(studentId, data);

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "STUDENT_PROFILE_MODIFIED",
      actor,
      targetEntityId: studentId,
      targetEntityType: "StudentProfile",
      diffSummary: `تعديل بيانات ملف الطالب [${studentId}] من قبل الإدارة`,
    });

    return updated;
  }

  async resetStudentPassword(
    studentId: string,
    customPassword?: string,
    actor?: SessionUser
  ): Promise<{ email: string; tempPassword: string }> {
    const students = await this.getAllStudents();
    const st = students.find((s) => s.id === studentId);
    const userId = st?.userId || studentId;

    const result = await userRepository.resetUserPassword(userId, customPassword);

    if (actor) {
      await this.recordAuditLog({
        category: "USER_MANAGEMENT",
        action: "RESET_STUDENT_PASSWORD",
        actor,
        targetEntityId: studentId,
        targetEntityType: "StudentProfile",
        diffSummary: `إعادة تعيين كلمة مرور الطالب [${st ? st.firstName + " " + st.lastName : studentId}] للمستخدم [${result.email}]`,
      });
    }

    return result;
  }

  async archiveStudent(studentId: string, reason: string, actor: SessionUser): Promise<void> {
    await this.setStudentStatus(studentId, UserStatus.ARCHIVED, reason, actor);
  }

  // --- Teacher Governance ---
  async getAllTeachers(): Promise<TeacherAdminRecord[]> {
    return administrationRepository.getAllTeachersAdmin();
  }

  async addTeacher(
    data: {
      email: string;
      firstName: string;
      lastName: string;
      qualifications: string;
      experienceYears: number;
      hourlyRateMinorUnits: number;
      employmentType: EmploymentType;
      isCertified: boolean;
    },
    actor: SessionUser
  ): Promise<any> {
    const teacher = await userRepository.createTeacherProfile(data);

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "TEACHER_ONBOARDED_ADMIN",
      actor,
      targetEntityId: teacher.id,
      targetEntityType: "TeacherProfile",
      diffSummary: `إضافة واعتماد معلم جديد [${data.firstName} ${data.lastName}] بأجر ساعة $${(data.hourlyRateMinorUnits / 100).toFixed(2)}`,
    });

    return teacher;
  }

  async archiveTeacher(teacherId: string, actor: SessionUser): Promise<void> {
    await this.toggleTeacherStatus(teacherId, false, actor);
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

  async resetTeacherPassword(
    teacherId: string,
    customPassword?: string,
    actor?: SessionUser
  ): Promise<{ email: string; tempPassword: string }> {
    const teachers = await this.getAllTeachers();
    const tch = teachers.find((t) => t.id === teacherId);
    const userId = tch?.userId || teacherId;

    const result = await userRepository.resetUserPassword(userId, customPassword);

    if (actor) {
      await this.recordAuditLog({
        category: "USER_MANAGEMENT",
        action: "RESET_TEACHER_PASSWORD",
        actor,
        targetEntityId: teacherId,
        targetEntityType: "TeacherProfile",
        diffSummary: `إعادة تعيين كلمة مرور المعلم [${tch ? tch.firstName + " " + tch.lastName : teacherId}] للمستخدم [${result.email}]`,
      });
    }

    return result;
  }

  async updateTeacherFull(
    teacherId: string,
    data: {
      firstName?: string;
      lastName?: string;
      qualifications?: string;
      experienceYears?: number;
      hourlyRateMinorUnits?: number;
      employmentType?: EmploymentType;
      isCertified?: boolean;
      isActive?: boolean;
    },
    actor: SessionUser
  ): Promise<any> {
    const updated = await userRepository.updateTeacherProfileFull(teacherId, data);

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "TEACHER_PROFILE_MODIFIED",
      actor,
      targetEntityId: teacherId,
      targetEntityType: "TeacherProfile",
      diffSummary: `تعديل ملف المعلم [${teacherId}]: ${JSON.stringify(data)}`,
    });

    return updated;
  }

  // --- Curriculum Standards ---
  async getCurriculumModules(programId?: string): Promise<CurriculumModule[]> {
    if (programId) {
      return administrationRepository.getCurriculumModulesByProgram(programId);
    }
    return administrationRepository.getAllCurriculumModules();
  }

  async getAllLessons(): Promise<CurriculumLesson[]> {
    return curriculumLessonRepository.getAllLessons();
  }

  async getLessonsByAgeGroup(ageGroup: AgeGroup): Promise<CurriculumLesson[]> {
    return curriculumLessonRepository.getLessonsByAgeGroup(ageGroup);
  }

  async getLessonsByProgram(programId: string): Promise<CurriculumLesson[]> {
    return curriculumLessonRepository.getLessonsByProgram(programId);
  }

  async getLessonsCountByAgeGroup(): Promise<Record<AgeGroup, number>> {
    return curriculumLessonRepository.getLessonsCountByAgeGroup();
  }

  async addLesson(
    data: Parameters<typeof curriculumLessonRepository.createLesson>[0],
    actor: SessionUser
  ): Promise<CurriculumLesson> {
    const created = await curriculumLessonRepository.createLesson(data);

    await this.recordAuditLog({
      category: "ACADEMIC",
      action: "CURRICULUM_LESSON_CREATED",
      actor,
      targetEntityId: created.id,
      targetEntityType: "CurriculumLesson",
      diffSummary: `إضافة درس جديد [${created.titleAr}] للمسار [${created.programId}] والفئة [${created.ageGroup}] - Bloom: [${created.bloomStage}], STEAM: [${created.steamDomain}]`,
    });

    return created;
  }

  async updateLesson(
    id: string,
    data: Partial<CurriculumLesson>,
    actor: SessionUser
  ): Promise<CurriculumLesson | null> {
    const updated = await curriculumLessonRepository.updateLesson(id, data);

    if (updated) {
      await this.recordAuditLog({
        category: "ACADEMIC",
        action: "CURRICULUM_LESSON_MODIFIED",
        actor,
        targetEntityId: id,
        targetEntityType: "CurriculumLesson",
        diffSummary: `تعديل محتوى الدرس الأكاديمي [${updated.titleAr}]`,
      });
    }

    return updated;
  }

  async deleteLesson(id: string, actor: SessionUser): Promise<boolean> {
    const lesson = await curriculumLessonRepository.getLessonById(id);
    const deleted = await curriculumLessonRepository.deleteLesson(id);

    if (deleted) {
      await this.recordAuditLog({
        category: "ACADEMIC",
        action: "CURRICULUM_LESSON_DELETED",
        actor,
        targetEntityId: id,
        targetEntityType: "CurriculumLesson",
        diffSummary: `حذف الدرس الأكاديمي [${lesson?.titleAr || id}] من المنهج`,
      });
    }

    return deleted;
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

  // --- Platform Admin Governance (Role Management) ---

  /**
   * Creates a second, LIMITED admin account -- ACADEMIC_ADMIN or
   * FINANCE_ADMIN, never SUPER_ADMIN from this path -- and audit-logs the
   * creation the same way every other account-creation action here does.
   * This is the concrete "second admin with limited permissions" the
   * platform previously had no way to create: canAccessAdminHub already
   * drew the access matrix, but there was no UI or backend path to a real
   * account that would actually exercise it.
   */
  async createPlatformAdmin(
    data: { fullName: string; email?: string; role: typeof RoleType.ACADEMIC_ADMIN | typeof RoleType.FINANCE_ADMIN },
    actor: SessionUser
  ): Promise<{ fullName: string; email: string; tempPassword: string }> {
    const created = await userRepository.createPlatformAdmin(data);

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: "PLATFORM_ADMIN_CREATED",
      actor,
      targetEntityId: created.email,
      targetEntityType: "AdministratorProfile",
      diffSummary: `تم إنشاء حساب إداري جديد (${data.role}) باسم ${data.fullName}`,
    });

    return created;
  }

  async listPlatformAdmins() {
    return userRepository.listPlatformAdmins();
  }

  /**
   * Activates or suspends a platform admin's own login. SUPER_ADMIN
   * accounts are intentionally excluded at the call site (settings/page.tsx)
   * -- this exists to let a super admin revoke a limited admin's access,
   * not to let anyone lock out the platform's own super-admin account.
   */
  async setPlatformAdminStatus(
    userId: string,
    newStatus: UserStatus,
    actor: SessionUser
  ): Promise<void> {
    await userRepository.setUserAccountStatus(userId, newStatus);

    await this.recordAuditLog({
      category: "USER_MANAGEMENT",
      action: newStatus === UserStatus.ACTIVE ? "PLATFORM_ADMIN_ACTIVATED" : "PLATFORM_ADMIN_SUSPENDED",
      actor,
      targetEntityId: userId,
      targetEntityType: "AdministratorProfile",
      diffSummary: `تعديل حالة الحساب الإداري إلى [${newStatus}]`,
    });
  }
}

export const administrationService = new AdministrationService();
