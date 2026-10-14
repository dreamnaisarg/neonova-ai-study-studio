import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Share2, 
  Award, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  Lock, 
  RotateCcw,
  Zap,
  BookOpen,
  Camera,
  Target,
  FileText,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { 
  Mission7State, 
  Mission7Task, 
  Mission7TaskId, 
  Mission7Badge 
} from '../../types/mission7';
import { 
  getMission7State, 
  claimMission7Reward, 
  resetMission7State 
} from '../../lib/mission7Storage';
import Mission7CertificateModal from './Mission7CertificateModal';
import Mission7ShareModal from './Mission7ShareModal';

interface Mission7EventHubProps {
  studentName?: string;
  currentGrade?: string;
  curriculumBoard?: string;
  academicXP?: number;
  adjustXP?: (amount: number) => void;
  onNavigateTab: (tab: any) => void;
  onOpenScanner?: () => void;
}

export default function Mission7EventHub({
  studentName = 'Student',
  currentGrade = 'Grade 8',
  curriculumBoard = 'CBSE',
  academicXP = 0,
  adjustXP,
  onNavigateTab,
  onOpenScanner
}: Mission7EventHubProps) {
  const [state, setState] = useState<Mission7State>(() => 
    getMission7State(studentName, currentGrade, curriculumBoard)
  );
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [claimCelebration, setClaimCelebration] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setState(e.detail || getMission7State(studentName, currentGrade, curriculumBoard));
    };
    window.addEventListener('neonova_mission7_updated', handleUpdate);
    return () => window.removeEventListener('neonova_mission7_updated', handleUpdate);
  }, [studentName, currentGrade, curriculumBoard]);

  const handleClaim = (taskId: Mission7TaskId, xp: number) => {
    const updated = claimMission7Reward(taskId, adjustXP);
    setState(updated);
    setClaimCelebration(`+${xp} Event XP Claimed!`);
    setTimeout(() => setClaimCelebration(null), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your Mission 7 Championship progress for a new attempt?')) {
      const fresh = resetMission7State();
      setState(fresh);
    }
  };

  const completedCount = state.tasks.filter(t => t.status === 'completed' || t.status === 'claimed').length;
  const progressPct = Math.round((completedCount / 7) * 100);

  const handleTaskAction = (task: Mission7Task) => {
    if (task.category === 'scanner' && onOpenScanner) {
      onOpenScanner();
      return;
    }
    if (task.actionTab) {
      onNavigateTab(task.actionTab);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Toast celebration message */}
      {claimCelebration && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles size={16} />
          <span>{claimCelebration}</span>
        </div>
      )}

      {/* TOP HERO BANNER */}
      <div className="bg-gradient-to-br from-amber-500/15 via-indigo-600/10 to-purple-600/15 border border-amber-300/60 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/20 via-indigo-400/15 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-900 border border-amber-400/40">
              <Trophy size={14} className="text-amber-600" />
              <span>Seasonal Event • Mission 7 Championship</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mission 7: 7-Day Mastery Quest
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Complete the seven progressive curriculum missions across Grades 1–12. Unlock exclusive badges, rack up over <strong>+700 Bonus Study Points</strong>, and earn your official verified <strong>Certificate of Academic Excellence</strong>.
            </p>

            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300/60 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-700" />
                <span>{state.daysRemaining} Days Remaining in Season</span>
              </span>
              <span className="text-xs font-bold text-indigo-900 bg-indigo-100/80 px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5">
                <Zap size={13} className="text-indigo-600" />
                <span>Total Event Bonus XP: +{state.totalBonusXpEarned} XP</span>
              </span>
            </div>
          </div>

          {/* Progress Gauge Card */}
          <div className="bg-white/90 backdrop-blur-xs p-5 rounded-3xl border border-slate-200/80 shadow-sm shrink-0 min-w-[260px] space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500 uppercase tracking-wide">Mastery Progress</span>
              <span className="text-indigo-600 font-mono text-sm">{completedCount} / 7 Missions</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Share2 size={13} />
                <span>Share Status</span>
              </button>
              
              {state.isAllCompleted && (
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(true)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Award size={14} className="text-amber-600" />
                  <span>View Certificate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALL 7 MISSIONS TIMELINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              The 7 Daily Missions
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
              Step-by-Step
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset progress to retry the event"
          >
            <RotateCcw size={12} />
            <span>Reset Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isClaimed = task.status === 'claimed';
            const isFinished = isCompleted || isClaimed;

            return (
              <div 
                key={task.id}
                className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between space-y-4 ${
                  isFinished
                    ? 'bg-white border-emerald-200/90 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      DAY {task.dayNumber}
                    </span>

                    <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                      +{task.xpReward} XP
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h3>
                  <div className="text-[11px] font-semibold text-indigo-600">
                    {task.subtitle}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Progress & Action Bottom */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Objective Progress:</span>
                    <span className={`font-bold ${isFinished ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {task.currentProgress} / {task.targetCount}
                    </span>
                  </div>

                  {/* Button Action States */}
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(task.id, task.xpReward)}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
                    >
                      <Sparkles size={14} />
                      <span>Claim +{task.xpReward} XP!</span>
                    </button>
                  ) : isClaimed ? (
                    <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Completed & Claimed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTaskAction(task)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200/80"
                    >
                      <span>{task.actionLabel}</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BADGES & TROPHY SHELF */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Championship Badges & Trophies
            </h2>
            <p className="text-xs text-slate-500">
              Unlocked automatically as you conquer event missions.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            {state.badges.filter(b => b.unlocked).length} / 4 Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {state.badges.map((badge) => (
            <div 
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all text-center space-y-2.5 ${
                badge.unlocked 
                  ? 'bg-amber-50/50 border-amber-300/80 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="text-3xl p-3 bg-white rounded-2xl w-14 h-14 mx-auto flex items-center justify-center shadow-2xs">
                {badge.icon}
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                {badge.name}
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                {badge.description}
              </p>
              <div className="pt-1">
                {badge.unlocked ? (
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full flex items-center justify-center gap-1 max-w-[120px] mx-auto">
                    <Lock size={10} /> {badge.requiredMissions} Missions
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GRAND CHAMPION CERTIFICATE SECTION */}
      {state.certificate && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-sm shrink-0">
              🏆
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase font-bold tracking-widest text-amber-100">
                MISSION 7 GRAND CHAMPION
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Official Credential Issued to {studentName}
              </h3>
              <p className="text-xs text-amber-100 max-w-lg">
                You have successfully conquered all 7 missions! Your verifiable certificate of academic excellence is ready to view, print, or share.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Award size={15} className="text-amber-600" />
              <span>View Official Certificate</span>
            </button>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="Share Achievement"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {state.certificate && (
        <Mission7CertificateModal
          certificate={state.certificate}
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          onShare={() => setIsShareModalOpen(true)}
        />
      )}

      <Mission7ShareModal
        state={state}
        studentName={studentName}
        grade={currentGrade}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
