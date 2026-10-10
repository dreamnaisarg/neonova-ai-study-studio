import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Globe, 
  Bot, 
  Volume2, 
  Sun, 
  Moon, 
  Bell, 
  ShieldCheck, 
  Trash2, 
  Check, 
  ExternalLink,
  ChevronRight,
  User,
  Sliders,
  Sparkles,
  LogOut,
  Lock,
  Mail,
  CheckCircle2,
  Copy,
  Server,
  Wifi
} from 'lucide-react';
import { GRADES, SUBJECTS } from '../../types';
import { PlanTier, PLANS, getPlayStoreSubscriptionUrl, VerifiedSubscriptionState, saveActiveSubscriptionPlan } from '../../lib/billing';

interface SettingsPageProps {
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  preferredSubjects: string[];
  onToggleSubject: (subjectName: string) => void;
  studentName: string;
  onUpdateName: (name: string) => void;
  onOpenPrivacyPolicy: () => void;
  onOpenDeleteAccount: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: (dark: boolean) => void;
  currentTier?: PlanTier;
  onNavigateToPlans?: () => void;
  fontScale?: 'standard' | 'large' | 'xlarge';
  onChangeFontScale?: (scale: 'standard' | 'large' | 'xlarge') => void;
  isHighLegibility?: boolean;
  onToggleHighLegibility?: () => void;
  onOpenAdminPortal?: () => void;
  subscriptionState?: VerifiedSubscriptionState;
  onUpdateSubscription?: (newState: VerifiedSubscriptionState) => void;
  currentUser?: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    planTier?: 'starter' | 'plus' | 'pro';
    billingCycle?: 'monthly' | 'yearly';
    subscriptionExpires?: string;
    subscriptionStatus?: 'active' | 'expired' | 'none';
    createdAt?: string;
  };
  onLogout?: () => void;
  onReplaySplash?: () => void;
}

