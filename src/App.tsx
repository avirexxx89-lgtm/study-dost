/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CustomPlanView } from './components/CustomPlanView';
import { PYQLibraryView } from './components/PYQLibraryView';
import { MockTestView } from './components/MockTestView';
import { MistakeNotebookView } from './components/MistakeNotebookView';
import { ChapterNotesView } from './components/ChapterNotesView';
import { AITutorView } from './components/AITutorView';
import { AdminHubView } from './components/AdminHubView';
import { SetupGuideModal } from './components/SetupGuideModal';
import { AuthModal } from './components/AuthModal';

import { 
  Language, 
  UserStudyProfile, 
  ExamInfo, 
  Subject, 
  Chapter, 
  DailyGoal, 
  RevisionScheduleItem, 
  ExamDeadline, 
  PYQQuestion, 
  MistakeNotebookItem, 
  TestAttemptResult,
  QuestionVerificationStatus 
} from './types';
import { OFFICIAL_EXAMS } from './data/exams';
import { INITIAL_SUBJECTS, INITIAL_CHAPTERS } from './data/initialSubjects';
import { INITIAL_PYQS } from './data/samplePYQs';
import { calculateStreak } from './utils/schedule';
import { isFirebaseConfigured, syncUserProfileToCloud, saveMistakeToCloud, saveTestAttemptToCloud } from './services/firebase';

