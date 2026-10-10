import { GoogleGenAI } from '@google/genai';

export interface ImageQualityReport {
  isAcceptable: boolean;
  issue: 'none' | 'too_blurry' | 'too_dark' | 'tilted' | 'severely_cropped' | 'incomplete';
  feedback: string;
  unreadablePartDescription?: string;
}

export interface MultimodalAnalysisResult {
  success: boolean;
  quality: ImageQualityReport;
  contentType: 'printed_text' | 'handwriting' | 'equation' | 'geometry_diagram' | 'coordinate_graph' | 'science_diagram' | 'table' | 'mixed_worksheet';
  detectedSubject: 'Mathematics' | 'Science' | 'English' | 'Hindi' | 'Gujarati' | 'French' | 'Social Science' | 'Computer Science' | 'General Knowledge' | 'Other';
  detectedTopic: string;
  detectedText: string;
  confidence: number; // 0.0 to 1.0
  needsConfirmation: boolean;
  confirmationMessage?: string;
  mathNotation?: {
    symbols: string[];
    latex?: string;
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
  error?: string;
}

const OCR_SYSTEM_PROMPT = `You are the specialized Multimodal OCR & Visual Reasoning Engine for the NeoNova Educational Platform.
Your mission is to perform strict, accurate image quality assessment, optical character recognition, and structural visual reasoning for Grade 1–12 educational content.

RULES FOR ACCURACY:
1. NEVER guess or invent text, labels, numbers, coordinates, or symbols that cannot be seen clearly.
2. Carefully evaluate image quality:
   - "too_blurry" if text/diagrams are out of focus or blurred.
   - "too_dark" if insufficient lighting obscures symbols or handwriting.
   - "tilted" if severe rotation renders reading unreliable.
   - "severely_cropped" if key parts of questions or diagrams are cut off.
   - "incomplete" if formulas, questions, or diagram elements are cut in half.
   If any part is unclear, specify unreadablePartDescription describing exactly which part (e.g., "bottom-right formula", "left-hand exponent", "diagram label on angle B").
3. Automatically identify the subject:
   - "Mathematics": algebra, arithmetic, geometry, calculus, trigonometry, statistics.
   - "Science": physics, chemistry, biology, environmental science, anatomy.
   - "English": literature, grammar, essay prompts, vocabulary.
   - "Hindi": Devanagari script, Hindi literature, vyakaran.
   - "Gujarati": Gujarati script, Gujarati grammar, literature.
   - "French": French language exercises, grammar, comprehension.
   - "Social Science": history, civics, geography, economics.
   - "Computer Science": coding, binary, boolean logic, data structures, algorithms.
   - "General Knowledge": trivia, current affairs, static GK.
   - "Other": if not cleanly fitting one above.
4. Distinguish the PRIMARY homework question from surrounding margins, headers, or neighboring textbook questions.
5. Accurately transcribe mathematical symbols, fractions, powers, roots, scientific notation, and handwritten signs.
6. For geometry diagrams: list ONLY explicit vertices, side lengths, and angle labels visible in the diagram.
7. For graphs: extract exact axis labels, scale intervals, and plotted curves.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "quality": {
    "isAcceptable": boolean,
    "issue": "none" | "too_blurry" | "too_dark" | "tilted" | "severely_cropped" | "incomplete",
    "feedback": string,
    "unreadablePartDescription": string
  },
  "contentType": "printed_text" | "handwriting" | "equation" | "geometry_diagram" | "coordinate_graph" | "science_diagram" | "table" | "mixed_worksheet",
  "detectedSubject": "Mathematics" | "Science" | "English" | "Hindi" | "Gujarati" | "French" | "Social Science" | "Computer Science" | "General Knowledge" | "Other",
  "detectedTopic": string,
  "detectedText": string,
  "confidence": number,
  "needsConfirmation": boolean,
  "confirmationMessage": string,
  "mathNotation": {
    "symbols": string[],
    "latex": string
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
        text: 'Examine this educational image with maximum precision. Assess quality first, then perform OCR and multimodal structural extraction. Output strictly valid JSON matching the system instruction.'
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
          feedback: "I couldn't reliably read this image. Please upload a clearer photo.",
          unreadablePartDescription: "The image contains no legible text."
        },
        contentType: 'printed_text',
        detectedSubject: 'Mathematics',
        detectedTopic: 'Unspecified',
        detectedText: '',
        confidence: 0,
        needsConfirmation: false,
        error: "OCR analysis produced an empty response."
      };
    }

    const parsed = JSON.parse(responseText);

    const validSubjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Gujarati', 'French', 'Social Science', 'Computer Science', 'General Knowledge', 'Other'];
    const detectedSubject = validSubjects.includes(parsed.detectedSubject) ? parsed.detectedSubject : 'Mathematics';

    return {
      success: true,
      quality: parsed.quality || { isAcceptable: true, issue: 'none', feedback: 'Image clarity is good.' },
      contentType: parsed.contentType || 'printed_text',
      detectedSubject,
      detectedTopic: parsed.detectedTopic || 'Core Syllabus',
      detectedText: parsed.detectedText || '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
      needsConfirmation: !!parsed.needsConfirmation || (typeof parsed.confidence === 'number' && parsed.confidence < 0.85),
      confirmationMessage: parsed.confirmationMessage || (parsed.detectedText ? `I detected: "${parsed.detectedText}". Please verify or adjust below.` : undefined),
      mathNotation: parsed.mathNotation,
      geometryDetails: parsed.geometryDetails,
      graphDetails: parsed.graphDetails,
      scienceDetails: parsed.scienceDetails
    };
  } catch (err: any) {
    console.error('OCR Vision Engine failed:', err);
    return {
      success: false,
      quality: {
        isAcceptable: false,
        issue: 'incomplete',
        feedback: "The multimodal OCR service is temporarily unavailable or could not process this image format. Please ensure the image is well-lit and upload again.",
        unreadablePartDescription: "Processing failure"
      },
      contentType: 'printed_text',
      detectedSubject: 'Mathematics',
      detectedTopic: 'Unspecified',
      detectedText: '',
      confidence: 0,
      needsConfirmation: false,
      error: err.message || 'Vision OCR service unavailable'
    };
  }
}
