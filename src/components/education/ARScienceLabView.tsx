import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Camera, 
  FlaskConical, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  Info, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Search, 
  Eye, 
  Heart, 
  Activity, 
  Compass, 
  Sun, 
  Zap, 
  Flame, 
  Waves, 
  Atom, 
  Bookmark, 
  X, 
  ChevronRight, 
  Share2, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import ARViewMode from './ARViewMode';
import { PlanTier, PLANS } from '../../lib/billing';

export interface ARScienceLabViewProps {
  currentGrade?: string;
  onNavigateTab?: (tab: string) => void;
  currentTier?: PlanTier;
  onOpenPlans?: () => void;
}

export type SubjectCategory = 'all' | 'chemistry' | 'physics' | 'biology' | 'earth';
export type DifficultyLevel = 'all' | 'easy' | 'medium' | 'advanced';

export interface ExperimentItem {
  id: string;
  title: string;
  subject: 'chemistry' | 'physics' | 'biology' | 'earth';
  gradeRange: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tagline: string;
  formula?: string;
  equipment: string[];
  principles: string;
  realWorldApp: string;
  arModelType: 'anatomy' | 'engineering';
  arModelId?: string;
  initialParams: Record<string, number | string>;
  paramConfig: {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
  }[];
  steps: string[];
  scientificTakeaways: string[];
}

