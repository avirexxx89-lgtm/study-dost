import { RevisionScheduleItem } from '../types';

/**
 * Standard spaced repetition intervals in days (Ebbinghaus forgetting curve):
 * Day 1, Day 3, Day 7, Day 21, Day 45
 */
export const SPACED_INTERVALS = [1, 3, 7, 21, 45];

export function generateSpacedRepetitionDates(
  chapterId: string,
  chapterTitle: string,
  subjectTitle: string,
  startDateStr: string // YYYY-MM-DD
): RevisionScheduleItem[] {
  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) {
    return [];
  }

  return SPACED_INTERVALS.map((days, idx) => {
    const revDate = new Date(startDate);
    revDate.setDate(revDate.getDate() + days);
    const dateStr = revDate.toISOString().split('T')[0];

    return {
      id: `${chapterId}-rev-${idx + 1}-${dateStr}`,
      chapterId,
      chapterTitle,
      subjectTitle,
      scheduledDate: dateStr,
      intervalStep: idx + 1,
      completed: false,
    };
  });
}

export function calculateDaysRemaining(targetDateStr: string, fromDateStr?: string): number {
  const from = fromDateStr ? new Date(fromDateStr) : new Date();
  from.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - from.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateStreak(
  currentStreak: number,
  lastActiveDateStr: string,
  todayDateStr: string
): number {
  if (!lastActiveDateStr) {
    return 1;
  }
  if (lastActiveDateStr === todayDateStr) {
    return currentStreak;
  }

  const last = new Date(lastActiveDateStr);
  last.setHours(0, 0, 0, 0);
  const today = new Date(todayDateStr);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day
    return currentStreak + 1;
  } else if (diffDays > 1) {
    // Missed a day
    return 1;
  }
  return currentStreak;
}
