import { Language } from '../types';

export const UI_TEXT = {
  appName: {
    en: 'Study Dost AI',
    hi: 'स्टडी दोस्त AI',
  },
  tagline: {
    en: 'India’s Smart Bilingual Exam Prep & Verified PYQ Library',
    hi: 'भारत का स्मार्ट द्विभाषी परीक्षा तैयारी मंच एवं प्रामाणिक PYQ पुस्तकालय',
  },
  
  // Navigation tabs
  nav: {
    dashboard: { en: 'Dashboard', hi: 'डैशबोर्ड' },
    customPlan: { en: 'My Study Plan & Chapters', hi: 'स्टडी प्लान व अध्याय' },
    pyqLibrary: { en: 'PYQ Library (2021–2026)', hi: 'PYQ पुस्तकालय (2021–2026)' },
    notes: { en: 'Chapter Notes', hi: 'अध्याय नोट्स' },
    mockTests: { en: 'Mock Tests & Quizzes', hi: 'मॉक टेस्ट व क्विज़' },
    mistakeNotebook: { en: 'Galti Diary (Mistakes)', hi: 'गलती डायरी (Mistakes)' },
    aiTutor: { en: 'AI Dost Tutor', hi: 'AI दोस्त ट्यूटर' },
    adminPortal: { en: 'Admin Data Hub', hi: 'एडमिन डेटा हब' },
  },

  // Auth & Profile
  auth: {
    signIn: { en: 'Sign In', hi: 'साइन इन करें' },
    signOut: { en: 'Sign Out', hi: 'लॉग आउट' },
    demoMode: { en: 'Guest / Demo Mode', hi: 'अतिथि / डेमो मोड' },
    demoModeNotice: {
      en: 'Using local storage. Sign in with Firebase to sync across devices securely.',
      hi: 'लोकल स्टोरेज का उपयोग हो रहा है। सभी डिवाइस पर सुरक्षित सिंक के लिए साइन इन करें।',
    },
    adminBadge: { en: 'Authorized Admin', hi: 'अधिकृत एडमिन' },
    streakBadge: { en: 'Day Streak', hi: 'दिन की स्ट्रीक' },
    syncing: { en: 'Syncing to Cloud...', hi: 'क्लाउड सिंक हो रहा है...' },
  },

  // Exam Selector
  examSelector: {
    title: { en: 'My Selected Target Exams', hi: 'मेरी चुनी हुई लक्ष्य परीक्षाएं' },
    subtitle: { en: 'Switch or add exams to customize your personal syllabus', hi: 'अपने व्यक्तिगत सिलेबस के लिए परीक्षाएं जोड़ें या बदलें' },
    addCustomExam: { en: '+ Create Custom Exam', hi: '+ कस्टम परीक्षा बनाएं' },
    categoryFilter: { en: 'Exam Category:', hi: 'परीक्षा श्रेणी:' },
  },

  // PYQ Library
  pyq: {
    searchPlaceholder: { en: 'Search question, formula, concept, or source...', hi: 'प्रश्न, सूत्र, अवधारणा या स्रोत खोजें...' },
    historicalTab: { en: 'Historical PYQs (2021–2025)', hi: 'विगत वर्षों के प्रश्न (2021–2025)' },
    section2026Tab: { en: '2026 Upcoming & Model Papers', hi: '2026 आगामी प्रारूप व मॉडल पेपर्स' },
    allYears: { en: 'All Years', hi: 'सभी वर्ष' },
    verificationOfficial: { en: 'Official Verified', hi: 'आधिकारिक सत्यापित' },
    provisionalKey: { en: 'Provisional Key', hi: 'अनंतिम उत्तर कुंजी' },
    communityReviewed: { en: 'Community Verified', hi: 'समीक्षित प्रश्न' },
    modelSample: { en: 'Model Specimen', hi: 'मॉडल प्रारूप (Specimen)' },
    sourceNotice: {
      en: 'Study Dost AI never fabricates past exam questions. Full papers are linked directly to official testing authorities (NTA, UPSC, SSC, CBSE).',
      hi: 'स्टडी दोस्त AI कभी भी फर्जी प्रश्न नहीं बनाता। वास्तविक प्रश्नपत्रों के लिए आधिकारिक पोर्टल्स (NTA, UPSC, SSC, CBSE) के सीधे लिंक दिए गए हैं।',
    },
    viewExplanation: { en: 'View Answer & Detailed Solution', hi: 'उत्तर एवं विस्तृत समाधान देखें' },
    hideExplanation: { en: 'Hide Solution', hi: 'समाधान छिपाएं' },
    bookmark: { en: 'Bookmark', hi: 'बुकमार्क' },
    addToMistakeNotebook: { en: 'Save to Galti Diary', hi: 'गलती डायरी में जोड़ें' },
    sourceLabel: { en: 'Official Source:', hi: 'आधिकारिक स्रोत:' },
    visitOfficialPortal: { en: 'Official Testing Portal', hi: 'आधिकारिक पोर्टल लिंक' },
  },

  // Chapter customization
  chapters: {
    selectChaptersTitle: { en: 'Select Focus Chapters for Exam Preparation', hi: 'परीक्षा तैयारी हेतु प्रमुख अध्याय चुनें' },
    selectedOnly: { en: 'Show Selected Chapters Only', hi: 'केवल चुने हुए अध्याय दिखाएं' },
    addSubject: { en: '+ Add Subject', hi: '+ नया विषय जोड़ें' },
    addChapter: { en: '+ Add Chapter', hi: '+ नया अध्याय जोड़ें' },
    highYield: { en: 'High Yield', hi: 'उच्च अंकभार (High Yield)' },
    markComplete: { en: 'Mark Completed', hi: 'पूर्ण चिह्नित करें' },
    inProgress: { en: 'In Progress', hi: 'जारी है' },
    estimatedHours: { en: 'Target Hours', hi: 'लक्षित घंटे' },
  },

  // Mock Test
  mock: {
    startTest: { en: 'Start Timed Mock Test', hi: 'समयबद्ध मॉक टेस्ट प्रारंभ करें' },
    questionPalette: { en: 'Question Palette', hi: 'प्रश्न पैलेट' },
    submitTest: { en: 'Submit Test', hi: 'टेस्ट सबमिट करें' },
    timeLeft: { en: 'Time Left', hi: 'शेष समय' },
    scoreCard: { en: 'Test Result & Analysis', hi: 'परीक्षा परिणाम एवं विश्लेषण' },
    negativeMarkingNotice: { en: '+4 for correct, -1 for incorrect', hi: 'सही उत्तर पर +4, गलत उत्तर पर -1 ऋणात्मक अंक' },
    reAttempt: { en: 'Re-Attempt Test', hi: 'पुनः प्रयास करें' },
  },

  // Mistake Notebook
  mistakes: {
    title: { en: 'Galti Diary (Personal Mistake Notebook)', hi: 'गलती डायरी (निजी त्रुटि नोटबुक)' },
    subtitle: { en: 'Review and conquer recurring conceptual, calculation, or guesswork errors', hi: 'अवधारणा, गणना या तुक्के की गलतियों का विश्लेषण एवं पुनरावृत्ति करें' },
    filterReason: { en: 'Filter by Error Type:', hi: 'त्रुटि प्रकार से छांटें:' },
    emptyState: { en: 'Your Mistake Notebook is clean! Mark any tricky PYQ or mock test slip-up here.', hi: 'आपकी गलती डायरी खाली है! किसी भी कठिन प्रश्न या टेस्ट की भूल को यहाँ दर्ज करें।' },
    markResolved: { en: 'Mark as Mastered', hi: 'समस्या हल हो गई (Mastered)' },
  },

  // AI Tutor
  tutor: {
    title: { en: 'Dost AI - 24/7 Personal Study Companion', hi: 'दोस्त AI - 24/7 व्यक्तिगत अध्ययन साथी' },
    subtitle: { en: 'Ask doubt solving, derivation, memory tricks, or study scheduling in English or Hinglish', hi: 'अंग्रेजी या हिंग्लिश में कोई भी शंका, गणितीय सूत्र, शॉर्टकट ट्रिक या अध्ययन सलाह पूछें' },
    inputPlaceholder: { en: 'Ask a doubt (e.g., Explain King’s rule in definite integration with an example)...', hi: 'अपनी शंका पूछें (उदा. King\'s Rule निश्चित समाकलन में कैसे काम करता है?)...' },
    send: { en: 'Send', hi: 'पूछें' },
    quickPrompts: {
      en: ['Explain Projectile Motion formulas', 'How to remember Lac Operon?', 'King’s rule in Integration tricks', 'Create a 30-day revision timetable for JEE'],
      hi: ['प्रक्षेप्य गति के सूत्रों को समझाएं', 'लैक ऑपेरॉन को याद रखने की आसान ट्रिक?', 'निश्चित समाकलन की शॉर्ट ट्रिक', '30 दिनों की रिवीजन समय-सारणी बनाएं'],
    },
    offlineFallbackActive: {
      en: 'AI Tutor is operating in Smart Fallback Mode (pre-indexed knowledge & guides active). Backend proxy route is ready when API key is set.',
      hi: 'AI ट्यूटर स्मार्ट फॉलबैक मोड में सक्रिय है (गाइड और सूत्र सक्रिय हैं)। बैकएंड प्रॉक्सी तैयार है।',
    },
  },

  // Common
  common: {
    back: { en: 'Back', hi: 'वापस' },
    save: { en: 'Save Changes', hi: 'परिवर्तन सहेजें' },
    cancel: { en: 'Cancel', hi: 'रद्द करें' },
    delete: { en: 'Delete', hi: 'हटाएं' },
    demoDataBadge: { en: 'Sample / Demo Data', hi: 'नमूना / डेमो डेटा' },
  }
};

export function getUIText(keyPath: string, lang: Language): string {
  const parts = keyPath.split('.');
  let current: any = UI_TEXT;
  for (const p of parts) {
    if (current[p] !== undefined) {
      current = current[p];
    } else {
      return keyPath;
    }
  }
  if (current && typeof current === 'object' && current[lang] !== undefined) {
    return current[lang];
  }
  return typeof current === 'string' ? current : keyPath;
}
