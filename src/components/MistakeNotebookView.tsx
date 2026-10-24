import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Filter, 
  HelpCircle,
  Clock,
  Edit3
} from 'lucide-react';
import { Language, MistakeNotebookItem } from '../types';
import { UI_TEXT } from '../data/translations';

interface MistakeNotebookViewProps {
  language: Language;
  mistakes: MistakeNotebookItem[];
  onToggleResolved: (id: string) => void;
  onDeleteMistake: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const MistakeNotebookView: React.FC<MistakeNotebookViewProps> = ({
  language,
  mistakes,
  onToggleResolved,
  onDeleteMistake,
  onUpdateNotes,
  onNavigateTab,
}) => {
  const [selectedReasonFilter, setSelectedReasonFilter] = useState<string>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [reattemptAnswers, setReattemptAnswers] = useState<Record<string, number>>({});
  const [showSolutionFor, setShowSolutionFor] = useState<Record<string, boolean>>({});

  const filtered = mistakes.filter(m => {
    if (selectedReasonFilter === 'all') return true;
    if (selectedReasonFilter === 'unresolved') return !m.resolved;
    if (selectedReasonFilter === 'resolved') return m.resolved;
    return m.mistakeReason === selectedReasonFilter;
  });

  const activeMistakesCount = mistakes.filter(m => !m.resolved).length;
  const resolvedCount = mistakes.filter(m => m.resolved).length;
  const masteryPercentage = mistakes.length > 0 ? Math.round((resolvedCount / mistakes.length) * 100) : 100;

  const reasonLabels: Record<MistakeNotebookItem['mistakeReason'], { en: string; hi: string; color: string }> = {
    conceptual_error: { en: 'Conceptual Error', hi: 'अवधारणा संबंधी भूल', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    calculation_error: { en: 'Calculation Mistake', hi: 'गणना त्रुटि', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    misread_question: { en: 'Misread Question', hi: 'प्रश्न गलत पढ़ा', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    ran_out_of_time: { en: 'Ran out of time', hi: 'समय का अभाव', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    guessed: { en: 'Guesswork Slip', hi: 'तुक्का चूक', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Mastery Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {UI_TEXT.mistakes.title[language]}
              </h1>
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full border border-rose-300">
                {activeMistakesCount} {language === 'hi' ? 'सक्रिय' : 'Pending'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {UI_TEXT.mistakes.subtitle[language]}
            </p>
          </div>

          {/* Mastery Rate Widget */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'मास्टरी दर' : 'Mastery Rate'}</div>
              <div className="text-lg font-extrabold text-emerald-600">{masteryPercentage}%</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-700 bg-white">
              {resolvedCount}/{mistakes.length}
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700">{UI_TEXT.mistakes.filterReason[language]}</span>

          {[
            { id: 'all', label: language === 'hi' ? 'सभी गलतियां' : 'All' },
            { id: 'unresolved', label: language === 'hi' ? 'केवल सक्रिय' : 'Active Only' },
            { id: 'resolved', label: language === 'hi' ? 'हल हो चुकी' : 'Mastered' },
            { id: 'conceptual_error', label: language === 'hi' ? 'अवधारणा' : 'Conceptual' },
            { id: 'calculation_error', label: language === 'hi' ? 'गणना' : 'Calculation' },
            { id: 'misread_question', label: language === 'hi' ? 'गलत पढ़ा' : 'Misread' },
            { id: 'guessed', label: language === 'hi' ? 'तुक्के' : 'Guessed' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedReasonFilter(f.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                selectedReasonFilter === f.id
                  ? 'bg-rose-600 border-rose-600 text-white shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mistakes List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {UI_TEXT.mistakes.emptyState[language]}
            </h3>
            <button
              onClick={() => onNavigateTab('pyq')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <span>{language === 'hi' ? 'PYQ अभ्यास पर जाएं' : 'Browse PYQ Library'}</span>
            </button>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const q = item.question;
            const userTry = reattemptAnswers[item.id];
            const isSolutionRevealed = showSolutionFor[item.id];
            const reasonTag = reasonLabels[item.mistakeReason];

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all space-y-4 ${
                  item.resolved 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">#{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold border ${reasonTag.color}`}>
                      {language === 'hi' ? reasonTag.hi : reasonTag.en}
                    </span>
                    <span className="text-slate-500">
                      {q.subject} • {q.originalSource}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleResolved(item.id)}
                      className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        item.resolved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.resolved ? (language === 'hi' ? 'त्रुटि दूर हो गई ✓' : 'Mastered ✓') : UI_TEXT.mistakes.markResolved[language]}</span>
                    </button>

                    <button
                      onClick={() => onDeleteMistake(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question statement */}
                <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {language === 'hi' ? q.questionHi : q.questionEn}
                </div>

                {/* Interactive Re-attempt Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(language === 'hi' ? q.optionsHi : q.optionsEn).map((opt, oIdx) => {
                    const isChoice = userTry === oIdx;
                    const isActualCorrect = q.correctOptionIndex === oIdx;

                    let optStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                    if (userTry !== undefined) {
                      if (isActualCorrect) {
                        optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                      } else if (isChoice && !isActualCorrect) {
                        optStyle = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => setReattemptAnswers(prev => ({ ...prev, [item.id]: oIdx }))}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${optStyle}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Personal Notes / Reflection */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center justify-between font-bold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'मेरी व्यक्तिगत सीख / डायरी नोट:' : 'My Reflection / Lesson Learned:'}</span>
                    </span>
                    <button
                      onClick={() => {
                        if (editingNotesId === item.id) {
                          onUpdateNotes(item.id, tempNotes);
                          setEditingNotesId(null);
                        } else {
                          setEditingNotesId(item.id);
                          setTempNotes(item.userNotes);
                        }
                      }}
                      className="text-amber-800 hover:underline font-bold"
                    >
                      {editingNotesId === item.id ? (language === 'hi' ? 'सहेजें' : 'Save') : (language === 'hi' ? 'संशोधित करें' : 'Edit')}
                    </button>
                  </div>

                  {editingNotesId === item.id ? (
                    <textarea
                      rows={2}
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="italic text-slate-700 leading-relaxed">
                      "{item.userNotes || (language === 'hi' ? 'कोई विशेष नोट नहीं। ऊपर संशोधित करें पर क्लिक करके अपना अनुभव जोड़ें।' : 'No note entered yet. Click edit to record your learning note.')}"
                    </p>
                  )}
                </div>

                {/* Toggle Solution */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setShowSolutionFor(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    {isSolutionRevealed 
                      ? (language === 'hi' ? 'हल छिपाएं' : 'Hide Explanation') 
                      : (language === 'hi' ? 'आधिकारिक हल देखें →' : 'View Detailed Solution →')}
                  </button>
                </div>

                {isSolutionRevealed && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1 animate-in fade-in">
                    <div className="font-bold text-slate-900">
                      {language === 'hi' ? 'समाधान (Step-by-step Solution):' : 'Step-by-Step Solution:'}
                    </div>
                    <div className="whitespace-pre-line text-slate-700 leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200">
                      {language === 'hi' ? q.explanationHi : q.explanationEn}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
