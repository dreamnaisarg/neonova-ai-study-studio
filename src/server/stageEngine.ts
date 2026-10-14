import { GoogleGenAI } from '@google/genai';
import { InternalQuestionDifficulty, QuestionType, StageNumber } from '../types/stageSystem';

export interface GeneratedQuestion {
  id: string;
  stageNumber: StageNumber;
  questionNumber: number;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctOptionIndex: number;
  correctAnswer: string;
  explanation: string;
  internalDifficulty: InternalQuestionDifficulty;
  conceptTested: string;
  stepByStepHint: string;
  problemFamily?: string;
}

// In-memory server session store to prevent repeating questions within recent student sessions
interface SessionHistory {
  lastUpdated: number;
  recentQuestionSignatures: Set<string>;
}

const sessionStore = new Map<string, SessionHistory>();

// Clean up stale sessions older than 24 hours
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of sessionStore.entries()) {
    if (now - val.lastUpdated > 24 * 60 * 60 * 1000) {
      sessionStore.delete(key);
    }
  }
}, 60 * 60 * 1000);
if (typeof cleanupTimer?.unref === 'function') {
  cleanupTimer.unref();
}

export function normalizeQuestionSignature(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 80);
}

// Helper to shuffle an array deterministically or with pseudo-random seed
function shuffleArray<T>(arr: T[], seed: number = Date.now()): T[] {
  const result = [...arr];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;

  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = Math.floor((s / 2147483647) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// PROCEDURAL DIVERSE QUESTION GENERATORS (Deterministic, Varied, High Accuracy)
// ============================================================================

export function generateProceduralQuestions(
  subject: string,
  grade: string,
  topic: string,
  stage: StageNumber,
  count: number,
  excludeSignatures: string[] = []
): GeneratedQuestion[] {
  const subLower = subject.toLowerCase();
  const questions: GeneratedQuestion[] = [];
  const seenSignatures = new Set<string>(excludeSignatures);

  let targetDifficulties: InternalQuestionDifficulty[] = [];
  if (stage === 1) {
    targetDifficulties = Array(count).fill('EASY');
  } else if (stage === 2) {
    targetDifficulties = Array(count).fill('MEDIUM');
  } else if (stage === 3) {
    targetDifficulties = Array(count).fill('HARD');
  } else {
    // Stage 4: Mixed (30% Easy, 40% Medium, 30% Hard)
    const easyCount = Math.max(1, Math.round(count * 0.3));
    const hardCount = Math.max(1, Math.round(count * 0.3));
    const medCount = Math.max(1, count - easyCount - hardCount);
    targetDifficulties = [
      ...Array(easyCount).fill('EASY'),
      ...Array(medCount).fill('MEDIUM'),
      ...Array(hardCount).fill('HARD')
    ].sort(() => Math.random() - 0.5);
  }

  for (let i = 0; i < count; i++) {
    const diff = targetDifficulties[i] || 'MEDIUM';
    let q: GeneratedQuestion | null = null;
    let attempts = 0;

    // Retry procedural generation until non-duplicate signature is found (up to 15 attempts)
    while (attempts < 15) {
      attempts++;
      let candidate: GeneratedQuestion;
      if (subLower.includes('math')) {
        candidate = generateProceduralMath(grade, topic, diff, i + 1, attempts);
      } else if (subLower.includes('scien') || subLower.includes('phys') || subLower.includes('chem') || subLower.includes('bio')) {
        candidate = generateProceduralScience(grade, topic, diff, i + 1, attempts);
      } else if (subLower.includes('eng')) {
        candidate = generateProceduralEnglish(grade, topic, diff, i + 1, attempts);
      } else if (subLower.includes('soc') || subLower.includes('hist') || subLower.includes('civ') || subLower.includes('geo')) {
        candidate = generateProceduralSocialScience(grade, topic, diff, i + 1, attempts);
      } else if (subLower.includes('comp')) {
        candidate = generateProceduralComputer(grade, topic, diff, i + 1, attempts);
      } else {
        candidate = generateProceduralGeneral(grade, topic, diff, i + 1, attempts);
      }

      candidate.stageNumber = stage;
      const sig = normalizeQuestionSignature(candidate.questionText);
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        q = candidate;
        break;
      }
    }

    if (!q) {
      // Fallback candidate if duplicate check exhausted
      q = generateProceduralMath(grade, topic, diff, i + 1, Date.now() + i);
      q.stageNumber = stage;
    }
    questions.push(q);
  }

  return questions;
}

// ----------------------------------------------------------------------------
// MATHEMATICS PROCEDURAL GENERATOR
// ----------------------------------------------------------------------------
function generateProceduralMath(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  variantSeed: number
): GeneratedQuestion {
  const archetype = (variantSeed + idx) % 10;
  let qText = '';
  let correct = '';
  let dist: string[] = [];
  let explanation = '';
  let concept = topic || 'Algebra & Arithmetic';
  let hint = '';

  if (diff === 'EASY') {
    switch (archetype) {
      case 0: {
        // Linear equation: x + a = b
        const a = randInt(4, 25);
        const x = randInt(5, 30);
        const b = x + a;
        qText = `Solve the equation: x + ${a} = ${b}. Find the value of x.`;
        correct = `x = ${x}`;
        dist = [`x = ${x + a}`, `x = ${Math.max(1, x - a)}`, `x = ${x + 2}`];
        explanation = `Subtract ${a} from both sides: x = ${b} - ${a} = ${x}.`;
        hint = `Isolate x by performing the inverse operation of addition (subtraction).`;
        break;
      }
      case 1: {
        // Multiplicative inverse / reciprocal of p/q
        const p = randInt(3, 17);
        let q = randInt(4, 19);
        while (q === p) q = randInt(4, 19);
        qText = `What is the reciprocal (multiplicative inverse) of ${p}/${q}?`;
        correct = `${q}/${p}`;
        dist = [`${p}/${q}`, `-${p}/${q}`, `-${q}/${p}`];
        explanation = `The reciprocal of a fraction a/b is b/a because (a/b) × (b/a) = 1. Therefore, the reciprocal is ${q}/${p}.`;
        hint = `Invert the numerator and denominator.`;
        break;
      }
      case 2: {
        // Percentage of a number
        const pcts = [10, 20, 25, 50, 75];
        const pct = pcts[randInt(0, pcts.length - 1)];
        const mult = randInt(2, 12);
        const total = mult * (100 / pct);
        const ans = (pct / 100) * total;
        qText = `Calculate ${pct}% of ${total}.`;
        correct = `${ans}`;
        dist = [`${ans + 5}`, `${Math.max(1, ans - 5)}`, `${ans * 2}`];
        explanation = `${pct}% of ${total} = (${pct} / 100) × ${total} = ${ans}.`;
        hint = `Convert the percentage into a decimal or fraction and multiply.`;
        break;
      }
      case 3: {
        // Perimeter of equilateral triangle or square
        const side = randInt(6, 24);
        const isSquare = idx % 2 === 0;
        if (isSquare) {
          const perim = 4 * side;
          qText = `A square playground has a side length of ${side} m. What is its perimeter?`;
          correct = `${perim} m`;
          dist = [`${perim - side} m`, `${side * side} m`, `${perim + 8} m`];
          explanation = `Perimeter of a square = 4 × side = 4 × ${side} m = ${perim} m.`;
        } else {
          const perim = 3 * side;
          qText = `An equilateral triangle has sides measuring ${side} cm each. Find its perimeter.`;
          correct = `${perim} cm`;
          dist = [`${perim + 6} cm`, `${perim - 6} cm`, `${side * 2} cm`];
          explanation = `Perimeter of an equilateral triangle = 3 × side = 3 × ${side} cm = ${perim} cm.`;
        }
        hint = `Sum the lengths of all boundary sides.`;
        break;
      }
      case 4: {
        // Exponent rule: a^m * a^n
        const base = randInt(2, 7);
        const m = randInt(2, 5);
        const n = randInt(2, 6);
        qText = `Simplify using exponent laws: ${base}^${m} × ${base}^${n}.`;
        correct = `${base}^${m + n}`;
        dist = [`${base}^${m * n}`, `${base * 2}^${m + n}`, `${base}^${Math.abs(m - n)}`];
        explanation = `According to the product rule of exponents: aᵐ × aⁿ = aᵐ⁺ⁿ. Here, ${base}^${m} × ${base}^${n} = ${base}^(${m}+${n}) = ${base}^${m + n}.`;
        hint = `When bases are equal in a product, add the exponents.`;
        break;
      }
      case 5: {
        // Ratio simplification
        const factor = randInt(3, 9);
        const a = randInt(2, 7);
        const b = randInt(3, 8);
        const num1 = a * factor;
        const num2 = b * factor;
        qText = `Express the ratio ${num1} : ${num2} in its simplest irreducible form.`;
        correct = `${a} : ${b}`;
        dist = [`${a * 2} : ${b}`, `${a} : ${b * 2}`, `${b} : ${a}`];
        explanation = `Divide both terms by their greatest common factor (${factor}): ${num1}÷${factor} : ${num2}÷${factor} = ${a} : ${b}.`;
        hint = `Find the highest common factor and divide both numbers.`;
        break;
      }
      case 6: {
        // Integer arithmetic with negative signs
        const x = randInt(12, 35);
        const y = randInt(15, 45);
        const ans = -x - y;
        qText = `Evaluate: (-${x}) + (-${y}).`;
        correct = `${ans}`;
        dist = [`${Math.abs(ans)}`, `${-x + y}`, `${x - y}`];
        explanation = `Adding two negative numbers gives a negative result equal to the negative sum of their magnitudes: -(${x} + ${y}) = ${ans}.`;
        hint = `Combine magnitudes and preserve the negative sign.`;
        break;
      }
      default: {
        // Angles on a straight line
        const a = randInt(35, 130);
        const b = 180 - a;
        qText = `Two adjacent angles form a linear pair on a straight line. If one angle measures ${a}°, what is the measure of the other angle?`;
        correct = `${b}°`;
        dist = [`${90 - Math.min(a, 80)}°`, `${b + 10}°`, `${b - 10}°`];
        explanation = `Angles forming a linear pair are supplementary and add up to 180°. So the missing angle is 180° - ${a}° = ${b}°.`;
        hint = `The sum of angles on a straight line is always 180 degrees.`;
        break;
      }
    }
  } else if (diff === 'MEDIUM') {
    switch (archetype) {
      case 0: {
        // Two-step linear equation: ax + b = c
        const a = randInt(2, 7);
        const x = randInt(3, 15);
        const b = randInt(4, 20);
        const c = a * x + b;
        qText = `Solve for x: ${a}x + ${b} = ${c}.`;
        correct = `x = ${x}`;
        dist = [`x = ${x + 1}`, `x = ${Math.max(1, x - 2)}`, `x = ${x * 2}`];
        explanation = `Subtract ${b} from both sides: ${a}x = ${c - b}. Then divide by ${a}: x = ${c - b} / ${a} = ${x}. Check: ${a}(${x}) + ${b} = ${a * x + b} = ${c}.`;
        hint = `First subtract the constant term, then divide by the coefficient of x.`;
        break;
      }
      case 1: {
        // Variables on both sides: ax - b = cx + d
        const c = randInt(2, 4);
        const a = c + randInt(2, 4);
        const x = randInt(3, 10);
        const d = randInt(5, 20);
        const b = a * x - (c * x + d);
        if (b > 0) {
          qText = `Solve the linear equation for x: ${a}x - ${b} = ${c}x + ${d}.`;
          correct = `x = ${x}`;
          dist = [`x = ${x + 2}`, `x = ${Math.max(1, x - 1)}`, `x = ${x + 4}`];
          explanation = `Subtract ${c}x from both sides: ${a - c}x - ${b} = ${d}. Add ${b}: ${a - c}x = ${d + b}. Divide by ${a - c}: x = ${x}.`;
        } else {
          const k = randInt(3, 8);
          qText = `Solve for y: 4(y - 2) = 2y + ${2 * k - 8}.`;
          correct = `y = ${k}`;
          dist = [`y = ${k + 2}`, `y = ${Math.max(1, k - 2)}`, `y = ${k * 2}`];
          explanation = `Expand the bracket: 4y - 8 = 2y + ${2 * k - 8}. Subtract 2y: 2y = ${2 * k}. Divide by 2: y = ${k}.`;
        }
        hint = `Group all variable terms on one side and numerical constants on the other.`;
        break;
      }
      case 2: {
        // Area of a circle or rectangle
        const r = randInt(7, 21);
        const areaApprox = Math.round((22 / 7) * r * r);
        qText = `Find the area of a circular garden with radius r = ${r} cm. (Use π ≈ 22/7)`;
        correct = `${areaApprox} cm²`;
        dist = [`${areaApprox - 44} cm²`, `${areaApprox + 44} cm²`, `${Math.round(2 * (22 / 7) * r)} cm²`];
        explanation = `Area = πr² = (22/7) × ${r} × ${r} = ${areaApprox} cm². Note: 2πr is the circumference, not the area.`;
        hint = `Formula for the area of a circle is π × r².`;
        break;
      }
      case 3: {
        // Simple Interest calculation: I = (P * R * T) / 100
        const p = randInt(10, 80) * 100;
        const r = randInt(4, 12);
        const t = randInt(2, 5);
        const interest = (p * r * t) / 100;
        qText = `Calculate the Simple Interest on a principal amount of ₹${p} deposited at ${r}% per annum for ${t} years.`;
        correct = `₹${interest}`;
        dist = [`₹${interest + 150}`, `₹${Math.max(50, interest - 120)}`, `₹${interest + p}`];
        explanation = `Simple Interest (SI) = (Principal × Rate × Time) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${interest}.`;
        hint = `Apply the formula SI = (P × R × T) / 100.`;
        break;
      }
      case 4: {
        // Pythagorean theorem hypotenuse
        const pairs = [
          [3, 4, 5],
          [5, 12, 13],
          [6, 8, 10],
          [8, 15, 17],
          [9, 12, 15]
        ];
        const triple = pairs[randInt(0, pairs.length - 1)];
        const a = triple[0];
        const b = triple[1];
        const c = triple[2];
        qText = `In a right-angled triangle, the two perpendicular legs measure ${a} cm and ${b} cm. Find the length of the hypotenuse.`;
        correct = `${c} cm`;
        dist = [`${c + 2} cm`, `${a + b} cm`, `${Math.max(1, c - 2)} cm`];
        explanation = `By Pythagoras Theorem: c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}. Hence, c = √${c * c} = ${c} cm.`;
        hint = `Hypotenuse² = Leg1² + Leg2².`;
        break;
      }
      case 5: {
        // Probability of an event
        const red = randInt(3, 7);
        const blue = randInt(4, 8);
        const green = randInt(2, 5);
        const total = red + blue + green;
        qText = `A bag contains ${red} red marbles, ${blue} blue marbles, and ${green} green marbles. What is the probability of drawing a red marble at random?`;
        correct = `${red}/${total}`;
        dist = [`${blue}/${total}`, `${green}/${total}`, `${red}/${total - red}`];
        explanation = `Total outcomes = ${red} + ${blue} + ${green} = ${total}. Favorable outcomes for red = ${red}. Probability = Favorable / Total = ${red}/${total}.`;
        hint = `Number of favorable outcomes divided by total possible outcomes.`;
        break;
      }
      default: {
        // Consecutive integer word problem
        const n = randInt(12, 35);
        const sum = n + (n + 1) + (n + 2);
        qText = `The sum of three consecutive integers is ${sum}. What is the smallest of these three integers?`;
        correct = `${n}`;
        dist = [`${n + 1}`, `${n + 2}`, `${n - 1}`];
        explanation = `Let the integers be x, x+1, and x+2. Their sum: 3x + 3 = ${sum} => 3x = ${sum - 3} => x = ${n}. The integers are ${n}, ${n + 1}, and ${n + 2}.`;
        hint = `Express the consecutive numbers as x, x+1, and x+2.`;
        break;
      }
    }
  } else {
    // HARD (Multi-step, application, algebraic modeling)
    switch (archetype % 5) {
      case 0: {
        // Perimeter & Area word problem: length is L more than width
        const diffLW = randInt(4, 14);
        const w = randInt(8, 25);
        const l = w + diffLW;
        const perim = 2 * (l + w);
        const area = l * w;
        qText = `The perimeter of a rectangular field is ${perim} meters. If its length is ${diffLW} meters greater than its width, find the area of the field.`;
        correct = `${area} m²`;
        dist = [`${area + 60} m²`, `${Math.max(50, area - 40)} m²`, `${(perim / 2) * diffLW} m²`];
        explanation = `Let width = w. Length = w + ${diffLW}. Perimeter = 2(w + w + ${diffLW}) = ${perim} => 4w + ${2 * diffLW} = ${perim} => 4w = ${perim - 2 * diffLW} => w = ${w} m. Length = ${l} m. Area = ${l} × ${w} = ${area} m².`;
        hint = `Set up an equation for the perimeter to determine width, then compute length × width.`;
        break;
      }
      case 1: {
        // Age problem
        const son = randInt(8, 16);
        const mult = randInt(3, 4);
        const father = mult * son;
        const years = randInt(4, 8);
        const sumFuture = (father + years) + (son + years);
        qText = `A parent is currently ${mult} times as old as their child. In ${years} years, the sum of their ages will be ${sumFuture}. How old is the child now?`;
        correct = `${son} years old`;
        dist = [`${son + 2} years old`, `${Math.max(5, son - 2)} years old`, `${son + 4} years old`];
        explanation = `Let child's age = c. Parent's age = ${mult}c. In ${years} years: (c + ${years}) + (${mult}c + ${years}) = ${sumFuture} => ${mult + 1}c + ${2 * years} = ${sumFuture} => ${mult + 1}c = ${sumFuture - 2 * years} => c = ${son}.`;
        hint = `Define the child's age as c, express the parent's age as a multiple, and add future years to both.`;
        break;
      }
      case 2: {
        // Quadratic factorization / roots
        const r1 = randInt(2, 6);
        const r2 = randInt(3, 7);
        const b = -(r1 + r2);
        const c = r1 * r2;
        qText = `Find the positive solutions (roots) of the quadratic equation: x² ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + ${c} = 0.`;
        correct = `x = ${r1} and x = ${r2}`;
        dist = [`x = ${-r1} and x = ${-r2}`, `x = ${r1 + 1} and x = ${r2 - 1}`, `x = ${r1 * 2} and x = ${r2}`];
        explanation = `Factoring: (x - ${r1})(x - ${r2}) = 0. Setting each factor to zero yields x = ${r1} and x = ${r2}. Verify: ${r1}² + (${b})(${r1}) + ${c} = 0.`;
        hint = `Find two numbers that multiply to ${c} and add up to ${Math.abs(b)}.`;
        break;
      }
      case 3: {
        // Speed, Distance, Time with two objects
        const s1 = randInt(40, 60);
        const s2 = randInt(50, 75);
        const hours = randInt(2, 4);
        const totalDist = (s1 + s2) * hours;
        qText = `Two trains start at the same moment from stations A and B that are ${totalDist} km apart, traveling toward each other. One travels at ${s1} km/h and the other at ${s2} km/h. After how many hours will they cross paths?`;
        correct = `${hours} hours`;
        dist = [`${hours + 1} hours`, `${Math.max(1, hours - 1)} hours`, `${hours + 2} hours`];
        explanation = `Relative speed of approach = ${s1} + ${s2} = ${s1 + s2} km/h. Time to meet = Total Distance / Relative Speed = ${totalDist} / ${s1 + s2} = ${hours} hours.`;
        hint = `When moving toward each other, their relative speed is the sum of their individual speeds.`;
        break;
      }
      default: {
        // Simultaneous linear equations (2x + 3y = ...)
        const x = randInt(2, 7);
        const y = randInt(2, 6);
        const eq1 = 2 * x + 3 * y;
        const eq2 = 3 * x - y;
        qText = `Solve the system of linear equations for x and y:\n1) 2x + 3y = ${eq1}\n2) 3x - y = ${eq2}`;
        correct = `x = ${x}, y = ${y}`;
        dist = [`x = ${x + 1}, y = ${y - 1}`, `x = ${y}, y = ${x}`, `x = ${x - 1}, y = ${y + 2}`];
        explanation = `From eq 2, y = 3x - ${eq2}. Substitute into eq 1: 2x + 3(3x - ${eq2}) = ${eq1} => 11x = ${eq1 + 3 * eq2} => x = ${x}. Then y = 3(${x}) - ${eq2} = ${y}.`;
        hint = `Use substitution or elimination to isolate one variable.`;
        break;
      }
    }
  }

  // Shuffle options so correct answer is NOT always index 0!
  const allOptions = shuffleArray([correct, ...dist], variantSeed + idx * 7);
  const correctOptionIndex = allOptions.indexOf(correct);

  return {
    id: `math-${diff.toLowerCase()}-${idx}-${variantSeed}`,
    stageNumber: 1,
    questionNumber: idx,
    questionText: qText,
    type: 'multiple_choice',
    options: allOptions,
    correctOptionIndex,
    correctAnswer: correct,
    explanation,
    internalDifficulty: diff,
    conceptTested: concept,
    stepByStepHint: hint,
    problemFamily: `math_${diff.toLowerCase()}_${archetype}`
  };
}

// ----------------------------------------------------------------------------
// SCIENCE PROCEDURAL GENERATOR
// ----------------------------------------------------------------------------
function generateProceduralScience(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  variantSeed: number
): GeneratedQuestion {
  const bank = [
    // Easy
    {
      diff: 'EASY',
      q: 'Which organelle contains chlorophyll and is the primary site of photosynthesis in green plant cells?',
      ans: 'Chloroplast',
      dist: ['Mitochondria', 'Endoplasmic Reticulum', 'Golgi Apparatus'],
      exp: 'Chloroplasts contain chlorophyll pigments that capture sunlight energy to synthesize glucose during photosynthesis.',
      hint: 'It contains the green pigment responsible for capturing solar photons.'
    },
    {
      diff: 'EASY',
      q: 'What is the standard SI unit used universally to measure electrical resistance?',
      ans: 'Ohm (Ω)',
      dist: ['Volt (V)', 'Ampere (A)', 'Watt (W)'],
      exp: 'The ohm (symbol: Ω) is the SI unit of electrical resistance, defined by Ohm\'s Law as 1 Volt per Ampere.',
      hint: 'Named after German physicist Georg Simon Ohm.'
    },
    {
      diff: 'EASY',
      q: 'What is the chemical formula for ordinary table salt used in cooking?',
      ans: 'NaCl (Sodium Chloride)',
      dist: ['KCl (Potassium Chloride)', 'NaHCO₃ (Sodium Bicarbonate)', 'CaCl₂ (Calcium Chloride)'],
      exp: 'Common table salt consists of ionic crystals composed of sodium cations and chloride anions in a 1:1 ratio (NaCl).',
      hint: 'It contains sodium and chlorine ions.'
    },
    {
      diff: 'EASY',
      q: 'Which fundamental state of matter possesses a definite volume but no fixed shape, taking the shape of its container?',
      ans: 'Liquid',
      dist: ['Solid', 'Gas', 'Plasma'],
      exp: 'Liquids have fixed volume due to intermolecular attraction, but particles can slide past one another to conform to container contours.',
      hint: 'Water and oil are classic examples.'
    },
    // Medium
    {
      diff: 'MEDIUM',
      q: 'According to Newton\'s Second Law of Motion, what is the net force required to accelerate a 5 kg mass at 4 m/s²?',
      ans: '20 N',
      dist: ['9 N', '1.25 N', '25 N'],
      exp: 'Using F = m × a: F = 5 kg × 4 m/s² = 20 Newtons.',
      hint: 'Multiply mass in kilograms by acceleration in m/s².'
    },
    {
      diff: 'MEDIUM',
      q: 'When hydrochloric acid (HCl) reacts completely with sodium hydroxide (NaOH), what are the resulting products?',
      ans: 'Sodium chloride (NaCl) and water (H₂O)',
      dist: ['Sodium hydride and chlorine gas', 'Sodium chlorate and hydrogen gas', 'Sodium oxide and hydrogen chloride'],
      exp: 'This is a neutralization reaction between a strong acid and strong base: HCl + NaOH → NaCl + H₂O.',
      hint: 'An acid and a base neutralize each other to produce a salt and water.'
    },
    {
      diff: 'MEDIUM',
      q: 'Which blood vessels carry oxygenated blood away from the left ventricle of the heart to the rest of the body?',
      ans: 'Aorta and systemic arteries',
      dist: ['Pulmonary artery', 'Superior and inferior vena cava', 'Pulmonary veins'],
      exp: 'The aorta is the main systemic artery that distributes oxygen-rich blood pumped from the left ventricle to all tissues.',
      hint: 'The largest single artery in the human body.'
    },
    {
      diff: 'MEDIUM',
      q: 'What is the pH value of a completely neutral aqueous solution at standard temperature (25°C)?',
      ans: 'pH = 7.0',
      dist: ['pH = 0', 'pH = 1.0', 'pH = 14.0'],
      exp: 'At 25°C, pure water has [H⁺] = [OH⁻] = 10⁻⁷ M, resulting in -log₁₀(10⁻⁷) = 7.0.',
      hint: 'Pure distilled water sits exactly in the middle of the 0 to 14 pH scale.'
    },
    // Hard
    {
      diff: 'HARD',
      q: 'An object is placed 30 cm in front of a concave mirror having a focal length of 20 cm. At what distance from the mirror is the real image formed?',
      ans: '60 cm in front of the mirror',
      dist: ['12 cm in front of the mirror', '40 cm behind the mirror', '50 cm in front of the mirror'],
      exp: 'Mirror formula: 1/f = 1/v + 1/u. With Cartesian sign convention: f = -20, u = -30. 1/(-20) = 1/v + 1/(-30) => 1/v = -1/20 + 1/30 = -1/60 => v = -60 cm.',
      hint: 'Use the mirror equation 1/f = 1/v + 1/u with standard Cartesian sign conventions.'
    },
    {
      diff: 'HARD',
      q: 'What is the molar mass of sulfuric acid (H₂SO₄)? (Atomic masses: H=1, S=32, O=16 g/mol)',
      ans: '98 g/mol',
      dist: ['82 g/mol', '104 g/mol', '96 g/mol'],
      exp: 'Molar mass = 2(1) + 1(32) + 4(16) = 2 + 32 + 64 = 98 g/mol.',
      hint: 'Sum the masses of 2 hydrogen, 1 sulfur, and 4 oxygen atoms.'
    },
    {
      diff: 'HARD',
      q: 'In genetics, if two heterozygous tall pea plants (Tt) are crossed, what is the expected phenotypic ratio of tall to dwarf offspring?',
      ans: '3 : 1 (75% tall, 25% dwarf)',
      dist: ['1 : 1 (50% tall, 50% dwarf)', '1 : 2 : 1 (genotypic ratio)', '4 : 0 (100% tall)'],
      exp: 'Punnett square produces TT, Tt, Tt, tt. TT and Tt are phenotypically tall (3), while tt is dwarf (1). Hence 3:1.',
      hint: 'T is dominant over t. Only homozygous recessive (tt) shows the dwarf phenotype.'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(variantSeed + idx) % pool.length];

  const allOptions = shuffleArray([selected.ans, ...selected.dist], variantSeed + idx * 11);
  const correctOptionIndex = allOptions.indexOf(selected.ans);

  return {
    id: `sci-${diff.toLowerCase()}-${idx}-${variantSeed}`,
    stageNumber: 1,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options: allOptions,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    conceptTested: topic || 'Natural Sciences',
    stepByStepHint: selected.hint,
    problemFamily: `sci_${diff.toLowerCase()}_${(variantSeed + idx) % pool.length}`
  };
}

// ----------------------------------------------------------------------------
// ENGLISH PROCEDURAL GENERATOR
// ----------------------------------------------------------------------------
function generateProceduralEnglish(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  variantSeed: number
): GeneratedQuestion {
  const bank = [
    // Easy
    {
      diff: 'EASY',
      q: 'Identify the conjunction in this sentence: "She wanted to study physics, but the library was closed."',
      ans: 'but',
      dist: ['wanted', 'physics', 'closed'],
      exp: '"But" is a coordinating conjunction connecting two independent clauses.',
      hint: 'Look for the coordinating link between the two statements.'
    },
    {
      diff: 'EASY',
      q: 'Choose the correct plural form of the irregular noun "criterion".',
      ans: 'criteria',
      dist: ['criterions', 'criterias', 'criteri'],
      exp: '"Criterion" originates from Greek; its correct plural form is "criteria".',
      hint: 'It adopts classical Greek pluralization rules ending in -a.'
    },
    // Medium
    {
      diff: 'MEDIUM',
      q: 'Convert to Passive Voice: "The teacher congratulated the students on their outstanding performance."',
      ans: 'The students were congratulated by the teacher on their outstanding performance.',
      dist: [
        'The students had been congratulated by the teacher.',
        'The students are congratulated by the teacher.',
        'The teacher was congratulated by the students.'
      ],
      exp: 'Simple past active verb "congratulated" converts to "were congratulated" agreeing with the plural subject "students".',
      hint: 'The active object (the students) becomes the passive subject.'
    },
    {
      diff: 'MEDIUM',
      q: 'What is the grammatical function of the underlined clause: "Although it was raining heavily, the students went hiking"?',
      ans: 'Adverbial clause of concession/contrast',
      dist: ['Noun clause acting as direct object', 'Adjective relative clause modifying students', 'Independent coordinate clause'],
      exp: '"Although it was raining heavily" modifies the main action by expressing an opposing concession or contrast.',
      hint: 'Subordinating conjunction "although" introduces concession.'
    },
    // Hard
    {
      diff: 'HARD',
      q: 'Identify the poetic device used in Shakespeare\'s line: "Life\'s but a walking shadow, a poor player that struts and frets his hour upon the stage."',
      ans: 'Extended Metaphor & Personification',
      dist: ['Simile & Hyperbole', 'Onomatopoeia & Litotes', 'Oxymoron & Synecdoche'],
      exp: 'Life is directly compared to an actor on stage without using "like" or "as" (metaphor), while the shadow walks (personification).',
      hint: 'Direct comparison without "like" or "as", along with human traits given to abstractions.'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(variantSeed + idx) % pool.length];
  const allOptions = shuffleArray([selected.ans, ...selected.dist], variantSeed + idx * 13);
  const correctOptionIndex = allOptions.indexOf(selected.ans);

  return {
    id: `eng-${diff.toLowerCase()}-${idx}-${variantSeed}`,
    stageNumber: 1,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options: allOptions,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    conceptTested: topic || 'Grammar & Literature',
    stepByStepHint: selected.hint,
    problemFamily: `eng_${diff.toLowerCase()}_${(variantSeed + idx) % pool.length}`
  };
}

// ----------------------------------------------------------------------------
// SOCIAL SCIENCE PROCEDURAL GENERATOR
// ----------------------------------------------------------------------------
function generateProceduralSocialScience(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  variantSeed: number
): GeneratedQuestion {
  const bank = [
    {
      diff: 'EASY',
      q: 'Which ancient civilization built the Great Granary and the Great Bath at Mohenjo-daro?',
      ans: 'Indus Valley Civilization',
      dist: ['Mesopotamian Civilization', 'Ancient Egyptian Civilization', 'Mayan Civilization'],
      exp: 'Mohenjo-daro and Harappa were prominent planned urban centers of the bronze-age Indus Valley (Harappan) Civilization.',
      hint: 'Flourished along the Indus river basin in South Asia.'
    },
    {
      diff: 'MEDIUM',
      q: 'Which article of the Indian Constitution is heralded as the "Heart and Soul of the Constitution" by Dr. B. R. Ambedkar?',
      ans: 'Article 32 (Right to Constitutional Remedies)',
      dist: ['Article 14 (Right to Equality)', 'Article 19 (Right to Freedom)', 'Article 21 (Right to Life)'],
      exp: 'Article 32 empowers citizens to directly approach the Supreme Court via writs to enforce Fundamental Rights.',
      hint: 'Guarantees the right to constitutional remedies via judicial writs.'
    },
    {
      diff: 'HARD',
      q: 'Which imaginary line of latitude passes almost midway through the mainland of India at approximately 23°30\' N?',
      ans: 'Tropic of Cancer',
      dist: ['Equator', 'Tropic of Capricorn', 'Prime Meridian'],
      exp: 'The Tropic of Cancer (23°30\' N) traverses 8 Indian states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram.',
      hint: 'Runs through 8 central and western Indian states.'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(variantSeed + idx) % pool.length] || bank[0];
  const allOptions = shuffleArray([selected.ans, ...selected.dist], variantSeed + idx * 17);
  const correctOptionIndex = allOptions.indexOf(selected.ans);

  return {
    id: `soc-${diff.toLowerCase()}-${idx}-${variantSeed}`,
    stageNumber: 1,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options: allOptions,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    conceptTested: topic || 'History, Civics & Geography',
    stepByStepHint: selected.hint,
    problemFamily: `soc_${diff.toLowerCase()}_${(variantSeed + idx) % pool.length}`
  };
}

// ----------------------------------------------------------------------------
// COMPUTER SCIENCE PROCEDURAL GENERATOR
// ----------------------------------------------------------------------------
function generateProceduralComputer(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  variantSeed: number
): GeneratedQuestion {
  const bank = [
    {
      diff: 'EASY',
      q: 'What is the binary representation of the decimal number 13?',
      ans: '1101',
      dist: ['1011', '1110', '1001'],
      exp: '13 in binary: 8 + 4 + 0 + 1 = 1101₂.',
      hint: 'Break 13 into powers of 2: 8, 4, and 1.'
    },
    {
      diff: 'MEDIUM',
      q: 'In Python programming, which data structure is immutable once created?',
      ans: 'Tuple (e.g., (1, 2, 3))',
      dist: ['List (e.g., [1, 2, 3])', 'Dictionary (e.g., {"key": "val"})', 'Set (e.g., {1, 2, 3})'],
      exp: 'Tuples are immutable; their elements cannot be modified, appended, or deleted in place.',
      hint: 'Enclosed in round parentheses and cannot be altered after declaration.'
    },
    {
      diff: 'HARD',
      q: 'What is the average time complexity of finding an element in a balanced Binary Search Tree (BST) with n nodes?',
      ans: 'O(log n)',
      dist: ['O(n)', 'O(1)', 'O(n²)'],
      exp: 'In a balanced BST, each comparison halves the remaining search space, giving logarithmic time O(log n).',
      hint: 'Each comparison eliminates half of the subtree.'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(variantSeed + idx) % pool.length] || bank[0];
  const allOptions = shuffleArray([selected.ans, ...selected.dist], variantSeed + idx * 19);
  const correctOptionIndex = allOptions.indexOf(selected.ans);

  return {
    id: `comp-${diff.toLowerCase()}-${idx}-${variantSeed}`,
    stageNumber: 1,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options: allOptions,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    conceptTested: topic || 'Computing & Algorithms',
    stepByStepHint: selected.hint,
    problemFamily: `comp_${diff.toLowerCase()}_${(variantSeed + idx) % pool.length}`
  };
}

// ----------------------------------------------------------------------------
// GENERAL PROCEDURAL GENERATOR
// ----------------------------------------------------------------------------
function generateProceduralGeneral(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  variantSeed: number
): GeneratedQuestion {
  return generateProceduralMath(grade, topic, diff, idx, variantSeed);
}

// ============================================================================
// AI STAGE GENERATION WITH DEDUPLICATION & VERIFICATION
// ============================================================================

export async function generateStageQuestionsAuthoritative(params: {
  sessionId?: string;
  userId?: string;
  subject: string;
  grade: string;
  topic?: string;
  stage: StageNumber;
  questionCount: number;
  excludeSignatures?: string[];
  aiInstance?: GoogleGenAI;
}): Promise<{ questions: GeneratedQuestion[]; sessionId: string; source: 'ai' | 'procedural' }> {
  const {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId = 'anonymous',
    subject,
    grade,
    topic = 'General Curriculum',
    stage,
    questionCount,
    excludeSignatures = [],
    aiInstance
  } = params;

  // Track session signatures
  const sessionKey = `${userId}__${subject.toLowerCase()}__${topic.toLowerCase()}__${stage}`;
  let history = sessionStore.get(sessionKey);
  if (!history) {
    history = { lastUpdated: Date.now(), recentQuestionSignatures: new Set<string>() };
    sessionStore.set(sessionKey, history);
  }
  history.lastUpdated = Date.now();

  const allExcludes = Array.from(new Set([...excludeSignatures, ...Array.from(history.recentQuestionSignatures)]));

  const stageNames = ['Stage 1: Easy (Fundamentals)', 'Stage 2: Medium (Understanding)', 'Stage 3: Hard (Application)', 'Stage 4: Mixed Exam'];
  const stageName = stageNames[stage - 1] || 'Assessment';

  if (aiInstance) {
    try {
      const prompt = `You are the lead academic assessment specialist for NeoNova AI Homework Helper (Grades 1-12).
Generate a set of ${questionCount} genuinely novel, diverse, and rigorous multiple-choice questions.

CRITICAL INSTRUCTIONS:
1. Subject: "${subject}"
2. Target Grade: "${grade}"
3. Chapter/Topic: "${topic}"
4. Testing Stage: ${stage} (${stageName})
5. Internal Difficulty: ${stage === 1 ? 'EASY (fundamental definitions, basic concepts)' : stage === 2 ? 'MEDIUM (two-step problem solving, concept comparison)' : stage === 3 ? 'HARD (deep multi-step analysis, word problems, edge cases)' : 'MIXED (~30% EASY, ~40% MEDIUM, ~30% HARD)'}

ANTI-REPETITION & VARIETY MANDATE:
- Do NOT generate questions with identical underlying numbers or problem setups as past attempts.
- Do NOT generate simplistic variations of the same problem. Vary the coefficients, unknown variables, problem narrative, real-world context, and mathematical structure.
- The correct answer MUST be randomly distributed across options A, B, C, and D. Do NOT always place the correct answer as option 0 (Option A)!
- Explicitly exclude these recently tested question signatures:
${allExcludes.slice(-15).map((s, i) => `  - [Exclude #${i + 1}] ${s}`).join('\n') || '  - (None recorded yet)'}

Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q-unique-id",
      "questionNumber": 1,
      "questionText": "Full question statement with specific values",
      "type": "multiple_choice",
      "options": ["Option text A", "Option text B", "Option text C", "Option text D"],
      "correctOptionIndex": 0,
      "correctAnswer": "Exact text of correct option",
      "explanation": "Clear, grade-appropriate step-by-step verification why this is correct and why other options are incorrect.",
      "internalDifficulty": "EASY" | "MEDIUM" | "HARD",
      "conceptTested": "${topic}",
      "stepByStepHint": "Pedagogical hint guiding student reasoning without giving away the answer directly."
    }
  ]
}`;

      const seedNumber = (Date.now() % 100000) + stage * 101;
      const response = await aiInstance.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          seed: seedNumber
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (Array.isArray(parsed.questions) && parsed.questions.length >= Math.min(3, questionCount)) {
        const validated: GeneratedQuestion[] = [];
        for (let idx = 0; idx < parsed.questions.length; idx++) {
          const q = parsed.questions[idx];
          if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) continue;

          let correctIdx = typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0;
          if (correctIdx < 0 || correctIdx >= q.options.length) correctIdx = 0;
          const correctAns = q.correctAnswer || q.options[correctIdx];

          const diff = q.internalDifficulty === 'EASY' || q.internalDifficulty === 'HARD' || q.internalDifficulty === 'MEDIUM'
            ? q.internalDifficulty
            : (stage === 1 ? 'EASY' : stage === 2 ? 'MEDIUM' : 'HARD');

          const signature = normalizeQuestionSignature(q.questionText);
          history.recentQuestionSignatures.add(signature);

          validated.push({
            id: q.id || `q-${stage}-${idx + 1}-${Date.now()}`,
            stageNumber: stage,
            questionNumber: idx + 1,
            questionText: q.questionText,
            type: 'multiple_choice',
            options: q.options,
            correctOptionIndex: correctIdx,
            correctAnswer: correctAns,
            explanation: q.explanation || 'Detailed academic explanation.',
            internalDifficulty: diff,
            conceptTested: q.conceptTested || topic,
            stepByStepHint: q.stepByStepHint || 'Carefully review the formulas involved.'
          });
        }

        if (validated.length >= Math.min(3, questionCount)) {
          return { questions: validated.slice(0, questionCount), sessionId, source: 'ai' };
        }
      }
    } catch (aiErr) {
      console.warn('AI stage question generation failed, falling back to algorithmic procedural generator:', aiErr);
    }
  }

  // Algorithmic Procedural Generator Fallback
  const procedural = generateProceduralQuestions(subject, grade, topic, stage, questionCount, allExcludes);
  procedural.forEach(q => {
    history!.recentQuestionSignatures.add(normalizeQuestionSignature(q.questionText));
  });

  return { questions: procedural, sessionId, source: 'procedural' };
}
