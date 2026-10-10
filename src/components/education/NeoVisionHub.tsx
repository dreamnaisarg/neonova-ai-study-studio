import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Search, 
  Sparkles, 
  FlaskConical, 
  Star, 
  Home, 
  BookOpen, 
  Swords, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  ChevronRight, 
  Compass, 
  Lock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Flame,
  Zap,
  Layers,
  Heart,
  Clock,
  Eye
} from 'lucide-react';
import { PlanTier, PLANS, canAccessFeature } from '../../lib/billing';
import { EduTab } from './EduSidebar';

export type NeoVisionToolId = 
  | 'teacher' 
  | 'visualizer' 
  | 'scanner' 
  | 'lab' 
  | 'city' 
  | 'room' 
  | 'manga' 
  | 'arena' 
  | 'panic';

interface NeoVisionHubProps {
  onOpenSection?: (section: string) => void;
  onOpenDirectPlayground?: () => void;
  currentTier?: PlanTier;
  onFeatureLocked?: (name: string, tier: PlanTier, desc?: string) => void;
  initialSection?: string | null;
  onNavigateTab?: (tab: EduTab) => void;
  academicXP?: number;
  adjustXP?: (delta: number) => void;
  currentGrade?: string;
}

export default function NeoVisionHub({
  onOpenSection,
  onOpenDirectPlayground,
  currentTier = 'starter',
  onFeatureLocked,
  initialSection = null,
  onNavigateTab,
  academicXP = 150,
  adjustXP,
  currentGrade = 'Grade 10'
}: NeoVisionHubProps) {
  const [activeTool, setActiveTool] = useState<NeoVisionToolId | null>(() => {
    if (initialSection && [
      'teacher', 'visualizer', 'scanner', 'lab', 'city', 'room', 'manga', 'arena', 'panic'
    ].includes(initialSection)) {
      return initialSection as NeoVisionToolId;
    }
    return null;
  });

  useEffect(() => {
    if (initialSection && [
      'teacher', 'visualizer', 'scanner', 'lab', 'city', 'room', 'manga', 'arena', 'panic'
    ].includes(initialSection)) {
      setActiveTool(initialSection as NeoVisionToolId);
    }
  }, [initialSection]);

  const futuristicTools = [
    {
      id: 'teacher' as const,
      title: 'Hologram Teacher',
      tagline: 'Interactive 3D Avatar Concept Coach',
      description: 'Engage with an intelligent AI tutor persona explaining difficult science concepts with animated speech.',
      icon: Bot,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-600'
    },
    {
      id: 'visualizer' as const,
      title: 'Formula Visualizer',
      tagline: 'Dynamic Mathematical Curves & Waves',
      description: 'Plot polynomial curves, parabolic trajectories, trigonometric waves, and harmonic oscillations in real-time.',
      icon: Sparkles,
      color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-600'
    },
    {
      id: 'scanner' as const,
      title: 'History Scanner',
      tagline: 'Physical Artifact & Era Telemetry',
      description: 'Scan everyday objects with your camera to trace ancient historical origins and civilizational evolution.',
      icon: Search,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600'
    },
    {
      id: 'lab' as const,
      title: 'Scientific Sandbox Lab',
      tagline: 'Molecular & Chemical Simulator',
      description: 'Mix virtual reagents, observe simulated exothermic reactions, and analyze reaction kinetics safely.',
      icon: FlaskConical,
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-600'
    },
    {
      id: 'city' as const,
      title: 'Study City Builder',
      tagline: 'Academic XP Sandbox Grid',
      description: 'Construct sustainable solar grids, science academies, and futuristic transit nodes by scoring quiz points.',
      icon: Star,
      color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-amber-600'
    },
    {
      id: 'room' as const,
      title: 'Dream Study Room',
      tagline: 'Personal Virtual Learning Haven',
      description: 'Customize a serene futuristic spatial study sanctuary with ambient lighting, lo-fi beats, and whiteboard desks.',
      icon: Home,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-600'
    },
    {
      id: 'manga' as const,
      title: 'Manga Generator',
      tagline: 'Illustrated Educational Comics',
      description: 'Transform complex historical events or biological cell processes into captivating educational manga comic strips.',
      icon: BookOpen,
      color: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/30 text-fuchsia-600'
    },
    {
      id: 'arena' as const,
      title: 'Study Battle Arena',
      tagline: 'Friendly AI Knowledge Duels',
      description: 'Compete in fast-paced curriculum quiz duels against AI cadet companions to sharpen rapid recall.',
      icon: Swords,
      color: 'from-violet-500/20 to-indigo-500/10 border-violet-500/30 text-violet-600'
    },
    {
      id: 'panic' as const,
      title: 'Exam Panic Shield',
      tagline: 'Stress Relief & Rapid Revision',
      description: 'Guided calming breathing rhythm, targeted high-yield cheat sheets, and cognitive reassurance.',
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-600'
    }
  ];

  // If a tool is active, render its interactive experience
  if (activeTool) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        {/* Navigation Bar Back to Hub */}
        <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTool(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to NeoVision Hub</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase">
              NeoVision {activeTool.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Render specific tool */}
        {activeTool === 'teacher' && <HologramTeacherView />}
        {activeTool === 'visualizer' && <FormulaVisualizerView />}
        {activeTool === 'scanner' && <HistoryScannerView />}
        {activeTool === 'lab' && <ScientificSandboxLabView />}
        {activeTool === 'city' && <StudyCityBuilderView academicXP={academicXP} adjustXP={adjustXP} />}
        {activeTool === 'room' && <DreamStudyRoomView />}
        {activeTool === 'manga' && <MangaGeneratorView />}
        {activeTool === 'arena' && <StudyBattleArenaView adjustXP={adjustXP} />}
        {activeTool === 'panic' && <ExamPanicShieldView />}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* NeoVision Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>NeoVision Futuristic Learning Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            NeoVision Interactive Studio
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            High-tech visual simulations, formula curve plotters, virtual chemistry sandbox, study city builders, and spatial learning tools.
          </p>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {futuristicTools.map((tool) => {
          const Icon = tool.icon;
          const access = canAccessFeature(currentTier, tool.id);
          const isLocked = !access.allowed;
          const requiredTier = access.requiredTier;

          const handleLaunch = () => {
            if (isLocked) {
              onFeatureLocked?.(tool.title, requiredTier, tool.description);
            } else {
              setActiveTool(tool.id);
            }
          };

          return (
            <div
              key={tool.id}
              className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between group ${
                isLocked ? 'border-slate-200/90 hover:border-purple-300' : 'border-slate-200/90 hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${tool.color} border flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isLocked && (
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                        requiredTier === 'pro'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        <Lock size={10} />
                        <span>{requiredTier.toUpperCase()}</span>
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                      Interactive
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-0.5 flex items-center gap-1.5">
                  <span>{tool.title}</span>
                  {isLocked && <Lock size={12} className="text-slate-400" />}
                </h3>
                <div className="text-[11px] font-medium text-indigo-600 mb-2">
                  {tool.tagline}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {tool.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLaunch}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  isLocked
                    ? 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 font-bold'
                }`}
              >
                {isLocked ? (
                  <>
                    <Lock size={12} className="text-purple-600" />
                    <span>Unlock with {PLANS[requiredTier]?.name || 'Pro'}</span>
                  </>
                ) : (
                  <>
                    <span>Launch {tool.title}</span>
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   1. HOLOGRAM TEACHER
   ========================================================================= */
function HologramTeacherView() {
  const topics = [
    {
      title: "Wave-Particle Duality",
      subject: "Quantum Physics",
      explanation: "Light and matter exhibit behaviors of both waves and particles simultaneously. In the double-slit experiment, individual electrons form an interference pattern when unobserved, but act as localized particles when measured.",
      keyFormula: "λ = h / p (de Broglie Wavelength)"
    },
    {
      title: "Chloroplast Light Reactions",
      subject: "Cellular Biology",
      explanation: "Within thylakoid membranes, chlorophyll pigments absorb photons to split water molecules (photolysis), releasing oxygen and synthesizing ATP and NADPH via electron transport chains.",
      keyFormula: "2H₂O + 2NADP⁺ + 3ADP + 3Pi + light → 2NADPH + 2H⁺ + 3ATP + O₂"
    },
    {
      title: "Plate Tectonics & Subduction",
      subject: "Earth Science",
      explanation: "The lithosphere is fragmented into tectonic plates gliding atop the asthenosphere. At convergent boundaries, denser oceanic crust descends beneath lighter continental crust, generating deep oceanic trenches and volcanic arcs.",
      keyFormula: "Velocity = Distance / Time (approx 2–10 cm/year)"
    }
  ];

  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentTopic = topics[selectedTopicIdx];

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${currentTopic.title}. ${currentTopic.explanation}`);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bot className="text-cyan-600" size={22} />
            <span>Hologram Concept Teacher</span>
          </h2>
          <p className="text-xs text-slate-500">
            Interactive AI Teacher avatar demonstrating core science principles
          </p>
        </div>

        <button
          type="button"
          onClick={handleSpeak}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            isSpeaking 
              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
              : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200'
          }`}
        >
          {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{isSpeaking ? 'Stop Voice Narration' : 'Listen to Explanation'}</span>
        </button>
      </div>

      {/* Hologram Avatar Graphic & Screen */}
      <div className="p-8 rounded-3xl bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
        {/* Animated Hologram Glow */}
        <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center relative shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <Bot size={44} className="text-cyan-300 animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-cyan-300/40 animate-ping opacity-25" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Virtual Instructor Nova
          </span>
          <h3 className="text-xl font-black text-white">
            {currentTopic.title}
          </h3>
          <span className="inline-block text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
            {currentTopic.subject}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-cyan-50 max-w-xl leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-cyan-500/20">
          {currentTopic.explanation}
        </p>

        <div className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/30">
          {currentTopic.keyFormula}
        </div>
      </div>

      {/* Select Topic */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Select Scientific Topic
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {topics.map((t, idx) => (
            <button
              key={t.title}
              type="button"
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setSelectedTopicIdx(idx);
              }}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                selectedTopicIdx === idx
                  ? 'bg-cyan-50/80 border-cyan-300 shadow-2xs font-bold text-cyan-950'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              <div className="text-xs font-bold truncate">{t.title}</div>
              <div className="text-[11px] text-slate-500">{t.subject}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. FORMULA VISUALIZER
   ========================================================================= */
function FormulaVisualizerView() {
  const [amplitude, setAmplitude] = useState(40);
  const [frequency, setFrequency] = useState(2);
  const [curveType, setCurveType] = useState<'sine' | 'parabola' | 'gaussian'>('sine');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw coordinate axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // X-axis
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    // Y-axis
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Draw curve
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const midY = height / 2;
    const midX = width / 2;

    for (let x = 0; x < width; x++) {
      const normalizedX = (x - midX) / 40;
      let yVal = 0;

      if (curveType === 'sine') {
        yVal = amplitude * Math.sin(normalizedX * frequency);
      } else if (curveType === 'parabola') {
        yVal = (amplitude / 8) * Math.pow(normalizedX, 2);
      } else if (curveType === 'gaussian') {
        yVal = amplitude * Math.exp(-Math.pow(normalizedX * (frequency / 2), 2));
      }

      const canvasY = midY - yVal;
      if (x === 0) ctx.moveTo(x, canvasY);
      else ctx.lineTo(x, canvasY);
    }
    ctx.stroke();
  }, [amplitude, frequency, curveType]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="text-teal-600" size={22} />
          <span>Dynamic Formula Visualizer</span>
        </h2>
        <p className="text-xs text-slate-500">
          Plot curves and waves in real-time with adjustable parameters
        </p>
      </div>

      {/* Canvas */}
      <div className="p-4 rounded-3xl bg-slate-900 flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={260}
          className="w-full max-w-full h-auto bg-slate-950 rounded-2xl border border-slate-800"
        />
        <div className="mt-2 text-xs font-mono text-cyan-300">
          {curveType === 'sine' && `y = ${amplitude} · sin(${frequency}x)`}
          {curveType === 'parabola' && `y = ${(amplitude / 8).toFixed(1)} · x²`}
          {curveType === 'gaussian' && `y = ${amplitude} · e^(-(${frequency / 2}x)²)`}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Equation Type
          </label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setCurveType('sine')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                curveType === 'sine' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
              }`}
            >
              Sine Wave
            </button>
            <button
              type="button"
              onClick={() => setCurveType('parabola')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                curveType === 'parabola' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
              }`}
            >
              Parabola
            </button>
            <button
              type="button"
              onClick={() => setCurveType('gaussian')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                curveType === 'gaussian' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
              }`}
            >
              Gaussian
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700 uppercase">
            <span>Amplitude (A)</span>
            <span className="font-mono text-indigo-600">{amplitude}</span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700 uppercase">
            <span>Frequency (ω)</span>
            <span className="font-mono text-indigo-600">{frequency}</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. HISTORY SCANNER
   ========================================================================= */
function HistoryScannerView() {
  const artifacts = [
    {
      name: "The Rosetta Stone",
      era: "196 BCE (Ptolemaic Dynasty)",
      discovery: "Found in 1799 CE near Rashid, Egypt",
      significance: "Bilingual decrees carved in Hieroglyphic, Demotic, and Ancient Greek enabled Jean-François Champollion to decipher ancient Egyptian hieroglyphs.",
      keyDate: "Deciphered 1822 CE"
    },
    {
      name: "Antikythera Mechanism",
      era: "c. 150–100 BCE (Hellenistic Greece)",
      discovery: "Retrieved in 1901 from an ancient shipwreck off Antikythera",
      significance: "World's earliest known mechanical analog computer, utilizing 30+ precision bronze gear wheels to predict astronomical positions and eclipses.",
      keyDate: "30+ Interlocking Gears"
    },
    {
      name: "Galileo's Refracting Telescope",
      era: "1609 CE (Padua, Italy)",
      discovery: "Built with convex objective and concave eyepiece (20x zoom)",
      significance: "Discovered Jupiter's 4 major moons (Io, Europa, Ganymede, Callisto), lunar craters, and Venusian phases, proving the heliocentric Copernican model.",
      keyDate: "Confirmed Heliocentrism"
    }
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const artifact = artifacts[selectedIdx];

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 800);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search className="text-amber-600" size={22} />
            <span>History & Artifact Telemetry Scanner</span>
          </h2>
          <p className="text-xs text-slate-500">
            Examine ancient artifacts and their scientific & historical origins
          </p>
        </div>

        <button
          type="button"
          onClick={triggerScan}
          className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors cursor-pointer"
        >
          Rescan Artifact
        </button>
      </div>

      {/* Lidar Scan Viewport */}
      <div className="p-8 rounded-3xl bg-linear-to-b from-slate-950 to-slate-900 text-white relative overflow-hidden flex flex-col items-center justify-center text-center space-y-3">
        {isScanning && (
          <div className="absolute inset-0 bg-amber-500/10 border-b-2 border-amber-400 animate-pulse pointer-events-none" />
        )}

        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300">
          <Search size={36} className={isScanning ? 'animate-spin' : ''} />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            Telemetry Classification: Historic Artifact
          </span>
          <h3 className="text-2xl font-black text-white">{artifact.name}</h3>
          <p className="text-xs text-amber-200 font-mono font-bold">{artifact.era}</p>
        </div>

        <p className="text-xs text-slate-300 max-w-lg leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          {artifact.significance}
        </p>

        <div className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-500/30">
          {artifact.discovery} &middot; {artifact.keyDate}
        </div>
      </div>

      {/* Artifact Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {artifacts.map((a, i) => (
          <button
            key={a.name}
            type="button"
            onClick={() => {
              setSelectedIdx(i);
              triggerScan();
            }}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedIdx === i
                ? 'bg-amber-50 border-amber-300 font-bold text-amber-950 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">{a.name}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{a.era}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   4. SCIENTIFIC SANDBOX LAB
   ========================================================================= */
function ScientificSandboxLabView() {
  const reactions = [
    {
      name: "Neutralization (HCl + NaOH)",
      equation: "HCl (aq) + NaOH (aq) → NaCl (aq) + H₂O (l)",
      type: "Exothermic Acid-Base",
      pH: 7.0,
      temp: "+12°C Rise",
      color: "bg-emerald-500",
      description: "Strong hydrochloric acid combines with sodium hydroxide base to yield harmless neutral salt and water."
    },
    {
      name: "Displacement (Fe + CuSO₄)",
      equation: "Fe (s) + CuSO₄ (aq) → FeSO₄ (aq) + Cu (s)",
      type: "Single Displacement Redox",
      pH: 4.5,
      temp: "+3°C Rise",
      color: "bg-amber-600",
      description: "More reactive metallic iron displaces copper from copper sulfate solution, depositing reddish copper coating."
    },
    {
      name: "Electrolysis of Water",
      equation: "2H₂O (l) → 2H₂ (g) + O₂ (g)",
      type: "Decomposition via Electric Current",
      pH: 7.0,
      temp: "Ambient",
      color: "bg-cyan-500",
      description: "Electric current breaks water molecules into hydrogen gas at the cathode and oxygen gas at the anode."
    }
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isReacting, setIsReacting] = useState(false);
  const currentReaction = reactions[selectedIdx];

  const triggerReaction = () => {
    setIsReacting(true);
    setTimeout(() => setIsReacting(false), 1200);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="text-rose-600" size={22} />
            <span>Scientific Sandbox Reaction Vessel</span>
          </h2>
          <p className="text-xs text-slate-500">
            Simulate chemical reactions and kinetic particle transformations
          </p>
        </div>

        <button
          type="button"
          onClick={triggerReaction}
          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
        >
          Ignite Reaction
        </button>
      </div>

      {/* Simulated Reaction Vessel */}
      <div className="p-8 rounded-3xl bg-linear-to-b from-slate-950 to-slate-900 text-white relative overflow-hidden flex flex-col items-center justify-center text-center space-y-4">
        {/* Animated Beaker Glow */}
        <div className="relative w-28 h-36 border-4 border-slate-600 rounded-b-3xl flex flex-col justify-end p-2 overflow-hidden bg-slate-950">
          <div 
            className={`w-full transition-all duration-700 rounded-b-2xl ${currentReaction.color} ${
              isReacting ? 'h-4/5 animate-pulse opacity-90' : 'h-1/2 opacity-75'
            }`}
          />
          {isReacting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl animate-bounce">🫧</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
            {currentReaction.type}
          </span>
          <h3 className="text-xl font-black text-white">{currentReaction.name}</h3>
          <div className="text-xs font-mono font-bold text-rose-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-rose-500/30">
            {currentReaction.equation}
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
          {currentReaction.description}
        </p>

        <div className="flex gap-4 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-bold">
            pH Level: {currentReaction.pH}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 font-bold">
            Temp Change: {currentReaction.temp}
          </span>
        </div>
      </div>

      {/* Select Reaction */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {reactions.map((r, idx) => (
          <button
            key={r.name}
            type="button"
            onClick={() => {
              setSelectedIdx(idx);
              triggerReaction();
            }}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedIdx === idx
                ? 'bg-rose-50 border-rose-300 font-bold text-rose-950 shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">{r.name}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{r.equation}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   5. STUDY CITY BUILDER
   ========================================================================= */
function StudyCityBuilderView({
  academicXP = 150,
  adjustXP
}: {
  academicXP: number;
  adjustXP?: (delta: number) => void;
}) {
  const buildingTypes = [
    { type: 'solar', label: 'Solar Array', icon: '☀️', cost: 20, boost: '+15 Clean Power' },
    { type: 'library', label: 'Tech Library', icon: '📚', cost: 30, boost: '+25 Research' },
    { type: 'observatory', label: 'Observatory', icon: '🔭', cost: 40, boost: '+40 Discovery' },
    { type: 'fusion', label: 'Fusion Reactor', icon: '⚡', cost: 50, boost: '+60 Energy' }
  ];

  const [selectedBuilding, setSelectedBuilding] = useState(buildingTypes[0]);
  const [cityGrid, setCityGrid] = useState<(string | null)[]>(() => {
    try {
      const saved = localStorage.getItem('neonova_city_grid_v1');
      return saved ? JSON.parse(saved) : Array(16).fill(null);
    } catch {
      return Array(16).fill(null);
    }
  });

  const handleCellClick = (index: number) => {
    if (cityGrid[index]) {
      // Remove building
      const next = [...cityGrid];
      next[index] = null;
      setCityGrid(next);
      try {
        localStorage.setItem('neonova_city_grid_v1', JSON.stringify(next));
      } catch {}
    } else {
      // Build
      const next = [...cityGrid];
      next[index] = selectedBuilding.icon;
      setCityGrid(next);
      adjustXP?.(5); // bonus for building!
      try {
        localStorage.setItem('neonova_city_grid_v1', JSON.stringify(next));
      } catch {}
    }
  };

  const totalBuildings = cityGrid.filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Star className="text-amber-500" size={22} />
            <span>Study City Builder Sandbox</span>
          </h2>
          <p className="text-xs text-slate-500">
            Expand your sustainable academic metropolis with your earned study XP
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl">
          Academic XP: {academicXP}
        </div>
      </div>

      {/* Buildings Picker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {buildingTypes.map((b) => (
          <button
            key={b.type}
            type="button"
            onClick={() => setSelectedBuilding(b)}
            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
              selectedBuilding.type === b.type
                ? 'bg-amber-50 border-amber-300 font-bold shadow-2xs text-amber-950'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="text-xl mb-1">{b.icon}</div>
            <div className="text-xs font-bold">{b.label}</div>
            <div className="text-[10px] text-slate-500">{b.boost}</div>
          </button>
        ))}
      </div>

      {/* 4x4 City Grid */}
      <div className="max-w-md mx-auto p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-inner">
        <div className="grid grid-cols-4 gap-2.5">
          {cityGrid.map((cell, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellClick(idx)}
              className="h-20 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 flex items-center justify-center text-3xl transition-all cursor-pointer shadow-2xs hover:scale-105"
              title={cell ? "Click to demolish" : "Click to build"}
            >
              {cell || <span className="text-slate-600 text-xs font-mono">+</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-2">
        <span>Constructed Structures: {totalBuildings} / 16</span>
        <span>Tap any placed tile to clear it.</span>
      </div>
    </div>
  );
}

/* =========================================================================
   6. DREAM STUDY ROOM
   ========================================================================= */
function DreamStudyRoomView() {
  const [theme, setTheme] = useState<'neon' | 'sunset' | 'forest'>('neon');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const toggleLoFiSound = () => {
    if (isPlayingAudio) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        // Generate gentle warm lo-fi chords
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setIsPlayingAudio(true);
      } catch {
        setIsPlayingAudio(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const themes = {
    neon: 'from-slate-950 via-indigo-950 to-slate-900 border-indigo-500/30 text-indigo-300',
    sunset: 'from-amber-950 via-rose-950 to-slate-950 border-amber-500/30 text-amber-300',
    forest: 'from-emerald-950 via-teal-950 to-slate-950 border-emerald-500/30 text-emerald-300'
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Home className="text-indigo-600" size={22} />
            <span>Dream Spatial Study Room</span>
          </h2>
          <p className="text-xs text-slate-500">
            Personal serene study sanctuary with ambient soundscapes and focus lights
          </p>
        </div>

        <button
          type="button"
          onClick={toggleLoFiSound}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            isPlayingAudio 
              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}
        >
          {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{isPlayingAudio ? 'Stop Lo-Fi Beats' : 'Play Ambient Lo-Fi'}</span>
        </button>
      </div>

      {/* Spatial Room Display */}
      <div className={`p-10 rounded-3xl bg-linear-to-b ${themes[theme]} border text-white text-center space-y-4 relative overflow-hidden transition-all duration-500`}>
        <div className="text-4xl animate-pulse">🌌</div>
        <h3 className="text-2xl font-black">Focus Sanctuary Active</h3>
        <p className="text-xs max-w-md mx-auto text-slate-300 leading-relaxed">
          Zero distractions. Ambient acoustic frequencies active to foster flow state and deep problem comprehension.
        </p>

        <div className="flex justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setTheme('neon')}
            className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
              theme === 'neon' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Cyber Violet
          </button>
          <button
            type="button"
            onClick={() => setTheme('sunset')}
            className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
              theme === 'sunset' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Sunset Amber
          </button>
          <button
            type="button"
            onClick={() => setTheme('forest')}
            className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
              theme === 'forest' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Emerald Forest
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   7. MANGA GENERATOR
   ========================================================================= */
function MangaGeneratorView() {
  const mangaStories = [
    {
      title: "Newton & The Cosmic Apple",
      concept: "Universal Law of Gravitation (F = G · m₁m₂ / r²)",
      panels: [
        { panel: 1, title: "An Apple Falls", dialogue: "Newton: 'Wait! Why did that apple fall straight down instead of floating into space?'" },
        { panel: 2, title: "The Cosmic Insight", dialogue: "Newton: 'Could the exact same force pulling this apple also tether the Moon in orbit around Earth?'" },
        { panel: 3, title: "Universal Law", dialogue: "Professor Stella: 'Yes! Every particle of matter attracts every other particle with force proportional to mass!'" },
        { panel: 4, title: "Calculus & Beyond", dialogue: "Newton: 'Gravity governs the entire celestial clockwork of the cosmos!'" }
      ]
    },
    {
      title: "Mitosis: The Epic Chromosome Split",
      concept: "Cellular Division (PMAT: Prophase, Metaphase, Anaphase, Telophase)",
      panels: [
        { panel: 1, title: "Prophase", dialogue: "Cadet Ren: 'The nuclear membrane dissolves! Chromatin condenses into distinct chromosomes!'" },
        { panel: 2, title: "Metaphase", dialogue: "Professor Stella: 'Spindle fibers attach to kinetochores! All chromosomes align at the equatorial plate!'" },
        { panel: 3, title: "Anaphase", dialogue: "Cadet Ren: 'They pull apart! Sister chromatids separate toward opposite poles!'" },
        { panel: 4, title: "Telophase", dialogue: "Both: 'Cytokinesis completes! Two genetically identical daughter cells are born!'" }
      ]
    }
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const story = mangaStories[selectedIdx];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-fuchsia-600" size={22} />
            <span>Manga Comic Strip Concept Explainer</span>
          </h2>
          <p className="text-xs text-slate-500">
            Learn tough textbook concepts through 4-panel illustrated comic narratives
          </p>
        </div>

        <div className="flex gap-2">
          {mangaStories.map((s, idx) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {idx === 0 ? "Gravity" : "Mitosis"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-black text-slate-900">{story.title}</h3>
        <p className="text-xs text-fuchsia-700 font-mono font-bold">{story.concept}</p>
      </div>

      {/* 4 Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {story.panels.map((p) => (
          <div
            key={p.panel}
            className="p-5 rounded-2xl bg-slate-900 text-white border-2 border-slate-800 relative space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-fuchsia-400 font-bold border-b border-slate-800 pb-1.5">
              <span>Panel {p.panel}</span>
              <span>{p.title}</span>
            </div>
            <p className="text-xs text-slate-100 leading-relaxed pt-1 italic">
              &quot;{p.dialogue}&quot;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   8. STUDY BATTLE ARENA
   ========================================================================= */
function StudyBattleArenaView({
  adjustXP
}: {
  adjustXP?: (delta: number) => void;
}) {
  const questions = [
    {
      q: "What is the SI unit of electric resistance?",
      options: ["Ohm (Ω)", "Tesla (T)", "Volt (V)", "Joule (J)"],
      correct: 0
    },
    {
      q: "Which organelle is considered the 'powerhouse of the cell'?",
      options: ["Ribosome", "Mitochondria", "Golgi Apparatus", "Vacuole"],
      correct: 1
    },
    {
      q: "What is the derivative of sin(x) with respect to x?",
      options: ["-cos(x)", "tan(x)", "cos(x)", "sec(x)"],
      correct: 2
    }
  ];

  const [currentQ, setCurrentQ] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);

    const isCorrect = idx === questions[currentQ].correct;
    if (isCorrect) setPlayerScore(prev => prev + 1);

    // Bot random accuracy (70% chance of correct)
    const botCorrect = Math.random() > 0.3;
    if (botCorrect) setBotScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setGameOver(true);
        if (isCorrect) adjustXP?.(25);
      }
    }, 1000);
  };

  const restartDuel = () => {
    setCurrentQ(0);
    setPlayerScore(0);
    setBotScore(0);
    setSelectedOption(null);
    setGameOver(false);
  };

  const q = questions[currentQ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Swords className="text-violet-600" size={22} />
            <span>Study Battle Arena: Cadet Orion Duel</span>
          </h2>
          <p className="text-xs text-slate-500">
            Speed recall duel against friendly AI cadet rival
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono font-bold text-xs">
          <span className="text-indigo-600">You: {playerScore}</span>
          <span>vs</span>
          <span className="text-rose-600">Orion: {botScore}</span>
        </div>
      </div>

      {!gameOver ? (
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-slate-500">
            Question {currentQ + 1} of {questions.length}
          </div>

          <h3 className="text-base font-bold text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {q.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options.map((opt, i) => {
              let btnClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
              if (selectedOption !== null) {
                if (i === q.correct) btnClass = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                else if (i === selectedOption) btnClass = "bg-rose-50 border-rose-400 text-rose-900 font-bold";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(i)}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-medium transition-all cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-4">
          <div className="text-4xl">{playerScore >= botScore ? "🏆" : "🤝"}</div>
          <h3 className="text-xl font-black">
            {playerScore > botScore ? "Victory! You defeated Cadet Orion!" : playerScore === botScore ? "It's a Tie Duel!" : "Cadet Orion took the lead! Try again!"}
          </h3>
          <p className="text-xs text-slate-300">
            Final Score: You {playerScore} &middot; Orion {botScore} (+25 XP Awarded!)
          </p>
          <button
            type="button"
            onClick={restartDuel}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Play Rematch
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   9. EXAM PANIC SHIELD
   ========================================================================= */
function ExamPanicShieldView() {
  const [phase, setPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');

  useEffect(() => {
    let timeout: any;
    const runCycle = () => {
      setPhase('Inhale (4s)');
      timeout = setTimeout(() => {
        setPhase('Hold (7s)');
        timeout = setTimeout(() => {
          setPhase('Exhale (8s)');
          timeout = setTimeout(runCycle, 8000);
        }, 7000);
      }, 4000);
    };
    runCycle();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="text-rose-600" size={22} />
          <span>Exam Panic Shield & Anti-Anxiety Protocol</span>
        </h2>
        <p className="text-xs text-slate-500">
          Guided 4-7-8 breathing pacer and high-yield panic revision checklist
        </p>
      </div>

      {/* Guided Breathing Circle */}
      <div className="p-10 rounded-3xl bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center text-center space-y-4">
        <div 
          className={`w-32 h-32 rounded-full border-4 border-rose-400 flex items-center justify-center text-sm font-black transition-all duration-1000 ${
            phase.startsWith('Inhale') ? 'scale-125 bg-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.4)]' :
            phase.startsWith('Hold') ? 'scale-125 bg-rose-500/30' :
            'scale-90 bg-slate-800'
          }`}
        >
          {phase}
        </div>

        <p className="text-xs text-rose-200 font-medium max-w-sm">
          Follow the circle rhythm. Deep abdominal breathing calms the autonomic nervous system and clears mental fog.
        </p>
      </div>

      {/* Emergency High-Yield Checklist */}
      <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
          Last-Minute Exam Golden Rules
        </h4>
        <ul className="text-xs text-rose-950 space-y-1.5 list-disc list-inside">
          <li><strong>Read the full question twice:</strong> Watch for words like <em>NOT, except, minimum, maximum</em>.</li>
          <li><strong>Units check:</strong> Ensure centimeters are converted to meters before calculating kinetic energy or force.</li>
          <li><strong>Never leave a question blank:</strong> Write given variables and formulas for partial credit.</li>
        </ul>
      </div>
    </div>
  );
}
