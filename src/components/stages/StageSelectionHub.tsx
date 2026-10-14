import React, { useState } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Play, 
  Award, 
  BookOpen, 
  ChevronRight, 
  GraduationCap, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Flame,
  Check,
  Search
} from 'lucide-react';
import { SUBJECTS, GRADES } from '../../types';
import { 
  StageNumber, 
  STAGE_CONFIGS, 
  SubjectStageProgress 
} from '../../types/stageSystem';
import { 
  getSubjectStageProgress, 
  getOverallStageStatistics,
  DEFAULT_PASSING_THRESHOLD 
} from '../../lib/stageStorage';
import { getTopicsForSubject } from '../../lib/stageQuestionGenerator';
import Mission7QuickWidget from '../missions/Mission7QuickWidget';

interface StageSelectionHubProps {
  currentSubject: string;
  onSubjectChange: (subject: string) => void;
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  onStartStage: (stageNum: StageNumber) => void;
  academicXP?: number;
  onNavigateTab?: (tab: any) => void;
}

export default function StageSelectionHub({
  currentSubject,
  onSubjectChange,
  currentGrade,
  onGradeChange,
  selectedTopic,
  onTopicChange,
  onStartStage,
  academicXP = 0,
  onNavigateTab
}: StageSelectionHubProps) {
  const [subjectSearch, setSubjectSearch] = useState('');

  const availableTopics = getTopicsForSubject(currentSubject);
  const progress: SubjectStageProgress = getSubjectStageProgress(
    currentSubject,
    currentGrade,
    selectedTopic || availableTopics[0] || 'General Curriculum'
  );

  const getStageStatus = (stageNum: StageNumber) => {
    if (stageNum === 1) return progress.stage1Status;
    if (stageNum === 2) return progress.stage2Status;
    if (stageNum === 3) return progress.stage3Status;
    return progress.stage4Status;
  };

  const stages: StageNumber[] = [1, 2, 3, 4];
  const passedCount = stages.filter(s => {
    const best = progress.bestScores[s];
    return best !== null && best >= STAGE_CONFIGS[s].passingThreshold;
  }).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* TOP HEADER & STATS BAR */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles size={13} className="text-indigo-600" />
              <span>NeoNova 4-Stage Progressive Testing System</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mastery Assessment: {currentSubject}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Progress through four structured stages from foundational basics to formal school-level mixed examinations. Pass each stage with ≥ 70% to unlock the next level.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200/70">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stages Passed</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-600">{passedCount}/4</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pass Threshold</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">{DEFAULT_PASSING_THRESHOLD}%</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total XP</span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
                <Flame size={18} className="text-amber-500 fill-amber-500" />
                <span>{academicXP}</span>
              </span>
            </div>
          </div>
        </div>

        {/* MISSION 7 SEASONAL EVENT QUICK BANNER */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <Mission7QuickWidget 
            onOpenEventHub={() => onNavigateTab && onNavigateTab('mission7')}
            grade={currentGrade}
          />
        </div>

        {/* PROGRESSION STEPPER INDICATOR */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0" />
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 transition-all duration-500 z-0"
              style={{ width: `${Math.max(0, (passedCount / 4) * 100 - 12)}%` }}
            />

            {stages.map((s) => {
              const status = getStageStatus(s);
              const isCompleted = status === 'completed';
              const isUnlocked = status === 'unlocked' || status === 'completed';
              const isNext = status === 'unlocked' && !isCompleted;

              return (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : isNext
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                      : isUnlocked
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={16} /> : isUnlocked ? s : <Lock size={14} />}
                  </div>
                  <span className={`text-[10px] font-bold mt-1.5 hidden sm:block ${
                    isCompleted ? 'text-emerald-700' : isNext ? 'text-indigo-700' : 'text-slate-500'
                  }`}>
                    Stage {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER BAR: SUBJECT, GRADE & TOPIC SELECTORS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={13} className="text-indigo-600" />
              <span>Select Subject:</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SUBJECTS.map((sub) => {
                const isSelected = currentSubject.toLowerCase() === sub.name.toLowerCase();
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onSubjectChange(sub.name);
                      const newTopics = getTopicsForSubject(sub.name);
                      if (newTopics.length > 0) onTopicChange(newTopics[0]);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="shrink-0 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap size={13} className="text-indigo-600" />
              <span>Grade Level:</span>
            </label>
            <select
              value={currentGrade}
              onChange={(e) => onGradeChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              {GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic / Chapter Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="text-slate-400">Chapter/Topic:</span>
            <select
              value={selectedTopic || availableTopics[0]}
              onChange={(e) => onTopicChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {availableTopics.map(top => (
                <option key={top} value={top}>{top}</option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-slate-500">
            Assessments adapt automatically to <strong>{currentGrade}</strong> curriculum depth.
          </span>
        </div>
      </div>

      {/* 4 STAGE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {stages.map((stageNum) => {
          const cfg = STAGE_CONFIGS[stageNum];
          const status = getStageStatus(stageNum);
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const bestScore = progress.bestScores[stageNum];
          const latestScore = progress.latestScores[stageNum];
          const attempts = progress.attemptCounts[stageNum] || 0;

          const isStage1 = stageNum === 1;
          const isStage2 = stageNum === 2;
          const isStage3 = stageNum === 3;

          const cardBorder = isLocked
            ? 'border-slate-200 bg-slate-50/60 opacity-80'
            : isCompleted
            ? 'border-emerald-300 bg-white hover:border-emerald-500 shadow-xs'
            : isStage1
            ? 'border-emerald-200 bg-white hover:border-emerald-400 shadow-xs'
            : isStage2
            ? 'border-amber-200 bg-white hover:border-amber-400 shadow-xs'
            : isStage3
            ? 'border-rose-200 bg-white hover:border-rose-400 shadow-xs'
            : 'border-purple-200 bg-white hover:border-purple-400 shadow-xs';

          const badgeClasses = isStage1
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isStage2
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : isStage3
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-purple-50 text-purple-700 border-purple-200';

          return (
            <div 
              key={stageNum}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${cardBorder}`}
            >
              <div className="absolute -right-4 -bottom-6 text-8xl font-black text-slate-100 select-none pointer-events-none opacity-50">
                {stageNum}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Stage {stageNum}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClasses}`}>
                      {cfg.badge}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={12} className="text-emerald-700" />
                      <span>Completed</span>
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-600 border border-slate-300">
                      <Lock size={12} className="text-slate-500" />
                      <span>Locked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Play size={10} className="fill-indigo-700" />
                      <span>Ready to Start</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {cfg.name}
                  </h3>
                  <p className="text-xs font-bold text-indigo-600 italic mt-0.5">
                    "{cfg.subtitle}"
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {cfg.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Best Score</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {bestScore !== null ? `${bestScore}%` : '—'}
                    </span>
                  </div>
                  <div className="border-x border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Latest Score</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {latestScore !== null ? `${latestScore}%` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Attempts</span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {attempts > 0 ? attempts : '0'}
                    </span>
                  </div>
                </div>

                {isLocked && (
                  <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                    <AlertCircle size={14} className="shrink-0 text-amber-600" />
                    <span className="text-[11px] leading-tight">
                      Pass <strong>Stage {stageNum - 1}</strong> with at least <strong>{cfg.passingThreshold}%</strong> to unlock this assessment.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-5 relative z-10">
                {isLocked ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-200 text-slate-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock size={13} />
                    <span>Locked (Requires Stage {stageNum - 1})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartStage(stageNum)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-98 text-white ${
                      isStage1 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : isStage2 
                        ? 'bg-amber-600 hover:bg-amber-700' 
                        : isStage3 
                        ? 'bg-rose-600 hover:bg-rose-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <span>{isCompleted ? 'Retake Stage' : 'Start Assessment'}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
