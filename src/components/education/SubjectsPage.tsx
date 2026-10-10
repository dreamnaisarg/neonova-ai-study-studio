import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Play, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Clock,
  Award
} from 'lucide-react';
import { SUBJECTS } from '../../types';

interface ChapterTopic {
  id: string;
  number: string;
  title: string;
  completed: boolean;
  duration: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  topicsCount: number;
  completedTopicsCount: number;
  topics: ChapterTopic[];
}

interface SubjectDetail {
  id: string;
  name: string;
  icon: string;
  currentChapterTitle: string;
  progressPercentage: number;
  chapters: Chapter[];
}

interface SubjectsPageProps {
  currentGrade: string;
  onAskAIWithContext: (subject: string, topic: string) => void;
  onLaunchPracticeQuiz: (subject: string, topic?: string) => void;
  onOpenNotes: (subject: string) => void;
  onLaunchStageSystem?: (subject: string, topic?: string) => void;
}

const CURRICULUM_DATA: Record<string, SubjectDetail> = {
  'Mathematics': {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    currentChapterTitle: 'Chapter 3: Fractions & Decimals',
    progressPercentage: 68,
    chapters: [
      {
        id: 'math-ch1',
        number: 1,
        title: 'Number Systems & Integers',
        description: 'Properties of positive and negative numbers, absolute value, and integer operations.',
        topicsCount: 4,
        completedTopicsCount: 4,
        topics: [
          { id: '1.1', number: '1.1', title: 'Integers on the Number Line', completed: true, duration: '12 min' },
          { id: '1.2', number: '1.2', title: 'Addition & Subtraction Rules', completed: true, duration: '15 min' },
          { id: '1.3', number: '1.3', title: 'Multiplication & Division of Integers', completed: true, duration: '18 min' },
          { id: '1.4', number: '1.4', title: 'Real-life Integer Applications', completed: true, duration: '10 min' }
        ]
      },
      {
        id: 'math-ch2',
        number: 2,
        title: 'Linear Equations in One Variable',
        description: 'Solving simple balanced linear equations and word problems.',
        topicsCount: 4,
        completedTopicsCount: 4,
        topics: [
          { id: '2.1', number: '2.1', title: 'Algebraic Expressions Review', completed: true, duration: '14 min' },
          { id: '2.2', number: '2.2', title: 'Balancing Equations (One-Step)', completed: true, duration: '16 min' },
          { id: '2.3', number: '2.3', title: 'Two-Step Algebraic Equations', completed: true, duration: '20 min' },
          { id: '2.4', number: '2.4', title: 'Word Problem Translation', completed: true, duration: '15 min' }
        ]
      },
      {
        id: 'math-ch3',
        number: 3,
        title: 'Fractions & Decimals',
        description: 'Understanding fraction equivalence, decimal placement, and arithmetic operations.',
        topicsCount: 4,
        completedTopicsCount: 2,
        topics: [
          { id: '3.1', number: '3.1', title: 'Introduction to Fraction Parts', completed: true, duration: '10 min' },
          { id: '3.2', number: '3.2', title: 'Equivalent Fractions & Simplification', completed: true, duration: '15 min' },
          { id: '3.3', number: '3.3', title: 'Comparing & Ordering Fractions', completed: false, duration: '18 min' },
          { id: '3.4', number: '3.4', title: 'Operations: Adding & Multiplying', completed: false, duration: '22 min' }
        ]
      },
      {
        id: 'math-ch4',
        number: 4,
        title: 'Geometry & Angles',
        description: 'Parallel lines, transversal cuts, complementary and supplementary angles.',
        topicsCount: 3,
        completedTopicsCount: 0,
        topics: [
          { id: '4.1', number: '4.1', title: 'Points, Lines & Rays', completed: false, duration: '12 min' },
          { id: '4.2', number: '4.2', title: 'Angle Relationships & Transversals', completed: false, duration: '20 min' },
          { id: '4.3', number: '4.3', title: 'Triangle Angle Sum Property', completed: false, duration: '16 min' }
        ]
      }
    ]
  },
  'General Science': {
    id: 'science',
    name: 'General Science',
    icon: '🔬',
    currentChapterTitle: 'Chapter 10: Light & Reflection',
    progressPercentage: 52,
    chapters: [
      {
        id: 'sci-ch1',
        number: 1,
        title: 'Nutrition in Plants & Photosynthesis',
        description: 'Autotrophic mode of nutrition, chlorophyll absorption, stomata, and glucose synthesis.',
        topicsCount: 3,
        completedTopicsCount: 3,
        topics: [
          { id: '1.1', number: '1.1', title: 'Autotrophic vs Heterotrophic', completed: true, duration: '14 min' },
          { id: '1.2', number: '1.2', title: 'The Chloroplast & Sunlight Absorption', completed: true, duration: '18 min' },
          { id: '1.3', number: '1.3', title: 'Stomatal Gas Exchange', completed: true, duration: '15 min' }
        ]
      },
      {
        id: 'sci-ch10',
        number: 10,
        title: 'Light & Reflection',
        description: 'Ray optics, reflection laws, plane mirrors, concave & convex lenses, and spectrum dispersion.',
        topicsCount: 4,
        completedTopicsCount: 2,
        topics: [
          { id: '10.1', number: '10.1', title: 'Rectilinear Propagation of Light', completed: true, duration: '12 min' },
          { id: '10.2', number: '10.2', title: 'Laws of Reflection & Plane Mirrors', completed: true, duration: '16 min' },
          { id: '10.3', number: '10.3', title: 'Spherical Mirrors (Concave & Convex)', completed: false, duration: '22 min' },
          { id: '10.4', number: '10.4', title: 'Refraction & White Light Dispersion', completed: false, duration: '20 min' }
        ]
      }
    ]
  },
  'English Literature': {
    id: 'english',
    name: 'English Literature',
    icon: '📚',
    currentChapterTitle: 'Chapter 5: Clauses & Grammar',
    progressPercentage: 74,
    chapters: [
      {
        id: 'eng-ch1',
        number: 1,
        title: 'Reading Comprehension & Analysis',
        description: 'Inferring author intent, identifying central themes, and tone analysis.',
        topicsCount: 3,
        completedTopicsCount: 3,
        topics: [
          { id: '1.1', number: '1.1', title: 'Context Clues & Vocabulary', completed: true, duration: '15 min' },
          { id: '1.2', number: '1.2', title: 'Identifying Main Ideas & Supporting Details', completed: true, duration: '18 min' },
          { id: '1.3', number: '1.3', title: 'Figurative Language (Metaphors, Similes)', completed: true, duration: '16 min' }
        ]
      },
      {
        id: 'eng-ch5',
        number: 5,
        title: 'Clauses & Sentence Structure',
        description: 'Independent and dependent clauses, relative pronouns, and avoiding run-on sentences.',
        topicsCount: 4,
        completedTopicsCount: 3,
        topics: [
          { id: '5.1', number: '5.1', title: 'Independent vs Dependent Clauses', completed: true, duration: '12 min' },
          { id: '5.2', number: '5.2', title: 'Adverbial & Adjectival Clauses', completed: true, duration: '15 min' },
          { id: '5.3', number: '5.3', title: 'Compound-Complex Sentences', completed: true, duration: '20 min' },
          { id: '5.4', number: '5.4', title: 'Punctuation: Semicolons & Commas', completed: false, duration: '14 min' }
        ]
      }
    ]
  },
  'Physics': {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    currentChapterTitle: 'Chapter 2: Electricity & Circuits',
    progressPercentage: 72,
    chapters: [
      {
        id: 'phy-ch1',
        number: 1,
        title: 'Motion & Kinematics',
        description: 'Equations of motion, velocity-time graphs, and uniform acceleration.',
        topicsCount: 3,
        completedTopicsCount: 3,
        topics: [
          { id: 'p1.1', number: '1.1', title: 'Speed vs Velocity & Acceleration', completed: true, duration: '15 min' },
          { id: 'p1.2', number: '1.2', title: 'Kinematic Equations: v = u + at, s = ut + 0.5at²', completed: true, duration: '20 min' },
          { id: 'p1.3', number: '1.3', title: 'Newton’s Laws of Motion (F = ma)', completed: true, duration: '18 min' }
        ]
      },
      {
        id: 'phy-ch2',
        number: 2,
        title: 'Electricity & Ohm’s Law',
        description: 'Electric potential, Ohm’s law, series and parallel resistor circuits.',
        topicsCount: 3,
        completedTopicsCount: 2,
        topics: [
          { id: 'p2.1', number: '2.1', title: 'Ohm’s Law Verification (V = IR)', completed: true, duration: '14 min' },
          { id: 'p2.2', number: '2.2', title: 'Series and Parallel Combinations', completed: true, duration: '16 min' },
          { id: 'p2.3', number: '2.3', title: 'Electric Power and Joule’s Heating (H = I²Rt)', completed: false, duration: '22 min' }
        ]
      }
    ]
  },
  'Chemistry': {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪',
    currentChapterTitle: 'Chapter 1: Chemical Reactions & Balancing',
    progressPercentage: 65,
    chapters: [
      {
        id: 'chem-ch1',
        number: 1,
        title: 'Chemical Reactions & Balancing',
        description: 'Writing chemical equations, balancing mass, and identifying types of reactions.',
        topicsCount: 3,
        completedTopicsCount: 2,
        topics: [
          { id: 'c1.1', number: '1.1', title: 'Writing and Balancing Chemical Equations', completed: true, duration: '16 min' },
          { id: 'c1.2', number: '1.2', title: 'Types of Reactions (Combination, Decomposition, Redox)', completed: true, duration: '18 min' },
          { id: 'c1.3', number: '1.3', title: 'Corrosion and Rancidity Prevention', completed: false, duration: '12 min' }
        ]
      },
      {
        id: 'chem-ch2',
        number: 2,
        title: 'Molar Mass & Stoichiometry',
        description: 'Determining atomic weights, mole concept, and calculating reactant ratios.',
        topicsCount: 2,
        completedTopicsCount: 1,
        topics: [
          { id: 'c2.1', number: '2.1', title: 'Molar Mass Determination of Common Compounds', completed: true, duration: '15 min' },
          { id: 'c2.2', number: '2.2', title: 'Stoichiometric Calculations & Limiting Reagents', completed: false, duration: '20 min' }
        ]
      }
    ]
  },
  'Biology': {
    id: 'biology',
    name: 'Biology',
    icon: '🧬',
    currentChapterTitle: 'Chapter 2: Heredity & Genetics',
    progressPercentage: 70,
    chapters: [
      {
        id: 'bio-ch1',
        number: 1,
        title: 'Cellular Structures & Life Processes',
        description: 'Plant and animal cell organelles, photosynthesis, and respiration.',
        topicsCount: 3,
        completedTopicsCount: 3,
        topics: [
          { id: 'b1.1', number: '1.1', title: 'Plant vs Animal Cell Organelle Functions', completed: true, duration: '14 min' },
          { id: 'b1.2', number: '1.2', title: 'Photosynthesis Biochemical Mechanism', completed: true, duration: '18 min' },
          { id: 'b1.3', number: '1.3', title: 'Cellular Respiration and ATP Production', completed: true, duration: '16 min' }
        ]
      },
      {
        id: 'bio-ch2',
        number: 2,
        title: 'Heredity & Mendelian Genetics',
        description: 'Monohybrid and dihybrid crosses, Punnett square ratios, and genetic inheritance.',
        topicsCount: 2,
        completedTopicsCount: 1,
        topics: [
          { id: 'b2.1', number: '2.1', title: 'Mendel’s Laws of Inheritance & Monohybrid Cross (3:1)', completed: true, duration: '20 min' },
          { id: 'b2.2', number: '2.2', title: 'Dihybrid Cross (9:3:3:1) & Sex Determination', completed: false, duration: '18 min' }
        ]
      }
    ]
  },
  'Hindi': {
    id: 'hindi',
    name: 'Hindi',
    icon: '🇮🇳',
    currentChapterTitle: 'पाठ २: व्याकरण भारती - संधि एवं समास',
    progressPercentage: 80,
    chapters: [
      {
        id: 'hin-ch1',
        number: 1,
        title: 'हिंदी व्याकरण: स्वर संधि एवं व्यंजन संधि',
        description: 'दीर्घ, गुण, वृद्धि, यण एवं अयादि स्वर संधि के सूत्र एवं विच्छेद नियम।',
        topicsCount: 3,
        completedTopicsCount: 3,
        topics: [
          { id: 'h1.1', number: '1.1', title: 'दीर्घ एवं गुण स्वर संधि विच्छेद', completed: true, duration: '15 min' },
          { id: 'h1.2', number: '1.2', title: 'यण एवं अयादि स्वर संधि नियम', completed: true, duration: '18 min' },
          { id: 'h1.3', number: '1.3', title: 'व्यंजन एवं विसर्ग संधि उदाहरण', completed: true, duration: '16 min' }
        ]
      },
      {
        id: 'hin-ch2',
        number: 2,
        title: 'समास परिचय एवं विग्रह',
        description: 'तत्पुरुष, द्वंद्व, द्विगु, बहुव्रीहि, कर्मधारय एवं अव्ययीभाव समास।',
        topicsCount: 2,
        completedTopicsCount: 1,
        topics: [
          { id: 'h2.1', number: '2.1', title: 'तत्पुरुष एवं द्वंद्व समास विग्रह', completed: true, duration: '16 min' },
          { id: 'h2.2', number: '2.2', title: 'कर्मधारय एवं बहुव्रीहि समास भेद', completed: false, duration: '14 min' }
        ]
      }
    ]
  },
  'Gujarati': {
    id: 'gujarati',
    name: 'Gujarati',
    icon: '📖',
    currentChapterTitle: 'પ્રકરણ ૧: વ્યાકરણ - સંધિ અને સમાસ',
    progressPercentage: 75,
    chapters: [
      {
        id: 'guj-ch1',
        number: 1,
        title: 'ગુજરાતી વ્યાકરણ: સંધિ નિયમો',
        description: 'સ્વર સંધિ, વ્યંજન સંધિ અને જોડણી શુદ્ધિના નિયમો.',
        topicsCount: 3,
        completedTopicsCount: 2,
        topics: [
          { id: 'g1.1', number: '1.1', title: 'સ્વર સંધિ જોડો અને છોડો', completed: true, duration: '14 min' },
          { id: 'g1.2', number: '1.2', title: 'ગુજરાતી જોડણીના મૂળભૂત નિયમો', completed: true, duration: '16 min' },
          { id: 'g1.3', number: '1.3', title: 'સમાસ પરિચય (દ્વંદ્વ અને તત્પુરુષ)', completed: false, duration: '18 min' }
        ]
      }
    ]
  },
  'Social Science': {
    id: 'social',
    name: 'Social Science',
    icon: '🌍',
    currentChapterTitle: 'Chapter 2: The Indian Constitution & Fundamental Rights',
    progressPercentage: 66,
    chapters: [
      {
        id: 'soc-ch1',
        number: 1,
        title: 'History: The Indian Freedom Struggle',
        description: 'From the First War of Independence in 1857 to the Independence of 1947.',
        topicsCount: 3,
        completedTopicsCount: 2,
        topics: [
          { id: 's1.1', number: '1.1', title: 'The Revolt of 1857: Causes and Aftermath', completed: true, duration: '18 min' },
          { id: 's1.2', number: '1.2', title: 'Non-Cooperation Movement & Dandi Salt March (1930)', completed: true, duration: '20 min' },
          { id: 's1.3', number: '1.3', title: 'Quit India Movement (1942) & Independence Act 1947', completed: false, duration: '16 min' }
        ]
      },
      {
        id: 'soc-ch2',
        number: 2,
        title: 'Civics: The Constitution & Fundamental Rights',
        description: 'Articles 14 to 32, Directive Principles, and Parliamentary democracy.',
        topicsCount: 2,
        completedTopicsCount: 1,
        topics: [
          { id: 's2.1', number: '2.1', title: 'Fundamental Rights (Articles 14-32)', completed: true, duration: '15 min' },
          { id: 's2.2', number: '2.2', title: 'The Structure of Parliament (Lok Sabha & Rajya Sabha)', completed: false, duration: '18 min' }
        ]
      }
    ]
  },
  'Computer': {
    id: 'computer',
    name: 'Computer',
    icon: '💻',
    currentChapterTitle: 'Chapter 1: Number Systems & Logic Gates',
    progressPercentage: 78,
    chapters: [
      {
        id: 'cs-ch1',
        number: 1,
        title: 'Number Systems & Binary Conversions',
        description: 'Binary, decimal, octal, and hexadecimal conversions with mathematical step proof.',
        topicsCount: 3,
        completedTopicsCount: 3,
        topics: [
          { id: 'cs1.1', number: '1.1', title: 'Decimal to Binary Successive Division', completed: true, duration: '16 min' },
          { id: 'cs1.2', number: '1.2', title: 'Binary to Decimal Positional Expansion', completed: true, duration: '14 min' },
          { id: 'cs1.3', number: '1.3', title: 'Hexadecimal & Octal Conversions', completed: true, duration: '18 min' }
        ]
      },
      {
        id: 'cs-ch2',
        number: 2,
        title: 'Digital Logic Gates & Boolean Algebra',
        description: 'AND, OR, NOT, NAND, NOR, and XOR truth tables and logic circuit design.',
        topicsCount: 2,
        completedTopicsCount: 1,
        topics: [
          { id: 'cs2.1', number: '2.1', title: 'Basic Logic Gates (AND, OR, NOT) Truth Tables', completed: true, duration: '15 min' },
          { id: 'cs2.2', number: '2.2', title: 'Universal Gates (NAND, NOR) & De Morgan’s Laws', completed: false, duration: '20 min' }
        ]
      }
    ]
  },
  'General Knowledge (GK)': {
    id: 'gk',
    name: 'General Knowledge (GK)',
    icon: '💡',
    currentChapterTitle: 'Chapter 1: Indian Heritage & Scientific Discoveries',
    progressPercentage: 82,
    chapters: [
      {
        id: 'gk-ch1',
        number: 1,
        title: 'Indian Heritage & Scientific Milestones',
        description: 'Nobel laureates, national emblems, ISRO space missions, and historical leaders.',
        topicsCount: 2,
        completedTopicsCount: 2,
        topics: [
          { id: 'gk1.1', number: '1.1', title: 'National Emblems & Constitutional Symbols', completed: true, duration: '10 min' },
          { id: 'gk1.2', number: '1.2', title: 'Indian Nobel Laureates & ISRO Space Achievements', completed: true, duration: '12 min' }
        ]
      }
    ]
  }
};

