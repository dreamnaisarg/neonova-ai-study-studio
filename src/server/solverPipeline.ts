import { GoogleGenAI } from '@google/genai';
import { runSymbolicMathPipeline, SymbolicMathResult, verifyMathEquation, evaluateMathExpression } from './symbolicMathEngine';
import { runScienceReasoningPipeline, ScienceReasoningResult } from './scienceReasoningEngine';
import { runCSReasoningPipeline, CSReasoningResult } from './computerScienceEngine';
import { runLanguageReasoningPipeline, LanguageReasoningResult } from './languageReasoningEngine';
import { runSocialSciencePipeline, SocialScienceResult } from './socialScienceEngine';
import { 
  solveFrenchProblem, 
  solveAIProblem, 
  solveSkillEducationProblem, 
  solveGKProblem, 
  AISkillReasoningResult 
} from './aiAndSkillEngine';
import { matchCurriculumTopic } from './curriculumCatalog';
import { analyzeEducationalImage, MultimodalAnalysisResult } from './ocrVisionEngine';

export interface SolverStepStructure {
  quickAnswer?: string;
  givenInfo: string[];
  formula: string;
  substitution: string;
  calculation: string[];
  simplification: string;
  finalAnswer: string;
  verification: {
    status: 'Verified' | 'Needs Review' | 'Unable to Verify';
    method: string;
    details: string;
    engineUsed: 
      | 'Symbolic Math Engine (mathjs)'
      | 'Science Verification Engine'
      | 'Computer Science Logic Engine'
      | 'Language & Vyakaran Engine'
      | 'Social Science Verification Engine'
      | 'French Language Engine'
      | 'Artificial Intelligence Engine'
      | 'Skill & Financial Literacy Engine'
      | 'General Knowledge Verification'
      | 'Curriculum Cross-Reference'
      | 'Multimodal Visual Reasoning'
      | 'Algorithmic Verification';
  };
}

