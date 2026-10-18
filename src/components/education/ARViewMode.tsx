import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Camera, 
  X, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Sun, 
  Zap, 
  ZapOff, 
  Check, 
  RefreshCw, 
  Layers, 
  Info, 
  Download, 
  Compass, 
  ChevronRight, 
  Eye, 
  Heart, 
  Activity,
  AlertTriangle,
  Move
} from 'lucide-react';
import { buildAnatomicalAssembly, BuiltAnatomyResult } from '../../lib/anatomyEngine/anatomyAssemblyBuilder';
import { ANATOMICAL_MODELS_CATALOG } from '../../lib/anatomyEngine/anatomyModelsCatalog';
import { buildThreeDAssembly, BuiltModelResult } from '../../lib/threeDStudio/threeModelBuilder';
import { STRUCTURAL_CATALOG } from '../../lib/threeDStudio/offlineStructuralCatalog';
import { EducationalStructuralPlan } from '../../lib/threeDStudio/types';
import { toggleTorch, getCameraCapabilities } from '../../lib/imageEnhancer';

export interface ARViewModeProps {
  initialModelType?: 'anatomy' | 'engineering';
  initialAnatomyModelId?: string;
  initialEngineeringPlan?: EducationalStructuralPlan;
  onClose: () => void;
  onSwitchToStudio?: () => void;
}