const STORAGE_KEYS = {
  PROFILE: 'studydost_profile_v1',
  EXAMS: 'studydost_custom_exams_v1',
  SUBJECTS: 'studydost_subjects_v1',
  CHAPTERS: 'studydost_chapters_v1',
  GOALS: 'studydost_goals_v1',
  REVISIONS: 'studydost_revisions_v1',
  DEADLINES: 'studydost_deadlines_v1',
  PYQS: 'studydost_pyqs_v1',
  MISTAKES: 'studydost_mistakes_v1',
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  // 1. User Profile State
  const [userProfile, setUserProfile] = useState<UserStudyProfile>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return {
      uid: 'guest-local-user',
      email: null,
      displayName: 'Aspirant',
      selectedExamIds: ['jee_main', 'cbse_class_12_science'],
      primaryExamId: 'jee_main',
      targetYear: 2026,
      dailyStudyTargetMinutes: 180,
      languagePreference: 'en',
      streakDays: 4,
      lastActiveDate: new Date().toISOString().split('T')[0],
      isAdmin: true, // Authorized admin in development/demo
    };
  });

  // 2. All Exams (Official + Custom)
  const [allExams, setAllExams] = useState<ExamInfo[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (cached) {
      try {
        const custom: ExamInfo[] = JSON.parse(cached);
        return [...OFFICIAL_EXAMS, ...custom];
      } catch (e) {}
    }
    return OFFICIAL_EXAMS;
  });

  // 3. Subjects & Chapters
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return INITIAL_SUBJECTS;
  });

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return INITIAL_CHAPTERS;
  });

  // 4. Daily Goals
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      {
        id: 'goal-1',
        titleEn: 'Solve 10 Kinematics & Projectile PYQs',
        titleHi: 'गतिकी एवं प्रक्षेप्य गति के 10 PYQ हल करें',
        targetMinutes: 45,
        completedMinutes: 45,
        completed: true,
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: 'goal-2',
        titleEn: 'Review Chemical Bonding VSEPR notes',
        titleHi: 'रासायनिक आबंधन के VSEPR नोट्स का रिवीजन करें',
        targetMinutes: 40,
        completedMinutes: 20,
        completed: false,
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: 'goal-3',
        titleEn: 'Read UPSC / Current Affairs monthly brief',
        titleHi: 'करेंट अफेयर्स मासिक सारांश पढ़ें',
        targetMinutes: 30,
        completedMinutes: 0,
        completed: false,
        date: new Date().toISOString().split('T')[0],
      }
    ];
  });

  // 5. Revision Spaced Repetition Schedule
  const [revisionSchedule, setRevisionSchedule] = useState<RevisionScheduleItem[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.REVISIONS);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'rev-item-1',
        chapterId: 'ch-jee-phy-2',
        chapterTitle: 'Laws of Motion & Friction',
        subjectTitle: 'Physics',
        scheduledDate: todayStr,
        intervalStep: 3,
        completed: false,
      },
      {
        id: 'rev-item-2',
        chapterId: 'ch-jee-chem-1',
        chapterTitle: 'Chemical Bonding & MOT',
        subjectTitle: 'Chemistry',
        scheduledDate: todayStr,
        intervalStep: 7,
        completed: false,
      }
    ];
  });

  // 6. Exam Deadlines
  const [examDeadlines, setExamDeadlines] = useState<ExamDeadline[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.DEADLINES);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { id: 'dl-jee-2027', examId: 'jee_main', examName: 'JEE Main 2027 Session 1', targetDate: '2027-01-24', isOfficialDate: true, shiftOrNote: 'Tentative official schedule' },
      { id: 'dl-cbse-2027', examId: 'cbse_class_10', examName: 'Class 10 Board Exam', targetDate: '2027-02-15', isOfficialDate: true, shiftOrNote: 'CBSE Annual Secondary' },
      { id: 'dl-neet-2027', examId: 'neet_ug', examName: 'NEET UG 2027', targetDate: '2027-05-02', isOfficialDate: true, shiftOrNote: 'First Sunday of May' },
      { id: 'dl-upsc-2027', examId: 'upsc_prelims', examName: 'UPSC CSE Prelims 2027', targetDate: '2027-05-23', isOfficialDate: true, shiftOrNote: 'Annual UPSC Calendar' },
    ];
  });

  // 7. PYQ Questions
  const [questions, setQuestions] = useState<PYQQuestion[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.PYQS);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return INITIAL_PYQS;
  });

  // 8. Mistake Notebook Items (Galti Diary)
  const [mistakes, setMistakes] = useState<MistakeNotebookItem[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      {
        id: 'mistake-init-1',
        userId: userProfile.uid,
        questionId: 'pyq-jee-2022-p2',
        question: INITIAL_PYQS.find(q => q.id === 'pyq-jee-2022-p2') || INITIAL_PYQS[0],
        selectedOptionIndex: 0,
        mistakeReason: 'conceptual_error',
        userNotes: 'I forgot that static friction is self-adjusting when applied force F < f_max!',
        createdAt: new Date().toISOString(),
        resolved: false,
        reviewCount: 1,
      }
    ];
  });

  // Local storage persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisionSchedule));
  }, [revisionSchedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(examDeadlines));
  }, [examDeadlines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PYQS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  }, [mistakes]);

  // Update streak on mount
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newStreak = calculateStreak(userProfile.streakDays, userProfile.lastActiveDate, todayStr);
    if (newStreak !== userProfile.streakDays || userProfile.lastActiveDate !== todayStr) {
      setUserProfile(prev => ({
        ...prev,
        streakDays: newStreak,
        lastActiveDate: todayStr,
      }));
    }
  }, []);

  // Handlers for Custom Plan & Chapters
  const handleToggleExamSelection = (examId: string) => {
    setUserProfile(prev => {
      const exists = prev.selectedExamIds.includes(examId);
      const updated = exists 
        ? prev.selectedExamIds.filter(id => id !== examId) 
        : [...prev.selectedExamIds, examId];
      const newPrimary = !exists && prev.selectedExamIds.length === 0 
        ? examId 
        : (exists && prev.primaryExamId === examId ? updated[0] || 'jee_main' : prev.primaryExamId);

      const newProfile = {
        ...prev,
        selectedExamIds: updated.length > 0 ? updated : [examId],
        primaryExamId: newPrimary,
      };
      syncUserProfileToCloud(newProfile).catch(() => {});
      return newProfile;
    });
  };

  const handleSetPrimaryExam = (examId: string) => {
    setUserProfile(prev => {
      const newProfile = { ...prev, primaryExamId: examId };
      syncUserProfileToCloud(newProfile).catch(() => {});
      return newProfile;
    });
  };

  const handleAddCustomExam = (exam: ExamInfo) => {
    setAllExams(prev => [...prev, exam]);
    const customExamsOnly = [...allExams.filter(e => e.isCustom), exam];
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(customExamsOnly));

    // Also enroll user in this exam
    handleToggleExamSelection(exam.id);

    // Add standard subjects for this exam
    const newSubjs: Subject[] = exam.standardSubjects.map((name, idx) => ({
      id: `subj-${exam.id}-${idx + 1}`,
      examId: exam.id,
      nameEn: name,
      nameHi: name,
      order: idx + 1,
      totalChapters: 0,
    }));
    setSubjects(prev => [...prev, ...newSubjs]);
  };

  const handleAddSubject = (examId: string, nameEn: string, nameHi: string) => {
    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      examId,
      nameEn,
      nameHi,
      order: subjects.filter(s => s.examId === examId).length + 1,
      totalChapters: 0,
    };
    setSubjects(prev => [...prev, newSubj]);
  };

  const handleEditSubject = (subjectId: string, nameEn: string, nameHi: string) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, nameEn, nameHi } : s));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setChapters(prev => prev.filter(c => c.subjectId !== subjectId));
  };

  const handleReorderSubjects = (reordered: Subject[]) => {
    setSubjects(prev => {
      const other = prev.filter(s => !reordered.some(r => r.id === s.id));
      return [...other, ...reordered];
    });
  };

  const handleAddChapter = (subjectId: string, examId: string, nameEn: string, nameHi: string, hours: number) => {
    const newChap: Chapter = {
      id: `ch-${Date.now()}`,
      subjectId,
      examId,
      nameEn,
      nameHi,
      order: chapters.filter(c => c.subjectId === subjectId).length + 1,
      selectedForStudy: true,
      estimatedHours: hours,
      completedHours: 0,
      status: 'not_started',
      summaryEn: `Foundational concepts and practice for ${nameEn}.`,
      summaryHi: `${nameHi} के लिए अध्ययन सारांश।`,
    };
    setChapters(prev => [...prev, newChap]);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setChapters(prev => prev.map(c => c.id === chapter.id ? chapter : c));
  };

  const handleDeleteChapter = (chapterId: string) => {
    setChapters(prev => prev.filter(c => c.id !== chapterId));
  };

  const handleToggleChapterSelection = (chapterId: string) => {
    setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, selectedForStudy: !c.selectedForStudy } : c));
  };

  const handleUpdateChapterStatus = (chapterId: string, status: Chapter['status']) => {
    setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, status } : c));
  };

  // Deadlines
  const handleAddDeadline = (examId: string, examName: string, targetDate: string) => {
    const newDl: ExamDeadline = {
      id: `deadline-${Date.now()}`,
      examId,
      examName,
      targetDate,
      isOfficialDate: false,
    };
    setExamDeadlines(prev => [...prev, newDl]);
  };

  const handleDeleteDeadline = (id: string) => {
    setExamDeadlines(prev => prev.filter(d => d.id !== id));
  };

  // Daily goals
  const handleToggleGoal = (id: string) => {
    setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleAddGoal = (titleEn: string, titleHi: string, minutes: number) => {
    const newGoal: DailyGoal = {
      id: `goal-${Date.now()}`,
      titleEn,
      titleHi,
      targetMinutes: minutes,
      completedMinutes: 0,
      completed: false,
      date: new Date().toISOString().split('T')[0],
    };
    setDailyGoals(prev => [newGoal, ...prev]);
  };

  // Revision schedules
  const handleCompleteRevision = (id: string) => {
    setRevisionSchedule(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
  };

  const handleAddRevisionSchedule = (items: RevisionScheduleItem[]) => {
    setRevisionSchedule(prev => [...prev, ...items]);
  };

  // Bookmarking PYQ
  const handleToggleBookmark = (questionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, bookmarked: !q.bookmarked } : q));
  };

  // Add to Mistake Notebook
  const handleAddToMistakes = (
    question: PYQQuestion,
    selectedOption: number,
    reason: MistakeNotebookItem['mistakeReason'],
    notes: string
  ) => {
    const newEntry: MistakeNotebookItem = {
      id: `mistake-${Date.now()}`,
      userId: userProfile.uid,
      questionId: question.id,
      question,
      selectedOptionIndex: selectedOption,
      mistakeReason: reason,
      userNotes: notes,
      createdAt: new Date().toISOString(),
      resolved: false,
      reviewCount: 0,
    };
    setMistakes(prev => [newEntry, ...prev]);
    saveMistakeToCloud(newEntry).catch(() => {});
  };

  // Save mock test attempt
  const handleSaveTestAttempt = (attempt: TestAttemptResult) => {
    saveTestAttemptToCloud(attempt).catch(() => {});
  };

  // Admin imports & questions management
  const handleImportQuestions = (newBatch: PYQQuestion[]) => {
    setQuestions(prev => [...newBatch, ...prev]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleUpdateQuestionStatus = (id: string, status: QuestionVerificationStatus) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, verificationStatus: status } : q));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
        userProfile={userProfile}
        isFirebaseActive={isFirebaseConfigured()}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenSetupGuide={() => setShowSetupGuide(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            language={language}
            userProfile={userProfile}
            allExams={allExams}
            subjects={subjects}
            chapters={chapters}
            dailyGoals={dailyGoals}
            onToggleGoal={handleToggleGoal}
            onAddGoal={handleAddGoal}
            revisionSchedule={revisionSchedule}
            onCompleteRevision={handleCompleteRevision}
            examDeadlines={examDeadlines}
            mistakeCount={mistakes.filter(m => !m.resolved).length}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'plan' && (
          <CustomPlanView
            language={language}
            userProfile={userProfile}
            allExams={allExams}
            subjects={subjects}
            chapters={chapters}
            examDeadlines={examDeadlines}
            onToggleExamSelection={handleToggleExamSelection}
            onSetPrimaryExam={handleSetPrimaryExam}
            onAddCustomExam={handleAddCustomExam}
            onAddSubject={handleAddSubject}
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
            onReorderSubjects={handleReorderSubjects}
            onAddChapter={handleAddChapter}
            onEditChapter={handleEditChapter}
            onDeleteChapter={handleDeleteChapter}
            onToggleChapterSelection={handleToggleChapterSelection}
            onUpdateChapterStatus={handleUpdateChapterStatus}
            onAddDeadline={handleAddDeadline}
            onDeleteDeadline={handleDeleteDeadline}
            onAddRevisionSchedule={handleAddRevisionSchedule}
          />
        )}

        {currentTab === 'pyq' && (
          <PYQLibraryView
            language={language}
            questions={questions}
            allExams={allExams}
            primaryExamId={userProfile.primaryExamId}
            onToggleBookmark={handleToggleBookmark}
            onAddToMistakes={handleAddToMistakes}
            onOpenAdminPortal={() => setCurrentTab('admin')}
          />
        )}

        {currentTab === 'notes' && (
          <ChapterNotesView
            language={language}
            allExams={allExams}
            primaryExamId={userProfile.primaryExamId}
            subjects={subjects}
            chapters={chapters}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'mock' && (
          <MockTestView
            language={language}
            questions={questions}
            allExams={allExams}
            primaryExamId={userProfile.primaryExamId}
            onSaveTestAttempt={handleSaveTestAttempt}
            onAddToMistakes={handleAddToMistakes}
          />
        )}

        {currentTab === 'mistakes' && (
          <MistakeNotebookView
            language={language}
            mistakes={mistakes}
            onToggleResolved={(id) => setMistakes(prev => prev.map(m => m.id === id ? { ...m, resolved: !m.resolved } : m))}
            onDeleteMistake={(id) => setMistakes(prev => prev.filter(m => m.id !== id))}
            onUpdateNotes={(id, notes) => setMistakes(prev => prev.map(m => m.id === id ? { ...m, userNotes: notes } : m))}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'tutor' && (
          <AITutorView
            language={language}
            userProfile={userProfile}
            allExams={allExams}
          />
        )}

        {currentTab === 'admin' && (
          <AdminHubView
            language={language}
            userProfile={userProfile}
            allExams={allExams}
            questions={questions}
            onImportQuestions={handleImportQuestions}
            onDeleteQuestion={handleDeleteQuestion}
            onUpdateQuestionStatus={handleUpdateQuestionStatus}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Study Dost AI (स्टडी दोस्त AI)</span>
            <span>•</span>
            <span>Empowering Indian Aspirants across JEE, NEET, UPSC, SSC, Banking, & Boards</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSetupGuide(true)} 
              className="text-amber-700 hover:underline font-semibold"
            >
              Backend Docs & Security Checklist
            </button>
            <span>•</span>
            <span>Free Tier Compatible</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          language={language}
          userProfile={userProfile}
          isFirebaseActive={isFirebaseConfigured()}
          onUpdateProfile={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showSetupGuide && (
        <SetupGuideModal
          language={language}
          onClose={() => setShowSetupGuide(false)}
        />
      )}
    </div>
  );
}
