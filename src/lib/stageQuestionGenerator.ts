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

export async function generateStageQuestions(
  params: GenerateTestParams
): Promise<StageQuestion[]> {
  const { subject, grade, topic = 'General Curriculum', stageNumber } = params;
  const count = params.questionCount || STAGE_CONFIGS[stageNumber].defaultQuestionCount;

  try {
    const res = await fetch('/api/stage-system/generate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        grade,
        topic,
        stage: stageNumber,
        questionCount: count
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        return normalizeQuestions(data.questions, stageNumber);
      }
    }
  } catch (err) {
    console.warn('Backend stage questions generation failed, switching to local backup:', err);
  }

  return generateLocalFallbackQuestions(subject, grade, topic, stageNumber, count);
}

function normalizeQuestions(questions: any[], stageNumber: StageNumber): StageQuestion[] {
  return questions.map((q, idx) => {
    let diff: InternalQuestionDifficulty = 'MEDIUM';
    if (stageNumber === 1) diff = 'EASY';
    else if (stageNumber === 2) diff = 'MEDIUM';
    else if (stageNumber === 3) diff = 'HARD';
    else {
      if (q.internalDifficulty === 'EASY' || q.internalDifficulty === 'HARD') {
        diff = q.internalDifficulty;
      } else {
        const ratio = idx / Math.max(1, questions.length);
        diff = ratio < 0.3 ? 'EASY' : ratio < 0.7 ? 'MEDIUM' : 'HARD';
      }
    }

    return {
      id: q.id || `q-${stageNumber}-${idx + 1}-${Date.now()}`,
      questionNumber: idx + 1,
      questionText: q.questionText || `Question ${idx + 1}`,
      type: (q.type as any) || 'multiple_choice',
      options: q.options || (q.type === 'true_false' ? ['True', 'False'] : ['Option A', 'Option B', 'Option C', 'Option D']),
      correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
      correctAnswer: q.correctAnswer || (q.options ? q.options[q.correctOptionIndex || 0] : 'Correct Answer'),
      explanation: q.explanation || 'Detailed academic explanation clarifying the underlying concept.',
      internalDifficulty: diff,
      topic: q.topic,
      hint: q.hint
    };
  });
}

function generateLocalFallbackQuestions(
  subject: string,
  grade: string,
  topic: string,
  stageNumber: StageNumber,
  count: number
): StageQuestion[] {
  const questions: StageQuestion[] = [];
  const cleanSub = subject.toLowerCase();

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
    ];
    targetDifficulties = targetDifficulties.sort(() => Math.random() - 0.5);
  }

  for (let i = 0; i < count; i++) {
    const diff = targetDifficulties[i] || 'MEDIUM';
    const q = createSubjectQuestionTemplate(cleanSub, grade, topic, diff, i + 1);
    questions.push(q);
  }

  return questions;
}

function createSubjectQuestionTemplate(
  sub: string,
  grade: string,
  topic: string,
  difficulty: InternalQuestionDifficulty,
  index: number
): StageQuestion {
  const isMath = sub.includes('math');
  const isScience = sub.includes('scien') || sub.includes('phys') || sub.includes('chem') || sub.includes('bio');
  const isSocial = sub.includes('soc') || sub.includes('hist') || sub.includes('civ');
  const isComp = sub.includes('comp');
  const isGK = sub.includes('gk') || sub.includes('gener');

  if (isMath) {
    return generateMathQuestion(grade, topic, difficulty, index);
  } else if (isScience) {
    return generateScienceQuestion(grade, topic, difficulty, index);
  } else if (isSocial) {
    return generateSocialScienceQuestion(grade, topic, difficulty, index);
  } else if (isComp) {
    return generateComputerQuestion(grade, topic, difficulty, index);
  } else if (isGK) {
    return generateGKQuestion(grade, topic, difficulty, index);
  }
  return generateEnglishQuestion(grade, topic, difficulty, index);
}

