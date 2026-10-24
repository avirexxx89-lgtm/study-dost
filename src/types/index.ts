export type Language = 'en' | 'hi';

export type ExamCategory = 
  | 'school_boards'
  | 'engineering'
  | 'medical'
  | 'civil_services'
  | 'ssc'
  | 'banking_railway'
  | 'defence'
  | 'state_psc'
  | 'teaching'
  | 'custom';

export interface ExamInfo {
  id: string;
  nameEn: string;
  nameHi: string;
  category: ExamCategory;
  conductingBody: string;
  officialWebsite: string;
  descriptionEn: string;
  descriptionHi: string;
  standardSubjects: string[];
  isCustom?: boolean;
  createdBy?: string;
}

export interface Subject {
  id: string;
  examId: string;
  nameEn: string;
  nameHi: string;
  order: number;
  totalChapters: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  examId: string;
  nameEn: string;
  nameHi: string;
  order: number;
  selectedForStudy: boolean;
  estimatedHours: number;
  completedHours: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'revision_needed';
  highYieldWeightage?: 'High' | 'Medium' | 'Low';
  keyFormulas?: string[];
  summaryEn?: string;
  summaryHi?: string;
}

export interface DailyGoal {
  id: string;
  titleEn: string;
  titleHi: string;
  targetMinutes: number;
  completedMinutes: number;
  completed: boolean;
  chapterId?: string;
  date: string; // YYYY-MM-DD
}

export interface RevisionScheduleItem {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subjectTitle: string;
  scheduledDate: string; // YYYY-MM-DD
  intervalStep: number; // e.g. Day 1, Day 3, Day 7, Day 21 (spaced repetition)
  completed: boolean;
}

export interface ExamDeadline {
  id: string;
  examId: string;
  examName: string;
  targetDate: string; // YYYY-MM-DD
  isOfficialDate: boolean;
  shiftOrNote?: string;
}

export type QuestionVerificationStatus = 
  | 'verified_official'
  | 'provisional_key'
  | 'community_reviewed'
  | 'model_sample';

export type DistributionRightsStatus = 
  | 'public_domain_gov'
  | 'fair_use_educational'
  | 'official_source_link_only';

export interface PYQQuestion {
  id: string;
  examId: string;
  year: number; // e.g., 2021, 2022, 2023, 2024, 2025, 2026
  paperName: string; // e.g., 'Paper 1 - GS', 'Shift 1 - Jan 27'
  shift?: string;
  subject: string;
  chapter: string;
  topic?: string;
  
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOptionIndex: number;
  explanationEn: string;
  explanationHi: string;
  
  // Authenticity & Verification
  verificationStatus: QuestionVerificationStatus;
  originalSource: string; // e.g. "NTA JEE Main 2024 Jan 27 Shift 1 Q.14"
  officialSourceUrl?: string;
  rightsStatus: DistributionRightsStatus;
  isDemoSample?: boolean;
  
  // User metadata (local or firestore synced)
  bookmarked?: boolean;
  userAttemptsCount?: number;
  lastAttemptCorrect?: boolean;
}

export interface MistakeNotebookItem {
  id: string;
  userId: string;
  questionId: string;
  question: PYQQuestion;
  selectedOptionIndex: number;
  mistakeReason: 'conceptual_error' | 'calculation_error' | 'misread_question' | 'ran_out_of_time' | 'guessed';
  userNotes: string;
  createdAt: string;
  resolved: boolean;
  reviewCount: number;
}

export interface MockTestConfig {
  id: string;
  title: string;
  examId: string;
  durationMinutes: number;
  negativeMarkingPerWrong: number; // e.g., 1 (for +4/-1) or 0.66 (for +2/-0.66)
  marksPerCorrect: number; // e.g., 4 or 2
  questions: PYQQuestion[];
}

export interface TestAttemptResult {
  id: string;
  userId: string;
  testTitle: string;
  examId: string;
  completedAt: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  maxScore: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
}

export interface TutorChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestedFollowups?: string[];
  modelUsed?: string;
  isFallback?: boolean;
}

export interface UserStudyProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  selectedExamIds: string[];
  primaryExamId: string;
  targetYear: number;
  dailyStudyTargetMinutes: number;
  languagePreference: Language;
  streakDays: number;
  lastActiveDate: string;
  isAdmin?: boolean;
}
