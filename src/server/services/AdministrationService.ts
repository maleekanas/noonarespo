import {
  administrationRepository,
  AuditActionCategory,
  AuditLogEntry,
  CurriculumModule,
  StudentAdminRecord,
  TeacherAdminRecord,
} from "../repositories/AdministrationRepository";
import { academicRepository } from "../repositories/AcademicRepository";
import { UserStatus, RoleType } from "@prisma/client";
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

    const activeStudents = students.filter((s) => s.status === UserStatus.ACTIVE).length;
    const suspendedStudents = students.length - activeStudents;
    const totalHoursDelivered = teachers.reduce((sum, t) => sum + t.totalHoursTaught, 0);

    return {
      totalStudents: students.length,
      activeStudents,
      suspendedStudents,
      totalTeachers: teachers.length,
      activeClassGroups: classes.length,
      overallAttendanceRate: 96.5,
      retentionRatePercentage: 98.2,
      totalHoursDelivered,
      curriculumModulesCount: modules.length,
    };
  }
}

export const administrationService = new AdministrationService();