function generateMathQuestion(grade: string, topic: string, diff: InternalQuestionDifficulty, idx: number): StageQuestion {
  if (diff === 'EASY') {
    return {
      id: `math-e-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `What is the reciprocal of 7/12?`,
      type: 'multiple_choice',
      options: ['12/7', '7/12', '-7/12', '-12/7'],
      correctOptionIndex: 0,
      correctAnswer: '12/7',
      explanation: 'The reciprocal (or multiplicative inverse) of a fraction a/b is b/a because multiplying them yields 1.',
      internalDifficulty: 'EASY',
      topic: 'Fractions & Operations'
    };
  } else if (diff === 'MEDIUM') {
    return {
      id: `math-m-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `Solve for x in the linear equation: 3x - 14 = 2x + 7.`,
      type: 'multiple_choice',
      options: ['x = 21', 'x = 7', 'x = -21', 'x = 14'],
      correctOptionIndex: 0,
      correctAnswer: 'x = 21',
      explanation: 'Subtract 2x from both sides to get x - 14 = 7. Add 14 to both sides: x = 21.',
      internalDifficulty: 'MEDIUM',
      topic: 'Algebraic Equations'
    };
  } else {
    return {
      id: `math-h-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `A rectangular garden has a perimeter of 96 meters. If its length is 12 meters more than its width, find the area of the garden.`,
      type: 'multiple_choice',
      options: ['540 m²', '576 m²', '480 m²', '620 m²'],
      correctOptionIndex: 0,
      correctAnswer: '540 m²',
      explanation: 'Let width = w. Length = w + 12. Perimeter = 2(w + w + 12) = 96 => 4w + 24 = 96 => 4w = 72 => w = 18 m. Length = 30 m. Area = 18 × 30 = 540 m².',
      internalDifficulty: 'HARD',
      topic: 'Mensuration & Equations'
    };
  }
}

function generateScienceQuestion(grade: string, topic: string, diff: InternalQuestionDifficulty, idx: number): StageQuestion {
  if (diff === 'EASY') {
    return {
      id: `sci-e-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `Which organelle is universally known as the powerhouse of the eukaryotic cell?`,
      type: 'multiple_choice',
      options: ['Mitochondria', 'Ribosome', 'Golgi Apparatus', 'Endoplasmic Reticulum'],
      correctOptionIndex: 0,
      correctAnswer: 'Mitochondria',
      explanation: 'Mitochondria produce ATP through cellular respiration, supplying chemical energy to power the cell.',
      internalDifficulty: 'EASY',
      topic: 'Cell Biology'
    };
  } else if (diff === 'MEDIUM') {
    return {
      id: `sci-m-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `When zinc metal reacts with dilute hydrochloric acid, which gas is produced and how is it tested?`,
      type: 'multiple_choice',
      options: [
        'Hydrogen gas (produces a pop sound with a burning splinter)',
        'Oxygen gas (relights a glowing wooden splinter)',
        'Carbon dioxide (turns lime water milky)',
        'Chlorine gas (bleaches moist litmus paper)'
      ],
      correctOptionIndex: 0,
      correctAnswer: 'Hydrogen gas (produces a pop sound with a burning splinter)',
      explanation: 'Zn + 2HCl → ZnCl₂ + H₂. Hydrogen gas burns with a characteristic pop sound.',
      internalDifficulty: 'MEDIUM',
      topic: 'Chemical Reactions'
    };
  } else {
    return {
      id: `sci-h-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `An object is placed 20 cm in front of a convex lens with a focal length of 15 cm. What are the nature and position of the image formed?`,
      type: 'multiple_choice',
      options: [
        'Real, inverted, formed at 60 cm on the other side',
        'Virtual, erect, formed at 60 cm on the same side',
        'Real, inverted, formed at 30 cm on the other side',
        'Virtual, erect, formed at 15 cm on the same side'
      ],
      correctOptionIndex: 0,
      correctAnswer: 'Real, inverted, formed at 60 cm on the other side',
      explanation: 'Using lens formula 1/f = 1/v - 1/u: 1/15 = 1/v - 1/(-20) => 1/v = 1/15 - 1/20 = 1/60 => v = +60 cm. Positive distance denotes a real, inverted image.',
      internalDifficulty: 'HARD',
      topic: 'Optics & Light'
    };
  }
}

