import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Clock, 
  Flag, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  Bookmark, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';
import { 
  StageNumber, 
  StageQuestion, 
  STAGE_CONFIGS, 
  StageTestAttempt, 
  UserAnswerRecord 
} from '../../types/stageSystem';
import { recordStageAttempt } from '../../lib/stageStorage';

interface StageTestRunnerProps {
  subject: string;
  grade: string;
  topic: string;
  stageNumber: StageNumber;
  questions: StageQuestion[];
  onFinishTest: (attempt: StageTestAttempt) => void;
  onExitTest: () => void;
  adjustXP?: (amount: number) => void;
}

export default function StageTestRunner({
  subject,
  grade,
  topic,
  stageNumber,
  questions,
  onFinishTest,
  onExitTest,
  adjustXP
}: StageTestRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showPaletteModal, setShowPaletteModal] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');

  const stageConfig = STAGE_CONFIGS[stageNumber];
  const totalQuestions = questions.length;
  const currentQ = questions[currentIdx];

  // Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentQ) {
      setTextInput(userAnswers[currentQ.id] || '');
    }
  }, [currentIdx, currentQ]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionValue: string) => {
    if (!currentQ) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionValue
    }));
  };

  const handleTextInputChange = (val: string) => {
    setTextInput(val);
    if (!currentQ) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: val
    }));
  };

  const toggleFlag = (index: number) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const answeredCount = Object.keys(userAnswers).filter(k => (userAnswers[k] || '').trim().length > 0).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleFinalSubmit = () => {
    let correctCount = 0;
    let incorrectCount = 0;
    let easyCorrect = 0;
    let easyTotal = 0;
    let mediumCorrect = 0;
    let mediumTotal = 0;
    let hardCorrect = 0;
    let hardTotal = 0;
    const weakTopicsSet = new Set<string>();

    const answerRecords: UserAnswerRecord[] = questions.map((q, idx) => {
      const uAns = (userAnswers[q.id] || '').trim();
      const cAns = (q.correctAnswer || '').trim();

      let isCorrect = false;
      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        if (q.options && typeof q.correctOptionIndex === 'number') {
          const correctOptionStr = q.options[q.correctOptionIndex] || '';
          isCorrect = uAns.toLowerCase() === correctOptionStr.toLowerCase();
        } else {
          isCorrect = uAns.toLowerCase() === cAns.toLowerCase();
        }
      } else {
        const cleanU = uAns.toLowerCase().replace(/[,%$]/g, '').trim();
        const cleanC = cAns.toLowerCase().replace(/[,%$]/g, '').trim();
        isCorrect = cleanU === cleanC || (cleanU.length > 0 && cleanC.includes(cleanU));
      }

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
        if (q.topic) weakTopicsSet.add(q.topic);
      }

      const diff = q.internalDifficulty || 'MEDIUM';
      if (diff === 'EASY') {
        easyTotal++;
        if (isCorrect) easyCorrect++;
      } else if (diff === 'MEDIUM') {
        mediumTotal++;
        if (isCorrect) mediumCorrect++;
      } else {
        hardTotal++;
        if (isCorrect) hardCorrect++;
      }

      return {
        questionId: q.id,
        questionNumber: idx + 1,
        questionText: q.questionText,
        userAnswer: uAns || '(Not Answered)',
        correctAnswer: cAns,
        isCorrect,
        type: q.type,
        internalDifficulty: diff,
        explanation: q.explanation,
        topic: q.topic
      };
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= stageConfig.passingThreshold;

    const attempt: StageTestAttempt = {
      attemptId: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject,
      grade,
      topic,
      stageNumber,
      difficulty: stageConfig.difficulty,
      totalQuestions,
      correctCount,
      incorrectCount,
      unansweredCount,
      scorePercentage,
      passed,
      timeTakenSeconds: elapsedSeconds,
      timestamp: new Date().toISOString(),
      answers: answerRecords,
      mixedBreakdown: stageNumber === 4 ? {
        easyCorrect,
        easyTotal,
        mediumCorrect,
        mediumTotal,
        hardCorrect,
        hardTotal
      } : undefined,
      weakTopics: Array.from(weakTopicsSet),
      xpEarned: passed ? Math.round(scorePercentage * 0.8) : Math.round(scorePercentage * 0.3)
    };

    recordStageAttempt(attempt, adjustXP);
    onFinishTest(attempt);
  };

  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600 text-sm">Loading test questions...</p>
      </div>
    );
  }

  const isCurrentFlagged = flaggedQuestions.has(currentIdx);
  const currentSelectedAnswer = userAnswers[currentQ.id] || '';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-150">
      {/* TEST NAVIGATION TOP BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Exit Test"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{subject}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">{grade}</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-600 block truncate max-w-[200px] sm:max-w-xs">
              {stageConfig.name} ({topic})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs font-bold">
          <Clock size={13} className="text-indigo-600" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPaletteModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <span>Q {currentIdx + 1}/{totalQuestions}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Finish Test</span>
            <Send size={12} />
          </button>
        </div>
      </div>

      {/* SEGMENTED PROGRESS BAR */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>Question {currentIdx + 1} of {totalQuestions}</span>
          <span>{answeredCount} Answered ({Math.round((answeredCount / totalQuestions) * 100)}%)</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              {currentIdx + 1}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {currentQ.type === 'multiple_choice' ? 'Multiple Choice' : currentQ.type === 'true_false' ? 'True / False' : 'Problem Solving'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleFlag(currentIdx)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isCurrentFlagged 
                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark size={13} className={isCurrentFlagged ? 'fill-amber-600 text-amber-600' : ''} />
            <span>{isCurrentFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed select-text">
            {currentQ.questionText}
          </h2>
        </div>

        {/* OPTIONS */}
        {(currentQ.type === 'multiple_choice' || currentQ.type === 'true_false') && (
          <div className="space-y-3 pt-2">
            {(currentQ.options || (currentQ.type === 'true_false' ? ['True', 'False'] : [])).map((optionText, optIdx) => {
              const isSelected = currentSelectedAnswer === optionText;
              const optionLetter = String.fromCharCode(65 + optIdx);
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optionText)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-600/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {optionLetter}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium leading-snug flex-1 ${
                    isSelected ? 'text-slate-900 font-bold' : 'text-slate-700'
                  }`}>
                    {optionText}
                  </span>
                  {isSelected && (
                    <Check size={16} className="text-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* NUMERICAL / SHORT ANSWER INPUT BOX */}
        {(currentQ.type === 'numerical' || currentQ.type === 'short_answer') && (
          <div className="pt-2 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enter Your Answer:
            </label>
            <input
              type="text"
              value={textInput}
              onChange={(e) => handleTextInputChange(e.target.value)}
              placeholder={currentQ.type === 'numerical' ? 'e.g. 42 or 3.14' : 'Type concise answer here...'}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            />
            <span className="text-[11px] text-slate-400 block">
              Do not worry about units unless explicitly asked in the question.
            </span>
          </div>
        )}

        {currentSelectedAnswer && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => handleSelectOption('')}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear Choice
            </button>
          </div>
        )}
      </div>

      {/* FOOTER NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowLeft size={14} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPaletteModal(true)}
          className="sm:hidden px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
        >
          {currentIdx + 1} / {totalQuestions}
        </button>

        {currentIdx < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Next Question</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>Submit Test</span>
            <Check size={14} />
          </button>
        )}
      </div>

      {/* QUESTION PALETTE MODAL */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Question Navigator
              </h3>
              <button
                type="button"
                onClick={() => setShowPaletteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Flagged ({flaggedQuestions.size})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {questions.map((_, i) => {
                const isAnswered = Boolean((userAnswers[questions[i].id] || '').trim());
                const isFlagged = flaggedQuestions.has(i);
                const isCurrent = i === currentIdx;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentIdx(i);
                      setShowPaletteModal(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer relative flex items-center justify-center ${
                      isCurrent 
                        ? 'ring-2 ring-indigo-600 ring-offset-2' 
                        : ''
                    } ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isAnswered
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{i + 1}</span>
                    {isFlagged && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-600" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowPaletteModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM SUBMIT MODAL */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 w-full max-w-md space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Submit Stage Assessment?
              </h3>
              <p className="text-xs text-slate-600">
                Are you ready to submit your test for scoring? You will not be able to change your answers after submission.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Answered:</span>
                <span className="font-bold text-slate-900">{answeredCount} of {totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Unanswered:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Time Spent:</span>
                <span className="font-mono font-bold text-slate-900">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                <span>You still have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. Unanswered questions will receive 0 marks.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleFinalSubmit();
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM EXIT MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Leave Assessment?
              </h3>
              <p className="text-xs text-slate-600">
                Exiting now will discard your current test progress.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Keep Testing
              </button>
              <button
                type="button"
                onClick={onExitTest}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
