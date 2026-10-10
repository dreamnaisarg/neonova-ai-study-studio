import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SUBJECTS, GRADES } from '../../types';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  BookOpen, 
  Play, 
  Check, 
  RotateCcw, 
  Lightbulb 
} from 'lucide-react';
import { recordQuizScore, updateTopicMastery } from '../../lib/progressStorage';
import HelpMeUnderstandModal from '../HelpMeUnderstandModal';

interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctOptionIndex?: number;
  correctAnswer: string;
  explanation: string;
}

interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

interface PracticeQuizProps {
  adjustXP?: (amount: number) => void;
  initialSubject?: string;
  initialTopic?: string;
}

export default function PracticeQuiz({ adjustXP, initialSubject, initialTopic }: PracticeQuizProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || SUBJECTS[0].name);
  const [selectedGrade, setSelectedGrade] = useState<string>("Grade 8");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState<string>("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [answersHistory, setAnswersHistory] = useState<Array<{
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
  }>>([]);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [hasRecordedProgress, setHasRecordedProgress] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [helpModalQuestion, setHelpModalQuestion] = useState<string>("");

  useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  const handleInitiateQuiz = async () => {
    setLoading(true);
    setCurrentQuiz(null);
    setCurrentQuestionIdx(0);
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
    setShortAnswerInput("");
    setAnswersHistory([]);
    setXpEarned(0);

    const steps = [
      "Accessing curriculum guidelines...",
      "Generating diagnostic practice questions...",
      "Structuring hints and answer explanations...",
      "Finalizing quiz..."
    ];
    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      } else {
        clearInterval(stepInterval);
      }
    }, 600);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          topic: initialTopic
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to generate quiz: server code ${response.status}`);
      }
      const data: QuizData = await response.json();
      clearInterval(stepInterval);
      setCurrentQuiz(data);
      setHasRecordedProgress(false);
    } catch (err) {
      console.warn("Using offline fallback diagnostic quiz set:", err);
      clearInterval(stepInterval);
      const fallbackQuiz: QuizData = {
        title: `${selectedSubject} Practice Assessment`,
        description: `Adaptive ${selectedGrade} practice quiz`,
        questions: [
          {
            id: 'q1',
            questionText: `What is a fundamental principle in ${selectedSubject}?`,
            type: 'multiple_choice',
            options: [
              'Systematic observation and verification',
              'Guessing without checking work',
              'Ignoring experimental evidence',
              'Skipping foundational definitions'
            ],
            correctOptionIndex: 0,
            correctAnswer: 'Systematic observation and verification',
            explanation: `${selectedSubject} relies on structured, reproducible principles and verification.`
          },
          {
            id: 'q2',
            questionText: 'When solving a multi-step problem, what is the best first step?',
            type: 'multiple_choice',
            options: [
              'Identify the known variables and what is being asked',
              'Immediately guess an answer to save time',
              'Skip reading the problem statement',
              'Jump straight to final calculations without units'
            ],
            correctOptionIndex: 0,
            correctAnswer: 'Identify the known variables and what is being asked',
            explanation: 'Breaking a problem into knowns, unknowns, and appropriate formulas ensures high accuracy.'
          },
          {
            id: 'q3',
            questionText: 'State one key strategy to verify your answer after solving.',
            type: 'short_answer',
            correctAnswer: 'Check units and substitute answer back',
            explanation: 'Plugging results back into original conditions and confirming consistent units confirms validity.'
          }
        ]
      };
      setCurrentQuiz(fallbackQuiz);
      setHasRecordedProgress(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuiz || isAnswerSubmitted) return;
    const q = currentQuiz.questions[currentQuestionIdx];
    let isCorrect = false;
    let userAnswer = "";

    if (q.type === 'multiple_choice') {
      if (selectedOption === null) return;
      isCorrect = selectedOption === q.correctOptionIndex;
      userAnswer = q.options ? q.options[selectedOption] : "";
    } else {
      if (shortAnswerInput.trim() === "") return;
      userAnswer = shortAnswerInput.trim();
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      isCorrect = normalize(userAnswer).includes(normalize(q.correctAnswer)) ||
                  normalize(q.correctAnswer).includes(normalize(userAnswer));
    }

    if (isCorrect) {
      setXpEarned(prev => prev + 20);
      if (typeof adjustXP === 'function') {
        adjustXP(20);
      }
    }

    setAnswersHistory(prev => [
      ...prev,
      {
        questionId: q.id,
        userAnswer,
        isCorrect
      }
    ]);
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShortAnswerInput("");
    setIsAnswerSubmitted(false);
    setCurrentQuestionIdx(prev => prev + 1);
  };

  const handleResetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIdx(0);
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
    setShortAnswerInput("");
    setAnswersHistory([]);
    setXpEarned(0);
  };

  const scoreCount = answersHistory.filter(h => h.isCorrect).length;
  const isQuizComplete = currentQuiz && currentQuestionIdx >= currentQuiz.questions.length;

  useEffect(() => {
    if (isQuizComplete && currentQuiz && !hasRecordedProgress && answersHistory.length > 0) {
      const accuracy = Math.round((scoreCount / currentQuiz.questions.length) * 100);
      const breakdown = currentQuiz.questions.map(q => {
        const h = answersHistory.find(ans => ans.questionId === q.id);
        const correctText = q.type === 'multiple_choice' && q.options && q.correctOptionIndex !== undefined
          ? q.options[q.correctOptionIndex]
          : q.correctAnswer;

        return {
          question: q.questionText,
          userAnswer: h?.userAnswer || "No answer",
          correctAnswer: correctText,
          isCorrect: h?.isCorrect || false,
          explanation: q.explanation
        };
      });

      recordQuizScore({
        quizTitle: currentQuiz.title,
        subject: selectedSubject,
        grade: selectedGrade,
        scorePercentage: accuracy,
        totalQuestions: currentQuiz.questions.length,
        correctCount: scoreCount,
        xpEarned: xpEarned || accuracy,
        topic: currentQuiz.description || `${selectedSubject} Quiz`,
        breakdown
      });

      updateTopicMastery(
        currentQuiz.title || `${selectedSubject} Concept`,
        selectedSubject,
        accuracy
      );
      setHasRecordedProgress(true);
    }
  }, [isQuizComplete, currentQuiz, hasRecordedProgress, answersHistory, scoreCount, selectedSubject, selectedGrade, xpEarned]);

  const handleOpenHelpForQuestion = (q: QuizQuestion) => {
    setHelpModalQuestion(q.questionText);
    setHelpModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Interactive Practice
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Subject Practice Quiz
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test your understanding with curriculum-aligned practice questions.
          </p>
        </div>

        {currentQuiz && !isQuizComplete && (
          <button
            onClick={handleResetQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset Quiz</span>
          </button>
        )}
      </div>

      {!loading && !currentQuiz && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-2xs">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Step 1: Choose Subject
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUBJECTS.map((sub) => {
                const isSelected = selectedSubject === sub.name;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.name)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-22 ${
                      isSelected 
                        ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600' 
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-xl">{sub.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate">{sub.name}</p>
                      <p className="text-[10px] text-slate-400">Curriculum</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Step 2: Choose Grade Level
              </h3>
              <div className="bg-white border border-slate-200 p-2 rounded-xl">
                <select
                  id="quiz-grade-select"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full bg-transparent p-2 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                💡 <strong>Study Tip:</strong> Answering questions correctly earns you <strong>+20 XP</strong> to track your mastery progress!
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleInitiateQuiz}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Play size={14} fill="currentColor" />
                <span>Start Practice Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              Preparing Quiz
            </h3>
            <p className="text-xs text-slate-500 mt-1">{loadingStep}</p>
          </div>
        </div>
      )}

      {currentQuiz && !isQuizComplete && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900">{currentQuiz.title}</h2>
              <p className="text-[11px] text-slate-500">{currentQuiz.description}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <span>Question</span>
              <span className="font-bold text-indigo-600">{currentQuestionIdx + 1} / {currentQuiz.questions.length}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIdx + 1) / currentQuiz.questions.length) * 100}%` }}
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                {currentQuiz.questions[currentQuestionIdx].type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-normal">
                {currentQuiz.questions[currentQuestionIdx].questionText}
              </h3>
            </div>

            <div className="pt-2">
              {currentQuiz.questions[currentQuestionIdx].type === 'multiple_choice' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuiz.questions[currentQuestionIdx].options?.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    let optionStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
                    
                    if (isSelected) {
                      optionStyle = "bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold ring-1 ring-indigo-600";
                    }
                    if (isAnswerSubmitted) {
                      const isCorrectOption = idx === currentQuiz.questions[currentQuestionIdx].correctOptionIndex;
                      if (isCorrectOption) {
                        optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold";
                      } else if (isSelected) {
                        optionStyle = "bg-rose-50 border-rose-500 text-rose-900";
                      } else {
                        optionStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    }
                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSubmitted}
                        onClick={() => handleOptionSelect(idx)}
                        className={`p-3.5 rounded-xl border text-left transition-all text-xs font-medium flex items-center justify-between cursor-pointer ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-[10px] flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isAnswerSubmitted && idx === currentQuiz.questions[currentQuestionIdx].correctOptionIndex && (
                          <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && idx !== currentQuiz.questions[currentQuestionIdx].correctOptionIndex && (
                          <XCircle size={15} className="text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 max-w-lg">
                  <input
                    id="quiz-short-answer-input"
                    type="text"
                    disabled={isAnswerSubmitted}
                    value={shortAnswerInput}
                    onChange={(e) => setShortAnswerInput(e.target.value)}
                    onKeyDown={(e) => { e.key === "Enter" && !isAnswerSubmitted && handleSubmitAnswer() }}
                    placeholder="Type your answer here..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 placeholder-slate-400"
                  />
                  
                  {isAnswerSubmitted && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex justify-between border-b border-slate-200 pb-1 mb-1">
                        <span className="text-slate-500">Your Answer:</span>
                        <span className={answersHistory[currentQuestionIdx]?.isCorrect ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                          {shortAnswerInput}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Correct Answer:</span>
                        <span className="text-emerald-700 font-bold">{currentQuiz.questions[currentQuestionIdx].correctAnswer}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={
                    currentQuiz.questions[currentQuestionIdx].type === 'multiple_choice' 
                      ? selectedOption === null 
                      : shortAnswerInput.trim() === ""
                  }
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{currentQuestionIdx + 1 === currentQuiz.questions.length ? "View Summary" : "Next Question"}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {isAnswerSubmitted && (
            <div 
              className={`border rounded-xl p-4 flex gap-3.5 shadow-2xs ${
                answersHistory[currentQuestionIdx]?.isCorrect 
                  ? 'bg-emerald-50/70 border-emerald-200' 
                  : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="shrink-0 pt-0.5">
                {answersHistory[currentQuestionIdx]?.isCorrect ? (
                  <CheckCircle className="text-emerald-600" size={18} />
                ) : (
                  <XCircle className="text-rose-600" size={18} />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <h4 className={`font-bold ${
                  answersHistory[currentQuestionIdx]?.isCorrect ? 'text-emerald-900' : 'text-rose-900'
                }`}>
                  {answersHistory[currentQuestionIdx]?.isCorrect ? 'Correct! (+20 XP)' : 'Not quite right'}
                </h4>
                <p className="text-slate-700 leading-relaxed font-normal mt-0.5">
                  {currentQuiz.questions[currentQuestionIdx].explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {isQuizComplete && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl shrink-0">
                  <Award size={32} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Quiz Completed
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    Practice Assessment Summary
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Subject: <span className="font-semibold text-slate-800">{selectedSubject}</span> • Grade: <span className="font-semibold text-slate-800">{selectedGrade}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Accuracy</span>
                  <span className="text-lg font-bold text-slate-900">{Math.round((scoreCount / currentQuiz.questions.length) * 100)}%</span>
                </div>
                <div className="text-center bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-indigo-600 uppercase block font-semibold">XP Earned</span>
                  <span className="text-lg font-bold text-indigo-700 flex items-center justify-center gap-1">
                    <Zap size={14} className="fill-indigo-600 text-indigo-600" />
                    +{xpEarned}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Question Review ({currentQuiz.questions.length} questions)
            </h3>
            
            <div className="space-y-3">
              {currentQuiz.questions.map((q, idx) => {
                const history = answersHistory.find(h => h.questionId === q.id);
                const isCorrect = history?.isCorrect || false;
                return (
                  <div 
                    key={q.id}
                    className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex gap-3 items-start">
                      <span className="mt-0.5 shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="text-emerald-600" size={16} />
                        ) : (
                          <XCircle className="text-rose-600" size={16} />
                        )}
                      </span>
                      <div className="space-y-1 flex-1">
                        <p className="text-xs font-bold text-slate-900 leading-relaxed">
                          {q.questionText}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs pt-1">
                          <span className="text-slate-500">Your Answer:</span>
                          <span className={isCorrect ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                            {history?.userAnswer || "No Response"}
                          </span>
                          {!isCorrect && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-500">Correct Answer:</span>
                              <span className="text-emerald-700 font-semibold">
                                {q.type === 'multiple_choice' && q.options && q.correctOptionIndex !== undefined ? q.options[q.correctOptionIndex] : q.correctAnswer}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                          <BookOpen size={11} /> Explanation
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenHelpForQuestion(q)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          title="Open conceptual breakdown"
                        >
                          <Lightbulb size={11} className="text-amber-600" />
                          <span>Help Me Understand</span>
                        </button>
                      </div>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleResetQuiz}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw size={13} />
              <span>Start Another Practice Quiz</span>
            </button>
          </div>
        </div>
      )}

      <HelpMeUnderstandModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        question={helpModalQuestion}
        initialGrade={selectedGrade}
        initialSubject={selectedSubject}
        adjustXP={adjustXP}
      />
    </div>
  );
}