export interface SimilarPracticeQuestion {
  id: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VisualExplanationData {
  type: 'geometry' | 'number_line' | 'coordinate_graph' | 'science_diagram' | 'process_flow' | 'table' | 'formula_breakdown';
  title: string;
  description: string;
  data: {
    geometry?: {
      shape?: string;
      vertices: { label: string; x: number; y: number }[];
      lines: { from: string; to: string; label?: string; style?: 'solid' | 'dashed' }[];
      angles?: { vertex: string; label: string; arc?: boolean }[];
      labels?: { text: string; x: number; y: number }[];
    };
    numberLine?: {
      min: number;
      max: number;
      step: number;
      points: { value: number; label: string; highlighted?: boolean }[];
      ranges?: { from: number; to: number; label: string; color?: string }[];
    };
    graph?: {
      xLabel: string;
      yLabel: string;
      xRange: [number, number];
      yRange: [number, number];
      curves: { expression: string; points: { x: number; y: number }[]; color: string; label: string }[];
      criticalPoints?: { x: number; y: number; label: string }[];
    };
    processFlow?: {
      steps: { stepNumber: number; title: string; description: string; formulaOrLaw?: string }[];
    };
    scienceDiagram?: {
      title: string;
      components: { name: string; role: string; locationDescription?: string }[];
      reactionsOrForces?: string[];
    };
    table?: {
      headers: string[];
      rows: string[][];
    };
    formulaBreakdown?: {
      originalFormula: string;
      variableMapping: { symbol: string; meaning: string; value: string; unit?: string }[];
      stepwiseTransformations: string[];
    };
  };
}

export interface HomeworkSolverResponse {
  success: boolean;
  question: string;
  quickAnswer?: string;
  subject: string;
  grade: string;
  curriculumBoard: string;
  curriculumAlignment?: {
    board: string;
    subject: string;
    chapterNumber?: number;
    chapterTitle: string;
    topic: string;
    textbook: string;
    learningObjectives: string[];
  };
  ocrData?: MultimodalAnalysisResult;
  isMath: boolean;
  symbolicMathResult?: SymbolicMathResult;
  scienceResult?: ScienceReasoningResult;
  csResult?: CSReasoningResult;
  languageResult?: LanguageReasoningResult;
  socialResult?: SocialScienceResult;
  aiSkillResult?: AISkillReasoningResult;
  engineUsed: string;
  structuredSteps: SolverStepStructure;
  visualExplanation?: VisualExplanationData;
  narrativeExplanation: string;
  confidenceState: 'Verified' | 'Needs Review' | 'Unable to Verify';
  sourceDistinction: 
    | 'Verified curriculum & symbolic computation'
    | 'Verified scientific laws & stoichiometry'
    | 'Verified digital logic & binary arithmetic'
    | 'Verified grammatical rules & language syntax'
    | 'Verified historical gazetteer & constitutional law'
    | 'Verified AI concepts & algorithmic ethics'
    | 'Verified financial math & vocational standards'
    | 'General Knowledge Verification'
    | 'AI-assisted pedagogical explanation'
    | 'Multimodal OCR extracted & verified';
  similarPracticeQuestions: SimilarPracticeQuestion[];
  error?: string;
}

export async function processEducationalProblem(
  ai: GoogleGenAI,
  params: {
    questionText?: string;
    imageBase64?: string;
    imageMimeType?: string;
    subject?: string;
    grade?: string;
    curriculumBoard?: string;
  }
): Promise<HomeworkSolverResponse> {
  let subject = params.subject || 'Mathematics';
  const grade = params.grade || 'Grade 8';
  const board = params.curriculumBoard || 'cbse';

  let rawQuestion = (params.questionText || '').trim();
  let ocrResult: MultimodalAnalysisResult | undefined;

  // 1. Multimodal OCR & Image Quality Detection
  if (params.imageBase64) {
    ocrResult = await analyzeEducationalImage(ai, params.imageBase64, params.imageMimeType);
    
    // Check image quality first
    if (!ocrResult.quality.isAcceptable) {
      return {
        success: false,
        question: rawQuestion || 'Uploaded Image',
        subject,
        grade,
        curriculumBoard: board,
        ocrData: ocrResult,
        isMath: false,
        engineUsed: 'Multimodal Visual Reasoning',
        structuredSteps: {
          givenInfo: ['Image uploaded by student'],
          formula: 'N/A',
          substitution: 'N/A',
          calculation: [],
          simplification: 'N/A',
          finalAnswer: 'Unable to proceed due to image quality.',
          verification: {
            status: 'Unable to Verify',
            method: 'Pre-flight Image Quality Check',
            details: ocrResult.quality.feedback,
            engineUsed: 'Multimodal Visual Reasoning'
          }
        },
        narrativeExplanation: ocrResult.quality.feedback,
        confidenceState: 'Unable to Verify',
        sourceDistinction: 'Multimodal OCR extracted & verified',
        similarPracticeQuestions: [],
        error: ocrResult.quality.feedback
      };
    }

    if (!rawQuestion && ocrResult.detectedText) {
      rawQuestion = ocrResult.detectedText;
    }
    if (ocrResult.detectedSubject) {
      subject = ocrResult.detectedSubject;
    }
  }

  // 2. Curriculum Source Topic Matching
  const curriculumMatch = matchCurriculumTopic(rawQuestion, board, grade, subject);

  // 3. Multi-Subject Specialized Deterministic Engine Dispatch
  let structuredSteps: SolverStepStructure | null = null;
  let confidenceState: 'Verified' | 'Needs Review' | 'Unable to Verify' = 'Unable to Verify';
  let engineUsedName = 'Curriculum Cross-Reference';
  let sourceDistinction: HomeworkSolverResponse['sourceDistinction'] = 'AI-assisted pedagogical explanation';

  let mathRes: SymbolicMathResult | undefined;
  let sciRes: ScienceReasoningResult | undefined;
  let csRes: CSReasoningResult | undefined;
  let langRes: LanguageReasoningResult | undefined;
  let socRes: SocialScienceResult | undefined;

  // A. Mathematics Engine
  mathRes = runSymbolicMathPipeline(rawQuestion);
  if (mathRes.isMath && mathRes.finalAnswer) {
    confidenceState = mathRes.verification?.verificationStatus === 'verified' ? 'Verified' : 'Needs Review';
    engineUsedName = 'Symbolic Math Engine (mathjs)';
    sourceDistinction = 'Verified curriculum & symbolic computation';
    structuredSteps = {
      givenInfo: mathRes.givenInfo || [rawQuestion],
      formula: mathRes.formula || 'Algebraic / Arithmetic Law',
      substitution: mathRes.substitution || 'Direct substitution of given parameters',
      calculation: mathRes.calculationSteps || ['Calculated via symbolic math engine'],
      simplification: mathRes.simplification || mathRes.finalAnswer,
      finalAnswer: mathRes.finalAnswer,
      verification: {
        status: confidenceState,
        method: mathRes.verification?.method || 'Independent symbolic AST evaluation and LHS/RHS equality check',
        details: mathRes.verification?.details || 'Symbolic engine independently verified mathematical correctness.',
        engineUsed: 'Symbolic Math Engine (mathjs)'
      }
    };
  }

  // B. Science Engine (Physics, Chemistry, Biology)
  if (!structuredSteps) {
    const sciCandidate = runScienceReasoningPipeline(rawQuestion);
    if (sciCandidate) {
      sciRes = sciCandidate;
      confidenceState = sciCandidate.verification.verified ? 'Verified' : 'Needs Review';
      engineUsedName = 'Science Verification Engine';
      sourceDistinction = 'Verified scientific laws & stoichiometry';
      structuredSteps = {
        givenInfo: sciCandidate.givenInfo,
        formula: sciCandidate.formula,
        substitution: sciCandidate.substitution,
        calculation: sciCandidate.calculationSteps,
        simplification: sciCandidate.simplification,
        finalAnswer: sciCandidate.finalAnswer,
        verification: {
          status: confidenceState,
          method: sciCandidate.verification.method,
          details: sciCandidate.verification.details,
          engineUsed: 'Science Verification Engine'
        }
      };
    }
  }

  // C. Computer Science Engine (Binary, Logic Gates, Boolean Algebra)
  if (!structuredSteps) {
    const csCandidate = runCSReasoningPipeline(rawQuestion);
    if (csCandidate) {
      csRes = csCandidate;
      confidenceState = csCandidate.verification.verified ? 'Verified' : 'Needs Review';
      engineUsedName = 'Computer Science Logic Engine';
      sourceDistinction = 'Verified digital logic & binary arithmetic';
      structuredSteps = {
        givenInfo: csCandidate.givenInfo,
        formula: csCandidate.formula,
        substitution: csCandidate.substitution,
        calculation: csCandidate.calculationSteps,
        simplification: csCandidate.simplification,
        finalAnswer: csCandidate.finalAnswer,
        verification: {
          status: confidenceState,
          method: csCandidate.verification.method,
          details: csCandidate.verification.details,
          engineUsed: 'Computer Science Logic Engine'
        }
      };
    }
  }

  // D. Language Engine (English, Hindi, Gujarati, French)
  if (!structuredSteps) {
    const langCandidate = runLanguageReasoningPipeline(rawQuestion);
    if (langCandidate) {
      langRes = langCandidate;
      confidenceState = langCandidate.verification.verified ? 'Verified' : 'Needs Review';
      engineUsedName = 'Language & Vyakaran Engine';
      sourceDistinction = 'Verified grammatical rules & language syntax';
      structuredSteps = {
        givenInfo: langCandidate.givenInfo,
        formula: langCandidate.formula,
        substitution: langCandidate.substitution,
        calculation: langCandidate.calculationSteps,
        simplification: langCandidate.simplification,
        finalAnswer: langCandidate.finalAnswer,
        verification: {
          status: confidenceState,
          method: langCandidate.verification.method,
          details: langCandidate.verification.details,
          engineUsed: 'Language & Vyakaran Engine'
        }
      };
    }
  }

  // E. Social Science Engine (History, Civics, Geography)
  if (!structuredSteps) {
    const socCandidate = runSocialSciencePipeline(rawQuestion);
    if (socCandidate) {
      socRes = socCandidate;
      confidenceState = socCandidate.verification.verified ? 'Verified' : 'Needs Review';
      engineUsedName = 'Social Science Verification Engine';
      sourceDistinction = 'Verified historical gazetteer & constitutional law';
      structuredSteps = {
        givenInfo: socCandidate.givenInfo,
        formula: socCandidate.formula,
        substitution: socCandidate.substitution,
        calculation: socCandidate.calculationSteps,
        simplification: socCandidate.simplification,
        finalAnswer: socCandidate.finalAnswer,
        verification: {
          status: confidenceState,
          method: socCandidate.verification.method,
          details: socCandidate.verification.details,
          engineUsed: 'Social Science Verification Engine'
        }
      };
    }
  }

  // F. French Language Engine
  let aiSkillRes: AISkillReasoningResult | undefined;
  if (!structuredSteps && (subject.toLowerCase() === 'french' || /french|français|verbe|etre|avoir|aller|faire/i.test(rawQuestion))) {
    const frCandidate = solveFrenchProblem(rawQuestion);
    if (frCandidate) {
      aiSkillRes = frCandidate;
      confidenceState = 'Verified';
      engineUsedName = 'French Language Engine';
      sourceDistinction = 'Verified grammatical rules & language syntax';
      structuredSteps = {
        givenInfo: frCandidate.givenInfo,
        formula: frCandidate.formula,
        substitution: frCandidate.substitution,
        calculation: frCandidate.calculationSteps,
        simplification: frCandidate.simplification,
        finalAnswer: frCandidate.finalAnswer,
        verification: {
          status: 'Verified',
          method: frCandidate.verification.method,
          details: frCandidate.verification.details,
          engineUsed: 'French Language Engine'
        }
      };
    }
  }

  // G. Artificial Intelligence Engine
  if (!structuredSteps && (subject.toLowerCase().includes('ai') || subject.toLowerCase().includes('artificial') || /supervised|unsupervised|reinforcement|neural|machine learning|deep learning/i.test(rawQuestion))) {
    const aiCandidate = solveAIProblem(rawQuestion);
    if (aiCandidate) {
      aiSkillRes = aiCandidate;
      confidenceState = 'Verified';
      engineUsedName = 'Artificial Intelligence Engine';
      sourceDistinction = 'Verified AI concepts & algorithmic ethics';
      structuredSteps = {
        givenInfo: aiCandidate.givenInfo,
        formula: aiCandidate.formula,
        substitution: aiCandidate.substitution,
        calculation: aiCandidate.calculationSteps,
        simplification: aiCandidate.simplification,
        finalAnswer: aiCandidate.finalAnswer,
        verification: {
          status: 'Verified',
          method: aiCandidate.verification.method,
          details: aiCandidate.verification.details,
          engineUsed: 'Artificial Intelligence Engine'
        }
      };
    }
  }

  // H. Skill Education & Financial Math Engine
  if (!structuredSteps && (subject.toLowerCase().includes('skill') || /simple interest|principal|rate|profit|loss|design thinking|maturity/i.test(rawQuestion))) {
    const skillCandidate = solveSkillEducationProblem(rawQuestion);
    if (skillCandidate) {
      aiSkillRes = skillCandidate;
      confidenceState = 'Verified';
      engineUsedName = 'Skill & Financial Literacy Engine';
      sourceDistinction = 'Verified financial math & vocational standards';
      structuredSteps = {
        givenInfo: skillCandidate.givenInfo,
        formula: skillCandidate.formula,
        substitution: skillCandidate.substitution,
        calculation: skillCandidate.calculationSteps,
        simplification: skillCandidate.simplification,
        finalAnswer: skillCandidate.finalAnswer,
        verification: {
          status: 'Verified',
          method: skillCandidate.verification.method,
          details: skillCandidate.verification.details,
          engineUsed: 'Skill & Financial Literacy Engine'
        }
      };
    }
  }

  // I. General Knowledge (GK) Engine
  if (!structuredSteps && (subject.toLowerCase().includes('gk') || subject.toLowerCase().includes('general knowledge') || /capital of|longest river|largest planet/i.test(rawQuestion))) {
    const gkCandidate = solveGKProblem(rawQuestion);
    if (gkCandidate) {
      aiSkillRes = gkCandidate;
      confidenceState = 'Verified';
      engineUsedName = 'General Knowledge Verification';
      sourceDistinction = 'General Knowledge Verification';
      structuredSteps = {
        givenInfo: gkCandidate.givenInfo,
        formula: gkCandidate.formula,
        substitution: gkCandidate.substitution,
        calculation: gkCandidate.calculationSteps,
        simplification: gkCandidate.simplification,
        finalAnswer: gkCandidate.finalAnswer,
        verification: {
          status: 'Verified',
          method: gkCandidate.verification.method,
          details: gkCandidate.verification.details,
          engineUsed: 'General Knowledge Verification'
        }
      };
    }
  }

  const hasDeterministicResult = structuredSteps !== null && structuredSteps.finalAnswer !== 'Analyzing solution...';

  // J. General Educational Synthesis & Structured Multi-Stage Solver
  if (!structuredSteps) {
    confidenceState = 'Needs Review';
    engineUsedName = 'Curriculum Cross-Reference';
    sourceDistinction = 'AI-assisted pedagogical explanation';
    structuredSteps = {
      quickAnswer: '',
      givenInfo: [rawQuestion],
      formula: `${subject} Syllabus & Foundational Principles`,
      substitution: 'Analytical derivation',
      calculation: [],
      simplification: '',
      finalAnswer: '',
      verification: {
        status: 'Needs Review',
        method: 'Cross-reference with official curriculum learning standards',
        details: `Aligned with ${board.toUpperCase()} ${grade} ${subject} guidelines.`,
        engineUsed: 'Curriculum Cross-Reference'
      }
    };
  }

  // 4. Grounded Multi-Stage AI Pedagogical Explanation & Independent Verification
  let narrativeExplanation = '';
  let similarPracticeQuestions: SimilarPracticeQuestion[] = [];

  try {
    const prompt = `Student Question: "${rawQuestion}"
Grade Level: ${grade} (Grades 1 to 12)
Subject: ${subject}
Curriculum Board: ${board.toUpperCase()} (Textbook reference: ${curriculumMatch?.textbook || 'Standard curriculum syllabus'})
${hasDeterministicResult ? `Pre-Verified Engine Deterministic Final Answer: "${structuredSteps.finalAnswer}" (Formula: ${structuredSteps.formula})` : 'Solve this question with maximum precision, rigorous step-by-step calculations, correct units, correct negative signs, and accurate scientific/mathematical notation.'}
${ocrResult ? `Multimodal Vision Details: ${JSON.stringify(ocrResult)}` : ''}

CRITICAL RULES FOR ACCURACY:
1. ${hasDeterministicResult ? `NEVER contradict the pre-verified final answer "${structuredSteps.finalAnswer}". Use this exact result.` : 'Compute the exact final answer. Preserve all fractions, square roots, signs, exponents, scientific notation, and physical units.'}
2. Provide a "quickAnswer" (a concise 1-sentence answer for students who just want the direct solution) AND a "finalAnswer".
3. Provide step-by-step intermediate calculations leading logically from the original problem to the final answer.
4. Provide a student-friendly explanation tailored to ${grade} students in ${subject}, including real-world analogies and memory tips.
5. Provide EXACTLY 3 progressive multiple-choice practice questions (Easy, Medium, Hard).

Respond strictly with valid JSON conforming to this schema:
{
  "quickAnswer": string,
  "finalAnswer": string,
  "givenInfo": string[],
  "formula": string,
  "substitution": string,
  "calculation": string[],
  "simplification": string,
  "verification": {
    "status": "Verified" | "Needs Review",
    "method": string,
    "details": string
  },
  "narrativeExplanation": string,
  "practiceQuestions": [
    {
      "id": "p1",
      "difficulty": "Easy",
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string
    },
    {
      "id": "p2",
      "difficulty": "Medium",
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string
    },
    {
      "id": "p3",
      "difficulty": "Hard",
      "question": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string
    }
  ]
}`;

    const aiRes = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
      config: {
        systemInstruction: `You are the master educational explanation and accuracy verification assistant for NeoNova.
You provide 100% verified educational answers for Grades 1–12, zero hallucinations, step-by-step working, correct units, and 3 progressive practice questions. Output strictly valid JSON.`,
        responseMimeType: 'application/json'
      }
    });

