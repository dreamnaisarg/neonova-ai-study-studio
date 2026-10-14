import { 
  Mission7State, 
  Mission7Task, 
  Mission7Badge, 
  Mission7Certificate, 
  Mission7TaskId 
} from '../types/mission7';

const STORAGE_KEY_MISSION7 = 'NEONOVA_MISSION7_STATE_V1';

export const INITIAL_MISSION7_TASKS: Mission7Task[] = [
  {
    id: 'm7_day1_foundation',
    dayNumber: 1,
    title: 'Ground Ignition',
    subtitle: 'Build Your Fundamentals',
    description: 'Pass any Stage 1 (Easy) assessment with a passing score of 70% or higher.',
    category: 'stage',
    xpReward: 60,
    targetCount: 1,
    currentProgress: 0,
    status: 'available',
    badgeReward: 'Bronze Ignition Pin',
    actionTab: 'stages',
    actionLabel: 'Launch Stage 1 Test'
  },
  {
    id: 'm7_day2_homework',
    dayNumber: 2,
    title: 'Concept Deep Dive',
    subtitle: 'Multi-Step Problem Solving',
    description: 'Solve and review 3 homework or practice problems using AI Homework Helper or Deep Solver.',
    category: 'homework',
    xpReward: 75,
    targetCount: 3,
    currentProgress: 0,
    status: 'available',
    actionTab: 'homework',
    actionLabel: 'Open AI Homework'
  },
  {
    id: 'm7_day3_speed',
    dayNumber: 3,
    title: 'Speed & Precision',
    subtitle: 'Intermediate Application',
    description: 'Conquer Stage 2 (Medium) testing with at least 70% accuracy.',
    category: 'stage',
    xpReward: 90,
    targetCount: 1,
    currentProgress: 0,
    status: 'available',
    actionTab: 'stages',
    actionLabel: 'Launch Stage 2 Test'
  },
  {
    id: 'm7_day4_scanner',
    dayNumber: 4,
    title: 'Optical Recon',
    subtitle: 'Hardware Document Inspection',
    description: 'Capture or upload 1 worksheet problem using the Optic Homework Scanner.',
    category: 'scanner',
    xpReward: 80,
    targetCount: 1,
    currentProgress: 0,
    status: 'available',
    actionTab: 'homework',
    actionLabel: 'Open Camera Scanner'
  },
  {
    id: 'm7_day5_mistakes',
    dayNumber: 5,
    title: 'Error Correction',
    subtitle: 'Turn Slip-Ups into Mastery',
    description: 'Remediate 2 calculation or concept errors in the Mistakes & Error Review Room.',
    category: 'mistakes',
    xpReward: 100,
    targetCount: 2,
    currentProgress: 0,
    status: 'available',
    actionTab: 'mistakes',
    actionLabel: 'Review Mistakes'
  },
  {
    id: 'm7_day6_polymath',
    dayNumber: 6,
    title: 'Polymath Challenge',
    subtitle: 'Cross-Disciplinary Exploration',
    description: 'Complete an assessment or flashcard study session in a secondary subject (Science, English, or Social).',
    category: 'study',
    xpReward: 110,
    targetCount: 1,
    currentProgress: 0,
    status: 'available',
    actionTab: 'subjects',
    actionLabel: 'Explore Subjects'
  },
  {
    id: 'm7_day7_apex',
    dayNumber: 7,
    title: 'The Grand Mastery Apex',
    subtitle: 'Ultimate Academic Exam',
    description: 'Conquer Stage 3 (Hard) or Stage 4 (Mixed Comprehensive Exam) with passing honors (≥ 70%).',
    category: 'stage',
    xpReward: 200,
    targetCount: 1,
    currentProgress: 0,
    status: 'available',
    badgeReward: 'Apex Champion Trophy',
    actionTab: 'stages',
    actionLabel: 'Launch Stage 4 Mixed Exam'
  }
];