export const EXPERIMENTS_CATALOG: ExperimentItem[] = [
  {
    id: 'acid_base_titration',
    title: 'Acid-Base Neutralization & Color Titration',
    subject: 'chemistry',
    gradeRange: 'Grades 7–12',
    difficulty: 'medium',
    icon: FlaskConical,
    tagline: 'Observe stoichiometric equivalence and phenolphthalein color transition from clear to vivid pink.',
    formula: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + 57.3 kJ/mol',
    equipment: ['50ml Precision Buret', '250ml Erlenmeyer Flask', 'Digital pH Sensor', 'Magnetic Stirrer Plate'],
    principles: 'Neutralization between strong acid (HCl) and strong base (NaOH) produces water and salt. The equivalence point occurs at exactly pH 7.0 at 25°C.',
    realWorldApp: 'Water treatment plants use chemical neutralization to adjust drinking water pH before municipal distribution.',
    arModelType: 'anatomy',
    arModelId: 'heart',
    initialParams: { acidVolume: 25, baseAdded: 24.5, indicator: 'Phenolphthalein' },
    paramConfig: [
      { key: 'baseAdded', label: 'NaOH Base Titrant Added', min: 0, max: 50, step: 0.5, unit: 'mL' },
      { key: 'temperature', label: 'Solution Temperature', min: 20, max: 45, step: 1, unit: '°C' }
    ],
    steps: [
      'Fill the buret with 0.1M standard sodium hydroxide solution.',
      'Pipette exactly 25.0 mL of hydrochloric acid into the conical flask.',
      'Add 2–3 drops of phenolphthalein indicator solution.',
      'Slowly open buret stopcock while continuously swirling the reaction vessel.',
      'Notice transient pink blooms until one single drop imparts a permanent faint pink tint at pH 8.2.'
    ],
    scientificTakeaways: [
      'pH < 7 indicates excess hydronium [H₃O⁺] ions.',
      'pH = 7 represents stoichiometric neutralization.',
      'The reaction is exothermic, releasing approximately 57.3 kJ per mole of water formed.'
    ]
  },
  {
    id: 'magnesium_flame',
    title: 'Magnesium Oxidation & Thermal Flash',
    subject: 'chemistry',
    gradeRange: 'Grades 6–10',
    difficulty: 'easy',
    icon: Flame,
    tagline: 'Experience radiant chemical combustion producing intense ultraviolet/white emission and white MgO powder.',
    formula: '2Mg(s) + O₂(g) → 2MgO(s) + ΔH (-1204 kJ/mol)',
    equipment: ['Magnesium Ribbon Strip', 'Crucible Tongs', 'Laboratory Bunsen Burner', 'Sandpaper Strip'],
    principles: 'Magnesium metal reacts exothermically with atmospheric oxygen. Electrons transition between outer s-orbitals producing high-intensity broad-spectrum photons.',
    realWorldApp: 'Emergency marine rescue flares and fireworks utilize magnesium powder for brilliant white signaling illumination.',
    arModelType: 'anatomy',
    arModelId: 'lungs',
    initialParams: { ribbonLength: 5, burnerIntensity: 75 },
    paramConfig: [
      { key: 'ribbonLength', label: 'Magnesium Ribbon Length', min: 2, max: 10, step: 1, unit: 'cm' },
      { key: 'burnerIntensity', label: 'Flame Temperature', min: 400, max: 1200, step: 50, unit: '°C' }
    ],
    steps: [
      'Clean surface oxide layer off magnesium strip using fine sandpaper.',
      'Grasp ribbon end securely using laboratory crucible tongs.',
      'Hold the ribbon tip into the oxidizing blue cone of the Bunsen burner.',
      'Observe rapid ignition followed by an intense radiant white light flare.',
      'Examine the resulting brittle, powdery white magnesium oxide precipitate.'
    ],
    scientificTakeaways: [
      'Magnesium acts as a powerful reducing agent, giving up two valence electrons.',
      'The white smoke produced is composed of suspended microscopic MgO solid particulates.',
      'Direct visual observation requires protective optical shading due to UV emissions.'
    ]
  },
  {
    id: 'harmonic_pendulum',
    title: 'Harmonic Pendulum Oscillations & Gravity',
    subject: 'physics',
    gradeRange: 'Grades 6–12',
    difficulty: 'medium',
    icon: Activity,
    tagline: 'Investigate period timing, string length, and compare oscillations across Earth, Moon, and Mars gravity.',
    formula: 'T = 2π √(L / g) | f = 1 / T',
    equipment: ['Rigid Retort Stand', 'Inelastic Cord', 'Brass Bob Mass (100g)', 'Optical Photogate Timer'],
    principles: 'For small angular displacements (θ < 15°), the period of a simple pendulum depends strictly on cord length and gravitational field strength, independent of bob mass.',
    realWorldApp: 'Grandfather clocks and seismographs use pendulum dynamics to maintain precise time and detect tectonic wave vibrations.',
    arModelType: 'anatomy',
    arModelId: 'skeleton',
    initialParams: { cordLength: 1.0, gravityEnv: 9.8, bobMass: 100 },
    paramConfig: [
      { key: 'cordLength', label: 'Cord Length (L)', min: 0.2, max: 2.0, step: 0.1, unit: 'm' },
      { key: 'bobMass', label: 'Bob Mass (m)', min: 50, max: 500, step: 25, unit: 'g' }
    ],
    steps: [
      'Suspend the brass bob from the rigid clamp at a measured length of 1.0 meter.',
      'Displace the bob sideways by an angle of approximately 10 degrees.',
      'Release the bob smoothly from rest without introducing lateral wobble.',
      'Record time for 10 complete oscillations to minimize timing error.',
      'Compute experimental gravity g = 4π²L / T² and compare against 9.80 m/s².'
    ],
    scientificTakeaways: [
      'Doubling cord length increases the period by a factor of √2 ≈ 1.414.',
      'Bob mass does not influence the period under small angle approximations.',
      'On the Moon (g = 1.62 m/s²), the pendulum swings much slower (period is ~2.46× longer).'
    ]
  },
  {
    id: 'optical_lens_refraction',
    title: 'Convex & Concave Optical Ray Refraction',
    subject: 'physics',
    gradeRange: 'Grades 8–12',
    difficulty: 'advanced',
    icon: Sun,
    tagline: 'Track light rays through converging and diverging lenses with real-time focal length calculation.',
    formula: '1/f = 1/v - 1/u | Magnification m = v / u',
    equipment: ['Optical Precision Rail', 'Collimated Red Laser (650nm)', 'Biconvex Lens (f = +15cm)', 'Frosted Image Screen'],
    principles: 'Refraction occurs when light transitions between optical media of differing refractive indices according to Snell’s Law (n₁ sin θ₁ = n₂ sin θ₂).',
    realWorldApp: 'Eyeglasses, camera lenses, microscopes, and the human eye lens all manipulate light using convex and concave geometries.',
    arModelType: 'anatomy',
    arModelId: 'brain',
    initialParams: { objectDistance: 30, focalLength: 15 },
    paramConfig: [
      { key: 'objectDistance', label: 'Object Distance (u)', min: 10, max: 60, step: 2, unit: 'cm' },
      { key: 'focalLength', label: 'Lens Focal Length (f)', min: 10, max: 30, step: 5, unit: 'cm' }
    ],
    steps: [
      'Align the luminous object source along the principal axis of the optical rail.',
      'Position the biconvex lens at a fixed distance u from the object.',
      'Adjust the frosted screen until a sharply focused inverted image is captured.',
      'Measure image distance v and verify with the thin lens formula 1/f = 1/v - 1/u.',
      'Observe virtual, erect image formation when object is placed inside the focal point (u < f).'
    ],
    scientificTakeaways: [
      'When u > 2f, the image is real, inverted, and diminished.',
      'When u = 2f, image size exactly equals object size (m = 1).',
      'When u < f, the lens acts as a magnifying glass creating an upright virtual image.'
    ]
  },
  {
    id: 'electric_circuit_ohms_law',
    title: 'DC Electric Circuit & Ohm’s Law',
    subject: 'physics',
    gradeRange: 'Grades 5–10',
    difficulty: 'easy',
    icon: Zap,
    tagline: 'Construct a closed circuit, adjust battery voltage and resistance, and observe bulb filament luminescence.',
    formula: 'V = I × R | Electrical Power P = V × I = I²R',
    equipment: ['Adjustable DC Power Supply', 'SPST Knife Switch', 'Ceramic Resistors (10Ω–100Ω)', 'Tungsten Filament Lamp', 'Digital Multimeter'],
    principles: 'Current (I) through a conductor between two points is directly proportional to voltage (V) and inversely proportional to resistance (R).',
    realWorldApp: 'Household electrical grids, phone chargers, and electric vehicles operate on closed-circuit Ohm’s law principles.',
    arModelType: 'engineering',
    arModelId: 'rover',
    initialParams: { voltage: 6.0, resistance: 15 },
    paramConfig: [
      { key: 'voltage', label: 'DC Voltage (V)', min: 1.5, max: 12.0, step: 0.5, unit: 'V' },
      { key: 'resistance', label: 'Circuit Resistance (R)', min: 5, max: 50, step: 1, unit: 'Ω' }
    ],
    steps: [
      'Connect the positive battery terminal to the open knife switch terminal.',
      'Route wiring from switch to the tungsten lamp holder.',
      'Insert the ceramic load resistor in series and complete circuit to ground.',
      'Close switch: current flows immediately at speed of light propagation.',
      'Increase voltage slider: observe how current and filament wattage increase proportionally.'
    ],
    scientificTakeaways: [
      'Current is measured in Amperes (Coulombs per second).',
      'Filament temperature and brightness scale directly with dissipated electrical power (P = I²R).',
      'Opening the switch creates an infinite air resistance gap, dropping current to exactly 0A.'
    ]
  },
  {
    id: 'cardiac_anatomy_circulation',
    title: 'Human Cardiac 4-Chamber Cycle & Blood Flow',
    subject: 'biology',
    gradeRange: 'Grades 6–12',
    difficulty: 'advanced',
    icon: Heart,
    tagline: 'Track oxygenated and deoxygenated blood circuits through the atria, ventricles, and coronary vessels in real-time.',
    formula: 'Cardiac Output = Heart Rate (BPM) × Stroke Volume (~70mL)',
    equipment: ['3D Anatomical Heart Specimen', 'Spatial Cross-Section Slicer', 'Electrocardiogram (ECG) Monitor', 'Coronary Vessel Flow Tracker'],
    principles: 'The heart acts as a dual-action biological muscular pump. The right side pumps deoxygenated blood to pulmonary lungs; the left side drives oxygen-rich blood through systemic aorta.',
    realWorldApp: 'Cardiologists analyze valve sound murmurs and ECG wave intervals to detect arrhythmias and hypertension.',
    arModelType: 'anatomy',
    arModelId: 'heart',
    initialParams: { heartRate: 72, strokeVolume: 70 },
    paramConfig: [
      { key: 'heartRate', label: 'Heart Rate (BPM)', min: 45, max: 180, step: 5, unit: 'BPM' },
      { key: 'strokeVolume', label: 'Stroke Volume', min: 50, max: 110, step: 5, unit: 'mL' }
    ],
    steps: [
      'Anchor 3D Heart model on your laboratory workbench or desk in AR.',
      'Identify the Superior/Inferior Vena Cava and Right Atrium.',
      'Trace deoxygenated blood into the Right Ventricle and out Pulmonary Arteries.',
      'Trace oxygenated blood returning via Pulmonary Veins into Left Ventricle and Aorta.',
      'Adjust BPM slider to observe accelerated systolic contraction and diastolic filling.'
    ],
    scientificTakeaways: [
      'Tricuspid and Bicuspid (Mitral) atrioventricular valves prevent backflow.',
      'The left ventricular myocardium is ~3× thicker than the right due to high systemic pressure.',
      'At 72 BPM, the heart pumps ~5.0 Liters of blood every minute, circulating total blood volume.'
    ]
  },
  {
    id: 'respiratory_alveolar_exchange',
    title: 'Human Respiratory Lungs & Gas Exchange',
    subject: 'biology',
    gradeRange: 'Grades 5–10',
    difficulty: 'medium',
    icon: Activity,
    tagline: 'Visualize diaphragm contraction, bronchial ventilation, and oxygen diffusion across microscopic alveoli.',
    formula: 'Inhaled Air (~21% O₂, 0.04% CO₂) → Exhaled Air (~16% O₂, 4% CO₂)',
    equipment: ['3D Bronchial Tree Model', 'Alveolar Capillary Cross-Section', 'Digital Spirometer', 'Pleural Cavity Vacuum Gauge'],
    principles: 'Inhalation is driven by active diaphragm contraction lowering thoracic pressure (Boyle’s law P₁V₁ = P₂V₂), allowing atmospheric air to rush into lungs.',
    realWorldApp: 'Pulmonologists use spirometry curves to evaluate asthma, COPD, and lung vital capacity.',
    arModelType: 'anatomy',
    arModelId: 'lungs',
    initialParams: { breathingRate: 14, tidalVolume: 500 },
    paramConfig: [
      { key: 'breathingRate', label: 'Breathing Rate', min: 8, max: 35, step: 1, unit: 'breaths/min' },
      { key: 'tidalVolume', label: 'Tidal Volume', min: 300, max: 800, step: 50, unit: 'mL' }
    ],
    steps: [
      'Observe the trachea branching into left and right primary bronchi.',
      'Trace bronchi branching into bronchioles leading to alveolar sacs.',
      'Observe diaphragm moving downward during inhalation, expanding thoracic cavity.',
      'Examine capillary bed surrounding alveoli where oxygen binds to red blood cell hemoglobin.',
      'Watch passive relaxation of diaphragm during exhalation.'
    ],
    scientificTakeaways: [
      'Total surface area of human alveoli spans ~70 square meters (half a tennis court!).',
      'Gas exchange operates purely via passive diffusion across microscopic 0.5-micron membranes.',
      'Carbon dioxide concentration in blood serves as the primary chemical trigger for respiratory rate.'
    ]
  },
  {
    id: 'plant_photosynthesis',
    title: 'Plant Cell Photosynthesis & Chloroplasts',
    subject: 'biology',
    gradeRange: 'Grades 6–11',
    difficulty: 'medium',
    icon: Sparkles,
    tagline: 'Simulate solar energy absorption in chloroplast thylakoids and count oxygen bubble evolution.',
    formula: '6CO₂ + 6H₂O + Photons (Light) → C₆H₁₂O₆ (Glucose) + 6O₂↑',
    equipment: ['Hydrilla Plant Specimen', 'Inverted Glass Funnel', 'Test Tube Collector', 'Adjustable LED Lamp (400–700nm)', 'Sodium Bicarbonate Reagent'],
    principles: 'Chlorophyll pigments inside chloroplast thylakoid membranes absorb blue and red light wavelengths, splitting water molecules (photolysis) to generate ATP and oxygen.',
    realWorldApp: 'Agriculture researchers optimize greenhouse LED spectrums to maximize crop photosynthesis yields year-round.',
    arModelType: 'anatomy',
    arModelId: 'skeleton',
    initialParams: { lightIntensity: 80, co2Conc: 0.05 },
    paramConfig: [
      { key: 'lightIntensity', label: 'Light Intensity', min: 0, max: 100, step: 5, unit: '%' },
      { key: 'co2Conc', label: 'CO₂ Reagent Concentration', min: 0.01, max: 0.20, step: 0.01, unit: '%' }
    ],
    steps: [
      'Submerge fresh waterweed (Elodea or Hydrilla) under an inverted funnel in a beaker of water.',
      'Invert a water-filled test tube over the funnel stem to collect evolved gas.',
      'Position lamp at a distance of 10 cm from the beaker.',
      'Count bubbles of oxygen evolved per minute at varying light intensities.',
      'Test collected gas with a glowing wooden splint: it relights, confirming pure O₂.'
    ],
    scientificTakeaways: [
      'Light intensity increases photosynthetic rate until carbon dioxide becomes the limiting factor.',
      'Green light (~550nm) is largely reflected by chlorophyll, giving plants their green appearance.',
      'Photosynthesis supplies virtually all organic carbon and breathable oxygen on planet Earth.'
    ]
  },
  {
    id: 'volcano_magma_eruption',
    title: 'Volcanic Magma Chamber & Eruption Dynamics',
    subject: 'earth',
    gradeRange: 'Grades 4–9',
    difficulty: 'easy',
    icon: Flame,
    tagline: 'Examine magma chamber pressure, gas viscosity, and observe explosive pyroclastic vs effusive lava flow.',
    formula: 'Pressure P = ρgh + Gas Dissolution Expansion',
    equipment: ['Stratovolcano Geological Model', 'Magma Chamber Pressure Gauge', 'Gas Bubble Viscometer', 'Thermal Imaging Camera'],
    principles: 'Dissolved volcanic gases (H₂O, CO₂, SO₂) expand as magma rises toward low surface pressures. Viscous silica-rich magma traps gas bubbles until explosive mechanical failure occurs.',
    realWorldApp: 'Geophysicists monitor ground swelling and sulfur emissions to forecast volcanic eruptions and protect communities.',
    arModelType: 'engineering',
    arModelId: 'helicopter',
    initialParams: { chamberPressure: 45, silicaContent: 60 },
    paramConfig: [
      { key: 'chamberPressure', label: 'Chamber Pressure', min: 10, max: 100, step: 5, unit: 'MPa' },
      { key: 'silicaContent', label: 'Silica Viscosity', min: 45, max: 75, step: 5, unit: '%' }
    ],
    steps: [
      'Anchor 3D Volcano cross-section in AR on the floor or table.',
      'Examine the subterranean magma reservoir, conduit pipe, and summit caldera.',
      'Increase chamber pressure slider to simulate rising magma and gas accumulation.',
      'Observe seismic micro-fractures in surrounding bedrock.',
      'Trigger eruption: watch explosive column reach stratosphere or fluid basaltic lava flow.'
    ],
    scientificTakeaways: [
      'Low silica basaltic magma (like Hawaii) produces gentle, effusive fluid lava fountains.',
      'High silica rhyolitic magma traps violent gases, producing catastrophic explosive ash columns.',
      'Volcanic soils are exceptionally fertile due to rich iron, magnesium, and potassium minerals.'
    ]
  }
];

