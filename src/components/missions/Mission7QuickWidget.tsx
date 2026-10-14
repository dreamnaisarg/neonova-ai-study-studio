import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Award, 
  ChevronRight, 
  CheckCircle2, 
  Trophy, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { getMission7State } from '../../lib/mission7Storage';
import { Mission7State } from '../../types/mission7';

interface Mission7QuickWidgetProps {
  onOpenEventHub: () => void;
  studentName?: string;
  grade?: string;
  className?: string;
}

export default function Mission7QuickWidget({
  onOpenEventHub,
  studentName = 'Student',
  grade = 'Grade 8',
  className = ''
}: Mission7QuickWidgetProps) {
  const [state, setState] = useState<Mission7State>(() => getMission7State(studentName, grade));

  useEffect(() => {
    const handleUpdate = () => {
      setState(getMission7State(studentName, grade));
    };
    window.addEventListener('neonova_mission7_updated', handleUpdate);
    return () => window.removeEventListener('neonova_mission7_updated', handleUpdate);
  }, [studentName, grade]);

  const completedCount = state.tasks.filter(t => t.status === 'completed' || t.status === 'claimed').length;
  const progressPct = Math.round((completedCount / 7) * 100);
  const claimableCount = state.tasks.filter(t => t.status === 'completed').length;

  return (
    <div 
      onClick={onOpenEventHub}
      className={`group relative p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/40 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Trophy size={22} className="animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                ACTIVE EVENT
              </span>
              <span className="text-xs font-bold text-slate-800">
                Mission 7 Championship
              </span>
              {claimableCount > 0 && (
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                  {claimableCount} Claimable XP!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {completedCount === 7 
                ? 'All 7 event missions conquered! Tap to claim your Grand Champion Certificate.' 
                : `${completedCount} of 7 missions completed • Earn up to +700 Bonus XP & official Certificate.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 hidden md:block">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white group-hover:bg-amber-50 text-slate-800 font-bold text-xs border border-slate-200/90 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>View Event</span>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
