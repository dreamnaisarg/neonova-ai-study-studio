import { 
  StageNumber, 
  StageQuestion, 
  InternalQuestionDifficulty,
  STAGE_CONFIGS 
} from '../types/stageSystem';

export interface GenerateTestParams {
  subject: string;
  grade: string;
  topic?: string;
  stageNumber: StageNumber;
  questionCount?: number;
  sessionId?: string;
}

export const SUBJECT_CURRICULUM_TOPICS: Record<string, string[]> = {
  'Mathematics': [
    'Numbers & Operations',
    'Fractions, Decimals & Percentages',
    'Algebraic Expressions & Equations',
    'Geometry & Shapes',
    'Mensuration, Perimeter & Area',
    'Ratio, Proportion & Unitary Method',
    'Data Handling & Statistics',
    'Probability & Graphs'
  ],
  'Science': [
    'Living Organisms & Habitat',
    'Matter, Materials & Changes',
    'Force, Motion & Pressure',
    'Light, Shadows & Reflections',
    'Electricity, Circuits & Magnetism',
    'Heat, Temperature & Measurement',
    'Acids, Bases & Chemical Reactions',
    'Environment, Ecology & Ecosystems'
  ],
  'General Science': [
    'Living World & Cell Biology',
    'Physical Changes & Chemical Reactions',
    'Energy, Work & Power',
    'Atmosphere, Weather & Climate',
    'Human Body Systems & Nutrition',
    'Plant Reproduction & Growth'
  ],
  'English': [
    'Parts of Speech & Sentence Structure',
    'Tenses, Active & Passive Voice',
    'Reading Comprehension & Inferences',
    'Vocabulary & Context Clues',
    'Direct & Indirect Speech',
    'Idioms, Proverbs & Figurative Language',
    'Punctuation & Capitalization Rules',
    'Prefixes, Suffixes & Root Words'
  ],
  'English Literature': [
    'Poetry Analysis & Metaphors',
    'Character Development & Motives',
    'Narrative Arc & Plot Structure',
    'Themes & Historical Context',
    'Literary Devices & Symbolism'
  ],
  'Hindi': [
    'Sangya, Sarvanam & Visheshan (Parts of Speech)',
    'Kriya & Kaal (Verbs & Tenses)',
    'Sandhi & Samas (Compound Words)',
    'Muhavare & Lokoktiyan (Idioms & Proverbs)',
    'Paryayvachi & Vilom Shabd (Synonyms & Antonyms)',
    'Vakya Shuddhi (Sentence Correction)',
    'Upasarg & Pratyay (Prefixes & Suffixes)',
    'Apathit Gadyansh (Comprehension)'
  ],
  'Gujarati': [
    'Nām, Sarvanām ane Visheshan (Grammar)',
    'Kriyāpad ane Kaal (Tenses)',
    'Samānārthi ane Virudhārthi Shabdo',
    'Rūdhiprayogo ane Kahevato (Idioms & Sayings)',
    'Jodani ane Vakya Rachna (Spelling & Syntax)',
    'Chhand ane Alankar (Poetic Devices)',
    'Apathit Gadya (Reading Comprehension)'
  ],
  'Social Science': [
    'Ancient Civilizations & Empires',
    'Medieval Kingdoms & Cultural Heritage',
    'Modern History & Freedom Struggles',
    'Physical Geography & Landforms',
    'Climate Zones & Natural Resources',
    'Democratic Governance & Constitution',
    'Fundamental Rights & Civic Duties',
    'Economic Development & Trade'
  ],
  'French': [
    'Les Salutations et Présentations (Greetings)',
    'Les Articles Définis et Indéfinis (Articles)',
    'La Conjugaison: Être, Avoir et Verbes en -ER',
    'Le Pluriel et le Féminin des Adjectifs',
    'Les Chiffres, Jours, Mois et l\'Heure',
    'La Négation et l\'Interrogation',
    'Le Vocabulaire Quotidien (Daily Life)'
  ],
  'Computer': [
    'Computer Hardware & Architecture',
    'Operating Systems & File Management',
    'Algorithm Design & Flowcharts',
    'Programming Fundamentals & Loops',
    'Data Representation & Binary Logic',
    'Internet, Cyber Safety & Ethics',
    'Spreadsheets, Formulas & Databases',
    'Artificial Intelligence & Cloud Computing'
  ],
  'General Knowledge (GK)': [
    'World Capitals, Continents & Oceans',
    'Famous Scientists & Scientific Inventions',
    'Indian Heritage, Monuments & National Symbols',
    'Space Exploration, Planets & Solar System',
    'Great Authors, Books & Nobel Laureates',
    'Sports, Olympics & Global Records',
    'Environmental Milestones & Conservation'
  ],
  'Physics': [
    'Kinematics: Velocity, Speed & Acceleration',
    'Newton\'s Laws of Motion & Momentum',
    'Work, Energy & Conservation Principles',
    'Gravitation, Free Fall & Weightlessness',
    'Wave Mechanics, Optics & Sound',
    'Electromagnetism & Electric Circuits'
  ],
  'Chemistry': [
    'Atomic Structure & Electron Configuration',
    'Periodic Table & Periodic Trends',
    'Chemical Bonding: Ionic & Covalent',
    'Stoichiometry & Mole Concept',
    'Acids, Bases & pH Calculations',
    'Thermodynamics & Reaction Rates'
  ],
  'Biology': [
    'Cell Structure & Organelles',
    'Genetics, DNA & Heredity',
    'Human Anatomy & Circulatory System',
    'Plant Physiology & Photosynthesis',
    'Evolution & Natural Selection',
    'Microbiology, Bacteria & Viruses'
  ],
  'History & Civics': [
    'The Indus Valley & Vedic Civilizations',
    'Rise of Modern Democracies',
    'World Wars & The United Nations',
    'The Indian Constitution & Federalism',
    'Judiciary & Legal Frameworks'
  ],
  'Art & Music': [
    'Color Theory & Visual Perspectives',
    'Art History Movements & Renaissance Masters',
    'Musical Notation, Rhythm & Scales',
    'World Folk Traditions & Instruments'
  ]
};

