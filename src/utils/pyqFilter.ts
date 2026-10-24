import { PYQQuestion, QuestionVerificationStatus } from '../types';

export interface PYQFilterOptions {
  examId?: string;
  year?: number | 'all' | 'historical' | '2026';
  paperName?: string;
  shift?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  verificationStatus?: QuestionVerificationStatus | 'all';
  searchQuery?: string;
  bookmarkedOnly?: boolean;
}

export function filterPYQs(questions: PYQQuestion[], options: PYQFilterOptions): PYQQuestion[] {
  return questions.filter((q) => {
    // Exam filter
    if (options.examId && options.examId !== 'all' && q.examId !== options.examId) {
      return false;
    }

    // Year filter (historical 2021-2025 vs separate 2026)
    if (options.year !== undefined && options.year !== 'all') {
      if (options.year === 'historical') {
        if (q.year < 2021 || q.year > 2025) return false;
      } else if (options.year === '2026') {
        if (q.year !== 2026) return false;
      } else if (typeof options.year === 'number') {
        if (q.year !== options.year) return false;
      }
    }

    // Paper / Shift
    if (options.paperName && options.paperName !== 'all' && q.paperName !== options.paperName) {
      return false;
    }
    if (options.shift && options.shift !== 'all' && q.shift !== options.shift) {
      return false;
    }

    // Subject
    if (options.subject && options.subject !== 'all' && q.subject.toLowerCase() !== options.subject.toLowerCase()) {
      return false;
    }

    // Chapter
    if (options.chapter && options.chapter !== 'all' && q.chapter.toLowerCase() !== options.chapter.toLowerCase()) {
      return false;
    }

    // Topic
    if (options.topic && options.topic !== 'all' && q.topic?.toLowerCase() !== options.topic.toLowerCase()) {
      return false;
    }

    // Verification status
    if (options.verificationStatus && options.verificationStatus !== 'all' && q.verificationStatus !== options.verificationStatus) {
      return false;
    }

    // Bookmarked only
    if (options.bookmarkedOnly && !q.bookmarked) {
      return false;
    }

    // Search query in English or Hindi text or source
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const term = options.searchQuery.toLowerCase().trim();
      const inQuestionEn = q.questionEn.toLowerCase().includes(term);
      const inQuestionHi = q.questionHi.toLowerCase().includes(term);
      const inSource = q.originalSource.toLowerCase().includes(term);
      const inSubject = q.subject.toLowerCase().includes(term);
      const inChapter = q.chapter.toLowerCase().includes(term);
      const inOptions = q.optionsEn.some(opt => opt.toLowerCase().includes(term)) ||
                        q.optionsHi.some(opt => opt.toLowerCase().includes(term));
      if (!inQuestionEn && !inQuestionHi && !inSource && !inSubject && !inChapter && !inOptions) {
        return false;
      }
    }

    return true;
  });
}

export function getPYQYearBreakdown(questions: PYQQuestion[]): {
  historicalCount: number;
  year2026Count: number;
  byYear: Record<number, number>;
  verifiedCount: number;
} {
  let historicalCount = 0;
  let year2026Count = 0;
  let verifiedCount = 0;
  const byYear: Record<number, number> = {};

  for (const q of questions) {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
    if (q.year >= 2021 && q.year <= 2025) {
      historicalCount++;
    } else if (q.year === 2026) {
      year2026Count++;
    }
    if (q.verificationStatus === 'verified_official') {
      verifiedCount++;
    }
  }

  return {
    historicalCount,
    year2026Count,
    byYear,
    verifiedCount,
  };
}
