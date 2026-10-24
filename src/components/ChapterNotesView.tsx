import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  HelpCircle, 
  Layers, 
  GraduationCap,
  Clock,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Language, Subject, Chapter, ExamInfo } from '../types';

interface ChapterNotesViewProps {
  language: Language;
  allExams: ExamInfo[];
  primaryExamId: string;
  subjects: Subject[];
  chapters: Chapter[];
  onNavigateTab: (tab: string) => void;
}

export const ChapterNotesView: React.FC<ChapterNotesViewProps> = ({
  language,
  allExams,
  primaryExamId,
  subjects,
  chapters,
  onNavigateTab,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(primaryExamId || 'jee_main');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const examSubjects = subjects.filter(s => s.examId === selectedExamId);
  const filteredChapters = chapters.filter(c => {
    if (c.examId !== selectedExamId) return false;
    if (selectedSubjectId !== 'all' && c.subjectId !== selectedSubjectId) return false;
    return true;
  });

  const handleCopyFormula = async (formula: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formula);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = formula;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (e) {}
      document.body.removeChild(textArea);
    }
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {language === 'hi' ? 'अध्याय नोट्स एवं सूत्र सारांश' : 'Chapter Notes & Formula Sheets'}
              </h1>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
                NCERT High-Yield
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'hi'
                ? 'महत्वपूर्ण सूत्र, अवधारणाएं, शॉर्टकट ट्रिक्स और त्वरित पुनरावृत्ति (Revision) नोट्स।'
                : 'Rapid revision sheets, high-yield exam weightage, memory mnemonics, and formula bank.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('tutor')}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{language === 'hi' ? 'AI दोस्त से नोट्स समझें' : 'Deep Dive with Dost AI'}</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">{language === 'hi' ? 'परीक्षा:' : 'Exam:'}</span>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedSubjectId('all');
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {allExams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {language === 'hi' ? ex.nameHi : ex.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">{language === 'hi' ? 'विषय:' : 'Subject:'}</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी विषय' : 'All Subjects'}</option>
              {examSubjects.map(s => (
                <option key={s.id} value={s.id}>
                  {language === 'hi' ? s.nameHi : s.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chapters Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredChapters.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            {language === 'hi' ? 'इस विषय के लिए कोई नोट्स उपलब्ध नहीं हैं।' : 'No notes available for this subject selection.'}
          </div>
        ) : (
          filteredChapters.map((ch) => {
            const subject = subjects.find(s => s.id === ch.subjectId);

            return (
              <div
                key={ch.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {subject ? (language === 'hi' ? subject.nameHi : subject.nameEn) : ch.subjectId}
                    </span>

                    {ch.highYieldWeightage && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        ch.highYieldWeightage === 'High' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        🔥 {ch.highYieldWeightage} Yield Weightage
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'hi' ? ch.nameHi : ch.nameEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {language === 'hi' ? ch.summaryHi : ch.summaryEn}
                  </p>

                  {/* Formulas Sheet */}
                  {ch.keyFormulas && ch.keyFormulas.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>{language === 'hi' ? 'प्रमुख सूत्र (Formula Bank):' : 'Key Formulas:'}</span>
                      </div>
                      <div className="space-y-1.5">
                        {ch.keyFormulas.map((formula, fIdx) => (
                          <div 
                            key={fIdx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800"
                          >
                            <span>{formula}</span>
                            <button
                              onClick={() => handleCopyFormula(formula)}
                              className="text-slate-400 hover:text-amber-600 p-1 cursor-pointer"
                              title="Copy formula"
                            >
                              {copiedFormula === formula ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {ch.completedHours}/{ch.estimatedHours} {language === 'hi' ? 'घंटे अध्ययन' : 'hrs studied'}
                  </span>

                  <button
                    onClick={() => onNavigateTab('pyq')}
                    className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'इस अध्याय के PYQ हल करें' : 'Practice PYQs'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