export function getTopicsForSubject(subject: string): string[] {
  const cleanSub = subject.trim();
  if (SUBJECT_CURRICULUM_TOPICS[cleanSub]) {
    return SUBJECT_CURRICULUM_TOPICS[cleanSub];
  }
  const found = Object.keys(SUBJECT_CURRICULUM_TOPICS).find(
    k => k.toLowerCase() === cleanSub.toLowerCase()
  );
  if (found) return SUBJECT_CURRICULUM_TOPICS[found];

  return [
    'Core Fundamentals & Key Concepts',
    'Analytical Application & Problem Solving',
    'Advanced Problem Solving & Case Studies',
    'Comprehensive Review & Master Test'
  ];
}

// ----------------------------------------------------------------------------
// Deduplication & Signature Tracking Storage
// ----------------------------------------------------------------------------
const SEEN_QUESTIONS_KEY = 'NEONOVA_SEEN_STAGE_QUESTIONS_V2';

function getSeenSignatures(subject: string, topic: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw);
    const key = `${subject.toLowerCase()}__${topic.toLowerCase()}`;
    return Array.isArray(map[key]) ? map[key] : [];
  } catch {
    return [];
  }
}

function saveSeenSignatures(subject: string, topic: string, newSignatures: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = `${subject.toLowerCase()}__${topic.toLowerCase()}`;
    const existing: string[] = Array.isArray(map[key]) ? map[key] : [];
    const merged = Array.from(new Set([...existing, ...newSignatures]));
    // Keep a rolling window of 150 items
    map[key] = merged.slice(-150);
    localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(map));
  } catch {}
}