export default function ARViewMode({
  initialModelType = 'anatomy',
  initialAnatomyModelId = 'heart',
  initialEngineeringPlan,
  onClose,
  onSwitchToStudio
}: ARViewModeProps) {
  // Container & Media refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Model selection
  const [modelType, setModelType] = useState<'anatomy' | 'engineering'>(initialModelType);
  const [activeAnatomyId, setActiveAnatomyId] = useState<string>(initialAnatomyModelId);
  const [activeEngineeringPlan, setActiveEngineeringPlan] = useState<EducationalStructuralPlan>(
    initialEngineeringPlan || STRUCTURAL_CATALOG.helicopter
  );

  // AR Camera status
  const [cameraStatus, setCameraStatus] = useState<'requesting' | 'active' | 'denied' | 'unsupported'>('requesting');
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // AR Placement & Model controls
  const [isPlaced, setIsPlaced] = useState(false);
  const [modelScale, setModelScale] = useState(1.0);
  const [rotationY, setRotationY] = useState(0);
  const [elevationY, setElevationY] = useState(0);
  const [distanceZ, setDistanceZ] = useState(-2.4);
  const [explodedAmount, setExplodedAmount] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [gyroTracking, setGyroTracking] = useState(false);

  // Inspection HUD
  const [selectedPartInfo, setSelectedPartInfo] = useState<{
    name: string;
    description: string;
    systemOrCategory?: string;
  } | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [capturedSnapshotUrl, setCapturedSnapshotUrl] = useState<string | null>(null);
  const [showControlsDrawer, setShowControlsDrawer] = useState(true);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelAnchorGroupRef = useRef<THREE.Group | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const shadowGroundRef = useRef<THREE.Mesh | null>(null);
  const reticleRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Animation hooks for biological pulse or mechanical motion
  const anatomicalAssemblyRef = useRef<BuiltAnatomyResult | null>(null);
  const engineeringAssemblyRef = useRef<BuiltModelResult | null>(null);

  // 1. Camera Stream Management
  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCameraStream();
    setCameraStatus('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Check torch support
      const track = stream.getVideoTracks()[0];
      if (track) {
        const caps = await getCameraCapabilities(track);
        setIsTorchSupported(caps.supportsTorch);
      }

      setCameraStatus('active');
    } catch (err: any) {
      console.warn('Environment camera failed, retrying generic constraints:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        mediaStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        setCameraStatus('active');
      } catch (e) {
        console.error('Camera permission denied or unavailable:', e);
        setCameraStatus('denied');
      }
    }
  }, [stopCameraStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCameraStream();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [startCamera, stopCameraStream]);

  // Toggle Torch
  const handleToggleTorch = async () => {
    const track = mediaStreamRef.current?.getVideoTracks()[0];
    if (track && isTorchSupported) {
      const next = !isTorchOn;
      const ok = await toggleTorch(track, next);
      if (ok) setIsTorchOn(next);
    }
  };

  // 2. Build or Rebuild the Active 3D Model into the AR Anchor
  const loadActiveModelIntoAR = useCallback(() => {
    if (!modelAnchorGroupRef.current) return;
    const anchor = modelAnchorGroupRef.current;

    // Clear previous model from anchor
    if (currentModelGroupRef.current) {
      anchor.remove(currentModelGroupRef.current);
      currentModelGroupRef.current = null;
    }

    if (modelType === 'anatomy') {
      const def = ANATOMICAL_MODELS_CATALOG[activeAnatomyId] || ANATOMICAL_MODELS_CATALOG['heart'];
      const built = buildAnatomicalAssembly(def, {
        selectedStructureId: null,
        isolatedStructureId: null,
        isXRayMode: false,
        activeSystemFilter: 'all',
        crossSectionSlice: 0,
        crossSectionAxis: 'z',
        theme: 'clinical_light'
      });
      anatomicalAssemblyRef.current = built;
      engineeringAssemblyRef.current = null;
      currentModelGroupRef.current = built.rootGroup;
      anchor.add(built.rootGroup);

      // Auto-set default educational callout
      setSelectedPartInfo({
        name: def.name,
        description: def.summary,
        systemOrCategory: def.system
      });
    } else {
      const built = buildThreeDAssembly(activeEngineeringPlan, 'high');
      engineeringAssemblyRef.current = built;
      anatomicalAssemblyRef.current = null;
      currentModelGroupRef.current = built.rootGroup;
      anchor.add(built.rootGroup);

      setSelectedPartInfo({
        name: activeEngineeringPlan.objectName,
        description: activeEngineeringPlan.summary,
        systemOrCategory: activeEngineeringPlan.category
      });
    }
  }, [modelType, activeAnatomyId, activeEngineeringPlan]);

  // 3. Setup Three.js Scene, Camera, Compositing, and Placement Reticle
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 0); // AR camera stays at origin, world moves or rotates
    cameraRef.current = camera;

    // Transparent WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Realistic Lighting for Camera AR Passthrough
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(2, 6, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Anchor Group (holds the placed 3D model in real space)
    const anchorGroup = new THREE.Group();
    anchorGroup.position.set(0, -0.4, -2.4);
    scene.add(anchorGroup);
    modelAnchorGroupRef.current = anchorGroup;

    // Ground Shadow Receiver Plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.7;
    shadowMesh.receiveShadow = true;
    anchorGroup.add(shadowMesh);
    shadowGroundRef.current = shadowMesh;

    // AR Placement Reticle / Scanning Circle
    const reticleGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(0.35, 0.38, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.85 
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    reticleGroup.add(ringMesh);

    // Inner crosshairs
    const innerCrossGeo = new THREE.RingGeometry(0.08, 0.1, 16);
    const innerCrossMesh = new THREE.Mesh(innerCrossGeo, ringMat);
    innerCrossMesh.rotation.x = -Math.PI / 2;
    reticleGroup.add(innerCrossMesh);

    reticleGroup.position.set(0, -0.65, -2.4);
    scene.add(reticleGroup);
    reticleRef.current = reticleGroup;

    // Load initial model into anchor
    loadActiveModelIntoAR();

    // Resize listener
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render & Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Reticle pulse
      if (reticleRef.current) {
        const pulse = 1.0 + Math.sin(elapsedTime * 4) * 0.08;
        reticleRef.current.scale.set(pulse, pulse, pulse);
      }

      // Auto-rotation of placed model
      if (modelAnchorGroupRef.current && isAutoRotating) {
        modelAnchorGroupRef.current.rotation.y += delta * 0.6;
      }

      // Model-specific educational simulations (beating heart, spinning rotor)
      if (isAnimating) {
        // Anatomical simulation: Heartbeat / Lung breathing
        if (anatomicalAssemblyRef.current) {
          const { simulationParts } = anatomicalAssemblyRef.current;
          const heartRate = 1.2; // approx 72 bpm
          const pulse = Math.sin(elapsedTime * Math.PI * 2 * heartRate);
          const contraction = 1.0 + (pulse > 0 ? pulse * 0.08 : pulse * 0.02);

          simulationParts.forEach(part => {
            if (part.role === 'ventricle_pump' || part.role === 'myocardium') {
              part.object.scale.set(
                part.initialScale.x * contraction,
                part.initialScale.y * (1.0 - (contraction - 1.0) * 0.5),
                part.initialScale.z * contraction
              );
            } else if (part.role === 'breathing_lobe') {
              const breath = 1.0 + Math.sin(elapsedTime * 1.5) * 0.06;
              part.object.scale.set(
                part.initialScale.x * breath,
                part.initialScale.y * breath,
                part.initialScale.z * breath
              );
            }
          });
        }

        // Engineering simulation: Spinning rotors / gears
        if (engineeringAssemblyRef.current) {
          const { animatedParts } = engineeringAssemblyRef.current;
          animatedParts.forEach(({ object, movement }) => {
            const speed = (movement.speed || 1.0) * 8.0;
            if (movement.axis === 'y') {
              object.rotation.y += delta * speed;
            } else if (movement.axis === 'x') {
              object.rotation.x += delta * speed;
            } else if (movement.axis === 'z') {
              object.rotation.z += delta * speed;
            }
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [loadActiveModelIntoAR, isAutoRotating, isAnimating]);

  // Sync transform props to Three.js anchor
  useEffect(() => {
    if (!modelAnchorGroupRef.current) return;
    const anchor = modelAnchorGroupRef.current;
    anchor.scale.set(modelScale, modelScale, modelScale);
    anchor.position.set(0, elevationY - 0.4, distanceZ);
    anchor.rotation.y = rotationY;

    // Reticle matches anchor position
    if (reticleRef.current) {
      reticleRef.current.position.set(0, elevationY - 0.65, distanceZ);
      reticleRef.current.visible = !isPlaced;
    }
  }, [modelScale, elevationY, distanceZ, rotationY, isPlaced]);

  // Sync Exploded View in AR
  useEffect(() => {
    if (anatomicalAssemblyRef.current) {
      const { structuresMap, initialPositions, explodedVectors } = anatomicalAssemblyRef.current;
      structuresMap.forEach((obj, id) => {
        const init = initialPositions.get(id);
        const dir = explodedVectors.get(id);
        if (init && dir) {
          obj.position.copy(init).addScaledVector(dir, explodedAmount * 0.8);
        }
      });
    } else if (engineeringAssemblyRef.current) {
      const { partsMap, initialPositions, explodeVectors } = engineeringAssemblyRef.current;
      partsMap.forEach((obj, id) => {
        const init = initialPositions.get(id);
        const dir = explodeVectors.get(id);
        if (init && dir) {
          obj.position.copy(init).addScaledVector(dir, explodedAmount * 0.8);
        }
      });
    }
  }, [explodedAmount]);

  // Model change trigger
  useEffect(() => {
    loadActiveModelIntoAR();
  }, [modelType, activeAnatomyId, activeEngineeringPlan, loadActiveModelIntoAR]);

  // Handle Screen Tap to Place or Inspect Part
  const handleViewportTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = canvasMountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

    if (currentModelGroupRef.current) {
      const intersects = raycasterRef.current.intersectObjects(currentModelGroupRef.current.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const partName = hit.name || (hit.parent?.name) || 'Anatomical Component';

        // Check anatomical description
        if (modelType === 'anatomy') {
          const def = ANATOMICAL_MODELS_CATALOG[activeAnatomyId];
          const found = def?.structures.find(s => s.id === hit.name || s.name.toLowerCase() === hit.name.toLowerCase());
          if (found) {
            setSelectedPartInfo({
              name: found.name,
              description: found.gradeContent?.middleSchool?.functionDesc || found.gradeContent?.middleSchool?.summary || 'Scientifically verified anatomical structure.',
              systemOrCategory: found.system
            });
            // Haptic feedback
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
            return;
          }
        } else {
          const allComps = [...(activeEngineeringPlan.primaryComponents || []), ...(activeEngineeringPlan.secondaryComponents || [])];
          const comp = allComps.find(c => c.id === hit.name || c.name.toLowerCase() === hit.name.toLowerCase());
          if (comp) {
            setSelectedPartInfo({
              name: comp.name,
              description: comp.functionDesc || comp.simpleExplanation || 'Physics-engineered structural assembly part.',
              systemOrCategory: comp.subsystem || comp.materialType
            });
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
            return;
          }
        }

        setSelectedPartInfo({
          name: partName.replace(/_/g, ' ').toUpperCase(),
          description: 'Specialized structural component rendered with realistic physical optical materials in augmented reality.',
          systemOrCategory: modelType === 'anatomy' ? 'Anatomical System' : 'Engineering Assembly'
        });
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
        return;
      }
    }

    // If tap didn't hit model: toggle placement anchor
    setIsPlaced(prev => !prev);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
  };

  // Capture AR Snapshot (Composites Camera Video + 3D Canvas)
  const handleCaptureARSnapshot = () => {
    if (!videoRef.current || !rendererRef.current) return;
    const video = videoRef.current;
    const webglCanvas = rendererRef.current.domElement;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = webglCanvas.width;
    outCanvas.height = webglCanvas.height;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw camera video background
    ctx.drawImage(video, 0, 0, outCanvas.width, outCanvas.height);

    // 2. Draw 3D WebGL render on top
    ctx.drawImage(webglCanvas, 0, 0, outCanvas.width, outCanvas.height);

    // 3. Add stylish AR Watermark & timestamp
    ctx.fillStyle = 'rgba(7, 11, 25, 0.75)';
    ctx.roundRect(24, outCanvas.height - 72, 340, 48, 12);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('NEONOVA 3D AR LAB', 42, outCanvas.height - 46);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`${selectedPartInfo?.name || 'Projected Scientific Model'} · Verified Physics`, 42, outCanvas.height - 30);

    const snapshotUrl = outCanvas.toDataURL('image/jpeg', 0.95);
    setCapturedSnapshotUrl(snapshotUrl);

    // Sound / Vibration feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 60, 40]);
  };

  // Audio Speech Narration for inspected part
  const handleToggleNarration = () => {
    if (!window.speechSynthesis) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    if (!selectedPartInfo) return;
    const text = `${selectedPartInfo.name}. ${selectedPartInfo.description}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  // List of quick models for the AR carousel
  const AR_ANATOMY_PRESETS = [
    { id: 'heart', label: 'Human Heart', icon: Heart, badge: 'Cardiology' },
    { id: 'brain', label: 'Human Brain', icon: Activity, badge: 'Neurology' },
    { id: 'eye', label: 'Human Eye', icon: Eye, badge: 'Ophthalmology' },
    { id: 'lungs', label: 'Respiratory Lungs', icon: Layers, badge: 'Pulmonology' },
    { id: 'kidney', label: 'Renal Kidney', icon: Sparkles, badge: 'Nephrology' },
    { id: 'neuron', label: 'Synaptic Neuron', icon: Activity, badge: 'Cell Biology' },
    { id: 'dna', label: 'DNA Double Helix', icon: Layers, badge: 'Genetics' }
  ];

  const AR_ENGINEERING_PRESETS = [
    { id: 'helicopter', label: 'Apache Rotorcraft', badge: 'Aerodynamics', plan: STRUCTURAL_CATALOG.helicopter },
    { id: 'turbofan', label: 'Jet Turbofan Engine', badge: 'Thermodynamics', plan: STRUCTURAL_CATALOG.turbofan_engine },
    { id: 'drone', label: 'Quadcopter Drone', badge: 'Avionics', plan: STRUCTURAL_CATALOG.quadcopter_drone },
    { id: 'solarsystem', label: 'Solar Planetary System', badge: 'Astrophysics', plan: STRUCTURAL_CATALOG.solar_system }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none touch-none">
      {/* 1. Live Camera Stream Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* 2. Transparent Three.js WebGL Canvas Overlay */}
      <div
        ref={canvasMountRef}
        onClick={handleViewportTap}
        onTouchStart={handleViewportTap}
        className="absolute inset-0 z-10 w-full h-full cursor-crosshair"
      />

      {/* 3. Camera Status Feedback Overlay (If requesting, denied, or unsupported) */}
      {cameraStatus !== 'active' && (
        <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
          {cameraStatus === 'requesting' && (
            <div className="space-y-4 max-w-sm">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                  <Camera size={32} className="text-cyan-400 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">Initializing AR Camera Stream</h2>
              <p className="text-xs text-slate-400">
                Requesting camera access to project 3D anatomical and scientific models onto your desk or real-world surface.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-700/60 text-cyan-300 text-xs">
                <Sparkles size={13} />
                <span>Aligning physical plane detection...</span>
              </div>
            </div>
          )}

          {cameraStatus === 'denied' && (
            <div className="space-y-4 max-w-md bg-slate-900 border border-rose-500/30 p-6 rounded-2xl shadow-2xl">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-lg font-bold text-white">Camera Access Blocked</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                To experience real-world 3D Augmented Reality, please allow camera permission in your browser address bar.
              </p>
              <div className="p-3 bg-slate-800/80 rounded-xl text-left text-xs text-slate-300 space-y-1.5 border border-slate-700">
                <p className="font-semibold text-slate-100">How to unblock on mobile:</p>
                <p>1. Tap the <strong>lock or camera icon</strong> in your browser search bar.</p>
                <p>2. Select <strong>Site Settings</strong> or <strong>Permissions</strong>.</p>
                <p>3. Toggle <strong>Camera to Allow</strong> and tap Try Again.</p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCameraStatus('active')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                >
                  Simulate AR Desk
                </button>
              </div>
            </div>
          )}

          {cameraStatus === 'unsupported' && (
            <div className="space-y-4 max-w-sm bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <Camera size={32} className="mx-auto text-amber-400" />
              <h2 className="text-lg font-bold text-white">Camera Not Supported</h2>
              <p className="text-xs text-slate-400">
                Your current browser environment doesn&apos;t support the Web MediaDevices API.
              </p>
              <button
                type="button"
                onClick={() => setCameraStatus('active')}
                className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-semibold cursor-pointer"
              >
                Continue in 3D Space
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. AR Top Navigation Bar */}
      <header className="relative z-30 flex items-center justify-between p-3 bg-gradient-to-b from-slate-950/80 to-transparent backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">NEONOVA AR</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                {modelType === 'anatomy' ? 'Anatomy AR' : 'Science AR'}
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              {isPlaced ? 'Model Anchored to Surface' : 'Aim camera at table & tap to anchor'}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Torch toggle (if hardware supported) */}
          {isTorchSupported && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-2 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
                isTorchOn 
                  ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30' 
                  : 'bg-slate-900/70 text-slate-300 border-slate-700/60 hover:text-white'
              }`}
              title="Toggle Flashlight / Torch"
              aria-label="Toggle Flashlight"
            >
              {isTorchOn ? <Zap size={16} /> : <ZapOff size={16} />}
            </button>
          )}

          {/* Toggle Controls Drawer */}
          <button
            type="button"
            onClick={() => setShowControlsDrawer(prev => !prev)}
            className={`p-2 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
              showControlsDrawer 
                ? 'bg-cyan-600 text-white border-cyan-400' 
                : 'bg-slate-900/70 text-slate-300 border-slate-700/60'
            }`}
            title="Toggle AR Controls Panel"
            aria-label="Toggle AR Controls"
          >
            <Sliders size={16} />
          </button>

          {/* Exit / Return to 3D Studio */}
          {onSwitchToStudio && (
            <button
              type="button"
              onClick={onSwitchToStudio}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-200 hover:text-white backdrop-blur-md cursor-pointer flex items-center gap-1"
            >
              <span>Studio</span>
              <ChevronRight size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 backdrop-blur-md transition-colors cursor-pointer"
            title="Exit AR View"
            aria-label="Close AR"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* 5. Center AR Reticle Guidance Badge (shown when unplaced) */}
      {!isPlaced && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-slate-950/80 border border-cyan-500/50 backdrop-blur-md text-cyan-300 text-xs font-medium flex items-center gap-2 shadow-2xl animate-bounce">
            <Move size={14} className="text-cyan-400" />
            <span>Tap anywhere on desk to place model</span>
          </div>
        </div>
      )}

      {/* 6. Model Switcher Tabs (Anatomy vs Engineering + Carousel) */}
      <div className="relative z-20 px-3 py-1 flex items-center justify-between">
        <div className="flex p-0.5 rounded-xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setModelType('anatomy')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              modelType === 'anatomy' 
                ? 'bg-rose-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Anatomy
          </button>
          <button
            type="button"
            onClick={() => setModelType('engineering')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              modelType === 'engineering' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Science & Tech
          </button>
        </div>

        {/* Reposition / Anchor button */}
        <button
          type="button"
          onClick={() => setIsPlaced(prev => !prev)}
          className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border cursor-pointer transition-colors ${
            isPlaced 
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
              : 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60 animate-pulse'
          }`}
        >
          <Check size={13} />
          <span>{isPlaced ? 'Anchored' : 'Tap to Lock'}</span>
        </button>
      </div>

      {/* Horizontal Carousel of Available 3D Models in AR */}
      <div className="relative z-20 px-3 py-1.5 overflow-x-auto flex gap-2 no-scrollbar">
        {modelType === 'anatomy' ? (
          AR_ANATOMY_PRESETS.map((item) => {
            const isSelected = activeAnatomyId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveAnatomyId(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white border-rose-400 shadow-md scale-105'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                <item.icon size={13} className={isSelected ? 'text-white' : 'text-rose-400'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })
        ) : (
          AR_ENGINEERING_PRESETS.map((item) => {
            const isSelected = activeEngineeringPlan.id === item.plan.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveEngineeringPlan(item.plan)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white border-cyan-400 shadow-md scale-105'
                    : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                <Sparkles size={13} className={isSelected ? 'text-white' : 'text-cyan-400'} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Spacer pushing HUD elements to bottom */}
      <div className="flex-1 pointer-events-none" />

      {/* 7. Part Inspection HUD Card (Interactive Raycaster Callout) */}
      {selectedPartInfo && (
        <div className="relative z-30 mx-3 mb-2 p-3 rounded-2xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md text-white shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-bold text-white tracking-wide">{selectedPartInfo.name}</h3>
                {selectedPartInfo.systemOrCategory && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedPartInfo.systemOrCategory}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {selectedPartInfo.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleNarration}
                className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                  isNarrating 
                    ? 'bg-cyan-500 text-white border-cyan-300 shadow-md shadow-cyan-500/30' 
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title="Listen to anatomical voice narration"
                aria-label="Narrate structure"
              >
                {isNarrating ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPartInfo(null)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                title="Dismiss Callout"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Bottom AR Control Strip & Shutter Trigger */}
      <div className="relative z-30 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        {/* Expandable Controls Drawer */}
        {showControlsDrawer && (
          <div className="mb-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md space-y-2.5">
            {/* Scale & Elevation Sliders */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Model Scale</span>
                  <span className="font-mono text-cyan-400">{modelScale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.1"
                  value={modelScale}
                  onChange={(e) => setModelScale(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Desk Elevation</span>
                  <span className="font-mono text-cyan-400">{(elevationY * 100).toFixed(0)}cm</span>
                </div>
                <input
                  type="range"
                  min="-0.8"
                  max="0.8"
                  step="0.05"
                  value={elevationY}
                  onChange={(e) => setElevationY(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Exploded View & Rotation Sliders */}
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1 border-t border-slate-800/60">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Exploded View</span>
                  <span className="font-mono text-rose-400">{(explodedAmount * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explodedAmount}
                  onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Rotate 360°</span>
                  <span className="font-mono text-cyan-400">{((rotationY * 180) / Math.PI).toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.PI * 2}
                  step="0.1"
                  value={rotationY}
                  onChange={(e) => setRotationY(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Action Toggles */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsAutoRotating(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors flex items-center gap-1 ${
                  isAutoRotating 
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <RotateCw size={12} className={isAutoRotating ? 'animate-spin' : ''} />
                <span>Auto-Spin</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAnimating(prev => !prev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors flex items-center gap-1 ${
                  isAnimating 
                    ? 'bg-rose-950 text-rose-300 border-rose-700' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Activity size={12} />
                <span>Physiological Pulse</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModelScale(1.0);
                  setRotationY(0);
                  setElevationY(0);
                  setExplodedAmount(0);
                  setIsPlaced(false);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
              >
                Reset Position
              </button>
            </div>
          </div>
        )}

        {/* Shutter Button & Snapshot Capture Bar */}
        <div className="flex items-center justify-around max-w-sm mx-auto">
          {/* Quick Reposition / Flip button */}
          <button
            type="button"
            onClick={() => setRotationY(prev => prev + Math.PI / 4)}
            className="w-11 h-11 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors shadow-md"
            title="Rotate 45°"
            aria-label="Rotate 45 degrees"
          >
            <RotateCw size={18} />
          </button>

          {/* Big AR Camera Snapshot Shutter Button */}
          <button
            type="button"
            onClick={handleCaptureARSnapshot}
            className="group relative w-18 h-18 rounded-full border-4 border-white/80 p-1 flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Take High-Definition AR Photo"
            aria-label="Capture AR Photo"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:from-cyan-400 group-hover:to-indigo-400">
              <Camera size={26} />
            </div>
          </button>

          {/* Fullscreen / Toggle Drawer */}
          <button
            type="button"
            onClick={() => setShowControlsDrawer(prev => !prev)}
            className="w-11 h-11 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors shadow-md"
            title="Settings / Sliders"
            aria-label="Toggle sliders"
          >
            <Sliders size={18} />
          </button>
        </div>
      </div>

      {/* 9. Captured AR Photo Preview Modal */}
      {capturedSnapshotUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-4 max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">AR Scientific Snapshot Saved</h3>
              </div>
              <button
                type="button"
                onClick={() => setCapturedSnapshotUrl(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-700">
              <img
                src={capturedSnapshotUrl}
                alt="AR 3D Model Capture"
                className="w-full h-auto object-contain max-h-[60vh]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <a
                href={capturedSnapshotUrl}
                download={`neonova-ar-${modelType}-${Date.now()}.jpg`}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Download size={14} />
                <span>Download Photo</span>
              </a>
              <button
                type="button"
                onClick={() => setCapturedSnapshotUrl(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
