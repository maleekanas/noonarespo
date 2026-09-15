import { DomainClassSession } from "./types";
import { SessionStatus } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

/**
 * Prisma-backed repository for class sessions (the actual scheduled video
 * meeting for a class group). Previously in-memory, seeded with fixed
 * demo class-group/teacher ids that never matched a real, now-Prisma-backed
 * class group or teacher -- a session an admin scheduled for a real class
 * would never actually attach to it correctly, and disappeared on every
 * serverless cold start regardless.
 */
class SchedulingRepository {
  async getAllSessions(): Promise<DomainClassSession[]> {
    return prisma.classSession.findMany({ orderBy: { startTimeUtc: "asc" } });
  }

  async getSessionById(id: string): Promise<DomainClassSession | null> {
    return prisma.classSession.findUnique({ where: { id } });
  }

  async getSessionsByTeacherId(teacherId: string): Promise<DomainClassSession[]> {
    return prisma.classSession.findMany({ where: { teacherId }, orderBy: { startTimeUtc: "asc" } });
  }

  async getSessionsByClassGroupId(classGroupId: string): Promise<DomainClassSession[]> {
    return prisma.classSession.findMany({ where: { classGroupId }, orderBy: { startTimeUtc: "asc" } });
  }

  async findOverlappingTeacherSessions(
    teacherId: string,
    startTimeUtc: Date,
    endTimeUtc: Date,
    excludeSessionId?: string
  ): Promise<DomainClassSession[]> {
    return prisma.classSession.findMany({
      where: {
        teacherId,
        status: { not: SessionStatus.CANCELLED },
        id: excludeSessionId ? { not: excludeSessionId } : undefined,
        // Overlap condition: startA < endB && endA > startB
        startTimeUtc: { lt: endTimeUtc },
        endTimeUtc: { gt: startTimeUtc },
      },
    });
  }

  async createSession(data: {
    classGroupId: string;
    teacherId: string;
    startTimeUtc: Date;
    endTimeUtc: Date;
    meetingUrl?: string;
  }): Promise<DomainClassSession> {
    return prisma.classSession.create({
      data: {
        classGroupId: data.classGroupId,
        teacherId: data.teacherId,
        startTimeUtc: data.startTimeUtc,
        endTimeUtc: data.endTimeUtc,
        status: SessionStatus.SCHEDULED,
        meetingUrl: data.meetingUrl || `https://meet.kidsarabicacademy.internal/room/${data.classGroupId}`,
      },
    });
  }

  async updateSessionStatus(id: string, status: SessionStatus): Promise<DomainClassSession | null> {
    try {
      return await prisma.classSession.update({ where: { id }, data: { status } });
    } catch {
      return null;
    }
  }
}

export const schedulingRepository = new SchedulingRepository();
