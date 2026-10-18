import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Bot, 
  Wrench, 
  Library, 
  TrendingUp, 
  Settings, 
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  FlaskConical,
  Award,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
  Target,
  AlertTriangle,
  User,
  Box,
  LayoutGrid,
  Smartphone,
  Eye
} from 'lucide-react';
import { PlanTier, PLANS } from '../../lib/billing';
import NeoNovaLogo from '../common/NeoNovaLogo';

export type EduTab = 
  | 'home' 
  | 'ar_lab'
  | 'stages'
  | 'mission7'
  | 'subjects' 
  | 'homework'
  | 'practice'
  | 'mistakes'
  | 'progress'
  | 'library' 
  | 'neovision_hub'
  | 'profile'
  | 'ai_tutor' 
  | 'study_tools' 
  | 'settings' 
  | 'help'
  | 'plans'
  | 'quiz'
  | 'daily'
  | 'memory'
  | 'notes'
  | 'alerts'
  | 'career'
  | 'three_d_lab'
  | 'animation_lab'
  | 'neovision_deck';

interface EduSidebarProps {
  activeTab: EduTab;
  onTabChange: (tab: EduTab) => void;
  onOpenPrivacyPolicy?: () => void;
  academicXP?: number;
  currentGrade?: string;
  currentTier?: PlanTier;
  onOpenHelpGuide?: () => void;
  isGuest?: boolean;
  onOpenLogin?: () => void;
  onOpenWidgets?: () => void;
}

const SIDEBAR_COLLAPSE_KEY = 'neonova_sidebar_collapsed';

export default function EduSidebar({
  activeTab,
  onTabChange,
  onOpenPrivacyPolicy,
  academicXP = 0,
  currentGrade = 'Grade 8',
  currentTier = 'starter',
  onOpenHelpGuide,
  isGuest = false,
  onOpenLogin,
  onOpenWidgets
}: EduSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const primaryNavItems: { id: EduTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ar_lab', label: 'AR Science Lab', icon: Eye },
    { id: 'stages', label: '4-Stage Mastery', icon: Award },
    { id: 'mission7', label: 'Mission 7', icon: Trophy },
    { id: 'study_tools', label: 'All Features', icon: LayoutGrid },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'homework', label: 'AI Homework', icon: FileText },
    { id: 'practice', label: 'Practice', icon: Target },
    { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'library', label: 'Classic Hub', icon: Library },
    { id: 'neovision_hub', label: 'NeoVision', icon: Box },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 bg-white border-r border-slate-200/80 shrink-0 select-none overflow-y-auto transition-all duration-200 z-20 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
      aria-label="Desktop and Tablet Sidebar Navigation"
    >
      {/* Upper Navigation Section */}
      <div className="p-3 space-y-4">
        {/* Brand Kicker / Status & Collapse Toggle */}
        <div className={`p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center ${isCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <NeoNovaLogo size={22} className="shrink-0" />
              <span className="text-xs font-semibold text-slate-800 truncate">Academic Studio</span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-1 rounded">{currentGrade}</span>
            </div>
          ) : (
            <NeoNovaLogo size={26} className="shrink-0" />
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar for wider workspace"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {!isCollapsed && (
            <div className="px-2.5 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
          )}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} min-w-0`}>
                  <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.id === 'ar_lab' && (
                        <span className="text-[9px] font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-1.5 py-0.2 rounded-full font-mono shadow-2xs">
                          AR
                        </span>
                      )}
                      {item.id === 'study_tools' && (
                        <span className="text-[9px] font-bold bg-indigo-100/90 text-indigo-700 px-1.5 py-0.2 rounded-full font-mono">
                          25+
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {!isCollapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings, Plan & Help */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {/* Subscription Plan Card */}
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Plan</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                currentTier === 'pro'
                  ? 'bg-purple-100 text-purple-800'
                  : currentTier === 'plus'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {PLANS[currentTier]?.badge || 'STARTER'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onTabChange('plans')}
              className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                currentTier === 'starter'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Sparkles size={12} className={currentTier === 'starter' ? 'text-white' : 'text-indigo-600'} />
              <span>{currentTier === 'starter' ? 'Upgrade to Plus' : 'View All Plans'}</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onTabChange('plans')}
            title={`Plan: ${PLANS[currentTier]?.badge || 'STARTER'}`}
            className="w-full py-2 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles size={16} />
          </button>
        )}

        {/* Academic XP Badge */}
        {academicXP > 0 && !isCollapsed && (
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
              <Award size={14} className="text-indigo-600" />
              <span>Study Points</span>
            </div>
            <span className="font-bold text-indigo-800 font-mono">{academicXP} XP</span>
          </div>
        )}

        {/* Guest Login Option */}
        {isGuest && onOpenLogin && (
          <button
            type="button"
            onClick={onOpenLogin}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'} py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 border border-indigo-200/90 transition-all cursor-pointer text-left shadow-2xs`}
            title="Log in or create a NeoNova account"
          >
            <User size={18} className="text-indigo-600 shrink-0" />
            {!isCollapsed && <span>Login / My Account</span>}
          </button>
        )}

        {/* Phone Home Screen Widgets & Alarms */}
        {onOpenWidgets && (
          <button
            type="button"
            onClick={onOpenWidgets}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors cursor-pointer text-left`}
            title="Phone Home Screen Widgets & Daily Study Alarms"
          >
            <Smartphone size={18} className="text-indigo-600 shrink-0" />
            {!isCollapsed && <span>Phone Widgets & Alarms</span>}
          </button>
        )}

        <button
          onClick={() => onTabChange('settings')}
          title="Settings & Preferences"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
            activeTab === 'settings'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings size={18} className={activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'} />
          {!isCollapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => {
            if (onOpenHelpGuide) {
              onOpenHelpGuide();
            } else {
              onTabChange('help');
            }
          }}
          title="How to Use & Accessibility Guide"
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
            activeTab === 'help'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle size={18} className={activeTab === 'help' ? 'text-indigo-600' : 'text-slate-400'} />
          {!isCollapsed && <span>Help & Shortcuts</span>}
        </button>
      </div>
    </aside>
  );
}
