import React, { useState } from 'react';
import { 
  FileText, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Clock, 
  BrainCircuit, 
  BookOpen, 
  FlaskConical, 
  Layers, 
  Bot, 
  Search, 
  History, 
  Home, 
  Swords, 
  ShieldAlert, 
  Star,
  ChevronRight,
  Filter,
  Lock,
  Target,
  TrendingUp,
  User,
  Box,
  Mic,
  Calculator,
  Trophy,
  Smartphone,
  Eye
} from 'lucide-react';
import { EduTab } from './EduSidebar';
import { PlanTier, PLANS, canAccessFeature } from '../../lib/billing';

export interface ToolItem {
  id: string;
  category: 'homework' | 'practice' | 'learning' | 'science' | 'neovision';
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag?: string;
  action: () => void;
  isNeoVision?: boolean;
}

interface StudyToolsPageProps {
  onNavigateTab: (tab: EduTab) => void;
  onOpenScanner: () => void;
  onOpenVoice?: () => void;
  onLaunchTool: (toolId: string) => void;
  onOpenNeoVisionSection: (section: 'teacher' | 'scanner' | 'timeline' | 'room' | 'manga' | 'panic' | 'lab' | 'arena' | 'visualizer' | 'city') => void;
  currentTier?: PlanTier;
  onFeatureLocked?: (featureName: string, requiredTier: PlanTier, description?: string) => void;
  onOpenWidgets?: () => void;
  onOpenARLab?: () => void;
}

