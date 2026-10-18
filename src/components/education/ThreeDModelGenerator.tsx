import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  Search, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Eye, 
  Camera, 
  CheckCircle2, 
  HelpCircle, 
  FolderOpen,
  Download,
  Sliders,
  Sun,
  Activity,
  Box,
  Compass,
  AlertCircle,
  Trash2,
  BookmarkCheck,
  Check,
  RefreshCw,
  X,
  Heart
} from 'lucide-react';
import { 
  EducationalStructuralPlan, 
  ModelQualityLevel, 
  LightingPreset, 
  CameraViewAngle, 
  GenerationProgressEvent,
  ModelComponentDefinition
} from '../../lib/threeDStudio/types';
import { generate3DModelPlan } from '../../lib/threeDStudio/threeDModelService';
import { buildThreeDAssembly, BuiltModelResult } from '../../lib/threeDStudio/threeModelBuilder';
import { STRUCTURAL_CATALOG } from '../../lib/threeDStudio/offlineStructuralCatalog';
import { offlineDb } from '../../lib/offlineDatabase';
import AnatomyLabView from './AnatomyLabView';
import ARViewMode from './ARViewMode';

export interface ThreeDModelGeneratorProps {
  initialStudioMode?: 'anatomy' | 'engineering';
  initialAROpen?: boolean;
}

