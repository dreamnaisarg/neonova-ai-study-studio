import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Bell, 
  ChevronDown, 
  BookOpen, 
  GraduationCap, 
  Globe, 
  Check, 
  User, 
  Camera, 
  HelpCircle,
  Menu,
  Type,
  LogOut,
  Mic,
  LayoutGrid,
  Smartphone
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../../types';
import { PlanTier, PLANS } from '../../lib/billing';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface EduHeaderProps {
  onOpenWidgets?: () => void;
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  currentSubject: string;
  onSubjectChange: (subject: string) => void;
  curriculumBoard?: string;
  onCurriculumBoardChange?: (board: string) => void;
  onOpenVoiceTutor?: () => void;
  onOpenAllFeatures?: () => void;
  studentName: string;
  studentAvatar: string;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenScanner: () => void;
  onOpenMobileMenu?: () => void;
  academicXP?: number;
  currentTier?: PlanTier;
  onOpenPlans?: () => void;
  fontScale?: 'standard' | 'large' | 'xlarge';
  onCycleFontScale?: () => void;
  onOpenHelpGuide?: () => void;
  onLogout?: () => void;
  isGuest?: boolean;
  onOpenLogin?: () => void;
}

export default function EduHeader({
  currentGrade,
  onGradeChange,
  currentSubject,
  onSubjectChange,
  curriculumBoard = 'cbse',
  onCurriculumBoardChange,
  onOpenVoiceTutor,
  onOpenAllFeatures,
  studentName,
  studentAvatar,
  onOpenSearch,
  onOpenProfile,
  onOpenScanner,
  onOpenMobileMenu,
  academicXP = 0,
  currentTier = 'starter',
  onOpenPlans,
  fontScale = 'standard',
  onCycleFontScale,
  onOpenHelpGuide,
  onLogout,
  isGuest = false,
  onOpenLogin,
  onOpenWidgets
}: EduHeaderProps) {
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [curriculumDropdownOpen, setCurriculumDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const gradeRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLDivElement>(null);
  const curriculumRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const CURRICULUM_OPTIONS = [
    { id: 'cbse', label: 'CBSE (NCERT)', country: 'India' },
    { id: 'icse', label: 'ICSE (CISCE)', country: 'India' },
    { id: 'state', label: 'State Board', country: 'India' },
    { id: 'ap', label: 'AP (College Board)', country: 'USA' },
    { id: 'ib', label: 'IB Diploma', country: 'Intl' },
    { id: 'cambridge', label: 'Cambridge / IGCSE', country: 'UK' }
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gradeRef.current && !gradeRef.current.contains(event.target as Node)) {
        setGradeDropdownOpen(false);
      }
      if (subjectRef.current && !subjectRef.current.contains(event.target as Node)) {
        setSubjectDropdownOpen(false);
      }
      if (curriculumRef.current && !curriculumRef.current.contains(event.target as Node)) {
        setCurriculumDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xs transition-colors">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Open full navigation drawer"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <NeoNovaLogo size={34} glow className="shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base leading-none">
                NeoNova
              </span>
              <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded font-sans uppercase">
                EDU
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block leading-none mt-0.5">
              AI Homework & Learning Studio
            </p>
          </div>
        </div>
      </div>

      {/* Center: Search trigger & Selectors (Desktop and Large Tablets) */}
      <div className="hidden lg:flex items-center gap-2.5">
        {/* Quick Search Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/70 rounded-xl text-xs font-medium transition-colors w-56 xl:w-64 cursor-pointer"
          title="Search all subjects, topics, and study tools (Ctrl+K)"
        >
          <Search size={14} className="text-slate-400 shrink-0" />
          <span className="flex-1 text-left truncate">Search subjects & topics...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Functional Grade Selector */}
        <div className="relative" ref={gradeRef}>
          <button
            type="button"
            onClick={() => setGradeDropdownOpen(!gradeDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            aria-expanded={gradeDropdownOpen}
          >
            <GraduationCap size={14} className="text-indigo-600" />
            <span>{currentGrade || 'Grade 8'}</span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${gradeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {gradeDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 max-h-64 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Grade Level
              </div>
              {GRADES.map((g) => {
                const isSelected = g === currentGrade;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      onGradeChange(g);
                      setGradeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{g}</span>
                    {isSelected && <Check size={14} className="text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Functional Subject Selector */}
        <div className="relative" ref={subjectRef}>
          <button
            type="button"
            onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            aria-expanded={subjectDropdownOpen}
          >
            <BookOpen size={14} className="text-indigo-600" />
            <span className="truncate max-w-[120px]">{currentSubject || 'All Subjects'}</span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${subjectDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {subjectDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 max-h-64 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Subject
              </div>
              <button
                type="button"
                onClick={() => {
                  onSubjectChange('All Subjects');
                  setSubjectDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                  currentSubject === 'All Subjects' 
                    ? 'bg-indigo-50 text-indigo-700 font-bold' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>🌐 All Subjects</span>
                {currentSubject === 'All Subjects' && <Check size={14} className="text-indigo-600" />}
              </button>
              {SUBJECTS.map((sub) => {
                const isSelected = sub.name === currentSubject;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSubjectChange(sub.name);
                      setSubjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{sub.icon} {sub.name}</span>
                    {isSelected && <Check size={14} className="text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Functional Curriculum Board Selector */}
        <div className="relative" ref={curriculumRef}>
          <button
            type="button"
            onClick={() => setCurriculumDropdownOpen(!curriculumDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
            aria-expanded={curriculumDropdownOpen}
            title="Selected Academic Curriculum & Exam Board"
          >
            <Globe size={14} className="text-indigo-600" />
            <span className="font-bold uppercase font-mono text-[11px] text-indigo-700">
              {curriculumBoard.toUpperCase()}
            </span>
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${curriculumDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {curriculumDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 max-h-64 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Curriculum / Board
              </div>
              {CURRICULUM_OPTIONS.map((board) => {
                const isSelected = board.id === curriculumBoard.toLowerCase();
                return (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => {
                      onCurriculumBoardChange?.(board.id);
                      setCurriculumDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{board.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{board.country}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Accessibility Controls, Scanner, Voice, Search, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* All Features Quick Launcher */}
        {onOpenAllFeatures && (
          <button
            type="button"
            onClick={onOpenAllFeatures}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-200/80 shadow-2xs"
            title="Access All Features & Study Tools Hub"
          >
            <LayoutGrid size={14} className="text-indigo-600 shrink-0" />
            <span className="hidden xs:inline sm:inline">All Features</span>
          </button>
        )}

        {/* Realtime Voice AI Button */}
        {onOpenVoiceTutor && (
          <button
            type="button"
            onClick={onOpenVoiceTutor}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Real-Time Voice AI Tutor (Interrupt anytime)"
          >
            <Mic size={14} />
            <span className="hidden sm:inline">Voice AI</span>
          </button>
        )}
        {/* Quick Accessibility Text-Size Scaling */}
        {onCycleFontScale && (
          <button
            type="button"
            onClick={onCycleFontScale}
            className="flex items-center gap-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title={`Text Size: ${fontScale === 'standard' ? 'Standard (100%)' : fontScale === 'large' ? 'Large (115%)' : 'Extra Large (130%)'}. Click to cycle.`}
            aria-label="Cycle text size for accessibility"
          >
            <Type size={13} className="text-indigo-600" />
            <span className="text-[11px] font-mono">
              {fontScale === 'standard' ? 'A' : fontScale === 'large' ? 'A+' : 'A++'}
            </span>
          </button>
        )}

        {/* Camera Quick Scan Button */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          title="Scan Homework Worksheet with Camera (Works Online & Offline)"
        >
          <Camera size={14} className="text-indigo-600 shrink-0" />
          <span className="hidden sm:inline">Scan</span>
        </button>

        {/* Phone Home Screen Widgets & Study Reminders Button */}
        {onOpenWidgets && (
          <button
            type="button"
            onClick={onOpenWidgets}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Phone Home Screen Widgets & Daily Study Reminders"
          >
            <Smartphone size={14} className="text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">Widgets</span>
          </button>
        )}

        {/* Search button on smaller screens */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Search curriculum"
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Accessibility & Quick User Guide Button */}
        {onOpenHelpGuide && (
          <button
            type="button"
            onClick={onOpenHelpGuide}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-colors cursor-pointer"
            title="How to Use NeoNova & Shortcuts"
            aria-label="How to use guide"
          >
            <HelpCircle size={18} />
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Notifications"
            title="Daily Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications & Daily Tasks</span>
                <span className="text-[10px] text-indigo-600 font-semibold">{currentGrade}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <p className="font-bold text-slate-800">Daily Math Challenge Ready</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Solve today's 4-Stage questions to maintain your study streak.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-800">Science Revision: Chapter 10</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Light & Reflection flashcards scheduled for active recall.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Plan Badge */}
        {onOpenPlans && (
          <button
            type="button"
            onClick={onOpenPlans}
            className={`hidden sm:inline-flex px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
              currentTier === 'pro'
                ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                : currentTier === 'plus'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
            title="View NeoNova Subscription Plans"
          >
            {PLANS[currentTier]?.badge || 'STARTER'}
          </button>
        )}

        {/* Profile Avatar & Info or Guest Login */}
        {isGuest ? (
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full transition-all cursor-pointer shadow-xs text-xs font-semibold shrink-0 active:scale-98"
            title="Log in or create a NeoNova account"
          >
            <User size={14} className="text-white" />
            <span className="hidden sm:inline">Login / My Account</span>
            <span className="sm:hidden font-bold">Log In</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pr-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-colors cursor-pointer shadow-2xs shrink-0"
            title="Student Profile & Academic Settings"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs select-none">
              {studentAvatar || '🎓'}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[80px] sm:max-w-[110px] truncate">
              {studentName || 'Student'}
            </span>
            <span className="text-[10px] text-slate-500 hidden md:inline">
              {currentGrade ? currentGrade.replace('Grade ', 'Gr.') : 'Gr.8'}
            </span>
          </button>
        )}

        {/* Quick Log Out Button (Only for logged-in users) */}
        {!isGuest && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="hidden xl:flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-red-600 hover:bg-red-50/70 border border-transparent hover:border-red-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            title="Log Out of NeoNova"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