export default function SubjectsPage({
  currentGrade,
  onAskAIWithContext,
  onLaunchPracticeQuiz,
  onOpenNotes,
  onLaunchStageSystem
}: SubjectsPageProps) {
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [subjectActiveTab, setSubjectActiveTab] = useState<'chapters' | 'notes' | 'practice' | 'quiz' | 'ask_ai'>('chapters');

  const activeSubjectDetail: SubjectDetail = selectedSubjectName && CURRICULUM_DATA[selectedSubjectName]
    ? CURRICULUM_DATA[selectedSubjectName]
    : {
        id: selectedSubjectName ? selectedSubjectName.toLowerCase() : 'custom',
        name: selectedSubjectName || 'Mathematics',
        icon: '📐',
        currentChapterTitle: 'Chapter 1: Foundational Principles',
        progressPercentage: 50,
        chapters: [
          {
            id: 'gen-ch1',
            number: 1,
            title: 'Foundational Principles',
            description: 'Core concepts and foundational theories for this grade curriculum.',
            topicsCount: 3,
            completedTopicsCount: 2,
            topics: [
              { id: '1.1', number: '1.1', title: 'Introduction & Scope', completed: true, duration: '10 min' },
              { id: '1.2', number: '1.2', title: 'Key Definitions & Rules', completed: true, duration: '15 min' },
              { id: '1.3', number: '1.3', title: 'Core Applications', completed: false, duration: '18 min' }
            ]
          }
        ]
      };

  const activeChapter = activeSubjectDetail.chapters.find(c => c.id === selectedChapterId) || activeSubjectDetail.chapters[0];

  if (selectedSubjectName) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedSubjectName(null);
              setSelectedChapterId(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to All Subjects</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-xs font-semibold text-slate-800">{activeSubjectDetail.name}</span>
          <span className="text-slate-400">/</span>
          <span className="text-xs text-slate-500">{currentGrade}</span>
        </div>

        {/* Subject Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl select-none">
                {activeSubjectDetail.icon}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeSubjectDetail.name}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentGrade} Curriculum • {activeSubjectDetail.chapters.length} Chapters
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Subject Progress</span>
                <span className="font-bold text-slate-900 font-mono">{activeSubjectDetail.progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${activeSubjectDetail.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Subject Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
            <button
              onClick={() => setSubjectActiveTab('chapters')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                subjectActiveTab === 'chapters'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Chapters & Topics
            </button>
            <button
              onClick={() => {
                setSubjectActiveTab('notes');
                onOpenNotes(activeSubjectDetail.name);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                subjectActiveTab === 'notes'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Notes & Summaries
            </button>
            <button
              onClick={() => {
                setSubjectActiveTab('practice');
                onLaunchPracticeQuiz(activeSubjectDetail.name, activeChapter.title);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                subjectActiveTab === 'practice'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Practice & Questions
            </button>
            <button
              onClick={() => {
                setSubjectActiveTab('quiz');
                onLaunchPracticeQuiz(activeSubjectDetail.name, activeChapter.title);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                subjectActiveTab === 'quiz'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Chapter Quiz
            </button>
            {onLaunchStageSystem && (
              <button
                onClick={() => onLaunchStageSystem(activeSubjectDetail.name, activeChapter.title)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 shadow-2xs"
              >
                <Award size={13} className="text-emerald-600" />
                <span>4-Stage Testing</span>
              </button>
            )}
            <button
              onClick={() => {
                setSubjectActiveTab('ask_ai');
                onAskAIWithContext(activeSubjectDetail.name, activeChapter.title);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                subjectActiveTab === 'ask_ai'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Ask NeoNova
            </button>
          </div>
        </div>

        {/* 2-Column Chapter & Topic Explorer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chapter Selector Column */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Chapters
            </h3>
            <div className="space-y-2">
              {activeSubjectDetail.chapters.map((ch) => {
                const isSelected = ch.id === activeChapter.id;
                const percent = Math.round((ch.completedTopicsCount / ch.topicsCount) * 100);
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">Chapter {ch.number}</span>
                      <span className="text-[11px] font-mono text-slate-500">{percent}%</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-2">
                      {ch.title}
                    </h4>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chapter Details & Topics */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-indigo-600 mb-0.5">
                    Chapter {activeChapter.number}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeChapter.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLaunchPracticeQuiz(activeSubjectDetail.name, activeChapter.title)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Play size={13} />
                    <span>Practice Quiz</span>
                  </button>
                  <button
                    onClick={() => onAskAIWithContext(activeSubjectDetail.name, activeChapter.title)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <HelpCircle size={13} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeChapter.description}
              </p>

              {/* Topics List */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-slate-700">
                  Chapter Topics ({activeChapter.topics.length})
                </h4>
                <div className="space-y-2">
                  {activeChapter.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {topic.completed ? (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-slate-400 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            {topic.number} {topic.title}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <Clock size={11} />
                            <span>{topic.duration}</span>
                            <span>•</span>
                            <span>{topic.completed ? 'Completed' : 'Ready to learn'}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAskAIWithContext(activeSubjectDetail.name, `${activeChapter.title}: ${topic.title}`)}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Learn Topic
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. All Subjects Grid View
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Subjects
        </h1>
        <p className="text-xs text-slate-500">
          Enrolled academic subjects for {currentGrade}. Select any subject to explore chapters, notes, and quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {SUBJECTS.map((sub) => {
          const detail = CURRICULUM_DATA[sub.name] || {
            currentChapterTitle: 'Chapter 1: Foundations',
            progressPercentage: 45
          };
          return (
            <div
              key={sub.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl select-none">
                    {sub.icon}
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-600">
                    {detail.progressPercentage}%
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                  {detail.currentChapterTitle}
                </p>
              </div>

              <div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3.5">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${detail.progressPercentage}%` }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectName(sub.name)}
                    className="flex-1 py-2 px-3 bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Chapters</span>
                    <ArrowRight size={13} />
                  </button>

                  {onLaunchStageSystem && (
                    <button
                      type="button"
                      onClick={() => onLaunchStageSystem(sub.name)}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Launch 4-Stage Assessment"
                    >
                      <Award size={13} className="text-emerald-600" />
                      <span>4-Stage</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
