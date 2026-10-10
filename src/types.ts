export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  image?: {
    mimeType: string;
    data: string; // base64 string
  };
}

export interface AnimationConfig {
  id: string;
  prompt: string;
  speed: number;       // 1 to 10
  count: number;       // particle count 10 to 180
  color: string;       // primary neon color (hex format, e.g. #38bdf8)
  secondaryColor: string; // secondary complementary neon (e.g. #f472b6)
  shape: 'circle' | 'square' | 'line' | 'star' | 'atom' | 'helix';
  pattern: 'orbit' | 'wave' | 'vortex' | 'gravity' | 'ripple';
  glow: boolean;
  createdAt: string;
}

export interface Notebook {
  id: string;
  title: string;
  subject: string;
  grade: string; // "Grade 1" to "Grade 12"
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  isEraser: boolean;
  type: 'start' | 'draw';
}

export const SUBJECTS = [
  { id: 'math', name: 'Mathematics', icon: '📐', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50' },
  { id: 'english', name: 'English', icon: '📚', color: 'from-sky-400 to-blue-500', bg: 'bg-sky-50' },
  { id: 'hindi', name: 'Hindi', icon: '🇮🇳', color: 'from-orange-400 to-amber-500', bg: 'bg-orange-50' },
  { id: 'gujarati', name: 'Gujarati', icon: '📖', color: 'from-teal-400 to-emerald-500', bg: 'bg-teal-50' },
  { id: 'social', name: 'Social Science', icon: '🌍', color: 'from-rose-400 to-red-500', bg: 'bg-rose-50' },
  { id: 'french', name: 'French', icon: '🇫🇷', color: 'from-indigo-400 to-blue-500', bg: 'bg-indigo-50' },
  { id: 'computer', name: 'Computer', icon: '💻', color: 'from-purple-400 to-fuchsia-500', bg: 'bg-purple-50' },
  { id: 'gk', name: 'General Knowledge (GK)', icon: '💡', color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50' },
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'from-indigo-400 to-violet-500', bg: 'bg-indigo-50' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'from-green-400 to-emerald-500', bg: 'bg-green-50' },
  { id: 'history', name: 'History & Civics', icon: '🏛️', color: 'from-rose-400 to-red-500', bg: 'bg-rose-50' },
  { id: 'art', name: 'Art & Music', icon: '🎨', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-50' }
];

export const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

export interface ThreeDVertex {
  x: number;
  y: number;
  z: number;
  label?: string;
  color?: string;
  title?: string;
  description?: string;
  insight?: string;
}

export interface ThreeDEdge {
  fromIdx: number;
  toIdx: number;
  color?: string;
  dashed?: boolean;
}

export interface ThreeDFace {
  indices: number[];
  color: string;
}

export interface ThreeDModel {
  id: string;
  name: string;
  prompt: string;
  category: string;
  vertices: ThreeDVertex[];
  edges: ThreeDEdge[];
  faces: ThreeDFace[];
  explainerText: string;
  autoRotateSpeed: number;
  colorPalette: string[];
  isFallback?: boolean;
  isAnatomy?: boolean;
  anatomyType?: 'body' | 'heart' | 'brain' | 'lungs' | 'digestive' | 'skeleton';
  photoUrl?: string;
  anatomyHotspots?: { label: string; description: string; nodeIdx: number }[];
}

export type AssignmentType = 'homework_question' | 'study_sheet' | 'practice_quiz' | 'classic_book' | 'memory_booster' | 'custom_task';

export interface CompletedAssignment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  type: AssignmentType;
  scorePercentage: number;
  totalItems: number;
  correctItems: number;
  completedAt: string;
  status: 'mastered' | 'in_progress' | 'needs_review';
  topic: string;
  notes?: string;
  xpAwarded: number;
}

export interface QuizScoreRecord {
  id: string;
  quizTitle: string;
  subject: string;
  grade: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  xpEarned: number;
  timestamp: string;
  topic: string;
  breakdown?: {
    question: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
}

export interface TopicMastery {
  id: string;
  topicName: string;
  subject: string;
  masteryLevel: number; // 0 to 100%
  status: 'mastered' | 'in_progress' | 'needs_review'; // >= 80% = mastered, 50-79% = in_progress, < 50% = needs_review
  assessmentsCount: number;
  lastReviewed: string;
  recommendedAction: string;
  keyConcepts: string[];
}

export interface HelpMeUnderstandStep {
  stepNumber: number;
  title: string;
  explanation: string;
  keyFormulaOrRule?: string;
  proTip?: string;
}

export interface HelpMeUnderstandData {
  id: string;
  question: string;
  directAnswer: string;
  gradeLevel: string;
  subject: string;
  conceptTitle: string;
  conceptSummary: string; // clear and concise explanation of underlying concept
  everydayAnalogy: string; // grade-appropriate real world intuition
  steps: HelpMeUnderstandStep[];
  whyItWorks: string; // the foundational intuition / reason
  commonPitfalls: string[];
  conceptCheckQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  generatedAt: string;
}
