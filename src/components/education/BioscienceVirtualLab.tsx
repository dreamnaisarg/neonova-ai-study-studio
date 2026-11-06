import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Dna,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Eye,
  Bot,
  Award,
  Layers,
  Activity,
  Atom,
  Info,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Check,
  ShieldCheck,
  Flame,
  Droplets,
  Search,
  Zap,
  Bookmark
} from 'lucide-react';
import { saveBioscienceExperiment } from '../../lib/firebase';

export interface BioscienceStructure {
  id: string;
  name: string;
  category: 'genetics' | 'cellular' | 'biochemistry' | 'structural';
  tagline: string;
  description: string;
  keyParts: { name: string; description: string; color: string }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  curriculumGrade: string;
}

export const BIOSCIENCE_STRUCTURES: BioscienceStructure[] = [
  {
    id: 'dna_helix',
    name: 'DNA Double Helix & Base Pairing',
    category: 'genetics',
    tagline: 'The molecular blueprint of all living organisms',
    description: 'Deoxyribonucleic Acid (DNA) is a double-stranded helical polymer composed of nucleotide building blocks. The sugar-phosphate backbone forms the outer structural frame, while complementary nitrogenous bases (Adenine-Thymine with 2 H-bonds, Guanine-Cytosine with 3 H-bonds) pair across the central axis in major and minor grooves.',
    keyParts: [
      { name: 'Sugar-Phosphate Backbone', description: 'Repeating alternating units of deoxyribose sugar and phosphate groups providing structural integrity.', color: '#0284c7' },
      { name: 'Adenine (A) = Thymine (T)', description: 'Purine-pyrimidine pair bonded by 2 hydrogen bonds (Green & Red).', color: '#10b981' },
      { name: 'Guanine (G) ≡ Cytosine (C)', description: 'Purine-pyrimidine pair bonded by 3 hydrogen bonds (Yellow & Blue).', color: '#f59e0b' },
      { name: 'Major & Minor Grooves', description: 'Differential spacing between helical twists allowing transcription factors and DNA polymerases to bind.', color: '#8b5cf6' }
    ],
    quiz: [
      {
        question: 'Which rule governs complementary base pairing in a standard DNA double helix?',
        options: ['Adenine pairs with Guanine', 'Adenine pairs with Thymine, Guanine with Cytosine', 'Thymine pairs with Cytosine', 'Cytosine pairs with Uracil'],
        correctIndex: 1,
        explanation: 'Chargaff’s rule dictates that Adenine (A) always pairs with Thymine (T) via 2 hydrogen bonds, and Guanine (G) pairs with Cytosine (C) via 3 hydrogen bonds.'
      },
      {
        question: 'What constitutes the outer structural backbone of the DNA molecule?',
        options: ['Polypeptide chains', 'Alternating deoxyribose sugar and phosphate groups', 'Lipid bilayers', 'Ribosomal RNA subunits'],
        correctIndex: 1,
        explanation: 'The outer helical rails are constructed from repeating units of deoxyribose pentose sugar and negatively charged phosphate groups.'
      }
    ],
    curriculumGrade: 'Grades 8–12'
  },
  {
    id: 'animal_cell',
    name: 'Eukaryotic Animal Cell',
    category: 'cellular',
    tagline: 'Membrane-bound organelles and cellular metabolism',
    description: 'Animal cells are eukaryotic cells featuring a distinct membrane-bound nucleus and specialized organelles. Mitochondria produce cellular ATP through oxidative phosphorylation, the endoplasmic reticulum and Golgi apparatus synthesize and transport proteins, while lysosomes digest cellular waste.',
    keyParts: [
      { name: 'Nucleus & Nucleolus', description: 'Houses chromatin genetic material; dense nucleolus produces ribosomal subunits.', color: '#4f46e5' },
      { name: 'Mitochondria (Cristae)', description: 'Cell powerhouse conducting cellular respiration (Krebs cycle & electron transport) to generate ATP.', color: '#ef4444' },
      { name: 'Endoplasmic Reticulum', description: 'Rough ER studded with ribosomes for protein synthesis; smooth ER synthesizes lipids.', color: '#06b6d4' },
      { name: 'Golgi Apparatus', description: 'Membranous cisternae sorting, modifying, and packaging proteins into vesicles.', color: '#d97706' },
      { name: 'Plasma Membrane', description: 'Selective phospholipid bilayer regulating molecular transit in and out.', color: '#10b981' }
    ],
    quiz: [
      {
        question: 'Which organelle is responsible for generating the majority of cellular ATP via cellular respiration?',
        options: ['Golgi Apparatus', 'Mitochondria', 'Endoplasmic Reticulum', 'Lysosome'],
        correctIndex: 1,
        explanation: 'Mitochondria are the primary sites of ATP production in eukaryotic cells through the citric acid cycle and oxidative phosphorylation across inner folded cristae.'
      },
      {
        question: 'What distinguishes the Rough Endoplasmic Reticulum from the Smooth ER?',
        options: ['Absence of membrane', 'Presence of ribosomes on its outer surface', 'Contains chlorophyll', 'Direct connection to vacuole'],
        correctIndex: 1,
        explanation: 'The Rough ER is studded with membrane-bound ribosomes that actively translate proteins destined for secretion or membrane insertion.'
      }
    ],
    curriculumGrade: 'Grades 6–12'
  },
  {
    id: 'plant_cell',
    name: 'Plant Cell Architecture & Chloroplast',
    category: 'cellular',
    tagline: 'Photosynthetic energy conversion and turgor mechanics',
    description: 'Plant cells differ from animal cells by having a rigid cellulose cell wall that prevents lysis, chloroplasts containing thylakoid membranes for photosynthesis, and a large central vacuole that maintains hydrostatic turgor pressure.',
    keyParts: [
      { name: 'Cellulose Cell Wall', description: 'Rigid protective outer layer maintaining cell structure and withstanding osmotic pressure.', color: '#15803d' },
      { name: 'Chloroplast (Thylakoids)', description: 'Site of photosynthesis containing chlorophyll pigments organized into thylakoid grana.', color: '#22c55e' },
      { name: 'Central Vacuole', description: 'Large fluid-filled reservoir regulating water balance, turgor pressure, and ion storage.', color: '#0284c7' },
      { name: 'Nucleus & Cytoplasm', description: 'Control center containing genomic DNA floating in aqueous metabolic cytosol.', color: '#6366f1' }
    ],
    quiz: [
      {
        question: 'Which organelle contains chlorophyll and converts solar photons into chemical glucose?',
        options: ['Central Vacuole', 'Chloroplast', 'Amyloplast', 'Peroxisome'],
        correctIndex: 1,
        explanation: 'Chloroplasts absorb sunlight within thylakoid grana to drive the light reactions and Calvin cycle of photosynthesis.'
      },
      {
        question: 'What provides rigid structural support to keep non-woody plants upright?',
        options: ['Collagen fibers', 'Turgor pressure against the cellulose cell wall', 'Microtubule actin filaments only', 'Chitin exoskeleton'],
        correctIndex: 1,
        explanation: 'Hydrostatic turgor pressure created by the water-filled central vacuole pressing against the rigid cellulose cell wall provides mechanical rigidity.'
      }
    ],
    curriculumGrade: 'Grades 6–12'
  },
  {
    id: 'enzyme_kinetics',
    name: 'Enzyme-Substrate Catalysis',
    category: 'biochemistry',
    tagline: 'Induced fit binding, transition states, and activation energy',
    description: 'Enzymes are specialized biological catalysts (typically globular proteins) that dramatically accelerate biochemical reactions by lowering the required activation energy (Ea). Substrates bind to the enzyme’s complementary active site pocket through an induced-fit mechanism.',
    keyParts: [
      { name: 'Enzyme Active Site', description: 'Specific 3D chemical pocket contoured with catalytic amino acid residues.', color: '#7c3aed' },
      { name: 'Substrate Complex', description: 'Reactant molecule shaped specifically to fit into the active site cleft.', color: '#ec4899' },
      { name: 'Transition State', description: 'High-energy strained conformation where chemical bonds are weakened and broken.', color: '#f59e0b' },
      { name: 'Catalyzed Products', description: 'Synthesized or cleaved product molecules releasing freely from the intact enzyme.', color: '#10b981' }
    ],
    quiz: [
      {
        question: 'How do enzymes accelerate chemical reaction rates in biological systems?',
        options: ['By increasing thermal kinetic energy', 'By lowering the activation energy barrier', 'By altering the net free energy (ΔG)', 'By consuming themselves during the reaction'],
        correctIndex: 1,
        explanation: 'Enzymes stabilize the transition state and lower the activation energy (Ea) needed for reactants to proceed to products, without altering the equilibrium or ΔG.'
      },
      {
        question: 'What happens to most human enzymes when heated past 55°C?',
        options: ['They speed up exponentially', 'They become permanently denatured as tertiary bonds break', 'They turn into RNA molecules', 'They synthesize additional active sites'],
        correctIndex: 1,
        explanation: 'Extreme heat disrupts non-covalent hydrogen and ionic bonds maintaining the enzyme’s 3D tertiary structure, causing denaturation and loss of catalytic function.'
      }
    ],
    curriculumGrade: 'Grades 9–12'
  },
  {
    id: 'hemoglobin',
    name: 'Hemoglobin Quaternary Structure',
    category: 'structural',
    tagline: 'Tetrameric oxygen transport and cooperative binding',
    description: 'Hemoglobin is an allosteric metalloprotein composed of 4 globin polypeptide chains (2 Alpha and 2 Beta subunits). Each subunit harbors an iron-protoporphyrin IX (heme) prosthetic group capable of reversibly binding a diatomic oxygen (O₂) molecule with cooperative sigmoidal binding affinity.',
    keyParts: [
      { name: 'Alpha Subunits (2)', description: 'Polypeptide globin chains each featuring 7 alpha-helical segments (α1 and α2).', color: '#0284c7' },
      { name: 'Beta Subunits (2)', description: 'Polypeptide globin chains each featuring 8 alpha-helical segments (β1 and β2).', color: '#8b5cf6' },
      { name: 'Heme Groups with Fe²⁺', description: 'Four porphyrin ring centers holding divalent iron that coordinates with oxygen.', color: '#ef4444' },
      { name: 'Bound Oxygen (O₂)', description: 'Diatomic oxygen molecules bound cooperatively, causing the T (tense) to R (relaxed) state transition.', color: '#10b981' }
    ],
    quiz: [
      {
        question: 'What is the quaternary stoichiometry of normal adult human hemoglobin (HbA)?',
        options: ['1 monomeric polypeptide', '2 identical alpha subunits', 'Tetramer of 2 alpha and 2 beta subunits (α₂β₂)', 'Hexamer of 6 polypeptide chains'],
        correctIndex: 2,
        explanation: 'Adult human hemoglobin (HbA) is a symmetrical tetramer composed of two alpha-globin and two beta-globin subunits, each containing an oxygen-binding heme group.'
      },
      {
        question: 'Which metal ion coordinates directly with diatomic oxygen at the center of the heme ring?',
        options: ['Copper (Cu²⁺)', 'Zinc (Zn²⁺)', 'Iron (Fe²⁺)', 'Magnesium (Mg²⁺)'],
        correctIndex: 2,
        explanation: 'The iron atom (Fe²⁺ in the ferrous state) binds directly to diatomic oxygen. Oxidation to ferric (Fe³⁺) produces methemoglobin which cannot bind oxygen.'
      }
    ],
    curriculumGrade: 'Grades 10–12'
  }
];

