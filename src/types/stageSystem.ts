/**
 * NeoNova 4-Stage Learning and Testing System Types
 * Defines the complete structure for the 4 progressive stages:
 *  - Stage 1: EASY - ("Build your fundamentals")
 *  - Stage 2: MEDIUM - ("Strengthen your understanding")
 *  - Stage 3: HARD - ("Challenge yourself")
 *  - Stage 4: MIXED TEST - ("Test everything you've learned" - 30% Easy, 40% Med, 30% Hard)
 */

export type StageNumber = 1 | 2 | 3 | 4;
export type StageDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type StageStatus = 'locked' | 'unlocked' | 'completed' | 'in_progress';
export type InternalQuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface StageDefinition {
  stageNumber: StageNumber;
  name: string;
  badge: string;
  difficulty: StageDifficulty;
  subtitle: string;
  description: string;
  themeColor: {
    primary: string;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    ring: string;
    accent: string;
  };
  passingThreshold: number; // e.g. 70%
  defaultQuestionCount: number;
}

export const STAGE_CONFIGS: Record<StageNumber, StageDefinition> = {
  1: {
    stageNumber: 1,
    name: 'Stage 1 - Easy',
    badge: '🟢 EASY',
    difficulty: 'easy',
    subtitle: 'Build your fundamentals',
    description: 'Beginner-level questions focusing on core definitions, foundational concepts, and essential facts. Ideal for building solid confidence.',
    themeColor: {
      primary: '#10b981', // emerald-500
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      ring: 'ring-emerald-500/20',
      accent: 'emerald'
    },
    passingThreshold: 70,
    defaultQuestionCount: 8
  },
  2: {
    stageNumber: 2,
    name: 'Stage 2 - Medium',
    badge: '🟡 MEDIUM',
    difficulty: 'medium',
    subtitle: 'Strengthen your understanding',
    description: 'Intermediate-level questions requiring concept application, comparison, and straightforward problem-solving. Noticeably harder than Stage 1.',
    themeColor: {
      primary: '#f59e0b', // amber-500
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      ring: 'ring-amber-500/20',
      accent: 'amber'
    },
    passingThreshold: 70,
    defaultQuestionCount: 10
  },
  3: {
    stageNumber: 3,
    name: 'Stage 3 - Hard',
    badge: '🔴 HARD',
    difficulty: 'hard',
    subtitle: 'Challenge yourself',
    description: 'Advanced grade-appropriate questions requiring deep analytical thinking, multi-step calculations, deductive reasoning, and complex scenarios.',
    themeColor: {
      primary: '#ef4444', // rose-500
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      text: 'text-rose-800',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      ring: 'ring-rose-500/20',
      accent: 'rose'
    },
    passingThreshold: 70,
    defaultQuestionCount: 10
  },
  4: {
    stageNumber: 4,
    name: 'Stage 4 - Mixed Test',
    badge: '🟣 MIXED TEST',
    difficulty: 'mixed',
    subtitle: 'Test everything you\'ve learned',
    description: 'The ultimate comprehensive evaluation formatted like a formal school examination. Combines ~30% Easy, ~40% Medium, and ~30% Hard questions randomly mixed.',
    themeColor: {
      primary: '#8b5cf6', // purple-500
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      text: 'text-purple-800',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
      ring: 'ring-purple-500/20',
      accent: 'purple'
    },
    passingThreshold: 70,
    defaultQuestionCount: 12
  }
};

export type QuestionType = 'multiple_choice' | 'true_false' | 'numerical' | 'short_answer';

export interface StageQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  type: QuestionType;
  options?: string[]; // for multiple_choice & true_false
  correctOptionIndex?: number;
  correctAnswer: string;
  explanation: string;
  internalDifficulty: InternalQuestionDifficulty; // EASY, MEDIUM, or HARD (hidden from student during test!)
  topic?: string;
  hint?: string;
  conceptTested?: string;
  stepByStepHint?: string;
  problemFamily?: string;
  sessionId?: string;
  source?: 'ai' | 'procedural';
}

export interface UserAnswerRecord {
  questionId: string;
  questionNumber: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: QuestionType;
  internalDifficulty: InternalQuestionDifficulty;
  explanation: string;
  topic?: string;
}

export interface StageTestAttempt {
  attemptId: string;
  sessionId?: string;
  subject: string;
  grade: string;
  topic: string;
  stageNumber: StageNumber;
  difficulty: StageDifficulty;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  timestamp: string;
  answers: UserAnswerRecord[];
  mixedBreakdown?: {
    easyCorrect: number;
    easyTotal: number;
    mediumCorrect: number;
    mediumTotal: number;
    hardCorrect: number;
    hardTotal: number;
  };
  weakTopics: string[];
  xpEarned: number;
}

export interface SubjectStageProgress {
  subject: string;
  grade: string;
  topic: string;
  stage1Status: StageStatus;
  stage2Status: StageStatus;
  stage3Status: StageStatus;
  stage4Status: StageStatus;
  bestScores: Record<StageNumber, number | null>;
  latestScores: Record<StageNumber, number | null>;
  attemptCounts: Record<StageNumber, number>;
  completionDates: Record<StageNumber, string | null>;
  latestAttempt?: StageTestAttempt;
}

export interface OverallStageStats {
  totalStagesPassed: number;
  totalAttempts: number;
  averageScore: number;
  subjectsCompletedCount: number;
}