export default function StudyToolsPage({
  onNavigateTab,
  onOpenScanner,
  onOpenVoice,
  onLaunchTool,
  onOpenNeoVisionSection,
  currentTier = 'starter',
  onFeatureLocked,
  onOpenWidgets,
  onOpenARLab
}: StudyToolsPageProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'homework' | 'practice' | 'learning' | 'science' | 'neovision'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'homework', label: 'Homework' },
    { id: 'practice', label: 'Practice' },
    { id: 'learning', label: 'Learning' },
    { id: 'science', label: 'Science' },
    { id: 'neovision', label: 'NeoVision' }
  ];

  const tools: ToolItem[] = [
    // HOMEWORK
    {
      id: 'voice_ai_tutor',
      category: 'homework',
      title: 'Live Voice AI Tutor',
      description: 'Speak in real-time with your conversational academic voice tutor. Interrupt anytime for clarification.',
      icon: Mic,
      tag: 'VOICE AI',
      action: () => {
        if (onOpenVoice) onOpenVoice();
      }
    },
    {
      id: 'homework_helper',
      category: 'homework',
      title: 'AI Homework Helper & Chatbot',
      description: 'Step-by-step problem solver with multi-step reasoning, clean typography, and zero symbol clutter.',
      icon: FileText,
      tag: 'CLEAN SOLVER',
      action: () => onLaunchTool('homework_chat')
    },
    {
      id: 'deep_solver',
      category: 'homework',
      title: 'Deep Solver & Diagram Inspector',
      description: 'Rigorous 7-stage mathematical, scientific, and curriculum verification with diagram OCR inspection.',
      icon: Calculator,
      tag: 'VERIFIED ENGINE',
      action: () => onLaunchTool('deep_solver')
    },
    {
      id: 'homework_scanner',
      category: 'homework',
      title: 'Optic Homework Scanner',
      description: 'Capture worksheets or textbook questions instantly with camera optical recognition.',
      icon: Camera,
      action: onOpenScanner
    },
    {
      id: 'formula_helper',
      category: 'homework',
      title: 'Formula Helper & Blackboard',
      description: 'Interactive mathematical scratchpad, geometry angle guides, and formula sheets.',
      icon: Sparkles,
      action: () => onLaunchTool('drawing')
    },

    // PRACTICE
    {
      id: 'adaptive_practice',
      category: 'practice',
      title: 'Adaptive Practice Engine',
      description: 'Personalized Easy → Medium → Hard → Mixed question banks across all 14 subjects adapting to your mistakes.',
      icon: Target,
      tag: 'ADAPTIVE AI',
      action: () => onNavigateTab('practice')
    },
    {
      id: 'mistakes_review',
      category: 'practice',
      title: 'Mistakes & Error Review',
      description: 'Track weak chapters, calculation errors, and sign slip-ups with personalized remediation drills.',
      icon: ShieldAlert,
      action: () => onNavigateTab('mistakes')
    },
    {
      id: 'mission7_event',
      category: 'practice',
      title: 'Mission 7 Mastery Championship',
      description: '7-Day academic quest and seasonal event. Complete daily curriculum missions, earn badges, and win your official verified Certificate.',
      icon: Trophy,
      tag: 'SEASONAL EVENT',
      action: () => onNavigateTab('mission7' as any)
    },
    {
      id: 'stages_system',
      category: 'practice',
      title: '4-Stage Testing System',
      description: 'Structured progressive testing: Stage 1 (Easy), Stage 2 (Medium), Stage 3 (Hard), and Stage 4 (Mixed Exam) for every grade and subject.',
      icon: Award,
      tag: 'NEW SYSTEM',
      action: () => onNavigateTab('stages' as any)
    },
    {
      id: 'practice_quiz',
      category: 'practice',
      title: 'Practice Quiz',
      description: 'Adaptive curriculum quizzes testing multiple choice and short answer mastery.',
      icon: CheckCircle2,
      action: () => onLaunchTool('quiz')
    },
    {
      id: 'daily_challenge',
      category: 'practice',
      title: 'Daily Challenge',
      description: 'Structured 5-question daily challenge to maintain consistent study habits.',
      icon: Award,
      action: () => onLaunchTool('daily')
    },
    {
      id: 'exam_practice',
      category: 'practice',
      title: 'Exam Practice & Alarms',
      description: 'Timed exam simulations and spaced homework reminder schedule.',
      icon: Clock,
      action: () => onLaunchTool('alerts')
    },
    {
      id: 'career_match',
      category: 'practice',
      title: 'Future Career Matcher',
      description: 'Explore futuristic careers and skill roadmaps based on your favorite subjects.',
      icon: Star,
      action: () => onLaunchTool('career')
    },

    // LEARNING
    {
      id: 'memory_booster',
      category: 'learning',
      title: 'Memory Booster',
      description: 'Spaced repetition flashcards with mnemonic anchors for long-term retention.',
      icon: BrainCircuit,
      action: () => onLaunchTool('memory')
    },
    {
      id: 'notes_summarizer',
      category: 'learning',
      title: 'Notes & Summarizer',
      description: 'Condense heavy chapters into digestible bullet points and quick glossaries.',
      icon: FileText,
      action: () => onLaunchTool('notes')
    },
    {
      id: 'interactive_learning',
      category: 'learning',
      title: 'Interactive Learning Companion',
      description: 'Conversational academic companion NeoNova AI Tutor for study guidance and concept coaching.',
      icon: Bot,
      action: () => onLaunchTool('ai_tutor')
    },
    {
      id: 'subjects_explorer',
      category: 'learning',
      title: 'Subjects & Curriculum Syllabi',
      description: 'Explore full chapter lists, textbook references, and core learning goals for your grade.',
      icon: BookOpen,
      action: () => onNavigateTab('subjects')
    },
    {
      id: 'classics_library',
      category: 'learning',
      title: 'Classics Reading Library (1,200+ Books)',
      description: 'Curated collection of public domain literature, science masterpieces, and history books.',
      icon: BookOpen,
      action: () => onNavigateTab('library')
    },
    {
      id: 'progress_analytics',
      category: 'learning',
      title: 'Progress & Mastery Analytics',
      description: 'Review your subject mastery bars, study streaks, XP points, and completed assignments.',
      icon: TrendingUp,
      action: () => onNavigateTab('progress')
    },

    // SCIENCE
    {
      id: 'lab_practice',
      category: 'science',
      title: 'Lab Practice (Simulations)',
      description: 'Interactive visual physics, biology, and chemistry kinetic particle simulations.',
      icon: FlaskConical,
      action: () => onLaunchTool('animation_lab')
    },
    {
      id: 'scientific_3d_lab',
      category: 'science',
      title: 'Scientific 3D Anatomy Lab',
      description: 'Interactive 3D organ scans, molecules, and biological anatomy atlas models.',
      icon: Layers,
      action: () => onLaunchTool('three_d_lab')
    },
    {
      id: 'ar_science_lab',
      category: 'science',
      title: 'AR Science Lab (Live Camera)',
      description: 'Project 3D organs, physics models, and anatomy right into your room with your device camera.',
      icon: Eye,
      tag: 'Augmented Reality',
      action: () => {
        onNavigateTab('ar_lab');
      }
    },
    {
      id: 'phone_widgets',
      category: 'learning',
      title: 'Phone Home Screen Widgets & Alarms',
      description: 'Set daily study alarms, flashcards, study streaks, and homework scan shortcuts on your phone screen.',
      icon: Smartphone,
      tag: 'Interactive Widgets',
      action: () => {
        if (onOpenWidgets) {
          onOpenWidgets();
        } else {
          onLaunchTool('phone_widgets');
        }
      }
    },

    // NEOVISION
    {
      id: 'neo_teacher',
      category: 'neovision',
      title: 'Hologram Teacher',
      description: 'Virtual interactive teacher avatar explaining complex science topics.',
      icon: Bot,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('teacher')
    },
    {
      id: 'neo_scanner',
      category: 'neovision',
      title: 'History Scanner',
      description: 'Scan real-world objects to explore historical timelines and scientific origins.',
      icon: Search,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('scanner')
    },
    {
      id: 'neo_visualizer',
      category: 'neovision',
      title: 'Formula Visualizer',
      description: 'Real-time graphical visualizer for quadratic equations and physics waves.',
      icon: Sparkles,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('visualizer')
    },
    {
      id: 'neo_lab',
      category: 'neovision',
      title: 'Scientific Sandbox Lab',
      description: 'Virtual reaction vessels and molecular simulations.',
      icon: FlaskConical,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('lab')
    },
    {
      id: 'neo_city',
      category: 'neovision',
      title: 'Study City Builder',
      description: 'Construct sustainable city grids by earning academic study points.',
      icon: Star,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('city')
    },
    {
      id: 'neo_room',
      category: 'neovision',
      title: 'Dream Study Room',
      description: 'Design and customize your personal virtual study environment.',
      icon: Home,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('room')
    },
    {
      id: 'neo_manga',
      category: 'neovision',
      title: 'Manga Generator',
      description: 'Turn difficult history or science concepts into 4-panel educational comics.',
      icon: BookOpen,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('manga')
    },
    {
      id: 'neo_arena',
      category: 'neovision',
      title: 'Study Battle Arena',
      description: 'Compete in rapid academic quiz bouts against friendly AI cadet bots.',
      icon: Swords,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('arena')
    },
    {
      id: 'neo_panic',
      category: 'neovision',
      title: 'Exam Panic Shield',
      description: 'Calming breathing exercises and targeted emergency revision checklists.',
      icon: ShieldAlert,
      isNeoVision: true,
      action: () => onOpenNeoVisionSection('panic')
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>All Features & Tools Hub</span>
          <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 uppercase">
            Complete Directory
          </span>
        </h1>
        <p className="text-xs text-slate-500">
          Instant access to all NeoNova features, AI engines, testing modes, and interactive science labs. Select any card to launch immediately.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeCategory === cat.id
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          const { allowed, requiredTier } = canAccessFeature(currentTier, tool.id);
          const isLocked = !allowed;

          const handleCardClick = () => {
            if (isLocked) {
              if (onFeatureLocked) {
                onFeatureLocked(tool.title, requiredTier, tool.description);
              }
            } else {
              tool.action();
            }
          };

          return (
            <div
              key={tool.id}
              className={`bg-white border rounded-2xl p-4.5 hover:shadow-sm transition-all flex flex-col justify-between ${
                isLocked 
                  ? 'border-slate-200/90 hover:border-indigo-300'
                  : tool.isNeoVision ? 'border-indigo-200/90' : 'border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isLocked
                      ? 'bg-slate-100 text-slate-500 border border-slate-200'
                      : tool.isNeoVision 
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tool.tag && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {tool.tag}
                      </span>
                    )}
                    {tool.isNeoVision && (
                      <span className="text-[10px] font-mono font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                        NEOVISION
                      </span>
                    )}
                    {isLocked && (
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                        requiredTier === 'pro' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        <Lock size={10} />
                        <span>{requiredTier.toUpperCase()}</span>
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span>{tool.title}</span>
                  {isLocked && <Lock size={12} className="text-slate-400 shrink-0" />}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {tool.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCardClick}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  isLocked
                    ? 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200'
                    : 'bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock size={12} className="text-indigo-600" />
                    <span>Unlock with {PLANS[requiredTier]?.name || 'Plus'}</span>
                  </>
                ) : (
                  <>
                    <span>Launch Tool</span>
                    <ChevronRight size={13} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="p-8 text-center text-slate-500 text-xs">
          No tools found matching "{searchQuery}". Try selecting "All Tools".
        </div>
      )}
    </div>
  );
}