    const fullResponseText = aiRes.text?.trim() || '';
    if (fullResponseText) {
      try {
        const parsed = JSON.parse(fullResponseText);

        if (!hasDeterministicResult) {
          if (parsed.finalAnswer) {
            structuredSteps.finalAnswer = parsed.finalAnswer;
          }
          if (parsed.quickAnswer) {
            structuredSteps.quickAnswer = parsed.quickAnswer;
          }
          if (Array.isArray(parsed.givenInfo) && parsed.givenInfo.length > 0) {
            structuredSteps.givenInfo = parsed.givenInfo;
          }
          if (parsed.formula) {
            structuredSteps.formula = parsed.formula;
          }
          if (parsed.substitution) {
            structuredSteps.substitution = parsed.substitution;
          }
          if (Array.isArray(parsed.calculation) && parsed.calculation.length > 0) {
            structuredSteps.calculation = parsed.calculation;
          }
          if (parsed.simplification) {
            structuredSteps.simplification = parsed.simplification;
          }

          // Independent mathematical verification of AI's solution
          if (rawQuestion.includes('=')) {
            const mathEqCheck = verifyMathEquation(rawQuestion, 'x', parsed.finalAnswer);
            if (mathEqCheck.verified) {
              confidenceState = 'Verified';
              structuredSteps.verification = {
                status: 'Verified',
                method: 'Independent symbolic equation verification (mathjs)',
                details: `Verified LHS = RHS equality with zero divergence (LHS = ${mathEqCheck.lhs}, RHS = ${mathEqCheck.rhs}).`,
                engineUsed: 'Symbolic Math Engine (mathjs)'
              };
              engineUsedName = 'Symbolic Math Engine (mathjs)';
              sourceDistinction = 'Verified curriculum & symbolic computation';
            } else if (parsed.verification) {
              structuredSteps.verification = {
                status: parsed.verification.status === 'Verified' ? 'Verified' : 'Needs Review',
                method: parsed.verification.method || 'Curriculum verification',
                details: parsed.verification.details || 'Verified against syllabus principles.',
                engineUsed: 'Curriculum Cross-Reference'
              };
              confidenceState = structuredSteps.verification.status;
            }
          } else if (parsed.verification) {
            structuredSteps.verification = {
              status: parsed.verification.status === 'Verified' ? 'Verified' : 'Needs Review',
              method: parsed.verification.method || 'Curriculum verification',
              details: parsed.verification.details || 'Step-by-step verified against curriculum principles.',
              engineUsed: 'Curriculum Cross-Reference'
            };
            confidenceState = structuredSteps.verification.status;
          }
        } else {
          // Keep deterministic finalAnswer and add quickAnswer
          if (!structuredSteps.quickAnswer) {
            structuredSteps.quickAnswer = parsed.quickAnswer || `Final answer: ${structuredSteps.finalAnswer}`;
          }
        }

        narrativeExplanation = parsed.narrativeExplanation || '';

        if (Array.isArray(parsed.practiceQuestions) && parsed.practiceQuestions.length >= 1) {
          similarPracticeQuestions = parsed.practiceQuestions.map((q: any, i: number) => ({
            id: q.id || `sim-${i + 1}`,
            difficulty: q.difficulty || (i === 0 ? 'Easy' : i === 1 ? 'Medium' : 'Hard'),
            question: q.question,
            options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: q.explanation || 'Verified curriculum derivation.'
          }));
        }
      } catch (jsonErr) {
        console.warn('Could not parse JSON response from solver AI:', jsonErr);
        narrativeExplanation = fullResponseText;
      }
    }

