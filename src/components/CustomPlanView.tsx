import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  ArrowUpDown, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Clock, 
  Calendar, 
  Sparkles,
  Layers,
  Settings,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Language, 
  UserStudyProfile, 
  ExamInfo, 
  Subject, 
  Chapter, 
  ExamDeadline, 
  ExamCategory 
} from '../types';
import { CATEGORY_LABELS } from '../data/exams';
import { generateSpacedRepetitionDates } from '../utils/schedule';

interface CustomPlanViewProps {
  language: Language;
  userProfile: UserStudyProfile;
  allExams: ExamInfo[];
  subjects: Subject[];
  chapters: Chapter[];
  examDeadlines: ExamDeadline[];
  onToggleExamSelection: (examId: string) => void;
  onSetPrimaryExam: (examId: string) => void;
  onAddCustomExam: (exam: ExamInfo) => void;
  onAddSubject: (examId: string, nameEn: string, nameHi: string) => void;
  onEditSubject: (subjectId: string, nameEn: string, nameHi: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onReorderSubjects: (reorderedSubjects: Subject[]) => void;
  onAddChapter: (subjectId: string, examId: string, nameEn: string, nameHi: string, hours: number) => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onToggleChapterSelection: (chapterId: string) => void;
  onUpdateChapterStatus: (chapterId: string, status: Chapter['status']) => void;
  onAddDeadline: (examId: string, examName: string, targetDate: string) => void;
  onDeleteDeadline: (deadlineId: string) => void;
  onAddRevisionSchedule: (items: any[]) => void;
}

export const CustomPlanView: React.FC<CustomPlanViewProps> = ({
  language,
  userProfile,
  allExams,
  subjects,
  chapters,
  examDeadlines,
  onToggleExamSelection,
  onSetPrimaryExam,
  onAddCustomExam,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onReorderSubjects,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onToggleChapterSelection,
  onUpdateChapterStatus,
  onAddDeadline,
  onDeleteDeadline,
  onAddRevisionSchedule,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(userProfile.primaryExamId || allExams[0]?.id || 'jee_main');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlySelectedChapters, setOnlySelectedChapters] = useState(false);

  // Modals state
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [activeSubjectIdForChapter, setActiveSubjectIdForChapter] = useState('');
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Form states
  const [customExamName, setCustomExamName] = useState('');
  const [customExamBody, setCustomExamBody] = useState('');
  const [customExamCategory, setCustomExamCategory] = useState<ExamCategory>('custom');
  const [customExamSubjects, setCustomExamSubjects] = useState('Paper 1, Paper 2');

  const [newSubjEn, setNewSubjEn] = useState('');
  const [newSubjHi, setNewSubjHi] = useState('');

  const [newChapEn, setNewChapEn] = useState('');
  const [newChapHi, setNewChapHi] = useState('');
  const [newChapHours, setNewChapHours] = useState(8);

  const [deadlineDate, setDeadlineDate] = useState('2026-05-15');
  const [deadlineToAddExamId, setDeadlineToAddExamId] = useState(userProfile.primaryExamId);

  // Filter exams by category
  const filteredExams = allExams.filter(e => {
    if (categoryFilter === 'all') return true;
    return e.category === categoryFilter;
  });

  // Current active exam details
  const activeExam = allExams.find(e => e.id === selectedExamId) || allExams[0];

  // Subjects for the active exam
  const examSubjects = subjects
    .filter(s => s.examId === selectedExamId)
    .sort((a, b) => a.order - b.order);

  // Chapters for the active exam
  const examChapters = chapters.filter(c => {
    if (c.examId !== selectedExamId) return false;
    if (onlySelectedChapters && !c.selectedForStudy) return false;
    return true;
  });

  const handleCreateCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExamName.trim()) return;
    const newExam: ExamInfo = {
      id: `custom-exam-${Date.now()}`,
      nameEn: customExamName.trim(),
      nameHi: customExamName.trim(),
      category: customExamCategory,
      conductingBody: customExamBody.trim() || 'Custom Authorized Board',
      officialWebsite: 'https://study-dost.edu.in',
      descriptionEn: 'Custom user curated syllabus and exam preparation track.',
      descriptionHi: 'विद्यार्थी द्वारा स्वयं तैयार किया गया व्यक्तिगत परीक्षा पाठ्यक्रम।',
      standardSubjects: customExamSubjects.split(',').map(s => s.trim()).filter(Boolean),
      isCustom: true,
      createdBy: userProfile.uid,
    };
    onAddCustomExam(newExam);
    setSelectedExamId(newExam.id);
    setShowAddExamModal(false);
    setCustomExamName('');
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjEn.trim()) return;
    onAddSubject(selectedExamId, newSubjEn.trim(), newSubjHi.trim() || newSubjEn.trim());
    setNewSubjEn('');
    setNewSubjHi('');
    setShowAddSubjectModal(false);
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapEn.trim() || !activeSubjectIdForChapter) return;
    onAddChapter(
      activeSubjectIdForChapter,
      selectedExamId,
      newChapEn.trim(),
      newChapHi.trim() || newChapEn.trim(),
      newChapHours
    );
    setNewChapEn('');
    setNewChapHi('');
    setShowAddChapterModal(false);
  };

  const handleScheduleRepetition = (chapter: Chapter, subjectName: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const items = generateSpacedRepetitionDates(
      chapter.id,
      language === 'hi' ? chapter.nameHi : chapter.nameEn,
      subjectName,
      todayStr
    );
    onAddRevisionSchedule(items);
    alert(language === 'hi' 
      ? `वैज्ञानिक रिवीज़न समय-सारणी तैयार की गई (दिन 1, 3, 7, 21, 45)! डैशबोर्ड पर देखें।` 
      : `Spaced repetition schedule (Days 1, 3, 7, 21, 45) added to your dashboard!`);
  };

  const handleMoveSubject = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= examSubjects.length) return;
    const reordered = [...examSubjects];
    const temp = reordered[idx];
    reordered[idx] = reordered[newIdx];
    reordered[newIdx] = temp;
    reordered.forEach((s, i) => s.order = i + 1);
    onReorderSubjects(reordered);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-600" />
            <span>{language === 'hi' ? 'मेरा व्यक्तिगत अध्ययन प्लान व अध्याय' : 'My Study Plan & Focus Chapters'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'hi'
              ? 'एक साथ कई परीक्षाएं चुनें, अपने मनपसंद अध्याय चुनें, घंटे निर्धारित करें और समय-सारणी बनाएं।'
              : 'Select target exams, tailor focus chapters, customize hours, and generate spaced revisions.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddExamModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? '+ कस्टम परीक्षा बनाएं' : '+ Create Custom Exam'}</span>
          </button>

          <button
            onClick={() => setShowDeadlineModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-300"
          >
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>{language === 'hi' ? 'परीक्षा तिथि जोड़ें' : 'Add Deadline'}</span>
          </button>
        </div>
      </div>

      {/* Target Exams Selector Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'hi' ? 'श्रेणी से खोजें:' : 'Filter Category:'}
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                <option key={catKey} value={catKey}>
                  {language === 'hi' ? label.hi : label.en}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {language === 'hi' ? 'चुनी गई परीक्षाएं:' : 'Enrolled Exams:'}{' '}
            <span className="font-bold text-amber-700">{userProfile.selectedExamIds.length}</span>
          </div>
        </div>

        {/* Exams Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {filteredExams.map((exam) => {
            const isSelected = userProfile.selectedExamIds.includes(exam.id);
            const isPrimary = userProfile.primaryExamId === exam.id;
            const isCurrentlyViewing = selectedExamId === exam.id;

            return (
              <div
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrentlyViewing
                    ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate">
                      {language === 'hi' ? exam.nameHi : exam.nameEn}
                    </span>
                    {exam.isCustom && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 font-bold px-1 rounded">User</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{exam.conductingBody}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleExamSelection(exam.id)}
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? (language === 'hi' ? 'शामिल ✓' : 'Selected ✓') : (language === 'hi' ? '+ चुनें' : '+ Enroll')}
                  </button>

                  {isSelected && !isPrimary && (
                    <button
                      onClick={() => onSetPrimaryExam(exam.id)}
                      className="text-[10px] text-amber-700 hover:underline font-semibold"
                    >
                      {language === 'hi' ? 'मुख्य बनाएं' : 'Make Main'}
                    </button>
                  )}
                  {isPrimary && (
                    <span className="text-[9px] text-amber-800 font-bold bg-amber-200/80 px-1 py-0.2 rounded">
                      {language === 'hi' ? 'मुख्य' : 'Primary'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Exam Subjects & Chapters Customizer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'hi' ? activeExam.nameHi : activeExam.nameEn} {language === 'hi' ? 'पाठ्यक्रम प्रबंधन' : 'Syllabus'}
              </h2>
              <a
                href={activeExam.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-600 hover:underline font-semibold"
              >
                ↗ {language === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi' ? activeExam.descriptionHi : activeExam.descriptionEn}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Show only selected chapters checkbox */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlySelectedChapters}
                onChange={(e) => setOnlySelectedChapters(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>{language === 'hi' ? 'केवल चयनित अध्याय' : 'Selected Chapters Only'}</span>
            </label>

            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? '+ नया विषय जोड़ें' : '+ Add Subject'}</span>
            </button>
          </div>
        </div>

        {/* Subjects & Chapters Accordion/Card List */}
        <div className="space-y-6">
          {examSubjects.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
              {language === 'hi' ? 'इस परीक्षा के लिए अभी कोई विषय नहीं हैं। ऊपर बटन से विषय जोड़ें!' : 'No subjects added for this exam yet. Click Add Subject above!'}
            </div>
          ) : (
            examSubjects.map((subject, sIdx) => {
              const subjectChapters = examChapters.filter(c => c.subjectId === subject.id);
              const subjectTotalHours = subjectChapters.reduce((acc, c) => acc + c.estimatedHours, 0);

              return (
                <div key={subject.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/30">
                  {/* Subject Header */}
                  <div className="bg-slate-100/80 px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      {/* Reorder arrows */}
                      <div className="flex flex-col text-slate-400">
                        <button 
                          onClick={() => handleMoveSubject(sIdx, 'up')}
                          disabled={sIdx === 0}
                          className="hover:text-slate-700 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Move Subject Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleMoveSubject(sIdx, 'down')}
                          disabled={sIdx === examSubjects.length - 1}
                          className="hover:text-slate-700 disabled:opacity-20 cursor-pointer p-0.5"
                          title="Move Subject Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {language === 'hi' ? subject.nameHi : subject.nameEn}
                        </h3>
                        <div className="text-[11px] text-slate-500">
                          {subjectChapters.length} {language === 'hi' ? 'अध्याय' : 'chapters'} • {subjectTotalHours} {language === 'hi' ? 'घंटे' : 'hours'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveSubjectIdForChapter(subject.id);
                          setShowAddChapterModal(true);
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'hi' ? 'अध्याय जोड़ें' : 'Add Chapter'}</span>
                      </button>

                      <button
                        onClick={() => setEditingSubject(subject)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Subject Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(language === 'hi' ? 'क्या आप इस विषय को हटाना चाहते हैं?' : 'Delete this subject?')) {
                            onDeleteSubject(subject.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chapters Table / List */}
                  <div className="p-3 space-y-2">
                    {subjectChapters.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400">
                        {language === 'hi' ? 'इस विषय में कोई अध्याय नहीं हैं।' : 'No chapters in this subject yet.'}
                      </div>
                    ) : (
                      subjectChapters.map((chapter) => (
                        <div 
                          key={chapter.id}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            chapter.selectedForStudy 
                              ? 'bg-white border-slate-200 hover:border-slate-300' 
                              : 'bg-slate-100/50 border-slate-200/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => onToggleChapterSelection(chapter.id)}
                              className="mt-0.5 text-amber-600 hover:text-amber-700 cursor-pointer"
                              title={chapter.selectedForStudy ? 'Deselect from study plan' : 'Select for study plan'}
                            >
                              {chapter.selectedForStudy ? (
                                <CheckSquare className="w-5 h-5 text-amber-600 fill-amber-50" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-400" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800">
                                  {language === 'hi' ? chapter.nameHi : chapter.nameEn}
                                </span>
                                {chapter.highYieldWeightage && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    chapter.highYieldWeightage === 'High' 
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {chapter.highYieldWeightage} Yield
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {language === 'hi' ? chapter.summaryHi : chapter.summaryEn}
                              </p>
                            </div>
                          </div>

                          {/* Status, Hours & Action Controls */}
                          <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0">
                            {/* Hours badge */}
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                              {chapter.completedHours}/{chapter.estimatedHours} hrs
                            </span>

                            {/* Status Selector */}
                            <select
                              value={chapter.status}
                              onChange={(e) => onUpdateChapterStatus(chapter.id, e.target.value as Chapter['status'])}
                              className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                                chapter.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : chapter.status === 'in_progress'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-slate-50 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="not_started">{language === 'hi' ? 'शुरू नहीं हुआ' : 'Not Started'}</option>
                              <option value="in_progress">{language === 'hi' ? 'प्रगति पर' : 'In Progress'}</option>
                              <option value="completed">{language === 'hi' ? 'पूर्ण हुआ ✓' : 'Completed ✓'}</option>
                              <option value="revision_needed">{language === 'hi' ? 'रिवीज़न चाहिए' : 'Needs Revision'}</option>
                            </select>

                            {/* Spaced repetition button */}
                            <button
                              onClick={() => handleScheduleRepetition(chapter, language === 'hi' ? subject.nameHi : subject.nameEn)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Generate Spaced Repetition Schedule"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>

                            {/* Edit chapter button */}
                            <button
                              onClick={() => setEditingChapter(chapter)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                              title="Edit Chapter"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete chapter button */}
                            <button
                              onClick={() => {
                                if (confirm(language === 'hi' ? 'अध्याय हटाएं?' : 'Delete chapter?')) {
                                  onDeleteChapter(chapter.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Chapter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Deadlines Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>{language === 'hi' ? 'परीक्षा तिथियां एवं उल्टी गिनती (Deadlines)' : 'Exam Deadlines & Target Countdowns'}</span>
          </h2>
          <button
            onClick={() => setShowDeadlineModal(true)}
            className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'नई तिथि जोड़ें' : 'Add Target Date'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {examDeadlines.map((dl) => (
            <div key={dl.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900">{dl.examName}</div>
                <div className="text-xs text-slate-500 mt-0.5">{dl.targetDate} {dl.shiftOrNote && `• ${dl.shiftOrNote}`}</div>
              </div>
              <button
                onClick={() => onDeleteDeadline(dl.id)}
                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                title="Remove deadline"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Custom Exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'hi' ? 'कस्टम परीक्षा बनाएं (Create Custom Exam)' : 'Create Custom Exam'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'hi'
                ? 'राज्य बोर्ड, विश्वविद्यालय प्रवेश परीक्षा, या अपना व्यक्तिगत टेस्ट सीरीज ट्रैक बनाएं।'
                : 'Create customized syllabuses for university entrances, state tests, or custom test series.'}
            </p>

            <form onSubmit={handleCreateCustomExam} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'परीक्षा का नाम' : 'Exam Title'}
                </label>
                <input
                  type="text"
                  required
                  value={customExamName}
                  onChange={(e) => setCustomExamName(e.target.value)}
                  placeholder="e.g. WBJEE Engineering 2026 or Rajasthan CET"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'परीक्षा बोर्ड / संस्था' : 'Conducting Body'}
                </label>
                <input
                  type="text"
                  value={customExamBody}
                  onChange={(e) => setCustomExamBody(e.target.value)}
                  placeholder="e.g. State Examination Board / Autonomous University"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'श्रेणी' : 'Category'}
                </label>
                <select
                  value={customExamCategory}
                  onChange={(e) => setCustomExamCategory(e.target.value as ExamCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="custom">Custom User Exam</option>
                  <option value="engineering">Engineering</option>
                  <option value="medical">Medical</option>
                  <option value="civil_services">Civil Services</option>
                  <option value="ssc">SSC</option>
                  <option value="state_psc">State PSC</option>
                  <option value="school_boards">School Boards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'प्रारंभिक विषय (कॉमा से अलग करें)' : 'Initial Subjects (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={customExamSubjects}
                  onChange={(e) => setCustomExamSubjects(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'परीक्षा बनाएं' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'hi' ? 'नया विषय जोड़ें' : 'Add Subject to Exam'}
            </h3>
            <form onSubmit={handleCreateSubject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={newSubjEn}
                  onChange={(e) => setNewSubjEn(e.target.value)}
                  placeholder="e.g. Environmental Science or Legal Aptitude"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विषय का नाम (हिन्दी)
                </label>
                <input
                  type="text"
                  value={newSubjHi}
                  onChange={(e) => setNewSubjHi(e.target.value)}
                  placeholder="e.g. पर्यावरण विज्ञान"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'विषय जोड़ें' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Chapter */}
      {showAddChapterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'hi' ? 'नया अध्याय जोड़ें' : 'Add Chapter'}
            </h3>
            <form onSubmit={handleCreateChapter} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chapter Title (English)
                </label>
                <input
                  type="text"
                  required
                  value={newChapEn}
                  onChange={(e) => setNewChapEn(e.target.value)}
                  placeholder="e.g. Alternating Current & EM Waves"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  अध्याय का शीर्षक (हिन्दी)
                </label>
                <input
                  type="text"
                  value={newChapHi}
                  onChange={(e) => setNewChapHi(e.target.value)}
                  placeholder="e.g. प्रत्यावर्ती धारा एवं विद्युत चुंबकीय तरंगें"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'अनुमानित अध्ययन घंटे' : 'Estimated Target Hours'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newChapHours}
                  onChange={(e) => setNewChapHours(parseInt(e.target.value) || 8)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChapterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'सहेजें' : 'Save Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Deadline */}
      {showDeadlineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'hi' ? 'परीक्षा तिथि / उल्टी गिनती जोड़ें' : 'Set Exam Deadline'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const targetExam = allExams.find(ex => ex.id === deadlineToAddExamId) || activeExam;
              onAddDeadline(targetExam.id, targetExam.nameEn, deadlineDate);
              setShowDeadlineModal(false);
            }} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'लक्षित परीक्षा' : 'Target Exam'}
                </label>
                <select
                  value={deadlineToAddExamId}
                  onChange={(e) => setDeadlineToAddExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {allExams.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {language === 'hi' ? ex.nameHi : ex.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'परीक्षा की लक्षित तारीख' : 'Target Date'}
                </label>
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeadlineModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'तिथि निर्धारित करें' : 'Set Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Subject */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'hi' ? 'विषय का नाम संशोधित करें' : 'Edit Subject'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              onEditSubject(editingSubject.id, editingSubject.nameEn, editingSubject.nameHi);
              setEditingSubject(null);
            }} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name (English)</label>
                <input
                  type="text"
                  required
                  value={editingSubject.nameEn}
                  onChange={(e) => setEditingSubject({ ...editingSubject, nameEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">विषय का नाम (हिन्दी)</label>
                <input
                  type="text"
                  value={editingSubject.nameHi}
                  onChange={(e) => setEditingSubject({ ...editingSubject, nameHi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'परिवर्तन सहेजें' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Chapter */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {language === 'hi' ? 'अध्याय संशोधित करें' : 'Edit Chapter'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              onEditChapter(editingChapter);
              setEditingChapter(null);
            }} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chapter Title (English)</label>
                <input
                  type="text"
                  required
                  value={editingChapter.nameEn}
                  onChange={(e) => setEditingChapter({ ...editingChapter, nameEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">अध्याय शीर्षक (हिन्दी)</label>
                <input
                  type="text"
                  value={editingChapter.nameHi}
                  onChange={(e) => setEditingChapter({ ...editingChapter, nameHi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingChapter.estimatedHours}
                    onChange={(e) => setEditingChapter({ ...editingChapter, estimatedHours: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Completed Hours</label>
                  <input
                    type="number"
                    min="0"
                    max={editingChapter.estimatedHours}
                    value={editingChapter.completedHours}
                    onChange={(e) => setEditingChapter({ ...editingChapter, completedHours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Weightage</label>
                <select
                  value={editingChapter.highYieldWeightage || 'Medium'}
                  onChange={(e) => setEditingChapter({ ...editingChapter, highYieldWeightage: e.target.value as 'High' | 'Medium' | 'Low' })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="High">High Yield</option>
                  <option value="Medium">Medium Yield</option>
                  <option value="Low">Low Yield</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChapter(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'सहेजें' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
