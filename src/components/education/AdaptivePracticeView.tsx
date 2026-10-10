import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw, 
  HelpCircle, 
  Clock, 
  Award, 
  BarChart2, 
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface AdaptivePracticeViewProps {
  currentSubject?: string;
  currentGrade?: string;
  curriculumBoard?: string;
  userId?: string;
  initialTopic?: string;
}

interface PracticeQuestion {
  id: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  commonMistakeCategory: 'calculation_error' | 'formula_misapplication' | 'conceptual_misunderstanding' | 'sign_error' | 'reading_misinterpretation' | 'unit_omission';
}

const QUESTION_BANK: { [subject: string]: PracticeQuestion[] } = {
  Mathematics: [
    {
      id: 'q-m-1',
      topic: 'Linear Equations in One Variable',
      difficulty: 'Easy',
      question: 'Solve for x: 3x - 5 = 16',
      options: ['x = 7', 'x = 3', 'x = 9', 'x = 11/3'],
      correctIndex: 0,
      explanation: 'Add 5 to both sides: 3x = 21. Divide by 3: x = 7. Verified: 3(7) - 5 = 21 - 5 = 16.',
      commonMistakeCategory: 'sign_error'
    },
    {
      id: 'q-m-2',
      topic: 'Rational Numbers',
      difficulty: 'Easy',
      question: 'What is the additive inverse of -7/19?',
      options: ['7/19', '-19/7', '19/7', '-7/19'],
      correctIndex: 0,
      explanation: 'The additive inverse of any rational number a/b is -(a/b) such that their sum equals 0. (-7/19) + (7/19) = 0.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-m-3',
      topic: 'Linear Equations in One Variable',
      difficulty: 'Medium',
      question: 'Solve for y: 5y - 7 = 2y + 8',
      options: ['y = 5', 'y = 3', 'y = 15', 'y = 1/3'],
      correctIndex: 0,
      explanation: 'Transpose 2y to the left: 5y - 2y = 8 + 7 => 3y = 15 => y = 5. Verified: 5(5) - 7 = 18 and 2(5) + 8 = 18.',
      commonMistakeCategory: 'calculation_error'
    },
    {
      id: 'q-m-4',
      topic: 'Fractions & Rational Operations',
      difficulty: 'Medium',
      question: 'Evaluate: 3/4 + 2/5',
      options: ['23/20 (or 1 3/20)', '5/9', '6/20', '1/2'],
      correctIndex: 0,
      explanation: 'LCM of 4 and 5 is 20. 3/4 = 15/20 and 2/5 = 8/20. 15/20 + 8/20 = 23/20.',
      commonMistakeCategory: 'calculation_error'
    },
    {
      id: 'q-m-5',
      topic: 'Quadratic Equations',
      difficulty: 'Hard',
      question: 'Find the roots of the equation: x² - 7x + 12 = 0',
      options: ['x = 3, x = 4', 'x = -3, x = -4', 'x = 2, x = 6', 'x = -2, x = -6'],
      correctIndex: 0,
      explanation: 'Factor the quadratic: (x - 3)(x - 4) = 0, giving x = 3 or x = 4. Verified: 3² - 7(3) + 12 = 9 - 21 + 12 = 0.',
      commonMistakeCategory: 'formula_misapplication'
    },
    {
      id: 'q-m-6',
      topic: 'Squares and Square Roots',
      difficulty: 'Hard',
      question: 'Which of the following is a Pythagorean triplet with 8 as one member?',
      options: ['(8, 15, 17)', '(8, 10, 12)', '(8, 12, 16)', '(8, 9, 15)'],
      correctIndex: 0,
      explanation: '8² + 15² = 64 + 225 = 289 = 17². Thus (8, 15, 17) forms an exact Pythagorean triplet.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    }
  ],
  Science: [
    {
      id: 'q-s-1',
      topic: 'Cell — Structure and Functions',
      difficulty: 'Easy',
      question: 'Which organelle is present in plant cells but absent in animal cells?',
      options: ['Cell Wall & Plastids', 'Mitochondria', 'Nucleus', 'Ribosomes'],
      correctIndex: 0,
      explanation: 'Plant cells have a rigid outer cellulose cell wall and plastids (such as chloroplasts for photosynthesis), which animal cells lack.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-s-2',
      topic: 'Crop Production and Management',
      difficulty: 'Medium',
      question: 'Which of the following is a Kharif crop sown during the monsoon season in India?',
      options: ['Paddy (Rice)', 'Wheat', 'Gram', 'Mustard'],
      correctIndex: 0,
      explanation: 'Paddy, maize, soya bean, groundnut, and cotton are Kharif crops requiring abundant rainfall during June–September.',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-s-3',
      topic: 'Force and Pressure',
      difficulty: 'Hard',
      question: 'A force of 600 N acts on an area of 3 m². What is the pressure exerted?',
      options: ['200 Pa', '1800 Pa', '0.005 Pa', '300 Pa'],
      correctIndex: 0,
      explanation: 'Pressure = Force / Area = 600 N / 3 m² = 200 Pascals (N/m²). Independently verified.',
      commonMistakeCategory: 'calculation_error'
    }
  ],
  Physics: [
    {
      id: 'q-p-1',
      topic: "Newton's Laws of Motion",
      difficulty: 'Easy',
      question: 'What is the force required to accelerate a 5 kg mass at 4 m/s²?',
      options: ['20 N', '1 N', '9 N', '1.25 N'],
      correctIndex: 0,
      explanation: 'F = m × a = 5 kg × 4 m/s² = 20 Newtons. Verified by dimensional analysis [M][L][T^-2].',
      commonMistakeCategory: 'calculation_error'
    },
    {
      id: 'q-p-2',
      topic: "Ohm's Law",
      difficulty: 'Medium',
      question: 'If a potential difference of 24 V produces a current of 3 A, what is the circuit resistance?',
      options: ['8 Ω', '72 Ω', '0.125 Ω', '21 Ω'],
      correctIndex: 0,
      explanation: 'R = V / I = 24 V / 3 A = 8 Ohms. Verified by V = I × R = 3 × 8 = 24 V.',
      commonMistakeCategory: 'formula_misapplication'
    },
    {
      id: 'q-p-3',
      topic: 'Kinetic Energy',
      difficulty: 'Hard',
      question: 'Calculate the kinetic energy of a 2 kg object moving at a velocity of 6 m/s.',
      options: ['36 J', '12 J', '72 J', '18 J'],
      correctIndex: 0,
      explanation: 'KE = 0.5 × m × v² = 0.5 × 2 kg × (6 m/s)² = 36 Joules. Verified.',
      commonMistakeCategory: 'formula_misapplication'
    }
  ],
  Chemistry: [
    {
      id: 'q-c-1',
      topic: 'Chemical Formulae & Balancing',
      difficulty: 'Easy',
      question: 'What is the chemical formula of common table salt?',
      options: ['NaCl', 'KCl', 'CaCO3', 'NaOH'],
      correctIndex: 0,
      explanation: 'Sodium Chloride consists of one sodium cation (Na+) and one chloride anion (Cl-), yielding NaCl.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-c-2',
      topic: 'Molar Mass & Stoichiometry',
      difficulty: 'Medium',
      question: 'What is the approximate molar mass of water (H₂O)?',
      options: ['18.015 g/mol', '16.000 g/mol', '2.016 g/mol', '20.000 g/mol'],
      correctIndex: 0,
      explanation: 'Molar mass = 2 × H (1.008) + 1 × O (15.999) = 2.016 + 15.999 = 18.015 g/mol.',
      commonMistakeCategory: 'calculation_error'
    },
    {
      id: 'q-c-3',
      topic: 'Types of Reactions',
      difficulty: 'Hard',
      question: 'The reaction: CH₄ + 2O₂ → CO₂ + 2H₂O is an example of what type of reaction?',
      options: ['Combustion & Exothermic', 'Combination only', 'Electrolytic Decomposition', 'Endothermic displacement'],
      correctIndex: 0,
      explanation: 'Hydrocarbon burning in presence of oxygen to produce carbon dioxide, water, and heat is a combustion (exothermic) reaction.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    }
  ],
  Biology: [
    {
      id: 'q-b-1',
      topic: 'Cell Biology',
      difficulty: 'Easy',
      question: 'Which organelle is universally known as the powerhouse of the cell?',
      options: ['Mitochondria', 'Golgi Apparatus', 'Endoplasmic Reticulum', 'Lysosome'],
      correctIndex: 0,
      explanation: 'Mitochondria generate ATP (adenosine triphosphate) through cellular respiration, supplying cellular energy.',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-b-2',
      topic: 'Photosynthesis',
      difficulty: 'Medium',
      question: 'What gas is released into the atmosphere as a by-product of photosynthesis?',
      options: ['Oxygen (O₂)', 'Carbon Dioxide (CO₂)', 'Nitrogen (N₂)', 'Methane (CH₄)'],
      correctIndex: 0,
      explanation: 'During the photolysis of water in photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ ↑. Oxygen is released.',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-b-3',
      topic: 'Mendelian Genetics',
      difficulty: 'Hard',
      question: 'In a monohybrid cross between two heterozygous tall pea plants (Tt × Tt), what is the expected phenotypic ratio?',
      options: ['3:1 (Tall : Dwarf)', '1:2:1 (TT : Tt : tt)', '9:3:3:1', '1:1 (Tall : Dwarf)'],
      correctIndex: 0,
      explanation: 'Phenotypic ratio is 3 Tall (TT, Tt, Tt) : 1 Dwarf (tt) = 3:1. The genotypic ratio is 1:2:1.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    }
  ],
  English: [
    {
      id: 'q-e-1',
      topic: 'Parts of Speech',
      difficulty: 'Easy',
      question: 'Identify the adverb in the sentence: "The student solved the equation quickly."',
      options: ['quickly', 'solved', 'equation', 'student'],
      correctIndex: 0,
      explanation: '"Quickly" modifies the verb "solved" indicating the manner of action, making it an adverb.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-e-2',
      topic: 'Voice Transformation',
      difficulty: 'Medium',
      question: 'What is the correct passive voice of: "She sings a song"?',
      options: ['A song is sung by her.', 'A song was sung by her.', 'A song is singing by her.', 'She was sung a song.'],
      correctIndex: 0,
      explanation: 'Simple present active (Subject + V1 + Object) transforms to Object + is/are + V3 + by + agent: "A song is sung by her."',
      commonMistakeCategory: 'formula_misapplication'
    },
    {
      id: 'q-e-3',
      topic: 'Reported Speech',
      difficulty: 'Hard',
      question: 'Convert to indirect speech: He said, "I am studying hard."',
      options: ['He said that he was studying hard.', 'He said that I am studying hard.', 'He said that he is studying hard.', 'He said he had been studying.'],
      correctIndex: 0,
      explanation: 'Present continuous ("am studying") shifts back to past continuous ("was studying") when the reporting verb is in past tense.',
      commonMistakeCategory: 'formula_misapplication'
    }
  ],
  Hindi: [
    {
      id: 'q-h-1',
      topic: 'संधि विच्छेद',
      difficulty: 'Easy',
      question: '"विद्यालय" शब्द का सही संधि विच्छेद क्या है?',
      options: ['विद्या + आलय', 'विद्य + आलय', 'विद्या + लय', 'विद्य + लय'],
      correctIndex: 0,
      explanation: 'विद्या + आलय (आ + आ = आ) यह दीर्घ स्वर संधि का शुद्ध उदाहरण है।',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-h-2',
      topic: 'समास विग्रह',
      difficulty: 'Medium',
      question: '"राजपुत्र" में कौन सा समास है?',
      options: ['तत्पुरुष समास', 'द्वंद्व समास', 'बहुव्रीहि समास', 'अव्ययीभाव समास'],
      correctIndex: 0,
      explanation: 'राजपुत्र का विग्रह है "राजा का पुत्र"। इसमें सम्बन्ध कारक चिह्न "का" का लोप होने के कारण सम्बन्ध तत्पुरुष समास है।',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-h-3',
      topic: 'स्वर संधि भेद',
      difficulty: 'Hard',
      question: '"सूर्योदय" शब्द में कौन सी संधि है?',
      options: ['गुण स्वर संधि (अ + उ = ओ)', 'दीर्घ स्वर संधि', 'यण स्वर संधि', 'अयादि स्वर संधि'],
      correctIndex: 0,
      explanation: 'सूर्य + उदय = सूर्योदय। इसमें अ के बाद उ आने पर "ओ" बन जाता है, जो गुण संधि का नियम है।',
      commonMistakeCategory: 'formula_misapplication'
    }
  ],
  Gujarati: [
    {
      id: 'q-g-1',
      topic: 'સંધિ જોડો / છોડો',
      difficulty: 'Easy',
      question: '"સૂર્યોદય" શબ્દની સાચી સંધિ છૂટી પાડો:',
      options: ['સૂર્ય + ઉદય', 'સૂર્ય + ઓદય', 'સૂર્યો + દય', 'સૂર + ઉદય'],
      correctIndex: 0,
      explanation: 'સૂર્ય + ઉદય (અ + ઉ = ઓ) આ ગુણ સંધિનું ઉદાહરણ છે.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-g-2',
      topic: 'સમાસ ઓળખો',
      difficulty: 'Medium',
      question: '"રામ-લક્ષ્મણ" શબ્દમાં કયો સમાસ છે?',
      options: ['દ્વંદ્વ સમાસ (રામ અને લક્ષ્મણ)', 'તત્પુરુષ સમાસ', 'મધ્યમપદલોપી સમાસ', 'દ્વિગુ સમાસ'],
      correctIndex: 0,
      explanation: 'બંને પદો સમાન મહત્વ ધરાવે છે અને "અને" સંયોજક જોડાયેલું હોવાથી દ્વંદ્વ સમાસ બને છે.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-g-3',
      topic: 'વિદ્યાલય સંધિ',
      difficulty: 'Hard',
      question: '"વિદ્યાલય" કઈ સંધિ છે?',
      options: ['દીર્ઘ સ્વર સંધિ (વિદ્યા + આલય)', 'ગુણ સંધિ', 'વૃદ્ધિ સંધિ', 'વિસર્ગ સંધિ'],
      correctIndex: 0,
      explanation: 'વિદ્યા + આલય (આ + આ = આ) દીર્ઘ સંધિ છે.',
      commonMistakeCategory: 'formula_misapplication'
    }
  ],
  'Social Science': [
    {
      id: 'q-ss-1',
      topic: 'Indian Constitution',
      difficulty: 'Easy',
      question: 'Which Fundamental Right under Article 21 guarantees protection of life and personal liberty?',
      options: ['Protection of Life & Personal Liberty', 'Right to Equality', 'Right to Freedom of Religion', 'Right to Constitutional Remedies'],
      correctIndex: 0,
      explanation: 'Article 21 states that no person shall be deprived of their life or personal liberty except according to procedure established by law.',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-ss-2',
      topic: 'Modern Indian History',
      difficulty: 'Medium',
      question: 'In which year was the historic Dandi Salt March led by Mahatma Gandhi?',
      options: ['1930', '1920', '1942', '1919'],
      correctIndex: 0,
      explanation: 'Mahatma Gandhi started the Dandi Salt March on March 12, 1930 and reached Dandi on April 6, 1930 to initiate the Civil Disobedience Movement.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-ss-3',
      topic: 'Revolt of 1857',
      difficulty: 'Hard',
      question: 'What was the immediate military trigger for the Revolt of 1857 at Meerut?',
      options: ['Introduction of greased cartridges for Enfield rifles', 'Doctrine of Lapse in Jhansi', 'Abolition of Sati regulation', 'Drain of Wealth theory'],
      correctIndex: 0,
      explanation: 'The greased cartridges containing animal fat which soldiers had to bite before loading in the Enfield rifle triggered the Meerut uprising on May 10, 1857.',
      commonMistakeCategory: 'reading_misinterpretation'
    }
  ],
  Computer: [
    {
      id: 'q-cs-1',
      topic: 'Number Systems',
      difficulty: 'Easy',
      question: 'What is the decimal equivalent of binary (1010)₂?',
      options: ['10', '12', '8', '14'],
      correctIndex: 0,
      explanation: '1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10. Independently verified.',
      commonMistakeCategory: 'calculation_error'
    },
    {
      id: 'q-cs-2',
      topic: 'Digital Logic Gates',
      difficulty: 'Medium',
      question: 'Which logic gate produces output 1 (HIGH) only when both inputs are 1?',
      options: ['AND Gate', 'OR Gate', 'XOR Gate', 'NOR Gate'],
      correctIndex: 0,
      explanation: 'An AND gate performs logical conjunction: Y = A · B. The output is 1 only when A=1 and B=1.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-cs-3',
      topic: 'Decimal to Binary',
      difficulty: 'Hard',
      question: 'Convert decimal 25 into binary:',
      options: ['(11001)₂', '(10101)₂', '(11010)₂', '(11101)₂'],
      correctIndex: 0,
      explanation: '25 ÷ 2 = 12 rem 1; 12 ÷ 2 = 6 rem 0; 6 ÷ 2 = 3 rem 0; 3 ÷ 2 = 1 rem 1; 1 ÷ 2 = 0 rem 1. Reading upwards: 11001₂. 16+8+1 = 25.',
      commonMistakeCategory: 'calculation_error'
    }
  ],
  'General Knowledge': [
    {
      id: 'q-gk-1',
      topic: 'Science & World Records',
      difficulty: 'Easy',
      question: 'Who was the first Indian scientist to be awarded the Nobel Prize in Physics?',
      options: ['Sir C.V. Raman (1930)', 'Dr. Homi Bhabha', 'Dr. A.P.J. Abdul Kalam', 'Satyendra Nath Bose'],
      correctIndex: 0,
      explanation: 'Sir C.V. Raman won the Nobel Prize in Physics in 1930 for the discovery of the Raman Effect (scattering of light).',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-gk-2',
      topic: 'Global Institutions',
      difficulty: 'Medium',
      question: 'Where is the official headquarters of the United Nations Organization (UNO) located?',
      options: ['New York City, USA', 'Geneva, Switzerland', 'Paris, France', 'London, UK'],
      correctIndex: 0,
      explanation: 'The official headquarters of the United Nations is situated in Manhattan, New York City.',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-gk-3',
      topic: 'Geography & Oceans',
      difficulty: 'Hard',
      question: 'Which is the deepest oceanic trench on Earth, and in which ocean is it located?',
      options: ['Mariana Trench (Pacific Ocean)', 'Java Trench (Indian Ocean)', 'Puerto Rico Trench (Atlantic Ocean)', 'Eurasian Basin (Arctic Ocean)'],
      correctIndex: 0,
      explanation: 'The Mariana Trench in the western Pacific Ocean reaches a maximum depth of approximately 11,034 meters at the Challenger Deep.',
      commonMistakeCategory: 'reading_misinterpretation'
    }
  ],
  French: [
    {
      id: 'q-fr-1',
      topic: 'Les Salutations et Conjugaison de Base',
      difficulty: 'Easy',
      question: 'Quelle est la forme correcte du verbe "être" avec le pronom "nous"?',
      options: ['nous sommes', 'nous avons', 'nous êtes', 'nous sont'],
      correctIndex: 0,
      explanation: 'La conjugaison au présent du verbe "être" est: je suis, tu es, il/elle est, nous sommes, vous êtes, ils/elles sont.',
      commonMistakeCategory: 'formula_misapplication'
    },
    {
      id: 'q-fr-2',
      topic: 'Passé Composé avec Être',
      difficulty: 'Medium',
      question: 'Choisissez la bonne phrase au passé composé (accord du participe passé):',
      options: ['Elle est allée à la bibliothèque.', 'Elle est allé à la bibliothèque.', 'Elle a allée à la bibliothèque.', 'Elle a allé à la bibliothèque.'],
      correctIndex: 0,
      explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde en genre et en nombre avec le sujet ("Elle" = féminin singulier -> "allée").',
      commonMistakeCategory: 'formula_misapplication'
    },
    {
      id: 'q-fr-3',
      topic: 'Pronoms Compléments (COD & COI)',
      difficulty: 'Hard',
      question: 'Remplacez les mots soulignés: "Je donne le livre à Marie."',
      options: ['Je le lui donne.', 'Je lui le donne.', 'Je la lui donne.', 'Je lui la donne.'],
      correctIndex: 0,
      explanation: 'En français, l\'ordre des pronoms avant le verbe est: le/la/les (COD) suivi de lui/leur (COI). Donc: "Je le lui donne."',
      commonMistakeCategory: 'conceptual_misunderstanding'
    }
  ],
  'Artificial Intelligence': [
    {
      id: 'q-ai-1',
      topic: 'AI Domains & Computer Vision',
      difficulty: 'Easy',
      question: 'Which domain of AI is responsible for enabling machines to understand and process visual data from photos and videos?',
      options: ['Computer Vision (CV)', 'Natural Language Processing (NLP)', 'Reinforcement Learning', 'Symbolic Logic'],
      correctIndex: 0,
      explanation: 'Computer Vision involves acquiring, processing, and analyzing digital images to extract high-dimensional real-world information.',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-ai-2',
      topic: 'Supervised vs Unsupervised Learning',
      difficulty: 'Medium',
      question: 'A machine learning algorithm is trained on a dataset containing labelled photos of handwritten numbers alongside their correct digits. What learning paradigm is this?',
      options: ['Supervised Learning', 'Unsupervised Clustering', 'Self-Supervised Heuristics', 'Zero-Shot Generation'],
      correctIndex: 0,
      explanation: 'Supervised learning uses input data paired with verified target labels (ground truth) to train prediction models.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    },
    {
      id: 'q-ai-3',
      topic: 'Responsible AI & Model Ethics',
      difficulty: 'Hard',
      question: 'What is "algorithmic bias" in machine learning systems, and how does it typically arise?',
      options: ['Systematic deviations reflecting historical bias or unrepresentative sampling in training data', 'A hardware clock cycle jitter in GPU clusters', 'An intentional encryption cipher applied to weights', 'Overfitting strictly caused by zero-gradient descent'],
      correctIndex: 0,
      explanation: 'Algorithmic bias occurs when training data reflects historical prejudices, societal inequalities, or skewed demographic sampling.',
      commonMistakeCategory: 'conceptual_misunderstanding'
    }
  ],
  'Skill Education': [
    {
      id: 'q-sk-1',
      topic: 'Financial Literacy & Savings',
      difficulty: 'Easy',
      question: 'What is the simple interest on a principal amount of ₹5,000 invested at 6% annual rate for 2 years?',
      options: ['₹600', '₹300', '₹1,200', '₹500'],
      correctIndex: 0,
      explanation: 'SI = (P × R × T) / 100 = (5000 × 6 × 2) / 100 = ₹600. Total amount = ₹5,600.',
      commonMistakeCategory: 'calculation_error'
    },
    {
      id: 'q-sk-2',
      topic: 'Cybersecurity & Digital Hygiene',
      difficulty: 'Medium',
      question: 'Which of the following practices is essential for securing student accounts against unauthorized access?',
      options: ['Enabling Multi-Factor Authentication (MFA) and using unique passwords', 'Sharing passwords exclusively with study group peers', 'Using birthdates as PIN codes for easy recall', 'Disabling browser security patches to boost speed'],
      correctIndex: 0,
      explanation: 'Multi-factor authentication (MFA) combined with unique, robust passphrases prevents unauthorized credential reuse and credential stuffing.',
      commonMistakeCategory: 'reading_misinterpretation'
    },
    {
      id: 'q-sk-3',
      topic: 'Design Thinking & Problem Solving',
      difficulty: 'Hard',
      question: 'What is the correct sequence of stages in the standard Stanford d.school Design Thinking framework?',
      options: ['Empathize → Define → Ideate → Prototype → Test', 'Ideate → Prototype → Test → Empathize → Define', 'Define → Prototype → Ideate → Test → Empathize', 'Prototype → Test → Define → Ideate → Empathize'],
      correctIndex: 0,
      explanation: 'Design Thinking begins with student/user Empathy, defining the core problem statement, ideating creative solutions, building rapid prototypes, and testing.',
      commonMistakeCategory: 'reading_misinterpretation'
    }
  ]
};

export default function AdaptivePracticeView({
  currentSubject = 'Mathematics',
  currentGrade = 'Grade 8',
  curriculumBoard = 'cbse',
  userId = 'student-1',
  initialTopic
}: AdaptivePracticeViewProps) {
  const [activeSubject, setActiveSubject] = useState(currentSubject);
  const [difficultyTier, setDifficultyTier] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed Test'>('Medium');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [weakTopicsList, setWeakTopicsList] = useState<string[]>([]);

  const PRACTICE_SUBJECTS = [
    { name: 'Mathematics', icon: '📐' },
    { name: 'Science', icon: '🔬' },
    { name: 'Physics', icon: '⚛️' },
    { name: 'Chemistry', icon: '🧪' },
    { name: 'Biology', icon: '🧬' },
    { name: 'Social Science', icon: '🌍' },
    { name: 'English', icon: '🇬🇧' },
    { name: 'Hindi', icon: '🇮🇳' },
    { name: 'Gujarati', icon: '🦁' },
    { name: 'French', icon: '🇫🇷' },
    { name: 'Computer', icon: '💻' },
    { name: 'Artificial Intelligence', icon: '🤖' },
    { name: 'General Knowledge', icon: '🧠' },
    { name: 'Skill Education', icon: '🎨' }
  ];

  // Load weak topics from student memory
  useEffect(() => {
    fetch('/api/student/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile?.weakTopics) {
          setWeakTopicsList(data.profile.weakTopics);
        }
      })
      .catch(() => {});
  }, [userId]);

  // Load and adapt questions based on difficulty & weak topics
  useEffect(() => {
    const rawBank = QUESTION_BANK[activeSubject] || QUESTION_BANK['Mathematics'];
    let filtered = [...rawBank];

    if (difficultyTier !== 'Mixed Test') {
      filtered = rawBank.filter(q => q.difficulty === difficultyTier);
      if (filtered.length === 0) filtered = rawBank;
    }

    // Prioritize weak topics if student has mistakes in them
    if (weakTopicsList.length > 0) {
      filtered.sort((a, b) => {
        const aWeak = weakTopicsList.some(w => a.topic.toLowerCase().includes(w.toLowerCase()));
        const bWeak = weakTopicsList.some(w => b.topic.toLowerCase().includes(w.toLowerCase()));
        if (aWeak && !bWeak) return -1;
        if (!aWeak && bWeak) return 1;
        return 0;
      });
    }

    setQuestions(filtered);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setTestCompleted(false);
    setTimerSeconds(0);
  }, [activeSubject, difficultyTier, weakTopicsList]);

  // Timer
  useEffect(() => {
    if (testCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [testCompleted]);

  const currentQ = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !currentQ) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
    }

    // Record into student learning memory on backend
    try {
      await fetch('/api/student/record-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject: currentSubject,
          topic: currentQ.topic,
          question: currentQ.question,
          studentAnswer: currentQ.options[selectedOption],
          correctAnswer: currentQ.options[currentQ.correctIndex],
          isCorrect,
          mistakeCategory: isCorrect ? undefined : currentQ.commonMistakeCategory,
          explanation: currentQ.explanation
        })
      });
    } catch (e) {
      console.warn('Failed to record practice attempt:', e);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setTestCompleted(true);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <NeoNovaLogo size={40} glow className="shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Personalized Adaptive Review Engine
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                {curriculumBoard}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Difficulty and question selection dynamically adjust based on your previous errors
            </p>
          </div>
        </div>

        {/* Difficulty Selector Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {(['Easy', 'Medium', 'Hard', 'Mixed Test'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setDifficultyTier(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                difficultyTier === tier
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {PRACTICE_SUBJECTS.map(subj => (
          <button
            key={subj.name}
            type="button"
            onClick={() => setActiveSubject(subj.name)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubject === subj.name
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{subj.icon}</span>
            <span>{subj.name}</span>
          </button>
        ))}
      </div>

      {/* Weak Topics Notice if Active */}
      {weakTopicsList.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-indigo-600" />
            <span>Targeting your registered weak topics: <strong>{weakTopicsList.join(', ')}</strong></span>
          </div>
          <span className="text-[10px] font-mono text-indigo-700 font-bold">Adaptive Mode ON</span>
        </div>
      )}

      {/* Practice Question Card */}
      {!testCompleted && currentQ ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          
          {/* Progress & Timer Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                {currentQ.difficulty}
              </span>
              <span className="text-slate-500 font-medium hidden sm:inline">
                {currentQ.topic}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              <Clock size={13} className="text-indigo-600" />
              <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let optionClass = 'border-slate-200 hover:border-indigo-300 bg-white text-slate-800';

              if (isAnswerSubmitted) {
                if (idx === currentQ.correctIndex) {
                  optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                } else if (isSelected) {
                  optionClass = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                } else {
                  optionClass = 'border-slate-200 opacity-60 bg-white';
                }
              } else if (isSelected) {
                optionClass = 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold shadow-xs';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswerSubmitted && setSelectedOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optionClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswerSubmitted && idx === currentQ.correctIndex && (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && idx !== currentQ.correctIndex && (
                    <XCircle size={18} className="text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Verification & Explanation Feedback (After submitting) */}
          {isAnswerSubmitted && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
              selectedOption === currentQ.correctIndex
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {selectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Correct! Verified against {curriculumBoard.toUpperCase()} syllabus.</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-rose-600" />
                    <span>Incorrect. Recorded to Mistake History for targeted review.</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-mono">
              Current Score: {score}/{currentIndex + (isAnswerSubmitted ? 1 : 0)}
            </span>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

        </div>
      ) : testCompleted ? (
        /* Results Card */
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-center space-y-5 animate-in zoom-in-95">
          <Award size={48} className="mx-auto text-indigo-600" />
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Adaptive Practice Complete</h2>
            <p className="text-xs text-slate-500 mt-1">
              All results have been recorded in your long-term student memory profile
            </p>
          </div>

          <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
              <span className="text-xl font-black text-indigo-600 font-mono">
                {Math.round((score / questions.length) * 100)}%
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Score</span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {score} / {questions.length}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Time</span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedOption(null);
                setIsAnswerSubmitted(false);
                setScore(0);
                setTestCompleted(false);
                setTimerSeconds(0);
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Practice Again
            </button>
          </div>
        </div>
      ) : null}

    </div>
  );
}
