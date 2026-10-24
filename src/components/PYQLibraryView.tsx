import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Layers, 
  Check, 
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  Info
} from 'lucide-react';
import { 
  Language, 
  PYQQuestion, 
  ExamInfo, 
  QuestionVerificationStatus, 
  MistakeNotebookItem 
} from '../types';
import { filterPYQs, getPYQYearBreakdown } from '../utils/pyqFilter';
import { UI_TEXT } from '../data/translations';

interface PYQLibraryViewProps {
  language: Language;
  questions: PYQQuestion[];
  allExams: ExamInfo[];
  primaryExamId: string;
  onToggleBookmark: (questionId: string) => void;
  onAddToMistakes: (question: PYQQuestion, selectedOption: number, reason: MistakeNotebookItem['mistakeReason'], notes: string) => void;
  onOpenAdminPortal?: () => void;
}

export const PYQLibraryView: React.FC<PYQLibraryViewProps> = ({
  language,
  questions,
  allExams,
  primaryExamId,
  onToggleBookmark,
  onAddToMistakes,
  onOpenAdminPortal,
}) => {
  // Active Tab: 'historical' (2021-2025) vs '2026' (Upcoming & Model Papers)
  const [activeTab, setActiveTab] = useState<'historical' | '2026'>('historical');
  
  // Filter States
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<QuestionVerificationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Question practice state
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Mistake modal state
  const [mistakeModalQuestion, setMistakeModalQuestion] = useState<PYQQuestion | null>(null);
  const [mistakeReason, setMistakeReason] = useState<MistakeNotebookItem['mistakeReason']>('conceptual_error');
  const [mistakeNotes, setMistakeNotes] = useState('');

  // Extract unique subjects and years
  const availableSubjects = Array.from(new Set(questions.map(q => q.subject))).sort();
  const yearStats = getPYQYearBreakdown(questions);

  // Filter questions
  const filtered = filterPYQs(questions, {
    examId: selectedExamId,
    year: activeTab === 'historical' ? (selectedYear === 'all' ? 'historical' : parseInt(selectedYear)) : '2026',
    subject: selectedSubject,
    verificationStatus: selectedStatus,
    searchQuery: searchQuery,
    bookmarkedOnly: onlyBookmarked,
  });

  const handleSelectOption = (qId: string, optIndex: number) => {
    setUserSelectedOptions(prev => ({
      ...prev,
      [qId]: optIndex,
    }));
  };

  const toggleSolution = (qId: string) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const submitMistakeEntry = () => {
    if (!mistakeModalQuestion) return;
    const selected = userSelectedOptions[mistakeModalQuestion.id] ?? -1;
    onAddToMistakes(mistakeModalQuestion, selected, mistakeReason, mistakeNotes);
    setMistakeModalQuestion(null);
    setMistakeNotes('');
    alert(language === 'hi' ? 'प्रश्न गलती डायरी में दर्ज किया गया!' : 'Logged into your Galti Diary!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Authentic Guidelines Disclaimer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {language === 'hi' ? 'प्रामाणिक विगत वर्ष प्रश्न (PYQ) पुस्तकालय' : 'Authentic PYQ Question Library'}
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
                {language === 'hi' ? '100% सत्यापित स्रोत' : '100% Verified'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'hi'
                ? 'JEE, NEET, UPSC, SSC, Banking एवं बोर्ड परीक्षाओं के आधिकारिक प्रश्न पत्र, विस्तृत हल एवं स्रोत लिंक।'
                : 'Official past papers, answer keys, step-by-step solutions, and portal references.'}
            </p>
          </div>

          {/* Quick Breakdown Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              {language === 'hi' ? '2021–2025 संग्रह:' : '2021–2025 Archive:'}{' '}
              <strong className="text-amber-700">{yearStats.historicalCount}</strong>
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              {language === 'hi' ? '2026 मॉडल प्रश्न:' : '2026 Model Items:'}{' '}
              <strong className="text-amber-900">{yearStats.year2026Count}</strong>
            </span>
          </div>
        </div>

        {/* Ethical / Authenticity Guarantee Bar */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs leading-relaxed">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {language === 'hi' ? 'अध्ययन नीति एवं प्रामाणिकता निर्देश:' : 'Strict Authenticity & Source Policy:'}{' '}
            </span>
            <span>
              {UI_TEXT.pyq.sourceNotice[language]}
            </span>
          </div>
        </div>

        {/* Main Section Navigation: Historical (2021-2025) vs 2026 Upcoming */}
        <div className="flex border-b border-slate-200 pt-2">
          <button
            onClick={() => {
              setActiveTab('historical');
              setSelectedYear('all');
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'historical'
                ? 'border-amber-600 text-amber-700 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{UI_TEXT.pyq.historicalTab[language]}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {yearStats.historicalCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('2026');
              setSelectedYear('2026');
            }}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === '2026'
                ? 'border-amber-600 text-amber-700 bg-amber-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{UI_TEXT.pyq.section2026Tab[language]}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-semibold">
              {yearStats.year2026Count}
            </span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={UI_TEXT.pyq.searchPlaceholder[language]}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Exam Filter */}
          <div>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी परीक्षाएं' : 'All Exams'}</option>
              {allExams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {language === 'hi' ? ex.nameHi : ex.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter (only for historical) */}
          <div>
            <select
              disabled={activeTab === '2026'}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{UI_TEXT.pyq.allYears[language]}</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी विषय' : 'All Subjects'}</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Bookmarked toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                onlyBookmarked
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-amber-700 text-amber-700' : ''}`} />
              <span>{language === 'hi' ? 'बुकमार्क' : 'Bookmarks'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {language === 'hi' ? 'कोई प्रश्न नहीं मिला' : 'No questions matched your filters'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {language === 'hi'
                ? 'कृपया अपने फिल्टर बदलें या सर्च शब्द साफ करें।'
                : 'Try adjusting your filters, searching for a different keyword, or resetting year selections.'}
            </p>
          </div>
        ) : (
          filtered.map((q, idx) => {
            const examMeta = allExams.find(e => e.id === q.examId);
            const userChoice = userSelectedOptions[q.id];
            const isRevealed = revealedSolutions[q.id];
            const hasAnswered = userChoice !== undefined;
            const isCorrect = userChoice === q.correctOptionIndex;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all hover:border-slate-300 space-y-4"
              >
                {/* Card Top: Badges, Source, Year, Verification */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {examMeta ? (language === 'hi' ? examMeta.nameHi : examMeta.nameEn) : q.examId}
                    </span>

                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {q.year} • {q.paperName} {q.shift && `• ${q.shift}`}
                    </span>

                    <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      {q.subject}
                    </span>

                    {/* Verification Status */}
                    {q.verificationStatus === 'verified_official' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{UI_TEXT.pyq.verificationOfficial[language]}</span>
                      </span>
                    )}

                    {q.verificationStatus === 'model_sample' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>{UI_TEXT.pyq.modelSample[language]}</span>
                      </span>
                    )}

                    {q.isDemoSample && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                        {language === 'hi' ? 'डेमो' : 'Specimen'}
                      </span>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={q.bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    >
                      {q.bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-100" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="space-y-2">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                    <span className="text-amber-700 mr-2 font-mono">Q.{idx + 1}</span>
                    <span>{language === 'hi' ? q.questionHi : q.questionEn}</span>
                  </div>

                  {/* Also show alternate language in collapsible subtle box if desired */}
                  <details className="text-xs text-slate-500 cursor-pointer">
                    <summary className="hover:text-slate-700 select-none">
                      {language === 'hi' ? 'अंग्रेजी में प्रश्न देखें (View in English)' : 'हिन्दी में प्रश्न देखें (View in Hindi)'}
                    </summary>
                    <p className="mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-sans leading-relaxed">
                      {language === 'hi' ? q.questionEn : q.questionHi}
                    </p>
                  </details>
                </div>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {(language === 'hi' ? q.optionsHi : q.optionsEn).map((optText, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    const isTheCorrectOption = q.correctOptionIndex === optIdx;

                    let optStyle = 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50 text-slate-800';
                    if (isRevealed) {
                      if (isTheCorrectOption) {
                        optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                      } else if (isSelected && !isTheCorrectOption) {
                        optStyle = 'border-rose-400 bg-rose-50 text-rose-900 line-through';
                      }
                    } else if (isSelected) {
                      optStyle = 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-500';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-xs sm:text-sm text-left flex items-start gap-2.5 transition-all cursor-pointer ${optStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                          isRevealed && isTheCorrectOption 
                            ? 'bg-emerald-600 text-white' 
                            : isRevealed && isSelected && !isTheCorrectOption
                            ? 'bg-rose-500 text-white'
                            : isSelected 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-snug">{optText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Action Strip: Source attribution, Portal Link, Solution reveal, Mistake Notebook trigger */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2 text-slate-500">
                    <span className="font-semibold text-slate-700">{UI_TEXT.pyq.sourceLabel[language]}</span>
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {q.originalSource}
                    </span>
                    {q.officialSourceUrl && (
                      <a
                        href={q.officialSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{UI_TEXT.pyq.visitOfficialPortal[language]}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Add to Mistake Notebook */}
                    <button
                      onClick={() => setMistakeModalQuestion(q)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rose-200 flex items-center gap-1"
                      title="Save this question to your Galti Diary"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{UI_TEXT.pyq.addToMistakeNotebook[language]}</span>
                    </button>

                    {/* Reveal Solution Button */}
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <span>
                        {isRevealed ? UI_TEXT.pyq.hideExplanation[language] : UI_TEXT.pyq.viewExplanation[language]}
                      </span>
                      {isRevealed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Detailed Solution Accordion */}
                {isRevealed && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {language === 'hi' ? 'सही उत्तर: विकल्प ' : 'Correct Answer: Option '}
                        {String.fromCharCode(65 + q.correctOptionIndex)}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900">
                      {language === 'hi' ? 'विस्तृत समाधान (Detailed Solution):' : 'Step-by-Step Explanation:'}
                    </div>

                    <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200">
                      {language === 'hi' ? q.explanationHi : q.explanationEn}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Mistake Notebook Entry Modal */}
      {mistakeModalQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>{language === 'hi' ? 'गलती डायरी में दर्ज करें' : 'Log to Galti Diary (Mistake Notebook)'}</span>
              </h3>
              <button 
                onClick={() => setMistakeModalQuestion(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {language === 'hi' ? 'प्रश्न: ' : 'Question: '}
              <strong>
                {language === 'hi' ? mistakeModalQuestion.questionHi : mistakeModalQuestion.questionEn}
              </strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'गलती का मुख्य कारण (Error Category):' : 'Reason for Slip-up:'}
              </label>
              <select
                value={mistakeReason}
                onChange={(e) => setMistakeReason(e.target.value as MistakeNotebookItem['mistakeReason'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="conceptual_error">{language === 'hi' ? 'अवधारणा संबंधी भूल (Conceptual Error)' : 'Conceptual Error (Did not understand rule)'}</option>
                <option value="calculation_error">{language === 'hi' ? 'गणना त्रुटि (Calculation Error)' : 'Calculation Mistake (Sign/Algebra slip)'}</option>
                <option value="misread_question">{language === 'hi' ? 'प्रश्न गलत पढ़ा (Misread Question)' : 'Misread Question (Missed "NOT" or units)'}</option>
                <option value="ran_out_of_time">{language === 'hi' ? 'समय का अभाव (Ran out of time)' : 'Ran out of time'}</option>
                <option value="guessed">{language === 'hi' ? 'तुक्का लगाया (Guesswork)' : 'Uncalculated Guesswork'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'मेरी व्यक्तिगत सीख / नोट (Personal Note):' : 'My Personal Lesson / Note:'}
              </label>
              <textarea
                rows={3}
                value={mistakeNotes}
                onChange={(e) => setMistakeNotes(e.target.value)}
                placeholder={language === 'hi' ? 'उदा. मुझे सूत्र में 2g के स्थान पर g नहीं भूलना चाहिए था...' : 'e.g., Remember to apply King rule when bounds are 0 to pi/2...'}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMistakeModalQuestion(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={submitMistakeEntry}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'गलती डायरी में जोड़ें' : 'Save to Mistake Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
