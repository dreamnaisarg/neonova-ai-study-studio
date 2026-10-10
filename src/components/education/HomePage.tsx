import React, { useState } from 'react';
import { 
  Camera, 
  Edit3, 
  Mic, 
  ArrowRight, 
  BookOpen, 
  HelpCircle, 
  BrainCircuit, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Layers,
  Clock,
  FileText,
  Lock,
  Search,
  Wrench,
  Bot
} from 'lucide-react';
import { EduTab } from './EduSidebar';
import { SUBJECTS } from '../../types';
import { PlanTier, PLANS, canAccessFeature } from '../../lib/billing';

interface HomePageProps {
  studentName: string;
  currentGrade: string;
  onNavigateTab: (tab: EduTab) => void;
  onAskQuestion: (initialQuestion?: string) => void;
  onOpenScanner: () => void;
  onStartVoice: () => void;
  onSelectSubjectChapter: (subject: string, chapterTitle: string) => void;
  onOpenStudyTool?: (toolId: string) => void;
  currentTier?: PlanTier;
  onFeatureLocked?: (name: string, tier: PlanTier, desc?: string) => void;
  onOpenPlans?: () => void;
}

type FeatureCategory = 'all' | 'testing' | 'homework' | 'science' | 'memory' | 'companion';

export default function HomePage({
  studentName,
  currentGrade,
  onNavigateTab,
  onAskQuestion,
  onOpenScanner,
  onStartVoice,
  onSelectSubjectChapter,
  onOpenStudyTool,
  currentTier = 'starter',
  onFeatureLocked,
  onOpenPlans
}: HomePageProps) {
  const [quickInput, setQuickInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [studentProfile, setStudentProfile] = useState<any | null>(null);

  // Load real student learning memory & recommendations
  React.useEffect(() => {
    fetch('/api/student/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'student-1' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          setStudentProfile(data.profile);
        }
      })
      .catch(() => {});
  }, []);

  // Time-based friendly greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onAskQuestion(quickInput.trim());
      setQuickInput('');
    } else {
      onNavigateTab('homework');
    }
  };

  const launchToolOrNavigate = (toolId: string) => {
    if (onOpenStudyTool) {
      onOpenStudyTool(toolId);
    } else {
      onNavigateTab('study_tools');
    }
  };

  // Recent study chapters tailored to grade
  const recentLessons = [
    {
      subject: 'Mathematics',
      icon: '📐',
      chapter: 'Chapter 3 – Fractions & Decimals',
      progress: 68,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    {
      subject: 'Science',
      icon: '🔬',
      chapter: 'Chapter 10 – Light & Reflection',
      progress: 52,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      subject: 'English',
      icon: '📚',
      chapter: 'Chapter 5 – Clauses & Grammar',
      progress: 74,
      color: 'text-sky-600 bg-sky-50 border-sky-200'
    }
  ];

  // Comprehensive Catalog of All Features & Learning Tools
  const allFeatures = [
    // 1. TESTING & EXAM MASTERY
    {
      id: 'stages',
      category: 'testing' as FeatureCategory,
      title: '4-Stage Testing System',
      description: 'Progression exam: Stage 1 (Easy 🟢), Stage 2 (Medium 🟡), Stage 3 (Hard 🔴), Stage 4 (Mixed Exam 🟣).',
      badge: 'NEW CURRICULUM',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Award,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
      tierRequired: 'starter' as PlanTier,
      action: () => onNavigateTab('stages')
    },
    {
      id: 'quiz',
      category: 'testing' as FeatureCategory,
      title: 'Adaptive Practice Quiz',
      description: 'Dynamic multiple-choice questions tailored to your grade with immediate explanations.',
      badge: 'INSTANT QUIZ',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: CheckCircle2,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      tierRequired: 'starter' as PlanTier,
      action: () => launchToolOrNavigate('quiz')
    },
    {
      id: 'daily',
      category: 'testing' as FeatureCategory,
      title: 'Daily 5-Question Challenge',
      description: 'Quick daily subject mix to keep your study streak and XP active every morning.',
      badge: 'DAILY STREAK',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: Clock,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      tierRequired: 'starter' as PlanTier,
      action: () => launchToolOrNavigate('daily')
    },

    // 2. AI HOMEWORK & PROBLEM SOLVING
    {
      id: 'homework_helper',
      category: 'homework' as FeatureCategory,
      title: 'AI Homework Helper',
      description: 'Step-by-step problem solver with multi-step reasoning and mathematical equation support.',
      badge: 'CORE TUTOR',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: FileText,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
      tierRequired: 'starter' as PlanTier,
      action: () => onNavigateTab('homework')
    },
    {
      id: 'scanner',
      category: 'homework' as FeatureCategory,
      title: 'Optical Homework Scanner',
      description: 'Snap photos of printed textbooks or handwritten worksheets for immediate AI breakdown.',
      badge: 'CAMERA OCR',
      badgeColor: 'bg-sky-100 text-sky-800',
      icon: Camera,
      iconColor: 'text-sky-600 bg-sky-50 border-sky-100',
      tierRequired: 'starter' as PlanTier,
      action: onOpenScanner
    },
    {
      id: 'drawing',
      category: 'homework' as FeatureCategory,
      title: 'Formula Blackboard & Canvas',
      description: 'Interactive geometry guide, angle measurement scratchpad, and formula reference.',
      badge: 'BLACKBOARD',
      badgeColor: 'bg-slate-100 text-slate-800',
      icon: Edit3,
      iconColor: 'text-slate-600 bg-slate-50 border-slate-100',
      tierRequired: 'starter' as PlanTier,
      action: () => launchToolOrNavigate('drawing')
    },

    // 3. VISUAL & SCIENCE LABS
    {
      id: 'three_d_lab',
      category: 'science' as FeatureCategory,
      title: 'Scientific 3D Anatomy Lab',
      description: 'Interactive 3D organ models (Human Body, Heart, Brain) with layer slicing & biology markers.',
      badge: '3D SPATIAL',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Layers,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
      tierRequired: 'plus' as PlanTier,
      action: () => {
        const access = canAccessFeature(currentTier, 'three_d_lab');
        if (!access.allowed) {
          onFeatureLocked?.('Scientific 3D Anatomy Lab', access.requiredTier, 'Inspect 3D anatomical models, slice cross-sections, and study internal biology.');
        } else {
          launchToolOrNavigate('three_d_lab');
        }
      }
    },
    {
      id: 'animation_lab',
      category: 'science' as FeatureCategory,
      title: 'Kinetic Physics Animation Lab',
      description: 'Interactive simulations for pendulum harmonics, lens optics, and wave motion.',
      badge: 'SIMULATIONS',
      badgeColor: 'bg-teal-100 text-teal-800',
      icon: FlaskConical,
      iconColor: 'text-teal-600 bg-teal-50 border-teal-100',
      tierRequired: 'plus' as PlanTier,
      action: () => {
        const access = canAccessFeature(currentTier, 'animation_lab');
        if (!access.allowed) {
          onFeatureLocked?.('Kinetic Animation Lab', access.requiredTier, 'Interactive physics simulations and kinetic laboratory experiments.');
        } else {
          launchToolOrNavigate('animation_lab');
        }
      }
    },

    // 4. MEMORY & RETENTION
    {
      id: 'memory',
      category: 'memory' as FeatureCategory,
      title: 'Memory Booster (Flashcards)',
      description: 'Spaced repetition flashcards with mnemonic anchors for long-term curriculum retention.',
      badge: 'ACTIVE RECALL',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: BrainCircuit,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      tierRequired: 'plus' as PlanTier,
      action: () => {
        const access = canAccessFeature(currentTier, 'memory');
        if (!access.allowed) {
          onFeatureLocked?.('Memory Booster', access.requiredTier, 'Spaced repetition flashcards for exam preparation.');
        } else {
          launchToolOrNavigate('memory');
        }
      }
    },
    {
      id: 'notes',
      category: 'memory' as FeatureCategory,
      title: 'Chapter Notes & Summarizer',
      description: 'Condense heavy chapters into digestible bullet points, formulas, and quick glossaries.',
      badge: 'HIGH YIELD',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: BookOpen,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      tierRequired: 'starter' as PlanTier,
      action: () => launchToolOrNavigate('notes')
    },
    {
      id: 'library',
      category: 'memory' as FeatureCategory,
      title: 'Educational Classics Library',
      description: 'Read scientific literature, textbooks, and public domain classic novels with AI insights.',
      badge: 'E-READER',
      badgeColor: 'bg-slate-100 text-slate-800',
      icon: BookOpen,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      tierRequired: 'starter' as PlanTier,
      action: () => onNavigateTab('library')
    },
    {
      id: 'alerts',
      category: 'memory' as FeatureCategory,
      title: 'Study Alerts & Schedule Maker',
      description: 'Set revision countdowns, homework reminders, and notification alarms.',
      badge: 'PLANNER',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: Clock,
      iconColor: 'text-rose-600 bg-rose-50 border-rose-100',
      tierRequired: 'starter' as PlanTier,
      action: () => launchToolOrNavigate('alerts')
    },

    // 5. COMPANION & GUIDANCE
    {
      id: 'ai_tutor',
      category: 'companion' as FeatureCategory,
      title: 'NeoNova AI Tutor',
      description: 'Conversational 24/7 student mentor and holistic academic guidance companion.',
      badge: 'AI MENTOR',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Bot,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-100',
      tierRequired: 'pro' as PlanTier,
      action: () => {
        const access = canAccessFeature(currentTier, 'ai_tutor');
        if (!access.allowed) {
          onFeatureLocked?.('NeoNova AI Tutor', access.requiredTier, '24/7 conversational mentor and personal academic study coach.');
        } else {
          onNavigateTab('ai_tutor');
        }
      }
    },
    {
      id: 'career',
      category: 'companion' as FeatureCategory,
      title: 'Future Career & Stream Matcher',
      description: 'Discover higher education streams, career trajectories, and fields matching your interests.',
      badge: 'GUIDANCE',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: GraduationCap,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      tierRequired: 'starter' as PlanTier,
      action: () => launchToolOrNavigate('career')
    }
  ];

  const filteredFeatures = allFeatures.filter((f) => {
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    const matchesSearch = !filterQuery.trim() || 
      f.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
      f.description.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-16">
      {/* 1. Header Greeting & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{currentGrade || 'Grade 8'}</span>
            <span>•</span>
            <span>Academic Platform</span>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenPlans}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                currentTier === 'pro'
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  : currentTier === 'plus'
                  ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {PLANS[currentTier]?.badge || 'STARTER'}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {studentName || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select any feature below or ask a question to begin learning.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('stages')}
          className="self-start sm:self-center px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Award size={15} />
          <span>4-Stage Testing</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 2. Primary Question Box (Hero AI Input) */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <form onSubmit={handleQuickSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask NeoNova anything... (e.g. solve 3x + 12 = 27, explain photosynthesis, grammar rules)"
              className="w-full bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Camera size={14} className="text-indigo-600" />
                <span>📷 Scan Homework</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (quickInput.trim()) {
                    onAskQuestion(quickInput.trim());
                  } else {
                    onNavigateTab('homework');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit3 size={14} className="text-slate-600" />
                <span>✏️ Step-by-Step Solver</span>
              </button>

              <button
                type="button"
                onClick={onStartVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Mic size={14} className="text-slate-600" />
                <span>🎙️ Voice</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ml-auto"
            >
              <span>Solve with AI</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </section>

      {/* 2b. SMART HOME DASHBOARD: Continue Learning, Recommended Practice, Weak Topics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Continue Learning */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={13} className="text-indigo-600" />
              <span>Continue Learning</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
              {currentGrade}
            </span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Mathematics: Linear Equations</h4>
            <p className="text-[11px] text-slate-500">Chapter 2 &middot; Transposition & Word Problems</p>
          </div>
          <button
            onClick={() => onNavigateTab('subjects')}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Resume Syllabus</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Card 2: Recommended Today (Based on actual learning history) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>Recommended Today</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Cognitive Memory</span>
          </div>
          <ul className="text-xs space-y-1.5 text-slate-700 font-medium">
            {studentProfile?.recommendedTopics && studentProfile.recommendedTopics.length > 0 ? (
              studentProfile.recommendedTopics.slice(0, 3).map((rec: any, idx: number) => (
                <li key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="truncate pr-2">• {rec.topic}</span>
                  <span className="text-slate-400 shrink-0 font-mono text-[10px]">{rec.estimatedMinutes}m</span>
                </li>
              ))
            ) : (
              <>
                <li className="flex items-center justify-between text-[11px]">
                  <span>• Review Fractions & Decimals</span>
                  <span className="text-slate-400 font-mono text-[10px]">10 min</span>
                </li>
                <li className="flex items-center justify-between text-[11px]">
                  <span>• Science: Crop Management</span>
                  <span className="text-slate-400 font-mono text-[10px]">5 Qs</span>
                </li>
                <li className="flex items-center justify-between text-[11px]">
                  <span>• Mathematics Mixed Test</span>
                  <span className="text-slate-400 font-mono text-[10px]">15 Qs</span>
                </li>
              </>
            )}
          </ul>
          <button
            onClick={() => onNavigateTab('practice')}
            className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Start Recommended Practice</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Card 3: Weak Topics & Mistake History */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-rose-500" />
              <span>Weak Topics & Mistakes</span>
            </span>
            <span className="text-[10px] font-mono text-rose-600 font-bold">
              {studentProfile?.mistakes?.length || 0} Logged
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              {studentProfile?.weakTopics && studentProfile.weakTopics.length > 0
                ? `Needs attention: ${studentProfile.weakTopics.join(', ')}`
                : 'No unresolved weak topics. Solid understanding demonstrated.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('mistakes')}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Review Mistake History</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* 3. FEATURED BANNER: 4-Stage Subject Testing System */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 border border-indigo-900/50">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/15">
            <Award size={14} className="text-amber-400" />
            <span>Grade 1–12 Progressive Testing</span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
            4-Stage Mastery & Exam Testing System
          </h2>

          <p className="text-xs text-indigo-200 leading-relaxed">
            Every subject and chapter is broken into 4 progressive stages with unlock requirements:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-left">
              <span className="text-[11px] font-bold text-emerald-400 block">Stage 1 • Easy</span>
              <span className="text-[10px] text-slate-300">Fundamentals</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-left">
              <span className="text-[11px] font-bold text-amber-400 block">Stage 2 • Med</span>
              <span className="text-[10px] text-slate-300">Application</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-left">
              <span className="text-[11px] font-bold text-rose-400 block">Stage 3 • Hard</span>
              <span className="text-[10px] text-slate-300">Deep Reasoning</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-left">
              <span className="text-[11px] font-bold text-purple-400 block">Stage 4 • Exam</span>
              <span className="text-[10px] text-slate-300">30/40/30 Mixed</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 z-10">
          <button
            type="button"
            onClick={() => onNavigateTab('stages')}
            className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch 4-Stage Tests</span>
            <ArrowRight size={14} />
          </button>
          <span className="text-[10px] text-indigo-300 text-center">
            Requires ≥ 70% to unlock next stage
          </span>
        </div>
      </section>

      {/* 4. ALL FEATURES LAUNCHPAD */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wrench size={18} className="text-indigo-600" />
              <span>Features & Study Tools Catalog</span>
            </h2>
            <p className="text-xs text-slate-500">
              Easily explore and launch all learning modules, quizzes, laboratories, and AI tools.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter features..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Features' },
            { id: 'testing', label: '🏆 Exams & Testing' },
            { id: 'homework', label: '📝 AI Homework' },
            { id: 'science', label: '🔬 3D & Science Labs' },
            { id: 'memory', label: '🧠 Memory & Notes' },
            { id: 'companion', label: '🤖 AI Guidance' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as FeatureCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredFeatures.map((feat) => {
            const Icon = feat.icon;
            const access = canAccessFeature(currentTier, feat.id);
            const isLocked = !access.allowed;

            return (
              <div
                key={feat.id}
                onClick={feat.action}
                className="bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 shadow-xs transition-all cursor-pointer flex flex-col justify-between group space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${feat.iconColor} group-hover:scale-105 transition-transform`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex items-center gap-1">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Lock size={10} /> {access.requiredTier.toUpperCase()}
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${feat.badgeColor}`}>
                          {feat.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>{isLocked ? 'Unlock Feature' : 'Launch'}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CONTINUE LEARNING */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Continue Learning
            </h2>
            <p className="text-xs text-slate-500">Pick up right where you left off</p>
          </div>
          <button
            onClick={() => onNavigateTab('subjects')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>All Subjects</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {recentLessons.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-bold text-slate-800">{item.subject}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-3 leading-snug">
                  {item.chapter}
                </h3>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>Syllabus Completed</span>
                  <span className="font-semibold text-slate-700 font-mono">{item.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onSelectSubjectChapter(item.subject, item.chapter)}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Study Chapter</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DAILY PRACTICE & MASTERY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>📅 Today's Academic Schedule</span>
            </h3>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">3 Tasks</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📐</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Mathematics</h4>
                  <p className="text-[11px] text-slate-500">Practice 4-Stage Test (Stage 1)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('stages')}
                className="px-3 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                Test
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔬</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Scientific 3D Lab</h4>
                  <p className="text-[11px] text-slate-500">Inspect Heart & Blood Anatomy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenStudyTool?.('three_d_lab')}
                className="px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                Explore
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧠</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Memory Booster</h4>
                  <p className="text-[11px] text-slate-500">10-minute active recall session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenStudyTool?.('memory')}
                className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                Recall
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Curriculum Mastery Overview
            </h3>
            <button
              onClick={() => onNavigateTab('progress')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Detailed Analytics →
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Mathematics</span>
                <span className="font-bold text-slate-900 font-mono">68%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Science</span>
                <span className="font-bold text-slate-900 font-mono">52%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '52%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">English</span>
                <span className="font-bold text-slate-900 font-mono">74%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">Computer Science</span>
                <span className="font-bold text-slate-900 font-mono">80%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
