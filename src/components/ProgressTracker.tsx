import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  HelpCircle, 
  Search, 
  Filter, 
  Plus, 
  RotateCcw, 
  Download, 
  Check, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Lightbulb, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  MessageSquareQuote,
  Sparkle,
} from 'lucide-react';
import { 
  CompletedAssignment, 
  QuizScoreRecord, 
  TopicMastery, 
  SUBJECTS, 
  GRADES,
  AssignmentType 
} from '../types';
import { 
  getCompletedAssignments, 
  getQuizScores, 
  getTopicMasteryList, 
  calculateProgressAnalytics, 
  addCompletedAssignment, 
  resetProgressData 
} from '../lib/progressStorage';
import HelpMeUnderstandModal from './HelpMeUnderstandModal';

interface ProgressTrackerProps {
  onNavigateToQuiz?: (subject?: string) => void;
  onNavigateToChat?: (query?: string) => void;
  adjustXP?: (amount: number) => void;
}

export default function ProgressTracker({
  onNavigateToQuiz,
  onNavigateToChat,
  adjustXP
}: ProgressTrackerProps) {
  const [assignments, setAssignments] = useState<CompletedAssignment[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScoreRecord[]>([]);
  const [topics, setTopics] = useState<TopicMastery[]>([]);
  const [analytics, setAnalytics] = useState(calculateProgressAnalytics());

  const [activeTab, setActiveTab] = useState<'overview' | 'mastery' | 'quizzes' | 'assignments'>('overview');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'mastered' | 'in_progress' | 'needs_review'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(SUBJECTS[0].name);
  const [newGrade, setNewGrade] = useState('Grade 8');
  const [newType, setNewType] = useState<AssignmentType>('homework_question');
  const [newScore, setNewScore] = useState<number>(85);
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpModalQuestion, setHelpModalQuestion] = useState('');
  const [helpModalSubject, setHelpModalSubject] = useState('Mathematics');

  const refreshData = () => {
    const loadedAssignments = getCompletedAssignments();
    const loadedQuizzes = getQuizScores();
    const loadedTopics = getTopicMasteryList();
    const computedAnalytics = calculateProgressAnalytics();

    setAssignments(loadedAssignments);
    setQuizScores(loadedQuizzes);
    setTopics(loadedTopics);
    setAnalytics(computedAnalytics);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const matchSubject = selectedSubjectFilter === 'all' || a.subject === selectedSubjectFilter;
      const matchSearch = searchQuery === '' || 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [assignments, selectedSubjectFilter, searchQuery]);

  const filteredQuizzes = useMemo(() => {
    return quizScores.filter(q => {
      const matchSubject = selectedSubjectFilter === 'all' || q.subject === selectedSubjectFilter;
      const matchSearch = searchQuery === '' || 
        q.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [quizScores, selectedSubjectFilter, searchQuery]);

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchSubject = selectedSubjectFilter === 'all' || t.subject === selectedSubjectFilter;
      const matchStatus = selectedStatusFilter === 'all' || t.status === selectedStatusFilter;
      const matchSearch = searchQuery === '' || 
        t.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchStatus && matchSearch;
    });
  }, [topics, selectedSubjectFilter, selectedStatusFilter, searchQuery]);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const calculatedStatus: 'mastered' | 'in_progress' | 'needs_review' = 
      newScore >= 80 ? 'mastered' : newScore >= 50 ? 'in_progress' : 'needs_review';

    const newAsg: CompletedAssignment = {
      id: `manual-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      grade: newGrade,
      type: newType,
      scorePercentage: newScore,
      totalItems: 10,
      correctItems: Math.round(10 * (newScore / 100)),
      status: calculatedStatus,
      completedAt: new Date().toISOString(),
      topic: newTopic.trim() || newTitle.trim(),
      notes: newNotes.trim() || undefined,
      xpAwarded: Math.round(newScore * 0.4)
    };

    addCompletedAssignment(newAsg);
    if (adjustXP && newAsg.xpAwarded > 0) {
      adjustXP(newAsg.xpAwarded);
    }

    setNewTitle('');
    setNewTopic('');
    setNewNotes('');
    setNewScore(85);
    setIsAddModalOpen(false);
    refreshData();
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all progress tracking data? This will clear your log back to 0.")) {
      resetProgressData();
      refreshData();
    }
  };

  const handleExportJSON = () => {
    const reportData = {
      exportedAt: new Date().toISOString(),
      analytics,
      assignments,
      quizScores,
      topics
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neonova-progress-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  const openHelpModal = (topicName: string, subject: string) => {
    setHelpModalQuestion(`Explain the concept of "${topicName}" step-by-step with practical examples and clear explanations.`);
    setHelpModalSubject(subject);
    setHelpModalOpen(true);
  };

  const isZeroBaseline = assignments.length === 0 && quizScores.length === 0 && topics.length === 0;

  return (
    <div 
      id="progress-tracking-system"
      className="p-4 md:p-6 bg-slate-50 min-h-full font-sans text-slate-800 relative space-y-6"
    >
      {/* TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Academic Analytics
            </span>
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
              <ShieldCheck size={13} /> Real-Time Tracking
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
            <span>Student Progress & Mastery Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Track completed homework, practice quiz accuracy, and detailed topic mastery across all your subjects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus size={14} />
            <span>Log Assignment</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            title="Download JSON Report"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export Report</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            title="Reset progress tracking stats"
          >
            <RotateCcw size={13} />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* TOP KEY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Completed Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {analytics.totalAssignments}
              </span>
              <span className="text-xs text-blue-600 font-semibold">Tasks Logged</span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (analytics.totalAssignments / 10) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Goal: 10 Tasks</span>
              <span className="text-blue-600 font-medium">{Math.round(Math.min(100, (analytics.totalAssignments / 10) * 100))}% Completed</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-bold ${
                analytics.averageScorePercentage >= 80 ? 'text-emerald-600' : analytics.averageScorePercentage >= 50 ? 'text-amber-600' : 'text-slate-700'
              }`}>
                {analytics.averageScorePercentage}%
              </span>
              <span className="text-xs text-indigo-600 font-semibold">Accuracy</span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${analytics.averageScorePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Benchmark: 75%</span>
              <span className={analytics.averageScorePercentage >= 80 ? 'text-emerald-600 font-medium' : analytics.averageScorePercentage >= 50 ? 'text-amber-600 font-medium' : 'text-slate-400'}>
                {analytics.averageScorePercentage >= 80 ? 'Mastered' : analytics.averageScorePercentage >= 50 ? 'Proficient' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Topic Mastery Status
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {analytics.topicsMasteredCount}
                </span>
                <span className="text-[11px] text-slate-500">Mastered</span>
              </div>
              <span className="text-slate-300">/</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold text-rose-600">
                  {analytics.topicsNeedsReviewCount}
                </span>
                <span className="text-[11px] text-slate-500">Review</span>
              </div>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 h-2 rounded-full overflow-hidden flex border border-slate-200/60">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${topics.length > 0 ? (analytics.topicsMasteredCount / topics.length) * 100 : 0}%` }}
              />
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${topics.length > 0 ? (analytics.topicsInProgressCount / topics.length) * 100 : 0}%` }}
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${topics.length > 0 ? (analytics.topicsNeedsReviewCount / topics.length) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-medium text-slate-500 mt-1">
              <span className="text-emerald-600">• {analytics.topicsMasteredCount} Mastered</span>
              <span className="text-rose-600">• {analytics.topicsNeedsReviewCount} Review</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Academic Points Reward
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                +{analytics.totalXpEarned}
              </span>
              <span className="text-xs text-violet-600 font-semibold">XP</span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-violet-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (analytics.totalXpEarned / 1000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Level: Active Scholar</span>
              <span className="text-violet-600 font-medium">Next: {1000 - (analytics.totalXpEarned % 1000)} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* ZERO BASELINE / QUICK ACTION HUB */}
      {isZeroBaseline && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
                🚀
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Welcome to Your Progress Dashboard
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete practice quizzes, ask homework questions, or log worksheets to see your scores grow in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {onNavigateToQuiz && (
              <button
                type="button"
                onClick={() => onNavigateToQuiz()}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    🎯
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                      Take Practice Quiz
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Earn XP with interactive tests
                    </span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {onNavigateToChat && (
              <button
                type="button"
                onClick={() => onNavigateToChat()}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    💬
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600">
                      Ask Homework Question
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Get step-by-step guidance
                    </span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  📝
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-600">
                    Log Completed Assignment
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Record custom worksheets
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview', count: null },
            { id: 'mastery', label: '🎯 Topic Mastery', count: topics.length },
            { id: 'quizzes', label: '📝 Quizzes & Tests', count: quizScores.length },
            { id: 'assignments', label: '📋 Homework Log', count: assignments.length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics / tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map(s => (
              <option key={s.id} value={s.name}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB CONTENT AREAS */}
      <div>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-600" />
                    <span>Subject Completion & Mastery Analytics</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time completion percentage and mastery ratio across all your subjects.
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {analytics.subjectBreakdowns.length} Subjects
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.subjectBreakdowns.map((sub, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{sub.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{sub.subject}</h4>
                          <span className="text-[10px] text-slate-500">
                            {sub.completedAssignments} completed tasks • {sub.totalTopicsCount} topics tracked
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">{sub.masteryPercentage}%</span>
                        <span className={`block text-[10px] uppercase font-semibold ${
                          sub.masteryPercentage >= 80 ? 'text-emerald-600' : sub.masteryPercentage >= 50 ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {sub.masteryPercentage >= 80 ? 'Mastered' : sub.masteryPercentage >= 50 ? 'In Progress' : 'Awaiting Tasks'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${Math.max(sub.masteryPercentage > 0 ? sub.masteryPercentage : 0, 0)}%`,
                          backgroundColor: sub.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <HelpMeUnderstandModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        question={helpModalQuestion}
        initialSubject={helpModalSubject}
        adjustXP={adjustXP}
      />
    </div>
  );
}
