import React from 'react';
import { 
  X, 
  Home, 
  BookOpen, 
  Award, 
  FileText, 
  Bot, 
  Wrench, 
  Library, 
  TrendingUp, 
  Settings, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  User, 
  ChevronRight,
  Sun,
  Moon,
  Type,
  LogOut,
  LayoutGrid,
  Target,
  AlertTriangle,
  Box,
  Trophy,
  Smartphone,
  Eye
} from 'lucide-react';
import { EduTab } from './EduSidebar';
import { PlanTier, PLANS } from '../../lib/billing';
import { GRADES } from '../../types';

interface MobileDrawerNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: EduTab;
  onTabChange: (tab: EduTab) => void;
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  academicXP: number;
  currentTier: PlanTier;
  studentName: string;
  studentAvatar: string;
  fontScale: 'standard' | 'large' | 'xlarge';
  onCycleFontScale: () => void;
  onOpenPrivacyPolicy: () => void;
  username?: string;
  onLogout?: () => void;
  isGuest?: boolean;
  onOpenLogin?: () => void;
  onOpenWidgets?: () => void;
}

export default function MobileDrawerNav({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  currentGrade,
  onGradeChange,
  academicXP,
  currentTier,
  studentName,
  studentAvatar,
  fontScale,
  onCycleFontScale,
  onOpenPrivacyPolicy,
  username,
  onLogout,
  isGuest = false,
  onOpenLogin,
  onOpenWidgets
}: MobileDrawerNavProps) {
  if (!isOpen) return null;

  const navItems: { id: EduTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'ar_lab', label: 'AR Science Lab (Live Camera)', icon: Eye },
    { id: 'study_tools', label: 'All Features & Tools', icon: LayoutGrid },
    { id: 'subjects', label: 'My Subjects & Syllabi', icon: BookOpen },
    { id: 'homework', label: 'AI Homework Helper', icon: FileText },
    { id: 'practice', label: 'Adaptive Practice', icon: Target },
    { id: 'mistakes', label: 'Mistakes Review', icon: AlertTriangle },
    { id: 'stages', label: '4-Stage Testing System', icon: Award },
    { id: 'mission7', label: 'Mission 7 Championship', icon: Trophy },
    { id: 'library', label: 'Classics Reading Library', icon: Library },
    { id: 'neovision_hub', label: 'NeoVision 3D Lab', icon: Box },
    { id: 'progress', label: 'Progress & Mastery Analytics', icon: TrendingUp },
  ];

  const handleSelectTab = (tab: EduTab) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
        <div>
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs select-none">
                N
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm leading-none block">
                  NeoNova EDU
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {studentName || 'Student'} • {currentGrade}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Student Profile & Quick Actions */}
          {isGuest ? (
            <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  🎓
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Guest Explorer</div>
                  <div className="text-[10px] text-slate-500 font-medium">Free Access Mode</div>
                </div>
              </div>
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Log In
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 bg-indigo-50/50 border-b border-indigo-100/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl select-none">{studentAvatar}</span>
                <div>
                  <div className="text-xs font-bold text-slate-800">{studentName}</div>
                  <div className="text-[10px] text-indigo-700 font-semibold font-mono">{academicXP} Study XP</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSelectTab('profile')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors"
              >
                Profile
              </button>
            </div>
          )}

          {/* Grade Level Quick Selector */}
          <div className="p-3 border-b border-slate-100">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Academic Grade Level
            </label>
            <select
              value={currentGrade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              {GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Main Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-2 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                    {item.id === 'ar_lab' && (
                      <span className="text-[9px] font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-1.5 py-0.2 rounded-full font-mono shadow-2xs">
                        AR
                      </span>
                    )}
                    {item.id === 'study_tools' && (
                      <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-mono">
                        All 25+
                      </span>
                    )}
                  </div>
                  {isActive && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings & Accessibility in Drawer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2 pb-safe">
          {/* Quick Font Size Switcher for Mobile Accessibility */}
          <div className="flex items-center justify-between px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Type size={14} className="text-indigo-600" />
              <span>Text Size</span>
            </div>
            <button
              type="button"
              onClick={onCycleFontScale}
              className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono text-[11px] font-bold"
              title="Click to toggle Normal, Large, or Extra Large text size"
            >
              {fontScale === 'standard' ? 'Normal' : fontScale === 'large' ? 'Large 🔍' : 'X-Large 🔎'}
            </button>
          </div>

          {/* Subscription Banner */}
          <button
            type="button"
            onClick={() => handleSelectTab('plans')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-xs font-semibold text-indigo-800"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              <span>{PLANS[currentTier]?.name || 'Plan'}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-white rounded border border-indigo-200">
              {PLANS[currentTier]?.badge || 'STARTER'}
            </span>
          </button>

          {onOpenWidgets && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWidgets();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/60 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone size={16} className="text-indigo-600" />
                <span>Phone Widgets & Alarms</span>
              </div>
              <span className="text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded-full">New</span>
            </button>
          )}

          <button
            onClick={() => handleSelectTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left ${
              activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-white'
            }`}
          >
            <Settings size={16} className="text-slate-400" />
            <span>Settings & Preferences</span>
          </button>

          <button
            onClick={() => {
              onOpenPrivacyPolicy();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-white text-left"
          >
            <ShieldCheck size={16} className="text-slate-400" />
            <span>COPPA Privacy & Safety</span>
          </button>

          {isGuest && onOpenLogin && (
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-left cursor-pointer transition-colors shadow-2xs"
            >
              <User size={16} />
              <span>Login / My Account</span>
            </button>
          )}

          {!isGuest && onLogout && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer transition-colors"
            >
              <LogOut size={16} className="text-rose-500" />
              <span>Sign Out of NeoNova</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