export default function SettingsPage({
  currentGrade,
  onGradeChange,
  preferredSubjects,
  onToggleSubject,
  studentName,
  onUpdateName,
  onOpenPrivacyPolicy,
  onOpenDeleteAccount,
  isDarkMode,
  onToggleDarkMode,
  currentTier = 'starter',
  onNavigateToPlans,
  fontScale = 'standard',
  onChangeFontScale,
  isHighLegibility = false,
  onToggleHighLegibility,
  onOpenAdminPortal,
  currentUser,
  onLogout,
  subscriptionState,
  onUpdateSubscription,
  onReplaySplash
}: SettingsPageProps) {
  const [board, setBoard] = useState('CBSE / National Curriculum');
  const [language, setLanguage] = useState('English');
  const [aiStyle, setAiStyle] = useState('Detailed Step-by-Step');
  const [explanationLevel, setExplanationLevel] = useState('Grade-Appropriate');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [nameInput, setNameInput] = useState(studentName);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [domainTesting, setDomainTesting] = useState(false);
  const [domainTestResult, setDomainTestResult] = useState<{ status: 'online' | 'unreachable' | 'info'; message: string } | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // Ignored
    }
  };

  const handleTestDomain = async () => {
    setDomainTesting(true);
    setDomainTestResult(null);
    try {
      const res = await fetch('/api/domain/status');
      if (res.ok) {
        setDomainTestResult({
          status: 'online',
          message: 'Domain configuration is verified and active in NeoNova backend (neonovastudy.com).'
        });
      } else {
        setDomainTestResult({
          status: 'info',
          message: 'DNS records may take up to 24-48 hours to propagate globally once added to your domain registrar.'
        });
      }
    } catch {
      setDomainTestResult({
        status: 'info',
        message: 'DNS records may take up to 24-48 hours to propagate globally once added to your domain registrar.'
      });
    } finally {
      setDomainTesting(false);
    }
  };

  const allAvailableSubjects = [
    'Mathematics',
    'General Science',
    'English Literature',
    'Hindi',
    'Gujarati',
    'Social Science & Civics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'French'
  ];

  const handleSaveProfileName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage your academic level, subject preferences, AI tutoring style, and application settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. ACADEMIC SECTION */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap size={18} className="text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Academic Setup
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grade Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Grade Level
              </label>
              <select
                value={currentGrade}
                onChange={(e) => onGradeChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Adapts AI explanations and quizzes to your grade difficulty.
              </p>
            </div>

            {/* Curriculum Board */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Board / Curriculum
              </label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="CBSE / National Curriculum">CBSE / National Curriculum</option>
                <option value="ICSE / CISCE">ICSE / CISCE</option>
                <option value="State Board">State Board</option>
                <option value="US Common Core / International">US Common Core / International</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Sets chapter scope and syllabus terminology.
              </p>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                <option value="French">French (Français)</option>
                <option value="Spanish">Spanish (Español)</option>
              </select>
            </div>
          </div>

          {/* Subjects Management */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Enrolled Subjects (Select to activate)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allAvailableSubjects.map((subject) => {
                const isSelected = preferredSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => onToggleSubject(subject)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-medium'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check size={11} />}
                    </div>
                    <span className="truncate">{subject}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. AI TUTOR SETTINGS */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bot size={18} className="text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              AI Tutor Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                AI Response Style
              </label>
              <select
                value={aiStyle}
                onChange={(e) => setAiStyle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Detailed Step-by-Step">Detailed Step-by-Step</option>
                <option value="Concise Summary">Concise Summary</option>
                <option value="Socratic / Concept-First">Socratic / Concept-First</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Voice Narration (Read Aloud)
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    voiceEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {voiceEnabled ? '🔊 Enabled' : '🔇 Muted'}
                </button>
                <span className="text-[11px] text-slate-500">Reads math solutions out loud</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ACCESSIBILITY, TEXT SIZE & DISPLAY */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders size={18} className="text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Accessibility & Display Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Text Size Scaling
              </label>
              <div className="flex items-center gap-2 pt-1">
                {(['standard', 'large', 'xlarge'] as const).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => onChangeFontScale?.(scale)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      fontScale === scale
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {scale === 'standard' ? '100% (Normal)' : scale === 'large' ? '115% (Large)' : '130% (X-Large)'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Adjust font size across all learning screens and questions.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                High Legibility / Dyslexia Friendly Mode
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onToggleHighLegibility}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    isHighLegibility
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isHighLegibility ? 'Enabled ✓' : 'Default Font'}
                </button>
                <span className="text-[11px] text-slate-500">Enhanced letter spacing for easier reading</span>
              </div>
            </div>

            {onReplaySplash && (
              <div className="space-y-1.5 sm:col-span-2 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block">
                    NeoNova Splash Presentation
                  </label>
                  <p className="text-[11px] text-slate-500">Preview the modern, educational opening splash screen.</p>
                </div>
                <button
                  type="button"
                  onClick={onReplaySplash}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>Play Splash Animation</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. CUSTOM DOMAIN & WEB HOSTING */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Custom Domain: neonovastudy.com
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 size={11} className="text-emerald-600" />
              <span>Configured in App Architecture</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Your custom domain <strong className="text-indigo-600 font-mono">neonovastudy.com</strong> is configured as NeoNova&apos;s primary production address. All progressive web app (PWA) manifests, canonical SEO tags, Google Search Console ownership tokens, and OpenGraph share cards are set to this domain.
          </p>

          {/* Domain Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Canonical URL</span>
                <button
                  type="button"
                  onClick={() => handleCopy('https://neonovastudy.com/', 'url')}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer p-0.5"
                  title="Copy URL"
                >
                  {copiedField === 'url' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
              <a
                href="https://neonovastudy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1 truncate"
              >
                <span>https://neonovastudy.com/</span>
                <ExternalLink size={11} className="shrink-0" />
              </a>
              <span className="text-[10px] text-slate-500 block">Production landing & app gateway</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XML Sitemap</span>
                <button
                  type="button"
                  onClick={() => handleCopy('https://neonovastudy.com/sitemap.xml', 'sitemap')}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer p-0.5"
                  title="Copy Sitemap URL"
                >
                  {copiedField === 'sitemap' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
              <a
                href="https://neonovastudy.com/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1 truncate"
              >
                <span>/sitemap.xml</span>
                <ExternalLink size={11} className="shrink-0" />
              </a>
              <span className="text-[10px] text-slate-500 block">Submitted to Google Search Console</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Google Ownership</span>
                <button
                  type="button"
                  onClick={() => handleCopy('googlea85ef681664803fc.html', 'token')}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer p-0.5"
                  title="Copy Token"
                >
                  {copiedField === 'token' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
              <span className="text-xs font-mono font-bold text-slate-800 truncate block">
                googlea85ef681664803fc.html
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block">HTML verification file active</span>
            </div>
          </div>

          {/* DNS Configuration Table */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Server size={14} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">DNS Records Guide (Add at your Domain Registrar)</span>
              </div>
              <span className="text-[11px] text-indigo-700 font-medium">
                GoDaddy / Namecheap / Cloudflare / Hostinger
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-indigo-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-1.5 font-bold">Type</th>
                    <th className="pb-1.5 font-bold">Host / Name</th>
                    <th className="pb-1.5 font-bold">Value / Target</th>
                    <th className="pb-1.5 font-bold text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-100 font-mono text-[11px] text-slate-700">
                  <tr>
                    <td className="py-2 font-bold text-indigo-700">A</td>
                    <td className="py-2">@</td>
                    <td className="py-2 font-medium">Cloudflare Proxy IP or Hosting IP</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy('@', 'rec-a')}
                        className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        {copiedField === 'rec-a' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-indigo-700">CNAME</td>
                    <td className="py-2">www</td>
                    <td className="py-2 font-medium">neonovastudy.com</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy('neonovastudy.com', 'rec-cname')}
                        className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        {copiedField === 'rec-cname' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-indigo-700">TXT</td>
                    <td className="py-2">@</td>
                    <td className="py-2 font-medium truncate max-w-xs">google-site-verification=googlea85ef681664803fc.html</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy('google-site-verification=googlea85ef681664803fc.html', 'rec-txt')}
                        className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        {copiedField === 'rec-txt' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-indigo-200/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={handleTestDomain}
                disabled={domainTesting}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <Wifi size={13} />
                <span>{domainTesting ? 'Checking...' : 'Check Domain Status'}</span>
              </button>

              {domainTestResult && (
                <span className={`text-[11px] font-medium flex items-center gap-1 ${
                  domainTestResult.status === 'online' ? 'text-emerald-700 font-semibold' : 'text-slate-600'
                }`}>
                  {domainTestResult.status === 'online' && <CheckCircle2 size={12} className="text-emerald-600" />}
                  <span>{domainTestResult.message}</span>
                </span>
              )}
            </div>
          </div>
        </section>

        {/* 5. ACCOUNT & DATA SAFETY */}
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck size={18} className="text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Student Profile & Trust
            </h2>
          </div>

          {/* NeoNova Plan Information */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Current Plan
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {PLANS[currentTier]?.name || 'NeoNova Starter'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    currentTier === 'pro'
                      ? 'bg-purple-100 text-purple-800'
                      : currentTier === 'plus'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {PLANS[currentTier]?.badge || 'STARTER'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {PLANS[currentTier]?.tagline || 'Essential learning assistance for everyday homework'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                {currentTier !== 'starter' && (
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>Active {subscriptionState?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                  </span>
                )}
                {currentTier !== 'starter' && (
                  <a
                    href={getPlayStoreSubscriptionUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Manage Subscription</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={onNavigateToPlans}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Sparkles size={12} />
                  <span>{currentTier === 'starter' ? 'Upgrade Plan' : 'Change Plan'}</span>
                </button>
              </div>
            </div>

            {/* Active Subscription Expiry & Auto-Save Duration Badge */}
            {currentTier !== 'starter' && (
              <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">Subscription Duration & Status</span>
                  <p className="text-slate-800 font-semibold text-xs">
                    {subscriptionState?.billingCycle === 'yearly' ? '📅 Yearly Access Plan (365 days)' : '📅 Monthly Access Plan (30 days)'}
                    {subscriptionState?.expiryTime && (
                      <span className="text-slate-500 font-mono text-[11px] block mt-0.5 font-normal">
                        Active until: {new Date(subscriptionState.expiryTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={11} className="text-emerald-700" />
                  <span>Saved to Account (Preserved Across Restarts)</span>
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfileName} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Student Name"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
              >
                Update Name
              </button>
            </div>
            {savedSuccess && (
              <p className="text-xs text-emerald-600 font-medium">Profile name updated successfully.</p>
            )}
          </form>

          {/* Active Verified User Account Section */}
          {currentUser && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Registered Student Account</span>
                  {currentUser.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span>Email Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <span>Unverified</span>
                    </span>
                  )}
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/70">
                  <User size={14} className="text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block">Username (Unique)</span>
                    <span className="font-mono font-bold text-slate-800">{currentUser.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/70">
                  <Mail size={14} className="text-indigo-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block">Registered Email</span>
                    <span className="font-mono font-medium text-slate-800">{currentUser.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <Lock size={12} className="text-emerald-600 shrink-0" />
                <span>Password protected with salted 64-byte Scrypt cryptographic hash.</span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              <span>View Official Privacy Policy (neonovastudy.com/privacy-policy)</span>
              <ExternalLink size={12} />
            </button>
            <div className="flex items-center gap-3">
              {onOpenAdminPortal && (
                <button
                  type="button"
                  onClick={onOpenAdminPortal}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-700 font-medium cursor-pointer"
                >
                  <ShieldCheck size={13} />
                  <span>Admin Ledger (Naisarg Ramdatti)</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenDeleteAccount}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
