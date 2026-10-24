import { PYQQuestion } from '../types';

export interface ScoreCalculationInput {
  questions: PYQQuestion[];
  answers: Record<string, number>; // questionId -> selectedOptionIndex (-1 or undefined means skipped)
  marksPerCorrect?: number;
  negativeMarkingPerWrong?: number;
}

export interface ScoreSummary {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  maxScore: number;
  accuracyPercentage: number;
  percentageScore: number;
}

export function calculateTestScore(input: ScoreCalculationInput): ScoreSummary {
  const {
    questions,
    answers,
    marksPerCorrect = 4,
    negativeMarkingPerWrong = 1,
  } = input;

  let correct = 0;
  let incorrect = 0;
  let skipped = 0;

  for (const q of questions) {
    const selected = answers[q.id];
    if (selected === undefined || selected === -1) {
      skipped++;
    } else if (selected === q.correctOptionIndex) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const attempted = correct + incorrect;
  const rawScore = (correct * marksPerCorrect) - (incorrect * negativeMarkingPerWrong);
  // Negative scores are mathematically possible in competitive exams (e.g. JEE/NEET)
  const score = Math.round(rawScore * 100) / 100;
  const maxScore = questions.length * marksPerCorrect;
  const accuracyPercentage = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const percentageScore = maxScore > 0 ? Math.max(0, Math.round((score / maxScore) * 100)) : 0;

  return {
    totalQuestions: questions.length,
    attempted,
    correct,
    incorrect,
    skipped,
    score,
    maxScore,
    accuracyPercentage,
    percentageScore,
  };
}

export function getPerformanceBadge(accuracyPercentage: number): {
  labelEn: string;
  labelHi: string;
  color: string;
} {
  if (accuracyPercentage >= 85) {
    return { labelEn: 'Mastery Level', labelHi: 'उत्कृष्ट स्तर (Mastery)', color: 'emerald' };
  }
  if (accuracyPercentage >= 70) {
    return { labelEn: 'Proficient', labelHi: 'कुशल (Proficient)', color: 'blue' };
  }
  if (accuracyPercentage >= 50) {
    return { labelEn: 'Developing', labelHi: 'प्रगति पर (Developing)', color: 'amber' };
  }
  return { labelEn: 'Needs Revision', labelHi: 'पुनरावृत्ति आवश्यक (Needs Revision)', color: 'rose' };
}
