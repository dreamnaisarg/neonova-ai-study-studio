import { CompletedAssignment, QuizScoreRecord, TopicMastery } from '../types';

const ASSIGNMENTS_KEY = 'neonova_completed_assignments_v2';
const QUIZ_SCORES_KEY = 'neonova_quiz_scores_v2';
const TOPIC_MASTERY_KEY = 'neonova_topic_mastery_v2';
const XP_KEY = 'neonova_academic_xp_v2';

export function getCompletedAssignments(): CompletedAssignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading assignments from storage', e);
    return [];
  }
}

export function saveCompletedAssignments(assignments: CompletedAssignment[]) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export function addCompletedAssignment(assignment: Omit<CompletedAssignment, 'id' | 'completedAt'>): CompletedAssignment {
  const current = getCompletedAssignments();
  const newEntry: CompletedAssignment = {
    ...assignment,
    id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    completedAt: new Date().toISOString()
  };
  const updated = [newEntry, ...current];
  saveCompletedAssignments(updated);

  if (assignment.topic && assignment.subject) {
    updateTopicMastery(assignment.topic, assignment.subject, assignment.scorePercentage);
  }
  return newEntry;
}

export function getQuizScores(): QuizScoreRecord[] {
  try {
    const raw = localStorage.getItem(QUIZ_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading quiz scores from storage', e);
    return [];
  }
}

export function saveQuizScores(scores: QuizScoreRecord[]) {
  localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify(scores));
}

export function recordQuizScore(record: Omit<QuizScoreRecord, 'id' | 'timestamp'>): QuizScoreRecord {
  const current = getQuizScores();
  const newEntry: QuizScoreRecord = {
    ...record,
    id: `qz-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString()
  };
  const updated = [newEntry, ...current];
  saveQuizScores(updated);

  addCompletedAssignment({
    title: record.quizTitle,
    subject: record.subject,
    grade: record.grade,
    type: 'practice_quiz',
    scorePercentage: record.scorePercentage,
    totalItems: record.totalQuestions,
    correctItems: record.correctCount,
    status: record.scorePercentage >= 80 ? 'mastered' : record.scorePercentage >= 50 ? 'in_progress' : 'needs_review',
    topic: record.topic || `${record.subject} Assessment`,
    notes: `Scored ${record.correctCount}/${record.totalQuestions} (${record.scorePercentage}%) with +${record.xpEarned} XP awarded.`,
    xpAwarded: record.xpEarned
  });

  return newEntry;
}

export function getTopicMasteryList(): TopicMastery[] {
  try {
    const raw = localStorage.getItem(TOPIC_MASTERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading topic mastery from storage', e);
    return [];
  }
}

export function saveTopicMasteryList(topics: TopicMastery[]) {
  localStorage.setItem(TOPIC_MASTERY_KEY, JSON.stringify(topics));
}

export function updateTopicMastery(topicName: string, subject: string, newScorePercentage: number): TopicMastery {
  const topics = getTopicMasteryList();
  const cleanTopicName = topicName.trim();
  const existingIdx = topics.findIndex(
    t => t.topicName.toLowerCase() === cleanTopicName.toLowerCase() || 
         t.topicName.toLowerCase().includes(cleanTopicName.toLowerCase()) || 
         cleanTopicName.toLowerCase().includes(t.topicName.toLowerCase())
  );

  let updatedTopic: TopicMastery;
  if (existingIdx !== -1) {
    const existing = topics[existingIdx];
    const newMastery = Math.round((existing.masteryLevel * 0.6) + (newScorePercentage * 0.4));
    const newStatus: 'mastered' | 'in_progress' | 'needs_review' = 
      newMastery >= 80 ? 'mastered' : newMastery >= 50 ? 'in_progress' : 'needs_review';
    
    let recommendedAction = existing.recommendedAction;
    if (newStatus === 'mastered') {
      recommendedAction = `Mastery attained at ${newMastery}%! Ready for advanced extension challenges.`;
    } else if (newStatus === 'in_progress') {
      recommendedAction = `Developing steady progress at ${newMastery}%. Practice another set to reach master tier.`;
    } else {
      recommendedAction = `Needs Review (${newMastery}%). Use 'Help Me Understand' to review core formulas and intuition.`;
    }

    updatedTopic = {
      ...existing,
      masteryLevel: Math.min(100, Math.max(0, newMastery)),
      status: newStatus,
      assessmentsCount: existing.assessmentsCount + 1,
      lastReviewed: new Date().toISOString(),
      recommendedAction
    };
    topics[existingIdx] = updatedTopic;
  } else {
    const newStatus: 'mastered' | 'in_progress' | 'needs_review' = 
      newScorePercentage >= 80 ? 'mastered' : newScorePercentage >= 50 ? 'in_progress' : 'needs_review';
    
    updatedTopic = {
      id: `top-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      topicName: cleanTopicName,
      subject,
      masteryLevel: Math.min(100, Math.max(0, Math.round(newScorePercentage))),
      status: newStatus,
      assessmentsCount: 1,
      lastReviewed: new Date().toISOString(),
      recommendedAction: newStatus === 'mastered' 
        ? 'Great start! Continue practicing to maintain high mastery.' 
        : newStatus === 'in_progress'
        ? 'Solid progress. Continue practicing questions to achieve full mastery.'
        : 'Topic added to tracker. Targeted practice recommended to solidify concepts.',
      keyConcepts: [cleanTopicName]
    };
    topics.unshift(updatedTopic);
  }

  saveTopicMasteryList(topics);
  return updatedTopic;
}

