import React, { useState } from 'react';
import { 
  Flame, 
  Target, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Plus, 
  AlertCircle, 
  Sparkles,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import { 
  Language, 
  UserStudyProfile, 
  ExamInfo, 
  Subject, 
  Chapter, 
  DailyGoal, 
  RevisionScheduleItem, 
  ExamDeadline 
} from '../types';
import { calculateDaysRemaining } from '../utils/schedule';

interface DashboardViewProps {
  language: Language;
  userProfile: UserStudyProfile;
  allExams: ExamInfo[];
  subjects: Subject[];
  chapters: Chapter[];
  dailyGoals: DailyGoal[];
  onToggleGoal: (id: string) => void;
  onAddGoal: (titleEn: string, titleHi: string, minutes: number) => void;
  revisionSchedule: RevisionScheduleItem[];
  onCompleteRevision: (id: string) => void;
  examDeadlines: ExamDeadline[];
  mistakeCount: number;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  userProfile,
  allExams,
  subjects,
  chapters,
  dailyGoals,
  onToggleGoal,
  onAddGoal,
  revisionSchedule,
  onCompleteRevision,
  examDeadlines,
  mistakeCount,
  onNavigateTab,
}) => {
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalMinutes, setNewGoalMinutes] = useState(45);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const primaryExam = allExams.find(e => e.id === userProfile.primaryExamId) || allExams[0];
  const selectedChapters = chapters.filter(c => c.selectedForStudy);
  const completedChapters = selectedChapters.filter(c => c.status === 'completed');
  const progressPercent = selectedChapters.length > 0 
    ? Math.round((completedChapters.length / selectedChapters.length) * 100) 
    : 0;

  const totalTargetHours = selectedChapters.reduce((acc, c) => acc + c.estimatedHours, 0);
  const totalCompletedHours = selectedChapters.reduce((acc, c) => acc + c.completedHours, 0);

  // Today's goals progress
  const completedGoalsCount = dailyGoals.filter(g => g.completed).length;
  const goalProgressPercent = dailyGoals.length > 0 
    ? Math.round((completedGoalsCount / dailyGoals.length) * 100) 
    : 0;

  // Primary deadline
  const mainDeadline = examDeadlines.find(d => d.examId === userProfile.primaryExamId) || examDeadlines[0];
  const daysLeft = mainDeadline ? calculateDaysRemaining(mainDeadline.targetDate) : 0;

  // Due revisions
  const todayStr = new Date().toISOString().split('T')[0];
  const dueRevisions = revisionSchedule.filter(r => !r.completed && r.scheduledDate <= todayStr);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    onAddGoal(newGoalText.trim(), newGoalText.trim(), newGoalMinutes);
    setNewGoalText('');
    setShowAddGoalModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold mb-3 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {language === 'hi' ? 'आपका अध्ययन साथी' : 'Your Personal Study Companion'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'hi' 
              ? `नमस्ते, ${userProfile.displayName || 'साथी'}! 🎯`
              : `Welcome Back, ${userProfile.displayName || 'Aspirant'}! 🎯`}
          </h1>

          <p className="mt-2 text-slate-200 text-sm sm:text-base leading-relaxed">
            {language === 'hi'
              ? `आप ${primaryExam.nameHi} की तैयारी कर रहे हैं। आपके चुने हुए ${selectedChapters.length} अध्यायों में से ${completedChapters.length} पूर्ण हो चुके हैं। निरंतर अभ्यास ही सफलता की कुंजी है!`
              : `Focusing on ${primaryExam.nameEn}. You have completed ${completedChapters.length} of your ${selectedChapters.length} chosen focus chapters. Stay consistent today!`}
          </p>

          {/* Quick Action Chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('pyq')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <span>{language === 'hi' ? 'विगत वर्ष प्रश्न (PYQ) हल करें' : 'Practice Verified PYQs'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('mock')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>{language === 'hi' ? 'मॉक टेस्ट शुरू करें' : 'Launch Mock Test'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('tutor')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{language === 'hi' ? 'दोस्त AI से पूछें' : 'Ask AI Tutor'}</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Countdown Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'hi' ? 'परीक्षा उल्टी गिनती' : 'Exam Countdown'}</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{daysLeft}</span>
            <span className="text-xs text-slate-500 font-medium">{language === 'hi' ? 'दिन शेष' : 'Days Left'}</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 font-medium truncate">
            {mainDeadline?.examName || primaryExam.nameEn} ({mainDeadline?.targetDate})
          </div>
        </div>

        {/* Focus Chapters Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'hi' ? 'पाठ्यक्रम पूर्णता' : 'Syllabus Progress'}</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{progressPercent}%</span>
            <span className="text-xs text-slate-500 font-medium">({completedChapters.length}/{selectedChapters.length})</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {/* Study Hours Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'hi' ? 'अध्ययन समय (घंटे)' : 'Study Hours Log'}</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalCompletedHours}</span>
            <span className="text-xs text-slate-500 font-medium">/ {totalTargetHours} {language === 'hi' ? 'लक्षित घंटे' : 'hrs target'}</span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {language === 'hi' ? 'दैनिक लक्ष्य: ' : 'Daily Target: '} {userProfile.dailyStudyTargetMinutes} min
          </div>
        </div>

        {/* Mistake Notebook Badge */}
        <div 
          onClick={() => onNavigateTab('mistakes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'hi' ? 'गलती डायरी' : 'Galti Diary'}</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{mistakeCount}</span>
            <span className="text-xs text-slate-500 font-medium">{language === 'hi' ? 'सक्रिय भूलें' : 'Active Slips'}</span>
          </div>
          <div className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1">
            <span>{language === 'hi' ? 'रिवीजन करें →' : 'Review & master errors →'}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Daily Goals & Spaced Repetition */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Goals Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  <span>{language === 'hi' ? 'आज के अध्ययन लक्ष्य (Daily Goals)' : 'Today\'s Study Goals'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'hi' 
                    ? `${completedGoalsCount} में से ${dailyGoals.length} लक्ष्य पूर्ण (${goalProgressPercent}%)`
                    : `${completedGoalsCount} of ${dailyGoals.length} goals completed (${goalProgressPercent}%)`}
                </p>
              </div>

              <button
                onClick={() => setShowAddGoalModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-amber-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'लक्ष्य जोड़ें' : 'Add Goal'}</span>
              </button>
            </div>

            {/* Goal Progress bar */}
            <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${goalProgressPercent}%` }}
              />
            </div>

            {/* Goals List */}
            <div className="mt-4 space-y-2">
              {dailyGoals.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {language === 'hi' ? 'आज के लिए कोई लक्ष्य निर्धारित नहीं है। एक नया लक्ष्य जोड़ें!' : 'No goals set for today. Add one above!'}
                </div>
              ) : (
                dailyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    onClick={() => onToggleGoal(goal.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      goal.completed
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {goal.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-amber-600 shrink-0" />
                      )}
                      <span className="text-sm font-medium">
                        {language === 'hi' ? goal.titleHi : goal.titleEn}
                      </span>
                    </div>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {goal.targetMinutes} min
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Spaced Repetition Due Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>{language === 'hi' ? 'आज का वैज्ञानिक रिवीज़न (Spaced Repetition)' : 'Due For Revision Today'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'hi' 
                    ? 'एबिंगहॉस विस्मृति वक्र पर आधारित समयबद्ध रिवीज़न'
                    : 'Scheduled via Ebbinghaus forgetting curve intervals'}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {dueRevisions.length} {language === 'hi' ? 'बकाया' : 'Due'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {dueRevisions.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'hi' 
                      ? 'शानदार! आज के लिए कोई रिवीज़न लंबित नहीं है। आप समय से आगे चल रहे हैं।'
                      : 'All caught up! No spaced repetitions pending for today.'}
                  </span>
                </div>
              ) : (
                dueRevisions.map((rev) => (
                  <div 
                    key={rev.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800">{rev.chapterTitle}</div>
                      <div className="text-xs text-slate-500">{rev.subjectTitle} • Step {rev.intervalStep}</div>
                    </div>

                    <button
                      onClick={() => onCompleteRevision(rev.id)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {language === 'hi' ? 'रिवीज़न पूरा हुआ' : 'Mark Reviewed'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Exams, Authenticity Notice & High Yields */}
        <div className="space-y-6">
          {/* Target Exams Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{language === 'hi' ? 'मेरी लक्षित परीक्षाएं' : 'Target Exams'}</span>
              </h3>
              <button
                onClick={() => onNavigateTab('plan')}
                className="text-xs text-amber-700 hover:underline font-semibold"
              >
                {language === 'hi' ? 'बदलें' : 'Manage'}
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {userProfile.selectedExamIds.map(eid => {
                const ex = allExams.find(e => e.id === eid);
                if (!ex) return null;
                const isPrimary = ex.id === userProfile.primaryExamId;
                return (
                  <div 
                    key={ex.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      isPrimary 
                        ? 'bg-amber-50/70 border-amber-300 font-semibold text-amber-900' 
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div>{language === 'hi' ? ex.nameHi : ex.nameEn}</div>
                      <div className="text-[10px] text-slate-500">{ex.conductingBody}</div>
                    </div>
                    {isPrimary && (
                      <span className="bg-amber-200/80 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {language === 'hi' ? 'प्राथमिक' : 'Primary'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Source & Verification Disclaimer */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{language === 'hi' ? 'प्रामाणिकता एवं आधिकारिक स्रोत गारंटी' : 'Authenticity & Verified Source Policy'}</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              {language === 'hi'
                ? 'स्टडी दोस्त AI में सभी विगत वर्ष प्रश्न (PYQ) आधिकारिक परीक्षा बोर्डों (NTA, UPSC, SSC, CBSE) से लिए गए हैं। किसी भी प्रश्न को मनगढ़ंत नहीं बनाया जाता। 2026 के प्रश्न आधिकारिक मॉडल प्रारूप के रूप में स्पष्ट चिह्नित हैं।'
                : 'Study Dost AI strictly indexes authentic past examination questions from official portals (NTA, UPSC, SSC, CBSE). No questions are fabricated. The 2026 section represents official specimen model papers.'}
            </p>
          </div>

          {/* AI Dost Quick Doubt Helper Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'शंका समाधान: दोस्त AI' : 'Quick Doubt Solver'}</span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'गणित के कठिन सूत्र, भौतिकी के व्युत्पत्ति या संविधान के अनुच्छेद समझ नहीं आ रहे? AI दोस्त से तुरंत पूछें।'
                : 'Stuck on a tricky formula, scientific derivation, or constitutional article? Get instant breakdown from Dost AI.'}
            </p>
            <button
              onClick={() => onNavigateTab('tutor')}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
            >
              {language === 'hi' ? 'शंका पूछें →' : 'Ask Question Now →'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'hi' ? 'नया दैनिक अध्ययन लक्ष्य जोड़ें' : 'Add New Daily Study Goal'}
            </h3>
            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'लक्ष्य विवरण' : 'Goal Description'}
                </label>
                <input
                  type="text"
                  required
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. गतिकी के 15 PYQ हल करना' : 'e.g. Solve 15 Projectile Motion PYQs'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'लक्षित समय (मिनट)' : 'Target Duration (Minutes)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="360"
                  value={newGoalMinutes}
                  onChange={(e) => setNewGoalMinutes(parseInt(e.target.value) || 30)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'सहेजें' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
