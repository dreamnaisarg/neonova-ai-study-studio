export interface CurriculumTopic {
  id: string;
  name: string;
  learningObjectives: string[];
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  keyTerminology: string[];
  examPatterns: string[];
}

export interface CurriculumChapter {
  chapterNumber: number;
  title: string;
  unit: string;
  textbookRef?: string;
  topics: CurriculumTopic[];
}

export interface SubjectCurriculum {
  subjectId: string;
  subjectName: string;
  standardTextbook: string;
  chapters: CurriculumChapter[];
}

export interface BoardCurriculum {
  boardId: string;
  boardName: string;
  country: string;
  description: string;
  grades: {
    [grade: string]: {
      subjects: SubjectCurriculum[];
    };
  };
}

export const CURRICULUM_CATALOG: { [boardId: string]: BoardCurriculum } = {
  cbse: {
    boardId: 'cbse',
    boardName: 'CBSE (Central Board of Secondary Education)',
    country: 'India',
    description: 'National Indian curriculum following official NCERT syllabi from Grade 1 to Grade 12.',
    grades: {
      'Grade 8': {
        subjects: [
          {
            subjectId: 'mathematics',
            subjectName: 'Mathematics',
            standardTextbook: 'NCERT Mathematics for Class VIII',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Rational Numbers',
                unit: 'Number Systems',
                textbookRef: 'NCERT Ch. 1, pp. 1-22',
                topics: [
                  {
                    id: 'cbse-8-m-1-1',
                    name: 'Properties of Rational Numbers (Closure, Commutativity, Associativity)',
                    learningObjectives: ['Verify arithmetic properties under addition, subtraction, multiplication, and division.'],
                    difficulty: 'Foundation',
                    keyTerminology: ['Rational Number', 'Additive Inverse', 'Multiplicative Inverse / Reciprocal', 'Distributivity'],
                    examPatterns: ['Direct property verification questions', 'Find additive and multiplicative inverses', 'Fill in the blanks with properties']
                  },
                  {
                    id: 'cbse-8-m-1-2',
                    name: 'Representation of Rational Numbers on Number Line',
                    learningObjectives: ['Plot rational numbers accurately', 'Find rational numbers between any two given numbers using mean method.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Number Line', 'Mean Method', 'Common Denominator Method'],
                    examPatterns: ['Find 5 rational numbers between -2/5 and 1/2', 'Represent -5/6 on number line']
                  }
                ]
              },
              {
                chapterNumber: 2,
                title: 'Linear Equations in One Variable',
                unit: 'Algebra',
                textbookRef: 'NCERT Ch. 2, pp. 23-40',
                topics: [
                  {
                    id: 'cbse-8-m-2-1',
                    name: 'Solving Linear Equations having Variable on One Side & Both Sides',
                    learningObjectives: ['Isolate variable using transposition', 'Verify solution by substituting back into original equation.'],
                    difficulty: 'Foundation',
                    keyTerminology: ['Linear Equation', 'Variable', 'Transposition', 'Root of Equation'],
                    examPatterns: ['Solve: 2x - 3 = 7', 'Solve and check: 5x + 9 = 5 + 3x']
                  }
                ]
              },
              {
                chapterNumber: 6,
                title: 'Squares and Square Roots',
                unit: 'Arithmetic & Algebra',
                textbookRef: 'NCERT Ch. 6, pp. 89-110',
                topics: [
                  {
                    id: 'cbse-8-m-6-1',
                    name: 'Properties of Perfect Squares & Pythagorean Triplets',
                    learningObjectives: ['Identify unit digits of squares', 'Form Pythagorean triplets using 2m, m^2 - 1, m^2 + 1.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Perfect Square', 'Pythagorean Triplet', 'Prime Factorization'],
                    examPatterns: ['Write a Pythagorean triplet whose smallest member is 8', 'Find smallest number to multiply to get perfect square']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'science',
            subjectName: 'Science',
            standardTextbook: 'NCERT Science for Class VIII',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Crop Production and Management',
                unit: 'Food & Agriculture',
                textbookRef: 'NCERT Science Ch. 1',
                topics: [
                  {
                    id: 'cbse-8-s-1-1',
                    name: 'Agricultural Practices: Sowing, Manures, Fertilizers, and Irrigation',
                    learningObjectives: ['Distinguish between Kharif and Rabi crops', 'Compare organic manure with chemical fertilizers', 'Explain drip and sprinkler irrigation.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Kharif Crops', 'Rabi Crops', 'Manure', 'Fertilizer', 'Drip Irrigation', 'Sprinkler System'],
                    examPatterns: ['Difference table between Fertilizer and Manure (3 marks)', 'Short note on drip irrigation advantage in water scarcity areas']
                  }
                ]
              },
              {
                chapterNumber: 8,
                title: 'Cell — Structure and Functions',
                unit: 'Life Processes & Biology',
                textbookRef: 'NCERT Science Ch. 8',
                topics: [
                  {
                    id: 'cbse-8-s-8-1',
                    name: 'Plant and Animal Cell Organelles & Differences',
                    learningObjectives: ['Label plant vs animal cell', 'Explain function of nucleus, cytoplasm, cell membrane, vacuole, and plastids.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Cell Wall', 'Cell Membrane', 'Nucleus', 'Plastids / Chloroplasts', 'Vacuole', 'Prokaryote', 'Eukaryote'],
                    examPatterns: ['Draw and label plant cell vs animal cell', 'Why is nucleus called master organelle?', 'Which organelle is found only in plant cells and why?']
                  }
                ]
              },
              {
                chapterNumber: 11,
                title: 'Force and Pressure',
                unit: 'Physics',
                textbookRef: 'NCERT Science Ch. 11',
                topics: [
                  {
                    id: 'cbse-8-s-11-1',
                    name: 'Contact and Non-Contact Forces & Pressure Calculations',
                    learningObjectives: ['State Newton laws', 'Calculate pressure using P = F / A', 'Distinguish gravitational, electrostatic, and magnetic forces.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Force', 'Pressure', 'Pascal (Pa)', 'Atmospheric Pressure', 'Frictional Force'],
                    examPatterns: ['Calculate pressure exerted by a 500 N force on area 2 m²', 'Why do porters place a round cloth on head?']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'english',
            subjectName: 'English',
            standardTextbook: 'Honeydew & It So Happened (NCERT Class 8)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Grammar: Active and Passive Voice & Tenses',
                unit: 'Applied English Grammar',
                textbookRef: 'NCERT English Grammar Companion',
                topics: [
                  {
                    id: 'cbse-8-e-1-1',
                    name: 'Active to Passive Voice Transformations',
                    learningObjectives: ['Identify subject, verb, and object in sentences', 'Transform affirmative and interrogative sentences into passive voice.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Active Voice', 'Passive Voice', 'Past Participle (V3)', 'Agent by-phrase'],
                    examPatterns: ['Rewrite in passive voice: He sings a song', 'Spot the error in voice agreement']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'hindi',
            subjectName: 'Hindi',
            standardTextbook: 'वसंत भाग ३ (NCERT Class 8 Hindi)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'हिंदी व्याकरण: संधि एवं समास',
                unit: 'व्याकरण भारती',
                textbookRef: 'NCERT मानक हिंदी व्याकरण',
                topics: [
                  {
                    id: 'cbse-8-h-1-1',
                    name: 'स्वर संधि, व्यंजन संधि एवं समास विग्रह',
                    learningObjectives: ['दीर्घ, गुण, वृद्धि संधि के नियम समझना', 'तत्पुरुष, द्वंद्व, बहुव्रीहि समास विग्रह करना।'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['संधि विच्छेद', 'समस्त पद', 'पूर्वपद', 'उत्तरपद', 'तत्पुरुष समास'],
                    examPatterns: ['विद्यालय का संधि विच्छेद करें', 'माता-पिता का समास विग्रह कर भेद बताएं']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'gujarati',
            subjectName: 'Gujarati',
            standardTextbook: 'ગુજરાતી પલાશ / કુહૂ (GSEB / NCERT Class 8)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'ગુજરાતી વ્યાકરણ: સંધિ અને સમાસ',
                unit: 'વ્યાકરણ પરિચય',
                textbookRef: 'જીસીઇઆરટી ગુજરાતી વ્યાકરણ પુસ્તિકા',
                topics: [
                  {
                    id: 'cbse-8-g-1-1',
                    name: 'સ્વર સંધિ અને તત્પુરુષ / દ્વંદ્વ સમાસ',
                    learningObjectives: ['સંધિ જોડો અને છોડો ના નિયમો સમજવા', 'સમાસ ના પ્રકાર ઓળખવા.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['સંધિ', 'વિગ્રહ', 'સમાસ', 'જોડણી'],
                    examPatterns: ['સૂર્યોદય ની સંધિ છૂટી પાડો', 'રામ-લક્ષ્મણ નો સમાસ ઓળખો']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'social',
            subjectName: 'Social Science',
            standardTextbook: 'Our Pasts - III & Resource and Development (NCERT Class 8)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'History: The Revolt of 1857 & National Movement',
                unit: 'Modern Indian History',
                textbookRef: 'NCERT Our Pasts - III Ch. 5',
                topics: [
                  {
                    id: 'cbse-8-ss-1-1',
                    name: 'Causes, Leaders and Significance of 1857 Revolt',
                    learningObjectives: ['Analyze political, economic, military, and religious causes of 1857 revolt', 'Understand Queen Victoria Proclamation 1858.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Doctrine of Lapse', 'Enfield Rifle', 'Mangal Pandey', 'Rani Lakshmibai', 'Bahadur Shah Zafar'],
                    examPatterns: ['Mention 3 main causes of 1857 revolt', 'Why did the revolt fail?']
                  }
                ]
              },
              {
                chapterNumber: 2,
                title: 'Civics: The Indian Constitution & Fundamental Rights',
                unit: 'Social and Political Life - III',
                textbookRef: 'NCERT Civics Ch. 1',
                topics: [
                  {
                    id: 'cbse-8-ss-2-1',
                    name: 'Fundamental Rights and Directive Principles',
                    learningObjectives: ['Explain Articles 14 to 32 of Indian Constitution', 'Understand secularism and parliamentary democracy.'],
                    difficulty: 'Foundation',
                    keyTerminology: ['Fundamental Rights', 'Right to Equality', 'Right to Education', 'Secularism', 'Preamble'],
                    examPatterns: ['Why is Article 32 called heart and soul of Constitution?', 'List 6 Fundamental Rights']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'computer',
            subjectName: 'Computer',
            standardTextbook: 'Information & Communication Technology (NCERT Class 8)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Number Systems & Boolean Logic',
                unit: 'Computer Foundations',
                textbookRef: 'NCERT ICT Class 8',
                topics: [
                  {
                    id: 'cbse-8-cs-1-1',
                    name: 'Binary, Decimal Conversion & Logic Gates (AND, OR, NOT)',
                    learningObjectives: ['Convert decimal numbers to binary and vice versa', 'Construct truth tables for basic logic gates.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Binary (Base 2)', 'Decimal (Base 10)', 'Truth Table', 'AND Gate', 'OR Gate', 'NOT Gate'],
                    examPatterns: ['Convert (25)₁₀ into binary', 'Draw truth table for 2-input AND gate']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'gk',
            subjectName: 'General Knowledge (GK)',
            standardTextbook: 'Universal Knowledge & Current Affairs (NCERT / National Yearbook)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'National & Global Discoveries and Governance',
                unit: 'General Awareness',
                textbookRef: 'Official India Yearbook & Scientific Records',
                topics: [
                  {
                    id: 'cbse-8-gk-1-1',
                    name: 'Indian National Symbols, World Capitals, and Nobel Laureates',
                    learningObjectives: ['Identify verified national emblems and world governance structures.'],
                    difficulty: 'Foundation',
                    keyTerminology: ['National Emblem', 'Capital Cities', 'Currencies', 'ISRO Missions'],
                    examPatterns: ['Name the first Indian recipient of Nobel Prize in Physics', 'Identify headquarters of UNO']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'french',
            subjectName: 'French',
            standardTextbook: 'Apprenons le Français (Méthode de Français)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Les Verbes et La Grammaire (Présent de l\'Indicatif)',
                unit: 'French Language & Grammar',
                textbookRef: 'Apprenons le Français Cahier d\'exercices',
                topics: [
                  {
                    id: 'cbse-8-fr-1-1',
                    name: 'Conjugaison des verbes être, avoir, aller, faire et les verbes en -er',
                    learningObjectives: ['Conjugate regular and irregular French verbs in simple present tense', 'Translate sentences between English and French.'],
                    difficulty: 'Foundation',
                    keyTerminology: ['Infinitif', 'Présent', 'Auxiliaire', 'Pronom Sujet', 'Élision'],
                    examPatterns: ['Conjugate le verbe être au présent', 'Complétez avec le verbe convenable']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'artificial_intelligence',
            subjectName: 'Artificial Intelligence',
            standardTextbook: 'CBSE Artificial Intelligence Curriculum (Subject Code 417)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Foundations of AI & Machine Learning',
                unit: 'Artificial Intelligence',
                textbookRef: 'CBSE AI Study Material Class 8 / 9',
                topics: [
                  {
                    id: 'cbse-8-ai-1-1',
                    name: 'AI Project Cycle, Machine Learning Domains & Responsible AI',
                    learningObjectives: ['Distinguish supervised, unsupervised, and reinforcement learning', 'Explain ethics, bias, and neural network basics.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Supervised Learning', 'Unsupervised Learning', 'Computer Vision', 'NLP', 'Algorithmic Bias', 'Neural Network'],
                    examPatterns: ['Differentiate between classification and regression with examples', 'Explain 5 stages of AI project cycle']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'skill_education',
            subjectName: 'Skill Education',
            standardTextbook: 'CBSE Skill Education & Financial Literacy Guide',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Financial Literacy & Design Thinking',
                unit: 'Vocational & Practical Skills',
                textbookRef: 'CBSE Financial Literacy Handbook',
                topics: [
                  {
                    id: 'cbse-8-sk-1-1',
                    name: 'Simple Interest, Budgeting & 5 Stages of Design Thinking',
                    learningObjectives: ['Calculate simple interest and profit/loss', 'Apply 5-stage design thinking framework to real problems.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Simple Interest', 'Principal', 'Maturity Amount', 'Profit & Loss', 'Empathize', 'Prototype'],
                    examPatterns: ['Calculate SI on ₹5000 at 8% for 3 years', 'List the five stages of design thinking in order']
                  }
                ]
              }
            ]
          }
        ]
      },
      'Grade 10': {
        subjects: [
          {
            subjectId: 'mathematics',
            subjectName: 'Mathematics',
            standardTextbook: 'NCERT Class X Mathematics',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Real Numbers',
                unit: 'Number Systems',
                textbookRef: 'NCERT Class 10 Ch. 1',
                topics: [
                  {
                    id: 'cbse-10-m-1-1',
                    name: 'Fundamental Theorem of Arithmetic & Proof of Irrationality',
                    learningObjectives: ['Express composite number as unique product of primes', 'Prove √2, √3, √5 are irrational using contradiction.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Fundamental Theorem of Arithmetic', 'Irrational Number', 'Proof by Contradiction', 'Coprime Integers'],
                    examPatterns: ['Prove that √5 is irrational (3 marks)', 'Find HCF and LCM of 96 and 404 and verify HCF × LCM = Product']
                  }
                ]
              },
              {
                chapterNumber: 4,
                title: 'Quadratic Equations',
                unit: 'Algebra',
                textbookRef: 'NCERT Class 10 Ch. 4',
                topics: [
                  {
                    id: 'cbse-10-m-4-1',
                    name: 'Roots of Quadratic Equation & Nature of Roots',
                    learningObjectives: ['Apply quadratic formula x = (-b ± √(b² - 4ac)) / 2a', 'Determine nature of roots from discriminant D.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Discriminant (D = b² - 4ac)', 'Real & Distinct Roots', 'Equal Roots', 'No Real Roots'],
                    examPatterns: ['Find values of k for which 2x² + kx + 3 = 0 has equal roots', 'Solve for x: 1/(x+4) - 1/(x-7) = 11/30']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'science',
            subjectName: 'Science',
            standardTextbook: 'NCERT Class X Science',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Chemical Reactions and Equations',
                unit: 'Chemistry',
                textbookRef: 'NCERT Science Class 10 Ch. 1',
                topics: [
                  {
                    id: 'cbse-10-s-1-1',
                    name: 'Types of Chemical Reactions and Balancing Equations',
                    learningObjectives: ['Balance chemical equations using law of conservation of mass', 'Identify combination, decomposition, displacement, and redox reactions.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Oxidation', 'Reduction', 'Exothermic', 'Endothermic', 'Precipitate', 'Corrosion'],
                    examPatterns: ['Balance: Fe + H2O → Fe3O4 + H2', 'Identify substance oxidized and reduced in CuO + H2 → Cu + H2O']
                  }
                ]
              },
              {
                chapterNumber: 12,
                title: 'Electricity',
                unit: 'Physics',
                textbookRef: 'NCERT Science Class 10 Ch. 12',
                topics: [
                  {
                    id: 'cbse-10-s-12-1',
                    name: 'Ohm’s Law, Resistance in Series and Parallel, and Electric Power',
                    learningObjectives: ['Verify V = IR experimentally', 'Compute equivalent resistance for series and parallel circuits', 'Calculate electrical energy in kilowatt-hours (kWh).'],
                    difficulty: 'Advanced',
                    keyTerminology: ['Ohm’s Law', 'Resistivity (ρ)', 'Equivalent Resistance', 'Joule’s Law of Heating', 'Electric Power (P = VI)'],
                    examPatterns: ['Numerical: 3 resistors of 2Ω, 3Ω, 6Ω connected in parallel', 'State Joule’s law of heating and derive H = I²Rt']
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  icse: {
    boardId: 'icse',
    boardName: 'ICSE (Council for the Indian School Certificate Examinations)',
    country: 'India',
    description: 'CISCE curriculum known for comprehensive language, scientific depth, and rigorous commercial mathematics.',
    grades: {
      'Grade 8': {
        subjects: [
          {
            subjectId: 'mathematics',
            subjectName: 'Mathematics',
            standardTextbook: 'Concise Mathematics Class 8 (Selina Publishers)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Rational Numbers',
                unit: 'Pure Arithmetic',
                topics: [
                  {
                    id: 'icse-8-m-1-1',
                    name: 'Operations and Word Problems on Rational Numbers',
                    learningObjectives: ['Solve complex multi-step fractions with order of operations.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Rational Numbers', 'BODMAS / PEMDAS', 'Reciprocals'],
                    examPatterns: ['Evaluate mixed fractional expressions with brackets', 'Word problems involving division of fractions']
                  }
                ]
              }
            ]
          },
          {
            subjectId: 'science',
            subjectName: 'Science',
            standardTextbook: 'Concise Physics & Chemistry Class 8 (Selina)',
            chapters: [
              {
                chapterNumber: 1,
                title: 'Matter and Chemical Changes',
                unit: 'Chemistry',
                topics: [
                  {
                    id: 'icse-8-s-1-1',
                    name: 'Valency, Chemical Formulae, and Balancing Equations',
                    learningObjectives: ['Derive molecular formula using criss-cross valency method', 'Balance word and chemical equations.'],
                    difficulty: 'Intermediate',
                    keyTerminology: ['Valency', 'Radicals', 'Stoichiometry', 'Balanced Equation'],
                    examPatterns: ['Write balanced equation for reaction between dilute hydrochloric acid and sodium hydroxide', 'Find molecular mass of sulphuric acid']
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  }
};

/**
 * Find topics matching a question query and curriculum configuration
 * Optionally prioritize preferredSubject if specified
 */
export function matchCurriculumTopic(
  query: string,
  boardId: string = 'cbse',
  grade: string = 'Grade 8',
  preferredSubject?: string
) {
  const board = CURRICULUM_CATALOG[boardId] || CURRICULUM_CATALOG['cbse'];
  const gradeData = board.grades[grade] || board.grades['Grade 8'];
  if (!gradeData) return null;

  const lowerQuery = query.toLowerCase();
  const lowerPrefSubj = preferredSubject?.toLowerCase();

  // If preferredSubject is provided, search inside that subject first
  if (lowerPrefSubj) {
    const matchedSubject = gradeData.subjects.find(
      s => s.subjectId.toLowerCase() === lowerPrefSubj || s.subjectName.toLowerCase().includes(lowerPrefSubj)
    );
    if (matchedSubject) {
      for (const chapter of matchedSubject.chapters) {
        for (const topic of chapter.topics) {
          const matchesName = lowerQuery.includes(topic.name.toLowerCase());
          const matchesChapter = lowerQuery.includes(chapter.title.toLowerCase());
          const matchesTerms = topic.keyTerminology.some(term => lowerQuery.includes(term.toLowerCase()));

          if (matchesName || matchesChapter || matchesTerms) {
            return {
              board: board.boardName,
              grade,
              subject: matchedSubject.subjectName,
              chapterNumber: chapter.chapterNumber,
              chapterTitle: chapter.title,
              textbook: chapter.textbookRef || matchedSubject.standardTextbook,
              topic: topic.name,
              learningObjectives: topic.learningObjectives,
              keyTerminology: topic.keyTerminology,
              examPatterns: topic.examPatterns
            };
          }
        }
      }

      // If no query match within preferred subject, return first chapter of that subject
      const firstCh = matchedSubject.chapters[0];
      if (firstCh) {
        return {
          board: board.boardName,
          grade,
          subject: matchedSubject.subjectName,
          chapterNumber: firstCh.chapterNumber,
          chapterTitle: firstCh.title,
          textbook: firstCh.textbookRef || matchedSubject.standardTextbook,
          topic: firstCh.topics[0]?.name || firstCh.title,
          learningObjectives: firstCh.topics[0]?.learningObjectives || [],
          keyTerminology: firstCh.topics[0]?.keyTerminology || [],
          examPatterns: firstCh.topics[0]?.examPatterns || []
        };
      }
    }
  }

  // General search across all subjects
  for (const subject of gradeData.subjects) {
    for (const chapter of subject.chapters) {
      for (const topic of chapter.topics) {
        const matchesName = lowerQuery.includes(topic.name.toLowerCase());
        const matchesChapter = lowerQuery.includes(chapter.title.toLowerCase());
        const matchesTerms = topic.keyTerminology.some(term => lowerQuery.includes(term.toLowerCase()));

        if (matchesName || matchesChapter || matchesTerms) {
          return {
            board: board.boardName,
            grade,
            subject: subject.subjectName,
            chapterNumber: chapter.chapterNumber,
            chapterTitle: chapter.title,
            textbook: chapter.textbookRef || subject.standardTextbook,
            topic: topic.name,
            learningObjectives: topic.learningObjectives,
            keyTerminology: topic.keyTerminology,
            examPatterns: topic.examPatterns
          };
        }
      }
    }
  }

  // Fallback default topic in first subject
  const defaultSubj = gradeData.subjects[0];
  const defaultCh = defaultSubj?.chapters[0];
  if (defaultCh) {
    return {
      board: board.boardName,
      grade,
      subject: defaultSubj.subjectName,
      chapterNumber: defaultCh.chapterNumber,
      chapterTitle: defaultCh.title,
      textbook: defaultSubj.standardTextbook,
      topic: defaultCh.topics[0]?.name || defaultCh.title,
      learningObjectives: defaultCh.topics[0]?.learningObjectives || [],
      keyTerminology: defaultCh.topics[0]?.keyTerminology || [],
      examPatterns: defaultCh.topics[0]?.examPatterns || []
    };
  }

  return null;
}