export default function ARScienceLabView({
  currentGrade = 'Grade 8',
  onNavigateTab,
  currentTier = 'starter',
  onOpenPlans
}: ARScienceLabViewProps) {
  // Mode selection: 'virtual_lab' vs 'ar_camera'
  const [labMode, setLabMode] = useState<'virtual_lab' | 'ar_camera'>('virtual_lab');

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'primary' | 'middle' | 'high'>('all');

  // Active experiment
  const [activeExperiment, setActiveExperiment] = useState<ExperimentItem>(EXPERIMENTS_CATALOG[0]);
  const [experimentParams, setExperimentParams] = useState<Record<string, number | string>>(
    EXPERIMENTS_CATALOG[0].initialParams
  );

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [observationLogs, setObservationLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' }>>([]);

  // Full-screen AR View overlay modal
  const [isLiveARActive, setIsLiveARActive] = useState(false);

  // Saved Experiments (persisted in localStorage)
  const [savedExperiments, setSavedExperiments] = useState<Array<{
    id: string;
    experimentTitle: string;
    date: string;
    notes: string;
    grade: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('neonova_saved_experiments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTabSubView, setActiveTabSubView] = useState<'catalog' | 'workbench' | 'saved'>('workbench');
  const [studentNotes, setStudentNotes] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // 3D Canvas Ref for Virtual Workbench
  const workbenchCanvasRef = useRef<HTMLDivElement>(null);

  // Filtered experiments catalog
  const filteredExperiments = useMemo(() => {
    return EXPERIMENTS_CATALOG.filter(exp => {
      if (selectedSubject !== 'all' && exp.subject !== selectedSubject) return false;
      if (selectedDifficulty !== 'all' && exp.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = exp.title.toLowerCase().includes(q) ||
          exp.tagline.toLowerCase().includes(q) ||
          exp.principles.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (gradeFilter === 'primary' && !exp.gradeRange.includes('4') && !exp.gradeRange.includes('5')) return false;
      if (gradeFilter === 'middle' && !exp.gradeRange.includes('6') && !exp.gradeRange.includes('7') && !exp.gradeRange.includes('8')) return false;
      if (gradeFilter === 'high' && !exp.gradeRange.includes('9') && !exp.gradeRange.includes('10') && !exp.gradeRange.includes('11') && !exp.gradeRange.includes('12')) return false;
      return true;
    });
  }, [selectedSubject, selectedDifficulty, searchQuery, gradeFilter]);

  // When active experiment changes, reset params and simulation
  const handleSelectExperiment = (exp: ExperimentItem) => {
    setActiveExperiment(exp);
    setExperimentParams(exp.initialParams);
    setIsSimulating(false);
    setSimTime(0);
    setObservationLogs([
      { time: '00:00', text: `Loaded experiment: ${exp.title}. Ready on workbench.`, type: 'info' }
    ]);
    setActiveTabSubView('workbench');
  };

  // Simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimTime(prev => {
          const next = prev + 1;
          // Generate realistic observations based on experiment and time
          if (next === 2) {
            setObservationLogs(logs => [
              { time: '00:02', text: 'Reaction / oscillation cycle initiated. Monitoring kinetic parameters.', type: 'info' },
              ...logs
            ]);
          } else if (next === 5) {
            setObservationLogs(logs => [
              { time: '00:05', text: 'Steady-state equilibrium reached. Data logged with scientific sensors.', type: 'success' },
              ...logs
            ]);
          } else if (next === 10) {
            setObservationLogs(logs => [
              { time: '00:10', text: 'Cycle complete. Thermal and optical readings recorded.', type: 'info' },
              ...logs
            ]);
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  // Handle Save Experiment to Notebook
  const handleSaveToNotebook = () => {
    const newSave = {
      id: `exp-${Date.now()}`,
      experimentTitle: activeExperiment.title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      notes: studentNotes.trim() || `Conducted ${activeExperiment.title} using virtual equipment. Verified scientific takeaway principles.`,
      grade: currentGrade
    };

    const updated = [newSave, ...savedExperiments];
    setSavedExperiments(updated);
    try {
      localStorage.setItem('neonova_saved_experiments', JSON.stringify(updated));
    } catch {}

    setSaveSuccessMessage('Experiment saved to your Digital Lab Notebook!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
    setStudentNotes('');
  };

  // Handle Delete Saved Experiment
  const handleDeleteSaved = (id: string) => {
    const updated = savedExperiments.filter(item => item.id !== id);
    setSavedExperiments(updated);
    try {
      localStorage.setItem('neonova_saved_experiments', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* 1. TOP HEADER & AR MODE SWITCHER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-400/30">
              <Sparkles size={13} className="text-cyan-400" />
              <span>NEONOVA AR SCIENCE LAB • GRADES 1–12</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Interactive AR Science Lab</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm">
                STANDALONE
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Conduct scientifically grounded virtual experiments, manipulate laboratory equipment, and project 3D anatomical organs and physics apparatus directly onto your desk or floor using your device camera.
            </p>
          </div>

          {/* Mode Switcher & Launch AR Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Direct 1-Tap AR Camera Launch */}
            <button
              type="button"
              onClick={() => setIsLiveARActive(true)}
              className="py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Camera size={18} />
              <span>Launch AR Camera (Real World)</span>
            </button>

            {/* Sub-tab navigation */}
            <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 flex items-center">
              <button
                type="button"
                onClick={() => setActiveTabSubView('workbench')}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTabSubView === 'workbench'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical size={14} />
                <span>Workbench</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTabSubView('catalog')}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTabSubView === 'catalog'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen size={14} />
                <span>Experiments ({EXPERIMENTS_CATALOG.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTabSubView('saved')}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTabSubView === 'saved'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark size={14} />
                <span>Notebook ({savedExperiments.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-VIEW: WORKBENCH (ACTIVE EXPERIMENT LAB) */}
      {activeTabSubView === 'workbench' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLS: 3D INTERACTIVE LAB VIEWPORT & CONTROLS */}
          <div className="lg:col-span-8 space-y-4">
            {/* Viewport Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
              {/* Top Viewport Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <activeExperiment.icon size={22} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      {activeExperiment.title}
                    </h2>
                    <span className="text-xs text-indigo-600 font-semibold">
                      {activeExperiment.gradeRange} • {activeExperiment.subject.toUpperCase()} • {activeExperiment.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLiveARActive(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Project this specific experiment into your real-world room via camera"
                  >
                    <Camera size={14} className="text-cyan-600" />
                    <span>Project in AR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabSubView('catalog')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Tagline & Chemical / Physics Formula */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-medium">
                  {activeExperiment.tagline}
                </span>
                {activeExperiment.formula && (
                  <span className="font-mono font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-2xs whitespace-nowrap">
                    {activeExperiment.formula}
                  </span>
                )}
              </div>

              {/* Interactive Virtual Laboratory Canvas Simulation Display */}
              <div className="relative w-full h-[320px] sm:h-[400px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-white p-4 select-none">
                {/* Background Grid Lines simulating workbench */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                  }}
                />

                {/* Simulated Visual Representation */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-4">
                  <div className={`w-28 h-28 rounded-3xl bg-indigo-600/20 border-2 border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-2xl transition-transform ${isSimulating ? 'animate-pulse scale-105' : ''}`}>
                    <activeExperiment.icon size={56} className="text-cyan-400" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-bold">
                      {isSimulating ? 'Simulation Active • Reaction in Progress' : 'Simulation Paused / Standby'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200">
                      Virtual Laboratory Reaction Vessel
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Timer: <span className="font-mono font-bold text-white">{String(Math.floor(simTime / 60)).padStart(2, '0')}:{String(simTime % 60).padStart(2, '0')}</span> • Real-time kinetic physics & chemistry engine
                    </p>
                  </div>

                  {/* Quick Action in Viewport */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSimulating(!isSimulating)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                        isSimulating
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {isSimulating ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isSimulating ? 'Pause Reaction' : 'Start Experiment'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSimulating(false);
                        setSimTime(0);
                        setObservationLogs([
                          { time: '00:00', text: 'Experiment reset to initial conditions.', type: 'info' }
                        ]);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Reset parameters to initial values"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLiveARActive(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <Camera size={14} />
                      <span>Open Camera AR</span>
                    </button>
                  </div>
                </div>

                {/* Viewport Overlay Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-cyan-400 border border-cyan-500/30">
                    LAB ENGINE: READY
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-slate-300 border border-slate-700">
                    3D VIEWPORT
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-1 rounded">
                  FPS: 60 • WebGL Active
                </div>
              </div>

              {/* Experiment Parameter Controls */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Sliders size={14} className="text-indigo-600" />
                    <span>Adjust Experiment Variables & Chemical Reagents</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Real-time reaction recalculation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeExperiment.paramConfig.map((param) => {
                    const currentVal = Number(experimentParams[param.key] ?? param.min);
                    return (
                      <div key={param.key} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{param.label}</span>
                          <span className="font-mono font-bold text-indigo-700">
                            {currentVal} {param.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={currentVal}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setExperimentParams(prev => ({ ...prev, [param.key]: val }));
                            setObservationLogs(logs => [
                              { time: `00:${String(simTime % 60).padStart(2, '0')}`, text: `Adjusted ${param.label} to ${val} ${param.unit}.`, type: 'info' },
                              ...logs.slice(0, 8)
                            ]);
                          }}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Laboratory Equipment Inventory Used */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Virtual Laboratory Apparatus in this Experiment:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeExperiment.equipment.map((item, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step-by-Step Laboratory Instructions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" />
                <span>Step-by-Step Experimental Procedure</span>
              </h3>

              <div className="space-y-2.5">
                {activeExperiment.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: OBSERVATION TIMELINE, SCIENTIFIC EXPLANATION & SAVE */}
          <div className="lg:col-span-4 space-y-4">
            {/* Live Observation Log Timeline */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Activity size={14} className="text-indigo-600" />
                  <span>Observation Log Timeline</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  LIVE SENSORS
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {observationLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Start experiment to record sensor observations.
                  </p>
                ) : (
                  observationLogs.map((log, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-400">T+{log.time}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          log.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`} />
                      </div>
                      <p className="text-slate-700 text-[11px] leading-snug">
                        {log.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Scientific Explanation Card */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <Info size={15} className="text-indigo-600" />
                <span>Underlying Scientific Principles</span>
              </div>

              <p className="text-xs text-indigo-950/90 leading-relaxed">
                {activeExperiment.principles}
              </p>

              <div className="p-3 bg-white rounded-xl border border-indigo-200/60 text-xs space-y-1">
                <span className="font-bold text-slate-800 block text-[11px]">
                  Real-World Industrial Application:
                </span>
                <p className="text-slate-600 text-[11px]">
                  {activeExperiment.realWorldApp}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-indigo-900 block">
                  Key Takeaways for {currentGrade}:
                </span>
                {activeExperiment.scientificTakeaways.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Experiment to Digital Lab Notebook */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bookmark size={15} className="text-indigo-600" />
                <span>Save to Student Lab Notebook</span>
              </h3>

              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Enter personal experiment notes, observations, or conclusions..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />

              {saveSuccessMessage && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveToNotebook}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bookmark size={14} />
                <span>Save Experiment Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-VIEW: EXPERIMENTS CATALOG */}
      {activeTabSubView === 'catalog' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experiments by topic, formula, or concept..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Grade Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  Grade Level:
                </span>
                {[
                  { id: 'all', label: 'All Grades' },
                  { id: 'primary', label: 'Grades 1–5' },
                  { id: 'middle', label: 'Grades 6–8' },
                  { id: 'high', label: 'Grades 9–12' }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGradeFilter(g.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      gradeFilter === g.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
              {[
                { id: 'all', label: 'All Subjects', icon: Layers },
                { id: 'chemistry', label: 'Chemistry', icon: FlaskConical },
                { id: 'physics', label: 'Physics', icon: Zap },
                { id: 'biology', label: 'Biology', icon: Heart },
                { id: 'earth', label: 'Earth & Space', icon: Sun }
              ].map(sub => {
                const Icon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubject(sub.id as SubjectCategory)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      selectedSubject === sub.id
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon size={14} className={selectedSubject === sub.id ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of Experiment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExperiments.map(exp => {
              const Icon = exp.icon;
              return (
                <div
                  key={exp.id}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors">
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {exp.difficulty}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                        {exp.title}
                      </h4>
                      <span className="text-[11px] text-indigo-600 font-semibold block">
                        {exp.gradeRange} • {exp.subject.toUpperCase()}
                      </span>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                        {exp.tagline}
                      </p>
                    </div>

                    {exp.formula && (
                      <div className="p-2 bg-slate-50 rounded-xl font-mono text-[11px] text-slate-700 border border-slate-100 truncate">
                        {exp.formula}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectExperiment(exp)}
                      className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FlaskConical size={14} />
                      <span>Open in Workbench</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectExperiment(exp);
                        setIsLiveARActive(true);
                      }}
                      className="py-2 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      title="Direct AR camera launch"
                    >
                      <Camera size={14} />
                      <span>AR</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SUB-VIEW: SAVED EXPERIMENTS & NOTEBOOK */}
      {activeTabSubView === 'saved' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bookmark size={18} className="text-indigo-600" />
                <span>Student Digital Lab Notebook</span>
              </h3>
              <p className="text-xs text-slate-500">
                All saved observations, experimental parameters, and conclusions saved during your AR science lab sessions.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              {savedExperiments.length} Records
            </span>
          </div>

          {savedExperiments.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <Bookmark size={32} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Saved Experiments Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Conduct an experiment in the Workbench or in AR Mode, write your observations, and click "Save Experiment Record" to build your portfolio.
              </p>
              <button
                type="button"
                onClick={() => setActiveTabSubView('workbench')}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Go to Virtual Workbench
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedExperiments.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{item.experimentTitle}</span>
                      <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {item.grade}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Recorded on: {item.date}
                    </span>
                    <p className="text-xs text-slate-600 pt-1">
                      "{item.notes}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const matched = EXPERIMENTS_CATALOG.find(e => e.title === item.experimentTitle);
                        if (matched) handleSelectExperiment(matched);
                        else setActiveTabSubView('workbench');
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Re-run Experiment
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. FULL-SCREEN IMMERSIVE LIVE AR CAMERA OVERLAY */}
      {isLiveARActive && (
        <ARViewMode
          initialModelType={activeExperiment.arModelType}
          initialAnatomyModelId={activeExperiment.arModelId || 'heart'}
          onClose={() => setIsLiveARActive(false)}
          onSwitchToStudio={() => {
            setIsLiveARActive(false);
            setActiveTabSubView('workbench');
          }}
        />
      )}
    </div>
  );
}