export interface ProgressAnalytics {
  totalAssignments: number;
  completedCount: number;
  averageScorePercentage: number;
  totalXpEarned: number;
  topicsMasteredCount: number;
  topicsInProgressCount: number;
  topicsNeedsReviewCount: number;
  overallMasteryPercentage: number;
  subjectBreakdowns: {
    subject: string;
    completedAssignments: number;
    averageScore: number;
    masteredTopicsCount: number;
    totalTopicsCount: number;
    masteryPercentage: number;
    color: string;
    icon: string;
  }[];
}

const DEFAULT_SUBJECTS: Array<{ name: string; color: string; icon: string }> = [
  { name: 'Mathematics', color: '#f59e0b', icon: '📐' },
  { name: 'General Science', color: '#10b981', icon: '🔬' },
  { name: 'English Literature', color: '#0ea5e9', icon: '📚' },
  { name: 'Physics', color: '#6366f1', icon: '⚛️' },
  { name: 'Chemistry', color: '#06b6d4', icon: '🧪' },
  { name: 'Biology', color: '#22c55e', icon: '🧬' },
  { name: 'History & Civics', color: '#f43f5e', icon: '🏛️' },
  { name: 'Computer Science', color: '#a855f7', icon: '💻' }
];

export function calculateProgressAnalytics(): ProgressAnalytics {
  const assignments = getCompletedAssignments();
  const topicMastery = getTopicMasteryList();

  const totalAssignments = assignments.length;
  const totalScore = assignments.reduce((sum, a) => sum + (Number(a.scorePercentage) || 0), 0);
  const averageScorePercentage = totalAssignments > 0 ? Math.round(totalScore / totalAssignments) : 0;
  const totalXpEarned = assignments.reduce((sum, a) => sum + (Number(a.xpAwarded) || 0), 0);

  const topicsMasteredCount = topicMastery.filter(t => t.status === 'mastered').length;
  const topicsInProgressCount = topicMastery.filter(t => t.status === 'in_progress').length;
  const topicsNeedsReviewCount = topicMastery.filter(t => t.status === 'needs_review').length;
  const totalTopics = topicMastery.length;
  const overallMasteryPercentage = totalTopics > 0
    ? Math.round(topicMastery.reduce((sum, t) => sum + t.masteryLevel, 0) / totalTopics)
    : 0;

  const subjectMap = new Map<string, {
    scores: number[];
    assignmentCount: number;
    masteryScores: number[];
    masteredCount: number;
  }>();

  DEFAULT_SUBJECTS.forEach(s => {
    subjectMap.set(s.name, { scores: [], assignmentCount: 0, masteryScores: [], masteredCount: 0 });
  });

  assignments.forEach(a => {
    const existing = subjectMap.get(a.subject) || { scores: [], assignmentCount: 0, masteryScores: [], masteredCount: 0 };
    existing.scores.push(a.scorePercentage);
    existing.assignmentCount += 1;
    subjectMap.set(a.subject, existing);
  });

  topicMastery.forEach(t => {
    const existing = subjectMap.get(t.subject) || { scores: [], assignmentCount: 0, masteryScores: [], masteredCount: 0 };
    existing.masteryScores.push(t.masteryLevel);
    if (t.status === 'mastered') {
      existing.masteredCount += 1;
    }
    subjectMap.set(t.subject, existing);
  });

  const subjectMeta: Record<string, { color: string; icon: string }> = {
    'Mathematics': { color: '#f59e0b', icon: '📐' },
    'General Science': { color: '#10b981', icon: '🔬' },
    'English Literature': { color: '#0ea5e9', icon: '📚' },
    'History & Civics': { color: '#f43f5e', icon: '🏛️' },
    'Physics': { color: '#6366f1', icon: '⚛️' },
    'Chemistry': { color: '#06b6d4', icon: '🧪' },
    'Biology': { color: '#22c55e', icon: '🧬' },
    'Computer Science': { color: '#a855f7', icon: '💻' },
    'Art & Music': { color: '#ec4899', icon: '🎨' }
  };

  const subjectBreakdowns = Array.from(subjectMap.entries()).map(([subject, data]) => {
    const avgScore = data.scores.length > 0
      ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
      : 0;
    const masteryPct = data.masteryScores.length > 0
      ? Math.round(data.masteryScores.reduce((a, b) => a + b, 0) / data.masteryScores.length)
      : avgScore;
    const meta = subjectMeta[subject] || { color: '#38bdf8', icon: '📖' };

    return {
      subject,
      completedAssignments: data.assignmentCount,
      averageScore: avgScore,
      masteredTopicsCount: data.masteredCount,
      totalTopicsCount: data.masteryScores.length,
      masteryPercentage: masteryPct,
      color: meta.color,
      icon: meta.icon
    };
  }).sort((a, b) => {
    if (b.completedAssignments !== a.completedAssignments) {
      return b.completedAssignments - a.completedAssignments;
    }
    return b.masteryPercentage - a.masteryPercentage;
  });

  return {
    totalAssignments,
    completedCount: totalAssignments,
    averageScorePercentage,
    totalXpEarned,
    topicsMasteredCount,
    topicsInProgressCount,
    topicsNeedsReviewCount,
    overallMasteryPercentage,
    subjectBreakdowns
  };
}

export function resetProgressData() {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify([]));
  localStorage.setItem(QUIZ_SCORES_KEY, JSON.stringify([]));
  localStorage.setItem(TOPIC_MASTERY_KEY, JSON.stringify([]));
  localStorage.setItem(XP_KEY, '0');
}

export function getAcademicXP(): number {
  try {
    const raw = localStorage.getItem(XP_KEY);
    if (raw) return parseInt(raw, 10) || 380;
  } catch {}
  return 380;
}

export function addAcademicXP(amount: number): number {
  const current = getAcademicXP();
  const updated = current + amount;
  localStorage.setItem(XP_KEY, String(updated));
  return updated;
}

