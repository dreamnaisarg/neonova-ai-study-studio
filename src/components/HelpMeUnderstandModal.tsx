import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  X, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Sparkles, 
  Compass, 
  AlertTriangle, 
  Zap, 
  ChevronRight, 
  Layers, 
  Award,
  RotateCcw,
  GraduationCap,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';
import { HelpMeUnderstandData, GRADES } from '../types';
import { updateTopicMastery } from '../lib/progressStorage';

interface HelpMeUnderstandModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer?: string;
  initialGrade?: string;
  initialSubject?: string;
  adjustXP?: (amount: number) => void;
}

export default function HelpMeUnderstandModal({
  isOpen,
  onClose,
  question,
  answer,
  initialGrade = 'Grade 8',
  initialSubject = 'Mathematics',
  adjustXP
}: HelpMeUnderstandModalProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<HelpMeUnderstandData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedCheck, setHasSubmittedCheck] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'concept' | 'steps' | 'why' | 'quiz'>('concept');

  useEffect(() => {
    if (isOpen && question) {
      fetchUnderstandingBreakdown(selectedGrade);
    }
  }, [isOpen, question, selectedGrade]);

  const fetchUnderstandingBreakdown = async (grade: string) => {
    setLoading(true);
    setSelectedOption(null);
    setHasSubmittedCheck(false);
    try {
      const res = await fetch('/api/help-me-understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          grade,
          subject: initialSubject
        })
      });
      if (!res.ok) {
        throw new Error('Failed to load understanding breakdown');
      }
      const result: HelpMeUnderstandData = await res.json();
      setData(result);
    } catch (e) {
      console.error('Error in Help Me Understand query', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuizOption = (idx: number) => {
    if (hasSubmittedCheck) return;
    setSelectedOption(idx);
    setHasSubmittedCheck(true);

    if (data?.conceptCheckQuestion && idx === data.conceptCheckQuestion.correctIndex) {
      if (typeof adjustXP === 'function') {
        adjustXP(25);
      }
      updateTopicMastery(data.conceptTitle || initialSubject, initialSubject, 95);
    } else if (data?.conceptTitle) {
      updateTopicMastery(data.conceptTitle || initialSubject, initialSubject, 60);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const text = `💡 HELP ME UNDERSTAND: ${data.conceptTitle} (${data.gradeLevel})
    
Core Concept: ${data.conceptSummary}
Everyday Analogy: ${data.everydayAnalogy}
Step-by-Step Problem Solving: ${data.steps.map(s => `${s.stepNumber}. ${s.title}: ${s.explanation} (Tip: ${s.proTip || 'N/A'})`).join('\n')}
Why This Works: ${data.whyItWorks}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="help-me-understand-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs overflow-y-auto font-sans"
        onClick={onClose}
      >
        <motion.div
          id="help-me-understand-modal-dialog"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 relative"
        >
          {/* TOP HEADER */}
          <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <Lightbulb size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Concept Breakdown
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase">
                    {initialSubject}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  Help Me Understand
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] font-medium text-slate-500">Grade:</span>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-transparent text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer"
                  title="Change explanation grade level"
                >
                  {GRADES.map(g => (
                    <option key={g} value={g} className="bg-white text-slate-900">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer text-xs"
                title="Copy breakdown notes"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* QUESTION CONTEXT BANNER */}
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
            <span className="text-indigo-600 font-bold shrink-0 uppercase text-[10px]">QUESTION:</span>
            <p className="font-medium line-clamp-2 text-slate-800">{question}</p>
          </div>

          {/* VIEW TABS */}
          <div className="flex border-b border-slate-200/80 bg-slate-50/50 px-4 pt-2 gap-1 overflow-x-auto shrink-0">
            {[
              { id: 'concept', label: 'Core Concept & Analogy', icon: '💡' },
              { id: 'steps', label: 'Step-by-Step Method', icon: '🔢' },
              { id: 'why', label: 'Why This Works', icon: '🧭' },
              { id: 'quiz', label: 'Understanding Check', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-t border-x ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 border-slate-200 border-b-white -mb-px'
                    : 'text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* BODY CONTENT */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Preparing concept breakdown for {selectedGrade}...
                  </p>
                  <p className="text-xs text-slate-500">
                    Structuring simple explanations and step-by-step guidance.
                  </p>
                </div>
              </div>
            ) : data ? (
              <AnimatePresence mode="wait">
                {/* 1. CORE CONCEPT & ANALOGY */}
                {activeTab === 'concept' && (
                  <motion.div
                    key="tab-concept"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 shadow-2xs">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {data.gradeLevel} Explanation
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        {data.conceptTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {data.conceptSummary}
                      </p>
                    </div>

                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5 space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase">
                        <Sparkles size={14} className="text-amber-600" />
                        <span>Real-World Analogy</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed italic">
                        "{data.everydayAnalogy}"
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab('steps')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                      >
                        <span>View Step-by-Step Method</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. STEP-BY-STEP PROBLEM SOLVING METHOD */}
                {activeTab === 'steps' && (
                  <motion.div
                    key="tab-steps"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wide">
                        Step-by-Step Method ({data.steps.length} Steps)
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">Calibrated for {data.gradeLevel}</span>
                    </div>

                    <div className="space-y-3">
                      {data.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200/90 rounded-xl p-4 transition-all space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center justify-center shrink-0">
                              {step.stepNumber}
                            </div>
                            <div className="space-y-1 flex-1">
                              <h5 className="text-xs font-bold text-slate-900">
                                {step.title}
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {step.explanation}
                              </p>
                            </div>
                          </div>

                          {(step.keyFormulaOrRule || step.proTip) && (
                            <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {step.keyFormulaOrRule && (
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-indigo-700">
                                  <span className="text-slate-500 block uppercase text-[9px] font-bold">Rule / Formula:</span>
                                  {step.keyFormulaOrRule}
                                </div>
                              )}
                              {step.proTip && (
                                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-800">
                                  <span className="text-amber-600 block uppercase text-[9px] font-bold">Pro Tip:</span>
                                  {step.proTip}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('concept')}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        ← Back to Concept
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('why')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Understand "Why It Works"</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 3. WHY THIS WORKS */}
                {activeTab === 'why' && (
                  <motion.div
                    key="tab-why"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase">
                        <Compass size={16} />
                        <span>The Underlying Concept (Why It Works)</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {data.whyItWorks}
                      </p>
                    </div>

                    {data.commonPitfalls && data.commonPitfalls.length > 0 && (
                      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 sm:p-5 space-y-2">
                        <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase">
                          <AlertTriangle size={15} />
                          <span>Common Mistakes to Avoid</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-rose-900">
                          {data.commonPitfalls.map((pitfall, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-rose-600 font-bold mt-0.5">•</span>
                              <span>{pitfall}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('steps')}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        ← Back to Steps
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('quiz')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Take Concept Check (+25 XP)</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 4. UNDERSTANDING CONCEPT CHECK QUIZ */}
                {activeTab === 'quiz' && data.conceptCheckQuestion && (
                  <motion.div
                    key="tab-quiz"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-4"
                  >
                    <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                            <Award size={14} />
                          </span>
                          <span className="text-xs font-bold uppercase text-slate-900">
                            Quick Concept Verification Check
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                          +25 XP Reward
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                        {data.conceptCheckQuestion.question}
                      </p>

                      <div className="space-y-2">
                        {data.conceptCheckQuestion.options.map((opt, idx) => {
                          const isChosen = selectedOption === idx;
                          const isCorrect = idx === data.conceptCheckQuestion.correctIndex;
                          
                          let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300';
                          if (hasSubmittedCheck) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                            } else if (isChosen && !isCorrect) {
                              btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                            } else {
                              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectQuizOption(idx)}
                              disabled={hasSubmittedCheck}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${btnStyle} cursor-pointer`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {hasSubmittedCheck && isCorrect && (
                                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                              )}
                              {hasSubmittedCheck && isChosen && !isCorrect && (
                                <XCircle size={16} className="text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasSubmittedCheck && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            selectedOption === data.conceptCheckQuestion.correctIndex
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="font-semibold text-xs flex items-center gap-1.5">
                            {selectedOption === data.conceptCheckQuestion.correctIndex ? (
                              <>
                                <CheckCircle size={14} className="text-emerald-600" />
                                <span>Concept Mastered! Great Job!</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={14} className="text-rose-600" />
                                <span>Review the Explanation:</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed opacity-90">
                            {data.conceptCheckQuestion.explanation}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOption(null);
                          setHasSubmittedCheck(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-xs cursor-pointer"
                      >
                        <RotateCcw size={12} />
                        <span>Retry Check</span>
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                      >
                        Done & Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <p className="text-xs">No conceptual breakdown data available.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