export default function ThreeDModelGenerator({ initialStudioMode = 'anatomy', initialAROpen = false }: ThreeDModelGeneratorProps = {}) {
  const [studioMode, setStudioMode] = useState<'anatomy' | 'engineering'>(initialStudioMode);
  const [isAROpen, setIsAROpen] = useState(initialAROpen);
  const mountRef = useRef<HTMLDivElement | null>(null);
  
  // Model state
  const [activePlan, setActivePlan] = useState<EducationalStructuralPlan>(() => STRUCTURAL_CATALOG.helicopter);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgressEvent | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Viewport & Studio state
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'explore' | 'learn' | 'quiz'>('explore');
  const [qualityLevel, setQualityLevel] = useState<ModelQualityLevel>('high');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  const [cameraView, setCameraView] = useState<CameraViewAngle>('perspective');
  const [explodedAmount, setExplodedAmount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedModelsList, setSavedModelsList] = useState<any[]>([]);
  const [isSavedLocally, setIsSavedLocally] = useState(false);

  // Educational Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const builtModelRef = useRef<BuiltModelResult | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Load saved models from IndexedDB on startup
  const refreshSavedModels = useCallback(async () => {
    try {
      const list = await offlineDb.getAllCached3DModels();
      setSavedModelsList(list);
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    refreshSavedModels();
  }, [refreshSavedModels]);

  // Check if active model is saved locally
  useEffect(() => {
    if (activePlan) {
      offlineDb.getCached3DModel(activePlan.id).then((saved) => {
        setIsSavedLocally(!!saved);
      }).catch(() => setIsSavedLocally(false));
    }
  }, [activePlan]);

  // Generate Model from user prompt
  const handleGenerateModel = useCallback(async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);
    setSelectedPartId(null);
    setExplodedAmount(0);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFeedback(null);

    try {
      const plan = await generate3DModelPlan(promptText.trim(), (evt) => {
        setGenerationProgress(evt);
      });
      setActivePlan(plan);
      setIsGenerating(false);
      setGenerationProgress(null);
      refreshSavedModels();
    } catch (err: any) {
      console.warn('Generation failed:', err);
      setGenerationError(`Generation failed: ${err?.message || 'Could not synthesize structural components'}. Please retry.`);
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  }, [refreshSavedModels]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleGenerateModel(searchQuery);
  };

  // Rebuild 3D Three.js assembly when activePlan or qualityLevel changes
  const rebuildAssembly = useCallback(() => {
    if (!sceneRef.current) return;

    // Remove existing model group
    if (modelGroupRef.current) {
      sceneRef.current.remove(modelGroupRef.current);
    }

    // Build new assembly using Three.js builder
    const result = buildThreeDAssembly(activePlan, qualityLevel);
    builtModelRef.current = result;
    modelGroupRef.current = result.rootGroup;
    sceneRef.current.add(result.rootGroup);

    // Position camera dynamically based on model dimensions
    if (cameraRef.current && controlsRef.current) {
      const box = new THREE.Box3().setFromObject(result.rootGroup);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z, 2.5);
      
      cameraRef.current.position.set(maxDim * 0.9, maxDim * 0.6, maxDim * 1.3);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [activePlan, qualityLevel]);

  // Three.js Mount Setup (Renderer, Camera, Controls, Lights, Animation Loop)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(4, 2.5, 6);
    cameraRef.current = camera;

    // 3. Renderer with ACES Filmic tonemapping
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 0.8;
    controlsRef.current = controls;

    // 5. Studio Lights Group
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Soft Shadow Contact Ground Plane
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.6;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. Raycaster Selection on Click
    const handlePointerDown = (evt: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      if (modelGroupRef.current) {
        const intersects = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);
        if (intersects.length > 0) {
          // Trace up to find partId in userData
          let target: THREE.Object3D | null = intersects[0].object;
          while (target && target !== modelGroupRef.current) {
            if (target.userData?.partId) {
              setSelectedPartId(target.userData.partId);
              break;
            }
            target = target.parent;
          }
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Initial Assembly Build
    rebuildAssembly();

    // 7. Render Loop with Articulated Kinematic Animations
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Animate kinematic movable components
      if (isAnimating && builtModelRef.current) {
        builtModelRef.current.animatedParts.forEach(({ object, movement }) => {
          const moveSpeed = movement.speed * animationSpeed * delta;
          if (movement.type === 'spin') {
            if (movement.axis === 'x') object.rotation.x += moveSpeed;
            else if (movement.axis === 'y') object.rotation.y += moveSpeed;
            else if (movement.axis === 'z') object.rotation.z += moveSpeed;
          } else if (movement.type === 'pulse') {
            const factor = 1.0 + Math.sin(now * 0.005 * movement.speed) * (movement.amplitude || 0.05);
            object.scale.set(factor, factor, factor);
          }
        });
      }

      controls.update();
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
  }, [rebuildAssembly, studioMode]);

  // Update Lighting Presets
  useEffect(() => {
    const lg = lightsGroupRef.current;
    if (!lg || !sceneRef.current) return;

    while (lg.children.length > 0) {
      lg.remove(lg.children[0]);
    }

    if (lightingPreset === 'studio') {
      sceneRef.current.background = new THREE.Color(0x0f172a);
      lg.add(new THREE.AmbientLight(0xffffff, 0.75));

      const keyLight = new THREE.DirectionalLight(0xfffaed, 1.8);
      keyLight.position.set(6, 8, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      lg.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.7);
      fillLight.position.set(-6, 3, -4);
      lg.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
      rimLight.position.set(0, -5, -6);
      lg.add(rimLight);
    } else if (lightingPreset === 'daylight') {
      sceneRef.current.background = new THREE.Color(0x1e293b);
      lg.add(new THREE.HemisphereLight(0xdbeafe, 0x334155, 0.95));

      const sun = new THREE.DirectionalLight(0xfff7ed, 2.2);
      sun.position.set(8, 12, 6);
      sun.castShadow = true;
      lg.add(sun);
    } else if (lightingPreset === 'lab') {
      sceneRef.current.background = new THREE.Color(0x0f172a);
      lg.add(new THREE.AmbientLight(0xffffff, 1.3));

      const cleanTop = new THREE.DirectionalLight(0xffffff, 1.7);
      cleanTop.position.set(0, 10, 2);
      lg.add(cleanTop);
    } else if (lightingPreset === 'cinematic') {
      sceneRef.current.background = new THREE.Color(0x050811);
      lg.add(new THREE.AmbientLight(0x1e1b4b, 0.4));

      const spot = new THREE.SpotLight(0x60a5fa, 3.2, 30, Math.PI / 4, 0.5);
      spot.position.set(5, 7, 5);
      spot.castShadow = true;
      lg.add(spot);

      const kicker = new THREE.DirectionalLight(0xf43f5e, 1.5);
      kicker.position.set(-6, 2, -6);
      lg.add(kicker);
    } else {
      // Technical Blueprint
      sceneRef.current.background = new THREE.Color(0x020617);
      lg.add(new THREE.AmbientLight(0x0284c7, 0.8));

      const gridLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
      gridLight.position.set(0, 10, 0);
      lg.add(gridLight);
    }
  }, [lightingPreset]);

  // Update Exploded View separation positions
  useEffect(() => {
    if (!builtModelRef.current) return;
    const { partsMap, initialPositions, explodeVectors } = builtModelRef.current;

    partsMap.forEach((obj, id) => {
      const init = initialPositions.get(id);
      const vec = explodeVectors.get(id);
      if (init && vec) {
        obj.position.copy(init).addScaledVector(vec, explodedAmount * 1.5);
      }
    });
  }, [explodedAmount]);

  // Set Camera Angles
  const setCameraAnglePreset = (angle: CameraViewAngle) => {
    setCameraView(angle);
    if (!cameraRef.current || !controlsRef.current || !modelGroupRef.current) return;

    const box = new THREE.Box3().setFromObject(modelGroupRef.current);
    const size = new THREE.Vector3();
    box.getSize(size);
    const dist = Math.max(size.x, size.y, size.z, 2.5) * 1.6;

    const target = new THREE.Vector3(0, 0, 0);
    controlsRef.current.target.copy(target);

    switch (angle) {
      case 'front':
        cameraRef.current.position.set(dist, 0, 0);
        break;
      case 'rear':
        cameraRef.current.position.set(-dist, 0, 0);
        break;
      case 'left':
        cameraRef.current.position.set(0, 0, dist);
        break;
      case 'right':
        cameraRef.current.position.set(0, 0, -dist);
        break;
      case 'top':
        cameraRef.current.position.set(0.01, dist, 0);
        break;
      case 'bottom':
        cameraRef.current.position.set(0.01, -dist, 0);
        break;
      case 'closeup':
        cameraRef.current.position.set(dist * 0.45, dist * 0.3, dist * 0.5);
        break;
      case 'overview':
        cameraRef.current.position.set(dist * 1.4, dist * 1.1, dist * 1.5);
        break;
      case 'perspective':
      default:
        cameraRef.current.position.set(dist * 0.8, dist * 0.5, dist * 0.9);
        break;
    }
    cameraRef.current.lookAt(target);
    controlsRef.current.update();
  };

  // Reset Camera View
  const handleResetCamera = () => {
    setCameraAnglePreset('perspective');
  };

  // Capture High-Res Snapshot
  const handleCaptureSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `NeoNova_${activePlan.id}_3D.png`;
    a.click();
  };

  // Save / Bookmark model locally
  const handleToggleSaveLocal = async () => {
    if (isSavedLocally) {
      await offlineDb.deleteCached3DModel(activePlan.id);
      setIsSavedLocally(false);
    } else {
      await offlineDb.cache3DModel(activePlan.id, activePlan);
      setIsSavedLocally(true);
    }
    refreshSavedModels();
  };

  // Selected Component info
  const selectedComponentInfo = useMemo(() => {
    if (!selectedPartId) return null;
    const allComps = [...activePlan.primaryComponents, ...activePlan.secondaryComponents];
    return allComps.find(c => c.id === selectedPartId) || null;
  }, [activePlan, selectedPartId]);

  return (
    <div className={`space-y-4 font-sans text-slate-100 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto' : ''}`}>
      
      {/* 0. TOP UNIFIED 3D STUDIO MODE SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-2.5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStudioMode('anatomy')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              studioMode === 'anatomy'
                ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Heart size={16} className={studioMode === 'anatomy' ? 'text-white' : 'text-rose-400'} />
            <span>3D Human Anatomy Lab</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/20 text-white">Medical Atlas</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('engineering')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              studioMode === 'engineering'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Box size={16} className={studioMode === 'engineering' ? 'text-white' : 'text-indigo-400'} />
            <span>3D Engineering & Machine Creator</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/20 text-white">PBR Physics</span>
          </button>

          {/* AR VIEW MODE BUTTON */}
          <button
            type="button"
            onClick={() => setIsAROpen(true)}
            className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/25 hover:scale-102"
            title="Project 3D Models into your real-world environment using your device camera (AR)"
          >
            <Camera size={16} className="text-cyan-200 animate-pulse" />
            <span>Project in AR</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/20 text-white">Live Camera</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 pr-2 hidden xl:block">
          {studioMode === 'anatomy' ? "Gray's Anatomy verified human organs & cross-sections" : 'Physics-accurate vehicles, aircraft & mechanical assemblies'}
        </div>
      </div>

      {/* AR View Mode Overlay */}
      {isAROpen && (
        <ARViewMode
          initialModelType={studioMode}
          initialAnatomyModelId="heart"
          initialEngineeringPlan={activePlan}
          onClose={() => setIsAROpen(false)}
          onSwitchToStudio={() => setIsAROpen(false)}
        />
      )}

      {studioMode === 'anatomy' ? (
        <AnatomyLabView 
          onSwitchToEngineering={() => setStudioMode('engineering')} 
          onOpenAR={() => setIsAROpen(true)}
        />
      ) : (
        <>
          {/* 1. TOP HEADER & PROMPT INPUT */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black shadow-inner">
              <Box size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  NeoNova 3D Engineering & Science Studio
                </h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                  PBR Physical Engine
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  <span>Realism Score {activePlan.validation.score}/100</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete mechanical, anatomical, and architectural 3D synthesis with accurate proportions, real materials, and 360° inspection.
              </p>
            </div>
          </div>

          {/* Quick Actions: Saved Models Drawer Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderOpen size={14} className="text-indigo-400" />
              <span>Saved 3D Models ({savedModelsList.length})</span>
            </button>
            <button
              type="button"
              onClick={handleToggleSaveLocal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSavedLocally 
                  ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title={isSavedLocally ? 'Saved for offline study' : 'Save model to offline storage'}
            >
              {isSavedLocally ? <BookmarkCheck size={14} /> : <Check size={14} />}
              <span>{isSavedLocally ? 'Saved Offline' : 'Save Offline'}</span>
            </button>
          </div>
        </div>

        {/* Natural Language Prompt Generation Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe any object (e.g. 'rescue helicopter', 'Formula 1 car', 'human heart', 'turbofan engine', 'Greek temple')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !searchQuery.trim()}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Synthesizing 3D Plan...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate 3D Model</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggested Presets */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 mr-1">
            Quick Subjects:
          </span>
          {[
            { key: 'helicopter', label: '🚁 Rescue Helicopter' },
            { key: 'race_car', label: '🏎️ Formula 1 Race Car' },
            { key: 'turbofan', label: '✈️ Jet Turbofan Engine' },
            { key: 'heart', label: '❤️ Human Heart Anatomy' },
            { key: 'microscope', label: '🔬 Compound Microscope' },
            { key: 'electric_motor', label: '⚡ AC Electric Motor' },
            { key: 'james_webb', label: '🔭 James Webb Telescope' },
            { key: 'solar_system', label: '🪐 Solar System' }
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.key === 'heart') {
                  setStudioMode('anatomy');
                  return;
                }
                if (STRUCTURAL_CATALOG[item.key]) {
                  setActivePlan(STRUCTURAL_CATALOG[item.key]);
                  setSelectedPartId(null);
                  setExplodedAmount(0);
                } else {
                  handleGenerateModel(item.label);
                }
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                activePlan.id === item.key 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs' 
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. REAL GENERATION PROGRESS OVERLAY (Section 18) */}
      {isGenerating && generationProgress && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 shadow-2xl animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-indigo-400 animate-spin" />
              <span className="font-extrabold text-white text-sm">
                {generationProgress.label}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {generationProgress.percentage}%
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-indigo-500 h-full transition-all duration-300 rounded-full" 
              style={{ width: `${generationProgress.percentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            {generationProgress.detail}
          </p>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
            <span>Stage: {generationProgress.stage}</span>
            {generationProgress.activeComponent && (
              <>
                <span>&middot;</span>
                <span className="text-indigo-300 font-bold truncate">Part: {generationProgress.activeComponent}</span>
              </>
            )}
          </div>
        </div>
      )}

      {generationError && (
        <div className="p-4 bg-rose-950/80 border border-rose-700/60 rounded-2xl text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <span>{generationError}</span>
          </div>
          <button
            type="button"
            onClick={() => handleGenerateModel(activePlan.prompt || 'helicopter')}
            className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-bold text-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. MAIN WORKSPACE: 3D VIEWPORT (LEFT) + EDUCATIONAL INSPECTOR (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* 3D VIEWPORT CONTAINER (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative flex flex-col min-h-[520px] lg:min-h-[640px]">
          
          {/* Top Viewport Overlay Controls: Quality, Lighting, Reset */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
            {/* Left: Quality & Lighting */}
            <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 text-xs shadow-lg">
              <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Quality:</span>
              {(['standard', 'high', 'ultra'] as ModelQualityLevel[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQualityLevel(q)}
                  className={`px-2 py-0.5 rounded-xl font-bold uppercase text-[10px] transition-colors cursor-pointer ${
                    qualityLevel === q ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Right: Lighting Preset & Fullscreen */}
            <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 text-xs shadow-lg">
              <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Light:</span>
              {(['studio', 'daylight', 'lab', 'cinematic', 'technical'] as LightingPreset[]).map((lp) => (
                <button
                  key={lp}
                  type="button"
                  onClick={() => setLightingPreset(lp)}
                  className={`px-2 py-0.5 rounded-xl font-bold capitalize text-[10px] transition-colors cursor-pointer ${
                    lightingPreset === lp ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lp}
                </button>
              ))}

              <div className="w-[1px] h-4 bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Download 3D Snapshot PNG"
              >
                <Download size={13} />
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Three.js Canvas Container */}
          <div ref={mountRef} className="w-full flex-1 min-h-[460px] cursor-grab active:cursor-grabbing" />

          {/* Bottom Viewport Action Bar: 9 Camera Angles, Exploded Slider, Kinematics */}
          <div className="p-3 sm:p-4 bg-slate-900/95 border-t border-slate-800 flex flex-col gap-3 shrink-0">
            
            {/* Row 1: Camera Angle Presets (Section 12) */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs overflow-x-auto scrollbar-thin">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                  <Camera size={12} />
                  <span>View:</span>
                </span>
                {(['perspective', 'front', 'rear', 'left', 'right', 'top', 'bottom', 'closeup', 'overview'] as CameraViewAngle[]).map((ang) => (
                  <button
                    key={ang}
                    type="button"
                    onClick={() => setCameraAnglePreset(ang)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                      cameraView === ang ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ang}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleResetCamera}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw size={12} />
                <span>Reset Orbit</span>
              </button>
            </div>

            {/* Row 2: Exploded View Slider (Section 15) & Kinematics Control (Section 10) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
              {/* Exploded View */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight shrink-0 flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-400" />
                  <span>Exploded View:</span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono text-indigo-400 font-bold w-10 text-right">
                  {Math.round(explodedAmount * 100)}%
                </span>
              </div>

              {/* Kinematic Rotation Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isAnimating ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isAnimating ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isAnimating ? 'Motion Active' : 'Paused'}</span>
                </button>
                {isAnimating && (
                  <button
                    type="button"
                    onClick={() => setAnimationSpeed(prev => (prev === 1.0 ? 2.0 : prev === 2.0 ? 0.5 : 1.0))}
                    className="px-2 py-1 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700 cursor-pointer"
                    title="Cycle animation speed"
                  >
                    {animationSpeed}x Speed
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* EDUCATIONAL INSPECTOR & COMPONENT HIERARCHY (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* View Mode Switcher: Explore / Learn / Quiz */}
          <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setViewMode('explore')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                viewMode === 'explore' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Component Tree
            </button>
            <button
              type="button"
              onClick={() => setViewMode('learn')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                viewMode === 'learn' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Engineering Specs
            </button>
            <button
              type="button"
              onClick={() => setViewMode('quiz')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                viewMode === 'quiz' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Curriculum Quiz
            </button>
          </div>

          {/* MODE 1: COMPONENT TREE & SELECTION */}
          {viewMode === 'explore' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 max-h-[540px] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Box size={14} className="text-indigo-400" />
                  <span>Assembly Hierarchy ({activePlan.primaryComponents.length + activePlan.secondaryComponents.length} Parts)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {activePlan.category}
                </span>
              </div>

              {/* Primary Assemblies List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Primary Structural Core:
                </span>
                {activePlan.primaryComponents.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => setSelectedPartId(comp.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                      selectedPartId === comp.id
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `#${comp.color.toString(16).padStart(6, '0')}` }} />
                      <span className="truncate">{comp.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                      {comp.subsystem}
                    </span>
                  </button>
                ))}
              </div>

              {/* Secondary Assemblies List */}
              {activePlan.secondaryComponents.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Secondary Subassemblies:
                  </span>
                  {activePlan.secondaryComponents.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setSelectedPartId(comp.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                        selectedPartId === comp.id
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                          : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `#${comp.color.toString(16).padStart(6, '0')}` }} />
                        <span className="truncate">{comp.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                        {comp.subsystem}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Part Detail Card */}
              {selectedComponentInfo ? (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                      Subsystem: {selectedComponentInfo.subsystem}
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-600/30 text-indigo-200 px-2 py-0.5 rounded-full uppercase">
                      {selectedComponentInfo.materialType}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">
                    {selectedComponentInfo.name}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">
                    {selectedComponentInfo.functionDesc}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-indigo-300 font-bold">Why it exists: </span>
                    {selectedComponentInfo.simpleExplanation}
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-slate-400">
                    Specs: {selectedComponentInfo.technicalDetails}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                  Click any component in the 3D model or tree above to inspect its engineering specifications.
                </div>
              )}
            </div>
          )}

          {/* MODE 2: ENGINEERING SPECS & REALISM CHECK (Section 21) */}
          {viewMode === 'learn' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 max-h-[540px] overflow-y-auto scrollbar-thin text-xs">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  {activePlan.objectName}
                </h3>
                <p className="text-slate-400 mt-1 leading-relaxed">
                  {activePlan.summary}
                </p>
              </div>

              {/* Real-World Dimensions & Scale (Section 8) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Real-World Scale & Dimensions:
                </span>
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">LENGTH</span>
                    <span className="text-white font-bold">{activePlan.realWorldDimensions.lengthMeters} m</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">WIDTH</span>
                    <span className="text-white font-bold">{activePlan.realWorldDimensions.widthMeters} m</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[9px] block">HEIGHT</span>
                    <span className="text-white font-bold">{activePlan.realWorldDimensions.heightMeters} m</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {activePlan.scaleNote}
                </p>
              </div>

              {/* Physical Materials System (Section 5) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Material Properties:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {activePlan.materialNotes}
                </p>
              </div>

              {/* Automated Realism Check Report (Section 21) */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                    Automated Realism Check:
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {activePlan.validation.score}/100 Verified
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {activePlan.validation.notes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* MODE 3: CURRICULUM QUIZ */}
          {viewMode === 'quiz' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4 max-h-[540px] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-indigo-400" />
                  <span>Interactive Component Quiz</span>
                </span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  Score: {quizScore} / {activePlan.quizQuestions.length}
                </span>
              </div>

              {activePlan.quizQuestions.length > 0 && quizIndex < activePlan.quizQuestions.length ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                      Question {quizIndex + 1} of {activePlan.quizQuestions.length}:
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                      {activePlan.quizQuestions[quizIndex].question}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Select Target Component:
                  </span>

                  <div className="space-y-1.5">
                    {[...activePlan.primaryComponents, ...activePlan.secondaryComponents].slice(0, 5).map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => {
                          const target = activePlan.quizQuestions[quizIndex].targetPartId;
                          if (comp.id === target) {
                            setQuizScore(prev => prev + 1);
                            setQuizFeedback(`Correct! ${activePlan.quizQuestions[quizIndex].explanation}`);
                          } else {
                            setQuizFeedback(`Incorrect. The correct component is ${target}. ${activePlan.quizQuestions[quizIndex].explanation}`);
                          }
                          setSelectedPartId(target);
                          setTimeout(() => {
                            if (quizIndex + 1 < activePlan.quizQuestions.length) {
                              setQuizIndex(prev => prev + 1);
                              setQuizFeedback(null);
                            }
                          }, 3200);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                      >
                        {comp.name}
                      </button>
                    ))}
                  </div>

                  {quizFeedback && (
                    <div className="p-3 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-xs text-indigo-200 animate-in fade-in">
                      {quizFeedback}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-extrabold text-white">Quiz Completed!</h4>
                  <p className="text-xs text-slate-400">
                    You demonstrated deep structural understanding with a score of {quizScore} / {activePlan.quizQuestions.length}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuizIndex(0);
                      setQuizScore(0);
                      setQuizFeedback(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 4. SAVED MODELS OFFLINE DRAWER MODAL */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderOpen size={18} className="text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">
                  Offline Saved 3D Models
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSavedDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 scrollbar-thin">
              {savedModelsList.length === 0 ? (
                <div className="text-center p-8 text-xs text-slate-500">
                  No 3D models saved to offline storage yet. Click &ldquo;Save Offline&rdquo; on any generated model to keep it locally for offline study.
                </div>
              ) : (
                savedModelsList.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">
                        {m.objectName || m.title || m.id}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {m.category || 'Engineering'} &middot; {m.cachedAt ? new Date(m.cachedAt).toLocaleDateString() : 'Cached'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePlan(m);
                          setIsSavedDrawerOpen(false);
                          setSelectedPartId(null);
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await offlineDb.deleteCached3DModel(m.id);
                          refreshSavedModels();
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete from offline storage"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
}
