import fs from 'fs';
import path from 'path';

export interface StudentMistakeRecord {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  mistakeCategory: 'calculation_error' | 'formula_misapplication' | 'conceptual_misunderstanding' | 'sign_error' | 'unit_omission' | 'reading_misinterpretation';
  explanation: string;
  timestamp: string;
  resolved: boolean;
}

export interface TopicPerformanceStat {
  topicName: string;
  subject: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracyRate: number; // 0 to 100
  commonMistakeCategory: string;
  improvementTrend: 'improving' | 'needs_practice' | 'stable';
  lastPracticed: string;
}

export interface StudentLearningProfile {
  userId: string;
  curriculum: {
    country: string;
    board: string;
    grade: string;
    textbook?: string;
  };
  preferredExplanationStyle: 'step_by_step' | 'conceptual' | 'visual' | 'rigorous';
  mistakes: StudentMistakeRecord[];
  topicStats: { [topicKey: string]: TopicPerformanceStat };
  weakTopics: string[];
  recommendedTopics: {
    topic: string;
    subject: string;
    reason: string;
    estimatedMinutes: number;
    recommendedQuestionCount: number;
  }[];
  lastRevisionGeneratedAt?: string;
}

let MEMORY_DB_PATH = 'student_memory.json';
try {
  const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '.';
  MEMORY_DB_PATH = path.join(cwd, 'student_memory.json');
} catch {}

