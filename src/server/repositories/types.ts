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
  gender?: string;
  nationality?: string;
  nativeLanguage: string;
  ageGroup: AgeGroup;
  notesInternal?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainParentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emergencyContactName?: string;
  emergencyPhone?: string;
  billingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DomainTeacherProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bioEn?: string;
  bioAr?: string;
  qualifications?: string;
  certifications?: string;
  experienceYears: number;
  hourlyRateMinorUnits: number;
  languagesSpoken?: string;
  isActive: boolean;
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
  descriptionEn?: string;
  descriptionAr?: string;
  iconName?: string;
}

export interface DomainCourse {
  id: string;
  programId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
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
  assignedAt: Date;
}

export interface DomainClassSession {
  id: string;
  classGroupId: string;
  teacherId: string;
  startTimeUtc: Date;
  endTimeUtc: Date;
  status: SessionStatus;
  meetingUrl?: string;
  recordingUrl?: string;
}

export interface DomainAttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  recordedAt: Date;
}

export interface DomainAssignment {
  id: string;
  classGroupId: string;
  titleEn: string;
  titleAr: string;
  instructions: string;
  voicePromptUrl?: string;
  dueDateUtc: Date;
  createdAt: Date;
}

export interface DomainAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  audioUrl?: string;
  textContent?: string;
  status: SubmissionStatus;
  submittedAt: Date;
}

export interface DomainTeacherFeedback {
  id: string;
  submissionId: string;
  teacherId: string;
  score: number; // 0-100
  parentVisibleFeedback: string;
  internalTeacherNotes?: string;
  createdAt: Date;
}
