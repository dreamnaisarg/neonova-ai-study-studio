import { 
  StageNumber, 
  SubjectStageProgress, 
  StageTestAttempt,
  STAGE_CONFIGS 
} from '../types/stageSystem';
import { recordQuizScore, updateTopicMastery } from './progressStorage';
import { triggerMission7Event } from './mission7Storage';

const STORAGE_KEY_STAGE_PROGRESS = 'NEONOVA_4STAGE_PROGRESS_V1';
const STORAGE_KEY_STAGE_HISTORY = 'NEONOVA_4STAGE_ATTEMPTS_HISTORY_V1';

export const DEFAULT_PASSING_THRESHOLD = 70;

function getStore(): Record<string, SubjectStageProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAGE_PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load stage progress store', e);
    return {};
  }
}

function saveStore(store: Record<string, SubjectStageProgress>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_STAGE_PROGRESS, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save stage progress store', e);
  }
}

function buildStorageKey(subject: string, grade: string, topic: string = 'General Curriculum'): string {
  const normSubject = (subject || 'General').toLowerCase().trim();
  const normGrade = (grade || 'Grade 8').toLowerCase().trim();
  const normTopic = (topic || 'General Curriculum').toLowerCase().trim();
  return `${normSubject}__${normGrade}__${normTopic}`;
}

export function getSubjectStageProgress(
  subject: string,
  grade: string,
  topic: string = 'General Curriculum'
): SubjectStageProgress {
  const key = buildStorageKey(subject, grade, topic);
  const store = getStore();

  if (store[key]) {
    const prog = store[key];
    const threshold = STAGE_CONFIGS[1].passingThreshold;
    const s1Passed = (prog.bestScores[1] ?? 0) >= threshold;
    const s2Passed = (prog.bestScores[2] ?? 0) >= threshold;
    const s3Passed = (prog.bestScores[3] ?? 0) >= threshold;

    prog.stage1Status = s1Passed ? 'completed' : 'unlocked';
    prog.stage2Status = s2Passed ? 'completed' : (s1Passed ? 'unlocked' : 'locked');
    prog.stage3Status = s3Passed ? 'completed' : (s2Passed ? 'unlocked' : 'locked');
    prog.stage4Status = (prog.bestScores[4] ?? 0) >= threshold ? 'completed' : (s3Passed ? 'unlocked' : 'locked');
    return prog;
  }

  const initialProgress: SubjectStageProgress = {
    subject,
    grade,
    topic,
    stage1Status: 'unlocked', // Stage 1 is ALWAYS unlocked by default
    stage2Status: 'locked',
    stage3Status: 'locked',
    stage4Status: 'locked',
    bestScores: { 1: null, 2: null, 3: null, 4: null },
    latestScores: { 1: null, 2: null, 3: null, 4: null },
    attemptCounts: { 1: 0, 2: 0, 3: 0, 4: 0 },
    completionDates: { 1: null, 2: null, 3: null, 4: null }
  };

  store[key] = initialProgress;
  saveStore(store);
  return initialProgress;
}

