import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Award, 
  ChevronDown, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  BrainCircuit, 
  FlaskConical, 
  Layers, 
  Clock, 
  Home,
  Wrench
} from 'lucide-react';
import { EduTab } from './EduSidebar';

export interface QuickToolOption {
  id: string;
  tabId: EduTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

interface ToolHeaderBarProps {
  title: string;
  category: string;
  description?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onBack: () => void;
  backLabel?: string;
  currentGrade?: string;
  academicXP?: number;
  onNavigateTab?: (tab: EduTab) => void;
  activeTab?: EduTab;
}

export default function ToolHeaderBar({
  title,
  category,
  description,
  icon: Icon,
  onBack,
  backLabel = 'Back to Tools',
  currentGrade,
  academicXP,
  onNavigateTab,
  activeTab
}: ToolHeaderBarProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const quickTools: QuickToolOption[] = [
    { id: 'stages', tabId: 'stages', label: '4-Stage Testing', icon: Award, badge: 'Popular' },
    { id: 'homework', tabId: 'homework', label: 'AI Homework Helper', icon: FileText },
    { id: 'quiz', tabId: 'quiz', label: 'Practice Quiz', icon: CheckCircle2 },
    { id: 'daily', tabId: 'daily', label: 'Daily Challenge', icon: Clock },
    { id: 'memory', tabId: 'memory', label: 'Memory Booster', icon: BrainCircuit },
    { id: 'three_d_lab', tabId: 'three_d_lab', label: '3D Anatomy Lab', icon: Layers },
    { id: 'animation_lab', tabId: 'animation_lab', label: 'Animation Lab', icon: FlaskConical },
    { id: 'notes', tabId: 'notes', label: 'Notes & Summary', icon: BookOpen },
    { id: 'ai_tutor', tabId: 'ai_tutor', label: 'NeoNova AI Tutor', icon: Sparkles },
    { id: 'library', tabId: 'library', label: 'Classics Library', icon: BookOpen },
    { id: 'alerts', tabId: 'alerts', label: 'Study Alerts & Tasks', icon: Clock },
    { id: 'career', tabId: 'career', label: 'Career Matcher', icon: Award },
  ];

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs mb-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back Button & Title Info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{backLabel}</span>
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Icon size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded-full">
                  {category}
                </span>
                {currentGrade && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    • {currentGrade}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {title}
              </h2>
            </div>
          </div>
        </div>

        {/* Right: Quick Switcher & XP */}
        <div className="flex items-center gap-2 relative ml-auto">
          {academicXP !== undefined && academicXP > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold font-mono">
              <Award size={13} className="text-amber-600" />
              <span>{academicXP} XP</span>
            </div>
          )}

          {onNavigateTab && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Wrench size={13} className="text-indigo-600" />
                <span className="hidden sm:inline">Switch Tool</span>
                <span className="sm:hidden">Tools</span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {switcherOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setSwitcherOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick Jump to Feature
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-0.5">
                      {quickTools.map((tool) => {
                        const ToolIcon = tool.icon;
                        const isCurrent = activeTab === tool.tabId;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => {
                              setSwitcherOpen(false);
                              onNavigateTab(tool.tabId);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                              isCurrent
                                ? 'bg-indigo-50 text-indigo-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ToolIcon size={14} className={isCurrent ? 'text-indigo-600' : 'text-slate-500'} />
                              <span>{tool.label}</span>
                            </div>
                            {tool.badge && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                                {tool.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs text-slate-500 pt-0.5 border-t border-slate-100">
          {description}
        </p>
      )}
    </div>
  );
}