interface BioscienceVirtualLabProps {
  currentGrade?: string;
  onSendToAiAssistant?: (prompt: string) => void;
  onAddAcademicXP?: (amount: number) => void;
  onClose?: () => void;
}

export default function BioscienceVirtualLab({
  currentGrade = 'Grade 10',
  onSendToAiAssistant,
  onAddAcademicXP,
  onClose
}: BioscienceVirtualLabProps) {
  const [selectedStructureId, setSelectedStructureId] = useState<string>('dna_helix');
  const activeStructure = useMemo(
    () => BIOSCIENCE_STRUCTURES.find(s => s.id === selectedStructureId) || BIOSCIENCE_STRUCTURES[0],
    [selectedStructureId]
  );

  // Inspection & Simulation state
  const [isRotating, setIsRotating] = useState(true);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number | null>(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isSimulatingState, setIsSimulatingState] = useState(false);
  const [simulationParam, setSimulationParam] = useState<number>(50); // e.g. O2 partial pressure, temp, etc.

  // Educational Modes & Modals
  const [predictHypothesis, setPredictHypothesis] = useState<string | null>(null);
  const [showHypothesisResult, setShowHypothesisResult] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Lab Notebook
  const [notebookEntries, setNotebookEntries] = useState<Array<{
    id: string;
    title: string;
    structureId: string;
    timestamp: string;
    observations: string;
    score: number;
  }>>(() => {
    try {
      const saved = localStorage.getItem('neonova_bioscience_notebook');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNotebookDrawer, setShowNotebookDrawer] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);

  // 3D Canvas Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const dynamicPartMeshesRef = useRef<THREE.Mesh[]>([]);

  // -------------------------------------------------------------
  // BUILD PROCEDURAL 3D BIOLOGICAL MODEL (3 TO 12 COMPOSITE PARTS)
  // -------------------------------------------------------------
  const buildStructureModel = (structureId: string, group: THREE.Group) => {
    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }
    dynamicPartMeshesRef.current = [];

    // Shared PBR Materials
    const pbrGlossy = (hex: number) => new THREE.MeshPhysicalMaterial({
      color: hex,
      roughness: 0.18,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1
    });

    const pbrTranslucent = (hex: number, opacity = 0.6) => new THREE.MeshPhysicalMaterial({
      color: hex,
      transmission: 0.7,
      opacity: opacity,
      transparent: true,
      roughness: 0.15,
      ior: 1.4,
      thickness: 0.5
    });

    if (structureId === 'dna_helix') {
      // 1. DNA Double Helix: 2 antiparallel sugar-phosphate ribbons & nucleotide base pairs
      const turns = 3;
      const height = 4.2;
      const radius = 1.1;
      const steps = 48;
      const ladderRungCount = 28;

      // Backbone 1 (Strand 5' -> 3')
      const strand1CurvePoints: THREE.Vector3[] = [];
      const strand2CurvePoints: THREE.Vector3[] = [];

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * (Math.PI * 2 * turns);
        const y = ((i / steps) - 0.5) * height;
        strand1CurvePoints.push(new THREE.Vector3(Math.cos(t) * radius, y, Math.sin(t) * radius));
        strand2CurvePoints.push(new THREE.Vector3(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius));
      }

      const strand1Curve = new THREE.CatmullRomCurve3(strand1CurvePoints);
      const strand2Curve = new THREE.CatmullRomCurve3(strand2CurvePoints);

      const strand1Mesh = new THREE.Mesh(new THREE.TubeGeometry(strand1Curve, 64, 0.08, 12, false), pbrGlossy(0x0284c7));
      const strand2Mesh = new THREE.Mesh(new THREE.TubeGeometry(strand2Curve, 64, 0.08, 12, false), pbrGlossy(0x38bdf8));
      group.add(strand1Mesh);
      group.add(strand2Mesh);

      // Base pairs connecting the strands (A-T green/red, G-C yellow/blue)
      for (let i = 0; i < ladderRungCount; i++) {
        const u = i / (ladderRungCount - 1);
        const t = u * (Math.PI * 2 * turns);
        const y = (u - 0.5) * height;

        const p1 = new THREE.Vector3(Math.cos(t) * radius * 0.94, y, Math.sin(t) * radius * 0.94);
        const p2 = new THREE.Vector3(Math.cos(t + Math.PI) * radius * 0.94, y, Math.sin(t + Math.PI) * radius * 0.94);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const isAT = i % 2 === 0;
        const colorLeft = isAT ? 0x10b981 : 0xf59e0b;
        const colorRight = isAT ? 0xef4444 : 0x2563eb;

        // Left half base
        const leftCurve = new THREE.LineCurve3(p1, mid);
        const leftMesh = new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 8, 0.05, 8, false), pbrGlossy(colorLeft));
        group.add(leftMesh);

        // Right half base
        const rightCurve = new THREE.LineCurve3(mid, p2);
        const rightMesh = new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 8, 0.05, 8, false), pbrGlossy(colorRight));
        group.add(rightMesh);

        // Central Hydrogen Bond Sparkle
        const hBondSphere = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), pbrGlossy(0xffffff));
        hBondSphere.position.copy(mid);
        group.add(hBondSphere);
      }
    } else if (structureId === 'animal_cell') {
      // 2. Animal Cell: Outer plasma membrane, nucleus, mitochondria, ER, Golgi, lysosomes
      // Plasma Membrane cutaway hemisphere
      const membraneGeo = new THREE.SphereGeometry(2.0, 48, 32, 0, Math.PI * 1.6, 0, Math.PI);
      const membraneMesh = new THREE.Mesh(membraneGeo, pbrTranslucent(0x06b6d4, 0.45));
      group.add(membraneMesh);

      // Nucleus
      const nucleusGeo = new THREE.SphereGeometry(0.65, 32, 32);
      const nucleusMesh = new THREE.Mesh(nucleusGeo, pbrGlossy(0x4338ca));
      nucleusMesh.position.set(-0.3, 0.1, 0.2);
      group.add(nucleusMesh);

      // Dense Nucleolus core
      const nucleolusGeo = new THREE.SphereGeometry(0.24, 24, 24);
      const nucleolusMesh = new THREE.Mesh(nucleolusGeo, pbrGlossy(0x818cf8));
      nucleolusMesh.position.set(-0.25, 0.15, 0.35);
      group.add(nucleolusMesh);

      // Mitochondria (3 organelles with cristae ridges)
      const mitoOffsets = [
        new THREE.Vector3(0.9, -0.4, 0.5),
        new THREE.Vector3(-0.8, -0.7, -0.4),
        new THREE.Vector3(0.7, 0.8, -0.3)
      ];
      mitoOffsets.forEach((pos, idx) => {
        const mitoGroup = new THREE.Group();
        mitoGroup.position.copy(pos);
        mitoGroup.rotation.set(idx * 0.4, idx * 0.9, idx * 0.2);

        const mitoBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 8, 16), pbrGlossy(0xef4444));
        mitoGroup.add(mitoBody);

        // Inner cristae fold rings
        for (let c = -1; c <= 1; c++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 8, 16), pbrGlossy(0xfde047));
          ring.position.y = c * 0.12;
          ring.rotation.x = Math.PI / 2;
          mitoGroup.add(ring);
        }
        group.add(mitoGroup);
      });

      // Golgi Apparatus (curved flattened cisternae stacks)
      const golgiGroup = new THREE.Group();
      golgiGroup.position.set(0.6, -0.1, -0.7);
      for (let g = 0; g < 4; g++) {
        const arc = new THREE.TorusGeometry(0.4 + g * 0.06, 0.035, 12, 24, Math.PI * 0.7);
        arc.rotateZ(Math.PI * 0.15);
        const cistMesh = new THREE.Mesh(arc, pbrGlossy(0xd97706));
        cistMesh.position.set(g * 0.08, g * 0.03, 0);
        golgiGroup.add(cistMesh);
      }
      group.add(golgiGroup);

      // Endoplasmic Reticulum ribbons around nucleus
      const erGroup = new THREE.Group();
      erGroup.position.copy(nucleusMesh.position);
      for (let r = 0; r < 5; r++) {
        const erRing = new THREE.Mesh(new THREE.TorusGeometry(0.85 + r * 0.08, 0.03, 8, 32, Math.PI * 1.1), pbrGlossy(0x0284c7));
        erRing.rotation.set(r * 0.3, r * 0.5, r * 0.2);
        erGroup.add(erRing);
      }
      group.add(erGroup);

      // Lysosomes (spherical digestion bodies)
      const lysoPositions = [
        new THREE.Vector3(0.2, 1.1, 0.4),
        new THREE.Vector3(-0.7, 0.9, 0.6),
        new THREE.Vector3(0.3, -1.0, 0.2)
      ];
      lysoPositions.forEach(pos => {
        const lyso = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), pbrGlossy(0x10b981));
        lyso.position.copy(pos);
        group.add(lyso);
      });
    } else if (structureId === 'plant_cell') {
      // 3. Plant Cell: Cellulose hexagonal wall, chloroplasts with thylakoids, large central vacuole
      // Polyhedral Cell Wall Frame
      const boxWall = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 2.4, 2.2),
        new THREE.MeshPhysicalMaterial({
          color: 0x15803d,
          roughness: 0.2,
          transmission: 0.82,
          opacity: 0.65,
          transparent: true,
          thickness: 0.6
        })
      );
      group.add(boxWall);

      // Large Central Vacuole (water turgor reservoir)
      const vacuoleMesh = new THREE.Mesh(new THREE.SphereGeometry(0.85, 32, 32), pbrTranslucent(0x38bdf8, 0.55));
      vacuoleMesh.position.set(0.2, -0.1, -0.1);
      vacuoleMesh.scale.set(1.3, 1.0, 1.1);
      group.add(vacuoleMesh);

      // Chloroplasts (4 disc-shaped organelles with thylakoid stacks)
      const chloroPositions = [
        new THREE.Vector3(-0.9, 0.6, 0.6),
        new THREE.Vector3(0.8, 0.7, 0.5),
        new THREE.Vector3(-0.8, -0.6, 0.6),
        new THREE.Vector3(-1.0, 0.1, -0.6)
      ];
      chloroPositions.forEach(pos => {
        const chloroGroup = new THREE.Group();
        chloroGroup.position.copy(pos);

        // Chloroplast envelope
        const envelope = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 24), pbrGlossy(0x22c55e));
        chloroGroup.add(envelope);

        // Thylakoid grana discs inside
        for (let d = -1; d <= 1; d++) {
          const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 16), pbrGlossy(0x166534));
          disc.position.set(d * 0.08, 0.08, 0);
          chloroGroup.add(disc);
        }
        group.add(chloroGroup);
      });

      // Nucleus
      const plantNucleus = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 24), pbrGlossy(0x6366f1));
      plantNucleus.position.set(-0.8, 0.4, -0.4);
      group.add(plantNucleus);
    } else if (structureId === 'enzyme_kinetics') {
      // 4. Enzyme-Substrate Catalysis: Globular enzyme with active site cleft and substrate
      // Enzyme Globular Body with active site pocket
      const enzymeGroup = new THREE.Group();

      // Main enzyme lobes
      const lobe1 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), pbrGlossy(0x7c3aed));
      lobe1.position.set(-0.4, 0, 0);
      enzymeGroup.add(lobe1);

      const lobe2 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 32), pbrGlossy(0x8b5cf6));
      lobe2.position.set(0.5, 0.2, 0);
      enzymeGroup.add(lobe2);

      const lobe3 = new THREE.Mesh(new THREE.SphereGeometry(0.75, 32, 32), pbrGlossy(0x6d28d9));
      lobe3.position.set(0.1, -0.6, 0.2);
      enzymeGroup.add(lobe3);

      group.add(enzymeGroup);

      // Substrate Molecule (docking into active site cleft at 0, 0.3, 0.5)
      const substrateGroup = new THREE.Group();
      substrateGroup.position.set(0, 0.35 + (1 - animationProgress) * 0.8, 0.55);

      const subPartA = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), pbrGlossy(0xec4899));
      subPartA.position.set(-0.16, 0, 0);
      substrateGroup.add(subPartA);

      const subPartB = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), pbrGlossy(0x10b981));
      subPartB.position.set(0.16, 0, 0);
      substrateGroup.add(subPartB);

      const bondLink = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 12), pbrGlossy(0xffffff));
      bondLink.rotation.z = Math.PI / 2;
      substrateGroup.add(bondLink);

      group.add(substrateGroup);
    } else if (structureId === 'hemoglobin') {
      // 5. Hemoglobin Quaternary Structure: 2 Alpha (cyan) + 2 Beta (violet) globin subunits + 4 Heme groups
      const subunitPositions = [
        { pos: new THREE.Vector3(-0.65, 0.65, 0), color: 0x0284c7, isAlpha: true },
        { pos: new THREE.Vector3(0.65, -0.65, 0), color: 0x0ea5e9, isAlpha: true },
        { pos: new THREE.Vector3(0.65, 0.65, 0), color: 0x7c3aed, isAlpha: false },
        { pos: new THREE.Vector3(-0.65, -0.65, 0), color: 0x8b5cf6, isAlpha: false }
      ];

      subunitPositions.forEach((sub, i) => {
        const subGroup = new THREE.Group();
        subGroup.position.copy(sub.pos);

        // Globin folding coils (composite torus clusters)
        for (let k = 0; k < 4; k++) {
          const coil = new THREE.Mesh(
            new THREE.TorusGeometry(0.35 + k * 0.04, 0.08, 12, 24, Math.PI * 1.2),
            pbrGlossy(sub.color)
          );
          coil.rotation.set(k * 0.7, k * 0.5, i * 0.3);
          subGroup.add(coil);
        }

        // Heme Porphyrin Disc
        const hemeDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), pbrGlossy(0xb91c1c));
        hemeDisc.position.set(0.1, 0.1, 0.15);
        hemeDisc.rotation.x = Math.PI * 0.3;
        subGroup.add(hemeDisc);

        // Central Fe²⁺ Iron Core
        const ironAtom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), pbrGlossy(0xf59e0b));
        ironAtom.position.copy(hemeDisc.position);
        subGroup.add(ironAtom);

        // Bound O₂ molecules
        const o2Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), pbrGlossy(0x10b981));
        o2Mesh.position.set(hemeDisc.position.x + 0.12, hemeDisc.position.y + 0.08, hemeDisc.position.z);
        subGroup.add(o2Mesh);

        group.add(subGroup);
      });
    }
  };

  // -------------------------------------------------------------
  // INITIALIZE THREE.JS SCENE, ROOM ENVIRONMENT, PBR LIGHTING
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // Deep space scifi backdrop
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);
    cameraRef.current = camera;

    // 3. Renderer with High Dynamic Range & Tone Mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. RoomEnvironment with PMREMGenerator (Rich PBR Reflections)
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    const envRoom = new RoomEnvironment();
    scene.environment = pmremGen.fromScene(envRoom, 0.04).texture;
    envRoom.dispose();
    pmremGen.dispose();

    // 5. Studio Lighting: Warm Key + Cool Hemisphere + Neon Cyan/Violet Rim
    const warmKeyLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    warmKeyLight.position.set(4, 6, 4);
    warmKeyLight.castShadow = true;
    warmKeyLight.shadow.mapSize.width = 1024;
    warmKeyLight.shadow.mapSize.height = 1024;
    scene.add(warmKeyLight);

    const coolHemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 1.0);
    scene.add(coolHemiLight);

    const rimLightBlue = new THREE.PointLight(0x06b6d4, 2.0, 12);
    rimLightBlue.position.set(-4, 2, -3);
    scene.add(rimLightBlue);

    const rimLightPurple = new THREE.PointLight(0xa855f7, 2.0, 12);
    rimLightPurple.position.set(4, -2, -3);
    scene.add(rimLightPurple);

    // 6. Soft Contact Shadow Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(12, 12);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 7. Biological Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    buildStructureModel(selectedStructureId, modelGroup);

    // 8. Damped OrbitControls (Touch & Mouse)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 14.0;
    controls.maxPolarAngle = Math.PI * 0.85;
    controlsRef.current = controls;

    // 9. Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (modelGroup && isRotating) {
        modelGroup.rotation.y += delta * 0.35;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D model whenever active structure changes
  useEffect(() => {
    if (modelGroupRef.current) {
      buildStructureModel(selectedStructureId, modelGroupRef.current);
      setSelectedPartIndex(0);
      setAnimationProgress(0);
      setShowHypothesisResult(false);
    }
  }, [selectedStructureId]);

  // Handle Hypothesis Prediction
  const handleVerifyHypothesis = (hypothesis: string) => {
    setPredictHypothesis(hypothesis);
    setShowHypothesisResult(true);

    // Save observation into Lab Notebook & Firebase Firestore
    const newEntry = {
      id: `bio_${Date.now()}`,
      title: activeStructure.name,
      structureId: activeStructure.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      observations: `Tested hypothesis: "${hypothesis}". Explored 3D structural hierarchy and active domains.`,
      score: 100
    };
    const updated = [newEntry, ...notebookEntries];
    setNotebookEntries(updated);
    try {
      localStorage.setItem('neonova_bioscience_notebook', JSON.stringify(updated));
    } catch {}

    // Persist to Firebase Firestore
    saveBioscienceExperiment({
      title: activeStructure.name,
      category: activeStructure.category,
      structureId: activeStructure.id,
      observations: newEntry.observations,
      quizScore: 100,
      masteryLevel: 'Mastered'
    }).catch(err => console.warn('Non-blocking Firestore sync:', err));

    onAddAcademicXP?.(40);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current && modelGroupRef.current) {
      cameraRef.current.position.set(0, 1.2, 5.5);
      controlsRef.current.target.set(0, 0, 0);
      modelGroupRef.current.rotation.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Submit Quiz Answer
  const handleSelectQuizAnswer = (index: number) => {
    if (quizCompleted) return;
    setSelectedQuizAnswer(index);
    const q = activeStructure.quiz[quizQuestionIndex];
    if (index === q.correctIndex) {
      setQuizScore(prev => prev + 1);
      onAddAcademicXP?.(25);
    }
    setTimeout(() => {
      if (quizQuestionIndex + 1 < activeStructure.quiz.length) {
        setQuizQuestionIndex(prev => prev + 1);
        setSelectedQuizAnswer(null);
      } else {
        setQuizCompleted(true);
      }
    }, 1200);
  };

  return (
    <div className="relative w-full h-[740px] max-h-[85vh] bg-slate-950 text-white rounded-2xl overflow-hidden font-sans border border-slate-800 shadow-2xl flex flex-col">
      {/* 1. TOP HEADER & STRUCTURE SELECTOR */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-3 sm:p-4 shrink-0 z-20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-900/40">
            <Dna size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                NeoNova 3D Bioscience Virtual Lab
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PBR Molecular Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 3D cellular organelles, genomic sequences & enzyme kinetics
            </p>
          </div>
        </div>

        {/* Structure Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {BIOSCIENCE_STRUCTURES.map(str => (
            <button
              key={str.id}
              type="button"
              onClick={() => setSelectedStructureId(str.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStructureId === str.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <Atom size={13} />
              <span>{str.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotebookDrawer(prev => !prev)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Bookmark size={14} />
            <span className="hidden sm:inline">Notebook ({notebookEntries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setQuizQuestionIndex(0);
              setSelectedQuizAnswer(null);
              setQuizScore(0);
              setQuizCompleted(false);
              setShowQuizModal(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <HelpCircle size={14} />
            <span className="hidden sm:inline">Mastery Quiz</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Minimize2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN 3D VIEWPORT CONTAINER */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* WebGL Canvas */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Top-Left Structure Info Card */}
        <div className="absolute top-3 left-3 z-10 max-w-xs sm:max-w-sm bg-slate-900/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800/80 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              {activeStructure.category} • {activeStructure.curriculumGrade}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Touch to Rotate
            </span>
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">
            {activeStructure.name}
          </h3>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
            {activeStructure.tagline}
          </p>

          {/* Key Part Inspector Chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {activeStructure.keyParts.map((part, idx) => (
              <button
                key={part.name}
                type="button"
                onClick={() => setSelectedPartIndex(idx)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  selectedPartIndex === idx
                    ? 'bg-cyan-500 text-slate-950 font-bold ring-1 ring-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: part.color }} />
                <span>{part.name.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>

          {/* Selected Part Detail */}
          {selectedPartIndex !== null && activeStructure.keyParts[selectedPartIndex] && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-cyan-200/90 leading-relaxed bg-cyan-950/20 p-2 rounded-lg">
              <span className="font-semibold text-cyan-300">
                {activeStructure.keyParts[selectedPartIndex].name}:{' '}
              </span>
              {activeStructure.keyParts[selectedPartIndex].description}
            </div>
          )}
        </div>

        {/* Floating Top-Right View Controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsRotating(prev => !prev)}
            className={`p-2 rounded-xl backdrop-blur-md border cursor-pointer shadow-lg transition-all ${
              isRotating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800'
            }`}
            title={isRotating ? 'Pause Rotation' : 'Auto Rotate'}
          >
            {isRotating ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white backdrop-blur-md border border-slate-800 cursor-pointer shadow-lg"
            title="Reset Camera View"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (onSendToAiAssistant) {
                onSendToAiAssistant(`Explain the biological significance, molecular structure, and exam concepts for ${activeStructure.name} in simple grade-appropriate terms.`);
              }
            }}
            className="p-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white backdrop-blur-md border border-indigo-500/40 cursor-pointer shadow-lg"
            title="Ask AI Assistant to Explain"
          >
            <Bot size={16} />
          </button>
        </div>

        {/* 3. BOTTOM-CENTER COLLAPSIBLE CONTROL DOCK (<= 15% Viewport footprint) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-2xl">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-2xl transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-slate-200">
                  Hypothesis & Predict Mode
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDockCollapsed(prev => !prev)}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                {dockCollapsed ? 'Expand Dock ▲' : 'Collapse ▼'}
              </button>
            </div>

            {!dockCollapsed && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-[11px] text-slate-400">Predict:</span>
                  <button
                    type="button"
                    onClick={() => handleVerifyHypothesis('Complementary pairing preserves genetic fidelity')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    Structural Fidelity
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyHypothesis('Hydrogen bonds allow zipper-like replication')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 border border-slate-700 cursor-pointer"
                  >
                    Thermal Denaturation
                  </button>
                </div>

                {showHypothesisResult && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 size={13} />
                    <span>Hypothesis Logged (+40 XP)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. LAB NOTEBOOK DRAWER */}
      {showNotebookDrawer && (
        <div className="absolute inset-y-0 right-0 z-30 w-full sm:w-80 bg-slate-900 border-l border-slate-800 p-4 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bookmark size={18} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Bioscience Notebook</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowNotebookDrawer(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {notebookEntries.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No experiments logged yet. Inspect a model or predict an outcome to record notes.
              </div>
            ) : (
              notebookEntries.map(entry => (
                <div key={entry.id} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px] text-cyan-300 font-semibold mb-1">
                    <span>{entry.title}</span>
                    <span className="text-slate-400">{entry.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {entry.observations}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. MASTERY QUIZ MODAL */}
      {showQuizModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Concept Mastery Check
                </span>
                <h3 className="font-bold text-sm text-white">
                  {activeStructure.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!quizCompleted ? (
              <div>
                <div className="text-xs text-slate-400 mb-2">
                  Question {quizQuestionIndex + 1} of {activeStructure.quiz.length}
                </div>
                <p className="text-sm font-semibold text-slate-100 mb-4">
                  {activeStructure.quiz[quizQuestionIndex]?.question}
                </p>
                <div className="space-y-2">
                  {activeStructure.quiz[quizQuestionIndex]?.options.map((opt, i) => {
                    const isSelected = selectedQuizAnswer === i;
                    const isCorrect = i === activeStructure.quiz[quizQuestionIndex].correctIndex;
                    let btnStyle = 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700';

                    if (selectedQuizAnswer !== null) {
                      if (isCorrect) btnStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
                      else if (isSelected) btnStyle = 'bg-rose-600 text-white border-rose-500';
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectQuizAnswer(i)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedQuizAnswer !== null && (
                  <p className="mt-3 text-[11px] text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/40">
                    {activeStructure.quiz[quizQuestionIndex]?.explanation}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Award size={28} />
                </div>
                <h4 className="font-bold text-base text-white">Quiz Completed!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  You scored {quizScore} / {activeStructure.quiz.length} on {activeStructure.name}.
                </p>
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Return to 3D Lab
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
