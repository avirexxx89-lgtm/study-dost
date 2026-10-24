import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Language, TutorChatMessage, UserStudyProfile, ExamInfo } from '../types';
import { UI_TEXT } from '../data/translations';

interface AITutorViewProps {
  language: Language;
  userProfile: UserStudyProfile;
  allExams: ExamInfo[];
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  language,
  userProfile,
  allExams,
}) => {
  const primaryExam = allExams.find(e => e.id === userProfile.primaryExamId) || allExams[0];

  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'tutor',
      text: language === 'hi' 
        ? `नमस्ते ${userProfile.displayName || 'साथी'}! 🙏 मैं आपका **Study Dost AI** हूँ।\n\nमैं आपकी **${primaryExam.nameHi}** की तैयारी में हर कदम पर सहायता कर सकता हूँ—कठिन सूत्रों की व्युत्पत्ति, शॉर्टकट ट्रिक्स, पिछले वर्षों के प्रश्नों का विश्लेषण या 30-दिन की रिवीजन समय-सारणी!\n\nआप मुझसे क्या पूछना चाहते हैं?`
        : `Hello ${userProfile.displayName || 'Aspirant'}! 🎯 I am your **Study Dost AI** study buddy.\n\nI can help you prepare for **${primaryExam.nameEn}** with step-by-step conceptual derivations, formula shortcuts, memory mnemonics, or personalized study scheduling in English or Hinglish!\n\nWhat topic or doubt would you like to conquer today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowups: UI_TEXT.tutor.quickPrompts[language],
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: TutorChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call server-side proxy route
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-4),
          examName: primaryExam.nameEn,
          subject: 'General Competitive Preparation',
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setFallbackActive(!!data.isFallback);

      const tutorReply: TutorChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: data.suggestedFollowups,
        modelUsed: data.modelUsed,
        isFallback: data.isFallback,
      };

      setMessages(prev => [...prev, tutorReply]);
    } catch (err) {
      console.warn('API call failed, generating safe offline fallback tutor message:', err);
      setFallbackActive(true);
      const fallbackReply: TutorChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: language === 'hi'
          ? `### आपकी शंका: "${text}"\n\n1. **मूल सिद्धांत:** इस विषय से संबंधित बुनियादी परिभाषाओं और सूत्रों को अपनी एनसीईआरटी/कक्षा नोट्स से दोहराएं।\n2. **PYQ अभ्यास:** 2021 से 2025 तक के प्रामाणिक प्रश्नों का अभ्यास करें।\n3. **गलती डायरी:** कठिन सूत्रों को अपनी 'गलती डायरी' में नोट करें ताकि परीक्षा से पहले त्वरित रिवीजन हो सके।`
          : `### Study Breakdown: "${text}"\n\n1. **Foundational Concept:** Review core definitions and standard formula proofs from your official curriculum.\n2. **Drill Authentic PYQs:** Practice past questions from 2021–2025 in our PYQ library to internalize test question phrasing.\n3. **Galti Diary:** Log any calculation slips directly into your mistake log for spaced repetition before exam day!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: [
          'Show me standard formulas for this',
          'Give me an exam-style question',
          'How to avoid negative marking on this topic'
        ],
        isFallback: true,
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 flex flex-col h-[calc(100vh-14rem)] min-h-[500px]">
      {/* Top Tutor Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                {UI_TEXT.tutor.title[language]}
              </h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                {fallbackActive ? (language === 'hi' ? 'स्मार्ट फॉलबैक मोड' : 'Smart Offline Fallback') : 'Gemini AI Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {UI_TEXT.tutor.subtitle[language]}
            </p>
          </div>
        </div>

        {/* Status indicator notice */}
        <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {language === 'hi' 
              ? 'प्रॉक्सी रूट: /api/tutor • कोई API कुंजी उजागर नहीं' 
              : 'Server-side proxy active • Zero keys exposed'}
          </span>
        </div>
      </div>

      {/* Chat Messages Scrollable Box */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isUser ? 'bg-amber-600 text-white' : 'bg-slate-900 text-amber-400'
              }`}>
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2">
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-amber-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line font-sans">
                    {m.text}
                  </div>

                  {m.isFallback && !isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center gap-1">
                      <span>Engine: Curated Smart Rule-Engine Fallback</span>
                    </div>
                  )}
                </div>

                {/* Suggested follow-up prompt chips */}
                {m.suggestedFollowups && m.suggestedFollowups.length > 0 && !isUser && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggestedFollowups.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer text-left flex items-center gap-1"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>{language === 'hi' ? 'दोस्त AI समाधान तैयार कर रहा है...' : 'Dost AI is formulating solution...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-xs shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={UI_TEXT.tutor.inputPlaceholder[language]}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <span>{UI_TEXT.tutor.send[language]}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
