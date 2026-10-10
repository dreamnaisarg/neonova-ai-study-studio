import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  AlertCircle,
  Lightbulb,
  Check,
  TrendingUp,
  Share2
} from 'lucide-react';
import { 
  StageTestAttempt, 
  STAGE_CONFIGS, 
  StageNumber 
} from '../../types/stageSystem';
import HelpMeUnderstandModal from '../HelpMeUnderstandModal';

interface StageResultsViewProps {
  attempt: StageTestAttempt;
  onRetryStage: () => void;
  onContinueToNextStage?: (nextStageNum: StageNumber) => void;
  onBackToHub: () => void;
  adjustXP?: (amount: number) => void;
}

export default function StageResultsView({
  attempt,
  onRetryStage,
  onContinueToNextStage,
  onBackToHub,
  adjustXP
}: StageResultsViewProps) {
  const [showReview, setShowReview] = useState<boolean>(false);
  const [filterReview, setFilterReview] = useState<'all' | 'incorrect' | 'correct'>('all');

  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [helpQuestion, setHelpQuestion] = useState<string>('');
  const [helpAnswer, setHelpAnswer] = useState<string>('');

  const stageConfig = STAGE_CONFIGS[attempt.stageNumber];
  const isPassed = attempt.passed;
  const hasNextStage = attempt.stageNumber < 4 && isPassed;
  const nextStageNum = (attempt.stageNumber + 1) as StageNumber;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s} sec`;
    return `${m} min ${s > 0 ? `${s} sec` : ''}`;
  };

  const handleOpenHelp = (qText: string, cAns: string) => {
    setHelpQuestion(qText);
    setHelpAnswer(cAns);
    setHelpModalOpen(true);
  };

  const filteredAnswers = attempt.answers.filter(ans => {
    if (filterReview === 'correct') return ans.isCorrect;
    if (filterReview === 'incorrect') return !ans.isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* RESULT HERO CARD */}
      <div className={`rounded-3xl border p-6 sm:p-8 shadow-xs relative overflow-hidden text-center space-y-6 ${
        isPassed 
          ? 'bg-gradient-to-b from-emerald-50/80 via-white to-white border-emerald-200' 
          : 'bg-gradient-to-b from-amber-50/80 via-white to-white border-amber-200'
      }`}>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border shadow-2xs mx-auto">
          {isPassed ? (
            <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100 border-emerald-200">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>STAGE PASSED • {stageConfig.badge}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-100 border-amber-200">
              <AlertCircle size={13} className="text-amber-600" />
              <span>NEEDS PRACTICE • {stageConfig.badge}</span>
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isPassed ? `${stageConfig.name} Complete! 🎉` : `Keep Practicing • ${stageConfig.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            {isPassed 
              ? `Outstanding work! You have met the academic threshold (≥ ${stageConfig.passingThreshold}%) for ${attempt.subject}.`
              : `You scored ${attempt.scorePercentage}%. NeoNova requires at least ${stageConfig.passingThreshold}% to unlock the next stage. Review your answers below and retry.`}
          </p>
        </div>

        {/* Big Score Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {attempt.correctCount}/{attempt.totalQuestions}
            </span>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Percentage</span>
            <span className={`text-xl sm:text-2xl font-black ${isPassed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {attempt.scorePercentage}%
            </span>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Taken</span>
            <span className="text-base sm:text-lg font-black text-slate-800 flex items-center justify-center gap-1">
              <Clock size={14} className="text-slate-400" />
              <span>{formatTime(attempt.timeTakenSeconds)}</span>
            </span>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">XP Awarded</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600">
              +{attempt.xpEarned} XP
            </span>
          </div>
        </div>

        {/* PERFORMANCE BREAKDOWN BARS */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Performance Breakdown</span>
            <span>{attempt.correctCount} Correct • {attempt.incorrectCount} Incorrect</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${(attempt.correctCount / attempt.totalQuestions) * 100}%` }}
              title="Correct"
            />
            <div 
              className="h-full bg-rose-500 transition-all duration-500" 
              style={{ width: `${(attempt.incorrectCount / attempt.totalQuestions) * 100}%` }}
              title="Incorrect"
            />
          </div>
        </div>

        {/* STAGE 4: MIXED TEST REVEAL BREAKDOWN */}
        {attempt.mixedBreakdown && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-left space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <Sparkles size={14} className="text-purple-600" />
              <span>Mixed Test Difficulty Analysis</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                <span className="text-[10px] font-bold text-emerald-700 block">🟢 EASY (30%)</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {attempt.mixedBreakdown.easyCorrect}/{attempt.mixedBreakdown.easyTotal}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {Math.round((attempt.mixedBreakdown.easyCorrect / Math.max(1, attempt.mixedBreakdown.easyTotal)) * 100)}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                <span className="text-[10px] font-bold text-amber-700 block">🟡 MEDIUM (40%)</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {attempt.mixedBreakdown.mediumCorrect}/{attempt.mixedBreakdown.mediumTotal}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {Math.round((attempt.mixedBreakdown.mediumCorrect / Math.max(1, attempt.mixedBreakdown.mediumTotal)) * 100)}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                <span className="text-[10px] font-bold text-rose-700 block">🔴 HARD (30%)</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {attempt.mixedBreakdown.hardCorrect}/{attempt.mixedBreakdown.hardTotal}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {Math.round((attempt.mixedBreakdown.hardCorrect / Math.max(1, attempt.mixedBreakdown.hardTotal)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* WEAK TOPICS / RECOMMENDATIONS */}
        {attempt.weakTopics && attempt.weakTopics.length > 0 && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left space-y-2 text-xs">
            <span className="font-bold text-amber-900 block flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-600" />
              <span>Recommended Topics to Review:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {attempt.weakTopics.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 font-semibold text-amber-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PRIMARY ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onRetryStage}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <RotateCcw size={14} />
            <span>Retry Stage {attempt.stageNumber}</span>
          </button>
          {hasNextStage && onContinueToNextStage && (
            <button
              type="button"
              onClick={() => onContinueToNextStage(nextStageNum)}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue to Stage {nextStageNum}</span>
              <ArrowRight size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={onBackToHub}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Back to Stages Hub</span>
          </button>
        </div>
      </div>

      {/* DETAILED ANSWER REVIEW SECTION */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Question Review
            </h3>
            <p className="text-xs text-slate-500">
              Review each question, your answer, and the complete academic explanation.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setFilterReview('all')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                filterReview === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({attempt.totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilterReview('incorrect')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                filterReview === 'incorrect' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Incorrect ({attempt.incorrectCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterReview('correct')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                filterReview === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Correct ({attempt.correctCount})
            </button>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          {filteredAnswers.map((ans, idx) => (
            <div 
              key={ans.questionId || idx}
              className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-all ${
                ans.isCorrect ? 'bg-emerald-50/30 border-emerald-200/80' : 'bg-rose-50/30 border-rose-200/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    ans.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ans.questionNumber}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Difficulty: {ans.internalDifficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {ans.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <Check size={12} /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                      <XCircle size={12} /> Incorrect
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {ans.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className={`p-2.5 rounded-xl border ${
                  ans.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                }`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Your Answer:</span>
                  <span className={`font-semibold ${ans.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {ans.userAnswer}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Correct Answer:</span>
                  <span className="font-semibold text-slate-900">
                    {ans.correctAnswer}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <p className="text-slate-600 text-[11px] leading-relaxed flex-1">
                  <strong>Explanation:</strong> {ans.explanation}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenHelp(ans.questionText, ans.correctAnswer)}
                  className="shrink-0 px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Lightbulb size={12} className="text-amber-500 fill-amber-500" />
                  <span>Help Me Understand</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <HelpMeUnderstandModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        question={helpQuestion}
        answer={helpAnswer}
        initialGrade={attempt.grade}
        initialSubject={attempt.subject}
        adjustXP={adjustXP}
      />
    </div>
  );
}
