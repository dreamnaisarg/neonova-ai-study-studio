import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  FlaskConical,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Bot,
  Award,
  Layers,
  Sliders,
  Activity,
  Atom,
  Info,
  Maximize2,
  Minimize2,
  X,
  Droplets
} from 'lucide-react';
import {
  ChemicalReagent,
  CHEMICAL_REAGENTS,
  ReactionOutcome,
  SAFE_REACTIONS_CATALOG,
  UNSAFE_HAZARD_RULES,
  UnsafeHazardRule,
  evaluateMixture
} from '../../lib/scienceLab/chemistryReactionEngine';
import { chemistryAudio } from '../../lib/scienceLab/chemistryAudioEngine';

interface VirtualChemistryMixingLabProps {
  currentGrade?: string;
  onSendToAiAssistant?: (prompt: string) => void;
  onAddAcademicXP?: (amount: number) => void;
  onClose?: () => void;
}

export default function VirtualChemistryMixingLab({
  currentGrade = 'Grade 8',
  onSendToAiAssistant,
  onAddAcademicXP,
  onClose
}: VirtualChemistryMixingLabProps) {
  // Beaker Contents State
  const [addedReagents, setAddedReagents] = useState<string[]>([]);
  const [liquidVolumeMl, setLiquidVolumeMl] = useState<number>(0);
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [activePouringReagent, setActivePouringReagent] = useState<ChemicalReagent | null>(null);

  // Reaction State
  const [activeReaction, setActiveReaction] = useState<ReactionOutcome | null>(null);
  const [activeHazard, setActiveHazard] = useState<UnsafeHazardRule | null>(null);
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [currentPh, setCurrentPh] = useState<number>(7.0);
  const [temperatureC, setTemperatureC] = useState<number>(22.0);
  const [heaterOn, setHeaterOn] = useState<boolean>(false);
  const [stirrerOn, setStirrerOn] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => chemistryAudio.getIsMuted());

  // Educational Modes & Modals
  const [predictModeActive, setPredictModeActive] = useState<boolean>(false);
  const [studentPrediction, setStudentPrediction] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<{ correct: boolean; text: string } | null>(null);
  const [explanationLevel, setExplanationLevel] = useState<'elementary' | 'middleSchool' | 'highSchool'>(() => {
    const num = parseInt(currentGrade.replace(/\D/g, ''), 10) || 8;
    if (num <= 5) return 'elementary';
    if (num <= 8) return 'middleSchool';
    return 'highSchool';
  });

  // Post-Reaction Quiz Modal
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Lab Notebook
  const [showNotebook, setShowNotebook] = useState<boolean>(false);
  const [notebookEntries, setNotebookEntries] = useState<Array<{
    id: string;
    timestamp: string;
    name: string;
    equation: string;
    observations: string[];
    ph: number;
    temperature: number;
  }>>(() => {
    try {
      const s = localStorage.getItem('neonova_chem_mixing_notebook');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // PPE & Safety
  const [ppeEquipped, setPpeEquipped] = useState<{ goggles: boolean; gloves: boolean }>({
    goggles: true,
    gloves: true
  });
  const [showPpeWarning, setShowPpeWarning] = useState<boolean>(false);

  // Graphic Quality & Performance (Low / Medium / High)
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high'>('high');
  const [loadingProgress, setLoadingProgress] = useState<number>(30);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 3D Canvas Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // 3D Visual Object Refs
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const meniscusMeshRef = useRef<THREE.Mesh | null>(null);
  const foamMeshRef = useRef<THREE.Mesh | null>(null);
  const stirringRodRef = useRef<THREE.Group | null>(null);
  const thermometerNeedleRef = useRef<THREE.Mesh | null>(null);
  const hotPlateGlowRef = useRef<THREE.PointLight | null>(null);
  const pouringStreamRef = useRef<THREE.Mesh | null>(null);
  const chemicalBottleMeshes = useRef<Map<string, THREE.Group>>(new Map());

  // Particle System Refs
  const bubbleParticlesRef = useRef<THREE.Points | null>(null);
  const bubblePositionsRef = useRef<Float32Array | null>(null);
  const precipitateParticlesRef = useRef<THREE.Points | null>(null);
  const precipitatePositionsRef = useRef<Float32Array | null>(null);

  // Target Liquid Appearance
  const targetLiquidColor = useRef(new THREE.Color(0xE0F2FE));
  const currentLiquidColor = useRef(new THREE.Color(0xE0F2FE));
  const targetLiquidHeight = useRef(0);
  const currentLiquidHeight = useRef(0);

  // -------------------------------------------------------------
  // INITIALIZE 3D THREE.JS CHEMISTRY LAB BENCH SCENE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    setLoadingProgress(50);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914); // NeoNova space dark backdrop
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 1.45, 2.2);
    cameraRef.current = camera;

    // 3. Renderer with PBR ACESFilmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: qualityLevel !== 'low',
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(qualityLevel === 'low' ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = qualityLevel !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection Map (Crown borosilicate glass reflections)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting Setup (Soft lab key + NeoNova Neon Violet/Cyan Rims)
    const ambientLight = new THREE.AmbientLight(0xEEF2F6, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.3);
    keyLight.position.set(2.5, 4.5, 3.0);
    keyLight.castShadow = qualityLevel !== 'low';
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Neon Rim Lights (Space Theme Harmony)
    const neonVioletRim = new THREE.PointLight(0xA855F7, 1.8, 6.0);
    neonVioletRim.position.set(-2.8, 1.6, -0.6);
    scene.add(neonVioletRim);

    const neonCyanRim = new THREE.PointLight(0x06B6D4, 1.8, 6.0);
    neonCyanRim.position.set(2.8, 1.6, -0.6);
    scene.add(neonCyanRim);

    // 6. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.45, 0); // Focus on beaker center
    controls.minDistance = 0.8;
    controls.maxDistance = 3.6;
    controls.maxPolarAngle = Math.PI / 2 + 0.03; // Don't dip beneath table
    controlsRef.current = controls;

    // ---------------------------------------------------------
    // BUILD 3D LABORATORY BENCH & HIGH-FIDELITY GLASSWARE
    // ---------------------------------------------------------
    const labGroup = new THREE.Group();
    scene.add(labGroup);

    // A. Polished Laboratory Table Top (Dark Slate with subtle specular shine)
    const benchGeo = new THREE.BoxGeometry(3.6, 0.08, 2.0);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.25,
      metalness: 0.6
    });
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.set(0, 0, 0);
    benchMesh.receiveShadow = true;
    labGroup.add(benchMesh);

    // Subtle hazard perimeter stripe along front edge
    const stripeGeo = new THREE.BoxGeometry(3.6, 0.015, 0.06);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.4
    });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.set(0, 0.045, 0.95);
    labGroup.add(stripeMesh);

    // B. Magnetic Stirrer & Hot Plate Base
    const hotPlateGroup = new THREE.Group();
    hotPlateGroup.position.set(0, 0.04, 0);
    labGroup.add(hotPlateGroup);

    const hpBaseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.12, 32);
    const hpBaseMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.35,
      metalness: 0.7
    });
    const hpBase = new THREE.Mesh(hpBaseGeo, hpBaseMat);
    hpBase.position.y = 0.06;
    hpBase.receiveShadow = true;
    hotPlateGroup.add(hpBase);

    // Ceramic top plate
    const hpTopGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 32);
    const hpTopMat = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      roughness: 0.15,
      metalness: 0.1
    });
    const hpTop = new THREE.Mesh(hpTopGeo, hpTopMat);
    hpTop.position.y = 0.13;
    hotPlateGroup.add(hpTop);

    // Thermal heater glow point light
    const hpGlow = new THREE.PointLight(0xF97316, 0, 1.2);
    hpGlow.position.set(0, 0.18, 0);
    hotPlateGroup.add(hpGlow);
    hotPlateGlowRef.current = hpGlow;

    // C. Realistic 250mL Pyrex Glass Beaker (Center Stage)
    // Physical Borosilicate Glass Material (PBR Crown Glass, IOR 1.52)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transmission: 0.94,
      opacity: 1.0,
      transparent: true,
      roughness: 0.04,
      ior: 1.52,
      thickness: 0.32,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xFFFFFF),
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      depthWrite: false
    });

    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(0, 0.14, 0);
    labGroup.add(beakerGroup);

    // Beaker cylinder wall with spout lip
    const beakerHeight = 0.52;
    const beakerRadius = 0.22;
    const beakerWallGeo = new THREE.CylinderGeometry(beakerRadius, beakerRadius * 0.98, beakerHeight, 48, 1, true);
    const beakerWall = new THREE.Mesh(beakerWallGeo, glassMaterial);
    beakerWall.position.y = beakerHeight / 2;
    beakerWall.castShadow = true;
    beakerGroup.add(beakerWall);

    // Beaker bottom disc
    const beakerBottomGeo = new THREE.CylinderGeometry(beakerRadius * 0.98, beakerRadius * 0.98, 0.02, 48);
    const beakerBottom = new THREE.Mesh(beakerBottomGeo, glassMaterial);
    beakerBottom.position.y = 0.01;
    beakerGroup.add(beakerBottom);

    // Beaker top rim rim-torus
    const beakerRimGeo = new THREE.TorusGeometry(beakerRadius, 0.012, 16, 48);
    beakerRimGeo.rotateX(Math.PI / 2);
    const beakerRim = new THREE.Mesh(beakerRimGeo, glassMaterial);
    beakerRim.position.y = beakerHeight;
    beakerGroup.add(beakerRim);

    // Beaker printed graduation lines (50mL, 100mL, 150mL, 200mL, 250mL)
    for (let i = 1; i <= 5; i++) {
      const markY = (i / 6) * beakerHeight;
      const markRingGeo = new THREE.TorusGeometry(beakerRadius * 0.99, 0.0025, 8, 32, Math.PI * 0.6);
      markRingGeo.rotateX(Math.PI / 2);
      markRingGeo.rotateY(Math.PI * 0.7);
      const markMat = new THREE.MeshBasicMaterial({ color: 0xF8FAFC, transparent: true, opacity: 0.65 });
      const markMesh = new THREE.Mesh(markRingGeo, markMat);
      markMesh.position.y = markY;
      beakerGroup.add(markMesh);
    }

    // D. Realistic Liquid Interior Cylinder with Meniscus Surface
    const liquidMaxRadius = beakerRadius * 0.95;
    const liquidGeo = new THREE.CylinderGeometry(liquidMaxRadius, liquidMaxRadius * 0.98, 0.45, 36);
    liquidGeo.translate(0, 0.225, 0); // Origin at bottom for easy vertical scaling
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xE0F2FE,
      transmission: 0.65,
      opacity: 0.88,
      transparent: true,
      roughness: 0.12,
      ior: 1.33, // Water refractive index
      clearcoat: 0.8
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = 0.02;
    liquidMesh.scale.set(1, 0.001, 1); // Starts empty
    beakerGroup.add(liquidMesh);
    liquidMeshRef.current = liquidMesh;

    // Concave Meniscus Cap Mesh
    const meniscusGeo = new THREE.CylinderGeometry(liquidMaxRadius, liquidMaxRadius * 0.92, 0.015, 36);
    const meniscusMat = new THREE.MeshStandardMaterial({
      color: 0xE0F2FE,
      transparent: true,
      opacity: 0.75,
      roughness: 0.05
    });
    const meniscusMesh = new THREE.Mesh(meniscusGeo, meniscusMat);
    meniscusMesh.position.y = 0.02;
    meniscusMesh.visible = false;
    beakerGroup.add(meniscusMesh);
    meniscusMeshRef.current = meniscusMesh;

    // Reaction Foam Layer (for Baking Soda + Vinegar effervescence)
    const foamGeo = new THREE.CylinderGeometry(liquidMaxRadius * 1.02, liquidMaxRadius * 0.98, 0.08, 36);
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.9,
      transparent: true,
      opacity: 0.0
    });
    const foamMesh = new THREE.Mesh(foamGeo, foamMat);
    foamMesh.position.y = 0.02;
    beakerGroup.add(foamMesh);
    foamMeshRef.current = foamMesh;

    // E. Stirring Rod (Borosilicate glass rod)
    const stirGroup = new THREE.Group();
    const rodGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.65, 16);
    const rodMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transmission: 0.95,
      transparent: true,
      roughness: 0.08,
      ior: 1.5
    });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.set(0, 0.35, 0);
    rod.rotation.z = 0.18; // Resting on rim
    stirGroup.add(rod);
    beakerGroup.add(stirGroup);
    stirringRodRef.current = stirGroup;

    // F. Digital Laboratory Thermometer
    const thermoGroup = new THREE.Group();
    thermoGroup.position.set(0.14, 0.02, -0.1);
    thermoGroup.rotation.z = -0.12;

    const probeGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.6, 16);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8, roughness: 0.2 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.position.y = 0.3;
    thermoGroup.add(probe);

    const dialGeo = new THREE.BoxGeometry(0.09, 0.07, 0.03);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.5, roughness: 0.3 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.position.y = 0.58;
    thermoGroup.add(dial);

    beakerGroup.add(thermoGroup);

    // G. Particle Systems for Bubbles & Precipitate
    const particleCount = qualityLevel === 'low' ? 40 : 150;

    // 1. Gas Effervescence Bubbles System
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      bubblePositions[i * 3] = (Math.random() - 0.5) * (liquidMaxRadius * 1.5);
      bubblePositions[i * 3 + 1] = 0.03 + Math.random() * 0.35;
      bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * (liquidMaxRadius * 1.5);
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));
    const bubbleMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.018,
      transparent: true,
      opacity: 0.0 // Initially invisible
    });
    const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
    beakerGroup.add(bubblePoints);
    bubbleParticlesRef.current = bubblePoints;
    bubblePositionsRef.current = bubblePositions;

    // 2. Precipitate Crystal Flakes System
    const precipGeo = new THREE.BufferGeometry();
    const precipPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      precipPositions[i * 3] = (Math.random() - 0.5) * (liquidMaxRadius * 1.6);
      precipPositions[i * 3 + 1] = 0.03 + Math.random() * 0.38;
      precipPositions[i * 3 + 2] = (Math.random() - 0.5) * (liquidMaxRadius * 1.6);
    }
    precipGeo.setAttribute('position', new THREE.BufferAttribute(precipPositions, 3));
    const precipMat = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.022,
      transparent: true,
      opacity: 0.0
    });
    const precipPoints = new THREE.Points(precipGeo, precipMat);
    beakerGroup.add(precipPoints);
    precipitateParticlesRef.current = precipPoints;
    precipitatePositionsRef.current = precipPositions;

    // H. Pouring Liquid / Powder Stream Visual
    const streamGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.35, 12);
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.0,
      roughness: 0.1
    });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.position.set(0, 0.55, 0);
    beakerGroup.add(streamMesh);
    pouringStreamRef.current = streamMesh;

    // I. Test Tube Rack with Reagents on Left Bench
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-0.88, 0.04, 0.1);
    labGroup.add(rackGroup);

    const rackWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.7 });
    const rackBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.22), rackWoodMat);
    rackBase.position.y = 0.01;
    rackGroup.add(rackBase);

    const rackTop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 0.22), rackWoodMat);
    rackTop.position.y = 0.22;
    rackGroup.add(rackTop);

    // 4 test tubes in rack
    const ttColors = [0xEF4444, 0x10B981, 0x3B82F6, 0xF59E0B];
    for (let i = 0; i < 4; i++) {
      const ttX = -0.24 + i * 0.16;
      const ttWall = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.28, 16, 1, true), glassMaterial);
      ttWall.position.set(ttX, 0.15, 0);
      rackGroup.add(ttWall);

      const ttLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.14, 16),
        new THREE.MeshStandardMaterial({ color: ttColors[i], transparent: true, opacity: 0.85 })
      );
      ttLiquid.position.set(ttX, 0.09, 0);
      rackGroup.add(ttLiquid);
    }

    // J. Labeled Chemical Reagent Bottles on Right Bench Shelf
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(0.92, 0.04, -0.05);
    labGroup.add(shelfGroup);

    // Arrange bottles
    CHEMICAL_REAGENTS.slice(0, 6).forEach((reagent, idx) => {
      const bottleGroup = new THREE.Group();
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      bottleGroup.position.set(-0.25 + col * 0.26, 0.01, -0.2 + row * 0.32);

      // Glass Bottle Body
      const bBodyGeo = new THREE.CylinderGeometry(0.08, 0.085, 0.26, 24);
      const bBodyMat = new THREE.MeshPhysicalMaterial({
        color: reagent.state === 'powder' ? 0x94A3B8 : 0xCBD5E1,
        transmission: 0.7,
        roughness: 0.15,
        transparent: true,
        opacity: 0.88
      });
      const bBody = new THREE.Mesh(bBodyGeo, bBodyMat);
      bBody.position.y = 0.13;
      bottleGroup.add(bBody);

      // Reagent Fluid/Powder Core
      const bLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.076, 0.078, 0.18, 20),
        new THREE.MeshStandardMaterial({
          color: reagent.colorHex,
          roughness: reagent.state === 'powder' ? 0.9 : 0.2,
          transparent: true,
          opacity: 0.95
        })
      );
      bLiquid.position.y = 0.095;
      bottleGroup.add(bLiquid);

      // Cap
      const bCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.038, 0.038, 0.05, 16),
        new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.5, roughness: 0.3 })
      );
      bCap.position.y = 0.285;
      bottleGroup.add(bCap);

      // Label Band
      const bLabel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.082, 0.087, 0.11, 24, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.8 })
      );
      bLabel.position.y = 0.13;
      bottleGroup.add(bLabel);

      shelfGroup.add(bottleGroup);
      chemicalBottleMeshes.current.set(reagent.id, bottleGroup);
    });

    setLoadingProgress(100);
    setIsLoaded(true);

    // ---------------------------------------------------------
    // ANIMATION & PHYSICS TICK LOOP
    // ---------------------------------------------------------
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smoothly interpolate liquid volume and height
      currentLiquidHeight.current = THREE.MathUtils.lerp(
        currentLiquidHeight.current,
        targetLiquidHeight.current,
        delta * 3.5
      );

      if (liquidMeshRef.current) {
        const h = Math.max(0.001, currentLiquidHeight.current);
        liquidMeshRef.current.scale.set(1, h, 1);
        liquidMeshRef.current.visible = h > 0.01;
      }

      if (meniscusMeshRef.current) {
        const h = currentLiquidHeight.current;
        meniscusMeshRef.current.position.y = 0.02 + h * 0.45;
        meniscusMeshRef.current.visible = h > 0.03;
      }

      if (foamMeshRef.current) {
        const h = currentLiquidHeight.current;
        foamMeshRef.current.position.y = 0.03 + h * 0.45;
      }

      // Smooth color transition
      currentLiquidColor.current.lerp(targetLiquidColor.current, delta * 3.0);
      if (liquidMeshRef.current) {
        (liquidMeshRef.current.material as THREE.MeshPhysicalMaterial).color.copy(currentLiquidColor.current);
      }
      if (meniscusMeshRef.current) {
        (meniscusMeshRef.current.material as THREE.MeshStandardMaterial).color.copy(currentLiquidColor.current);
      }

      // Animate Effervescent Gas Bubbles (Rising & Re-spawning)
      if (bubbleParticlesRef.current && bubblePositionsRef.current) {
        const positions = bubblePositionsRef.current;
        const count = positions.length / 3;
        const maxH = Math.max(0.05, currentLiquidHeight.current * 0.44);
        const isBubbling = Boolean(activeReaction?.hasBubbles || stirrerOn);

        (bubbleParticlesRef.current.material as THREE.PointsMaterial).opacity = isBubbling ? 0.85 : 0.0;

        if (isBubbling) {
          for (let i = 0; i < count; i++) {
            // Move bubble upwards
            positions[i * 3 + 1] += (0.09 + (i % 5) * 0.03) * delta;
            // Slight horizontal wiggle
            positions[i * 3] += Math.sin(elapsed * 8 + i) * 0.0008;

            // Reset when reaching liquid surface
            if (positions[i * 3 + 1] > maxH) {
              positions[i * 3 + 1] = 0.03 + (Math.random() * 0.04);
              positions[i * 3] = (Math.random() - 0.5) * (liquidMaxRadius * 1.4);
              positions[i * 3 + 2] = (Math.random() - 0.5) * (liquidMaxRadius * 1.4);
            }
          }
          bubbleParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Animate Precipitate Particles (Forming & Settling to Bottom)
      if (precipitateParticlesRef.current && precipitatePositionsRef.current) {
        const positions = precipitatePositionsRef.current;
        const count = positions.length / 3;
        const hasPrecip = Boolean(activeReaction?.hasPrecipitate);

        (precipitateParticlesRef.current.material as THREE.PointsMaterial).opacity = hasPrecip ? 0.9 : 0.0;

        if (hasPrecip) {
          for (let i = 0; i < count; i++) {
            // Flakes drift gently downwards
            positions[i * 3 + 1] -= (0.03 + (i % 3) * 0.01) * delta;
            if (positions[i * 3 + 1] < 0.02) {
              positions[i * 3 + 1] = 0.02 + Math.random() * 0.015; // Settle on floor
            }
          }
          precipitateParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Animate Stirring Rod circular vortex
      if (stirringRodRef.current && stirrerOn) {
        stirringRodRef.current.rotation.y += delta * 12.0;
        stirringRodRef.current.position.x = Math.sin(elapsed * 10) * 0.04;
        stirringRodRef.current.position.z = Math.cos(elapsed * 10) * 0.04;
      }

      // Hot Plate Thermal Glow Pulse
      if (hotPlateGlowRef.current) {
        if (heaterOn) {
          hotPlateGlowRef.current.intensity = 1.8 + Math.sin(elapsed * 4) * 0.4;
        } else {
          hotPlateGlowRef.current.intensity = 0;
        }
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
      chemistryAudio.stopFizzSound();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [qualityLevel]);

  // -------------------------------------------------------------
  // MIXING INTERACTION: POUR A REAGENT INTO BEAKER
  // -------------------------------------------------------------
  const handlePourReagent = (reagent: ChemicalReagent) => {
    if (!ppeEquipped.goggles || !ppeEquipped.gloves) {
      setShowPpeWarning(true);
      return;
    }

    if (isPouring) return;
    setIsPouring(true);
    setActivePouringReagent(reagent);

    // Audio effect: pouring stream or powder scooping
    if (reagent.state === 'powder') {
      chemistryAudio.playTapSound();
    } else {
      chemistryAudio.playPourSound(1.2);
    }

    // Trigger visual pouring stream
    if (pouringStreamRef.current) {
      (pouringStreamRef.current.material as THREE.MeshStandardMaterial).color.setHex(reagent.colorHex);
      (pouringStreamRef.current.material as THREE.MeshStandardMaterial).opacity = 0.85;
    }

    // Animate fluid level rise
    const nextVolume = Math.min(250, liquidVolumeMl + (reagent.state === 'powder' ? 20 : 50));
    setLiquidVolumeMl(nextVolume);
    targetLiquidHeight.current = nextVolume / 250;

    // Evaluate Chemical Reaction after pouring completes
    setTimeout(() => {
      if (pouringStreamRef.current) {
        (pouringStreamRef.current.material as THREE.MeshStandardMaterial).opacity = 0;
      }
      setIsPouring(false);
      setActivePouringReagent(null);

      const updatedList = [...addedReagents, reagent.id];
      setAddedReagents(updatedList);

      const evalResult = evaluateMixture(updatedList);

      if (evalResult.unsafeHazard) {
        setActiveHazard(evalResult.unsafeHazard);
        chemistryAudio.stopFizzSound();
        return;
      }

      // Update fluid color
      targetLiquidColor.current.setHex(evalResult.colorHex);
      setCurrentPh(evalResult.ph);
      setTemperatureC(evalResult.temperature);

      if (evalResult.outcome) {
        setActiveReaction(evalResult.outcome);
        setIsReacting(true);

        // Sound effect: Reaction fizzing & discovery chime
        chemistryAudio.playReactionSuccessSound();
        if (evalResult.outcome.hasBubbles) {
          chemistryAudio.startFizzSound(0.22);
        }

        // Show foam if gas evolution
        if (foamMeshRef.current && evalResult.outcome.hasFoam) {
          (foamMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.85;
        }

        // Check prediction if student made one
        if (predictModeActive && studentPrediction) {
          const isCorrect = (studentPrediction === evalResult.outcome.type);
          setPredictionResult({
            correct: isCorrect,
            text: isCorrect
              ? `Hypothesis Confirmed! You correctly predicted a ${evalResult.outcome.type} reaction.`
              : `Interesting observation! Your hypothesis was ${studentPrediction}, but the reaction produced a ${evalResult.outcome.type}.`
          });
        }

        // Auto-save entry into Digital Lab Notebook
        const newEntry = {
          id: `EXP-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          name: evalResult.outcome.name,
          equation: evalResult.outcome.equation,
          observations: evalResult.outcome.observations,
          ph: evalResult.ph,
          temperature: evalResult.temperature
        };
        const updatedNotebook = [newEntry, ...notebookEntries];
        setNotebookEntries(updatedNotebook);
        try {
          localStorage.setItem('neonova_chem_mixing_notebook', JSON.stringify(updatedNotebook));
        } catch {}

        // Award Academic XP
        onAddAcademicXP?.(35);
      }
    }, 1200);
  };

  // -------------------------------------------------------------
  // EXPERIMENT RESET HANDLER
  // -------------------------------------------------------------
  const handleResetBeaker = () => {
    chemistryAudio.stopFizzSound();
    chemistryAudio.playTapSound();
    setAddedReagents([]);
    setLiquidVolumeMl(0);
    setActiveReaction(null);
    setActiveHazard(null);
    setIsReacting(false);
    setCurrentPh(7.0);
    setTemperatureC(22.0);
    setHeaterOn(false);
    setStirrerOn(false);
    setStudentPrediction(null);
    setPredictionResult(null);
    targetLiquidHeight.current = 0;
    targetLiquidColor.current.setHex(0xE0F2FE);

    if (foamMeshRef.current) {
      (foamMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 0;
    }
    if (bubbleParticlesRef.current) {
      (bubbleParticlesRef.current.material as THREE.PointsMaterial).opacity = 0;
    }
    if (precipitateParticlesRef.current) {
      (precipitateParticlesRef.current.material as THREE.PointsMaterial).opacity = 0;
    }
  };

  // -------------------------------------------------------------
  // QUICK PRESET HERO EXPERIMENT: BAKING SODA + VINEGAR
  // -------------------------------------------------------------
  const handleLoadHeroBakingSodaVinegar = () => {
    handleResetBeaker();
    setTimeout(() => {
      const vinegar = CHEMICAL_REAGENTS.find(c => c.id === 'vinegar')!;
      handlePourReagent(vinegar);
      setTimeout(() => {
        const soda = CHEMICAL_REAGENTS.find(c => c.id === 'baking_soda')!;
        handlePourReagent(soda);
      }, 1600);
    }, 300);
  };

  // Toggle Stirring
  const handleToggleStirrer = () => {
    const next = !stirrerOn;
    setStirrerOn(next);
    if (next) {
      chemistryAudio.playStirSound();
    }
  };

  // Toggle Heating
  const handleToggleHeater = () => {
    const next = !heaterOn;
    setHeaterOn(next);
    if (next) {
      setTemperatureC(prev => Math.min(85, prev + 25.0));
      chemistryAudio.playTapSound();
    } else {
      setTemperatureC(prev => Math.max(22, prev - 25.0));
    }
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const muted = chemistryAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 select-none overflow-x-hidden font-sans">
      {/* ========================================================= */}
      {/* 1. TOP CONTROL BAR & SPACE-THEMED LAB HEADER */}
      {/* ========================================================= */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-indigo-500/20 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <FlaskConical size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                3D Chemistry Virtual Mixing Lab
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-mono">
                PBR Physical
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive Glass Beakers, Meniscus, Particle Fizzing & Stoichiometric Reactions
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Preset Hero Experiment: Baking Soda + Vinegar */}
          <button
            type="button"
            onClick={handleLoadHeroBakingSodaVinegar}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-md cursor-pointer transition-all"
            title="Run featured Baking Soda + Vinegar gas release reaction"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Featured:</span>
            <span>Baking Soda + Vinegar</span>
          </button>

          {/* Predict First Toggle */}
          <button
            type="button"
            onClick={() => setPredictModeActive(!predictModeActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              predictModeActive
                ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-500/25'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Formulate a hypothesis before mixing"
          >
            <Eye size={14} />
            <span>{predictModeActive ? 'Predict Mode ON' : 'Predict First'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isMuted
                ? 'bg-slate-800 text-slate-500 border-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/30'
            }`}
            title={isMuted ? 'Unmute reaction audio' : 'Mute reaction audio'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Lab Notebook Button */}
          <button
            type="button"
            onClick={() => setShowNotebook(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Notebook</span>
            <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] rounded-full font-mono">
              {notebookEntries.length}
            </span>
          </button>

          {/* Reset Beaker */}
          <button
            type="button"
            onClick={handleResetBeaker}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all"
            title="Drain beaker and sterilize equipment"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Close mixing lab"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN 3D SIMULATION WORKBENCH + DUAL PANEL INTERFACE */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* LEFT / CENTER: PHOTOREALISTIC 3D CANVAS STAGE */}
        <div className="flex-1 relative min-h-[380px] lg:min-h-full bg-slate-950 flex flex-col">
          {/* Three.js Mounting Div */}
          <div
            ref={mountRef}
            className="w-full h-full min-h-[380px] cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
          />

          {/* Loading Progress Overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-30">
              <FlaskConical size={36} className="text-cyan-400 animate-bounce mb-3" />
              <div className="text-sm font-bold text-white mb-2">Preparing 3D Chemistry Glassware...</div>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* TOP-LEFT: REAL-TIME TELEMETRY SENSORS (pH & Thermometer) */}
          <div className="absolute top-3 left-3 z-20 bg-slate-900/85 border border-indigo-500/30 rounded-2xl p-3 shadow-xl backdrop-blur-md text-xs text-slate-200 select-none min-w-[210px]">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800 font-bold text-cyan-400">
              <div className="flex items-center gap-1.5">
                <Activity size={13} />
                <span>Live Beaker Telemetry</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono font-bold">
                250mL Pyrex
              </span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              {/* Thermometer Temperature */}
              <div className="flex items-center justify-between bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Thermometer size={14} />
                  <span className="text-slate-300">Temp:</span>
                </div>
                <span className={`font-bold text-sm ${temperatureC < 21.0 ? 'text-cyan-300' : temperatureC > 23.0 ? 'text-rose-400' : 'text-white'}`}>
                  {temperatureC.toFixed(1)}°C
                </span>
              </div>

              {/* pH Level & Color Bar */}
              <div className="flex items-center justify-between bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Droplets size={14} />
                  <span className="text-slate-300">pH Level:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/40"
                    style={{
                      backgroundColor: currentPh <= 3 ? '#ef4444' : currentPh <= 6.5 ? '#f59e0b' : currentPh <= 7.5 ? '#10b981' : currentPh <= 11 ? '#06b6d4' : '#8b5cf6'
                    }}
                  />
                  <span className="font-bold text-sm text-white">
                    {currentPh.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-between bg-slate-800/60 px-2.5 py-1 rounded-xl text-[10px] text-slate-400">
                <span>Fluid Volume:</span>
                <span className="font-semibold text-slate-200">{liquidVolumeMl} mL</span>
              </div>
            </div>
          </div>

          {/* TOP-RIGHT: BENCH TOOLS (Stirring Rod & Hot Plate) */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleToggleStirrer}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold border backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                stirrerOn
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <RotateCcw size={14} className={stirrerOn ? 'animate-spin' : ''} />
              <span>{stirrerOn ? 'Stirring (Active)' : 'Stir Rod'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleHeater}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold border backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                heaterOn
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-400 shadow-orange-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Flame size={14} className={heaterOn ? 'text-amber-300 animate-pulse' : ''} />
              <span>{heaterOn ? 'Hot Plate (ON)' : 'Hot Plate'}</span>
            </button>
          </div>

          {/* BOTTOM ORBIT TOUCH GUIDANCE */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-[11px] text-slate-400 pointer-events-none select-none text-center">
            360° View: Drag to rotate table • Pinch or scroll to inspect liquid meniscus
          </div>
        </div>

        {/* RIGHT: CHEMICAL REAGENTS INVENTORY & REACTION INTELLIGENCE PANEL */}
        <aside className="w-full lg:w-[440px] bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-y-auto max-h-[500px] lg:max-h-full">
          {/* PREDICT FIRST HYPOTHESIS MODAL / BANNER */}
          {predictModeActive && !activeReaction && (
            <div className="p-4 bg-purple-950/40 border-b border-purple-500/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                <Eye size={14} />
                <span>Predict First: Formulate Your Hypothesis</span>
              </div>
              <p className="text-xs text-purple-200 mb-2.5">
                Before pouring reagents into the beaker, what outcome do you predict will happen?
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Gas Evolution (Fizzing)', val: 'Gas Evolution' },
                  { label: 'Solid Precipitate', val: 'Precipitation' },
                  { label: 'Acid-Base Neutralization', val: 'Neutralization' },
                  { label: 'Catalytic Breakdown', val: 'Decomposition' }
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setStudentPrediction(item.val)}
                    className={`p-2 rounded-xl border text-left text-[11px] font-semibold transition-all cursor-pointer ${
                      studentPrediction === item.val
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PREDICTION CONFIRMATION RESULT */}
          {predictionResult && (
            <div className={`p-3 mx-4 mt-3 rounded-2xl border text-xs font-medium flex items-start gap-2 ${
              predictionResult.correct
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
            }`}>
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>{predictionResult.text}</span>
            </div>
          )}

          {/* ACTIVE REACTION SCIENTIFIC SUMMARY CARD */}
          {activeReaction && (
            <div className="p-4 bg-gradient-to-b from-indigo-950/50 to-slate-900 border-b border-slate-800">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md uppercase tracking-wider">
                    {activeReaction.type}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                    {activeReaction.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuizModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold rounded-xl shadow-md cursor-pointer transition-all shrink-0"
                >
                  <Award size={13} />
                  <span>Take Quiz</span>
                </button>
              </div>

              {/* Balanced Chemical Equation Box */}
              <div className="p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 flex items-center justify-between mb-3 shadow-inner">
                <span className="font-bold text-slate-400">Equation:</span>
                <span className="select-text">{activeReaction.equation}</span>
              </div>

              {/* Real-Time Scientific Observations */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Observed Phenomena:
                </span>
                {activeReaction.observations.map((obs, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{obs}</span>
                  </div>
                ))}
              </div>

              {/* Grade-Tailored Explanation Selector */}
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Atom size={12} />
                    <span>Grade-Tailored Concept</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    {(['elementary', 'middleSchool', 'highSchool'] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExplanationLevel(lvl)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize transition-all cursor-pointer ${
                          explanationLevel === lvl
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl === 'elementary' ? 'Elem' : lvl === 'middleSchool' ? 'Middle' : 'High'}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed select-text">
                  {activeReaction.explanation[explanationLevel]}
                </p>

                {/* Send to AI Assistant Button */}
                {onSendToAiAssistant && (
                  <button
                    type="button"
                    onClick={() => {
                      const prompt = `Can you explain the chemistry of this reaction in depth: ${activeReaction.name}? Equation: ${activeReaction.equation}. Why did the temperature change and how do the molecular bonds rearrange?`;
                      onSendToAiAssistant(prompt);
                    }}
                    className="w-full mt-2 py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Bot size={14} />
                    <span>Explain this reaction with AI Tutor</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CHEMICAL REAGENTS INVENTORY SHELF */}
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FlaskConical size={14} className="text-cyan-400" />
                <span>Reagent Bottles Shelf (Tap to Pour)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {addedReagents.length} in beaker
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Tap any reagent to dispense into the 250mL beaker. Combine safe acids, bases, powders, and indicators!
            </p>

            {/* Reagents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHEMICAL_REAGENTS.map(reagent => {
                const isAlreadyIn = addedReagents.includes(reagent.id);
                const isPouringThis = activePouringReagent?.id === reagent.id;

                return (
                  <button
                    key={reagent.id}
                    type="button"
                    disabled={isPouring}
                    onClick={() => handlePourReagent(reagent)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isPouringThis
                        ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-400/50'
                        : isAlreadyIn
                        ? 'bg-slate-800/90 border-indigo-500/50 shadow-xs'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: reagent.colorCss }}
                        />
                        <span className="font-bold text-xs text-white leading-tight">
                          {reagent.name.split('(')[0]}
                        </span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono">
                        {reagent.state}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                      <span>{reagent.formula}</span>
                      <span className="text-cyan-300 font-semibold">pH {reagent.ph}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 3. SAFETY HAZARD ALERT MODAL ("Don't mix this!") */}
      {/* ========================================================= */}
      {activeHazard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                School Lab Safety Intervention
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Safety Alert: Don't mix this!
              </h3>
              <p className="text-xs font-bold text-rose-300">
                {activeHazard.title}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed space-y-2">
              <p>{activeHazard.reason}</p>
              <div className="p-2 bg-rose-950/50 border border-rose-800/60 rounded-xl text-[11px] text-rose-200">
                <span className="font-bold text-white">Real-World Hazard: </span>
                {activeHazard.realWorldDanger}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center italic">
              NeoNova blocks hazardous chemical reactions to maintain a safe, curriculum-compliant educational environment.
            </p>

            <button
              type="button"
              onClick={handleResetBeaker}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
            >
              Reset Beaker & Return to Safe Reagents
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. POST-REACTION QUIZ MODAL */}
      {/* ========================================================= */}
      {showQuizModal && activeReaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Concept Mastery Quiz: {activeReaction.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQuizModal(false);
                  setSelectedQuizOption(null);
                  setQuizSubmitted(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-200">
              {activeReaction.quiz.question}
            </p>

            <div className="space-y-2">
              {activeReaction.quiz.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200';
                if (quizSubmitted) {
                  if (idx === activeReaction.quiz.correctIndex) {
                    btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold';
                  } else if (idx === selectedQuizOption) {
                    btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-200';
                  }
                } else if (selectedQuizOption === idx) {
                  btnStyle = 'bg-indigo-600 text-white border-indigo-400';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizSubmitted}
                    onClick={() => setSelectedQuizOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {quizSubmitted && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-cyan-400">Scientific Rationale: </span>
                {activeReaction.quiz.explanation}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={selectedQuizOption === null}
                  onClick={() => {
                    setQuizSubmitted(true);
                    if (selectedQuizOption === activeReaction.quiz.correctIndex) {
                      onAddAcademicXP?.(20);
                      chemistryAudio.playReactionSuccessSound();
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowQuizModal(false);
                    setSelectedQuizOption(null);
                    setQuizSubmitted(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DIGITAL LAB NOTEBOOK DRAWER */}
      {/* ========================================================= */}
      {showNotebook && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Digital Laboratory Notebook</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotebook(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notebookEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No experiments recorded yet. Pour chemical reagents to observe reactions!
                </div>
              ) : (
                notebookEntries.map(entry => (
                  <div key={entry.id} className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-cyan-400">{entry.timestamp}</span>
                      <span className="font-mono">pH {entry.ph.toFixed(1)} • {entry.temperature.toFixed(1)}°C</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{entry.name}</h4>
                    <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      {entry.equation}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