function generateEnglishQuestion(grade: string, topic: string, diff: InternalQuestionDifficulty, idx: number): StageQuestion {
  if (diff === 'EASY') {
    return {
      id: `eng-e-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `Identify the adverb in the following sentence: "The eager student quickly answered the question."`,
      type: 'multiple_choice',
      options: ['quickly', 'eager', 'answered', 'question'],
      correctOptionIndex: 0,
      correctAnswer: 'quickly',
      explanation: '"Quickly" modifies the verb "answered", describing the manner in which the action occurred.',
      internalDifficulty: 'EASY',
      topic: 'Parts of Speech'
    };
  } else if (diff === 'MEDIUM') {
    return {
      id: `eng-m-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `Choose the sentence that correctly transforms the statement into Passive Voice: "The archaeological team discovered the ancient tomb."`,
      type: 'multiple_choice',
      options: [
        'The ancient tomb was discovered by the archaeological team.',
        'The ancient tomb had been discovered by the team.',
        'The ancient tomb is discovered by the archaeological team.',
        'The ancient tomb was being discovered by the team.'
      ],
      correctOptionIndex: 0,
      correctAnswer: 'The ancient tomb was discovered by the archaeological team.',
      explanation: 'Simple past active "discovered" converts to passive "was discovered" + agent.',
      internalDifficulty: 'MEDIUM',
      topic: 'Active & Passive Voice'
    };
  } else {
    return {
      id: `eng-h-${idx}-${Date.now()}`,
      questionNumber: idx,
      questionText: `What literary device is utilized in the phrase: "The silent stars wept golden tears upon the slumbering valley"?`,
      type: 'multiple_choice',
      options: [
        'Personification & Metaphor',
        'Hyperbole & Oxymoron',
        'Onomatopoeia & Irony',
        'Simile & Litotes'
      ],
      correctOptionIndex: 0,
      correctAnswer: 'Personification & Metaphor',
      explanation: 'Giving stars human emotions (wept) is personification, while "golden tears" represents celestial light metaphorically.',
      internalDifficulty: 'HARD',
      topic: 'Literary Devices'
    };
  }
}

function generateSocialScienceQuestion(grade: string, topic: string, diff: InternalQuestionDifficulty, idx: number): StageQuestion {
  return {
    id: `soc-${diff.toLowerCase()}-${idx}-${Date.now()}`,
    questionNumber: idx,
    questionText: `Who is officially recognized as the Chief Architect and Chairman of the Drafting Committee of the Indian Constitution?`,
    type: 'multiple_choice',
    options: ['Dr. B. R. Ambedkar', 'Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel'],
    correctOptionIndex: 0,
    correctAnswer: 'Dr. B. R. Ambedkar',
    explanation: 'Dr. Bhimrao Ramji Ambedkar served as the Chairman of the Drafting Committee and is heralded as the Father of the Indian Constitution.',
    internalDifficulty: diff,
    topic: 'Civics & Constitution'
  };
}

function generateComputerQuestion(grade: string, topic: string, diff: InternalQuestionDifficulty, idx: number): StageQuestion {
  return {
    id: `comp-${diff.toLowerCase()}-${idx}-${Date.now()}`,
    questionNumber: idx,
    questionText: `What does the abbreviation "RAM" stand for in modern computing systems?`,
    type: 'multiple_choice',
    options: ['Random Access Memory', 'Read Access Memory', 'Rapid Action Module', 'Run All Memory'],
    correctOptionIndex: 0,
    correctAnswer: 'Random Access Memory',
    explanation: 'RAM is the high-speed volatile primary memory used by the CPU to store data currently in active use.',
    internalDifficulty: diff,
    topic: 'Hardware Fundamentals'
  };
}

function generateGKQuestion(grade: string, topic: string, diff: InternalQuestionDifficulty, idx: number): StageQuestion {
  return {
    id: `gk-${diff.toLowerCase()}-${idx}-${Date.now()}`,
    questionNumber: idx,
    questionText: `Which celestial planet is renowned in our solar system as the "Red Planet" due to iron oxide on its surface?`,
    type: 'multiple_choice',
    options: ['Mars', 'Venus', 'Jupiter', 'Mercury'],
    correctOptionIndex: 0,
    correctAnswer: 'Mars',
    explanation: 'Mars appears red because of the high concentration of iron oxide (rust) covering its rocky soil.',
    internalDifficulty: diff,
    topic: 'Astronomy & Space'
  };
}
