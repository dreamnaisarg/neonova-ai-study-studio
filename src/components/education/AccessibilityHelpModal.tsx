import React from 'react';
import { 
  X, 
  HelpCircle, 
  Camera, 
  Sparkles, 
  Award, 
  Volume2, 
  Type, 
  Command, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck, 
  Keyboard 
} from 'lucide-react';

interface AccessibilityHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontScale: 'standard' | 'large' | 'xlarge';
  onCycleFontScale: () => void;
  isHighLegibility: boolean;
  onToggleHighLegibility: () => void;
}

export default function AccessibilityHelpModal({
  isOpen,
  onClose,
  fontScale,
  onCycleFontScale,
  isHighLegibility,
  onToggleHighLegibility
}: AccessibilityHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-guide-title"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 id="help-guide-title" className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                How to Use NeoNova & Accessibility
              </h2>
              <p className="text-xs text-slate-500">
                Quick guidance designed for all students, parents, and devices.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close user guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Accessibility Quick Controls */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={16} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Readability & Accessibility Controls
                </span>
              </div>
              <span className="text-[10px] text-indigo-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                Universal Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-indigo-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">Text Size</div>
                  <div className="text-[11px] text-slate-500">Scale interface text</div>
                </div>
                <button
                  type="button"
                  onClick={onCycleFontScale}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {fontScale === 'standard' ? 'Normal (100%)' : fontScale === 'large' ? 'Large (115%)' : 'Extra Large (130%)'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-indigo-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">High Legibility Font</div>
                  <div className="text-[11px] text-slate-500">Dyslexia-friendly spacing</div>
                </div>
                <button
                  type="button"
                  onClick={onToggleHighLegibility}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isHighLegibility 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isHighLegibility ? 'Active ✓' : 'Default'}
                </button>
              </div>
            </div>
          </div>

          {/* Core Feature Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Core Capabilities & Navigation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                  <Camera size={16} />
                  <span>Optic Homework Scanner</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tap the camera icon in the top header or homework bar to snap or upload math sheets, diagrams, and textbook questions.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                  <Award size={16} />
                  <span>4-Stage Testing System</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Progress systematically through Stage 1 (Easy), Stage 2 (Medium), Stage 3 (Hard), and Stage 4 (Full Exam) to master any chapter.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                  <Sparkles size={16} />
                  <span>Help Me Understand</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tap "Help Me Understand" on any question to view real-world everyday analogies, why it works, and common mistakes to avoid.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <Volume2 size={16} />
                  <span>Voice Dictation & Read Aloud</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tap the microphone to speak your question, or tap the speaker icon on any solution to have NeoNova AI Tutor read it aloud clearly.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop & Windows Keyboard Shortcuts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard size={14} />
              <span>Keyboard Shortcuts (Desktop & Windows)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-slate-600">Quick Search</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                  Ctrl+K / ⌘K
                </kbd>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-slate-600">Close Modals</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                  Esc
                </kbd>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-slate-600">Send Homework</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-700 shadow-2xs">
                  Enter
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Got It, Back to Studying
          </button>
        </div>
      </div>
    </div>
  );
}
