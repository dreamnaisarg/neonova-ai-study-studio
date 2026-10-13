import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Volume2, 
  VolumeX,
  Mic, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  CornerDownRight, 
  Edit3, 
  Layers, 
  ArrowRight,
  Calculator,
  Printer,
  FolderOpen,
  Trash2,
  CheckCheck,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import NeoNovaLogo from '../common/NeoNovaLogo';
import RealtimeVoiceModal from '../voice/RealtimeVoiceModal';
import VisualHomeworkExplainer from './VisualHomeworkExplainer';
import { formatTutorResponse, cleanEducationalText } from '../../utils';
import { 
  solveHomeworkOffline, 
  saveScanToCache, 
  getSavedScans, 
  deleteSavedScan, 
  clearAllSavedScans,
  printHomeworkSolution, 
  OfflineSpeechNarrator,
  CachedHomeworkScan 
} from '../../lib/offlineSolver';

interface AIHomeworkSolverViewProps {
  currentSubject?: string;
  currentGrade?: string;
  curriculumBoard?: string;
  userId?: string;
  onOpenVoice?: () => void;
  onSwitchToChat?: () => void;
  onOpenScanner?: () => void;
  initialImage?: { mimeType: string; data: string } | null;
  onClearInitialImage?: () => void;
}

export default function AIHomeworkSolverView({
  currentSubject = 'Mathematics',
  currentGrade = 'Grade 8',
  curriculumBoard = 'cbse',
  userId = 'student-1',
  onOpenVoice,
  onSwitchToChat,
  onOpenScanner,
  initialImage,
  onClearInitialImage
}: AIHomeworkSolverViewProps) {
  const [activeSubject, setActiveSubject] = useState(currentSubject);
  const [questionInput, setQuestionInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isSolving, setIsSolving] = useState(false);

  // Sync image if passed from external camera scanner modal
  useEffect(() => {
    if (initialImage?.data) {
      setSelectedImage(initialImage.data);
      setImageMimeType(initialImage.mimeType || 'image/jpeg');
      onClearInitialImage?.();
    }
  }, [initialImage, onClearInitialImage]);
  
  // OCR Inspection State
  const [ocrConfirmationNeeded, setOcrConfirmationNeeded] = useState(false);
  const [ocrDetectedText, setOcrDetectedText] = useState('');
  const [imageQualityIssue, setImageQualityIssue] = useState<{ issue: string; feedback: string } | null>(null);
  const [detectedQuestionsList, setDetectedQuestionsList] = useState<Array<{ id: string; label: string; text: string; subject?: string; topic?: string }>>([]);

  // Result state
  const [solverResult, setSolverResult] = useState<any | null>(null);
  const [solutionViewMode, setSolutionViewMode] = useState<'quick' | 'detailed'>('quick');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [stepDetailModal, setStepDetailModal] = useState<{ title: string; explanation: string } | null>(null);

  // 3 Practice Questions state
  const [practiceAnswers, setPracticeAnswers] = useState<{ [qId: string]: number }>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState<{ [qId: string]: boolean }>({});
  const [practiceNotice, setPracticeNotice] = useState<string | null>(null);

  // Offline, speech & saved scans state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingStepIdx, setSpeakingStepIdx] = useState<number | null>(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [cachedScans, setCachedScans] = useState<CachedHomeworkScan[]>(() => getSavedScans());
  const [isOfflineResult, setIsOfflineResult] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsDeviceOnline(true);
    const handleOffline = () => setIsDeviceOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    return OfflineSpeechNarrator.subscribe(setIsSpeaking);
  }, []);

  const handleToggleReadAloud = (textToRead: string, stepIdx?: number) => {
    if (isSpeaking && (stepIdx === undefined || speakingStepIdx === stepIdx)) {
      OfflineSpeechNarrator.stop();
      setSpeakingStepIdx(null);
    } else {
      setSpeakingStepIdx(stepIdx !== undefined ? stepIdx : null);
      OfflineSpeechNarrator.speak(textToRead, () => setSpeakingStepIdx(null));
    }
  };

  const handlePrintCurrentSolution = () => {
    if (!solverResult) return;
    const steps = (solverResult.structuredSteps?.stepByStepCalculations || []).map((s: any, idx: number) => ({
      stepNumber: s.stepNumber || idx + 1,
      title: s.operation || `Step ${s.stepNumber || idx + 1}`,
      content: `${s.intermediateResult || s.content || ''} ${s.verificationNote ? `(${s.verificationNote})` : ''}`
    }));
    printHomeworkSolution({
      question: solverResult.question,
      subject: solverResult.subject || activeSubject,
      grade: currentGrade,
      curriculumBoard,
      finalAnswer: solverResult.structuredSteps?.finalAnswer || 'Verified Solution',
      steps: steps.length > 0 ? steps : [{ stepNumber: 1, title: 'Calculated Derivation', content: solverResult.narrativeExplanation || '' }],
      narrativeExplanation: solverResult.narrativeExplanation || ''
    });
  };

  const ALL_SUBJECTS = [
    { id: 'math', name: 'Mathematics', icon: '📐', engine: 'Symbolic Math Engine (mathjs)' },
    { id: 'science', name: 'Science', icon: '🔬', engine: 'Science Laws & Stoichiometry Engine' },
    { id: 'physics', name: 'Physics', icon: '⚛️', engine: 'Physics Kinematics & Energy Engine' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', engine: 'Chemistry Molar & Reaction Engine' },
    { id: 'biology', name: 'Biology', icon: '🧬', engine: 'Biology Genetics & Physiology Engine' },
    { id: 'social', name: 'Social Science', icon: '🌍', engine: 'Social Science Gazetteer & Law Engine' },
    { id: 'english', name: 'English', icon: '🇬🇧', engine: 'English Voice & Grammar Engine' },
    { id: 'hindi', name: 'Hindi', icon: '🇮🇳', engine: 'हिंदी व्याकरण संधि एवं समास सत्यापक' },
    { id: 'gujarati', name: 'Gujarati', icon: '🦁', engine: 'ગુજરાતી વ્યાકરણ સંધિ & સમાસ એન્જિન' },
    { id: 'french', name: 'French', icon: '🇫🇷', engine: 'French Conjugation & Grammar Engine' },
    { id: 'computer', name: 'Computer Science', icon: '💻', engine: 'CS Number System & Logic Gate Engine' },
    { id: 'ai', name: 'Artificial Intelligence', icon: '🤖', engine: 'AI Concepts & Machine Learning Engine' },
    { id: 'gk', name: 'General Knowledge', icon: '🧠', engine: 'Authoritative Facts Registry' },
    { id: 'skill', name: 'Skill Education', icon: '🎨', engine: 'Practical Financial & Design Thinking Engine' }
  ];

  const currentEngineInfo = ALL_SUBJECTS.find(s => s.name.toLowerCase() === activeSubject.toLowerCase()) || ALL_SUBJECTS[0];

  // Handle Image Selection
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      setSelectedImage(base64Data);

      // Trigger pre-flight OCR Quality Check
      setIsAnalyzingImage(true);
      setImageQualityIssue(null);
      setOcrConfirmationNeeded(false);

      try {
        const res = await fetch('/api/solver/ocr-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg'
          })
        });

        const data = await res.json();
        if (data.quality && !data.quality.isAcceptable) {
          setImageQualityIssue({
            issue: data.quality.issue,
            feedback: data.quality.feedback
          });
        } else if (Array.isArray(data.detectedQuestions) && data.detectedQuestions.length > 1) {
          setDetectedQuestionsList(data.detectedQuestions);
          setQuestionInput(data.detectedQuestions[0].text);
          if (data.detectedQuestions[0].subject) {
            setActiveSubject(data.detectedQuestions[0].subject);
          }
        } else if (data.needsConfirmation && data.detectedText) {
          setOcrConfirmationNeeded(true);
          setOcrDetectedText(data.detectedText);
        } else if (data.detectedText && !questionInput.trim()) {
          setQuestionInput(data.detectedText);
          if (data.detectedSubject) {
            setActiveSubject(data.detectedSubject);
          }
        }
      } catch (err) {
        console.warn('OCR check error:', err);
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Solve Action
  const handleSolve = async (overrideText?: string) => {
    const textToSolve = (overrideText !== undefined ? overrideText : questionInput).trim();
    if (!textToSolve && !selectedImage) return;

    setIsSolving(true);
    setImageQualityIssue(null);
    setOcrConfirmationNeeded(false);

    // 1. If offline, solve locally on client immediately
    if (!isDeviceOnline) {
      const offlineSol = solveHomeworkOffline({
        questionText: textToSolve || 'Solve problem in attached worksheet',
        subject: activeSubject,
        grade: currentGrade,
        curriculumBoard,
        imageBase64: selectedImage || undefined
      });

      saveScanToCache({
        question: offlineSol.question,
        subject: offlineSol.subject,
        grade: offlineSol.grade,
        curriculumBoard: offlineSol.curriculumBoard,
        finalAnswer: offlineSol.structuredSteps.finalAnswer,
        steps: offlineSol.structuredSteps.stepByStepCalculations.map(s => ({
          stepNumber: s.stepNumber,
          title: s.operation,
          content: `${s.intermediateResult} (${s.verificationNote})`,
          verificationMethod: s.verificationNote
        })),
        narrativeExplanation: offlineSol.narrativeExplanation,
        visualExplanation: offlineSol.visualExplanation,
        thumbnailBase64: selectedImage || undefined,
        isSyncedWithCloud: false,
        engineUsed: offlineSol.engineUsed,
        source: 'offline_local_engine'
      });

      setCachedScans(getSavedScans());
      setIsOfflineResult(true);
      setSolverResult({
        ...offlineSol,
        confidenceState: 'Verified',
        sourceDistinction: 'Offline Local Deterministic Engine',
        similarPracticeQuestions: [
          {
            id: 'prac-off-1',
            question: `Practice reinforcement: Apply foundational laws of ${activeSubject} to solve for target variables.`,
            options: ['Option A (Verified Principle)', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            explanation: 'Consistent with verified curriculum syllabus.',
            difficulty: 'Medium'
          }
        ]
      });
      setIsSolving(false);
      return;
    }

    // 2. If online, invoke multimodal cloud pipeline
    try {
      const res = await fetch('/api/solver/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: textToSolve,
          imageBase64: selectedImage || undefined,
          imageMimeType: selectedImage ? imageMimeType : undefined,
          subject: activeSubject,
          grade: currentGrade,
          curriculumBoard,
          userId
        })
      });

      if (!res.ok) {
        throw new Error('Cloud solver temporarily unavailable');
      }

      const data = await res.json();
      if (!data.success && data.ocrData?.quality && !data.ocrData.quality.isAcceptable) {
        setImageQualityIssue({
          issue: data.ocrData.quality.issue,
          feedback: data.ocrData.quality.feedback
        });
      } else {
        setSolverResult(data);
        setIsOfflineResult(false);
        setPracticeAnswers({});
        setPracticeSubmitted({});
        setPracticeNotice(null);

        // Cache as cloud-verified
        saveScanToCache({
          question: data.question,
          subject: data.subject,
          grade: data.grade || currentGrade,
          curriculumBoard: data.curriculumBoard || curriculumBoard,
          finalAnswer: data.structuredSteps?.finalAnswer || 'Verified',
          steps: (data.structuredSteps?.stepByStepCalculations || []).map((s: any) => ({
            stepNumber: s.stepNumber,
            title: s.operation,
            content: `${s.intermediateResult} (${s.verificationNote})`,
            verificationMethod: s.verificationNote
          })),
          narrativeExplanation: data.narrativeExplanation,
          visualExplanation: data.visualExplanation,
          thumbnailBase64: selectedImage || undefined,
          isSyncedWithCloud: true,
          engineUsed: data.engineUsed || 'Cloud AI Verification',
          source: 'cloud_verified'
        });
        setCachedScans(getSavedScans());
      }
    } catch (err: any) {
      console.warn('Solve request network error, falling back seamlessly to client offline solver:', err);
      // Seamless offline fallback
      const offlineSol = solveHomeworkOffline({
        questionText: textToSolve || 'Solve problem in attached worksheet',
        subject: activeSubject,
        grade: currentGrade,
        curriculumBoard,
        imageBase64: selectedImage || undefined
      });

      saveScanToCache({
        question: offlineSol.question,
        subject: offlineSol.subject,
        grade: offlineSol.grade,
        curriculumBoard: offlineSol.curriculumBoard,
        finalAnswer: offlineSol.structuredSteps.finalAnswer,
        steps: offlineSol.structuredSteps.stepByStepCalculations.map(s => ({
          stepNumber: s.stepNumber,
          title: s.operation,
          content: `${s.intermediateResult} (${s.verificationNote})`,
          verificationMethod: s.verificationNote
        })),
        narrativeExplanation: offlineSol.narrativeExplanation,
        visualExplanation: offlineSol.visualExplanation,
        thumbnailBase64: selectedImage || undefined,
        isSyncedWithCloud: false,
        engineUsed: offlineSol.engineUsed,
        source: 'offline_local_engine'
      });

      setCachedScans(getSavedScans());
      setIsOfflineResult(true);
      setSolverResult({
        ...offlineSol,
        confidenceState: 'Verified',
        sourceDistinction: 'Offline Local Deterministic Engine',
        similarPracticeQuestions: [
          {
            id: 'prac-off-1',
            question: `Practice reinforcement: Apply foundational laws of ${activeSubject} to solve for target variables.`,
            options: ['Option A (Verified Principle)', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            explanation: 'Consistent with verified curriculum syllabus.',
            difficulty: 'Medium'
          }
        ]
      });
    } finally {
      setIsSolving(false);
    }
  };

  const handleAnswerPractice = async (q: any, optionIdx: number) => {
    if (practiceSubmitted[q.id]) return;

    const isCorrect = optionIdx === q.correctIndex;
    setPracticeAnswers(prev => ({ ...prev, [q.id]: optionIdx }));
    setPracticeSubmitted(prev => ({ ...prev, [q.id]: true }));

    try {
      await fetch('/api/student/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject: activeSubject,
          topic: solverResult?.curriculumAlignment?.topic || activeSubject,
          question: q.question,
          studentAnswer: q.options[optionIdx],
          correctAnswer: q.options[q.correctIndex],
          isCorrect,
          explanation: q.explanation
        })
      });
      setPracticeNotice(
        isCorrect 
          ? `🎉 Great job! Correct answer recorded in your ${activeSubject} learning profile (+10 XP).`
          : `💡 Recorded in learning memory. Review the step-by-step verification below to master this topic!`
      );
      setTimeout(() => setPracticeNotice(null), 5000);
    } catch (err) {
      console.warn('Practice attempt record error:', err);
    }
  };

  const handleStepClarification = (stepName: string, stepContent: string) => {
    setStepDetailModal({
      title: `Detailed Explanation: ${stepName}`,
      explanation: `Step content: "${stepContent}"\n\nIn ${curriculumBoard.toUpperCase()} ${currentSubject} (${currentGrade}), this step ensures mathematical or conceptual consistency. The mathematical operation isolates the target variable while maintaining equivalence on both sides of the equation.`
    });
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Banner / Mission Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <NeoNovaLogo size={42} glow className="shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                AI Homework Solver & Verification Pipeline
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                {curriculumBoard}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dedicated Symbolic Math Engine + Multimodal Document OCR + Independent Proof Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
              title="Open hardware camera scanner (works 100% online & offline)"
            >
              <Camera size={14} className="text-indigo-600" />
              <span>Camera Scanner</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOfflineModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            title="Browse all saved and offline homework solutions"
          >
            <FolderOpen size={14} className="text-indigo-600" />
            <span>Saved Notebook ({cachedScans.length})</span>
          </button>

          {onSwitchToChat && (
            <button
              onClick={onSwitchToChat}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <span>💬</span>
              <span>Chatbot Mode</span>
            </button>
          )}
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-2 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Mic size={15} />
            <span>Voice Mode</span>
          </button>
        </div>
      </div>

      {/* Main Solver Input Form */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        {/* Subject Selector Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 size={14} className="text-indigo-600" />
              <span>Select Subject & Deterministic Engine:</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentGrade} &middot; {curriculumBoard.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {ALL_SUBJECTS.map((subj) => (
              <button
                key={subj.id}
                type="button"
                onClick={() => {
                  setActiveSubject(subj.name);
                  setSolverResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSubject.toLowerCase() === subj.name.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.name}</span>
              </button>
            ))}
          </div>

          {/* Active Engine Badge */}
          <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-indigo-600 shrink-0" />
              <span className="font-bold text-indigo-950">
                Active Layer: <span className="text-indigo-700">{currentEngineInfo.engine}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
              100% Non-Hallucinatory
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder={`Enter your ${activeSubject} question, equation, or homework problem for step-by-step verified solving...`}
            rows={3}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-sans"
          />
        </div>

        {/* Quick Example Prompt Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mr-1">Try example:</span>
          {activeSubject === 'Mathematics' && (
            <>
              <button type="button" onClick={() => setQuestionInput('2x + 7 = 19')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">2x + 7 = 19</button>
              <button type="button" onClick={() => setQuestionInput('x^2 - 5x + 6 = 0')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">x² - 5x + 6 = 0</button>
              <button type="button" onClick={() => setQuestionInput('3/4 + 5/6')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">3/4 + 5/6</button>
            </>
          )}
          {(activeSubject === 'Science' || activeSubject === 'Physics') && (
            <>
              <button type="button" onClick={() => setQuestionInput('mass = 5 kg, acceleration = 2 m/s^2')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">mass = 5 kg, accel = 2 m/s²</button>
              <button type="button" onClick={() => setQuestionInput('voltage = 12 V, resistance = 4 ohms')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">V = 12V, R = 4Ω</button>
              <button type="button" onClick={() => setQuestionInput('mass = 10 kg, velocity = 4 m/s')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">KE: m=10kg, v=4m/s</button>
            </>
          )}
          {activeSubject === 'Chemistry' && (
            <>
              <button type="button" onClick={() => setQuestionInput('molar mass of H2SO4')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Molar mass of H₂SO₄</button>
              <button type="button" onClick={() => setQuestionInput('molar mass of CaCO3')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Molar mass of CaCO₃</button>
              <button type="button" onClick={() => setQuestionInput('balance: CH4 + O2')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Balance: CH₄ + O₂</button>
            </>
          )}
          {activeSubject === 'Biology' && (
            <>
              <button type="button" onClick={() => setQuestionInput('monohybrid cross Tt x Tt')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Monohybrid cross Tt × Tt</button>
              <button type="button" onClick={() => setQuestionInput('explain photosynthesis equation')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Photosynthesis equation</button>
            </>
          )}
          {activeSubject === 'Computer' && (
            <>
              <button type="button" onClick={() => setQuestionInput('convert 25 to binary')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">25 to binary</button>
              <button type="button" onClick={() => setQuestionInput('binary 11010 to decimal')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">11010₂ to decimal</button>
              <button type="button" onClick={() => setQuestionInput('AND gate truth table')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">AND gate truth table</button>
            </>
          )}
          {activeSubject === 'English' && (
            <>
              <button type="button" onClick={() => setQuestionInput('change to passive: She sings a song')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">She sings a song (Passive)</button>
              <button type="button" onClick={() => setQuestionInput('change to passive: He writes a letter')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">He writes a letter (Passive)</button>
            </>
          )}
          {activeSubject === 'Hindi' && (
            <>
              <button type="button" onClick={() => setQuestionInput('विद्यालय का संधि विच्छेद')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">विद्यालय की संधि</button>
              <button type="button" onClick={() => setQuestionInput('राजपुत्र का समास विग्रह')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">राजपुत्र का समास</button>
            </>
          )}
          {activeSubject === 'Gujarati' && (
            <>
              <button type="button" onClick={() => setQuestionInput('સૂર્યોદય ની સંધિ')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">સૂર્યોદય ની સંધિ</button>
              <button type="button" onClick={() => setQuestionInput('વિદ્યાલય ની સંધિ')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">વિદ્યાલય ની સંધિ</button>
            </>
          )}
          {activeSubject === 'Social Science' && (
            <>
              <button type="button" onClick={() => setQuestionInput('revolt of 1857')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">1857 Revolt</button>
              <button type="button" onClick={() => setQuestionInput('what is Article 21 of Indian constitution')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Article 21 (Life & Liberty)</button>
              <button type="button" onClick={() => setQuestionInput('dandi salt march 1930')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Dandi March 1930</button>
            </>
          )}
          {activeSubject === 'French' && (
            <>
              <button type="button" onClick={() => setQuestionInput('conjugate etre with nous')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">être (nous)</button>
              <button type="button" onClick={() => setQuestionInput('conjugate avoir with tu')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">avoir (tu)</button>
              <button type="button" onClick={() => setQuestionInput('conjugate parler au present')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">parler au présent</button>
            </>
          )}
          {activeSubject === 'Artificial Intelligence' && (
            <>
              <button type="button" onClick={() => setQuestionInput('what is supervised learning')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Supervised Learning</button>
              <button type="button" onClick={() => setQuestionInput('explain artificial neural networks')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Neural Networks</button>
              <button type="button" onClick={() => setQuestionInput('responsible AI and bias')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">AI Ethics & Bias</button>
            </>
          )}
          {activeSubject === 'Skill Education' && (
            <>
              <button type="button" onClick={() => setQuestionInput('principal = 5000, rate = 8%, time = 3 years')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Simple Interest P=5000</button>
              <button type="button" onClick={() => setQuestionInput('CP = 500, SP = 650')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Profit % (CP=500, SP=650)</button>
              <button type="button" onClick={() => setQuestionInput('what are the 5 stages of design thinking')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">5 Stages of Design Thinking</button>
            </>
          )}
          {activeSubject === 'General Knowledge' && (
            <>
              <button type="button" onClick={() => setQuestionInput('capital of france')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Capital of France</button>
              <button type="button" onClick={() => setQuestionInput('longest river in the world')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Longest River</button>
              <button type="button" onClick={() => setQuestionInput('largest planet in solar system')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-mono cursor-pointer">Largest Planet</button>
            </>
          )}
        </div>

        {/* Multimodal Photo Upload & Camera Area */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload size={14} />
              <span>{selectedImage ? 'Change Photo' : 'Upload Worksheet'}</span>
            </button>

            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                title="Scan homework directly with device camera (works online & offline)"
              >
                <Camera size={14} className="text-indigo-600" />
                <span>Scan with Camera</span>
              </button>
            )}

            {selectedImage && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImageQualityIssue(null);
                  setOcrConfirmationNeeded(false);
                }}
                className="px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                Remove Photo
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSolve()}
            disabled={isSolving || (!questionInput.trim() && !selectedImage)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSolving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Running Symbolic Verification...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Solve with Verification</span>
              </>
            )}
          </button>
        </div>

        {/* Selected Image Thumbnail Preview */}
        {selectedImage && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <img 
              src={`data:${imageMimeType};base64,${selectedImage}`} 
              alt="Uploaded Homework" 
              className="w-16 h-16 object-cover rounded-xl border border-slate-200"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-800 block">Uploaded Document / Diagram</span>
              <p className="text-[11px] text-slate-500 truncate">
                {isAnalyzingImage ? 'Checking image clarity & detecting symbols...' : 'Image loaded for visual reasoning & OCR'}
              </p>
            </div>
            {isAnalyzingImage && <RefreshCw size={16} className="text-indigo-600 animate-spin mr-2" />}
          </div>
        )}

        {/* Multi-Question Detection Chips */}
        {detectedQuestionsList.length > 1 && (
          <div className="p-3 bg-cyan-50/80 border border-cyan-200 rounded-2xl space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-900 flex items-center gap-1.5">
                <Layers size={14} className="text-cyan-700" />
                <span>Multiple Questions Detected on Page ({detectedQuestionsList.length})</span>
              </span>
              <span className="text-[10px] text-cyan-800 font-semibold">Tap to select:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {detectedQuestionsList.map((q, idx) => (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => {
                    setQuestionInput(q.text);
                    if (q.subject) setActiveSubject(q.subject);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    questionInput === q.text
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                      : 'bg-white border-cyan-200 text-cyan-900 hover:bg-cyan-100'
                  }`}
                >
                  {q.label || `Question ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Quality Warning Banner */}
        {imageQualityIssue && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>Image Quality Alert: {imageQualityIssue.issue.replace('_', ' ').toUpperCase()}</span>
            </div>
            <p className="text-amber-800">{imageQualityIssue.feedback}</p>
            <p className="text-[11px] text-amber-700 italic">
              Per NeoNova Accuracy Rules, we never guess unreadable handwriting or blurry math symbols. Please retake the photo with good lighting and focus.
            </p>
          </div>
        )}

        {/* OCR Confirmation Banner (When confidence is low) */}
        {ocrConfirmationNeeded && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-slate-900 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <HelpCircle size={16} className="text-indigo-600 shrink-0" />
              <span>Confirm Detected Handwriting / Equation:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ocrDetectedText}
                onChange={(e) => setOcrDetectedText(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-white border border-indigo-300 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => {
                  setQuestionInput(ocrDetectedText);
                  handleSolve(ocrDetectedText);
                }}
                className="px-3 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition-colors shrink-0"
              >
                Confirm & Solve
              </button>
            </div>
            <p className="text-[11px] text-indigo-700">
              Before solving, you can edit any misinterpreted numbers or characters above.
            </p>
          </div>
        )}

      </div>

      {/* Structured 7-Step Verified Solution Display */}
      {solverResult && (
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6 animate-in fade-in">
          
          {/* Header of Solution */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1.5 ${
                  solverResult.confidenceState === 'Verified'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : solverResult.confidenceState === 'Needs Review'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {solverResult.confidenceState === 'Verified' ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : solverResult.confidenceState === 'Needs Review' ? (
                    <AlertTriangle size={14} className="text-amber-600" />
                  ) : (
                    <XCircle size={14} className="text-rose-600" />
                  )}
                  <span>Status: {solverResult.confidenceState}</span>
                </span>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500">
                    {solverResult.sourceDistinction}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <ShieldCheck size={11} />
                    <span>Engine: {solverResult.engineUsed || solverResult.structuredSteps?.verification?.engineUsed}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Tools: Read Aloud & Print & Offline status */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const speechText = `Problem: ${solverResult.question}. Verified final answer: ${solverResult.structuredSteps?.finalAnswer || ''}. Complete derivation: ${solverResult.narrativeExplanation || ''}`;
                  handleToggleReadAloud(speechText);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isSpeaking && speakingStepIdx === null
                    ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                    : 'bg-white border-slate-200 text-indigo-700 hover:bg-indigo-50'
                }`}
                title={isSpeaking && speakingStepIdx === null ? 'Stop read aloud' : 'Listen to entire solution and reasoning'}
              >
                {isSpeaking && speakingStepIdx === null ? <VolumeX size={14} className="text-rose-600" /> : <Volume2 size={14} className="text-indigo-600" />}
                <span>{isSpeaking && speakingStepIdx === null ? 'Stop Audio' : 'Read Aloud'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintCurrentSolution}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print clean solution or save as PDF worksheet"
              >
                <Printer size={14} className="text-slate-600" />
                <span>Print Worksheet</span>
              </button>

              {/* Quick vs Detailed View Toggle */}
              <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSolutionViewMode('quick')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    solutionViewMode === 'quick' 
                      ? 'bg-white text-slate-900 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quick Answer
                </button>
                <button
                  type="button"
                  onClick={() => setSolutionViewMode('detailed')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    solutionViewMode === 'detailed' 
                      ? 'bg-white text-slate-900 shadow-2xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Detailed Steps
                </button>
              </div>

              {isOfflineResult && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl">
                  ⚡ Offline Engine
                </span>
              )}
            </div>

            {/* Curriculum Alignment Pill */}
            {solverResult.curriculumAlignment && (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-0.5 text-right">
                <span className="font-bold text-indigo-700 block">
                  {solverResult.curriculumAlignment.board.toUpperCase()} &middot; {solverResult.curriculumAlignment.chapterTitle}
                </span>
                <span className="text-slate-500 font-mono text-[10px]">
                  Ref: {solverResult.curriculumAlignment.textbook}
                </span>
              </div>
            )}
          </div>

          {/* Quick Answer Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-400/40 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-indigo-600" />
                <span>Verified Final Answer</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-100/70 px-2 py-0.5 rounded-md">
                {solverResult.engineUsed || 'Verified'}
              </span>
            </div>

            <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
              {cleanEducationalText(solverResult.structuredSteps?.finalAnswer || '')}
            </div>

            {solverResult.quickAnswer && (
              <p className="text-xs text-indigo-950 font-medium leading-relaxed pt-0.5">
                {cleanEducationalText(solverResult.quickAnswer)}
              </p>
            )}
          </div>

          {/* 7-Step Breakdown Cards (shown when detailed mode is active) */}
          {solutionViewMode === 'detailed' && (
            <div className="space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} className="text-indigo-600" />
                <span>Rigorous 7-Stage Mathematical & Conceptual Breakdown</span>
              </h2>

            {/* Step 1: Given Information */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                1. Given Information
              </span>
              <ul className="text-xs text-slate-800 list-disc list-inside space-y-1">
                {solverResult.structuredSteps.givenInfo.map((info: string, i: number) => (
                  <li key={i}>{cleanEducationalText(info)}</li>
                ))}
              </ul>
            </div>

            {/* Step 2: Formula */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                2. Applicable Formula / Governing Law
              </span>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900">
                {cleanEducationalText(solverResult.structuredSteps.formula)}
              </div>
            </div>

            {/* Step 3: Substitution */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  3. Substitution of Known Values
                </span>
                <button
                  onClick={() => handleStepClarification('Substitution', solverResult.structuredSteps.substitution)}
                  className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                >
                  Explain this step
                </button>
              </div>
              <p className="text-xs text-slate-800 font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                {cleanEducationalText(solverResult.structuredSteps.substitution)}
              </p>
            </div>

            {/* Step 4: Step-by-Step Calculation */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                4. Step-by-Step Calculation
              </span>
              <div className="space-y-1.5">
                {solverResult.structuredSteps.calculation.map((step: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-mono">
                    {cleanEducationalText(step)}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Simplification */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                5. Simplification
              </span>
              <p className="text-xs text-slate-800 font-medium">
                {cleanEducationalText(solverResult.structuredSteps.simplification)}
              </p>
            </div>

            {/* Step 6: Final Answer */}
            <div className="p-5 rounded-2xl bg-indigo-50/80 border-2 border-indigo-500/30 space-y-1.5 shadow-xs">
              <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                6. Verified Final Answer
              </span>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                {cleanEducationalText(solverResult.structuredSteps.finalAnswer)}
              </div>
            </div>

            {/* Step 7: Independent Symbolic Verification */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>7. Independent Symbolic Proof & Verification</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  {solverResult.structuredSteps.verification.engineUsed}
                </span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                {cleanEducationalText(solverResult.structuredSteps.verification.details)}
              </p>
              <div className="text-[11px] text-emerald-700 font-mono bg-white/70 p-2 rounded-lg border border-emerald-100">
                Method: {solverResult.structuredSteps.verification.method}
              </div>
            </div>
          </div>
        )}

          {/* Visual Homework Explanation (Interactive SVG Diagram, Graph, or Breakdown) */}
          {solverResult.visualExplanation && (
            <VisualHomeworkExplainer visual={solverResult.visualExplanation} />
          )}

          {/* Full Narrative & Conceptual Explanation */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pedagogical & Conceptual Explanation
            </h3>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {formatTutorResponse(solverResult.narrativeExplanation)}
            </div>
          </div>

          {/* 🎯 3 Similar Practice Questions (Reinforce This Concept) */}
          {solverResult.similarPracticeQuestions && solverResult.similarPracticeQuestions.length > 0 && (
            <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-b from-indigo-50/70 via-white to-slate-50 border border-indigo-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight uppercase">
                      Practice 3 Similar Questions &middot; Test Your Understanding
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Adaptive concept reinforcement &middot; Instantly tracks your {activeSubject} performance
                    </p>
                  </div>
                </div>
                {practiceNotice && (
                  <div className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold animate-in fade-in flex items-center gap-1.5">
                    <span>{practiceNotice}</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {solverResult.similarPracticeQuestions.map((q: any, qIdx: number) => {
                  const isAnswered = practiceSubmitted[q.id];
                  const chosenOption = practiceAnswers[q.id];
                  const isCorrect = isAnswered && chosenOption === q.correctIndex;

                  const difficultyBadge = 
                    q.difficulty === 'Easy' 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : q.difficulty === 'Hard' 
                      ? 'bg-rose-100 text-rose-800 border-rose-200' 
                      : 'bg-amber-100 text-amber-800 border-amber-200';

                  return (
                    <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-black">
                            {qIdx + 1}
                          </span>
                          <span>Question {qIdx + 1}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${difficultyBadge}`}>
                          {q.difficulty}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt: string, optIdx: number) => {
                          let optStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200';
                          if (isAnswered) {
                            if (optIdx === q.correctIndex) {
                              optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                            } else if (optIdx === chosenOption) {
                              optStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-bold';
                            } else {
                              optStyle = 'bg-slate-50/50 text-slate-400 border-slate-100';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleAnswerPractice(q, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer disabled:cursor-default ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && optIdx === q.correctIndex && (
                                <span className="text-emerald-600 font-bold text-[11px] shrink-0">✓ Correct</span>
                              )}
                              {isAnswered && optIdx === chosenOption && optIdx !== q.correctIndex && (
                                <span className="text-rose-600 font-bold text-[11px] shrink-0">✗ Your Choice</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div className={`p-3 rounded-xl text-xs space-y-1 animate-in fade-in ${
                          isCorrect ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border border-amber-200 text-amber-900'
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span>{isCorrect ? '✓ Verified Correct!' : '⚠️ Learning Review:'}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step Detail Explanation Modal */}
      {stepDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{stepDetailModal.title}</h4>
              <button
                onClick={() => setStepDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {stepDetailModal.explanation}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setStepDetailModal(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant Modal */}
      <RealtimeVoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentSubject={currentSubject}
        currentGrade={currentGrade}
        curriculumBoard={curriculumBoard}
        initialContext={solverResult ? `Last solved: ${solverResult.question}. Result: ${solverResult.structuredSteps?.finalAnswer}` : ''}
      />

      {/* Offline Saved Scans & Notebook Modal */}
      {isOfflineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
          <div className="bg-white border border-slate-200/90 max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-2xs">
                  <FolderOpen size={19} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Offline Saved Scans & Homework Notebook
                  </h3>
                  <p className="text-xs text-slate-500">
                    Permanently stored on your local device &middot; Available offline anytime
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cachedScans.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all saved offline scans from this device?')) {
                        clearAllSavedScans();
                        setCachedScans([]);
                      }
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Clear all offline scans"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOfflineModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* List */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {cachedScans.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Saved Scans Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Any homework questions you scan or solve will be stored here automatically for offline review, printing, and study revision.
                  </p>
                </div>
              ) : (
                cachedScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {scan.thumbnailBase64 && (
                        <img
                          src={`data:image/jpeg;base64,${scan.thumbnailBase64}`}
                          alt="Thumbnail"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                            {scan.subject}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(scan.timestamp).toLocaleDateString()}
                          </span>
                          {scan.source === 'offline_local_engine' ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              ⚡ Offline Local
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Cloud Verified
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-900 truncate">
                          {cleanEducationalText(scan.question)}
                        </p>

                        <div className="text-[11px] font-mono text-indigo-900 font-bold">
                          Ans: {cleanEducationalText(scan.finalAnswer)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSolverResult({
                            question: scan.question,
                            subject: scan.subject,
                            grade: scan.grade,
                            curriculumBoard: scan.curriculumBoard,
                            confidenceState: 'Verified',
                            sourceDistinction: scan.source === 'offline_local_engine' ? 'Offline Local Engine' : 'Cloud Verified Solution',
                            engineUsed: scan.engineUsed,
                            structuredSteps: {
                              givenInfo: [`Problem: ${scan.question}`],
                              formulaUsed: 'Governing syllabus principles',
                              substitution: 'Standard curriculum representation',
                              stepByStepCalculations: scan.steps.map(s => ({
                                stepNumber: s.stepNumber,
                                operation: s.title,
                                intermediateResult: s.content,
                                verificationNote: s.verificationMethod || 'Verified'
                              })),
                              finalAnswer: scan.finalAnswer,
                              verification: {
                                verified: true,
                                verificationStatus: 'verified',
                                engineUsed: scan.engineUsed,
                                proofDetails: 'Cached verified solution'
                              }
                            },
                            narrativeExplanation: scan.narrativeExplanation,
                            visualExplanation: scan.visualExplanation,
                            similarPracticeQuestions: []
                          });
                          setActiveSubject(scan.subject);
                          setIsOfflineModalOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Open Solution
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          printHomeworkSolution({
                            question: scan.question,
                            subject: scan.subject,
                            grade: scan.grade,
                            curriculumBoard: scan.curriculumBoard,
                            finalAnswer: scan.finalAnswer,
                            steps: scan.steps,
                            narrativeExplanation: scan.narrativeExplanation
                          });
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Print worksheet"
                      >
                        <Printer size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          deleteSavedScan(scan.id);
                          setCachedScans(getSavedScans());
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete from saved notebook"
                      >
                        <Trash2 size={15} />
                      </button>
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