export function recordStageAttempt(
  attempt: StageTestAttempt,
  adjustXP?: (amount: number) => void
): SubjectStageProgress {
  const key = buildStorageKey(attempt.subject, attempt.grade, attempt.topic);
  const store = getStore();
  const current = store[key] || getSubjectStageProgress(attempt.subject, attempt.grade, attempt.topic);

  const stageNum = attempt.stageNumber;
  const currentBest = current.bestScores[stageNum];
  const newScore = attempt.scorePercentage;
  const passThreshold = STAGE_CONFIGS[stageNum].passingThreshold;
  const isPassed = newScore >= passThreshold;

  current.latestScores[stageNum] = newScore;
  current.bestScores[stageNum] = currentBest === null ? newScore : Math.max(currentBest, newScore);
  current.attemptCounts[stageNum] = (current.attemptCounts[stageNum] || 0) + 1;
  
  if (isPassed && !current.completionDates[stageNum]) {
    current.completionDates[stageNum] = attempt.timestamp;
  }
  current.latestAttempt = attempt;

  const s1Passed = (current.bestScores[1] ?? 0) >= STAGE_CONFIGS[1].passingThreshold;
  const s2Passed = (current.bestScores[2] ?? 0) >= STAGE_CONFIGS[2].passingThreshold;
  const s3Passed = (current.bestScores[3] ?? 0) >= STAGE_CONFIGS[3].passingThreshold;

  current.stage1Status = s1Passed ? 'completed' : 'unlocked';
  current.stage2Status = s2Passed ? 'completed' : (s1Passed ? 'unlocked' : 'locked');
  current.stage3Status = s3Passed ? 'completed' : (s2Passed ? 'unlocked' : 'locked');
  current.stage4Status = (current.bestScores[4] ?? 0) >= STAGE_CONFIGS[4].passingThreshold ? 'completed' : (s3Passed ? 'unlocked' : 'locked');

  store[key] = current;
  saveStore(store);

  try {
    const rawHistory = localStorage.getItem(STORAGE_KEY_STAGE_HISTORY);
    const historyList: StageTestAttempt[] = rawHistory ? JSON.parse(rawHistory) : [];
    historyList.unshift(attempt);
    if (historyList.length > 100) historyList.length = 100;
    localStorage.setItem(STORAGE_KEY_STAGE_HISTORY, JSON.stringify(historyList));
  } catch (err) {
    console.error('Failed to append to stage history', err);
  }

  const baseXP = stageNum * 25;
  const bonusXP = isPassed ? Math.round(newScore * 0.5) : Math.round(newScore * 0.2);
  const totalXP = baseXP + bonusXP;
  if (adjustXP && totalXP > 0) {
    adjustXP(totalXP);
  }

  try {
    recordQuizScore({
      quizTitle: `${attempt.subject}: ${STAGE_CONFIGS[stageNum].name}`,
      subject: attempt.subject,
      grade: attempt.grade,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      scorePercentage: attempt.scorePercentage,
      xpEarned: totalXP,
      topic: attempt.topic,
      breakdown: attempt.answers.map(ans => ({
        question: ans.questionText,
        isCorrect: ans.isCorrect,
        userAnswer: ans.userAnswer,
        correctAnswer: ans.correctAnswer,
        explanation: ans.explanation
      }))
    });

    updateTopicMastery(
      attempt.topic || attempt.subject,
      attempt.subject,
      newScore
    );
  } catch (err) {
    console.warn('Progress tracker sync failed:', err);
  }

  // Trigger Mission 7 event progression
  try {
    const studentUser = typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_user') : null;
    const parsedUser = studentUser ? JSON.parse(studentUser) : {};
    const board = typeof window !== 'undefined' ? localStorage.getItem('neonova_curriculum_board') || 'CBSE' : 'CBSE';
    triggerMission7Event(
      'stage_completed',
      { stageNumber: stageNum, passed: isPassed, score: newScore },
      parsedUser.name || 'Student',
      attempt.grade,
      board
    );
  } catch (m7Err) {
    console.warn('Mission 7 event trigger failed:', m7Err);
  }

  return current;
}

export function getStageAttemptsHistory(): StageTestAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAGE_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getOverallStageStatistics(grade?: string): {
  totalPassedStages: number;
  totalAttempts: number;
  averageScore: number;
  masteredSubjects: number;
} {
  const store = getStore();
  let totalPassed = 0;
  let totalAttempts = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  const subjectMasteryMap = new Map<string, number>();

  for (const prog of Object.values(store)) {
    if (grade && prog.grade.toLowerCase() !== grade.toLowerCase()) continue;
    let subPassed = 0;
    ([1, 2, 3, 4] as StageNumber[]).forEach(s => {
      const best = prog.bestScores[s];
      const attempts = prog.attemptCounts[s] || 0;
      totalAttempts += attempts;
      if (best !== null && best !== undefined) {
        scoreSum += best;
        scoreCount++;
        if (best >= STAGE_CONFIGS[s].passingThreshold) {
          totalPassed++;
          subPassed++;
        }
      }
    });
    const currentCount = subjectMasteryMap.get(prog.subject) || 0;
    subjectMasteryMap.set(prog.subject, Math.max(currentCount, subPassed));
  }

  let fullyMastered = 0;
  subjectMasteryMap.forEach(count => {
    if (count >= 4) fullyMastered++;
  });

  return {
    totalPassedStages: totalPassed,
    totalAttempts,
    averageScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0,
    masteredSubjects: fullyMastered
  };
}
