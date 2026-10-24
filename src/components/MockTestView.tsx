import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  Flag, 
  Check, 
  HelpCircle,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Language, 
  PYQQuestion, 
  ExamInfo, 
  TestAttemptResult, 
  MistakeNotebookItem 
} from '../types';
import { calculateTestScore, getPerformanceBadge } from '../utils/scoring';
import { UI_TEXT } from '../data/translations';

interface MockTestViewProps {
  language: Language;
  questions: PYQQuestion[];
  allExams: ExamInfo[];
  primaryExamId: string;
  onSaveTestAttempt: (attempt: TestAttemptResult) => void;
  onAddToMistakes: (question: PYQQuestion, selectedOption: number, reason: MistakeNotebookItem['mistakeReason'], notes: string) => void;
}

export const MockTestView: React.FC<MockTestViewProps> = ({
  language,
  questions,
  allExams,
  primaryExamId,
  onSaveTestAttempt,
  onAddToMistakes,
}) => {
  // Test Lifecycle: 'setup' | 'running' | 'completed'
  const [testState, setTestState] = useState<'setup' | 'running' | 'completed'>('setup');
  
  // Test configuration
  const [selectedExamId, setSelectedExamId] = useState<string>(primaryExamId || 'jee_main');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [markingScheme, setMarkingScheme] = useState<{ correct: number; wrong: number }>({ correct: 4, wrong: 1 });

  // Test In-progress state
  const [activeTestQuestions, setActiveTestQuestions] = useState<PYQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(900);
  const [startTime, setStartTime] = useState<number>(0);

  // Result state
  const [testResult, setTestResult] = useState<TestAttemptResult | null>(null);

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (testState === 'running' && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testState, secondsRemaining]);

  const startTest = () => {
    const candidateQuestions = questions.filter(q => selectedExamId === 'all' || q.examId === selectedExamId);
    const pool = candidateQuestions.length > 0 ? candidateQuestions : questions;
    // Shuffle and pick subset
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, questionCount);
    
    setActiveTestQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setSecondsRemaining(durationMinutes * 60);
    setStartTime(Date.now());
    setTestState('running');
  };

  const finishTest = () => {
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const scoreSummary = calculateTestScore({
      questions: activeTestQuestions,
      answers: userAnswers,
      marksPerCorrect: markingScheme.correct,
      negativeMarkingPerWrong: markingScheme.wrong,
    });

    const activeExam = allExams.find(e => e.id === selectedExamId) || allExams[0];
    const attempt: TestAttemptResult = {
      id: `attempt-${Date.now()}`,
      userId: 'local-user',
      testTitle: `${language === 'hi' ? activeExam.nameHi : activeExam.nameEn} Mock Sprint`,
      examId: activeExam.id,
      completedAt: new Date().toISOString(),
      totalQuestions: scoreSummary.totalQuestions,
      attempted: scoreSummary.attempted,
      correct: scoreSummary.correct,
      incorrect: scoreSummary.incorrect,
      skipped: scoreSummary.skipped,
      score: scoreSummary.score,
      maxScore: scoreSummary.maxScore,
      accuracyPercentage: scoreSummary.accuracyPercentage,
      timeSpentSeconds: timeSpent,
      answers: userAnswers,
    };

    setTestResult(attempt);
    setTestState('completed');
    onSaveTestAttempt(attempt);

    // Fire confetti on high performance
    if (scoreSummary.accuracyPercentage >= 70) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Setup View
  if (testState === 'setup') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {language === 'hi' ? 'समयबद्ध मॉक टेस्ट व क्विज़' : 'Timed Mock Tests & Quizzes'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {language === 'hi'
                  ? 'वास्तविक परीक्षा समय, नेगेटिव मार्किंग और विस्तृत समाधान के साथ अभ्यास करें।'
                  : 'Simulate official exam pressure with negative marking, timers, and instant scorecards.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'परीक्षा चुनें (Target Exam):' : 'Select Exam:'}
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="all">{language === 'hi' ? 'सभी मिश्रित प्रश्न' : 'All Exams (Mixed)'}</option>
                {allExams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {language === 'hi' ? ex.nameHi : ex.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'प्रश्नों की संख्या:' : 'Number of Questions:'}
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value={3}>3 {language === 'hi' ? 'प्रश्न (क्विक टेस्ट)' : 'Questions (Quick Test)'}</option>
                <option value={5}>5 {language === 'hi' ? 'प्रश्न (मानक टेस्ट)' : 'Questions (Standard)'}</option>
                <option value={10}>10 {language === 'hi' ? 'प्रश्न (विस्तृत टेस्ट)' : 'Questions (Full Mock)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'समय सीमा (मिनट):' : 'Time Duration (Minutes):'}
              </label>
              <input
                type="number"
                min="3"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'अंकन योजना (Negative Marking):' : 'Marking Scheme:'}
              </label>
              <select
                value={`${markingScheme.correct}_${markingScheme.wrong}`}
                onChange={(e) => {
                  const [c, w] = e.target.value.split('_').map(Number);
                  setMarkingScheme({ correct: c, wrong: w });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="4_1">+4 / -1 (JEE / NEET / SSC Standard)</option>
                <option value="2_0.66">+2 / -0.66 (UPSC Prelims GS-1)</option>
                <option value="1_0.25">+1 / -0.25 (Banking & Railway)</option>
                <option value="1_0">+1 / 0 (No Negative Marking)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {language === 'hi' ? 'परीक्षार्थियों के लिए सुझाव:' : 'Aspirant Exam Tip:'}{' '}
              </span>
              <span>
                {language === 'hi'
                  ? 'मॉक टेस्ट देते समय तुक्के लगाने से बचें। जो प्रश्न न आए, उन्हें छोड़ना नेगेटिव मार्किंग से बचने का सबसे अच्छा तरीका है।'
                  : 'Avoid uncalculated guesswork. Leaving doubtful questions unattempted is critical to maintaining a positive net score in negative-marking exams.'}
              </span>
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{UI_TEXT.mock.startTest[language]}</span>
          </button>
        </div>
      </div>
    );
  }

  // Running Active Test Simulation
  if (testState === 'running') {
    const currentQ = activeTestQuestions[currentIndex];
    const userSelected = userAnswers[currentQ?.id];
    const isMarked = markedForReview[currentQ?.id];

    return (
      <div className="space-y-4 pb-12">
        {/* Top Sticky Test Bar */}
        <div className="sticky top-24 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">
              {language === 'hi' ? 'प्रश्न' : 'Question'} {currentIndex + 1} / {activeTestQuestions.length}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 hidden sm:inline">
              {currentQ?.subject}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-sm font-bold shadow-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => {
              if (confirm(language === 'hi' ? 'क्या आप टेस्ट सबमिट करना चाहते हैं?' : 'Submit this test now?')) {
                finishTest();
              }
            }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {UI_TEXT.mock.submitTest[language]}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Panel (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {currentQ?.originalSource}
              </span>

              <button
                onClick={() => setMarkedForReview(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  isMarked 
                    ? 'bg-purple-100 border-purple-300 text-purple-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isMarked ? 'fill-purple-700 text-purple-700' : ''}`} />
                <span>{language === 'hi' ? 'रिव्यू के लिए मार्क करें' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {language === 'hi' ? currentQ?.questionHi : currentQ?.questionEn}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {(language === 'hi' ? currentQ?.optionsHi : currentQ?.optionsEn).map((optText, optIdx) => {
                const isSelected = userSelected === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => setUserAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }))}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-bold ring-1 ring-amber-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-sm leading-snug">{optText}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'hi' ? 'पिछला' : 'Previous'}</span>
              </button>

              <button
                onClick={() => {
                  const updated = { ...userAnswers };
                  delete updated[currentQ.id];
                  setUserAnswers(updated);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                {language === 'hi' ? 'उत्तर साफ़ करें' : 'Clear Response'}
              </button>

              {currentIndex < activeTestQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span>{language === 'hi' ? 'अगला' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={finishTest}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                >
                  <span>{UI_TEXT.mock.submitTest[language]}</span>
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Question Palette (1 col) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {UI_TEXT.mock.questionPalette[language]}
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {activeTestQuestions.map((q, qIdx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isReview = markedForReview[q.id];
                const isCurrent = currentIndex === qIdx;

                let paletteColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isAnswered && isReview) {
                  paletteColor = 'bg-purple-600 text-white';
                } else if (isAnswered) {
                  paletteColor = 'bg-emerald-600 text-white';
                } else if (isReview) {
                  paletteColor = 'bg-purple-100 text-purple-800 border border-purple-400';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${paletteColor} ${
                      isCurrent ? 'ring-2 ring-amber-500 scale-105' : ''
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Palette legend */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                <span>{language === 'hi' ? 'उत्तर दिया (Answered)' : 'Answered'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
                <span>{language === 'hi' ? 'समीक्षा हेतु चिह्नित (Marked for Review)' : 'Marked for Review'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
                <span>{language === 'hi' ? 'अनुत्तरित (Unanswered)' : 'Not Attempted'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result / Completed View
  const badge = testResult ? getPerformanceBadge(testResult.accuracyPercentage) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Result Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
          <Award className="w-4 h-4 text-amber-600" />
          <span>{UI_TEXT.mock.scoreCard[language]}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {testResult?.testTitle}
        </h2>

        {/* Score & Accuracy Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'प्राप्तांक' : 'Final Score'}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {testResult?.score} <span className="text-xs text-slate-400">/ {testResult?.maxScore}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'सटीकता (Accuracy)' : 'Accuracy'}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {testResult?.accuracyPercentage}%
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'सही उत्तर' : 'Correct'}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {testResult?.correct}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'गलत उत्तर' : 'Incorrect'}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
              {testResult?.incorrect}
            </div>
          </div>
        </div>

        {/* Performance Badge */}
        {badge && (
          <div className="inline-block px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
            {language === 'hi' ? badge.labelHi : badge.labelEn}
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setTestState('setup')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{UI_TEXT.mock.reAttempt[language]}</span>
          </button>
        </div>
      </div>

      {/* Review Each Question with Explanation & One-Click Galti Diary */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          {language === 'hi' ? 'प्रश्नों का विस्तृत विश्लेषण एवं समाधान' : 'Detailed Question Solutions & Error Logging'}
        </h3>

        {activeTestQuestions.map((q, idx) => {
          const userChoice = userAnswers[q.id];
          const isSkipped = userChoice === undefined;
          const isCorrect = userChoice === q.correctOptionIndex;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 space-y-4 ${
                isCorrect 
                  ? 'border-emerald-200' 
                  : isSkipped 
                  ? 'border-slate-200' 
                  : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">Q.{idx + 1}</span>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'सही (+4)' : 'Correct (+4)'}</span>
                    </span>
                  ) : isSkipped ? (
                    <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {language === 'hi' ? 'छोड़ा गया (0)' : 'Skipped (0)'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'गलत (-1)' : 'Incorrect (-1)'}</span>
                    </span>
                  )}
                </div>

                {!isCorrect && (
                  <button
                    onClick={() => {
                      onAddToMistakes(q, userChoice ?? -1, 'calculation_error', 'Missed during mock test sprint');
                      alert(language === 'hi' ? 'प्रश्न गलती डायरी में दर्ज किया गया!' : 'Logged to Galti Diary!');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? '+ गलती डायरी में जोड़ें' : '+ Add to Galti Diary'}</span>
                  </button>
                )}
              </div>

              <div className="font-bold text-slate-900 text-sm sm:text-base">
                {language === 'hi' ? q.questionHi : q.questionEn}
              </div>

              {/* Options status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(language === 'hi' ? q.optionsHi : q.optionsEn).map((opt, oIdx) => {
                  const isUserSelection = userChoice === oIdx;
                  const isCorrectAnswer = q.correctOptionIndex === oIdx;

                  let style = 'bg-slate-50 border-slate-200 text-slate-700';
                  if (isCorrectAnswer) {
                    style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                  } else if (isUserSelection && !isCorrectAnswer) {
                    style = 'bg-rose-50 border-rose-400 text-rose-900 font-bold line-through';
                  }

                  return (
                    <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center gap-2 ${style}`}>
                      <span className="font-mono font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 text-xs sm:text-sm text-slate-800 space-y-1">
                <div className="font-bold text-slate-900">
                  {language === 'hi' ? 'समाधान (Explanation):' : 'Solution:'}
                </div>
                <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans">
                  {language === 'hi' ? q.explanationHi : q.explanationEn}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
