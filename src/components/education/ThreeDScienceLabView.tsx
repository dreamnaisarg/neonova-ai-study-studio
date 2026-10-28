import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  FlaskConical, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Info, 
  Maximize2, 
  Minimize2, 
  Search, 
  Eye, 
  Flame, 
  Atom, 
  X, 
  HelpCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Compass,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight,
  ChevronLeft,
  Settings,
  Droplets,
  Zap,
  Activity,
  Check,
  Save,
  FileText,
  Lock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Target,
  Thermometer,
  Gauge,
  Move
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { 
  SCIENCE_EXPERIMENTS_CATALOG, 
  ScienceExperiment,
  PPESafetyRequirements,
  QuizQuestion
} from '../../lib/scienceLab/labSimulationEngine';
import { 
  build3DLaboratory, 
  checkPlayerCollision, 
  BuiltLaboratory, 
  CollisionBox,
  WorkstationLocation 
} from '../../lib/scienceLab/threeDLabRoomBuilder';
import { naturalVoiceEngine } from '../../lib/naturalVoiceEngine';
import { PlanTier } from '../../lib/billing';

export interface ThreeDScienceLabViewProps {
  currentGrade?: string;
  onNavigateTab?: (tab: string) => void;
  currentTier?: PlanTier;
  onOpenPlans?: () => void;
}