export const INITIAL_MISSION7_BADGES: Mission7Badge[] = [
  {
    id: 'badge_m7_bronze',
    name: 'Bronze Cadet Badge',
    tier: 'bronze',
    icon: '🥉',
    unlocked: false,
    requiredMissions: 2,
    description: 'Completed 2 missions in the Mission 7 Mastery Championship.',
    badgeCode: 'M7-BRONZE-CADET'
  },
  {
    id: 'badge_m7_silver',
    name: 'Silver Specialist Crest',
    tier: 'silver',
    icon: '🥈',
    unlocked: false,
    requiredMissions: 4,
    description: 'Completed 4 missions demonstrating steady multidisciplinary grit.',
    badgeCode: 'M7-SILVER-SPECIALIST'
  },
  {
    id: 'badge_m7_gold',
    name: 'Gold Master Medallion',
    tier: 'gold',
    icon: '🥇',
    unlocked: false,
    requiredMissions: 6,
    description: 'Completed 6 missions on the verge of total curriculum mastery.',
    badgeCode: 'M7-GOLD-MASTER'
  },
  {
    id: 'badge_m7_apex',
    name: 'Mission 7 Apex Trophy',
    tier: 'apex',
    icon: '🏆',
    unlocked: false,
    requiredMissions: 7,
    description: 'Grand Champion of Mission 7: Complete Mastery across all 7 Days.',
    badgeCode: 'M7-APEX-CHAMPION'
  }
];

export function getMission7State(
  studentName = 'Student',
  grade = 'Grade 8',
  curriculumBoard = 'CBSE'
): Mission7State {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISSION7);
    if (!raw) {
      const initial = createInitialState();
      localStorage.setItem(STORAGE_KEY_MISSION7, JSON.stringify(initial));
      return initial;
    }
    const state: Mission7State = JSON.parse(raw);

    // Refresh badges state if completed missions threshold reached
    const completedCount = state.tasks.filter(t => t.status === 'completed' || t.status === 'claimed').length;
    let modified = false;

    state.badges.forEach(b => {
      if (!b.unlocked && completedCount >= b.requiredMissions) {
        b.unlocked = true;
        b.unlockedAt = new Date().toISOString();
        modified = true;
      }
    });

    if (completedCount >= 7 && !state.certificate) {
      state.certificate = createCertificate(studentName, grade, curriculumBoard, state.totalBonusXpEarned);
      state.isAllCompleted = true;
      modified = true;
    }

    if (modified) {
      localStorage.setItem(STORAGE_KEY_MISSION7, JSON.stringify(state));
    }
    return state;
  } catch (err) {
    console.error('Failed to load Mission 7 state:', err);
    return createInitialState();
  }
}

function createInitialState(): Mission7State {
  const now = new Date();
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    eventId: 'mission-7-championship-s1',
    seasonTitle: 'Mission 7: 7-Day Mastery Championship',
    seasonStartDate: now.toISOString(),
    seasonEndDate: endDate.toISOString(),
    daysRemaining: 7,
    eventStreak: 1,
    tasks: [...INITIAL_MISSION7_TASKS],
    badges: [...INITIAL_MISSION7_BADGES],
    totalBonusXpEarned: 0,
    isAllCompleted: false
  };
}

export function saveMission7State(state: Mission7State): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MISSION7, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('neonova_mission7_updated', { detail: state }));
  } catch (err) {
    console.error('Failed to save Mission 7 state:', err);
  }
}

export function claimMission7Reward(
  taskId: Mission7TaskId,
  adjustXP?: (amount: number) => void
): Mission7State {
  const state = getMission7State();
  const task = state.tasks.find(t => t.id === taskId);

  if (task && task.status === 'completed') {
    task.status = 'claimed';
    state.totalBonusXpEarned += task.xpReward;
    if (adjustXP && task.xpReward > 0) {
      adjustXP(task.xpReward);
    }
    saveMission7State(state);
  }

  return state;
}

