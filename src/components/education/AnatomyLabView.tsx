import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Heart, 
  Brain, 
  Eye, 
  Activity, 
  Layers, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Play, 
  Pause, 
  Search, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  HelpCircle, 
  Sun, 
  Moon, 
  Scissors, 
  Sliders, 
  Check, 
  AlertCircle,
  Dna,
  X,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Box,
  Camera
} from 'lucide-react';
import { 
  AnatomicalModelDefinition, 
  AnatomicalSystem, 
  AnatomicalPlane, 
  GradeLevelMode, 
  MedicalViewerTheme 
} from '../../lib/anatomyEngine/types';
import { ANATOMICAL_MODELS_CATALOG } from '../../lib/anatomyEngine/anatomyModelsCatalog';
import { buildAnatomicalAssembly, BuiltAnatomyResult } from '../../lib/anatomyEngine/anatomyAssemblyBuilder';
import { validateAnatomicalPrompt } from '../../lib/anatomyEngine/anatomyValidation';
import ARViewMode from './ARViewMode';

export interface AnatomyLabViewProps {
  onSwitchToEngineering?: () => void;
  onOpenAR?: () => void;
}

export default function AnatomyLabView({ onSwitchToEngineering, onOpenAR }: AnatomyLabViewProps = {}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [internalAROpen, setInternalAROpen] = useState(false);

  // Model & Filter state
  const [activeModelId, setActiveModelId] = useState<string>('heart');
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>('left_ventricle');
  const [isolatedStructureId, setIsolatedStructureId] = useState<string | null>(null);
  const [activeSystemFilter, setActiveSystemFilter] = useState<AnatomicalSystem | 'all'>('all');
  const [gradeLevel, setGradeLevel] = useState<GradeLevelMode>('middle_school');
  const [theme, setTheme] = useState<MedicalViewerTheme>('clinical_light');
  
  // Interactive Controls state
  const [showLabels, setShowLabels] = useState(true);
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [crossSectionSlice, setCrossSectionSlice] = useState(0.0);
  const [crossSectionAxis, setCrossSectionAxis] = useState<'x' | 'y' | 'z'>('z');
  const [explodedAmount, setExplodedAmount] = useState(0.0);
  const [anatomicalPlane, setAnatomicalPlane] = useState<AnatomicalPlane>('anterior');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(true);
  const [simRateBpm, setSimRateBpm] = useState(72);

  // Search & Validation state
  const [searchQuery, setSearchQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Quiz state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // 2D Projected Label Pins
  const [projectedLabels, setProjectedLabels] = useState<{ id: string; name: string; x: number; y: number; visible: boolean }[]>([]);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const builtAssemblyRef = useRef<BuiltAnatomyResult | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const activeModel = useMemo(() => {
    return ANATOMICAL_MODELS_CATALOG[activeModelId] || ANATOMICAL_MODELS_CATALOG.heart;
  }, [activeModelId]);

  // Update simRate when model changes
  useEffect(() => {
    if (activeModel.simulationConfig.defaultRateBpm > 0) {
      setSimRateBpm(activeModel.simulationConfig.defaultRateBpm);
    }
  }, [activeModel]);

  // Handle Search & Educational Guardrails (Sections 2 & 12)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Validate prompt against medical/anatomy education guardrails
    const check = validateAnatomicalPrompt(query);
    if (!check.isAllowed) {
      setValidationError(check.reason || 'Please request human biological or anatomical structures.');
      return;
    }
    setValidationError(null);

    // Match closest verified anatomy model
    if (query.includes('heart') || query.includes('cardio') || query.includes('valve') || query.includes('aorta')) {
      setActiveModelId('heart');
      setSelectedStructureId('left_ventricle');
    } else if (query.includes('brain') || query.includes('cerebr') || query.includes('lobe') || query.includes('head')) {
      setActiveModelId('brain');
      setSelectedStructureId('frontal_lobe');
    } else if (query.includes('lung') || query.includes('breath') || query.includes('trachea') || query.includes('respir')) {
      setActiveModelId('lungs');
      setSelectedStructureId('trachea_airway');
    } else if (query.includes('eye') || query.includes('vision') || query.includes('retina') || query.includes('cornea')) {
      setActiveModelId('eye');
      setSelectedStructureId('cornea_lens_optics');
    } else if (query.includes('kidney') || query.includes('renal') || query.includes('urine') || query.includes('nephron')) {
      setActiveModelId('kidney');
      setSelectedStructureId('renal_cortex_medulla');
    } else if (query.includes('neuron') || query.includes('nerve') || query.includes('axon') || query.includes('synapse')) {
      setActiveModelId('neuron');
      setSelectedStructureId('neuron_cell_body');
    } else if (query.includes('dna') || query.includes('gene') || query.includes('helix') || query.includes('base')) {
      setActiveModelId('dna');
      setSelectedStructureId('sugar_phosphate_backbone');
    } else {
      setValidationError(`"${searchQuery}" is not currently in the core clinical atlas. Explore our verified systems: Heart, Brain, Lungs, Eye, Kidney, Neuron, or DNA.`);
    }
  };

  // Rebuild 3D Medical Assembly
  const rebuildModel = useCallback(() => {
    if (!sceneRef.current) return;

    if (modelGroupRef.current) {
      sceneRef.current.remove(modelGroupRef.current);
    }

    const built = buildAnatomicalAssembly(activeModel, {
      selectedStructureId,
      isolatedStructureId,
      isXRayMode,
      activeSystemFilter,
      crossSectionSlice,
      crossSectionAxis,
      theme
    });

    builtAssemblyRef.current = built;
    modelGroupRef.current = built.rootGroup;
    sceneRef.current.add(built.rootGroup);

    // Apply exploded positions
    if (explodedAmount > 0) {
      built.structuresMap.forEach((obj, id) => {
        const init = built.initialPositions.get(id);
        const vec = built.explodedVectors.get(id);
        if (init && vec) {
          obj.position.copy(init).addScaledVector(vec, explodedAmount * 1.4);
        }
      });
    }
  }, [activeModel, selectedStructureId, isolatedStructureId, isXRayMode, activeSystemFilter, crossSectionSlice, crossSectionAxis, theme, explodedAmount]);

  // Set Standard Anatomical View Planes
  const setAnatomicalViewPreset = (plane: AnatomicalPlane) => {
    setAnatomicalPlane(plane);
    if (!cameraRef.current || !controlsRef.current) return;

    const dist = activeModel.defaultCameraPos[2] || 5.5;
    const target = new THREE.Vector3(0, 0.2, 0);
    controlsRef.current.target.copy(target);

    switch (plane) {
      case 'anterior':
        cameraRef.current.position.set(0, 0.2, dist);
        break;
      case 'posterior':
        cameraRef.current.position.set(0, 0.2, -dist);
        break;
      case 'lateral_left':
        cameraRef.current.position.set(-dist, 0.2, 0);
        break;
      case 'lateral_right':
        cameraRef.current.position.set(dist, 0.2, 0);
        break;
      case 'superior':
        cameraRef.current.position.set(0.01, dist, 0);
        break;
      case 'inferior':
        cameraRef.current.position.set(0.01, -dist, 0);
        break;
      case 'isometric':
      default:
        cameraRef.current.position.set(dist * 0.7, dist * 0.45, dist * 0.75);
        break;
    }
    cameraRef.current.lookAt(target);
    controlsRef.current.update();
  };

  // Three.js Mount Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'clinical_light' ? 0xf8fafc : 0x090d16);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const initCam = activeModel.defaultCameraPos || [0, 1.2, 5.8];
    camera.position.set(...initCam);
    cameraRef.current = camera;

    // 3. Renderer with local clipping enabled for anatomical cross-sections
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = theme === 'clinical_light' ? 1.05 : 1.2;
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 20;
    controls.minDistance = 1.0;
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    // 5. Professional Medical Lighting (Soft shadowless studio lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'clinical_light' ? 1.4 : 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, theme === 'clinical_light' ? 1.2 : 1.6);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
    rimLight.position.set(0, -6, 5);
    scene.add(rimLight);

    // Initial Model Build
    rebuildModel();

    // 6. Raycaster Structure Selection
    const handlePointerDown = (evt: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      if (modelGroupRef.current) {
        const intersects = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);
        if (intersects.length > 0) {
          let cur: THREE.Object3D | null = intersects[0].object;
          while (cur && cur !== modelGroupRef.current) {
            if (cur.userData?.structureId) {
              setSelectedStructureId(cur.userData.structureId);
              break;
            }
            cur = cur.parent;
          }
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 7. Render Loop with Physiological Biological Simulations (Section 8)
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Real Physiological Simulations
      if (isSimulating && builtAssemblyRef.current && activeModel.simulationConfig.type !== 'none') {
        const freqHz = simRateBpm / 60; // e.g. 72 BPM = 1.2 Hz
        const phase = (now * 0.001 * freqHz * Math.PI * 2) % (Math.PI * 2);

        builtAssemblyRef.current.simulationParts.forEach(({ object, role, initialScale, initialPos }) => {
          if (role === 'ventricular_systole') {
            // Asymmetric cardiac cycle: rapid ventricular systole (~0.3s) and longer diastole (~0.5s)
            const isSystole = Math.sin(phase) > 0.15;
            const contraction = isSystole ? 0.91 + Math.sin(phase) * 0.09 : 1.0;
            object.scale.set(
              initialScale.x * contraction,
              initialScale.y * (1.0 + (1 - contraction) * 0.4),
              initialScale.z * contraction
            );
          } else if (role === 'atrial_systole') {
            // Atria contract slightly out of phase with ventricles
            const atrialPhase = phase + Math.PI * 0.8;
            const contraction = Math.sin(atrialPhase) > 0.2 ? 0.94 : 1.0;
            object.scale.set(
              initialScale.x * contraction,
              initialScale.y * contraction,
              initialScale.z * contraction
            );
          } else if (role === 'lung_inhalation') {
            // Breathing expansion & recoil
            const breath = 1.0 + Math.sin(phase) * 0.08;
            object.scale.set(initialScale.x * breath, initialScale.y * breath, initialScale.z * breath);
          } else if (role === 'action_potential') {
            // Wave pulse along axon
            const waveY = Math.sin(phase) * 0.8;
            object.position.y = initialPos.y + waveY * 0.05;
          }
        });
      }

      controls.update();

      // Project 3D Landmark Label pins to 2D screen positions (Section 5)
      if (builtAssemblyRef.current && showLabels) {
        const labels: { id: string; name: string; x: number; y: number; visible: boolean }[] = [];
        builtAssemblyRef.current.labelAnchors.forEach((worldPos, id) => {
          const struct = activeModel.structures.find(s => s.id === id);
          if (!struct) return;

          // Clone and project
          const p = worldPos.clone();
          // Add exploded offset if exploded
          if (explodedAmount > 0) {
            const vec = builtAssemblyRef.current?.explodedVectors.get(id);
            if (vec) p.addScaledVector(vec, explodedAmount * 1.4);
          }
          p.project(camera);

          // Check if landmark is in front of camera
          const isBehind = p.z > 1.0;
          const screenX = ((p.x + 1) * width) / 2;
          const screenY = ((-p.y + 1) * height) / 2;

          labels.push({
            id,
            name: struct.name,
            x: screenX,
            y: screenY,
            visible: !isBehind && screenX >= 10 && screenX <= width - 10 && screenY >= 10 && screenY <= height - 10
          });
        });
        setProjectedLabels(labels);
      } else {
        setProjectedLabels([]);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const ro = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, [activeModel, rebuildModel, theme, isSimulating, simRateBpm, explodedAmount, showLabels]);

  // Selected Structure details
  const selectedStructure = useMemo(() => {
    return activeModel.structures.find(s => s.id === selectedStructureId) || activeModel.structures[0];
  }, [activeModel, selectedStructureId]);

  // Active Grade Explanation
  const gradeExplanation = useMemo(() => {
    if (!selectedStructure) return null;
    if (gradeLevel === 'elementary') return selectedStructure.gradeContent.elementary;
    if (gradeLevel === 'middle_school') return selectedStructure.gradeContent.middleSchool;
    return selectedStructure.gradeContent.highSchoolPreMed;
  }, [selectedStructure, gradeLevel]);

  // Snapshot PNG export
  const handleExportSnapshot = () => {
    if (!rendererRef.current) return;
    const url = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeoNova_${activeModel.id}_Anatomy.png`;
    a.click();
  };

  return (
    <div className={`space-y-4 font-sans ${theme === 'clinical_light' ? 'text-slate-800' : 'text-slate-100'} ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto' : ''}`}>
      
      {/* 1. TOP MEDICAL APP BAR & ORGAN SYSTEM SELECTOR */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm transition-colors ${
        theme === 'clinical_light' 
          ? 'bg-white border-slate-200' 
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 shadow-2xs">
              <Stethoscope size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight">
                  NeoNova 3D Scientific Anatomy Atlas
                </h1>
                <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 uppercase">
                  Verified Human Biology
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  <span>Gray&apos;s Anatomy Standard</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scientifically accurate organ models, cross-sectional slicing, real cardiac cycles, and grade-adaptive medical explanations.
              </p>
            </div>
          </div>

          {/* Search & Guardrail Form (Sections 2 & 12) */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search human organ (Heart, Brain, Lungs, Eye, Kidney, Neuron)..."
                className={`w-full pl-9 pr-3 py-2 rounded-2xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                  theme === 'clinical_light'
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Inspect
            </button>
            {onSwitchToEngineering && (
              <button
                type="button"
                onClick={onSwitchToEngineering}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                title="Switch to 3D Engineering & Machine Studio"
              >
                <Box size={14} className="text-indigo-500" />
                <span className="hidden sm:inline">Engineering 3D</span>
              </button>
            )}
          </form>
        </div>

        {validationError && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Verified Anatomical Organ Atlas Quick Tabs */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1">
            Anatomical Atlas:
          </span>
          {[
            { id: 'heart', label: 'Human Heart (4 Chambers & Valves)', icon: Heart },
            { id: 'brain', label: 'Human Brain (Cortical Lobes & Cerebellum)', icon: Brain },
            { id: 'lungs', label: 'Respiratory System (Trachea & Lungs)', icon: Activity },
            { id: 'eye', label: 'Human Eye (Cornea, Lens & Retina)', icon: Eye },
            { id: 'kidney', label: 'Kidney (Cortex & Nephron Pyramids)', icon: Activity },
            { id: 'neuron', label: 'Multipolar Neuron (Axon & Myelin)', icon: Activity },
            { id: 'dna', label: 'DNA Double Helix (Base Pairs)', icon: Dna }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeModelId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveModelId(item.id);
                  setIsolatedStructureId(null);
                  setCrossSectionSlice(0);
                  setExplodedAmount(0);
                  setQuizIndex(0);
                  setQuizScore(0);
                  setQuizFeedback(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                    : theme === 'clinical_light'
                    ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN 3D WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* 3D MEDICAL VIEWPORT (8 cols) */}
        <div className={`lg:col-span-8 rounded-3xl border overflow-hidden shadow-xl relative flex flex-col min-h-[540px] lg:min-h-[660px] ${
          theme === 'clinical_light'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-slate-950 border-slate-800'
        }`}>
          
          {/* Top Viewport Clinical Bar: Theme, X-Ray, Labels, Snapshot */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
            
            {/* Left: System Layers Filter & X-Ray Mode */}
            <div className={`flex items-center gap-1.5 pointer-events-auto p-1 rounded-2xl border text-xs shadow-md backdrop-blur-md ${
              theme === 'clinical_light'
                ? 'bg-white/90 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setShowLabels(!showLabels)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  showLabels 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Toggle anatomical landmark leader-line labels"
              >
                <span>Labels: {showLabels ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsXRayMode(!isXRayMode)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isXRayMode 
                    ? 'bg-sky-600 text-white' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="X-Ray Educational Transparency View"
              >
                <span>X-Ray: {isXRayMode ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Right: Theme, Reset, Snapshot, Fullscreen */}
            <div className={`flex items-center gap-1 pointer-events-auto p-1 rounded-2xl border text-xs shadow-md backdrop-blur-md ${
              theme === 'clinical_light'
                ? 'bg-white/90 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => setTheme(theme === 'clinical_light' ? 'surgical_dark' : 'clinical_light')}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Switch to ${theme === 'clinical_light' ? 'Surgical Dark Mode' : 'Clinical Light Mode'}`}
              >
                {theme === 'clinical_light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              {/* AR View Mode Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenAR) onOpenAR();
                  else setInternalAROpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Project Human Anatomy into Real World using Phone Camera (AR)"
              >
                <Camera size={13} className="text-cyan-200 animate-pulse" />
                <span>AR Mode</span>
              </button>

              <button
                type="button"
                onClick={handleExportSnapshot}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Download High-Resolution Anatomy Diagram PNG"
              >
                <Download size={14} />
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* AR View Mode Modal */}
          {internalAROpen && (
            <ARViewMode
              initialModelType="anatomy"
              initialAnatomyModelId={activeModelId}
              onClose={() => setInternalAROpen(false)}
              onSwitchToStudio={() => setInternalAROpen(false)}
            />
          )}

          {/* Three.js Canvas Container */}
          <div ref={mountRef} className="w-full flex-1 min-h-[460px] cursor-grab active:cursor-grabbing relative" />

          {/* 3D Projected Landmark Label Pins (Section 5) */}
          {showLabels && projectedLabels.map((lbl) => {
            if (!lbl.visible) return null;
            const isSelected = selectedStructureId === lbl.id;
            return (
              <div
                key={lbl.id}
                style={{
                  position: 'absolute',
                  left: `${lbl.x}px`,
                  top: `${lbl.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
                onClick={() => setSelectedStructureId(lbl.id)}
                className={`pointer-events-auto cursor-pointer transition-transform duration-150 z-20 select-none group ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md border flex items-center gap-1 backdrop-blur-md ${
                  isSelected 
                    ? 'bg-sky-600 text-white border-sky-400' 
                    : theme === 'clinical_light'
                    ? 'bg-white/95 text-slate-800 border-slate-300'
                    : 'bg-slate-900/95 text-slate-100 border-slate-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span className="truncate max-w-[140px]">{lbl.name}</span>
                </div>
                {/* Pointer tip pin */}
                <div className={`w-0 h-0 border-x-4 border-x-transparent border-t-4 mx-auto ${
                  isSelected ? 'border-t-sky-600' : theme === 'clinical_light' ? 'border-t-white' : 'border-t-slate-900'
                }`} />
              </div>
            );
          })}

          {/* Bottom Viewport Control Drawer: Anatomical Planes, Cross-Section Slicing, Simulation */}
          <div className={`p-3 sm:p-4 border-t flex flex-col gap-3 shrink-0 backdrop-blur-md ${
            theme === 'clinical_light'
              ? 'bg-white/95 border-slate-200'
              : 'bg-slate-900/95 border-slate-800 text-white'
          }`}>
            
            {/* Row 1: Standard Anatomical Planes (Anterior, Posterior, Lateral, Superior, Inferior) */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-thin">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">
                  Anatomical Plane:
                </span>
                {[
                  { plane: 'anterior', label: 'Anterior (Front)' },
                  { plane: 'posterior', label: 'Posterior (Back)' },
                  { plane: 'lateral_left', label: 'Lateral (Left)' },
                  { plane: 'lateral_right', label: 'Lateral (Right)' },
                  { plane: 'superior', label: 'Superior (Top)' },
                  { plane: 'inferior', label: 'Inferior (Bottom)' },
                  { plane: 'isometric', label: 'Isometric 3/4' }
                ].map((item) => (
                  <button
                    key={item.plane}
                    type="button"
                    onClick={() => setAnatomicalViewPreset(item.plane as AnatomicalPlane)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      anatomicalPlane === item.plane
                        ? 'bg-sky-600 text-white'
                        : theme === 'clinical_light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAnatomicalViewPreset('anterior')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw size={12} />
                <span>Reset View</span>
              </button>
            </div>

            {/* Row 2: Real-Time Cross-Section Slicing Slider (Section 4) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
                <span className="text-[11px] font-bold uppercase tracking-tight shrink-0 flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                  <Scissors size={13} />
                  <span>Cross-Section Slicing:</span>
                </span>
                
                <select
                  value={crossSectionAxis}
                  onChange={(e) => setCrossSectionAxis(e.target.value as 'x' | 'y' | 'z')}
                  className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-0.5 cursor-pointer"
                  title="Select Cross-Section Slicing Plane"
                >
                  <option value="z">Coronal (Frontal)</option>
                  <option value="x">Sagittal (Median)</option>
                  <option value="y">Transverse (Axial)</option>
                </select>

                <input
                  type="range"
                  min="0"
                  max="0.85"
                  step="0.01"
                  value={crossSectionSlice}
                  onChange={(e) => setCrossSectionSlice(parseFloat(e.target.value))}
                  className="w-full accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono font-bold w-9 text-right text-sky-600 dark:text-sky-400">
                  {Math.round(crossSectionSlice * 100)}%
                </span>
              </div>

              {/* Exploded Anatomical View Slider */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
                  Exploded:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-24 sm:w-32 accent-sky-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* Biological Simulation Controls (Section 8) */}
              {activeModel.simulationConfig.type !== 'none' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                      isSimulating 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isSimulating ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isSimulating ? 'Simulating' : 'Paused'}</span>
                  </button>

                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                    <span>{simRateBpm} {activeModel.simulationConfig.rateUnit}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* EDUCATIONAL INSPECTOR & GRADE-ADAPTIVE CURRICULUM (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Grade Level Selector (Section 9) */}
          <div className={`p-3 rounded-2xl border flex flex-col gap-2 shadow-xs ${
            theme === 'clinical_light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Grade-Adaptive Explanation Level:
            </span>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {[
                { level: 'elementary', label: '🧒 Elementary', sub: 'Grades 1–5' },
                { level: 'middle_school', label: '🧑‍🎓 Middle School', sub: 'Grades 6–8' },
                { level: 'high_school_premed', label: '👨‍⚕️ Pre-Med / HS', sub: 'Grades 9–12+' }
              ].map((g) => (
                <button
                  key={g.level}
                  type="button"
                  onClick={() => setGradeLevel(g.level as GradeLevelMode)}
                  className={`py-1.5 px-2 rounded-xl text-center font-bold transition-all cursor-pointer border ${
                    gradeLevel === g.level
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                      : theme === 'clinical_light'
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <div className="text-[11px]">{g.label}</div>
                  <div className="text-[9px] opacity-75 font-mono">{g.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STRUCTURE INSPECTOR CARD (Section 4 & 9) */}
          {selectedStructure && gradeExplanation && (
            <div className={`p-5 rounded-3xl border shadow-sm space-y-3.5 animate-in fade-in ${
              theme === 'clinical_light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              {/* Header: Canonical and Latin Name */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">
                  <span>System: {selectedStructure.system}</span>
                  {selectedStructure.isInternal && (
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded">
                      Internal Cavity
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                  {selectedStructure.name}
                </h3>
                {selectedStructure.latinName && (
                  <p className="text-xs text-slate-400 italic">
                    {selectedStructure.latinName}
                  </p>
                )}
              </div>

              {/* Function & Role */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Physiological Function:
                </span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                  {gradeExplanation.functionDesc}
                </p>
              </div>

              {/* Summary / Educational Explanation */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Educational Description:
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {gradeExplanation.summary}
                </p>
              </div>

              {/* Clinical or Memory Note */}
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-xs">
                <span className="text-[10px] font-extrabold text-sky-800 dark:text-sky-300 uppercase tracking-wider block mb-0.5">
                  Clinical & Scientific Correlation:
                </span>
                <p className="text-sky-900 dark:text-sky-200 text-[11px] leading-relaxed">
                  {gradeExplanation.clinicalOrEducationalNote}
                </p>
              </div>

              {/* Key Terminology Pills */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Syllabus Key Terms:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {gradeExplanation.keyTerminology.map((term: string, idx: number) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Isolate / Focus */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsolatedStructureId(isolatedStructureId === selectedStructure.id ? null : selectedStructure.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    isolatedStructureId === selectedStructure.id
                      ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isolatedStructureId === selectedStructure.id ? 'Show Full Organ' : 'Isolate Structure'}
                </button>
              </div>
            </div>
          )}

          {/* INTERACTIVE CLINICAL QUIZ MODE */}
          <div className={`p-4 sm:p-5 rounded-3xl border shadow-xs space-y-3 ${
            theme === 'clinical_light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={14} className="text-sky-600 dark:text-sky-400" />
                <span>Anatomical Knowledge Check</span>
              </span>
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                Score: {quizScore} / {activeModel.quizQuestions.length}
              </span>
            </div>

            {activeModel.quizQuestions.length > 0 && quizIndex < activeModel.quizQuestions.length ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 uppercase font-bold">
                    Question {quizIndex + 1} of {activeModel.quizQuestions.length}:
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                    {activeModel.quizQuestions[quizIndex].question}
                  </p>
                </div>

                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Identify Structure in 3D:
                </span>

                <div className="space-y-1.5">
                  {activeModel.structures.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const target = activeModel.quizQuestions[quizIndex].targetStructureId;
                        if (s.id === target) {
                          setQuizScore(prev => prev + 1);
                          setQuizFeedback(`Correct! ${activeModel.quizQuestions[quizIndex].explanation}`);
                        } else {
                          setQuizFeedback(`Incorrect. The correct answer is ${target}. ${activeModel.quizQuestions[quizIndex].explanation}`);
                        }
                        setSelectedStructureId(target);
                        setTimeout(() => {
                          if (quizIndex + 1 < activeModel.quizQuestions.length) {
                            setQuizIndex(prev => prev + 1);
                            setQuizFeedback(null);
                          }
                        }, 3400);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-900 dark:text-sky-200 animate-in fade-in">
                    {quizFeedback}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 space-y-2">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quiz Complete!</h4>
                <p className="text-xs text-slate-500">
                  Great job demonstrating anatomical landmark knowledge. Score: {quizScore} / {activeModel.quizQuestions.length}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuizIndex(0);
                    setQuizScore(0);
                    setQuizFeedback(null);
                  }}
                  className="px-3.5 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Restart Quiz
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
