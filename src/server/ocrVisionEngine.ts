import { GoogleGenAI } from '@google/genai';

export interface ImageQualityReport {
  isAcceptable: boolean;
  issue: 'none' | 'too_blurry' | 'too_dark' | 'tilted' | 'severely_cropped' | 'incomplete';
  feedback: string;
  unreadablePartDescription?: string;
  lightingQuality?: 'good' | 'low_light' | 'glare' | 'shadowed';
  estimatedClarityScore?: number; // 0 to 100
}

export interface DetectedQuestionItem {
  id: string;
  label: string; // e.g. "Question 1", "Problem 4(a)", "Exercise 2"
  text: string;
  subject?: string;
  topic?: string;
  confidence: number;
}

export interface MultimodalAnalysisResult {
  success: boolean;
  quality: ImageQualityReport;
  contentType: 'printed_text' | 'handwriting' | 'equation' | 'geometry_diagram' | 'coordinate_graph' | 'science_diagram' | 'table' | 'mixed_worksheet';
  detectedSubject: 'Mathematics' | 'Science' | 'English' | 'Hindi' | 'Gujarati' | 'French' | 'Social Science' | 'Computer Science' | 'General Knowledge' | 'Other';
  detectedTopic: string;
  detectedText: string;
  isMultiQuestion: boolean;
  detectedQuestions?: DetectedQuestionItem[];
  confidence: number; // 0.0 to 1.0
  needsConfirmation: boolean;
  confirmationMessage?: string;
  uncertainParts?: string[];
  mathNotation?: {
    symbols: string[];
    latex?: string;
    fractions?: string[];
    equations?: string[];
  };
  chemicalNotation?: {
    formulas?: string[];
    reactions?: string[];
  };
  geometryDetails?: {
    vertices: string[];
    sides: { from: string; to: string; length?: string }[];
    angles: { vertex: string; degrees?: string }[];
    relationships: string[];
  };
  graphDetails?: {
    xAxisLabel?: string;
    yAxisLabel?: string;
    scale?: string;
    identifiedPoints?: string[];
    linesOrCurves?: string[];
    intersections?: string[];
  };
  scienceDetails?: {
    identifiedComponents: { name: string; visualPosition?: string; detectedRole?: string }[];
    identifiedProcesses?: string[];
  };
  suggestedCrop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  error?: string;
}

const OCR_SYSTEM_PROMPT = `You are the specialized Multimodal OCR & Visual Reasoning Engine for NeoNova AI Homework Helper.
Your mission is to perform strict, accurate image quality assessment, optical character recognition, and structural visual reasoning for Grade 1–12 educational content.

RULES FOR ACCURACY:
1. NEVER guess or invent text, numbers, formulas, or symbols that cannot be read clearly.
2. Evaluate image quality:
   - "too_blurry": text/diagrams are severely out of focus.
   - "too_dark": insufficient lighting or shadows obscure critical symbols.
   - "tilted": page rotation exceeds 30 degrees making reliable OCR difficult.
   - "severely_cropped": key parts of the main problem are cut off at the edge.
   - "incomplete": formulas or questions end abruptly.
   If quality is acceptable enough to read the main problem, mark "isAcceptable": true even if minor lighting imperfections exist.
3. Multi-Question Detection:
   - If the image contains a full textbook page or worksheet with multiple problems (e.g., "1.", "2.", "Q3", "Exercise 4"), identify ALL distinct questions in "detectedQuestions".
   - Set "isMultiQuestion": true if 2 or more distinct questions are visible.
   - Set "detectedText" to the PRIMARY or first question, but list all in "detectedQuestions".
4. Mathematical & Scientific Notation:
   - Preserve superscripts (e.g. x², 10⁵), subscripts (e.g. H₂O, v₀), fractions (e.g. 3/4 or \\frac{3}{4}), radicals (√), matrices, integrals, summation (∑).
   - Accurately preserve negative signs, parentheses, units (kg, m/s², N, J, Ω, mol, cm³).
   - For Chemistry: preserve chemical equations, oxidation states, and reaction arrows (e.g. 2H₂ + O₂ -> 2H₂O).
5. Ambiguity & Missing Characters:
   - If any symbol or digit is smudge/ambiguous (e.g. could be '+' or '÷', '6' or 'b', '5' or 'S'), add it to "uncertainParts" and set "needsConfirmation": true with a helpful "confirmationMessage".
6. Automatically classify the subject:
   - "Mathematics": arithmetic, algebra, geometry, calculus, trigonometry, statistics.
   - "Science": physics, chemistry, biology, environmental science.
   - "English": reading comprehension, grammar, literature.
   - "Hindi": Devanagari script, grammar, literature.
   - "Gujarati": Gujarati script, grammar, literature.
   - "French": French language grammar, translation, vocabulary.
   - "Social Science": history, civics, geography, economics.
   - "Computer Science": coding, binary, boolean algebra, algorithms.
   - "General Knowledge": trivia, static facts.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "quality": {
    "isAcceptable": boolean,
    "issue": "none" | "too_blurry" | "too_dark" | "tilted" | "severely_cropped" | "incomplete",
    "feedback": string,
    "unreadablePartDescription": string,
    "lightingQuality": "good" | "low_light" | "glare" | "shadowed",
    "estimatedClarityScore": number
  },
  "contentType": "printed_text" | "handwriting" | "equation" | "geometry_diagram" | "coordinate_graph" | "science_diagram" | "table" | "mixed_worksheet",
  "detectedSubject": "Mathematics" | "Science" | "English" | "Hindi" | "Gujarati" | "French" | "Social Science" | "Computer Science" | "General Knowledge" | "Other",
  "detectedTopic": string,
  "detectedText": string,
  "isMultiQuestion": boolean,
  "detectedQuestions": [
    {
      "id": "q1",
      "label": "Question 1",
      "text": string,
      "subject": string,
      "topic": string,
      "confidence": number
    }
  ],
  "confidence": number,
  "needsConfirmation": boolean,
  "confirmationMessage": string,
  "uncertainParts": string[],
  "mathNotation": {
    "symbols": string[],
    "latex": string,
    "fractions": string[],
    "equations": string[]
  },
  "chemicalNotation": {
    "formulas": string[],
    "reactions": string[]
  },
  "geometryDetails": {
    "vertices": string[],
    "sides": [{"from": string, "to": string, "length": string}],
    "angles": [{"vertex": string, "degrees": string}],
    "relationships": string[]
  },
  "graphDetails": {
    "xAxisLabel": string,
    "yAxisLabel": string,
    "scale": string,
    "identifiedPoints": string[],
    "linesOrCurves": string[],
    "intersections": string[]
  },
  "scienceDetails": {
    "identifiedComponents": [{"name": string, "visualPosition": string, "detectedRole": string}],
    "identifiedProcesses": string[]
  }
}`;

