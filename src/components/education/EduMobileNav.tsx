import React from 'react';
import { Home, BookOpen, Award, FileText, LayoutGrid, User } from 'lucide-react';
import { EduTab } from './EduSidebar';

interface EduMobileNavProps {
  activeTab: EduTab;
  onTabChange: (tab: EduTab) => void;
  onOpenProfile: () => void;
}

export default function EduMobileNav({
  activeTab,
  onTabChange,
  onOpenProfile
}: EduMobileNavProps) {
  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 pt-1.5 z-40 flex items-center justify-around shadow-sm select-none"
      style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 8px))' }}
      aria-label="Mobile Navigation"
    >
      <button
        type="button"
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
          activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-label="Home Dashboard"
      >
        <Home size={20} />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('subjects')}
        className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
          activeTab === 'subjects' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-label="Subjects and Syllabus"
      >
        <BookOpen size={20} />
        <span className="text-[10px] mt-0.5">Subjects</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('stages')}
        className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors relative rounded-xl ${
          activeTab === 'stages' ? 'text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-label="4-Stage Testing System"
      >
        <Award size={20} className={activeTab === 'stages' ? 'text-purple-600' : ''} />
        <span className="text-[10px] mt-0.5">4-Stage</span>
        <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </button>

      <button
        type="button"
        onClick={() => onTabChange('homework')}
        className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors relative rounded-xl ${
          activeTab === 'homework' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-label="AI Homework Solver"
      >
        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center -mt-3.5 shadow-md">
          <FileText size={17} />
        </div>
        <span className="text-[10px] mt-0.5 font-bold">AI Solve</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('study_tools')}
        className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
          activeTab === 'study_tools' || ['quiz', 'daily', 'memory', 'notes', 'three_d_lab', 'animation_lab'].includes(activeTab)
            ? 'text-indigo-600 font-bold' 
            : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-label="Access All Features"
      >
        <LayoutGrid size={20} />
        <span className="text-[10px] mt-0.5 whitespace-nowrap">All Features</span>
      </button>

      <button
        type="button"
        onClick={onOpenProfile}
        className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-1 cursor-pointer transition-colors rounded-xl ${
          activeTab === 'profile' || activeTab === 'settings' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
        aria-label="Student Profile"
      >
        <User size={20} />
        <span className="text-[10px] mt-0.5">Profile</span>
      </button>
    </nav>
  );
}
