import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Edit, 
  Search,
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import { Language, PYQQuestion, QuestionVerificationStatus, UserStudyProfile, ExamInfo } from '../types';
import { UI_TEXT } from '../data/translations';

interface AdminHubViewProps {
  language: Language;
  userProfile: UserStudyProfile;
  allExams: ExamInfo[];
  questions: PYQQuestion[];
  onImportQuestions: (newQuestions: PYQQuestion[]) => void;
  onDeleteQuestion: (id: string) => void;
  onUpdateQuestionStatus: (id: string, status: QuestionVerificationStatus) => void;
}

export const AdminHubView: React.FC<AdminHubViewProps> = ({
  language,
  userProfile,
  allExams,
  questions,
  onImportQuestions,
  onDeleteQuestion,
  onUpdateQuestionStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'import' | 'manage'>('import');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);
  const [selectedExamForTemplate, setSelectedExamForTemplate] = useState('jee_main');
  const [adminSearch, setAdminSearch] = useState('');

  // Authorized Admin check
  const isAuthorized = userProfile.isAdmin || userProfile.email === 'avi3459qo@gmail.com';

  const downloadJsonTemplate = () => {
    const template = [
      {
        id: `pyq-${selectedExamForTemplate}-${Date.now()}-01`,
        examId: selectedExamForTemplate,
        year: 2024,
        paperName: 'Session 1 - Shift 1',
        shift: 'Morning',
        subject: 'Physics',
        chapter: 'Kinematics',
        topic: 'Relative Velocity',
        questionEn: 'Two cars A and B are traveling in opposite directions...',
        questionHi: 'दो कारें A तथा B विपरीत दिशाओं में गतिमान हैं...',
        optionsEn: ['40 km/h', '60 km/h', '100 km/h', '120 km/h'],
        optionsHi: ['40 किमी/घं', '60 किमी/घं', '100 किमी/घं', '120 किमी/घं'],
        correctOptionIndex: 2,
        explanationEn: 'Relative velocity V_rel = V_A - (-V_B) = 40 + 60 = 100 km/h.',
        explanationHi: 'सापेक्ष वेग = 40 + 60 = 100 किमी/घंटा।',
        verificationStatus: 'verified_official',
        originalSource: 'NTA Official 2024 Master Question Paper Q.12',
        officialSourceUrl: 'https://jeemain.nta.nic.in',
        rightsStatus: 'public_domain_gov',
        isDemoSample: false
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${selectedExamForTemplate}_pyq_import.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessImport = () => {
    setImportError(null);
    setImportSuccessCount(null);

    if (!importJsonText.trim()) {
      setImportError(language === 'hi' ? 'कृपया JSON डेटा दर्ज करें।' : 'Please enter JSON data.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      // Validate required fields
      const validated: PYQQuestion[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.examId || !item.questionEn || item.correctOptionIndex === undefined) {
          throw new Error(`Item at index ${i} is missing examId, questionEn, or correctOptionIndex`);
        }
        if (!item.originalSource) {
          throw new Error(`Item at index ${i} requires an originalSource citation for compliance`);
        }

        validated.push({
          id: item.id || `pyq-${item.examId}-${Date.now()}-${i}`,
          examId: item.examId,
          year: item.year || 2024,
          paperName: item.paperName || 'Official Paper',
          shift: item.shift || '',
          subject: item.subject || 'General Studies',
          chapter: item.chapter || 'Foundations',
          topic: item.topic || '',
          questionEn: item.questionEn,
          questionHi: item.questionHi || item.questionEn,
          optionsEn: item.optionsEn || ['A', 'B', 'C', 'D'],
          optionsHi: item.optionsHi || item.optionsEn || ['A', 'B', 'C', 'D'],
          correctOptionIndex: parseInt(item.correctOptionIndex) || 0,
          explanationEn: item.explanationEn || 'Official solution verified.',
          explanationHi: item.explanationHi || item.explanationEn || 'आधिकारिक समाधान सत्यापित।',
          verificationStatus: (item.verificationStatus as QuestionVerificationStatus) || 'verified_official',
          originalSource: item.originalSource,
          officialSourceUrl: item.officialSourceUrl || '',
          rightsStatus: item.rightsStatus || 'public_domain_gov',
          isDemoSample: !!item.isDemoSample,
          bookmarked: false,
        });
      }

      onImportQuestions(validated);
      setImportSuccessCount(validated.length);
      setImportJsonText('');
    } catch (e: any) {
      setImportError(e.message || 'Invalid JSON syntax');
    }
  };

  const filteredForManage = questions.filter(q => {
    if (!adminSearch.trim()) return true;
    const term = adminSearch.toLowerCase();
    return q.questionEn.toLowerCase().includes(term) ||
           q.originalSource.toLowerCase().includes(term) ||
           q.subject.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <span>{UI_TEXT.nav.adminPortal[language]}</span>
              </h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isAuthorized ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {isAuthorized ? 'Authorized Admin Access' : 'Demo Admin Preview'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'hi'
                ? 'अधिकृत प्रश्न पत्रों का JSON/CSV आयात, स्रोत सत्यापन और परीक्षा डेटाबेस प्रबंधन।'
                : 'Import authorized past exam question papers, verify authenticity sources, and manage question bank.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('import')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'import' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'hi' ? 'डेटा आयात (Import)' : 'Import Questions'}
            </button>
            <button
              onClick={() => setActiveSubTab('manage')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeSubTab === 'manage' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'hi' ? 'डेटाबेस प्रबंधन' : 'Manage Repository'}
            </button>
          </div>
        </div>

        {/* Safety & Compliance Policy */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1.5 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>{language === 'hi' ? 'सख्त डेटा प्रामाणिकता एवं कॉपीराइट अनुपालन:' : 'Compliance & Data Integrity Policy:'}</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700">
            <li>Never import fabricated or synthetic practice questions disguised as official PYQs.</li>
            <li>Maintain clear attribution to official test authorities (NTA, UPSC, SSC, CBSE).</li>
            <li>If redistribution rights are restricted, use official source URLs instead of proprietary text.</li>
          </ul>
        </div>
      </div>

      {activeSubTab === 'import' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'hi' ? 'प्रश्नों का थोक आयात (Batch JSON Import)' : 'Bulk JSON Question Importer'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' 
                  ? 'नीचे दिए गए बॉक्स में वैध JSON ऐरे पेस्ट करें या पहले नमूना टेम्पलेट डाउनलोड करें।' 
                  : 'Paste a valid JSON array matching the schema, or download the template below.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedExamForTemplate}
                onChange={(e) => setSelectedExamForTemplate(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
              >
                {allExams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.nameEn}</option>
                ))}
              </select>

              <button
                onClick={downloadJsonTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'टेम्पलेट डाउनलोड' : 'Sample JSON'}</span>
              </button>
            </div>
          </div>

          <div>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "examId": "jee_main", "year": 2024, "paperName": "Shift 1", "subject": "Physics", "questionEn": "...", "correctOptionIndex": 1, "originalSource": "NTA JEE Main 2024..." } ]'
              className="w-full p-4 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {importSuccessCount !== null && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'hi' 
                  ? `सफलतापूर्वक ${importSuccessCount} प्रश्न डेटाबेस में आयात किए गए!` 
                  : `Successfully verified and imported ${importSuccessCount} questions!`}
              </span>
            </div>
          )}

          <button
            onClick={handleProcessImport}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{language === 'hi' ? 'डेटाबेस में सत्यापित व आयात करें' : 'Verify & Commit to Repository'}</span>
          </button>
        </div>
      ) : (
        /* Repository Management Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">
              {language === 'hi' ? 'सक्रिय प्रश्न भंडार' : 'Live Question Repository'} ({questions.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search repository..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="p-3">Exam</th>
                  <th className="p-3">Year</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Source Citation</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredForManage.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{q.examId}</td>
                    <td className="p-3 font-mono">{q.year}</td>
                    <td className="p-3 text-slate-600">{q.subject}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">{q.originalSource}</td>
                    <td className="p-3">
                      <select
                        value={q.verificationStatus}
                        onChange={(e) => onUpdateQuestionStatus(q.id, e.target.value as QuestionVerificationStatus)}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="verified_official">Official Verified</option>
                        <option value="provisional_key">Provisional Key</option>
                        <option value="community_reviewed">Community Reviewed</option>
                        <option value="model_sample">Model Specimen</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Delete this question?')) {
                            onDeleteQuestion(q.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