function loadMemoryDb(): { [userId: string]: StudentLearningProfile } {
  try {
    if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(MEMORY_DB_PATH)) {
      const raw = fs.readFileSync(MEMORY_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load student memory DB, initializing fresh:', e);
  }
  return {};
}

function saveMemoryDb(db: { [userId: string]: StudentLearningProfile }) {
  try {
    fs.writeFileSync(MEMORY_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save student memory DB:', e);
  }
}

/**
 * Get or initialize student learning profile
 */
export function getStudentLearningProfile(userId: string): StudentLearningProfile {
  const db = loadMemoryDb();
  if (db[userId]) {
    return db[userId];
  }

  // Initial fresh profile for new authenticated student
  const fresh: StudentLearningProfile = {
    userId,
    curriculum: {
      country: 'India',
      board: 'cbse',
      grade: 'Grade 8',
      textbook: 'NCERT Mathematics'
    },
    preferredExplanationStyle: 'step_by_step',
    mistakes: [],
    topicStats: {},
    weakTopics: [],
    recommendedTopics: [
      {
        topic: 'Rational Numbers & Linear Equations',
        subject: 'Mathematics',
        reason: 'Recommended core foundation based on Grade 8 curriculum standards.',
        estimatedMinutes: 15,
        recommendedQuestionCount: 5
      }
    ]
  };

  db[userId] = fresh;
  saveMemoryDb(db);
  return fresh;
}

/**
 * Record a question attempt and update mistake log & topic statistics
 */
export function recordQuestionAttempt(params: {
  userId: string;
  subject: string;
  topic: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  mistakeCategory?: StudentMistakeRecord['mistakeCategory'];
  explanation?: string;
}): { success: boolean; profile: StudentLearningProfile; patternNotice?: string } {
  const db = loadMemoryDb();
  const profile = db[params.userId] || getStudentLearningProfile(params.userId);

  const topicKey = `${params.subject}::${params.topic}`.toLowerCase();
  const existingStat = profile.topicStats[topicKey] || {
    topicName: params.topic,
    subject: params.subject,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    accuracyRate: 100,
    commonMistakeCategory: 'None',
    improvementTrend: 'stable',
    lastPracticed: new Date().toISOString()
  };

  existingStat.attempts += 1;
  if (params.isCorrect) {
    existingStat.correct += 1;
  } else {
    existingStat.incorrect += 1;
    if (params.mistakeCategory) {
      existingStat.commonMistakeCategory = params.mistakeCategory.replace('_', ' ');
    }
  }

  existingStat.accuracyRate = Math.round((existingStat.correct / existingStat.attempts) * 100);
  existingStat.lastPracticed = new Date().toISOString();
  existingStat.improvementTrend = existingStat.accuracyRate >= 80 ? 'improving' : existingStat.accuracyRate < 60 ? 'needs_practice' : 'stable';

  profile.topicStats[topicKey] = existingStat;

  let patternNotice: string | undefined;

  // If incorrect, append to mistake history
  if (!params.isCorrect) {
    const newMistake: StudentMistakeRecord = {
      id: `mst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      subject: params.subject,
      topic: params.topic,
      question: params.question,
      studentAnswer: params.studentAnswer,
      correctAnswer: params.correctAnswer,
      mistakeCategory: params.mistakeCategory || 'conceptual_misunderstanding',
      explanation: params.explanation || 'Reviewed step-by-step.',
      timestamp: new Date().toISOString(),
      resolved: false
    };
    profile.mistakes.unshift(newMistake);

    // Keep mistakes array bounded to last 100
    if (profile.mistakes.length > 100) {
      profile.mistakes = profile.mistakes.slice(0, 100);
    }

    // Pattern Detection: if >= 2 mistakes in this topic
    const topicMistakesCount = profile.mistakes.filter(m => m.topic.toLowerCase() === params.topic.toLowerCase()).length;
    if (topicMistakesCount >= 2) {
      patternNotice = `Your recent practice shows that ${params.topic} is one of the topics you should review.`;
      if (!profile.weakTopics.includes(params.topic)) {
        profile.weakTopics.push(params.topic);
      }
    }
  } else {
    // If correct, check if student previously had mistakes on this topic and resolve one
    const pastMistake = profile.mistakes.find(m => m.topic.toLowerCase() === params.topic.toLowerCase() && !m.resolved);
    if (pastMistake) {
      pastMistake.resolved = true;
    }
    // Remove from weak topics if accuracy reaches >= 75%
    if (existingStat.accuracyRate >= 75) {
      profile.weakTopics = profile.weakTopics.filter(t => t.toLowerCase() !== params.topic.toLowerCase());
    }
  }

  // Re-generate recommendations based on real student history
  recalculateRecommendations(profile);

  db[params.userId] = profile;
  saveMemoryDb(db);

  return {
    success: true,
    profile,
    patternNotice
  };
}

/**
 * Dynamically re-evaluate recommendations based strictly on stored weak topics & mistakes
 */
function recalculateRecommendations(profile: StudentLearningProfile) {
  const recommendations: StudentLearningProfile['recommendedTopics'] = [];

  // 1. Weak topics from history
  profile.weakTopics.slice(0, 3).forEach(weakTopic => {
    recommendations.push({
      topic: weakTopic,
      subject: 'Mathematics',
      reason: `Identified from previous practice mistakes (accuracy < 65%). Reviewing this concept will strengthen your test readiness.`,
      estimatedMinutes: 10,
      recommendedQuestionCount: 5
    });
  });

  // 2. Unresolved mistakes
  const unresolvedTopics = Array.from(new Set(profile.mistakes.filter(m => !m.resolved).map(m => m.topic)));
  unresolvedTopics.slice(0, 2).forEach(topic => {
    if (!recommendations.some(r => r.topic.toLowerCase() === topic.toLowerCase())) {
      recommendations.push({
        topic,
        subject: 'Science',
        reason: `You had an incorrect answer on this topic recently. Review recommended questions to solidify understanding.`,
        estimatedMinutes: 8,
        recommendedQuestionCount: 4
      });
    }
  });

  // Default fallback if no weak topics yet
  if (recommendations.length === 0) {
    recommendations.push({
      topic: 'Mixed Diagnostic Review',
      subject: 'Curriculum Core',
      reason: 'Regular curriculum revision to maintain mastery.',
      estimatedMinutes: 12,
      recommendedQuestionCount: 6
    });
  }

  profile.recommendedTopics = recommendations;
}

/**
 * Generate a pre-exam targeted revision set based on student's actual previous mistakes
 */
export function generateExamRevisionPlan(userId: string): {
  success: boolean;
  totalMistakesAnalyzed: number;
  highPriorityTopics: string[];
  revisionModules: {
    topic: string;
    subject: string;
    previousMistakesCount: number;
    commonErrorType: string;
    actionableAdvice: string;
  }[];
} {
  const profile = getStudentLearningProfile(userId);
  const mistakes = profile.mistakes;

  // Group mistakes by topic
  const grouped: { [topic: string]: StudentMistakeRecord[] } = {};
  mistakes.forEach(m => {
    if (!grouped[m.topic]) grouped[m.topic] = [];
    grouped[m.topic].push(m);
  });

  const highPriorityTopics = Object.keys(grouped).sort((a, b) => grouped[b].length - grouped[a].length);

  const revisionModules = highPriorityTopics.slice(0, 5).map(topic => {
    const list = grouped[topic];
    const categoryCounts: { [cat: string]: number } = {};
    list.forEach(m => {
      categoryCounts[m.mistakeCategory] = (categoryCounts[m.mistakeCategory] || 0) + 1;
    });
    const mostCommonCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0] || 'conceptual_misunderstanding';

    let actionableAdvice = 'Review core definitions and formulas before re-attempting.';
    if (mostCommonCategory === 'calculation_error') {
      actionableAdvice = 'Double check arithmetic and intermediate steps with pencil and paper.';
    } else if (mostCommonCategory === 'sign_error') {
      actionableAdvice = 'Pay close attention to negative signs during transposition and parentheses expansion.';
    } else if (mostCommonCategory === 'unit_omission') {
      actionableAdvice = 'Always write the physical units (e.g. cm, m/s, kg) in your final answer.';
    }

    return {
      topic,
      subject: list[0]?.subject || 'Mathematics',
      previousMistakesCount: list.length,
      commonErrorType: mostCommonCategory.replace('_', ' '),
      actionableAdvice
    };
  });

  return {
    success: true,
    totalMistakesAnalyzed: mistakes.length,
    highPriorityTopics,
    revisionModules
  };
}

/**
 * Update student's curriculum settings
 */
export function updateStudentCurriculum(userId: string, curriculum: StudentLearningProfile['curriculum']) {
  const db = loadMemoryDb();
  const profile = db[userId] || getStudentLearningProfile(userId);
  profile.curriculum = curriculum;
  db[userId] = profile;
  saveMemoryDb(db);
  return profile;
}
