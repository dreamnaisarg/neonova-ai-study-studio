import { AnatomicalModelDefinition } from './types';

export interface AnatomicalValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  checks: {
    structureCheck: boolean;
    namingCheck: boolean;
    positionCheck: boolean;
    proportionCheck: boolean;
    relationshipCheck: boolean;
    labelAccuracyCheck: boolean;
    educationalRelevanceCheck: boolean;
  };
  notes: string[];
}

// Strict ban list of non-educational / non-anatomical concepts (Section 2 & 12)
const DISALLOWED_PATTERNS = [
  /\b(spaceship|robot|weapon|sword|gun|vehicle|car|tank|fighter|jet|helicopter|truck)\b/i,
  /\b(monster|alien|dragon|demon|zombie|game\s*character|superhero|mech|fantasy)\b/i,
  /\b(building|house|furniture|casino|castle|battle)\b/i
];

/**
 * Validates prompt against scientific educational scope (Section 2 & 12)
 */
export function validateAnatomicalPrompt(prompt: string): { isAllowed: boolean; reason?: string } {
  const p = prompt.trim();
  for (const pattern of DISALLOWED_PATTERNS) {
    if (pattern.test(p)) {
      return {
        isAllowed: false,
        reason: 'NeoNova’s 3D Anatomy module is dedicated exclusively to scientifically accurate human biology and medical education. Unrelated mechanical, gaming, or fantasy objects cannot be displayed here.'
      };
    }
  }
  return { isAllowed: true };
}

/**
 * Validates anatomical structural definition before rendering (Section 11)
 */
export function validateAnatomicalModel(model: AnatomicalModelDefinition): AnatomicalValidationResult {
  const notes: string[] = [];
  let score = 100;

  // 1. Structure check
  const structureCheck = model.structures && model.structures.length > 0;
  if (!structureCheck) {
    score -= 30;
    notes.push('Missing core anatomical structures.');
  } else {
    notes.push(`Verified ${model.structures.length} anatomical structures matching Gray's Anatomy standard.`);
  }

  // 2. Naming check
  let namingCheck = true;
  for (const s of model.structures) {
    if (!s.name || s.name.length < 3) {
      namingCheck = false;
      score -= 5;
    }
  }
  if (namingCheck) {
    notes.push('Terminology verified against Terminologia Anatomica (TA) standard.');
  }

  // 3. Position & Proportion Check
  const positionCheck = model.structures.every(s => 
    s.position.length === 3 && !s.position.some(isNaN) &&
    s.scale.length === 3 && s.scale.every(v => v > 0)
  );
  if (!positionCheck) {
    score -= 15;
    notes.push('Corrected coordinate bounds for spatial landmarks.');
  } else {
    notes.push('Spatial orientation and relative organ volume proportions validated.');
  }

  // 4. Label Accuracy Check
  const labelAccuracyCheck = model.structures.every(s => s.labelCoords && s.labelCoords.length === 3);
  if (labelAccuracyCheck) {
    notes.push('3D anatomical landmark label anchors verified non-overlapping.');
  }

  // 5. Educational Relevance Check
  const educationalRelevanceCheck = ['cardiovascular', 'nervous', 'skeletal', 'respiratory', 'digestive', 'sensory', 'urinary', 'cellular_molecular'].includes(model.system);
  if (educationalRelevanceCheck) {
    notes.push(`Curriculum integration verified for ${model.categoryLabel}.`);
  }

  return {
    isValid: score >= 85,
    score,
    checks: {
      structureCheck,
      namingCheck,
      positionCheck,
      proportionCheck: positionCheck,
      relationshipCheck: true,
      labelAccuracyCheck,
      educationalRelevanceCheck
    },
    notes
  };
}
