import React from "react";
import { notFound } from "next/navigation";
import { requireStudentProfile } from "@/lib/auth/currentUser";
import { assessmentBankRepository } from "@/server/repositories/AssessmentBankRepository";
import { AssessmentExamRunner } from "@/components/assessments/AssessmentExamRunner";

export default async function StudentAssessmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireStudentProfile(locale);

  const assessment = await assessmentBankRepository.getAssessmentById(id);
  if (!assessment) {
    notFound();
  }

  const questions = await assessmentBankRepository.getQuestionsByIds(assessment.questionIds);

  const mappedQuestions = questions.map((q) => ({
    id: q.id,
    type: q.type,
    titleAr: q.titleAr,
    titleEn: q.titleEn,
    promptAr: q.promptAr,
    promptEn: q.promptEn,
    options: q.options,
    correctAnswer: q.correctAnswer,
    points: q.points,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AssessmentExamRunner
        locale={locale}
        assessmentId={assessment.id}
        titleAr={assessment.titleAr}
        titleEn={assessment.titleEn}
        durationMinutes={assessment.durationMinutes}
        questions={mappedQuestions}
      />
    </div>
  );
}