export function normalizeTextSignature(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 80);
}

// Crypto-safe or Math.random shuffle
function shuffleOptions<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ----------------------------------------------------------------------------
// Primary Generator: Backend AI with Session Anti-Repetition
// ----------------------------------------------------------------------------
export async function generateStageQuestions(
  params: GenerateTestParams
): Promise<StageQuestion[]> {
  const { subject, grade, topic = 'General Curriculum', stageNumber } = params;
  const count = params.questionCount || STAGE_CONFIGS[stageNumber].defaultQuestionCount;
  const sessionId = params.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const recentSignatures = getSeenSignatures(subject, topic);

  try {
    const res = await fetch('/api/stage-system/generate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        subject,
        grade,
        topic,
        stage: stageNumber,
        questionCount: count,
        excludeSignatures: recentSignatures
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const normalized = normalizeQuestions(data.questions, stageNumber, sessionId, data.source || 'ai');
        const signatures = normalized.map(q => normalizeTextSignature(q.questionText));
        saveSeenSignatures(subject, topic, signatures);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('Backend stage questions generation failed, switching to dynamic procedural generator:', err);
  }

  // Fallback procedural questions with rich variations
  const fallback = generateProceduralFallbackQuestions(subject, grade, topic, stageNumber, count, recentSignatures, sessionId);
  const fallbackSigs = fallback.map(q => normalizeTextSignature(q.questionText));
  saveSeenSignatures(subject, topic, fallbackSigs);
  return fallback;
}

function normalizeQuestions(
  questions: any[],
  stageNumber: StageNumber,
  sessionId: string,
  source: 'ai' | 'procedural'
): StageQuestion[] {
  return questions.map((q, idx) => {
    let diff: InternalQuestionDifficulty = 'MEDIUM';
    if (stageNumber === 1) diff = 'EASY';
    else if (stageNumber === 2) diff = 'MEDIUM';
    else if (stageNumber === 3) diff = 'HARD';
    else {
      if (q.internalDifficulty === 'EASY' || q.internalDifficulty === 'HARD' || q.internalDifficulty === 'MEDIUM') {
        diff = q.internalDifficulty;
      } else {
        const ratio = idx / Math.max(1, questions.length);
        diff = ratio < 0.3 ? 'EASY' : ratio < 0.7 ? 'MEDIUM' : 'HARD';
      }
    }

    const options = Array.isArray(q.options) && q.options.length >= 2 
      ? q.options 
      : ['Option A', 'Option B', 'Option C', 'Option D'];

    let correctIndex = typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0;
    if (correctIndex < 0 || correctIndex >= options.length) correctIndex = 0;

    const correctAnswer = q.correctAnswer || options[correctIndex];

    return {
      id: q.id || `q-${stageNumber}-${idx + 1}-${Date.now()}-${randInt(100, 999)}`,
      questionNumber: idx + 1,
      questionText: q.questionText || `Question ${idx + 1}`,
      type: (q.type as any) || 'multiple_choice',
      options,
      correctOptionIndex: correctIndex,
      correctAnswer,
      explanation: q.explanation || 'Detailed academic explanation clarifying the concept.',
      internalDifficulty: diff,
      topic: q.conceptTested || q.topic,
      hint: q.stepByStepHint || q.hint,
      sessionId,
      source
    };
  });
}

// ----------------------------------------------------------------------------
// Dynamic Procedural Fallback Engine (Math, Science, English, etc.)
// ----------------------------------------------------------------------------
function generateProceduralFallbackQuestions(
  subject: string,
  grade: string,
  topic: string,
  stageNumber: StageNumber,
  count: number,
  excludeSignatures: string[],
  sessionId: string
): StageQuestion[] {
  const cleanSub = subject.toLowerCase();
  const seen = new Set<string>(excludeSignatures);
  const questions: StageQuestion[] = [];

  let targetDifficulties: InternalQuestionDifficulty[] = [];
  if (stageNumber === 1) {
    targetDifficulties = Array(count).fill('EASY');
  } else if (stageNumber === 2) {
    targetDifficulties = Array(count).fill('MEDIUM');
  } else if (stageNumber === 3) {
    targetDifficulties = Array(count).fill('HARD');
  } else {
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
    let selectedQ: StageQuestion | null = null;

    for (let attempt = 0; attempt < 12; attempt++) {
      let candidate: StageQuestion;
      if (cleanSub.includes('math')) {
        candidate = buildProceduralMathQuestion(grade, topic, diff, i + 1, attempt + i);
      } else if (cleanSub.includes('scien') || cleanSub.includes('phys') || cleanSub.includes('chem') || cleanSub.includes('bio')) {
        candidate = buildProceduralScienceQuestion(grade, topic, diff, i + 1, attempt + i);
      } else if (cleanSub.includes('eng')) {
        candidate = buildProceduralEnglishQuestion(grade, topic, diff, i + 1, attempt + i);
      } else if (cleanSub.includes('soc') || cleanSub.includes('hist') || cleanSub.includes('civ') || cleanSub.includes('geo')) {
        candidate = buildProceduralSocialQuestion(grade, topic, diff, i + 1, attempt + i);
      } else if (cleanSub.includes('comp')) {
        candidate = buildProceduralComputerQuestion(grade, topic, diff, i + 1, attempt + i);
      } else {
        candidate = buildProceduralGeneralQuestion(grade, topic, diff, i + 1, attempt + i);
      }

      candidate.sessionId = sessionId;
      candidate.source = 'procedural';

      const sig = normalizeTextSignature(candidate.questionText);
      if (!seen.has(sig)) {
        seen.add(sig);
        selectedQ = candidate;
        break;
      }
    }

    if (!selectedQ) {
      selectedQ = buildProceduralMathQuestion(grade, topic, diff, i + 1, Date.now() + i);
      selectedQ.sessionId = sessionId;
      selectedQ.source = 'procedural';
    }

    questions.push(selectedQ);
  }

  return questions;
}

// ----------------------------------------------------------------------------
// Procedural Math Builder with dynamic variables & non-zero correctOptionIndex
// ----------------------------------------------------------------------------
function buildProceduralMathQuestion(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  seedVariant: number
): StageQuestion {
  const archetype = (seedVariant + idx * 3) % 8;
  let qText = '';
  let correct = '';
  let dist: string[] = [];
  let exp = '';
  let hint = '';

  if (diff === 'EASY') {
    switch (archetype) {
      case 0: {
        const a = randInt(3, 19);
        const b = randInt(10, 45);
        const x = b - a;
        qText = `Solve for x in the simple equation: x + ${a} = ${b}.`;
        correct = `x = ${x}`;
        dist = [`x = ${b + a}`, `x = ${x + 2}`, `x = ${Math.max(1, x - 2)}`];
        exp = `Subtract ${a} from both sides: x = ${b} - ${a} = ${x}.`;
        hint = `Subtract ${a} from both sides to isolate x.`;
        break;
      }
      case 1: {
        const num = randInt(3, 17);
        const den = randInt(18, 35);
        qText = `What is the reciprocal of the fraction ${num}/${den}?`;
        correct = `${den}/${num}`;
        dist = [`${num}/${den}`, `-${num}/${den}`, `-${den}/${num}`];
        exp = `The reciprocal of a/b is b/a because multiplying them yields 1.`;
        hint = `Flip the numerator and denominator.`;
        break;
      }
      case 2: {
        const pcts = [10, 20, 25, 50];
        const p = pcts[randInt(0, pcts.length - 1)];
        const mult = randInt(2, 10);
        const total = mult * (100 / p);
        const ans = (p / 100) * total;
        qText = `What is ${p}% of ${total}?`;
        correct = `${ans}`;
        dist = [`${ans + 4}`, `${Math.max(1, ans - 4)}`, `${ans * 2}`];
        exp = `${p}% of ${total} = (${p}/100) × ${total} = ${ans}.`;
        hint = `Multiply ${total} by ${p}/100.`;
        break;
      }
      case 3: {
        const side = randInt(5, 20);
        const perim = 4 * side;
        qText = `Calculate the perimeter of a square with a side length of ${side} cm.`;
        correct = `${perim} cm`;
        dist = [`${side * side} cm`, `${perim - side} cm`, `${perim + 8} cm`];
        exp = `Perimeter of a square = 4 × side = 4 × ${side} cm = ${perim} cm.`;
        hint = `Multiply the length of one side by 4.`;
        break;
      }
      default: {
        const base = randInt(2, 6);
        const e1 = randInt(2, 4);
        const e2 = randInt(2, 5);
        qText = `According to the laws of exponents, simplify: ${base}^${e1} × ${base}^${e2}.`;
        correct = `${base}^${e1 + e2}`;
        dist = [`${base}^${e1 * e2}`, `${base * 2}^${e1 + e2}`, `${base}^${Math.abs(e1 - e2)}`];
        exp = `When multiplying powers with the same base, add their exponents: aᵐ × aⁿ = aᵐ⁺ⁿ.`;
        hint = `Add the two exponents together while preserving the base.`;
        break;
      }
    }
  } else if (diff === 'MEDIUM') {
    switch (archetype % 4) {
      case 0: {
        const a = randInt(2, 6);
        const x = randInt(4, 14);
        const b = randInt(5, 22);
        const c = a * x + b;
        qText = `Solve the two-step equation for x: ${a}x + ${b} = ${c}.`;
        correct = `x = ${x}`;
        dist = [`x = ${x + 2}`, `x = ${Math.max(1, x - 2)}`, `x = ${x * 2}`];
        exp = `Subtract ${b}: ${a}x = ${c - b}. Divide by ${a}: x = ${c - b}/${a} = ${x}.`;
        hint = `Subtract ${b} first, then divide by ${a}.`;
        break;
      }
      case 1: {
        const c = randInt(2, 3);
        const a = c + randInt(2, 3);
        const x = randInt(3, 9);
        const d = randInt(4, 15);
        const b = a * x - (c * x + d);
        qText = `Solve for x: ${a}x - ${b} = ${c}x + ${d}.`;
        correct = `x = ${x}`;
        dist = [`x = ${x + 1}`, `x = ${Math.max(1, x - 1)}`, `x = ${x + 3}`];
        exp = `Subtract ${c}x: ${a - c}x - ${b} = ${d} => ${a - c}x = ${d + b} => x = ${x}.`;
        hint = `Collect variable terms on the left side and constant terms on the right.`;
        break;
      }
      case 2: {
        const r = randInt(7, 21);
        const area = Math.round((22 / 7) * r * r);
        qText = `Find the area of a circle with radius r = ${r} cm (use π ≈ 22/7).`;
        correct = `${area} cm²`;
        dist = [`${area + 44} cm²`, `${Math.max(10, area - 44)} cm²`, `${Math.round(2 * (22 / 7) * r)} cm²`];
        exp = `Area = πr² = (22/7) × ${r} × ${r} = ${area} cm².`;
        hint = `Apply the circle area formula A = πr².`;
        break;
      }
      default: {
        const p = randInt(10, 50) * 100;
        const r = randInt(5, 10);
        const t = randInt(2, 4);
        const si = (p * r * t) / 100;
        qText = `A student deposits ₹${p} in a savings account offering ${r}% simple interest per year. Calculate the interest earned after ${t} years.`;
        correct = `₹${si}`;
        dist = [`₹${si + 100}`, `₹${Math.max(50, si - 80)}`, `₹${si + p}`];
        exp = `Simple Interest = (P × R × T) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${si}.`;
        hint = `SI = (P × R × T) / 100.`;
        break;
      }
    }
  } else {
    // HARD
    switch (archetype % 3) {
      case 0: {
        const diffLW = randInt(4, 12);
        const w = randInt(7, 20);
        const l = w + diffLW;
        const perim = 2 * (l + w);
        const area = l * w;
        qText = `The perimeter of a rectangular playground is ${perim} m. If the length is ${diffLW} m longer than its width, what is the area of the playground?`;
        correct = `${area} m²`;
        dist = [`${area + 48} m²`, `${Math.max(30, area - 36)} m²`, `${l + w} m²`];
        exp = `2(w + w + ${diffLW}) = ${perim} => 4w + ${2 * diffLW} = ${perim} => w = ${w} m. Length = ${l} m. Area = ${l} × ${w} = ${area} m².`;
        hint = `Express length as w + ${diffLW} in the perimeter formula 2(l + w) = ${perim}.`;
        break;
      }
      case 1: {
        const child = randInt(9, 14);
        const parent = 3 * child;
        const years = randInt(4, 8);
        const sumFuture = (parent + years) + (child + years);
        qText = `A parent is currently three times as old as their child. In ${years} years, the sum of their ages will be ${sumFuture}. Find the child's current age.`;
        correct = `${child} years`;
        dist = [`${child + 2} years`, `${Math.max(5, child - 2)} years`, `${child + 4} years`];
        exp = `Let child's age = c. Parent = 3c. In ${years} yrs: (c + ${years}) + (3c + ${years}) = ${sumFuture} => 4c + ${2 * years} = ${sumFuture} => c = ${child}.`;
        hint = `Set child's age as c and parent as 3c.`;
        break;
      }
      default: {
        const s1 = randInt(45, 65);
        const s2 = randInt(55, 75);
        const hours = randInt(2, 4);
        const distTotal = (s1 + s2) * hours;
        qText = `Two cars travel toward each other from cities ${distTotal} km apart. One drives at ${s1} km/h and the other at ${s2} km/h. How many hours until they meet?`;
        correct = `${hours} hours`;
        dist = [`${hours + 1} hours`, `${Math.max(1, hours - 1)} hours`, `${hours + 2} hours`];
        exp = `Relative speed = ${s1} + ${s2} = ${s1 + s2} km/h. Time = ${distTotal} / ${s1 + s2} = ${hours} hours.`;
        hint = `Relative speed equals the sum of both speeds.`;
        break;
      }
    }
  }

  // Shuffle options so Option A is NOT always correct!
  const options = shuffleOptions([correct, ...dist]);
  const correctOptionIndex = options.indexOf(correct);

  return {
    id: `math-${diff.toLowerCase()}-${idx}-${seedVariant}-${Date.now()}`,
    questionNumber: idx,
    questionText: qText,
    type: 'multiple_choice',
    options,
    correctOptionIndex,
    correctAnswer: correct,
    explanation: exp,
    internalDifficulty: diff,
    topic: topic || 'Mathematics',
    hint
  };
}

// ----------------------------------------------------------------------------
// Procedural Science Question Builder
// ----------------------------------------------------------------------------
function buildProceduralScienceQuestion(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  seedVariant: number
): StageQuestion {
  const bank = [
    {
      diff: 'EASY',
      q: 'Which organelle is universally recognized as the powerhouse of eukaryotic cells, generating cellular ATP?',
      ans: 'Mitochondria',
      dist: ['Ribosome', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
      exp: 'Mitochondria generate the majority of cellular adenosine triphosphate (ATP) via aerobic cellular respiration.'
    },
    {
      diff: 'EASY',
      q: 'What is the chemical formula for common limestone or chalk?',
      ans: 'CaCO₃ (Calcium Carbonate)',
      dist: ['CaO (Calcium Oxide)', 'Ca(OH)₂ (Calcium Hydroxide)', 'CaCl₂ (Calcium Chloride)'],
      exp: 'Limestone, marble, and chalk consist predominantly of the mineral calcium carbonate (CaCO₃).'
    },
    {
      diff: 'MEDIUM',
      q: 'According to Newton\'s Second Law (F = ma), what force is required to accelerate an 8 kg cart at 3 m/s²?',
      ans: '24 N',
      dist: ['11 N', '2.6 N', '32 N'],
      exp: 'Force = mass × acceleration = 8 kg × 3 m/s² = 24 Newtons.'
    },
    {
      diff: 'MEDIUM',
      q: 'Which gas is released when zinc metal granules react with dilute hydrochloric acid?',
      ans: 'Hydrogen gas (H₂)',
      dist: ['Oxygen gas (O₂)', 'Carbon dioxide (CO₂)', 'Chlorine gas (Cl₂)'],
      exp: 'Zn + 2HCl → ZnCl₂ + H₂. Hydrogen gas burns with a characteristic pop sound when tested.'
    },
    {
      diff: 'HARD',
      q: 'An object is placed 30 cm in front of a convex lens of focal length 20 cm. Where is the real image formed?',
      ans: '+60 cm on the other side',
      dist: ['+30 cm on the other side', '-60 cm on the same side', '+12 cm on the other side'],
      exp: 'Lens formula: 1/f = 1/v - 1/u => 1/20 = 1/v - 1/(-30) => 1/v = 1/20 - 1/30 = 1/60 => v = +60 cm.'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(seedVariant + idx) % pool.length];
  const options = shuffleOptions([selected.ans, ...selected.dist]);
  const correctOptionIndex = options.indexOf(selected.ans);

  return {
    id: `sci-${diff.toLowerCase()}-${idx}-${seedVariant}-${Date.now()}`,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    topic: topic || 'Science'
  };
}

// ----------------------------------------------------------------------------
// Procedural English Question Builder
// ----------------------------------------------------------------------------
function buildProceduralEnglishQuestion(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  seedVariant: number
): StageQuestion {
  const bank = [
    {
      diff: 'EASY',
      q: 'Identify the adverb in the following sentence: "The diligent student quietly reviewed her study guide."',
      ans: 'quietly',
      dist: ['diligent', 'student', 'guide'],
      exp: '"Quietly" is an adverb describing the manner in which the action "reviewed" was performed.'
    },
    {
      diff: 'MEDIUM',
      q: 'Convert to Passive Voice: "The research laboratory published the groundbreaking vaccine study."',
      ans: 'The groundbreaking vaccine study was published by the research laboratory.',
      dist: [
        'The groundbreaking vaccine study is published by the laboratory.',
        'The vaccine study had been published by the laboratory.',
        'The research laboratory was published by the study.'
      ],
      exp: 'Simple past active "published" transforms to "was published" agreeing with the singular subject.'
    },
    {
      diff: 'HARD',
      q: 'Identify the literary device used in: "The nocturnal fog creeping silently through the harbor streets."',
      ans: 'Personification',
      dist: ['Hyperbole', 'Oxymoron', 'Onomatopoeia'],
      exp: 'Attributing human traits like "creeping silently" to an inanimate element (fog) is personification.'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(seedVariant + idx) % pool.length];
  const options = shuffleOptions([selected.ans, ...selected.dist]);
  const correctOptionIndex = options.indexOf(selected.ans);

  return {
    id: `eng-${diff.toLowerCase()}-${idx}-${seedVariant}-${Date.now()}`,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    topic: topic || 'English'
  };
}

// ----------------------------------------------------------------------------
// Procedural Social Science Question Builder
// ----------------------------------------------------------------------------
function buildProceduralSocialQuestion(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  seedVariant: number
): StageQuestion {
  const bank = [
    {
      diff: 'EASY',
      q: 'Who served as the Chairman of the Drafting Committee of the Indian Constitution?',
      ans: 'Dr. B. R. Ambedkar',
      dist: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel'],
      exp: 'Dr. B. R. Ambedkar presided as Chairman of the Drafting Committee and is heralded as the chief architect of the Constitution.'
    },
    {
      diff: 'MEDIUM',
      q: 'Which ocean current is renowned as a warm ocean current flowing across the North Atlantic toward northwestern Europe?',
      ans: 'The Gulf Stream',
      dist: ['The Labrador Current', 'The California Current', 'The Benguela Current'],
      exp: 'The Gulf Stream originates in the Gulf of Mexico and transports warm tropical waters across the North Atlantic.'
    },
    {
      diff: 'HARD',
      q: 'Which historical session of the Indian National Congress adopted the historic resolution for "Purna Swaraj" (Complete Independence) in 1929?',
      ans: 'Lahore Session (1929)',
      dist: ['Calcutta Session (1928)', 'Belgaum Session (1924)', 'Karachi Session (1931)'],
      exp: 'Under the presidency of Jawaharlal Nehru, the Lahore Session of December 1929 passed the Purna Swaraj declaration.'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(seedVariant + idx) % pool.length];
  const options = shuffleOptions([selected.ans, ...selected.dist]);
  const correctOptionIndex = options.indexOf(selected.ans);

  return {
    id: `soc-${diff.toLowerCase()}-${idx}-${seedVariant}-${Date.now()}`,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    topic: topic || 'Social Science'
  };
}

// ----------------------------------------------------------------------------
// Procedural Computer Science Question Builder
// ----------------------------------------------------------------------------
function buildProceduralComputerQuestion(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  seedVariant: number
): StageQuestion {
  const bank = [
    {
      diff: 'EASY',
      q: 'What is the decimal equivalent of the 4-bit binary number 1010₂?',
      ans: '10',
      dist: ['12', '8', '6'],
      exp: '1010₂ = (1×8) + (0×4) + (1×2) + (0×1) = 8 + 2 = 10.'
    },
    {
      diff: 'MEDIUM',
      q: 'Which protocol is primarily utilized for secure, encrypted communication between web browsers and websites?',
      ans: 'HTTPS (Hypertext Transfer Protocol Secure)',
      dist: ['FTP (File Transfer Protocol)', 'SMTP (Simple Mail Transfer Protocol)', 'Telnet'],
      exp: 'HTTPS uses Transport Layer Security (TLS/SSL) encryption to secure communications over computer networks.'
    },
    {
      diff: 'HARD',
      q: 'What is the worst-case time complexity of QuickSort when a poor pivot is repeatedly selected on an already sorted list?',
      ans: 'O(n²)',
      dist: ['O(n log n)', 'O(n)', 'O(log n)'],
      exp: 'When an extreme element is consistently chosen as pivot without randomization, QuickSort degrades to O(n²).'
    }
  ];

  const pool = bank.filter(b => b.diff === diff);
  const selected = pool[(seedVariant + idx) % pool.length];
  const options = shuffleOptions([selected.ans, ...selected.dist]);
  const correctOptionIndex = options.indexOf(selected.ans);

  return {
    id: `comp-${diff.toLowerCase()}-${idx}-${seedVariant}-${Date.now()}`,
    questionNumber: idx,
    questionText: selected.q,
    type: 'multiple_choice',
    options,
    correctOptionIndex,
    correctAnswer: selected.ans,
    explanation: selected.exp,
    internalDifficulty: diff,
    topic: topic || 'Computer Science'
  };
}

function buildProceduralGeneralQuestion(
  grade: string,
  topic: string,
  diff: InternalQuestionDifficulty,
  idx: number,
  seedVariant: number
): StageQuestion {
  return buildProceduralMathQuestion(grade, topic, diff, idx, seedVariant);
}
