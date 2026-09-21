import {
  roadmapRepository,
  StudentQuestProgress,
  QuestNode,
} from "../repositories/RoadmapRepository";
import { gamificationService } from "./GamificationService";
import { certificateService } from "./CertificateService";

export interface NodeCompletionResult {
  updatedProgress: StudentQuestProgress;
  xpAwarded: number;
  newTotalXp: number;
  completedNode: QuestNode;
}

export class RoadmapService {
  async getStudentRoadmap(studentId: string): Promise<StudentQuestProgress> {
    return roadmapRepository.getStudentProgress(studentId);
  }

  async completeNodeAndAward(params: {
    studentId: string;
    nodeId: string;
    starsEarned: number;
  }): Promise<NodeCompletionResult> {
    const currentProgress = await roadmapRepository.getStudentProgress(params.studentId);
    const node = currentProgress.nodes.find((n) => n.id === params.nodeId);

    if (!node) {
      throw new Error(`Quest node not found: ${params.nodeId}`);
    }

    const updatedProgress = await roadmapRepository.completeNode(
      params.studentId,
      params.nodeId,
      params.starsEarned
    );

    const xpAwarded = node.xpReward;
    const newTotalXp = await gamificationService.awardXp(
      params.studentId,
      xpAwarded,
      `إتمام محطة مسار التعلم: ${node.titleAr}`
    );

    // Issues a real certificate the moment this completes the last node --
    // a no-op for every other node, and a no-op if one was already issued.
    await certificateService.issueRoadmapCompletionCertificateIfEligible(params.studentId);

    const completedNode = updatedProgress.nodes.find((n) => n.id === params.nodeId) ?? {
      ...node,
      status: "COMPLETED" as const,
      starsEarned: params.starsEarned,
    };

    return {
      updatedProgress,
      xpAwarded,
      newTotalXp,
      completedNode,
    };
  }

  async claimMilestoneChest(params: {
    studentId: string;
    chestId: string;
  }): Promise<{
    chestTitleAr: string;
    xpBonusAwarded: number;
    newTotalXp: number;
  }> {
    const progress = await roadmapRepository.getStudentProgress(params.studentId);
    const chest = progress.chests.find((c) => c.id === params.chestId);

    if (!chest) {
      throw new Error(`Milestone chest not found: ${params.chestId}`);
    }

    if (!chest.isUnlocked) {
      throw new Error(`Chest requires ${chest.requiredStars} stars to unlock.`);
    }

    const newTotalXp = await gamificationService.awardXp(
      params.studentId,
      chest.xpBonus,
      `فتح صندوق كنز الإنجاز: ${chest.titleAr}`
    );

    return {
      chestTitleAr: chest.titleAr,
      xpBonusAwarded: chest.xpBonus,
      newTotalXp,
    };
  }
}

export const roadmapService = new RoadmapService();