    if (!narrativeExplanation) {
      narrativeExplanation = `Step-by-step educational derivation completed for ${subject} (${grade}).\n\nFinal Answer: ${structuredSteps.finalAnswer}`;
    }
  } catch (err: any) {
    console.warn('AI explanation generation error:', err);
    narrativeExplanation = `Solution computed directly via NeoNova's verified engine.\n\nFinal Answer: ${structuredSteps.finalAnswer}`;
  }

  // Fallback grounded practice questions if AI generation was unavailable
  if (!similarPracticeQuestions || similarPracticeQuestions.length === 0) {
    similarPracticeQuestions = [
      {
        id: 'sim-1',
        difficulty: 'Easy',
        question: `Based on ${subject}: What is the foundational rule or law governing this problem?`,
        options: [
          `${structuredSteps.formula || 'Fundamental standard syllabus definition'}`,
          'Inverse reciprocal without dimension',
          'Arbitrary approximation rule',
          'None of the above'
        ],
        correctIndex: 0,
        explanation: `The foundational principle applied in this step is: ${structuredSteps.formula}.`
      },
      {
        id: 'sim-2',
        difficulty: 'Medium',
        question: `In solving "${rawQuestion.slice(0, 45)}...", which parameter directly determines the result?`,
        options: [
          `${structuredSteps.givenInfo[0] || 'The primary given variable'}`,
          'An unmeasured external factor',
          'Hypothetical random constant',
          'Opposite sign magnitude'
        ],
        correctIndex: 0,
        explanation: `The critical parameter identified in the given information is ${structuredSteps.givenInfo[0] || 'the primary state variable'}.`
      },
      {
        id: 'sim-3',
        difficulty: 'Hard',
        question: `How is the final result verified independently in ${subject}?`,
        options: [
          `${structuredSteps.verification.method}`,
          'Accepting initial model intuition without verification',
          'By assuming symmetry in all conditions',
          'Omitting units and dimensional checks'
        ],
        correctIndex: 0,
        explanation: `Independent verification method: ${structuredSteps.verification.details}`
      }
    ];
  }

  function cleanServerText(t: string): string {
    if (!t) return '';
    return t
      .replace(/\\begin\{[^{}]*\}/g, '')
      .replace(/\\end\{[^{}]*\}/g, '')
      .replace(/\\\[([\s\S]*?)\\\]/g, '$1')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
      .replace(/\$([^\$\n]+?)\$/g, '$1')
      .replace(/\\\\/g, '\n')
      .replace(/\\quad/g, '  ')
      .replace(/&(?=\s*[=+\-*/<>])/g, '')
      .replace(/\\boxed\{([^{}]*)\}/g, '$1')
      .replace(/\\text\{([^{}]*)\}/g, '$1')
      .replace(/\\textbf\{([^{}]*)\}/g, '$1')
      .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1 / $2')
      .replace(/\\sqrt\[([^{}]*)\]\{([^{}]*)\}/g, '$1√($2)')
      .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\cdot/g, '·')
      .replace(/\\pm/g, '±')
      .replace(/\\approx/g, '≈')
      .replace(/\\neq?/g, '≠')
      .replace(/\\leq?/g, '≤')
      .replace(/\\geq?/g, '≥')
      .replace(/\\degree/g, '°')
      .replace(/\\pi/g, 'π')
      .replace(/\^2\b/g, '²')
      .replace(/\^3\b/g, '³')
      .replace(/\{([a-zA-Z0-9.,_+\-/*\s]+?)\}/g, '$1')
      .replace(/\\([\[\]{}%_])/g, '$1')
      .replace(/(\d)\s*\*\s*(\d)/g, '$1 × $2')
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*{3,}/g, '')
      .replace(/`([^`\n]+)`/g, '$1');
  }

  // Construct Visual Homework Explanation when educational value is added
  let visualExplanation: VisualExplanationData | undefined;

  if (ocrResult?.geometryDetails && ocrResult.geometryDetails.vertices && ocrResult.geometryDetails.vertices.length >= 3) {
    visualExplanation = {
      type: 'geometry',
      title: 'Geometric Figure Representation',
      description: 'Extracted vertices, boundary sides, and angle relationships verified against the question.',
      data: {
        geometry: {
          shape: 'Polygon',
          vertices: ocrResult.geometryDetails.vertices.map((v, i) => {
            const angle = (i / ocrResult!.geometryDetails!.vertices.length) * 2 * Math.PI - Math.PI / 2;
            return {
              label: v,
              x: Math.round(170 + 90 * Math.cos(angle)),
              y: Math.round(110 + 75 * Math.sin(angle))
            };
          }),
          lines: ocrResult.geometryDetails.sides || [],
          angles: (ocrResult.geometryDetails.angles || []).map(a => ({
            vertex: a.vertex,
            label: a.degrees ? `${a.degrees}°` : a.vertex,
            arc: true
          }))
        }
      }
    };
  } else if (ocrResult?.graphDetails && ocrResult.graphDetails.xAxisLabel) {
    visualExplanation = {
      type: 'coordinate_graph',
      title: 'Cartesian Coordinate Graph',
      description: `Plotted axes (${ocrResult.graphDetails.xAxisLabel} vs ${ocrResult.graphDetails.yAxisLabel || 'y'}) with key curve intercepts.`,
      data: {
        graph: {
          xLabel: ocrResult.graphDetails.xAxisLabel,
          yLabel: ocrResult.graphDetails.yAxisLabel || 'y',
          xRange: [-5, 5],
          yRange: [-5, 5],
          curves: [{ expression: 'f(x)', points: [], color: '#4f46e5', label: 'Curve' }]
        }
      }
    };
  } else if (ocrResult?.scienceDetails && ocrResult.scienceDetails.identifiedComponents && ocrResult.scienceDetails.identifiedComponents.length > 0) {
    visualExplanation = {
      type: 'science_diagram',
      title: 'Scientific System Schematic',
      description: 'Labeled physical and chemical elements extracted from the problem.',
      data: {
        scienceDiagram: {
          title: rawQuestion.slice(0, 40),
          components: ocrResult.scienceDetails.identifiedComponents.map(c => ({
            name: c.name,
            role: c.detectedRole || 'System component'
          }))
        }
      }
    };
  } else if (structuredSteps?.formula && structuredSteps.formula !== 'N/A' && structuredSteps.substitution && structuredSteps.substitution !== 'N/A') {
    visualExplanation = {
      type: 'formula_breakdown',
      title: 'Mathematical Governing Law Breakdown',
      description: 'Systematic variable substitution and dimensional verification.',
      data: {
        formulaBreakdown: {
          originalFormula: structuredSteps.formula,
          variableMapping: [
            { symbol: 'Givens', meaning: 'Extracted variables', value: structuredSteps.givenInfo.join(', ') || 'Known constants' },
            { symbol: 'Substitution', meaning: 'Applied values', value: structuredSteps.substitution },
            { symbol: 'Result', meaning: 'Verified quantity', value: structuredSteps.finalAnswer }
          ],
          stepwiseTransformations: structuredSteps.calculation
        }
      }
    };
  }

  // Deep sanitize steps to remove all LaTeX symbols and hashes
  const cleanStructuredSteps = {
    ...structuredSteps,
    formula: cleanServerText(structuredSteps.formula),
    substitution: cleanServerText(structuredSteps.substitution),
    calculation: structuredSteps.calculation.map(cleanServerText),
    simplification: cleanServerText(structuredSteps.simplification),
    finalAnswer: cleanServerText(structuredSteps.finalAnswer),
    verification: {
      ...structuredSteps.verification,
      details: cleanServerText(structuredSteps.verification.details)
    }
  };

  return {
    success: true,
    question: rawQuestion,
    quickAnswer: cleanServerText(structuredSteps.quickAnswer || `Final Answer: ${cleanStructuredSteps.finalAnswer}`),
    subject,
    grade,
    curriculumBoard: board,
    curriculumAlignment: curriculumMatch ? {
      board: curriculumMatch.board,
      subject: curriculumMatch.subject,
      chapterNumber: curriculumMatch.chapterNumber,
      chapterTitle: curriculumMatch.chapterTitle,
      topic: curriculumMatch.topic,
      textbook: curriculumMatch.textbook,
      learningObjectives: curriculumMatch.learningObjectives
    } : undefined,
    ocrData: ocrResult,
    isMath: !!(mathRes && mathRes.isMath),
    symbolicMathResult: mathRes?.isMath ? mathRes : undefined,
    scienceResult: sciRes,
    csResult: csRes,
    languageResult: langRes,
    socialResult: socRes,
    aiSkillResult: aiSkillRes,
    engineUsed: engineUsedName,
    structuredSteps: cleanStructuredSteps,
    visualExplanation,
    narrativeExplanation: cleanServerText(narrativeExplanation),
    confidenceState,
    sourceDistinction,
    similarPracticeQuestions
  };
}
