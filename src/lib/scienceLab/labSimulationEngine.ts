/**
 * NeoNova 3D Science Lab Simulation Engine
 * 
 * Deterministic, rule-based scientific calculations, physical laws, chemical reactions,
 * and experiment catalog across Chemistry, Physics, Biology, and General Science.
 */

export interface PPESafetyRequirements {
  goggles: boolean;
  mask: boolean;
  gloves: boolean;
  coat: boolean;
  rationales: {
    goggles?: string;
    mask?: string;
    gloves?: string;
    coat?: string;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ScienceExperiment {
  id: string;
  title: string;
  subject: 'chemistry' | 'physics' | 'biology' | 'general';
  stationId: 'chemistry_bench' | 'physics_table' | 'biology_desk' | 'fume_hood' | 'general_bench';
  stationName: string;
  gradeRange: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tagline: string;
  formula: string;
  ppeRequired: PPESafetyRequirements;
  equipmentNeeded: string[];
  chemicalsNeeded: string[];
  steps: {
    num: number;
    title: string;
    instruction: string;
    safetyTip?: string;
    actionKey?: string;
  }[];
  scientificPrinciples: string;
  realWorldApplications: string;
  quiz: QuizQuestion[];
  initialParams: Record<string, any>;
}

export const SCIENCE_EXPERIMENTS_CATALOG: ScienceExperiment[] = [
  // --- CHEMISTRY ---
  {
    id: 'acid_base_titration',
    title: 'Acid-Base Neutralization & Titration',
    subject: 'chemistry',
    stationId: 'chemistry_bench',
    stationName: 'Chemistry Workbench 1',
    gradeRange: 'Grades 7–12',
    difficulty: 'Intermediate',
    tagline: 'Measure stoichiometric equivalence using 0.1M HCl and 0.1M NaOH with phenolphthalein indicator.',
    formula: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + 57.3 kJ/mol',
    ppeRequired: {
      goggles: true,
      mask: true,
      gloves: true,
      coat: true,
      rationales: {
        goggles: 'Hydrochloric acid and sodium hydroxide can cause severe corneal damage from accidental splashes.',
        mask: 'Protects the respiratory tract from acidic vapor fumes during transfer.',
        gloves: 'Nitrile gloves prevent chemical burns and tissue saponification caused by caustic sodium hydroxide.',
        coat: 'Cotton lab coat shields skin and clothes from acid corrosives.'
      }
    },
    equipmentNeeded: ['50mL Precision Buret', '250mL Erlenmeyer Flask', 'Digital pH Sensor', 'Magnetic Stirrer & Stir Bar', 'Dropper Pipette'],
    chemicalsNeeded: ['0.10M Hydrochloric Acid (HCl)', '0.10M Sodium Hydroxide (NaOH)', 'Phenolphthalein Indicator Solution', 'Deionized Water'],
    steps: [
      {
        num: 1,
        title: 'Safety Gear Check',
        instruction: 'Equip your safety goggles, gloves, and lab coat before handling corrosive reagents.',
        safetyTip: 'Never pipet chemical solutions by mouth. Ensure eyewash station is accessible.'
      },
      {
        num: 2,
        title: 'Prepare Analyte Solution',
        instruction: 'Add 25.0 mL of 0.10M Hydrochloric Acid (HCl) into the clean 250mL Erlenmeyer flask.',
        actionKey: 'add_analyte'
      },
      {
        num: 3,
        title: 'Add Indicator',
        instruction: 'Dispense 3 drops of phenolphthalein indicator into the acid. The solution remains completely clear in acidic pH.',
        actionKey: 'add_indicator'
      },
      {
        num: 4,
        title: 'Titrate with NaOH',
        instruction: 'Slowly open the buret stopcock to add 0.10M Sodium Hydroxide dropwise while continuously stirring on the magnetic plate.',
        actionKey: 'titrate'
      },
      {
        num: 5,
        title: 'Detect Equivalence Point',
        instruction: 'Observe the exact drop where the solution transitions from clear to a persistent faint magenta pink at pH 7.0–8.3.',
        actionKey: 'observe_equivalence'
      }
    ],
    scientificPrinciples: 'In strong acid-strong base neutralization, hydronium ions (H₃O⁺) react with hydroxide ions (OH⁻) to form neutral water and sodium chloride salt. At the stoichiometric equivalence point (pH 7.0 at 25°C), the moles of acid equal the moles of base. Phenolphthalein changes from colorless to pink between pH 8.2 and 10.0 due to a molecular quinoid structural rearrangement.',
    realWorldApplications: 'Municipal water treatment facilities continuously monitor and adjust water pH before public distribution. Pharmaceutical manufacturers titrate active ingredients to guarantee precise drug dosages.',
    quiz: [
      {
        question: 'What is the theoretical pH at the equivalence point of a strong acid (HCl) and strong base (NaOH) titration at 25°C?',
        options: ['pH 4.5', 'pH 7.0', 'pH 9.2', 'pH 14.0'],
        correctAnswer: 1,
        explanation: 'The salt formed (NaCl) does not undergo hydrolysis in water, leaving the solution perfectly neutral at pH 7.0 at 25°C.'
      },
      {
        question: 'Why does phenolphthalein turn vivid pink in basic solutions?',
        options: ['It decomposes into oxygen gas', 'Its molecule undergoes a structural quinoid rearrangement under basic conditions', 'It oxidizes the glassware', 'It reacts with nitrogen in the air'],
        correctAnswer: 1,
        explanation: 'When OH⁻ deprotonates the indicator, its conjugated double bonds expand into a quinoid structure that absorbs green light, transmitting pink.'
      },
      {
        question: 'If 25.0 mL of 0.10M HCl requires 25.0 mL of NaOH to reach the endpoint, what is the concentration of the NaOH?',
        options: ['0.05 M', '0.10 M', '0.20 M', '1.0 M'],
        correctAnswer: 1,
        explanation: 'Using M₁V₁ = M₂V₂, (0.10 M)(25.0 mL) = M₂(25.0 mL), giving exactly M₂ = 0.10 M.'
      }
    ],
    initialParams: {
      acidVolume: 25.0,
      acidMolarity: 0.10,
      baseVolumeAdded: 0.0,
      baseMolarity: 0.10,
      hasIndicator: false,
      magneticStirrerOn: true,
      currentPh: 1.0,
      solutionColor: '#FFFFFF',
      isCompleted: false
    }
  },
  {
    id: 'universal_indicator_ph',
    title: 'Universal Indicator & The pH Rainbow Spectrum',
    subject: 'chemistry',
    stationId: 'chemistry_bench',
    stationName: 'Chemistry Workbench 2',
    gradeRange: 'Grades 5–10',
    difficulty: 'Beginner',
    tagline: 'Test common household and laboratory substances across the full pH 1–14 spectrum.',
    formula: 'pH = -log₁₀[H⁺], pOH = -log₁₀[OH⁻], pH + pOH = 14',
    ppeRequired: {
      goggles: true,
      mask: false,
      gloves: true,
      coat: true,
      rationales: {
        goggles: 'Protects eyes from accidental splashes when testing various acidic and basic solutions.',
        gloves: 'Prevents skin irritation from concentrated household bleach and sodium hydroxide.',
        coat: 'Shields everyday clothing from chemical dyes and stains.'
      }
    },
    equipmentNeeded: ['6-Well Reaction Plate', 'Dropper Pipettes', 'Colorimetric Reference Card', 'Stirring Rods'],
    chemicalsNeeded: ['Gastric Acid / Dilute HCl (pH 1)', 'Lemon Juice (pH 2.5)', 'Coffee (pH 5)', 'Pure Water (pH 7)', 'Baking Soda Solution (pH 9)', 'Household Bleach (pH 12)', 'Universal Indicator Solution'],
    steps: [
      {
        num: 1,
        title: 'Safety Equipment',
        instruction: 'Put on safety goggles and chemical gloves.',
        safetyTip: 'Never taste laboratory reagents to determine acidity.'
      },
      {
        num: 2,
        title: 'Dispense Test Solutions',
        instruction: 'Add 2mL of each test substance into wells 1 through 6 on the white spot plate.',
        actionKey: 'fill_wells'
      },
      {
        num: 3,
        title: 'Add Universal Indicator',
        instruction: 'Add 2 drops of Universal Indicator to each well and stir gently.',
        actionKey: 'add_universal_indicator'
      },
      {
        num: 4,
        title: 'Match Color Spectrum',
        instruction: 'Compare the resulting colors against the standard pH rainbow card (Red = Strong Acid, Green = Neutral, Purple = Strong Base).',
        actionKey: 'compare_spectrum'
      }
    ],
    scientificPrinciples: 'Universal indicator is a mixture of several indicators (thymol blue, methyl red, bromothymol blue, phenolphthalein) that produces a smooth gradation of colors from pH 1 to 14. High hydrogen ion concentrations yield deep red (pH 1-2); intermediate acidity produces orange and yellow (pH 3-6); neutral conditions are green (pH 7); and alkaline solutions transition through blue, indigo, and deep violet (pH 8-14).',
    realWorldApplications: 'Soil scientists test agricultural soil pH to determine optimal fertilizer amendments for crops like wheat, rice, and cotton. Aquarists regularly monitor aquarium pH to preserve fish health.',
    quiz: [
      {
        question: 'What color does Universal Indicator turn in pure neutral water at pH 7.0?',
        options: ['Red', 'Yellow', 'Green', 'Deep Purple'],
        correctAnswer: 2,
        explanation: 'Universal indicator produces a distinct emerald green at neutral pH 7.0.'
      },
      {
        question: 'A solution with a pH of 3 has how many times more H⁺ ions than a solution with a pH of 5?',
        options: ['2 times more', '10 times more', '100 times more', '1000 times more'],
        correctAnswer: 2,
        explanation: 'Because the pH scale is logarithmic (base 10), each integer decrease represents a 10-fold increase. A difference of 2 units (5 - 3 = 2) is 10² = 100 times more acidic.'
      },
      {
        question: 'Which of the following household liquids is alkaline (basic)?',
        options: ['Vinegar', 'Lemon Juice', 'Baking soda dissolved in water', 'Black coffee'],
        correctAnswer: 2,
        explanation: 'Baking soda (sodium bicarbonate, NaHCO₃) dissolves in water to form a mildly basic solution around pH 8.5–9.0.'
      }
    ],
    initialParams: {
      selectedSubstance: 'water',
      phValue: 7.0,
      indicatorColor: '#10B981',
      testedSubstancesCount: 0
    }
  },

  // --- PHYSICS ---
  {
    id: 'optics_prism_refraction',
    title: 'Light Refraction & Prism Dispersion',
    subject: 'physics',
    stationId: 'physics_table',
    stationName: 'Optics Laboratory Bench',
    gradeRange: 'Grades 6–12',
    difficulty: 'Intermediate',
    tagline: 'Observe Snell\'s Law, total internal reflection, and chromatic dispersion into a continuous rainbow.',
    formula: 'n₁·sin(θ₁) = n₂·sin(θ₂), Dispersion: n(λ) = A + B/λ²',
    ppeRequired: {
      goggles: true,
      mask: false,
      gloves: false,
      coat: false,
      rationales: {
        goggles: 'Protective goggles shield eyes from direct laser collimator reflections and optical equipment hazards.'
      }
    },
    equipmentNeeded: ['Collimated White Light Beam', 'Laser Diode Pointer (532nm)', 'Triangular Crown Glass Prism (60°)', 'Protractor Baseplate', 'Projection Screen'],
    chemicalsNeeded: ['None'],
    steps: [
      {
        num: 1,
        title: 'Safety First',
        instruction: 'Equip protective optical goggles. Never look directly into collimated light beams or laser apertures.',
        safetyTip: 'Avoid shiny jewelry that can produce specular reflections.'
      },
      {
        num: 2,
        title: 'Align White Beam',
        instruction: 'Direct the narrow white beam toward the first optical face of the 60° crown glass prism at an incident angle of 45°.',
        actionKey: 'align_beam'
      },
      {
        num: 3,
        title: 'Observe Refraction',
        instruction: 'Notice that light bends toward the surface normal as it enters denser glass (n=1.52) from air (n=1.00).',
        actionKey: 'observe_refraction'
      },
      {
        num: 4,
        title: 'Observe Chromatic Dispersion',
        instruction: 'Look at the white projection screen: violet light (shorter wavelength ~400nm) bends the most, while red (~700nm) bends the least, fanning into a vivid rainbow.',
        actionKey: 'observe_rainbow'
      }
    ],
    scientificPrinciples: 'When light travels between media of different refractive indices, its speed changes, bending according to Snell\'s Law. Because the refractive index of glass varies with wavelength (dispersion), shorter violet wavelengths encounter a higher refractive index and refract at sharper angles than longer red wavelengths, separating white light into its spectral constituents.',
    realWorldApplications: 'Spectroscopy instruments aboard space telescopes (like James Webb and Hubble) use prisms and diffraction gratings to identify chemical elements in distant stars and exoplanet atmospheres.',
    quiz: [
      {
        question: 'Which color of visible light undergoes the greatest deviation (bends the most) when passing through glass?',
        options: ['Red', 'Green', 'Yellow', 'Violet'],
        correctAnswer: 3,
        explanation: 'Violet light has the shortest wavelength (~400nm) and highest frequency in the visible spectrum, experiencing the highest refractive index in glass and bending the most.'
      },
      {
        question: 'What happens when light travels from air (n=1.00) into crown glass (n=1.52)?',
        options: ['It speeds up and bends away from the normal', 'It slows down and bends toward the normal', 'It maintains constant speed', 'It turns into sound waves'],
        correctAnswer: 1,
        explanation: 'Light slows down in an optically denser medium (v = c/n) and consequently bends toward the normal line perpendicular to the interface.'
      },
      {
        question: 'What is the phenomenon called when the angle of incidence exceeds the critical angle and no light escapes into the second medium?',
        options: ['Total Internal Reflection', 'Diffraction', 'Polarization', 'Interference'],
        correctAnswer: 0,
        explanation: 'Total Internal Reflection occurs when light traveling in a denser medium strikes a boundary at an angle greater than the critical angle, which is the foundational principle of fiber optic internet cables.'
      }
    ],
    initialParams: {
      incidentAngle: 45,
      prismMaterial: 'crown_glass',
      refractiveIndex: 1.52,
      lightSource: 'white_beam',
      showNormals: true,
      dispersionSpread: 1.0
    }
  },
  {
    id: 'electric_circuit_builder',
    title: 'DC Electric Circuit & Ohm\'s Law',
    subject: 'physics',
    stationId: 'physics_table',
    stationName: 'Electronics Workstation',
    gradeRange: 'Grades 6–12',
    difficulty: 'Beginner',
    tagline: 'Assemble voltage sources, resistors, and LED lamps to verify Ohm\'s Law and circuit continuity.',
    formula: 'V = I·R, Power P = V·I = I²·R',
    ppeRequired: {
      goggles: true,
      mask: false,
      gloves: true,
      coat: false,
      rationales: {
        goggles: 'Protects eyes from potential component rupture during short circuits.',
        gloves: 'Insulating gloves prevent electrostatic discharge and accidental thermal burns from overheated resistors.'
      }
    },
    equipmentNeeded: ['Variable DC Power Supply (0–12V)', 'Digital Multimeter', 'Resistor Decade Box (10Ω–10kΩ)', 'High-Luminance LED (2.0V forward)', 'Knife Switch', 'Breadboard & Banana Cables'],
    chemicalsNeeded: ['None'],
    steps: [
      {
        num: 1,
        title: 'Safety Preparation',
        instruction: 'Equip protective eye gear and ensure the main power switch is turned OFF before making wire connections.',
        safetyTip: 'Never connect the positive and negative terminals directly without a load resistor (short circuit).'
      },
      {
        num: 2,
        title: 'Build the Series Circuit',
        instruction: 'Connect the 9V battery terminal through the knife switch, into a 220Ω current-limiting resistor, and to the anode of the LED.',
        actionKey: 'wire_circuit'
      },
      {
        num: 3,
        title: 'Close the Switch',
        instruction: 'Close the knife switch to complete the conductive loop. Current begins flowing from positive to negative terminal.',
        actionKey: 'close_switch'
      },
      {
        num: 4,
        title: 'Measure with Multimeter',
        instruction: 'Switch multimeter to Ammeter mode in series to measure current (I ≈ 31.8 mA), then Voltmeter mode across the resistor (V ≈ 7.0V).',
        actionKey: 'measure_multimeter'
      }
    ],
    scientificPrinciples: 'Ohm\'s Law states that electric current through a conductor between two points is directly proportional to the voltage across the two points and inversely proportional to resistance (I = V/R). In a series circuit, current is identical at all points, while voltage divides among the components according to Kirchhoff\'s Voltage Law.',
    realWorldApplications: 'All electronic gadgets, smartphones, electric vehicles, and power grids rely on circuit design governed by Ohm\'s Law and Kirchhoff\'s laws.',
    quiz: [
      {
        question: 'If a 12V battery is connected across a 4Ω resistor, what current flows through the circuit?',
        options: ['0.33 A', '3.0 A', '16 A', '48 A'],
        correctAnswer: 1,
        explanation: 'According to Ohm\'s Law: I = V / R = 12V / 4Ω = 3.0 Amperes.'
      },
      {
        question: 'What happens to the brightness of two identical bulbs connected in series if one of them is removed from the circuit?',
        options: ['The other bulb shines twice as brightly', 'The other bulb goes out completely', 'The other bulb becomes red', 'Nothing changes'],
        correctAnswer: 1,
        explanation: 'Removing a bulb opens (breaks) the series circuit, interrupting current flow so the remaining bulb goes out completely.'
      },
      {
        question: 'Which instrument must be connected in PARALLEL across a component to measure electrical potential difference?',
        options: ['Ammeter', 'Voltmeter', 'Ohmmeter', 'Galvanometer in series'],
        correctAnswer: 1,
        explanation: 'A voltmeter has very high internal resistance and is connected in parallel across a component to measure voltage without drawing significant current.'
      }
    ],
    initialParams: {
      batteryVoltage: 9.0,
      resistorValue: 220,
      isSwitchClosed: false,
      ledIlluminated: false,
      measuredCurrent: 0.0,
      measuredVoltageDrop: 0.0
    }
  },

  // --- BIOLOGY ---
  {
    id: 'cell_microscopy_onion',
    title: 'Plant Cell Microscopy (Onion Epidermis)',
    subject: 'biology',
    stationId: 'biology_desk',
    stationName: 'Microscopy Workstation',
    gradeRange: 'Grades 6–11',
    difficulty: 'Beginner',
    tagline: 'Prepare a wet mount slide, stain with iodine, and resolve cell walls, cytoplasm, and nuclei at 100x and 400x.',
    formula: 'Total Magnification = Ocular (10x) × Objective (10x or 40x) = 100x / 400x',
    ppeRequired: {
      goggles: true,
      mask: false,
      gloves: true,
      coat: true,
      rationales: {
        goggles: 'Protects eyes from chemical iodine stain splashes.',
        gloves: 'Iodine reagent stains skin and nails brown.',
        coat: 'Prevents indelible staining of clothing.'
      }
    },
    equipmentNeeded: ['Compound Optical Microscope', 'Glass Slides & Coverslips', 'Fine Forceps & Scalpel', 'Dropper Bottle of Iodine Solution', 'Bibulous Paper'],
    chemicalsNeeded: ['Lugol\'s Iodine Staining Solution (I₂-KI)', 'Deionized Water'],
    steps: [
      {
        num: 1,
        title: 'Safety Check',
        instruction: 'Put on gloves and safety goggles before handling iodine stain.',
        safetyTip: 'Handle glass coverslips by edges to prevent breakage and fingerprints.'
      },
      {
        num: 2,
        title: 'Peel Epidermal Tissue',
        instruction: 'Use forceps to peel a transparent single-cell layer membrane from the concave surface of an onion bulb scale.',
        actionKey: 'peel_onion'
      },
      {
        num: 3,
        title: 'Prepare Wet Mount',
        instruction: 'Place the membrane flat on the slide, add one drop of water and one drop of iodine stain, then lower coverslip at 45° to prevent air bubbles.',
        actionKey: 'mount_coverslip'
      },
      {
        num: 4,
        title: 'Focus at Low Power (100x)',
        instruction: 'Mount slide on mechanical stage, switch to 10x objective, and rotate coarse focus until regular brick-like cell patterns appear.',
        actionKey: 'focus_low'
      },
      {
        num: 5,
        title: 'High Power Resolution (400x)',
        instruction: 'Switch to 40x high-dry objective, adjust fine focus and iris diaphragm to clearly resolve the cell wall, large central vacuole, and prominent stained nucleus.',
        actionKey: 'focus_high'
      }
    ],
    scientificPrinciples: 'Plant cells are characterized by a rigid cellulose cell wall, plasma membrane, large central vacuole, and nucleus. Lugol\'s iodine binds to starch granules and nuclear proteins, increasing optical contrast so translucent organelles become clearly visible under brightfield illumination.',
    realWorldApplications: 'Pathology and medical laboratories rely on biological staining and optical microscopy to diagnose infections, blood disorders like malaria, and identify malignant tissue cells.',
    quiz: [
      {
        question: 'Which organelle is present in plant cells (like onion cells) but completely absent in human animal cells?',
        options: ['Cellulose Cell Wall', 'Mitochondria', 'Cell Nucleus', 'Ribosomes'],
        correctAnswer: 0,
        explanation: 'Plant cells have a rigid outer cellulose cell wall that provides structural support and prevents osmotic bursting, which animal cells lack.'
      },
      {
        question: 'What is the total magnification when using a 10x ocular lens and a 40x objective lens?',
        options: ['40x', '50x', '400x', '4000x'],
        correctAnswer: 2,
        explanation: 'Total magnification = Ocular Magnification × Objective Magnification = 10 × 40 = 400x.'
      },
      {
        question: 'Why is iodine stain added to the onion epidermal peel before viewing?',
        options: ['To preserve the cells from decaying', 'To increase contrast by staining starch and nuclear proteins brown', 'To make cells divide rapidly', 'To kill bacteria on the glass'],
        correctAnswer: 1,
        explanation: 'Living plant cells are almost completely transparent; staining provides optical contrast by binding to specific cellular components.'
      }
    ],
    initialParams: {
      isSlideMounted: false,
      isStained: false,
      magnification: 100,
      focusSharpness: 0.2,
      irisIllumination: 80,
      visibleStructures: ['cell_wall', 'cytoplasm']
    }
  },

  // --- GENERAL SCIENCE ---
  {
    id: 'liquid_density_column',
    title: 'Multi-Layer Liquid Density Column',
    subject: 'general',
    stationId: 'general_bench',
    stationName: 'General Science Desk',
    gradeRange: 'Grades 4–9',
    difficulty: 'Beginner',
    tagline: 'Layer liquids of differing densities and predict where solid objects settle in buoyant equilibrium.',
    formula: 'Density ρ = Mass / Volume (g/cm³), Buoyant Force F_b = ρ_fluid · V_displaced · g',
    ppeRequired: {
      goggles: true,
      mask: false,
      gloves: true,
      coat: false,
      rationales: {
        goggles: 'Protects eyes from accidental splash during layering.',
        gloves: 'Keeps hands clean from sticky honey and food dyes.'
      }
    },
    equipmentNeeded: ['500mL Graduated Glass Cylinder', 'Liquid Dispensers with Pour Spouts', 'Tweezers / Tongs'],
    chemicalsNeeded: ['Natural Honey (1.42 g/cm³)', 'Dish Soap (1.06 g/cm³)', 'Colored Water (1.00 g/cm³)', 'Vegetable Oil (0.92 g/cm³)', 'Rubbing Alcohol (0.79 g/cm³)'],
    steps: [
      {
        num: 1,
        title: 'Safety Gear',
        instruction: 'Put on safety goggles and gloves.',
        safetyTip: 'Pour liquids slowly down the inside wall of the cylinder to prevent mixing.'
      },
      {
        num: 2,
        title: 'Layer the Densest Liquid',
        instruction: 'Pour 60mL of natural honey (ρ = 1.42 g/cm³) directly into the bottom of the cylinder.',
        actionKey: 'pour_honey'
      },
      {
        num: 3,
        title: 'Add Subsequent Layers',
        instruction: 'Carefully layer dish soap (1.06), dyed water (1.00), vegetable oil (0.92), and colored rubbing alcohol (0.79).',
        actionKey: 'layer_liquids'
      },
      {
        num: 4,
        title: 'Drop Test Objects',
        instruction: 'Gently drop a copper bolt (8.9), grape (1.1), plastic bead (0.95), and cork (0.24) and observe where each comes to rest.',
        actionKey: 'drop_objects'
      }
    ],
    scientificPrinciples: 'Density is the mass per unit volume of a substance. Immiscible liquids of different densities naturally settle with the densest at the bottom and least dense at the top. An immersed solid object will sink through liquids that are less dense than itself, but float upon any liquid that is denser than itself according to Archimedes\' Principle of buoyancy.',
    realWorldApplications: 'Naval architects design massive steel ships to float by shaping the hull so its overall average density (including air pockets) is lower than seawater. Oil spill containment booms skim less-dense crude oil floating on ocean surfaces.',
    quiz: [
      {
        question: 'Where will an object with a density of 0.95 g/cm³ come to rest in a density column?',
        options: ['At the very bottom below honey', 'Floating on top of the rubbing alcohol', 'Resting on water (1.00 g/cm³) below vegetable oil (0.92 g/cm³)', 'It will dissolve into air'],
        correctAnswer: 2,
        explanation: 'Because 0.95 is denser than oil (0.92), it sinks through oil; but because it is less dense than water (1.00), it floats on water, coming to rest at the oil-water interface.'
      },
      {
        question: 'Why does ice float on liquid water?',
        options: ['Ice has more mass than water', 'Water expands as it freezes, making solid ice less dense (~0.92 g/cm³) than liquid water (1.00 g/cm³)', 'Ice contains air bubbles', 'Gravity does not affect frozen items'],
        correctAnswer: 1,
        explanation: 'Hydrogen bonds create a rigid hexagonal open lattice when water freezes, expanding its volume and lowering its density so ice floats.'
      },
      {
        question: 'What is the density of an unknown mineral with a mass of 150 grams and a volume of 30 cm³?',
        options: ['0.2 g/cm³', '5.0 g/cm³', '180 g/cm³', '4500 g/cm³'],
        correctAnswer: 1,
        explanation: 'Density = Mass / Volume = 150g / 30cm³ = 5.0 g/cm³.'
      }
    ],
    initialParams: {
      layersAdded: [],
      objectsDropped: [],
      columnBalanced: false
    }
  }
];

/**
 * Titration stoichiometric calculation:
 * Computes exact pH, H+ concentration, and color hex based on volume of 0.1M NaOH added to 25mL of 0.1M HCl.
 */
export function calculateTitrationState(volBaseAdded: number): {
  ph: number;
  hConc: number;
  ohConc: number;
  solutionColor: string;
  isEquivalence: boolean;
} {
  const vAcid = 25.0; // mL
  const mAcid = 0.10; // mol/L
  const mBase = 0.10; // mol/L
  const vTotal = vAcid + volBaseAdded; // mL

  const molesAcidInitial = (vAcid * mAcid) / 1000;
  const molesBaseAdded = (volBaseAdded * mBase) / 1000;

  let ph = 7.0;
  let hConc = 1e-7;
  let ohConc = 1e-7;

  if (molesBaseAdded < molesAcidInitial) {
    // Acidic region
    const molesAcidRemaining = molesAcidInitial - molesBaseAdded;
    hConc = molesAcidRemaining / (vTotal / 1000);
    ph = -Math.log10(Math.max(hConc, 1e-14));
    ohConc = 1e-14 / hConc;
  } else if (molesBaseAdded > molesAcidInitial) {
    // Basic region
    const molesBaseExcess = molesBaseAdded - molesAcidInitial;
    ohConc = molesBaseExcess / (vTotal / 1000);
    const pOh = -Math.log10(Math.max(ohConc, 1e-14));
    ph = 14.0 - pOh;
    hConc = 1e-14 / ohConc;
  } else {
    // Equivalence point exactly
    ph = 7.0;
    hConc = 1e-7;
    ohConc = 1e-7;
  }

  // Phenolphthalein color transition
  let solutionColor = '#FFFFFF';
  if (ph < 8.2) {
    solutionColor = '#FFFFFF'; // Colorless
  } else if (ph >= 8.2 && ph < 8.5) {
    solutionColor = '#FCE7F3'; // Very faint blush pink (endpoint)
  } else if (ph >= 8.5 && ph < 9.5) {
    solutionColor = '#F472B6'; // Soft pink
  } else {
    solutionColor = '#DB2777'; // Vivid magenta pink
  }

  const isEquivalence = Math.abs(volBaseAdded - 25.0) < 0.05;

  return {
    ph: Math.min(14, Math.max(0, parseFloat(ph.toFixed(2)))),
    hConc,
    ohConc,
    solutionColor,
    isEquivalence
  };
}

/**
 * Universal Indicator color lookup from pH value (1-14)
 */
export function getUniversalIndicatorColor(ph: number): { hex: string; name: string } {
  if (ph <= 2) return { hex: '#E11D48', name: 'Deep Crimson Red (Strong Acid)' };
  if (ph <= 4) return { hex: '#F97316', name: 'Bright Orange (Moderate Acid)' };
  if (ph <= 6) return { hex: '#FBBF24', name: 'Yellow-Green (Weak Acid)' };
  if (ph <= 7.5) return { hex: '#10B981', name: 'Emerald Green (Neutral)' };
  if (ph <= 9) return { hex: '#3B82F6', name: 'Cyan Blue (Weak Base)' };
  if (ph <= 11) return { hex: '#6366F1', name: 'Indigo (Moderate Base)' };
  return { hex: '#581C87', name: 'Deep Purple / Violet (Strong Base)' };
}
