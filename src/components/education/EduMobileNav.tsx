import React from 'react';
import { Home, BookOpen, Award, FileText, LayoutGrid, User, Bot, Plus, Clock } from 'lucide-react';
import { EduTab } from './EduSidebar';
import { useTranslation } from '../../lib/i18n';

interface EduMobileNavProps {
  activeTab: EduTab;
  onTabChange: (tab: EduTab) => void;
  onOpenProfile: () => void;
  onNewChat?: () => void;
  onOpenChatHistory?: () => void;
}

export default function EduMobileNav({
  activeTab,
  onTabChange,
  onOpenProfile,
  onNewChat,
  onOpenChatHistory
}: EduMobileNavProps) {
  const { t, isFinnish } = useTranslation();

  const handleStartNewChat = () => {
    onTabChange('ai_tutor');
    if (onNewChat) onNewChat();
    window.dispatchEvent(new CustomEvent('neonova_new_chat'));
  };

  const handleViewChatHistory = () => {
    onTabChange('ai_tutor');
    if (onOpenChatHistory) onOpenChatHistory();
    window.dispatchEvent(new CustomEvent('neonova_open_chat_history'));
  };

  return (
    <>
      {/* Quick contextual action bar when in AI Tutor on mobile */}
      {activeTab === 'ai_tutor' && (
        <div className="md:hidden fixed bottom-[60px] left-0 right-0 px-3 py-1.5 z-40 flex items-center justify-center gap-2 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-lg px-2 py-1 flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleStartNewChat}
              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-full shadow-2xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus size={13} />
              <span>{isFinnish ? '+ Uusi' : '+ New Chat'}</span>
            </button>
            <button
              type="button"
              onClick={handleViewChatHistory}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full border border-slate-200 transition-colors active:scale-95 cursor-pointer"
            >
              <Clock size={13} className="text-indigo-600" />
              <span>{isFinnish ? 'Historia' : 'History'}</span>
            </button>
          </div>
        </div>
      )}

      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 pt-1.5 z-40 flex items-center justify-around shadow-sm select-none"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 8px))' }}
        aria-label="Mobile Navigation"
      >
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
            activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Home Dashboard"
        >
          <Home size={19} />
          <span className="text-[10px] mt-0.5">{t.home}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('ai_tutor')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl relative ${
            activeTab === 'ai_tutor' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="AI Tutor Chat & History"
        >
          <Bot size={19} />
          <span className="text-[10px] mt-0.5">{isFinnish ? 'Keskustelu' : 'AI Chat'}</span>
          <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        <button
          type="button"
          onClick={() => onTabChange('subjects')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
            activeTab === 'subjects' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Subjects and Syllabus"
        >
          <BookOpen size={19} />
          <span className="text-[10px] mt-0.5">{t.subjects}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('homework')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors relative rounded-xl ${
            activeTab === 'homework' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="AI Homework Solver"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center -mt-3 shadow-md">
            <FileText size={16} />
          </div>
          <span className="text-[10px] mt-0.5 font-bold">{isFinnish ? 'Tekoäly' : 'AI Solve'}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('stages')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors relative rounded-xl ${
            activeTab === 'stages' ? 'text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="4-Stage Testing System"
        >
          <Award size={19} className={activeTab === 'stages' ? 'text-purple-600' : ''} />
          <span className="text-[10px] mt-0.5">{isFinnish ? '4-Vaihe' : '4-Stage'}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('study_tools')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
            activeTab === 'study_tools' || ['quiz', 'daily', 'memory', 'notes', 'three_d_lab', 'animation_lab'].includes(activeTab)
              ? 'text-indigo-600 font-bold' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Access All Features"
        >
          <LayoutGrid size={19} />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">{isFinnish ? 'Työkalut' : 'Tools'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
            activeTab === 'profile' || activeTab === 'settings' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Student Profile"
        >
          <User size={19} />
          <span className="text-[10px] mt-0.5">{isFinnish ? 'Profiili' : 'Profile'}</span>
        </button>
      </nav>
    </>
  );
}
