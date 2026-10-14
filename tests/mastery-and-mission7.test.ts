import { 
  generateStageQuestionsAuthoritative, 
  generateProceduralQuestions, 
  normalizeQuestionSignature 
} from '../src/server/stageEngine';
import { 
  getMission7State, 
  triggerMission7Event, 
  claimMission7Reward, 
  resetMission7State,
  INITIAL_MISSION7_TASKS,
  INITIAL_MISSION7_BADGES
} from '../src/lib/mission7Storage';

async function runMasteryAndMission7Tests() {
  console.log('--- NeoNova 4-Stage Mastery & Mission 7 Event Test Suite ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // --------------------------------------------------------------------------
  // PART 1: 4-STAGE MASTERY ENGINE & ANTI-REPETITION TESTS
  // --------------------------------------------------------------------------

  // Test 1: Generate questions for Grade 7 Mathematics Stage 2
  const attempt1 = await generateStageQuestionsAuthoritative({
    sessionId: 'session_test_1',
    userId: 'student_tester_001',
    subject: 'Mathematics',
    grade: 'Grade 7',
    topic: 'Algebraic Expressions & Equations',
    stage: 2,
    questionCount: 6
  });

  assert(attempt1.questions.length === 6, 'Attempt 1 returns requested count of 6 questions');
  assert(attempt1.questions.every(q => q.options && q.options.length >= 4), 'All questions have at least 4 options');
  assert(attempt1.questions.every(q => q.correctAnswer && q.explanation), 'All questions have valid correct answers and explanations');

  // Test 2: Correct answer distribution is NOT hardcoded to option index 0
  const optionIndices = attempt1.questions.map(q => q.correctOptionIndex);
  const notAllZero = optionIndices.some(idx => idx !== 0);
  assert(notAllZero, 'Correct answer is varied across options and NOT hardcoded to index 0');

  // Test 3: Second attempt on SAME subject, grade, topic, stage generates DIFFERENT questions
  const attempt2 = await generateStageQuestionsAuthoritative({
    sessionId: 'session_test_2',
    userId: 'student_tester_001',
    subject: 'Mathematics',
    grade: 'Grade 7',
    topic: 'Algebraic Expressions & Equations',
    stage: 2,
    questionCount: 6
  });

  assert(attempt2.questions.length === 6, 'Attempt 2 returns 6 questions');
  const texts1 = new Set(attempt1.questions.map(q => normalizeQuestionSignature(q.questionText)));
  const texts2 = attempt2.questions.map(q => normalizeQuestionSignature(q.questionText));
  const hasOverlap = texts2.some(t => texts1.has(t));
  assert(!hasOverlap, 'CRITICAL FIX: Attempt 2 produces genuinely different questions from Attempt 1 (zero repeats)');

  // Test 4: Third attempt also produces diverse non-repeating questions
  const attempt3 = await generateStageQuestionsAuthoritative({
    sessionId: 'session_test_3',
    userId: 'student_tester_001',
    subject: 'Mathematics',
    grade: 'Grade 7',
    topic: 'Algebraic Expressions & Equations',
    stage: 2,
    questionCount: 6
  });

  const texts3 = attempt3.questions.map(q => normalizeQuestionSignature(q.questionText));
  const overlapWithPrev = texts3.some(t => texts1.has(t));
  assert(!overlapWithPrev, 'Attempt 3 produces distinct questions with no overlap with Attempt 1');

  // Test 5: Procedural generator generates diverse mathematical expressions
  const proceduralMath = generateProceduralQuestions('Mathematics', 'Grade 8', 'Linear Equations', 1, 8);
  assert(proceduralMath.length === 8, 'Procedural math generator outputs 8 questions');
  const uniqueMathTexts = new Set(proceduralMath.map(q => q.questionText));
  assert(uniqueMathTexts.size === 8, 'All 8 procedural questions within a single test have unique questions');

  // Test 6: Procedural generator generates diverse science questions
  const proceduralScience = generateProceduralQuestions('Science', 'Grade 9', 'Cell Biology', 2, 4);
  assert(proceduralScience.length === 4, 'Procedural science generator outputs 4 questions');
  assert(proceduralScience.every(q => q.options.includes(q.correctAnswer)), 'Procedural science correct answer is contained in options');

  // Test 7: Stage 4 Mixed Test generates appropriate difficulty mix
  const proceduralMixed = generateProceduralQuestions('Mathematics', 'Grade 10', 'Comprehensive', 4, 10);
  const diffs = proceduralMixed.map(q => q.internalDifficulty);
  const hasEasy = diffs.includes('EASY');
  const hasMed = diffs.includes('MEDIUM');
  const hasHard = diffs.includes('HARD');
  assert(hasEasy && hasMed && hasHard, 'Stage 4 mixed exam includes EASY, MEDIUM, and HARD questions');

  // --------------------------------------------------------------------------
  // PART 2: MISSION 7 EVENT SYSTEM TESTS
  // --------------------------------------------------------------------------

  // Test 8: Mission 7 Initial State
  resetMission7State();
  const m7State = getMission7State('Rohan Sharma', 'Grade 8', 'CBSE');
  assert(m7State.tasks.length === 7, 'Mission 7 initialized with exactly 7 progressive missions');
  assert(m7State.badges.length === 4, 'Mission 7 initialized with 4 tiered badges');
  assert(m7State.tasks.every(t => t.status === 'available'), 'All missions are initially available');
  assert(!m7State.isAllCompleted, 'Event is initially not complete');

  // Test 9: Complete Day 1 Foundation Mission via Stage 1 passing
  const updated1 = triggerMission7Event('stage_completed', { stageNumber: 1, passed: true }, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const day1Task = updated1.tasks.find(t => t.id === 'm7_day1_foundation');
  assert(day1Task?.status === 'completed', 'Day 1 Ground Ignition completes upon passing Stage 1 test');

  // Test 10: Complete Day 2 Homework Mission via 3 homework problems
  triggerMission7Event('homework_solved', {}, 'Rohan Sharma', 'Grade 8', 'CBSE');
  triggerMission7Event('homework_solved', {}, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const updated2 = triggerMission7Event('homework_solved', {}, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const day2Task = updated2.tasks.find(t => t.id === 'm7_day2_homework');
  assert(day2Task?.status === 'completed', 'Day 2 Concept Deep Dive completes after solving 3 homework problems');

  // Test 11: Bronze Cadet Badge unlocks at 2 completed missions
  const bronzeBadge = updated2.badges.find(b => b.id === 'badge_m7_bronze');
  assert(bronzeBadge?.unlocked === true, 'Bronze Cadet Badge unlocks upon conquering 2 missions');

  // Test 12: Complete Day 3 Speed & Precision via Stage 2 passing
  const updated3 = triggerMission7Event('stage_completed', { stageNumber: 2, passed: true }, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const day3Task = updated3.tasks.find(t => t.id === 'm7_day3_speed');
  assert(day3Task?.status === 'completed', 'Day 3 Speed & Precision completes upon passing Stage 2 test');

  // Test 13: Complete Day 4 Optical Recon via camera scanner
  const updated4 = triggerMission7Event('scanner_used', {}, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const day4Task = updated4.tasks.find(t => t.id === 'm7_day4_scanner');
  assert(day4Task?.status === 'completed', 'Day 4 Optical Recon completes upon using scanner');

  // Test 14: Silver Specialist Crest unlocks at 4 completed missions
  const silverBadge = updated4.badges.find(b => b.id === 'badge_m7_silver');
  assert(silverBadge?.unlocked === true, 'Silver Specialist Crest unlocks upon conquering 4 missions');

  // Test 15: Complete Day 5 Mistakes via 2 mistake reviews
  triggerMission7Event('mistake_reviewed', {}, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const updated5 = triggerMission7Event('mistake_reviewed', {}, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const day5Task = updated5.tasks.find(t => t.id === 'm7_day5_mistakes');
  assert(day5Task?.status === 'completed', 'Day 5 Error Correction completes after reviewing 2 mistakes');

  // Test 16: Complete Day 6 Polymath challenge
  const updated6 = triggerMission7Event('polymath_tested', {}, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const day6Task = updated6.tasks.find(t => t.id === 'm7_day6_polymath');
  assert(day6Task?.status === 'completed', 'Day 6 Polymath Challenge completes');
  const goldBadge = updated6.badges.find(b => b.id === 'badge_m7_gold');
  assert(goldBadge?.unlocked === true, 'Gold Master Medallion unlocks upon conquering 6 missions');

  // Test 17: Complete Day 7 Grand Mastery Apex via Stage 4 Mixed Exam passing
  const updated7 = triggerMission7Event('stage_completed', { stageNumber: 4, passed: true }, 'Rohan Sharma', 'Grade 8', 'CBSE');
  const day7Task = updated7.tasks.find(t => t.id === 'm7_day7_apex');
  assert(day7Task?.status === 'completed', 'Day 7 Grand Mastery Apex completes upon conquering Stage 4 Mixed Exam');

  // Test 18: Apex Champion Trophy unlocks and Certificate is automatically issued
  const apexBadge = updated7.badges.find(b => b.id === 'badge_m7_apex');
  assert(apexBadge?.unlocked === true, 'Mission 7 Apex Champion Trophy unlocks upon conquering all 7 missions');
  assert(updated7.isAllCompleted === true, 'Mission 7 Championship marks isAllCompleted = true');
  assert(!!updated7.certificate, 'Official Certificate is generated');
  assert(updated7.certificate?.studentName === 'Rohan Sharma', 'Certificate issued to correct student name');
  assert(Boolean(updated7.certificate?.certificateCode.startsWith('NN-M7-')), 'Certificate has unique verifiable code format');
  assert(Boolean(updated7.certificate?.verificationHash), 'Certificate contains cryptographic verification hash');

  // Test 19: Claiming XP rewards
  let awardedXP = 0;
  const claimedState = claimMission7Reward('m7_day1_foundation', (amount) => {
    awardedXP += amount;
  });
  const claimedTask = claimedState.tasks.find(t => t.id === 'm7_day1_foundation');
  assert(claimedTask?.status === 'claimed', 'Mission status transitions to claimed after claiming XP');
  assert(awardedXP === 60, 'Correct reward XP amount (60 XP) is granted to student');
  assert(claimedState.totalBonusXpEarned >= 60, 'totalBonusXpEarned accumulates claimed rewards');

  console.log(`Results: ${passed}/${total} mastery & mission 7 tests passed.`);
}

runMasteryAndMission7Tests().catch(err => {
  console.error('Test runner encountered unexpected error:', err);
  process.exit(1);
});