export function triggerMission7Event(
  eventType: 'stage_completed' | 'homework_solved' | 'scanner_used' | 'mistake_reviewed' | 'polymath_tested',
  payload?: any,
  studentName = 'Student',
  grade = 'Grade 8',
  curriculumBoard = 'CBSE',
  adjustXP?: (amt: number) => void
): Mission7State {
  const state = getMission7State(studentName, grade, curriculumBoard);
  let changed = false;

  if (eventType === 'stage_completed' && payload) {
    const stageNum = payload.stageNumber;
    const passed = payload.passed;

    if (stageNum === 1 && passed) {
      const t1 = state.tasks.find(t => t.id === 'm7_day1_foundation');
      if (t1 && t1.status === 'available') {
        t1.currentProgress = 1;
        t1.status = 'completed';
        t1.completedAt = new Date().toISOString();
        changed = true;
      }
    }

    if (stageNum === 2 && passed) {
      const t3 = state.tasks.find(t => t.id === 'm7_day3_speed');
      if (t3 && t3.status === 'available') {
        t3.currentProgress = 1;
        t3.status = 'completed';
        t3.completedAt = new Date().toISOString();
        changed = true;
      }
    }

    if ((stageNum === 3 || stageNum === 4) && passed) {
      const t7 = state.tasks.find(t => t.id === 'm7_day7_apex');
      if (t7 && t7.status === 'available') {
        t7.currentProgress = 1;
        t7.status = 'completed';
        t7.completedAt = new Date().toISOString();
        changed = true;
      }
    }
  }

  if (eventType === 'homework_solved') {
    const t2 = state.tasks.find(t => t.id === 'm7_day2_homework');
    if (t2 && (t2.status === 'available' || t2.status === 'completed')) {
      t2.currentProgress = Math.min(t2.targetCount, t2.currentProgress + 1);
      if (t2.currentProgress >= t2.targetCount && t2.status === 'available') {
        t2.status = 'completed';
        t2.completedAt = new Date().toISOString();
      }
      changed = true;
    }
  }

  if (eventType === 'scanner_used') {
    const t4 = state.tasks.find(t => t.id === 'm7_day4_scanner');
    if (t4 && t4.status === 'available') {
      t4.currentProgress = 1;
      t4.status = 'completed';
      t4.completedAt = new Date().toISOString();
      changed = true;
    }
  }

  if (eventType === 'mistake_reviewed') {
    const t5 = state.tasks.find(t => t.id === 'm7_day5_mistakes');
    if (t5 && (t5.status === 'available' || t5.status === 'completed')) {
      t5.currentProgress = Math.min(t5.targetCount, t5.currentProgress + 1);
      if (t5.currentProgress >= t5.targetCount && t5.status === 'available') {
        t5.status = 'completed';
        t5.completedAt = new Date().toISOString();
      }
      changed = true;
    }
  }

  if (eventType === 'polymath_tested') {
    const t6 = state.tasks.find(t => t.id === 'm7_day6_polymath');
    if (t6 && t6.status === 'available') {
      t6.currentProgress = 1;
      t6.status = 'completed';
      t6.completedAt = new Date().toISOString();
      changed = true;
    }
  }

  // Update badges
  const completedCount = state.tasks.filter(t => t.status === 'completed' || t.status === 'claimed').length;
  state.badges.forEach(b => {
    if (!b.unlocked && completedCount >= b.requiredMissions) {
      b.unlocked = true;
      b.unlockedAt = new Date().toISOString();
      changed = true;
    }
  });

  // Check if all 7 missions completed
  if (completedCount >= 7 && !state.certificate) {
    state.certificate = createCertificate(studentName, grade, curriculumBoard, state.totalBonusXpEarned);
    state.isAllCompleted = true;
    changed = true;
  }

  if (changed) {
    saveMission7State(state);
  }

  return state;
}

function createCertificate(
  studentName: string,
  grade: string,
  curriculumBoard: string,
  xp: number
): Mission7Certificate {
  const code = `NN-M7-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  return {
    id: `cert-${Date.now()}`,
    certificateCode: code,
    studentName: studentName || 'Dedicated Student',
    grade: grade || 'Grade 8',
    curriculumBoard: curriculumBoard || 'CBSE',
    issuedAt: new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    totalXpEarned: xp + 500, // Includes completion bonus
    missionsCompleted: 7,
    verificationHash: Math.random().toString(36).substring(2, 12).toUpperCase(),
    distinction: 'Grand Academic Mastery with Highest Honors'
  };
}

export function resetMission7State(): Mission7State {
  const fresh = createInitialState();
  saveMission7State(fresh);
  return fresh;
}
