/**
 * NeoNova Mission 7 Event System Types
 * Defines the 7-day academic quest & mastery championship
 */

export type Mission7TaskId = 
  | 'm7_day1_foundation'
  | 'm7_day2_homework'
  | 'm7_day3_speed'
  | 'm7_day4_scanner'
  | 'm7_day5_mistakes'
  | 'm7_day6_polymath'
  | 'm7_day7_apex';

export type Mission7Category = 'stage' | 'homework' | 'scanner' | 'mistakes' | 'quiz' | 'study';

export type Mission7Status = 'locked' | 'available' | 'completed' | 'claimed';

export interface Mission7Task {
  id: Mission7TaskId;
  dayNumber: number; // 1 to 7
  title: string;
  subtitle: string;
  description: string;
  category: Mission7Category;
  xpReward: number;
  targetCount: number;
  currentProgress: number;
  status: Mission7Status;
  badgeReward?: string;
  actionTab: string;
  actionLabel: string;
  completedAt?: string;
}

export interface Mission7Badge {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'apex';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requiredMissions: number;
  description: string;
  badgeCode: string;
}

export interface Mission7Certificate {
  id: string;
  certificateCode: string;
  studentName: string;
  grade: string;
  curriculumBoard: string;
  issuedAt: string;
  totalXpEarned: number;
  missionsCompleted: number;
  verificationHash: string;
  distinction: string;
}

export interface Mission7State {
  eventId: string;
  seasonTitle: string;
  seasonStartDate: string;
  seasonEndDate: string;
  daysRemaining: number;
  eventStreak: number;
  tasks: Mission7Task[];
  badges: Mission7Badge[];
  certificate?: Mission7Certificate;
  totalBonusXpEarned: number;
  isAllCompleted: boolean;
}