export default function ThreeDScienceLabView({
  currentGrade = 'Grade 8',
  onNavigateTab,
  currentTier = 'starter',
  onOpenPlans
}: ThreeDScienceLabViewProps) {
  // Mode: 'free_roam' | 'station_workbench'
  const [labMode, setLabMode] = useState<'free_roam' | 'station_workbench'>('free_roam');
  const [activeStationId, setActiveStationId] = useState<string>('chemistry_bench');
  const { isFinnish } = useTranslation();
  const [isMobile3DFullscreen, setIsMobile3DFullscreen] = useState(false);
  const [showSensorHud, setShowSensorHud] = useState(true);

  // Experiment selection
  const [activeExperiment, setActiveExperiment] = useState<ScienceExperiment>(SCIENCE_EXPERIMENTS_CATALOG[0]);
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'chemistry' | 'physics' | 'biology' | 'general'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // PPE Equipment state
  const [equippedPPE, setEquippedPPE] = useState<{
    goggles: boolean;
    mask: boolean;
    gloves: boolean;
    coat: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('neonova_3d_lab_ppe');
      return saved ? JSON.parse(saved) : { goggles: false, mask: false, gloves: false, coat: false };
    } catch {
      return { goggles: false, mask: false, gloves: false, coat: false };
    }
  });

  // PPE Animation Notice
  const [ppeEquipAnimation, setPpeEquipAnimation] = useState<string | null>(null);

  // Proximity Notice
  const [nearbyStation, setNearbyStation] = useState<WorkstationLocation | null>(null);

  // Tutorial Modal
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neonova_3d_lab_tutorial_seen') !== 'true';
    } catch {
      return true;
    }
  });

  // Lab Notebook Drawer
  const [showNotebook, setShowNotebook] = useState(false);
  const [studentNotes, setStudentNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState<Array<{
    id: string;
    experimentTitle: string;
    timestamp: string;
    notes: string;
    grade: string;
    observations: string[];
  }>>(() => {
    try {
      const s = localStorage.getItem('neonova_3d_lab_notebook');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Experiment Steps & Simulation State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [observationLogs, setObservationLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' }>>([]);
  
  // Interactive Simulation Controls
  const [expParams, setExpParams] = useState<Record<string, any>>(SCIENCE_EXPERIMENTS_CATALOG[0].initialParams);

  // Post-Experiment Quiz Modal
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Completed Experiments Tracking
  const [completedExps, setCompletedExps] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('neonova_3d_lab_completed');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Audio Voice Narration
  const [isVoiceNarrating, setIsVoiceNarrating] = useState(false);

  // 3D Canvas Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const builtLabRef = useRef<BuiltLaboratory | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // First-person player state
  const playerPos = useRef(new THREE.Vector3(0, 1.6, 5.0)); // Initial spawn in center facing forward
  const playerYaw = useRef(0); // rotation around Y in radians
  const playerPitch = useRef(0); // rotation around X in radians
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false
  });

  // Touch look drag ref
  const isDraggingTouch = useRef(false);
  const lastTouchX = useRef(0);
  const lastTouchY = useRef(0);

  // Filtered experiments catalog
  const filteredExperiments = useMemo(() => {
    return SCIENCE_EXPERIMENTS_CATALOG.filter(exp => {
      if (selectedSubject !== 'all' && exp.subject !== selectedSubject) return false;
      if (selectedDifficulty !== 'all' && exp.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = exp.title.toLowerCase().includes(q) ||
          exp.tagline.toLowerCase().includes(q) ||
          exp.formula.toLowerCase().includes(q) ||
          exp.scientificPrinciples.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [selectedSubject, selectedDifficulty, searchQuery]);

  // PPE Compliance for Current Experiment
  const ppeCompliance = useMemo(() => {
    const req = activeExperiment.ppeRequired;
    const missing: string[] = [];
    if (req.goggles && !equippedPPE.goggles) missing.push('Safety Goggles');
    if (req.mask && !equippedPPE.mask) missing.push('Laboratory Mask');
    if (req.gloves && !equippedPPE.gloves) missing.push('Protective Gloves');
    if (req.coat && !equippedPPE.coat) missing.push('Lab Coat');

    return {
      isFullyCompliant: missing.length === 0,
      missingItems: missing
    };
  }, [activeExperiment, equippedPPE]);

  // Toggle PPE items
  const handleTogglePPE = (item: 'goggles' | 'mask' | 'gloves' | 'coat') => {
    setEquippedPPE(prev => {
      const nextVal = !prev[item];
      const updated = { ...prev, [item]: nextVal };
      try {
        localStorage.setItem('neonova_3d_lab_ppe', JSON.stringify(updated));
      } catch {}

      const labelMap = {
        goggles: 'Protective Safety Goggles',
        mask: 'Laboratory Vapor & Particulate Mask',
        gloves: 'Chemical-Resistant Nitrile Gloves',
        coat: 'Flame-Retardant Lab Coat'
      };

      setPpeEquipAnimation(
        nextVal ? `Equipped ${labelMap[item]}!` : `Removed ${labelMap[item]}.`
      );
      setTimeout(() => setPpeEquipAnimation(null), 2500);

      // Voice narration
      if (nextVal) {
        naturalVoiceEngine.speakEducationalText(
          `${labelMap[item]} equipped. Safety verification updated.`
        );
      }

      return updated;
    });
  };

  // Equip all PPE at once
  const handleEquipAllPPE = () => {
    const all = { goggles: true, mask: true, gloves: true, coat: true };
    setEquippedPPE(all);
    try {
      localStorage.setItem('neonova_3d_lab_ppe', JSON.stringify(all));
    } catch {}
    setPpeEquipAnimation('All Personal Protective Equipment equipped!');
    setTimeout(() => setPpeEquipAnimation(null), 2500);
    naturalVoiceEngine.speakEducationalText(
      'Full personal protective equipment equipped. Goggles, mask, gloves, and lab coat verified.'
    );
  };

  // Keyboard movement listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (labMode !== 'free_roam') return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
          moveState.current.left = true;
          break;
        case 'KeyD':
          moveState.current.right = true;
          break;
        case 'ArrowLeft':
        case 'KeyQ':
          moveState.current.turnLeft = true;
          break;
        case 'ArrowRight':
        case 'KeyE':
          moveState.current.turnRight = true;
          break;
        case 'Space':
        case 'KeyF':
          // If near a station, interact!
          if (nearbyStation) {
            handleEnterStation(nearbyStation.id);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
          moveState.current.left = false;
          break;
        case 'KeyD':
          moveState.current.right = false;
          break;
        case 'ArrowLeft':
        case 'KeyQ':
          moveState.current.turnLeft = false;
          break;
        case 'ArrowRight':
        case 'KeyE':
          moveState.current.turnRight = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [labMode, nearbyStation]);

  // Three.js 3D Scene Initialization
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0F172A); // Deep slate
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    camera.position.copy(playerPos.current);
    cameraRef.current = camera;

    // 3. Renderer with PBR ACESFilmic Tone Mapping and SRGB Color Space
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Physical Studio Environment Map for Glass & Chrome PBR Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Ambient and Directional Key Lighting
    const hemiLight = new THREE.HemisphereLight(0xF8FAFC, 0x334155, 0.95);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 6. Build 3D Lab Room with Procedural PBR Apparatuses & Safety Gear
    const builtLab = build3DLaboratory();
    scene.add(builtLab.roomGroup);
    builtLabRef.current = builtLab;

    // 7. Configure Camera & Controls based on active mode
    if (labMode === 'station_workbench') {
      const currentWs = builtLab.workstations.find(w => w.id === activeStationId) || builtLab.workstations[0];
      camera.position.set(currentWs.lookAt.x, currentWs.lookAt.y + 0.42, currentWs.lookAt.z + 1.12);
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.target.set(currentWs.lookAt.x, currentWs.lookAt.y + 0.16, currentWs.lookAt.z);
      controls.minDistance = 0.35;
      controls.maxDistance = 2.4;
      controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent dipping beneath the lab bench
      controlsRef.current = controls;
    } else {
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      camera.position.copy(playerPos.current);
    }

    // 8. Animation and Movement Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Update room visual animations (flame flicker, bubbles, stir bar, dust motes)
      builtLab.updateAnimations(delta);

      if (labMode === 'station_workbench') {
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      } else {
        // First-person Movement in free_roam
        const moveSpeed = 4.2 * delta;
        const turnSpeed = 2.0 * delta;

        // Turn controls
        if (moveState.current.turnLeft) playerYaw.current += turnSpeed;
        if (moveState.current.turnRight) playerYaw.current -= turnSpeed;

        // Calculate translation vector
        let dx = 0;
        let dz = 0;

        if (moveState.current.forward) {
          dx -= Math.sin(playerYaw.current) * moveSpeed;
          dz -= Math.cos(playerYaw.current) * moveSpeed;
        }
        if (moveState.current.backward) {
          dx += Math.sin(playerYaw.current) * moveSpeed;
          dz += Math.cos(playerYaw.current) * moveSpeed;
        }
        if (moveState.current.left) {
          dx -= Math.cos(playerYaw.current) * moveSpeed;
          dz += Math.sin(playerYaw.current) * moveSpeed;
        }
        if (moveState.current.right) {
          dx += Math.cos(playerYaw.current) * moveSpeed;
          dz -= Math.sin(playerYaw.current) * moveSpeed;
        }

        // Test proposed new position with solid AABB collision detection
        const proposedPos = playerPos.current.clone();
        proposedPos.x += dx;
        proposedPos.z += dz;

        const isColliding = checkPlayerCollision(proposedPos, builtLab.collisionBoxes);
        if (!isColliding) {
          playerPos.current.copy(proposedPos);
        } else {
          // Slide along X if Z collides
          const tryX = playerPos.current.clone();
          tryX.x += dx;
          if (!checkPlayerCollision(tryX, builtLab.collisionBoxes)) {
            playerPos.current.x += dx;
          } else {
            // Slide along Z if X collides
            const tryZ = playerPos.current.clone();
            tryZ.z += dz;
            if (!checkPlayerCollision(tryZ, builtLab.collisionBoxes)) {
              playerPos.current.z += dz;
            }
          }
        }

        // Apply position to camera
        camera.position.copy(playerPos.current);

        // Calculate look direction from yaw and pitch
        const lookTarget = new THREE.Vector3(
          camera.position.x - Math.sin(playerYaw.current) * Math.cos(playerPitch.current),
          camera.position.y + Math.sin(playerPitch.current),
          camera.position.z - Math.cos(playerYaw.current) * Math.cos(playerPitch.current)
        );
        camera.lookAt(lookTarget);

        // Check proximity to workstations
        let closestWs: WorkstationLocation | null = null;
        let minDistance = 999;
        for (const ws of builtLab.workstations) {
          const d = playerPos.current.distanceTo(ws.lookAt);
          if (d <= ws.interactionDistance && d < minDistance) {
            minDistance = d;
            closestWs = ws;
          }
        }
        setNearbyStation(closestWs);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
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
      cancelAnimationFrame(animationFrameId);
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [labMode, activeStationId]);

  // Synchronize apparatus physical state with experiment parameters and simulation loop
  useEffect(() => {
    if (!builtLabRef.current) return;
    const lab = builtLabRef.current;

    // 1. Chemistry Apparatus
    const ph = 7.00 - (expParams.acidVolume ? expParams.acidVolume * 0.08 : 0) + (expParams.baseVolume ? expParams.baseVolume * 0.09 : 0);
    // Determine dynamic solution color based on pH / indicator
    let solutionHex = 0x22D3EE; // clear cyan default
    if (activeExperiment.stationId === 'chemistry_bench') {
      if (ph < 3.5) {
        solutionHex = 0xEF4444; // strongly acidic red
      } else if (ph < 6.5) {
        solutionHex = 0xF59E0B; // weakly acidic orange/amber
      } else if (ph <= 7.5) {
        solutionHex = 0x10B981; // neutral emerald green
      } else if (ph < 8.5) {
        solutionHex = 0x06B6D4; // light cyan
      } else {
        solutionHex = 0xEC4899; // phenolphthalein vibrant pink / fuchsia
      }
    }
    lab.chemistryController.setLiquidColor(solutionHex);

    const flameLevel = expParams.flameIntensity !== undefined
      ? expParams.flameIntensity / 100
      : (isSimulating ? 0.75 : 0.2);
    lab.chemistryController.setFlameIntensity(flameLevel);

    const isStir = Boolean(expParams.stirring || isSimulating);
    lab.chemistryController.setStirring(isStir);

    const isBubbling = Boolean(expParams.bubbling || isSimulating || (expParams.flameIntensity && expParams.flameIntensity > 50));
    lab.chemistryController.setBubblesActive(isBubbling);

    if (expParams.liquidVolume !== undefined) {
      lab.chemistryController.setLiquidVolume(expParams.liquidVolume);
    }

    // 2. Physics Apparatus
    lab.physicsController.setLaserActive(expParams.laserActive !== false);
    const currentVal = expParams.galvanometerCurrent ?? ((expParams.voltage || 1.5) / (expParams.resistance || 50));
    lab.physicsController.setGalvanometerCurrent(currentVal);

    // 3. Biology Apparatus
    lab.biologyController.setMicroscopeLight(true);

    // 4. General Science Apparatus
    const totalMass = 125.40 + (expParams.powderMass || 0) + (expParams.liquidVolume ? expParams.liquidVolume * 0.99 : 0);
    lab.generalController.setBalanceReading(totalMass);
  }, [activeExperiment, expParams, isSimulating, simProgress, activeStationId]);

  // Mouse / Touch Look Around Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingTouch.current = true;
    lastTouchX.current = e.clientX;
    lastTouchY.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingTouch.current || labMode !== 'free_roam') return;
    const dx = e.clientX - lastTouchX.current;
    const dy = e.clientY - lastTouchY.current;
    lastTouchX.current = e.clientX;
    lastTouchY.current = e.clientY;

    const lookSensitivity = 0.005;
    playerYaw.current -= dx * lookSensitivity;
    playerPitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, playerPitch.current - dy * lookSensitivity));
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    isDraggingTouch.current = false;
    if (e) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Mobile Touch Turn & Tilt controls
  const handleMobileTurn = (direction: 'left' | 'right', delta = 0.25) => {
    if (direction === 'left') {
      playerYaw.current += delta;
    } else {
      playerYaw.current -= delta;
    }
  };

  const handleMobileTilt = (direction: 'up' | 'down', delta = 0.15) => {
    if (direction === 'up') {
      playerPitch.current = Math.min(Math.PI / 3, playerPitch.current + delta);
    } else {
      playerPitch.current = Math.max(-Math.PI / 3, playerPitch.current - delta);
    }
  };

  const handleCenterView = () => {
    playerPitch.current = 0;
  };

  // Teleport to or inspect workstation
  const handleEnterStation = (stationId: string) => {
    setActiveStationId(stationId);
    setLabMode('station_workbench');

    // Find first experiment matching station
    const matchedExp = SCIENCE_EXPERIMENTS_CATALOG.find(e => e.stationId === stationId);
    if (matchedExp) {
      handleSelectExperiment(matchedExp);
    }
  };

  // Return to free roaming
  const handleExitToFreeRoam = () => {
    setLabMode('free_roam');
    // Align camera looking into lab
    if (cameraRef.current) {
      cameraRef.current.position.copy(playerPos.current);
    }
  };

  // Select experiment
  const handleSelectExperiment = (exp: ScienceExperiment) => {
    setActiveExperiment(exp);
    setActiveStationId(exp.stationId);
    setCurrentStepIndex(0);
    setIsSimulating(false);
    setSimProgress(0);
    setExpParams(exp.initialParams);
    setObservationLogs([
      { time: '00:00', text: `Loaded experiment: ${exp.title}. Station: ${exp.stationName}.`, type: 'info' }
    ]);
  };

  // Step advancement
  const handleNextStep = () => {
    if (currentStepIndex < activeExperiment.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = activeExperiment.steps[nextIdx];

      setObservationLogs(prev => [
        { 
          time: `00:0${nextIdx * 2}`, 
          text: `Completed Step ${nextIdx}: ${step.title}. ${step.instruction}`, 
          type: 'info' 
        },
        ...prev
      ]);

      if (isVoiceNarrating) {
        naturalVoiceEngine.speakEducationalText(
          `Step ${nextIdx + 1}: ${step.title}. ${step.instruction}.`
        );
      }
    } else {
      // Completed all steps!
      handleCompleteExperiment();
    }
  };

  // Handle Complete Experiment
  const handleCompleteExperiment = () => {
    if (!completedExps.includes(activeExperiment.id)) {
      const updated = [...completedExps, activeExperiment.id];
      setCompletedExps(updated);
      try {
        localStorage.setItem('neonova_3d_lab_completed', JSON.stringify(updated));
      } catch {}
    }

    setObservationLogs(prev => [
      { time: '00:15', text: `Experiment Complete! All observations recorded. Prepared for Post-Lab Quiz.`, type: 'success' },
      ...prev
    ]);

    naturalVoiceEngine.speakEducationalText(
      `Congratulations! You have successfully completed ${activeExperiment.title}. You are now ready for the post-lab concept quiz.`
    );

    // Auto prompt quiz
    setShowQuiz(true);
    setCurrentQuizQuestion(0);
    setSelectedQuizAnswers([]);
    setQuizFinished(false);
  };

  // Handle Save to Digital Notebook
  const handleSaveNotebook = () => {
    const entry = {
      id: `lab-note-${Date.now()}`,
      experimentTitle: activeExperiment.title,
      timestamp: new Date().toLocaleString(),
      notes: studentNotes.trim() || `Verified ${activeExperiment.formula}. Successfully conducted on ${activeExperiment.stationName}.`,
      grade: currentGrade,
      observations: observationLogs.map(l => `[${l.time}] ${l.text}`)
    };

    const updated = [entry, ...savedNotes];
    setSavedNotes(updated);
    try {
      localStorage.setItem('neonova_3d_lab_notebook', JSON.stringify(updated));
    } catch {}

    setStudentNotes('');
    naturalVoiceEngine.speakEducationalText('Experiment observations saved to your digital laboratory notebook.');
  };

  // Reset experiment
  const handleResetExperiment = () => {
    setCurrentStepIndex(0);
    setIsSimulating(false);
    setSimProgress(0);
    setExpParams(activeExperiment.initialParams);
    setObservationLogs([
      { time: '00:00', text: `Equipment reset to pristine baseline. Solutions drained and sterilized.`, type: 'warn' }
    ]);
  };

  // Quiz submission
  const handleAnswerQuiz = (optionIdx: number) => {
    const updated = [...selectedQuizAnswers, optionIdx];
    setSelectedQuizAnswers(updated);

    if (currentQuizQuestion < activeExperiment.quiz.length - 1) {
      setCurrentQuizQuestion(prev => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      activeExperiment.quiz.forEach((q, idx) => {
        if (updated[idx] === q.correctAnswer) score++;
      });
      setQuizScore(score);
      setQuizFinished(true);
      naturalVoiceEngine.speakEducationalText(
        `Quiz complete! You scored ${score} out of ${activeExperiment.quiz.length}.`
      );
    }
  };

  // Toggle Voice Narration
  const handleToggleVoice = () => {
    if (isVoiceNarrating) {
      naturalVoiceEngine.stop();
      setIsVoiceNarrating(false);
    } else {
      setIsVoiceNarrating(true);
      const step = activeExperiment.steps[currentStepIndex];
      naturalVoiceEngine.speakEducationalText(
        `Welcome to the 3D Science Laboratory. Active experiment: ${activeExperiment.title}. Step ${currentStepIndex + 1}: ${step.title}. ${step.instruction}`
      );
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 select-none overflow-x-hidden">
      {/* ========================================================= */}
      {/* TOP LAB CONTROL HEADER */}
      {/* ========================================================= */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <FlaskConical size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isFinnish ? '3D-tiedelaboratorio' : '3D Science Laboratory'}
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                {isFinnish ? 'Interaktiivinen WebGL 3D' : 'Interactive WebGL 3D'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isFinnish
                ? 'Vapaasti tutkittava 3D-laboratorio • Fysikaalinen simulaatiomoottori • Suojavarusteet'
                : 'First-Person Walkable Lab • Physical Simulation Engine • PPE Safety Protocols'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={handleExitToFreeRoam}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                labMode === 'free_roam'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass size={14} />
              <span>{isFinnish ? 'Vapaa tutkimus (3D)' : 'Free Roam (3D)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setLabMode('station_workbench')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                labMode === 'station_workbench'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FlaskConical size={14} />
              <span>{isFinnish ? 'Työpiste ja kokeet' : 'Workbench & Experiments'}</span>
            </button>
          </div>

          {/* Voice Narration Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isVoiceNarrating
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Read instructions and scientific explanations using natural voice"
          >
            {isVoiceNarrating ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="hidden sm:inline">{isFinnish ? 'Äänituutori' : 'Voice Tutor'}</span>
          </button>

          {/* Digital Notebook Button */}
          <button
            type="button"
            onClick={() => setShowNotebook(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
            title="Open Digital Lab Notebook"
          >
            <FileText size={15} className="text-amber-400" />
            <span className="hidden sm:inline">{isFinnish ? 'Muistikirja' : 'Lab Notebook'}</span>
            {savedNotes.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full text-[10px]">
                {savedNotes.length}
              </span>
            )}
          </button>

          {/* Tutorial Help Button */}
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            title="Lab Controls and Tutorial"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN VIEWPORT: 3D LAB or WORKBENCH SPLIT */}
      {/* ========================================================= */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 3D WEBGL EXPLORATION VIEWPORT */}
        <div 
          className={`relative flex-1 bg-black flex flex-col overflow-hidden transition-all duration-300 ${
            labMode === 'station_workbench'
              ? isMobile3DFullscreen
                ? 'h-[75vh] w-full'
                : 'h-72 sm:h-80 lg:h-auto lg:w-1/2'
              : 'h-full w-full'
          }`}
        >
          {/* 3D Canvas Mount Point */}
          <div 
            ref={mountRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          {/* Precision Scientific Sensor Telemetry Overlay */}
          {showSensorHud && (
            <div className="absolute top-3 left-3 z-20 bg-slate-900/85 border border-indigo-500/30 rounded-2xl p-2.5 shadow-xl backdrop-blur-md max-w-[280px] text-[11px] text-slate-200 select-none">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 font-bold text-indigo-400">
                <div className="flex items-center gap-1.5">
                  <Gauge size={13} />
                  <span>{isFinnish ? 'Tarkkuusanturit (3D)' : 'Precision Telemetry (3D)'}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono font-bold">
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 font-mono text-[10px]">
                <div className="flex items-center gap-1 bg-slate-800/60 px-1.5 py-0.5 rounded">
                  <Thermometer size={12} className="text-amber-400 shrink-0" />
                  <span className="text-slate-400">{isFinnish ? 'Lämpö:' : 'Temp:'}</span>
                  <span className="font-semibold text-white">
                    {(22.5 + (expParams.flameIntensity ? expParams.flameIntensity * 2.2 : 0) + (simProgress * 0.3)).toFixed(1)}°C
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-slate-800/60 px-1.5 py-0.5 rounded">
                  <Droplets size={12} className="text-cyan-400 shrink-0" />
                  <span className="text-slate-400">pH:</span>
                  <span className="font-semibold text-white">
                    {(7.00 - (expParams.acidVolume ? expParams.acidVolume * 0.08 : 0) + (expParams.baseVolume ? expParams.baseVolume * 0.09 : 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-slate-800/60 px-1.5 py-0.5 rounded">
                  <Activity size={12} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-400">{isFinnish ? 'Paine:' : 'Pres:'}</span>
                  <span className="font-semibold text-white">101.3 kPa</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-800/60 px-1.5 py-0.5 rounded">
                  <Atom size={12} className="text-violet-400 shrink-0" />
                  <span className="text-slate-400">{isFinnish ? 'Massa:' : 'Mass:'}</span>
                  <span className="font-semibold text-white">
                    {(125.40 + (expParams.powderMass || 0) + (expParams.liquidVolume ? expParams.liquidVolume * 0.99 : 0)).toFixed(1)}g
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Workbench Top Right Action Controls: Fullscreen Toggle on Mobile & Reset Orbit View */}
          {labMode === 'station_workbench' && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => {
                  if (cameraRef.current && builtLabRef.current) {
                    const currentWs = builtLabRef.current.workstations.find(w => w.id === activeStationId) || builtLabRef.current.workstations[0];
                    cameraRef.current.position.set(currentWs.lookAt.x, currentWs.lookAt.y + 0.42, currentWs.lookAt.z + 1.12);
                    if (controlsRef.current) {
                      controlsRef.current.target.set(currentWs.lookAt.x, currentWs.lookAt.y + 0.16, currentWs.lookAt.z);
                      controlsRef.current.update();
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold backdrop-blur-md shadow-md cursor-pointer transition-all"
                title="Reset 360° inspection angle"
              >
                <RotateCw size={13} />
                <span>{isFinnish ? 'Palauta 360°' : 'Reset 360° Orbit'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobile3DFullscreen(!isMobile3DFullscreen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold backdrop-blur-md shadow-md cursor-pointer transition-all"
                title={isMobile3DFullscreen ? 'Minimize 3D View' : 'Fullscreen 3D View'}
              >
                {isMobile3DFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <span>
                  {isMobile3DFullscreen
                    ? (isFinnish ? 'Pienennä' : 'Compact')
                    : (isFinnish ? 'Koko ruudun 3D' : 'Fullscreen 3D')}
                </span>
              </button>
            </div>
          )}

          {/* 360 Orbit Helper Hint */}
          {labMode === 'station_workbench' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-950/85 border border-cyan-500/30 rounded-full text-[11px] text-cyan-200/90 shadow-lg backdrop-blur-md z-20 flex items-center gap-2 pointer-events-none text-center">
              <Compass size={13} className="text-cyan-400 shrink-0 animate-pulse" />
              <span>
                {isFinnish 
                  ? '360° tarkastelu: Pyöritä vetämällä • Zoomaa rullalla/nipistämällä' 
                  : '360° Orbit Inspection: Drag to rotate • Scroll or pinch to zoom into apparatus'}
              </span>
            </div>
          )}

          {/* PPE Alert Toast / Equipping Visual Banner */}
          {ppeEquipAnimation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600/90 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md border border-indigo-400/40 animate-bounce z-20 flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>{ppeEquipAnimation}</span>
            </div>
          )}

          {/* Walkable Proximity Action HUD (When near a station) */}
          {labMode === 'free_roam' && nearbyStation && (
            <div className="absolute bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 bg-slate-900/95 border border-indigo-500/40 rounded-2xl shadow-2xl backdrop-blur-md text-center z-20 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                <Sparkles size={16} />
                <span>{nearbyStation.name}</span>
              </div>
              <p className="text-xs text-slate-300 mb-2">
                {isFinnish 
                  ? 'Lähesty työpistettä tutkiaksesi välineitä tai aloittaaksesi kokeen.'
                  : 'Approach workstation to inspect scientific equipment or start experiment.'}
              </p>
              <button
                type="button"
                onClick={() => handleEnterStation(nearbyStation.id)}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isFinnish ? 'Avaa työpiste (Paina [Väli] tai napauta)' : 'Enter Workstation (Press [Space] or Tap)'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* On-screen Dual Controls Overlay for Touch / Mobile in Free Roam */}
          {labMode === 'free_roam' && (
            <div className="md:hidden z-10 pointer-events-none absolute inset-x-0 bottom-4 px-3 flex items-end justify-between select-none">
              {/* Left Side: Movement D-Pad */}
              <div className="pointer-events-auto flex flex-col items-center gap-1 bg-slate-900/80 p-2 rounded-2xl backdrop-blur-md border border-slate-700/80 shadow-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {isFinnish ? 'Liiku' : 'Walk'}
                </span>
                <button
                  type="button"
                  onPointerDown={() => { moveState.current.forward = true; }}
                  onPointerUp={() => { moveState.current.forward = false; }}
                  className="p-3 bg-slate-800 text-white rounded-xl active:bg-indigo-600 active:scale-95 transition-all shadow-md touch-none"
                  title="Forward"
                >
                  <ArrowUp size={18} />
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onPointerDown={() => { moveState.current.left = true; }}
                    onPointerUp={() => { moveState.current.left = false; }}
                    className="p-3 bg-slate-800 text-white rounded-xl active:bg-indigo-600 active:scale-95 transition-all shadow-md touch-none"
                    title="Strafe Left"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onPointerDown={() => { moveState.current.backward = true; }}
                    onPointerUp={() => { moveState.current.backward = false; }}
                    className="p-3 bg-slate-800 text-white rounded-xl active:bg-indigo-600 active:scale-95 transition-all shadow-md touch-none"
                    title="Backward"
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    type="button"
                    onPointerDown={() => { moveState.current.right = true; }}
                    onPointerUp={() => { moveState.current.right = false; }}
                    className="p-3 bg-slate-800 text-white rounded-xl active:bg-indigo-600 active:scale-95 transition-all shadow-md touch-none"
                    title="Strafe Right"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Right Side: Turn & Camera Look HUD */}
              <div className="pointer-events-auto flex flex-col items-center gap-1 bg-slate-900/80 p-2 rounded-2xl backdrop-blur-md border border-slate-700/80 shadow-2xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {isFinnish ? 'Käänny / Katso' : 'Turn & Look'}
                </span>
                <button
                  type="button"
                  onClick={() => handleMobileTilt('up')}
                  className="p-2.5 bg-slate-800 text-white rounded-xl active:bg-indigo-600 active:scale-95 transition-all shadow-md touch-none"
                  title="Look Up"
                >
                  <ArrowUp size={16} />
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onPointerDown={() => { moveState.current.turnLeft = true; }}
                    onPointerUp={() => { moveState.current.turnLeft = false; }}
                    onClick={() => handleMobileTurn('left')}
                    className="p-2.5 bg-slate-800 text-indigo-300 rounded-xl active:bg-indigo-600 active:text-white active:scale-95 transition-all shadow-md touch-none"
                    title="Turn Left"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCenterView}
                    className="p-2.5 bg-slate-800 text-slate-400 rounded-xl active:bg-indigo-600 active:text-white active:scale-95 transition-all shadow-md touch-none"
                    title="Center View"
                  >
                    <Target size={16} />
                  </button>
                  <button
                    type="button"
                    onPointerDown={() => { moveState.current.turnRight = true; }}
                    onPointerUp={() => { moveState.current.turnRight = false; }}
                    onClick={() => handleMobileTurn('right')}
                    className="p-2.5 bg-slate-800 text-indigo-300 rounded-xl active:bg-indigo-600 active:text-white active:scale-95 transition-all shadow-md touch-none"
                    title="Turn Right"
                  >
                    <RotateCw size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleMobileTilt('down')}
                  className="p-2.5 bg-slate-800 text-white rounded-xl active:bg-indigo-600 active:scale-95 transition-all shadow-md touch-none"
                  title="Look Down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Keyboard Movement Tip Bar for Desktop */}
          {labMode === 'free_roam' && (
            <div className="hidden md:flex absolute top-4 right-4 items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-[11px] text-slate-300 backdrop-blur-sm pointer-events-none z-10">
              <span className="font-bold text-indigo-400">{isFinnish ? 'Ohjaus:' : 'Controls:'}</span>
              <span>{isFinnish ? 'W/A/S/D tai Nuolet: Liiku' : 'W/A/S/D or Arrows to Walk'}</span>
              <span>•</span>
              <span>{isFinnish ? 'Hiiren raahaus: Katso ympärille' : 'Drag Mouse to Look'}</span>
              <span>•</span>
              <span>{isFinnish ? 'Väli / F: Tutki työpistettä' : 'Space / F to Interact'}</span>
            </div>
          )}

          {/* Return to Free Roam Button when inside Workbench */}
          {labMode === 'station_workbench' && (
            <button
              type="button"
              onClick={handleExitToFreeRoam}
              className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg transition-all z-20 cursor-pointer"
            >
              <Move size={14} />
              <span>{isFinnish ? 'Palaa 3D-laboratorion vapaaseen tilaan' : 'Step Back to Roam Lab'}</span>
            </button>
          )}
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE WORKBENCH & EXPERIMENT CURRICULUM PANEL */}
        {/* ========================================================= */}
        <div 
          className={`flex-1 flex flex-col bg-slate-900 border-l border-slate-800 overflow-y-auto ${
            labMode === 'free_roam' ? 'hidden lg:flex lg:w-96' : 'w-full lg:w-1/2'
          }`}
        >
          {/* PPE PREPARATION & COMPLIANCE BAR */}
          <div className="p-4 bg-slate-850 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield size={16} className={ppeCompliance.isFullyCompliant ? 'text-emerald-400' : 'text-amber-400'} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Laboratory Safety Gear (PPE)
                </h2>
              </div>
              {!ppeCompliance.isFullyCompliant ? (
                <button
                  type="button"
                  onClick={handleEquipAllPPE}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs"
                >
                  Equip All PPE
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <Check size={13} />
                  Safe to Experiment
                </span>
              )}
            </div>

            {/* PPE Toggle Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'goggles', label: 'Safety Goggles', icon: '🥽' },
                { key: 'mask', label: 'Lab Mask', icon: '😷' },
                { key: 'gloves', label: 'Nitrile Gloves', icon: '🧤' },
                { key: 'coat', label: 'Lab Coat', icon: '🥼' }
              ].map(item => {
                const isEquipped = equippedPPE[item.key as keyof typeof equippedPPE];
                const isReq = activeExperiment.ppeRequired[item.key as keyof PPESafetyRequirements];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleTogglePPE(item.key as any)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-medium transition-all ${
                      isEquipped
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                        : isReq
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 hover:bg-amber-500/20'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[11px] font-semibold">{item.label}</span>
                    </div>
                    {isEquipped ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : isReq ? (
                      <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Off</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Missing Safety Equipment Notice */}
            {!ppeCompliance.isFullyCompliant && (
              <div className="mt-2.5 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold">Required Safety Gear Missing: </span>
                  {ppeCompliance.missingItems.join(', ')}. Put on the required gear to proceed with real simulated chemical handling.
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE EXPERIMENT OVERVIEW & FORMULA */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md uppercase tracking-wider">
                  {activeExperiment.subject} • {activeExperiment.gradeRange}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {activeExperiment.title}
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                {activeExperiment.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
              {activeExperiment.tagline}
            </p>

            {/* Scientific Formula / Law Box */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 flex items-center justify-between">
              <span className="font-bold text-slate-400">Core Equation:</span>
              <span>{activeExperiment.formula}</span>
            </div>
          </div>

          {/* STEP-BY-STEP GUIDED LAB PROCEDURE */}
          <div className="p-4 border-b border-slate-800 flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Atom size={15} className="text-indigo-400" />
                <span>Experimental Procedure (Step {currentStepIndex + 1} of {activeExperiment.steps.length})</span>
              </h4>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetExperiment}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                  title="Reset equipment and chemicals"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Current Step Card */}
            {(() => {
              const step = activeExperiment.steps[currentStepIndex];
              return (
                <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl shadow-sm mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs">
                      {step.num}
                    </span>
                    <h5 className="font-bold text-sm text-white">{step.title}</h5>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed pl-7 mb-2">
                    {step.instruction}
                  </p>
                  {step.safetyTip && (
                    <div className="ml-7 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="shrink-0 text-amber-400" />
                      <span>{step.safetyTip}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Dynamic Step Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={!ppeCompliance.isFullyCompliant}
                className={`flex-1 py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !ppeCompliance.isFullyCompliant
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : currentStepIndex === activeExperiment.steps.length - 1
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white'
                }`}
              >
                {!ppeCompliance.isFullyCompliant ? (
                  <>
                    <Lock size={14} />
                    <span>Equip PPE to Advance</span>
                  </>
                ) : currentStepIndex === activeExperiment.steps.length - 1 ? (
                  <>
                    <Award size={14} />
                    <span>Complete & Start Quiz</span>
                  </>
                ) : (
                  <>
                    <span>Execute Step & Observe</span>
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* INTERACTIVE APPARATUS REAL-TIME CONTROLS */}
            <div className="mt-4 p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-inner space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>{isFinnish ? '3D-Laitteen säätimet' : '3D Apparatus Live Controls'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeExperiment.stationName}
                </span>
              </div>

              {/* Station Specific Physical Adjusters */}
              {activeExperiment.stationId === 'chemistry_bench' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Flame size={12} className="text-amber-400" />
                      <span>{isFinnish ? 'Kaasupoltin:' : 'Bunsen Flame:'}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[
                        { label: 'Off', val: 0 },
                        { label: 'Gentle', val: 40 },
                        { label: 'Roar', val: 90 }
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setExpParams(prev => ({ ...prev, flameIntensity: item.val }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            (expParams.flameIntensity ?? 20) === item.val
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Droplets size={12} className="text-cyan-400" />
                      <span>{isFinnish ? 'Titroi liuos:' : 'Titrate:'}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setExpParams(prev => ({ ...prev, acidVolume: (prev.acidVolume || 0) + 5 }));
                          setObservationLogs(p => [{ time: '00:03', text: 'Titrated +5mL 0.1M HCl into flask. Meniscus and pH adjusted.', type: 'warn' }, ...p]);
                        }}
                        className="px-2 py-0.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/50 rounded text-[10px] font-bold"
                      >
                        +5mL Acid
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExpParams(prev => ({ ...prev, baseVolume: (prev.baseVolume || 0) + 5 }));
                          setObservationLogs(p => [{ time: '00:03', text: 'Titrated +5mL 0.1M NaOH into flask. Meniscus pinkened.', type: 'success' }, ...p]);
                        }}
                        className="px-2 py-0.5 bg-pink-950/60 hover:bg-pink-900 text-pink-300 border border-pink-700/50 rounded text-[10px] font-bold"
                      >
                        +5mL Base
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpParams(prev => ({ ...prev, stirring: !prev.stirring }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                          expParams.stirring
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {expParams.stirring ? 'Stirring ON' : 'Stir OFF'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeExperiment.stationId === 'physics_table' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Zap size={12} className="text-red-400" />
                      <span>{isFinnish ? 'Laser aallonpituus:' : 'Laser Source:'}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[
                        { label: '632nm Red', color: 0xFF0033 },
                        { label: '532nm Green', color: 0x00FF44 },
                        { label: '405nm Violet', color: 0x8A2BE2 }
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            setExpParams(prev => ({ ...prev, laserColor: item.color }));
                            setObservationLogs(p => [{ time: '00:02', text: `Switched laser source to ${item.label}. Prism dispersion caustics updated.`, type: 'info' }, ...p]);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                            expParams.laserColor === item.color
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {item.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeExperiment.stationId === 'biology_desk' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Eye size={12} className="text-emerald-400" />
                      <span>{isFinnish ? 'Objektiivilinssi:' : 'Objective Turret:'}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {['4x', '10x', '40x', '100x'].map(mag => (
                        <button
                          key={mag}
                          type="button"
                          onClick={() => {
                            setExpParams(prev => ({ ...prev, objectiveMagnification: mag }));
                            setObservationLogs(p => [{ time: '00:02', text: `Rotated objective turret to ${mag} magnification. Specimen focal plane adjusted.`, type: 'info' }, ...p]);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                            (expParams.objectiveMagnification || '10x') === mag
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {mag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeExperiment.stationId === 'general_bench' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Gauge size={12} className="text-cyan-400" />
                      <span>{isFinnish ? 'Tarkkuusvaaka:' : 'Analytical Balance:'}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[10, 25, 50].map(grams => (
                        <button
                          key={grams}
                          type="button"
                          onClick={() => {
                            setExpParams(prev => ({ ...prev, powderMass: (prev.powderMass || 0) + grams }));
                            setObservationLogs(p => [{ time: '00:02', text: `Placed calibrated brass weight (+${grams}.00g) on pan. Draft shield closed.`, type: 'info' }, ...p]);
                          }}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[10px] font-bold"
                        >
                          +{grams}g
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setExpParams(prev => ({ ...prev, powderMass: 0, liquidVolume: 0 }));
                          setObservationLogs(p => [{ time: '00:01', text: 'Tared analytical balance back to 0.000g baseline.', type: 'warn' }, ...p]);
                        }}
                        className="px-2 py-0.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-700/50 rounded text-[10px] font-bold"
                      >
                        Tare
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OBSERVATION LOGS / REAL-TIME LAB SENSOR READOUT */}
          <div className="p-4 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Activity size={14} className="text-cyan-400" />
              <span>Real-Time Sensor & Analytical Observations</span>
            </h4>
            <div className="h-32 bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {observationLogs.length === 0 ? (
                <div className="text-slate-500 italic">No observations logged yet. Execute steps to collect data.</div>
              ) : (
                observationLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-2 ${
                      log.type === 'success' 
                        ? 'text-emerald-300' 
                        : log.type === 'warn' 
                        ? 'text-amber-300' 
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500">[{log.time}]</span>
                    <span>{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EXPERIMENT SELECTOR & CATALOG DRAWER */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-400" />
                <span>Science Experiments Catalog</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {filteredExperiments.length} experiments available
              </span>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
              {(['all', 'chemistry', 'physics', 'biology', 'general'] as const).map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition-all ${
                    selectedSubject === sub
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Experiment Cards List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredExperiments.map(exp => {
                const isSelected = exp.id === activeExperiment.id;
                const isDone = completedExps.includes(exp.id);
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => handleSelectExperiment(exp)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/50 shadow-xs'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${
                        exp.subject === 'chemistry' ? 'bg-cyan-500/20 text-cyan-300' :
                        exp.subject === 'physics' ? 'bg-amber-500/20 text-amber-300' :
                        exp.subject === 'biology' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        <FlaskConical size={14} />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white line-clamp-1">{exp.title}</div>
                        <div className="text-[10px] text-slate-400">{exp.stationName} • {exp.difficulty}</div>
                      </div>
                    </div>
                    {isDone && (
                      <span className="p-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POST-EXPERIMENT CONCEPT QUIZ MODAL */}
      {/* ========================================================= */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Post-Lab Concept Quiz</h3>
                  <p className="text-xs text-slate-400">{activeExperiment.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuiz(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {!quizFinished ? (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Question {currentQuizQuestion + 1} of {activeExperiment.quiz.length}</span>
                  <span className="font-mono text-indigo-400">+25 Academic XP</span>
                </div>

                <p className="font-semibold text-sm text-slate-100 mb-4 leading-snug">
                  {activeExperiment.quiz[currentQuizQuestion].question}
                </p>

                <div className="space-y-2 mb-6">
                  {activeExperiment.quiz[currentQuizQuestion].options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnswerQuiz(idx)}
                      className="w-full p-3 text-left bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition-all cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award size={32} />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Experiment Mastered!</h4>
                <p className="text-sm text-slate-300 mb-4">
                  You scored <span className="font-bold text-emerald-400">{quizScore} / {activeExperiment.quiz.length}</span> on the scientific principles quiz.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300 border border-slate-800 mb-6 text-left">
                  <span className="font-bold text-indigo-400">Scientific Takeaway: </span>
                  {activeExperiment.scientificPrinciples}
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuiz(false)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Return to Laboratory
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DIGITAL LAB NOTEBOOK DRAWER MODAL */}
      {/* ========================================================= */}
      {showNotebook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-amber-400" />
                <h3 className="font-bold text-white text-base">Student Laboratory Notebook</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotebook(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Note entry form */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Record Observations for: {activeExperiment.title}
              </label>
              <textarea
                value={studentNotes}
                onChange={e => setStudentNotes(e.target.value)}
                placeholder="Write your hypothesis, color changes observed, measurement data, or conclusions..."
                className="w-full h-24 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="button"
                onClick={handleSaveNotebook}
                className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Save size={14} />
                <span>Save to Digital Notebook</span>
              </button>
            </div>

            {/* Saved notebook entries */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 border-t border-slate-800 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Saved Lab Records ({savedNotes.length})
              </h4>
              {savedNotes.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No notes recorded yet.</p>
              ) : (
                savedNotes.map(n => (
                  <div key={n.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{n.experimentTitle}</span>
                      <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-300">{n.notes}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FIRST-TIME USER TUTORIAL MODAL */}
      {/* ========================================================= */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FlaskConical size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Welcome to the 3D Science Lab
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Explore a photorealistic, walkable science lab. Walk around, gear up with PPE, handle beakers, microscopes, and conduct real curriculum experiments.
            </p>

            <div className="text-left bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-400">1. Walk & Look:</span>
                <span>Use W/A/S/D or Arrow keys (or touch on-screen buttons on phone) to explore the room.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-400">2. Safety First (PPE):</span>
                <span>Put on safety goggles, mask, gloves, and lab coat before handling corrosive reagents.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-400">3. Workstations:</span>
                <span>Walk up to the Chemistry, Physics, Biology, or Fume Hood benches and press [Space] or tap to enter workbench mode.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowTutorial(false);
                try {
                  localStorage.setItem('neonova_3d_lab_tutorial_seen', 'true');
                } catch {}
              }}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Enter Laboratory Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
