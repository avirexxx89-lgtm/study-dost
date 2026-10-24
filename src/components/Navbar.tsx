import React from 'react';
import { 
  GraduationCap, 
  Flame, 
  Languages, 
  User as UserIcon, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Language, UserStudyProfile } from '../types';
import { UI_TEXT } from '../data/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  userProfile: UserStudyProfile;
  isFirebaseActive: boolean;
  onOpenAuthModal: () => void;
  onOpenSetupGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  userProfile,
  isFirebaseActive,
  onOpenAuthModal,
  onOpenSetupGuide,
}) => {
  const navItems = [
    { id: 'dashboard', label: UI_TEXT.nav.dashboard[language], icon: Sparkles },
    { id: 'plan', label: UI_TEXT.nav.customPlan[language], icon: BookOpen },
    { id: 'pyq', label: UI_TEXT.nav.pyqLibrary[language], icon: Search, badge: '2021–2026' },
    { id: 'notes', label: UI_TEXT.nav.notes[language], icon: GraduationCap },
    { id: 'mock', label: UI_TEXT.nav.mockTests[language], icon: Clock },
    { id: 'mistakes', label: UI_TEXT.nav.mistakeNotebook[language], icon: AlertTriangle },
    { id: 'tutor', label: UI_TEXT.nav.aiTutor[language], icon: Sparkles, highlight: true },
    { id: 'admin', label: UI_TEXT.nav.adminPortal[language], icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner for Demo & Official Guidelines Notice */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-800/80 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {language === 'hi' ? 'सत्यापित PYQ' : 'Verified PYQ'}
            </span>
            <span>
              {language === 'hi' 
                ? 'प्रामाणिक विगत वर्ष प्रश्न (2021–2025) एवं 2026 मॉडल प्रश्न पत्र • 100% प्रामाणिक स्रोत'
                : 'Authentic 2021–2025 PYQs & 2026 Model Papers • 100% Verified Sources'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenSetupGuide}
              className="hover:underline flex items-center gap-1 text-amber-100 hover:text-white transition-colors"
              title="View Firebase & Backend Deployment Documentation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सेटअप व गाइड' : 'Setup & Docs'}</span>
            </button>
            <span className="text-amber-300">|</span>
            <span className="text-amber-100 text-[11px]">
              {isFirebaseActive ? '☁️ Firebase Cloud' : '💾 Local Storage'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Study Dost</span>
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                {language === 'hi' ? 'स्टडी दोस्त AI • भारत का स्मार्ट परीक्षा मंच' : 'Smart Prep for JEE, NEET, UPSC, SSC & Boards'}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200 text-xs font-semibold">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{userProfile.streakDays} {UI_TEXT.auth.streakBadge[language]}</span>
            </div>

            {/* Language Toggle (English <-> हिन्दी) */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
              aria-label="Toggle Language between English and Hindi"
              title="Switch Language (English / हिन्दी)"
            >
              <Languages className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'en' ? 'Hindi / हिन्दी' : 'English'}</span>
            </button>

            {/* User Account / Profile */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              aria-label="User Account"
            >
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
              </div>
              <span className="hidden md:inline max-w-[100px] truncate">
                {userProfile.displayName || (language === 'hi' ? 'अतिथि (Guest)' : 'Guest User')}
              </span>
              {userProfile.isAdmin && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1 rounded font-bold">Admin</span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
