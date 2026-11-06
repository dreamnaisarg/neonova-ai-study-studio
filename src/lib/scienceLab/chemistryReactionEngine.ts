/**
 * NeoNova 3D Chemistry Mixing Lab Simulation Engine
 * 
 * Production-grade chemistry reaction rules, stoichiometry calculations,
 * pH dynamics, thermal energetics (exothermic/endothermic), precipitate generation,
 * safety constraint checks, and educational explanations.
 */

export interface ChemicalReagent {
  id: string;
  name: string;
  formula: string;
  state: 'liquid' | 'powder' | 'indicator';
  colorHex: number;
  colorCss: string;
  ph: number;
  description: string;
  safetyHazard?: string;
  category: 'acid' | 'base' | 'salt' | 'indicator' | 'oxidizer' | 'solvent';
}

export interface ReactionOutcome {
  id: string;
  name: string;
  equation: string;
  type: 'Gas Evolution' | 'Precipitation' | 'Neutralization' | 'Decomposition' | 'Redox';
  isSafe: boolean;
  hazardWarning?: string;
  targetColorHex: number;
  targetColorCss: string;
  targetPh: number;
  temperatureChange: number; // e.g. -3.5 for endothermic, +4.0 for exothermic
  hasBubbles: boolean;
  bubbleGasName?: string;
  hasFoam: boolean;
  hasPrecipitate: boolean;
  precipitateColorHex?: number;
  precipitateName?: string;
  observations: string[];
  explanation: {
    elementary: string;
    middleSchool: string;
    highSchool: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const CHEMICAL_REAGENTS: ChemicalReagent[] = [
  {
    id: 'baking_soda',
    name: 'Sodium Bicarbonate (Baking Soda)',
    formula: 'NaHCO₃',
    state: 'powder',
    colorHex: 0xFFFFFF,
    colorCss: '#ffffff',
    ph: 8.3,
    description: 'White crystalline solid, mild alkaline base commonly used in baking and science experiments.',
    category: 'base'
  },
  {
    id: 'vinegar',
    name: 'Dilute Acetic Acid (Vinegar 5%)',
    formula: 'CH₃COOH',
    state: 'liquid',
    colorHex: 0xFDFBF7,
    colorCss: '#fdfbf7',
    ph: 2.5,
    description: 'Clear liquid with pungent odor; a safe classroom organic weak acid.',
    category: 'acid'
  },
  {
    id: 'water',
    name: 'Deionized Water',
    formula: 'H₂O',
    state: 'liquid',
    colorHex: 0x38BDF8,
    colorCss: '#38bdf8',
    ph: 7.0,
    description: 'Pure neutral laboratory solvent.',
    category: 'solvent'
  },
  {
    id: 'hcl',
    name: 'Dilute Hydrochloric Acid (0.1M)',
    formula: 'HCl (aq)',
    state: 'liquid',
    colorHex: 0xE0F2FE,
    colorCss: '#e0f2fe',
    ph: 1.0,
    safetyHazard: 'Corrosive acid - always wear goggles & gloves.',
    description: 'Clear strong monoprotic mineral acid.',
    category: 'acid'
  },
  {
    id: 'naoh',
    name: 'Dilute Sodium Hydroxide (0.1M)',
    formula: 'NaOH (aq)',
    state: 'liquid',
    colorHex: 0xF0FDFA,
    colorCss: '#f0fdfa',
    ph: 13.0,
    safetyHazard: 'Caustic alkali - wear nitrile gloves.',
    description: 'Clear strong alkaline base with slippery feel.',
    category: 'base'
  },
  {
    id: 'universal_indicator',
    name: 'Universal Indicator Solution',
    formula: 'pH Indicator Blend',
    state: 'indicator',
    colorHex: 0x10B981, // neutral green
    colorCss: '#10b981',
    ph: 7.0,
    description: 'Multi-compound indicator displaying a full rainbow spectrum from pH 1 (red) to 14 (violet).',
    category: 'indicator'
  },
  {
    id: 'phenolphthalein',
    name: 'Phenolphthalein Indicator',
    formula: 'C₂₀H₁₄O₄',
    state: 'indicator',
    colorHex: 0xFFFFFF, // clear in acid
    colorCss: '#ffffff',
    ph: 7.0,
    description: 'Colorless below pH 8.2; turns brilliant magenta-pink in alkaline basic solutions.',
    category: 'indicator'
  },
  {
    id: 'copper_sulfate',
    name: 'Copper(II) Sulfate Solution (0.1M)',
    formula: 'CuSO₄ (aq)',
    state: 'liquid',
    colorHex: 0x0284C7, // sky blue
    colorCss: '#0284c7',
    ph: 4.8,
    description: 'Vibrant translucent sky-blue solution containing Cu²⁺ hydrated ions.',
    category: 'salt'
  },
  {
    id: 'silver_nitrate',
    name: 'Silver Nitrate Solution (0.05M)',
    formula: 'AgNO₃ (aq)',
    state: 'liquid',
    colorHex: 0xF8FAFC,
    colorCss: '#f8fafc',
    ph: 6.0,
    description: 'Clear, light-sensitive solution used in halogen precipitation analysis.',
    category: 'salt'
  },
  {
    id: 'sodium_chloride',
    name: 'Sodium Chloride Solution (0.1M)',
    formula: 'NaCl (aq)',
    state: 'liquid',
    colorHex: 0xFAFAFA,
    colorCss: '#fafafa',
    ph: 7.0,
    description: 'Neutral saline solution containing Na⁺ and Cl⁻ ions.',
    category: 'salt'
  },
  {
    id: 'hydrogen_peroxide',
    name: 'Hydrogen Peroxide (3% Classroom Grade)',
    formula: 'H₂O₂',
    state: 'liquid',
    colorHex: 0xF0F9FF,
    colorCss: '#f0f9ff',
    ph: 6.2,
    description: 'Mild household oxidizing agent that decomposes into water and oxygen gas.',
    category: 'oxidizer'
  },
  {
    id: 'bleach',
    name: 'Sodium Hypochlorite (Household Bleach)',
    formula: 'NaClO',
    state: 'liquid',
    colorHex: 0xFEF08A,
    colorCss: '#fef08a',
    ph: 11.5,
    safetyHazard: 'Toxic fumes if mixed with acids or ammonia.',
    description: 'Strong household sanitizer used for safety hazard teaching.',
    category: 'base'
  },
  {
    id: 'ammonia',
    name: 'Household Ammonia Cleaner',
    formula: 'NH₃ (aq)',
    state: 'liquid',
    colorHex: 0xF1F5F9,
    colorCss: '#f1f5f9',
    ph: 11.6,
    safetyHazard: 'Irritant vapors - NEVER mix with bleach.',
    description: 'Volatile basic cleaner used for safety hazard demonstration.',
    category: 'base'
  }
];

export const SAFE_REACTIONS_CATALOG: ReactionOutcome[] = [
  // 1. HERO EXPERIMENT: Baking Soda + Vinegar (Gas Evolution / Endothermic)
  {
    id: 'baking_soda_vinegar',
    name: 'Carbon Dioxide Effervescence (Baking Soda & Vinegar)',
    equation: 'NaHCO₃ (s) + CH₃COOH (aq) → CH₃COONa (aq) + H₂O (l) + CO₂ (g) ↑',
    type: 'Gas Evolution',
    isSafe: true,
    targetColorHex: 0xF8FAFC,
    targetColorCss: '#f8fafc',
    targetPh: 6.2,
    temperatureChange: -3.8, // Endothermic cooling!
    hasBubbles: true,
    bubbleGasName: 'Carbon Dioxide (CO₂)',
    hasFoam: true,
    hasPrecipitate: false,
    observations: [
      'Rapid effervescence with thousands of rising micro-bubbles of Carbon Dioxide (CO₂) gas.',
      'A dense, fluffy white foam head rises momentarily before settling.',
      'Audible, continuous fizzing sound as gas molecules escape the liquid surface.',
      'The beaker cools down from 22.0°C to 18.2°C (endothermic heat absorption).'
    ],
    explanation: {
      elementary: 'When baking soda touches vinegar, they immediately react! Carbon dioxide gas is produced, creating thousands of fizzy bubbles like soda. The reaction absorbs heat, which makes the cup feel noticeably cool to the touch.',
      middleSchool: 'This is a two-step acid-base reaction. First, acetic acid exchanges a proton with sodium bicarbonate to produce carbonic acid (H₂CO₃) and sodium acetate. Carbonic acid is unstable at room temperature and quickly decomposes into water and carbon dioxide gas (CO₂). Breaking chemical bonds in this reaction absorbs more energy than is released, making it endothermic.',
      highSchool: 'Stoichiometrically, 1 mole of solid sodium bicarbonate reacts with 1 mole of aqueous acetic acid to yield aqueous sodium acetate, liquid water, and gaseous CO₂. The net ionic equation is HCO₃⁻ + CH₃COOH → CH₃COO⁻ + H₂O + CO₂(g). The enthalpy of reaction ΔH° is positive (+28.2 kJ/mol), cooling the solution.'
    },
    quiz: {
      question: 'Why does the temperature of the beaker drop when baking soda and vinegar mix?',
      options: [
        'It is an endothermic reaction that absorbs thermal energy from the solution',
        'Cold carbon dioxide gas enters from the outside air',
        'The water molecules freeze during the reaction',
        'Vinegar has a negative temperature coefficient'
      ],
      correctIndex: 0,
      explanation: 'Breaking the bonds in the reactants requires more kinetic/thermal energy than is released when forming the products. As heat is pulled from the solution, the temperature drops.'
    }
  },

  // 2. Silver Nitrate + Sodium Chloride (Double Displacement / White Precipitate)
  {
    id: 'silver_nitrate_nacl',
    name: 'Silver Chloride Precipitation',
    equation: 'AgNO₃ (aq) + NaCl (aq) → AgCl (s) ↓ + NaNO₃ (aq)',
    type: 'Precipitation',
    isSafe: true,
    targetColorHex: 0xE2E8F0,
    targetColorCss: '#e2e8f0',
    targetPh: 7.0,
    temperatureChange: +0.4,
    hasBubbles: false,
    hasFoam: false,
    hasPrecipitate: true,
    precipitateColorHex: 0xFFFFFF,
    precipitateName: 'Silver Chloride (AgCl) curdy white precipitate',
    observations: [
      'Instantaneous milky cloudiness appears upon mixing two clear solutions.',
      'A fine white curdy precipitate forms and gradually settles to the bottom of the beaker.',
      'Liquid remains neutral at pH 7.0 with minimal temperature change.'
    ],
    explanation: {
      elementary: 'Two crystal-clear liquids mix and instantly make a white solid cloud that snows down to the bottom!',
      middleSchool: 'This is a classic double displacement reaction. Silver ions (Ag⁺) and Chloride ions (Cl⁻) have a very strong electrostatic attraction that cannot be broken by water, forming insoluble silver chloride crystals (AgCl).',
      highSchool: 'The solubility product constant Ksp of AgCl is extremely low (1.77 × 10⁻¹⁰ at 25°C). As ion product Q exceeds Ksp, spontaneous precipitation occurs: Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓.'
    },
    quiz: {
      question: 'What type of chemical reaction occurs between AgNO₃ and NaCl?',
      options: [
        'Double Displacement (Precipitation)',
        'Combustion',
        'Single Replacement',
        'Thermal Decomposition'
      ],
      correctIndex: 0,
      explanation: 'The silver and sodium cations exchange their companion anions, forming the insoluble precipitate AgCl.'
    }
  },

  // 3. Copper Sulfate + Sodium Hydroxide (Royal Blue Gelatinous Precipitate)
  {
    id: 'copper_sulfate_naoh',
    name: 'Copper(II) Hydroxide Formation',
    equation: 'CuSO₄ (aq) + 2NaOH (aq) → Cu(OH)₂ (s) ↓ + Na₂SO₄ (aq)',
    type: 'Precipitation',
    isSafe: true,
    targetColorHex: 0x1D4ED8, // deep royal blue
    targetColorCss: '#1d4ed8',
    targetPh: 11.2,
    temperatureChange: +3.2, // Exothermic!
    hasBubbles: false,
    hasFoam: false,
    hasPrecipitate: true,
    precipitateColorHex: 0x2563EB,
    precipitateName: 'Copper(II) Hydroxide Cu(OH)₂ vibrant blue gel',
    observations: [
      'A dense, gelatinous royal-blue precipitate forms immediately upon contact.',
      'The liquid above the precipitate turns light blue, then settles.',
      'Slight temperature increase (+3.2°C) due to exothermic lattice formation.'
    ],
    explanation: {
      elementary: 'Adding clear drops into light blue water makes a bright, jelly-like deep blue solid appear magically!',
      middleSchool: 'Cu²⁺ ions combine with OH⁻ ions from sodium hydroxide to form solid insoluble copper(II) hydroxide. The blue color comes from copper ions bonded to hydroxide groups.',
      highSchool: 'Net ionic: Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓. This precipitate is amphoteric and dissolves in excess ammonia to form the deep blue Schweizer\'s reagent [Cu(NH₃)₄(H₂O)₂]²⁺.'
    },
    quiz: {
      question: 'What gives the Cu(OH)₂ precipitate its distinctive blue color?',
      options: [
        'Electronic d-d orbital transitions of the hydrated Cu²⁺ transition metal ion',
        'Dissolved oxygen bubbles reflecting blue wavelengths',
        'Sodium ions absorbing ultraviolet light',
        'Thermal cooling of the solution'
      ],
      correctIndex: 0,
      explanation: 'Transition metal complexes like Cu(II) have partially filled d-orbitals; light absorption in the orange-red spectrum causes d-d electron transitions, transmitting brilliant blue light.'
    }
  },

  // 4. Acid-Base Neutralization (HCl + NaOH with Phenolphthalein)
  {
    id: 'hcl_naoh_neutralization',
    name: 'Strong Acid-Strong Base Neutralization',
    equation: 'HCl (aq) + NaOH (aq) → NaCl (aq) + H₂O (l) + 57.3 kJ/mol',
    type: 'Neutralization',
    isSafe: true,
    targetColorHex: 0xEC4899, // vibrant pink if indicator present
    targetColorCss: '#ec4899',
    targetPh: 7.0,
    temperatureChange: +4.6, // Exothermic!
    hasBubbles: false,
    hasFoam: false,
    hasPrecipitate: false,
    observations: [
      'With phenolphthalein indicator: turns from colorless to vibrant fuchsia-pink as equivalence is crossed.',
      'With universal indicator: shifts from bright red (pH 1) to orange, yellow, then forest green (pH 7).',
      'Noticeable heat release (+4.6°C) as hydronium and hydroxide ions bond to form water.'
    ],
    explanation: {
      elementary: 'An acid and a base cancel each other out to make safe saltwater! The indicator dye turns vibrant pink to show the exact moment they balance.',
      middleSchool: 'The H⁺ from hydrochloric acid pairs with the OH⁻ from sodium hydroxide to form neutral water (H₂O). The remaining ions (Na⁺ and Cl⁻) form dissolved table salt. Neutralization is an exothermic reaction.',
      highSchool: 'Standard enthalpy of neutralization for strong monoprotic acids and bases is ΔH° = -57.3 kJ/mol. The net ionic equation is H⁺(aq) + OH⁻(aq) → H₂O(l).'
    },
    quiz: {
      question: 'At what pH does phenolphthalein change from colorless to pink?',
      options: [
        'Approximately pH 8.2 to 10.0',
        'At exactly pH 2.0',
        'Between pH 4.0 and 5.5',
        'Only in boiling water'
      ],
      correctIndex: 0,
      explanation: 'Phenolphthalein is a weak acid that loses protons around pH 8.2, rearranging its conjugated double-bond system to absorb green light and transmit bright pink.'
    }
  },

  // 5. Decomposition of Hydrogen Peroxide with Yeast/Catalyst
  {
    id: 'peroxide_decomposition',
    name: 'Catalytic Oxygen Gas Release',
    equation: '2H₂O₂ (aq) ──[Catalase/KI]──> 2H₂O (l) + O₂ (g) ↑ + Heat',
    type: 'Decomposition',
    isSafe: true,
    targetColorHex: 0xF0FDFA,
    targetColorCss: '#f0fdfa',
    targetPh: 6.8,
    temperatureChange: +7.5,
    hasBubbles: true,
    bubbleGasName: 'Oxygen (O₂)',
    hasFoam: true,
    hasPrecipitate: false,
    observations: [
      'Rapid stream of warm oxygen bubbles rises through the liquid.',
      'Gentle steam wisps emerge as the reaction warms up (+7.5°C).',
      'Releasing pure oxygen gas (O₂).'
    ],
    explanation: {
      elementary: 'Hydrogen peroxide splits into clean water and pure oxygen gas bubbles! The liquid gets comfortably warm.',
      middleSchool: 'A catalyst speeds up the natural breakdown of hydrogen peroxide without being consumed itself. 2H₂O₂ molecules break into 2 water molecules and 1 oxygen gas molecule.',
      highSchool: 'The disproportionation reaction of hydrogen peroxide is thermodynamically favorable (ΔG° = -116 kJ/mol per mole of O₂), catalyzed by transition metal ions or catalase enzymes.'
    },
    quiz: {
      question: 'What is the role of a catalyst in a chemical reaction?',
      options: [
        'It lowers the activation energy without being consumed',
        'It adds extra mass to the final products',
        'It stops the reaction from releasing heat',
        'It converts liquids into solids instantly'
      ],
      correctIndex: 0,
      explanation: 'Catalysts provide an alternative reaction pathway with lower activation energy, increasing reaction rate while remaining chemically unchanged.'
    }
  }
];

// UNSAFE REACTIONS DATABASE (Safety Alert: "Don't mix this!" with explanation)
export interface UnsafeHazardRule {
  reagents: [string, string];
  title: string;
  reason: string;
  realWorldDanger: string;
}

export const UNSAFE_HAZARD_RULES: UnsafeHazardRule[] = [
  {
    reagents: ['bleach', 'ammonia'],
    title: 'Toxic Chloramine Gas Hazard',
    reason: 'Mixing chlorine bleach (NaClO) with household ammonia (NH₃) releases toxic chloramine gases (NH₂Cl, NHCl₂) and hydrazine vapors.',
    realWorldDanger: 'Causes immediate respiratory tract irritation, pulmonary edema, and chemical pneumonia. In school labs, never combine bleach with ammonia-based cleaners.'
  },
  {
    reagents: ['bleach', 'vinegar'],
    title: 'Chlorine Gas Evolution Hazard',
    reason: 'Combining sodium hypochlorite bleach with an acid (even mild acetic acid) shifts equilibrium to generate toxic greenish-yellow Chlorine gas (Cl₂).',
    realWorldDanger: 'Chlorine gas is a potent respiratory asphyxiant that reacts with moisture in mucous membranes to form hydrochloric and hypochlorous acids.'
  },
  {
    reagents: ['bleach', 'hcl'],
    title: 'Severe Chlorine Gas Hazard',
    reason: 'Hydrochloric acid rapidly protonates hypochlorite ions: ClO⁻ + Cl⁻ + 2H⁺ → Cl₂ (g) + H₂O.',
    realWorldDanger: 'Vigorous production of toxic elemental chlorine gas. Never mix bleach with acids!'
  }
];

/**
 * Evaluates current beaker mixture and returns active reaction or safety hazard
 */
export function evaluateMixture(addedReagents: string[]): {
  outcome?: ReactionOutcome;
  unsafeHazard?: UnsafeHazardRule;
  colorHex: number;
  colorCss: string;
  ph: number;
  temperature: number;
  isReacting: boolean;
} {
  const baseTemp = 22.0;

  // 1. Check for unsafe combinations first
  for (const hazard of UNSAFE_HAZARD_RULES) {
    if (addedReagents.includes(hazard.reagents[0]) && addedReagents.includes(hazard.reagents[1])) {
      return {
        unsafeHazard: hazard,
        colorHex: 0xFEE2E2,
        colorCss: '#fee2e2',
        ph: 7.0,
        temperature: baseTemp,
        isReacting: false
      };
    }
  }

  // 2. Check for recognized safe reactions
  // A. Baking Soda + Vinegar
  if (addedReagents.includes('baking_soda') && addedReagents.includes('vinegar')) {
    const rx = SAFE_REACTIONS_CATALOG.find(r => r.id === 'baking_soda_vinegar')!;
    return {
      outcome: rx,
      colorHex: rx.targetColorHex,
      colorCss: rx.targetColorCss,
      ph: rx.targetPh,
      temperature: baseTemp + rx.temperatureChange,
      isReacting: true
    };
  }

  // B. Silver Nitrate + Sodium Chloride
  if (addedReagents.includes('silver_nitrate') && addedReagents.includes('sodium_chloride')) {
    const rx = SAFE_REACTIONS_CATALOG.find(r => r.id === 'silver_nitrate_nacl')!;
    return {
      outcome: rx,
      colorHex: rx.targetColorHex,
      colorCss: rx.targetColorCss,
      ph: rx.targetPh,
      temperature: baseTemp + rx.temperatureChange,
      isReacting: true
    };
  }

  // C. Copper Sulfate + Sodium Hydroxide
  if (addedReagents.includes('copper_sulfate') && addedReagents.includes('naoh')) {
    const rx = SAFE_REACTIONS_CATALOG.find(r => r.id === 'copper_sulfate_naoh')!;
    return {
      outcome: rx,
      colorHex: rx.targetColorHex,
      colorCss: rx.targetColorCss,
      ph: rx.targetPh,
      temperature: baseTemp + rx.temperatureChange,
      isReacting: true
    };
  }

  // D. HCl + NaOH
  if (addedReagents.includes('hcl') && addedReagents.includes('naoh')) {
    const rx = SAFE_REACTIONS_CATALOG.find(r => r.id === 'hcl_naoh_neutralization')!;
    const hasPhenol = addedReagents.includes('phenolphthalein');
    const color = hasPhenol ? 0xEC4899 : 0x38BDF8;
    return {
      outcome: rx,
      colorHex: color,
      colorCss: hasPhenol ? '#ec4899' : '#38bdf8',
      ph: rx.targetPh,
      temperature: baseTemp + rx.temperatureChange,
      isReacting: true
    };
  }

  // E. Hydrogen Peroxide + Baking soda or catalyst
  if (addedReagents.includes('hydrogen_peroxide') && addedReagents.includes('baking_soda')) {
    const rx = SAFE_REACTIONS_CATALOG.find(r => r.id === 'peroxide_decomposition')!;
    return {
      outcome: rx,
      colorHex: rx.targetColorHex,
      colorCss: rx.targetColorCss,
      ph: rx.targetPh,
      temperature: baseTemp + rx.temperatureChange,
      isReacting: true
    };
  }

  // 3. Single Reagent or Non-Reacting Dilution: Compute weighted pH and blend color
  if (addedReagents.length === 0) {
    return {
      colorHex: 0xE0F2FE,
      colorCss: '#e0f2fe',
      ph: 7.0,
      temperature: baseTemp,
      isReacting: false
    };
  }

  let totalPh = 0;
  let rSum = 0, gSum = 0, bSum = 0;
  let count = 0;

  for (const id of addedReagents) {
    const r = CHEMICAL_REAGENTS.find(c => c.id === id);
    if (r) {
      totalPh += r.ph;
      const hex = r.colorHex;
      rSum += (hex >> 16) & 255;
      gSum += (hex >> 8) & 255;
      bSum += hex & 255;
      count++;
    }
  }

  const avgPh = count > 0 ? Number((totalPh / count).toFixed(1)) : 7.0;
  const avgR = count > 0 ? Math.round(rSum / count) : 224;
  const avgG = count > 0 ? Math.round(gSum / count) : 242;
  const avgB = count > 0 ? Math.round(bSum / count) : 254;
  const blendedHex = (avgR << 16) | (avgG << 8) | avgB;
  const blendedCss = `rgb(${avgR}, ${avgG}, ${avgB})`;

  // If universal indicator was added, apply rainbow pH scale
  if (addedReagents.includes('universal_indicator')) {
    let indicatorHex = 0x10B981; // green
    if (avgPh <= 3) indicatorHex = 0xEF4444; // red
    else if (avgPh <= 5) indicatorHex = 0xF97316; // orange
    else if (avgPh <= 6.5) indicatorHex = 0xFBBF24; // yellow
    else if (avgPh <= 7.5) indicatorHex = 0x10B981; // green
    else if (avgPh <= 9) indicatorHex = 0x06B6D4; // cyan
    else if (avgPh <= 11) indicatorHex = 0x3B82F6; // blue
    else indicatorHex = 0x8B5CF6; // violet

    return {
      colorHex: indicatorHex,
      colorCss: `#${indicatorHex.toString(16).padStart(6, '0')}`,
      ph: avgPh,
      temperature: baseTemp,
      isReacting: false
    };
  }

  return {
    colorHex: blendedHex,
    colorCss: blendedCss,
    ph: avgPh,
    temperature: baseTemp,
    isReacting: false
  };
}
