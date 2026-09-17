import {
  RoleType,
  UserStatus,
  AgeGroup,
  RelationshipType,
  ProgramType,
  ClassType,
  EnrollmentStatus,
  TeacherRoleInClass,
  SessionStatus,
  AttendanceStatus,
  SubmissionStatus,
  EmploymentType,
} from "@prisma/client";

export interface DomainUser {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  localePreference: string;
  mfaEnabled: boolean;
  role: RoleType;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainStudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: string | null;
  nationality?: string | null;
  nativeLanguage: string;
  ageGroup: AgeGroup;
  notesInternal?: string | null;
  // Set only for a student onboarded through the B2B institutional roster
  // flow -- which PartnerSchool this student belongs to. Null for
  // individually-enrolled students. This is the tenant boundary a
  // school-scoped ClassGroup's enrollment is checked against.
  schoolId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainParentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emergencyContactName?: string | null;
  emergencyPhone?: string | null;
  billingAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainTeacherProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bioEn?: string | null;
  bioAr?: string | null;
  qualifications?: string | null;
  certifications?: string | null;
  experienceYears: number;
  hourlyRateMinorUnits: number;
  languagesSpoken?: string | null;
  isActive: boolean;
  // Verified by an admin against the teacher's real qualifications/
  // certifications fields -- backs the "Certified, Full-Time Educators"
  // claim on the public For Schools page with real per-teacher data
  // instead of a hardcoded "100%" badge.
  isCertified: boolean;
  employmentType: EmploymentType;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainAdministratorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  scope: RoleType;
  // Set only when scope is SCHOOL_ADMIN: which PartnerSchool this admin is
  // confined to. Null for the platform-wide admin roles.
  schoolId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainParentStudentRelationship {
  id: string;
  parentId: string;
  studentId: string;
  relationshipType: RelationshipType;
  isPrimaryContact: boolean;
  consentGivenAt: Date;
}

export interface DomainProgram {
  id: string;
  type: ProgramType;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  iconName?: string | null;
}

export interface DomainCourse {
  id: string;
  programId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
}

export interface DomainCourseLevel {
  id: string;
  courseId: string;
  levelCode: string; // e.g. "L1", "A1", "PRE_A1"
  titleEn: string;
  titleAr: string;
  targetAge: AgeGroup;
}

export interface DomainClassGroup {
  id: string;
  courseLevelId: string;
  name: string;
  classType: ClassType;
  capacityMax: number; // default 6 for group, 1 for private
  isActive: boolean;
  // Set only for a class created under the B2B institutional flow, scoping
  // it to one PartnerSchool. Null for the platform's normal
  // individually-enrolled classes.
  schoolId?: string | null;
  createdAt: Date;
}

export interface DomainClassEnrollment {
  id: string;
  studentId: string;
  classGroupId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
}

export interface DomainTeacherAssignment {
  id: string;
  teacherId: string;
  classGroupId: string;
  role: TeacherRoleInClass;
  createdAt: Date; // the TeacherAssignment Prisma model's actual column name is "createdAt", not "assignedAt"
}

export interface DomainClassSession {
  id: string;
  classGroupId: string;
  teacherId: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  status: SessionStatus;
  meetingUrl?: string | null;
  recordingUrl?: string | null;
}

export interface DomainAttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string | null;
  recordedAt: Date;
}

export interface DomainAssignment {
  id: string;
  classGroupId: string;
  titleEn: string;
  titleAr: string;
  instructions: string;
  voicePromptUrl?: string | null;
  dueDateUtc: Date;
  createdAt: Date;
}

export interface DomainAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  audioUrl?: string | null;
  textContent?: string | null;
  status: SubmissionStatus;
  submittedAt: Date;
}

export interface DomainTeacherFeedback {
  id: string;
  submissionId: string;
  teacherId: string;
  score: number; // 0-100
  parentVisibleFeedback: string;
  internalTeacherNotes?: string | null;
  createdAt: Date;
}
