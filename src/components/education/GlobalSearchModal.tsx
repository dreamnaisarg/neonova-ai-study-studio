import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, FileText, CheckCircle2, FlaskConical, Bot, ArrowRight, CornerDownLeft, Award, Camera, Layers, Clock } from 'lucide-react';
import { EduTab } from './EduSidebar';

interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  type: 'subject' | 'chapter' | 'tool' | 'action';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: EduTab) => void;
  onAskQuestion: (q: string) => void;
  onLaunchTool: (toolId: string) => void;
  currentGrade: string;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigateTab,
  onAskQuestion,
  onLaunchTool,
  currentGrade
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sampleSearchDatabase: SearchResultItem[] = [
    {
      id: 'sub-math',
      title: 'Mathematics – Fractions & Decimals',
      category: 'Curriculum Subject',
      type: 'chapter',
      icon: BookOpen,
      action: () => {
        onNavigateTab('subjects');
        onClose();
      }
    },
    {
      id: 'sub-science-light',
      title: 'Science – Light, Lenses & Reflection',
      category: 'Curriculum Subject',
      type: 'chapter',
      icon: BookOpen,
      action: () => {
        onNavigateTab('subjects');
        onClose();
      }
    },
    {
      id: 'sub-science-photo',
      title: 'Science – Photosynthesis & Chloroplasts',
      category: 'Curriculum Subject',
      type: 'chapter',
      icon: BookOpen,
      action: () => {
        onAskQuestion('Explain photosynthesis and the chemical process of glucose generation');
        onClose();
      }
    },
    {
      id: 'sub-eng',
      title: 'English – Clauses, Sentence Structure & Grammar',
      category: 'Curriculum Subject',
      type: 'chapter',
      icon: BookOpen,
      action: () => {
        onNavigateTab('subjects');
        onClose();
      }
    },
    {
      id: 'tool-stages',
      title: '4-Stage Subject Testing System (Easy, Medium, Hard, Mixed Exam)',
      category: 'Exams & Mastery',
      type: 'tool',
      icon: Award,
      action: () => {
        onNavigateTab('stages');
        onClose();
      }
    },
    {
      id: 'tool-homework',
      title: 'AI Homework Helper (Step-by-Step Solver)',
      category: 'Homework Tool',
      type: 'tool',
      icon: FileText,
      action: () => {
        onNavigateTab('homework');
        onClose();
      }
    },
    {
      id: 'tool-scanner',
      title: 'Optical Homework Scanner (Camera Worksheet OCR)',
      category: 'Homework Tool',
      type: 'tool',
      icon: Camera,
      action: () => {
        onLaunchTool('scanner');
        onClose();
      }
    },
    {
      id: 'tool-quiz',
      title: 'Practice Quiz (Curriculum Assessment)',
      category: 'Practice Tool',
      type: 'tool',
      icon: CheckCircle2,
      action: () => {
        onLaunchTool('quiz');
        onClose();
      }
    },
    {
      id: 'tool-memory',
      title: 'Memory Booster (Spaced Flashcards)',
      category: 'Revision Tool',
      type: 'tool',
      icon: FileText,
      action: () => {
        onLaunchTool('memory');
        onClose();
      }
    },
    {
      id: 'tool-lab',
      title: 'Scientific 3D Lab (Anatomy Atlas & Organ Slicing)',
      category: 'Science Simulation',
      type: 'tool',
      icon: Layers,
      action: () => {
        onLaunchTool('three_d_lab');
        onClose();
      }
    },
    {
      id: 'tool-animation',
      title: 'Kinetic Physics Animation Lab',
      category: 'Science Simulation',
      type: 'tool',
      icon: FlaskConical,
      action: () => {
        onLaunchTool('animation_lab');
        onClose();
      }
    },
    {
      id: 'tool-daily',
      title: 'Daily 5-Question Challenge',
      category: 'Daily Streak',
      type: 'tool',
      icon: Clock,
      action: () => {
        onLaunchTool('daily');
        onClose();
      }
    },
    {
      id: 'tool-library',
      title: 'Classics Educational Library',
      category: 'Learning Resources',
      type: 'tool',
      icon: BookOpen,
      action: () => {
        onNavigateTab('library');
        onClose();
      }
    }
  ];

  const results = query.trim()
    ? sampleSearchDatabase.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : sampleSearchDatabase.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-3.5 border-b border-slate-200 flex items-center gap-3">
          <Search size={18} className="text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                onAskQuestion(query.trim());
                onClose();
              }
            }}
            placeholder={`Search subjects, chapters, questions in ${currentGrade}...`}
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-mono font-medium cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                onAskQuestion(query.trim());
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100/90 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-indigo-900">
                    Ask NeoNova: "{query}"
                  </div>
                  <div className="text-[11px] text-indigo-600">
                    Get instant step-by-step educational explanation
                  </div>
                </div>
              </div>
              <CornerDownLeft size={14} className="text-indigo-600" />
            </button>
          )}

          <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {query.trim() ? 'Matching Results' : 'Suggested Topics & Tools'}
          </div>

          {results.map((res) => {
            const Icon = res.icon;
            return (
              <button
                key={res.id}
                type="button"
                onClick={res.action}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 text-left flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      {res.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {res.category}
                    </div>
                  </div>
                </div>
                <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 px-4 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with arrow keys or enter to search</span>
          <span className="font-mono text-indigo-600 font-semibold">{currentGrade}</span>
        </div>
      </div>
    </div>
  );
}