export async function analyzeEducationalImage(
  ai: GoogleGenAI,
  imageDataBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<MultimodalAnalysisResult> {
  try {
    const parts = [
      {
        inlineData: {
          data: imageDataBase64,
          mimeType
        }
      },
      {
        text: 'Examine this educational image with maximum precision. Assess quality first, perform high-fidelity OCR, detect multiple questions if present, and extract structural mathematical/scientific details. Output strictly valid JSON matching the system instruction.'
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: parts,
      config: {
        systemInstruction: OCR_SYSTEM_PROMPT,
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text?.trim() || '';
    if (!responseText) {
      return {
        success: false,
        quality: {
          isAcceptable: false,
          issue: 'too_blurry',
          feedback: "Could not read this image reliably. Please ensure the camera is steady and well-lit.",
          unreadablePartDescription: "Empty visual response"
        },
        contentType: 'printed_text',
        detectedSubject: 'Mathematics',
        detectedTopic: 'Unspecified',
        detectedText: '',
        isMultiQuestion: false,
        confidence: 0,
        needsConfirmation: false,
        error: "OCR analysis produced an empty response."
      };
    }

    const parsed = JSON.parse(responseText);

    const validSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Gujarati', 'French', 'Social Science', 'Computer Science', 'General Knowledge', 'Other'];
    const detectedSubject = validSubjects.includes(parsed.detectedSubject) ? parsed.detectedSubject : 'Mathematics';

    const detectedQuestions: DetectedQuestionItem[] = Array.isArray(parsed.detectedQuestions)
      ? parsed.detectedQuestions.map((q: any, i: number) => ({
          id: q.id || `q-${i + 1}`,
          label: q.label || `Question ${i + 1}`,
          text: (q.text || '').trim(),
          subject: q.subject || detectedSubject,
          topic: q.topic || parsed.detectedTopic || 'Core Syllabus',
          confidence: typeof q.confidence === 'number' ? q.confidence : 0.95
        })).filter((q: DetectedQuestionItem) => q.text.length > 0)
      : [];

    const isMultiQuestion = !!parsed.isMultiQuestion || detectedQuestions.length > 1;

    return {
      success: true,
      quality: parsed.quality || { isAcceptable: true, issue: 'none', feedback: 'Image clarity is good.' },
      contentType: parsed.contentType || 'printed_text',
      detectedSubject,
      detectedTopic: parsed.detectedTopic || 'Core Syllabus',
      detectedText: (parsed.detectedText || (detectedQuestions[0]?.text || '')).trim(),
      isMultiQuestion,
      detectedQuestions: detectedQuestions.length > 0 ? detectedQuestions : undefined,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.92,
      needsConfirmation: !!parsed.needsConfirmation || (typeof parsed.confidence === 'number' && parsed.confidence < 0.8),
      confirmationMessage: parsed.confirmationMessage || (parsed.detectedText ? `Detected question: "${parsed.detectedText.slice(0, 80)}...". Please review or edit below.` : undefined),
      uncertainParts: Array.isArray(parsed.uncertainParts) ? parsed.uncertainParts : undefined,
      mathNotation: parsed.mathNotation,
      chemicalNotation: parsed.chemicalNotation,
      geometryDetails: parsed.geometryDetails,
      graphDetails: parsed.graphDetails,
      scienceDetails: parsed.scienceDetails,
      suggestedCrop: parsed.suggestedCrop
    };
  } catch (err: any) {
    console.error('OCR Vision Engine failed:', err);
    return {
      success: false,
      quality: {
        isAcceptable: false,
        issue: 'incomplete',
        feedback: "The vision service could not process this image format. Please check lighting and retake.",
        unreadablePartDescription: "Processing error"
      },
      contentType: 'printed_text',
      detectedSubject: 'Mathematics',
      detectedTopic: 'Unspecified',
      detectedText: '',
      isMultiQuestion: false,
      confidence: 0,
      needsConfirmation: false,
      error: err.message || 'Vision OCR service unavailable'
    };
  }
}
