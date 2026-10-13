import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  RotateCw, 
  RotateCcw,
  Crop, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Edit3, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Printer,
  Wifi,
  WifiOff,
  CheckCheck,
  Zap,
  ZapOff,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Copy,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import VisualHomeworkExplainer, { VisualExplanationData } from '../homework/VisualHomeworkExplainer';
import { formatTutorResponse, cleanEducationalText } from '../../utils';
import { 
  solveHomeworkOffline, 
  saveScanToCache, 
  printHomeworkSolution, 
  OfflineSpeechNarrator 
} from '../../lib/offlineSolver';
import { 
  processAndEnhanceImage, 
  EnhancementFilter, 
  getCameraCapabilities, 
  toggleTorch 
} from '../../lib/imageEnhancer';
import { DetectedQuestionItem } from '../../server/ocrVisionEngine';

interface OpticHomeworkScannerProps {
  onCaptureImage: (base64Data: string, mimeType: string) => void;
  onClose: () => void;
  currentSubject?: string;
  currentGrade?: string;
  curriculumBoard?: string;
}

type ScannerStep = 
  | 'capture' 
  | 'edit_crop' 
  | 'analyzing' 
  | 'quality_warning' 
  | 'multi_question_select'
  | 'recognized' 
  | 'solving' 
  | 'solved';

export interface ScannedPageItem {
  id: string;
  thumbnail: string;
  dataUrl: string;
  timestamp: number;
}

export default function OpticHomeworkScanner({ 
  onCaptureImage, 
  onClose,
  currentSubject = 'Mathematics',
  currentGrade = 'Grade 8',
  curriculumBoard = 'cbse'
}: OpticHomeworkScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Camera stream & hardware states
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [step, setStep] = useState<ScannerStep>('capture');
  
  // Continuous scanning reel (multi-page session support)
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [scannedPages, setScannedPages] = useState<ScannedPageItem[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Active Working Image
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [tiltDegrees, setTiltDegrees] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<EnhancementFilter>('document');
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(10);
  
  // Crop margins (in percentage 0 - 50)
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [cropPreset, setCropPreset] = useState<'full' | 'top' | 'bottom' | 'center' | 'custom'>('full');

  // Processed output preview
  const [processedImage, setProcessedImage] = useState<{ base64: string; mimeType: string; dataUrl: string } | null>(null);

  // Multi-stage analysis progress messaging
  const [analysisStageText, setAnalysisStageText] = useState('Improving image clarity...');
  const [solvingStageText, setSolvingStageText] = useState('Reading your question...');

  // OCR and Solution states
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [detectedQuestionsList, setDetectedQuestionsList] = useState<DetectedQuestionItem[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [editableQuestion, setEditableQuestion] = useState('');
  const [detectedSubject, setDetectedSubject] = useState(currentSubject);
  const [selectedGrade, setSelectedGrade] = useState(currentGrade);
  const [qualityFeedback, setQualityFeedback] = useState('');
  const [uncertainNotations, setUncertainNotations] = useState<string[]>([]);
  
  // Solved state & Solution mode toggle
  const [solverResult, setSolverResult] = useState<any | null>(null);
  const [solutionViewMode, setSolutionViewMode] = useState<'quick' | 'detailed'>('quick');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Offline, speech & export states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOfflineEngineUsed, setIsOfflineEngineUsed] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Network listener
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

  // Offline speech narration subscriber
  useEffect(() => {
    return OfflineSpeechNarrator.subscribe(setIsSpeaking);
  }, []);

  // Stop active camera stream tracks
  const stopActiveStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
    setIsTorchSupported(false);
  }, []);

  // Request camera permissions with fallback constraints
  const requestCameraPermission = useCallback(async (targetFacing: 'environment' | 'user' = facingMode) => {
    stopActiveStream();
    setCameraState('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920, max: 2560 },
          height: { ideal: 1080, max: 1440 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check hardware torch support
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const caps = await getCameraCapabilities(videoTrack);
        setIsTorchSupported(caps.supportsTorch);
      }

      setCameraState('active');
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: targetFacing },
          audio: false
        });
        mediaStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setCameraState('active');
      } catch {
        setCameraState('denied');
      }
    }
  }, [facingMode, stopActiveStream]);

  // Mount camera initialization and unmount cleanup
  useEffect(() => {
    requestCameraPermission('environment');
    return () => {
      stopActiveStream();
      OfflineSpeechNarrator.stop();
    };
  }, [requestCameraPermission, stopActiveStream]);

  // Flip camera front/back
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    requestCameraPermission(nextMode);
  };

  // Toggle Hardware Torch / Flashlight
  const handleToggleTorch = async () => {
    const videoTrack = mediaStreamRef.current?.getVideoTracks()[0];
    if (videoTrack && isTorchSupported) {
      const nextState = !isTorchOn;
      const success = await toggleTorch(videoTrack, nextState);
      if (success) {
        setIsTorchOn(nextState);
      }
    }
  };

  // Apply crop preset
  const handleApplyCropPreset = (preset: 'full' | 'top' | 'bottom' | 'center' | 'custom') => {
    setCropPreset(preset);
    if (preset === 'full') {
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
    } else if (preset === 'top') {
      setCropTop(0);
      setCropBottom(48);
      setCropLeft(2);
      setCropRight(2);
    } else if (preset === 'bottom') {
      setCropTop(48);
      setCropBottom(0);
      setCropLeft(2);
      setCropRight(2);
    } else if (preset === 'center') {
      setCropTop(20);
      setCropBottom(20);
      setCropLeft(10);
      setCropRight(10);
    }
  };

  // Capture photo from live video stream
  const handleCaptureFromVideo = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const vw = video.videoWidth || 1280;
      const vh = video.videoHeight || 720;
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        // If continuous multi-page mode is enabled, add to reel and keep camera active
        if (isContinuousMode) {
          const newPage: ScannedPageItem = {
            id: `page-${Date.now()}`,
            thumbnail: dataUrl,
            dataUrl,
            timestamp: Date.now()
          };
          setScannedPages(prev => [...prev, newPage]);
          setActivePageIndex(scannedPages.length);
          // Optional sound / vibration feedback
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(40);
          }
          return;
        }

        // Single capture mode
        stopActiveStream();
        setOriginalImage(dataUrl);
        setRotationDegrees(0);
        setTiltDegrees(0);
        handleApplyCropPreset('full');
        setStep('edit_crop');
      }
    }
  };

  // Select a captured page from continuous scanning reel to edit and solve
  const handleSelectPageFromReel = (page: ScannedPageItem, index: number) => {
    setActivePageIndex(index);
    stopActiveStream();
    setOriginalImage(page.dataUrl);
    setRotationDegrees(0);
    setTiltDegrees(0);
    handleApplyCropPreset('full');
    setStep('edit_crop');
  };

  // Upload image from disk or photo library
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image format
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          stopActiveStream();
          setOriginalImage(result);
          setRotationDegrees(0);
          setTiltDegrees(0);
          handleApplyCropPreset('full');
          setStep('edit_crop');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotateCw = () => {
    setRotationDegrees(prev => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    setRotationDegrees(prev => (prev - 90 + 360) % 360);
  };

  const handleResetAdjustments = () => {
    setRotationDegrees(0);
    setTiltDegrees(0);
    setActiveFilter('document');
    setBrightness(0);
    setContrast(10);
    handleApplyCropPreset('full');
  };

  const handleRetake = () => {
    setOriginalImage(null);
    setOcrResult(null);
    setDetectedQuestionsList([]);
    setSolverResult(null);
    setEditableQuestion('');
    setUncertainNotations([]);
    setStep('capture');
    requestCameraPermission(facingMode);
  };

  // Generate processed and enhanced image via client-side canvas engine
  const generateProcessedImage = async (): Promise<{ base64: string; mimeType: string; dataUrl: string } | null> => {
    if (!originalImage) return null;

    try {
      const res = await processAndEnhanceImage(originalImage, {
        filter: activeFilter,
        rotationDegrees,
        tiltDegrees,
        brightness,
        contrast,
        cropPercentages: {
          top: cropTop,
          bottom: cropBottom,
          left: cropLeft,
          right: cropRight
        },
        maxDimension: 1600
      });
      return {
        base64: res.base64,
        mimeType: res.mimeType,
        dataUrl: res.dataUrl
      };
    } catch (e) {
      console.error('Image enhancement error:', e);
      return null;
    }
  };

  // Run Quality Assessment & Multi-Question OCR Analysis
  const handleProceedToAnalyze = async () => {
    setErrorMessage(null);
    setStep('analyzing');
    setAnalysisStageText('Improving image clarity & contrast...');

    const processed = await generateProcessedImage();
    if (!processed) {
      setErrorMessage('Could not process image. Please try again.');
      setStep('edit_crop');
      return;
    }
    setProcessedImage(processed);

    // Progressive stage feedback
    const stageTimer1 = setTimeout(() => {
      setAnalysisStageText('Reading your question & mathematical notation...');
    }, 1200);

    const stageTimer2 = setTimeout(() => {
      setAnalysisStageText('Detecting question boundaries & diagrams...');
    }, 2800);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const res = await fetch('/api/solver/ocr-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: processed.base64,
          mimeType: processed.mimeType
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);

        // Quality check
        if (data.quality && !data.quality.isAcceptable) {
          setQualityFeedback(
            data.quality?.feedback ||
            'The question in this photo is unclear, cut off, or too dark. Please align and retake.'
          );
          setStep('quality_warning');
          return;
        }

        // Multi-question detection
        if (Array.isArray(data.detectedQuestions) && data.detectedQuestions.length > 1) {
          setDetectedQuestionsList(data.detectedQuestions);
          setSelectedQuestionIndex(0);
          setEditableQuestion(data.detectedQuestions[0].text);
          if (data.detectedQuestions[0].subject) {
            setDetectedSubject(data.detectedQuestions[0].subject);
          }
          setStep('multi_question_select');
          return;
        }

        // Single question detection
        if (data.detectedText && data.detectedText.trim()) {
          setEditableQuestion(data.detectedText.trim());
        }
        if (data.detectedSubject) {
          setDetectedSubject(data.detectedSubject);
        }
        if (Array.isArray(data.uncertainParts) && data.uncertainParts.length > 0) {
          setUncertainNotations(data.uncertainParts);
        }
        setIsOfflineEngineUsed(false);
        setStep('recognized');
        return;
      }
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.info('Switching to local offline OCR fallback:', err?.message || err);
    }

    // Offline fallback: preserve student question if already typed or use friendly prompt
    setIsOfflineEngineUsed(true);
    if (!editableQuestion.trim()) {
      setEditableQuestion('Solve the equation or question shown in the worksheet');
    }
    setStep('recognized');
  };

  // Solve the verified question with multi-stage reasoning
  const handleSolveQuestion = async () => {
    setErrorMessage(null);
    setStep('solving');
    setSolvingStageText('Routing to verified subject reasoning engine...');

    const textToSolve = editableQuestion.trim() || 'Solve the question in the uploaded worksheet';

    const stageTimer1 = setTimeout(() => {
      setSolvingStageText('Checking calculations & independent verification...');
    }, 1500);

    const stageTimer2 = setTimeout(() => {
      setSolvingStageText('Preparing step-by-step student explanation...');
    }, 3200);

    // 1. If offline, use client-side verified offline solver
    if (!isDeviceOnline) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      const offlineSol = solveHomeworkOffline({
        questionText: textToSolve,
        subject: detectedSubject,
        grade: selectedGrade,
        curriculumBoard,
        imageBase64: processedImage?.base64
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
        thumbnailBase64: processedImage?.base64,
        isSyncedWithCloud: false,
        engineUsed: offlineSol.engineUsed,
        source: 'offline_local_engine'
      });

      setIsOfflineEngineUsed(true);
      setIsSavedLocally(true);
      setSolverResult(offlineSol);
      setStep('solved');
      return;
    }

    // 2. Online cloud verified solver
    try {
      const res = await fetch('/api/solver/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: textToSolve,
          imageBase64: processedImage?.base64,
          imageMimeType: processedImage?.mimeType,
          subject: detectedSubject,
          grade: selectedGrade,
          curriculumBoard
        })
      });
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (!res.ok) {
        throw new Error('Cloud solver request failed');
      }

      const data = await res.json();
      setSolverResult(data);
      setIsOfflineEngineUsed(false);

      // Save to cache as cloud-verified
      saveScanToCache({
        question: data.question,
        subject: data.subject,
        grade: data.grade || selectedGrade,
        curriculumBoard: data.curriculumBoard || curriculumBoard,
        finalAnswer: data.structuredSteps?.finalAnswer || 'Verified',
        steps: (data.structuredSteps?.calculation || []).map((s: string, idx: number) => ({
          stepNumber: idx + 1,
          title: `Step ${idx + 1}`,
          content: s,
          verificationMethod: data.structuredSteps?.verification?.method || 'Verified'
        })),
        narrativeExplanation: data.narrativeExplanation,
        visualExplanation: data.visualExplanation,
        thumbnailBase64: processedImage?.base64,
        isSyncedWithCloud: true,
        engineUsed: data.engineUsed || 'Cloud AI Verification',
        source: 'cloud_verified'
      });
      setIsSavedLocally(true);
      setStep('solved');
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.warn('Falling back to local offline solver engine:', err);
      const offlineSol = solveHomeworkOffline({
        questionText: textToSolve,
        subject: detectedSubject,
        grade: selectedGrade,
        curriculumBoard,
        imageBase64: processedImage?.base64
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
        thumbnailBase64: processedImage?.base64,
        isSyncedWithCloud: false,
        engineUsed: offlineSol.engineUsed,
        source: 'offline_local_engine'
      });

      setIsOfflineEngineUsed(true);
      setIsSavedLocally(true);
      setSolverResult(offlineSol);
      setStep('solved');
    }
  };

  // Toggle Speech Narration
  const handleToggleReadAloud = () => {
    if (isSpeaking) {
      OfflineSpeechNarrator.stop();
    } else if (solverResult) {
      const speechText = `Question: ${solverResult.question}. Final answer: ${solverResult.structuredSteps?.finalAnswer || ''}. Explanation: ${solverResult.narrativeExplanation || ''}`;
      OfflineSpeechNarrator.speak(speechText);
    }
  };

  // Printable Worksheet Export
  const handlePrintSolution = () => {
    if (!solverResult) return;
    const steps = (solverResult.structuredSteps?.calculation || []).map((s: string, idx: number) => ({
      stepNumber: idx + 1,
      title: `Step ${idx + 1}`,
      content: s
    }));
    printHomeworkSolution({
      question: solverResult.question,
      subject: solverResult.subject || detectedSubject,
      grade: selectedGrade,
      curriculumBoard,
      finalAnswer: solverResult.structuredSteps?.finalAnswer || 'Verified',
      steps: steps.length > 0 ? steps : [{ stepNumber: 1, title: 'Calculated Derivation', content: solverResult.narrativeExplanation || '' }],
      narrativeExplanation: solverResult.narrativeExplanation || ''
    });
  };

  // Copy final answer
  const handleCopyAnswer = () => {
    if (solverResult?.structuredSteps?.finalAnswer) {
      navigator.clipboard.writeText(solverResult.structuredSteps.finalAnswer);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  // Send to AI Homework Workspace
  const handleUseInNotebook = () => {
    if (processedImage) {
      onCaptureImage(processedImage.base64, processedImage.mimeType);
      onClose();
    }
  };

  return (
    <div 
      id="optic-homework-scanner-modal" 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm font-sans overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={filePickerRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      <div className="bg-white border border-slate-200/90 max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[94vh]">
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-600 font-bold shadow-2xs">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  NeoNova Smart AI Scanner
                </h3>
                <span className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                  <span>{isDeviceOnline ? 'AI Vision & Symbolic Engine' : 'Offline Math Engine'}</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Capture worksheets, textbook pages, equations & diagrams with automated enhancement.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close scanner"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================
              STEP 1: LIVE CAMERA CAPTURE / CONTINUOUS SCANNING
              ======================================================== */}
          {step === 'capture' && (
            <div className="space-y-4">
              {/* Camera Viewfinder Viewport */}
              <div className="relative rounded-2xl bg-slate-950 aspect-4/3 sm:aspect-16/10 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                {cameraState === 'active' ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center mx-auto">
                      <Camera size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 font-bold">
                        {cameraState === 'requesting' ? 'Requesting Camera Access...' : 'Camera Access Needed'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Allow camera permissions to scan workbook questions, or upload any worksheet photo below.
                      </p>
                    </div>
                    {cameraState === 'denied' && (
                      <button
                        type="button"
                        onClick={() => requestCameraPermission(facingMode)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Retry Camera Permission
                      </button>
                    )}
                  </div>
                )}

                {/* Overlaid Viewfinder Target Frame */}
                {cameraState === 'active' && (
                  <div className="absolute inset-0 pointer-events-none p-6 sm:p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 border-t-3 border-l-3 border-cyan-400 rounded-tl-lg"></div>
                      <span className="text-[10px] font-mono font-bold text-white bg-slate-900/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                        {isContinuousMode ? 'Continuous Mode • Snap Pages' : 'Align Question in Frame'}
                      </span>
                      <div className="w-8 h-8 border-t-3 border-r-3 border-cyan-400 rounded-tr-lg"></div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="w-8 h-8 border-b-3 border-l-3 border-cyan-400 rounded-bl-lg"></div>
                      <div className="w-8 h-8 border-b-3 border-r-3 border-cyan-400 rounded-br-lg"></div>
                    </div>
                  </div>
                )}

                {/* Top Corner Quick Camera Controls */}
                {cameraState === 'active' && (
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {isTorchSupported && (
                      <button
                        type="button"
                        onClick={handleToggleTorch}
                        className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                          isTorchOn 
                            ? 'bg-amber-400 text-slate-950 shadow-md' 
                            : 'bg-slate-900/60 text-white hover:bg-slate-900/90'
                        }`}
                        title={isTorchOn ? 'Turn off flash' : 'Turn on flash'}
                      >
                        {isTorchOn ? <Zap size={16} /> : <ZapOff size={16} />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md transition-all cursor-pointer"
                      title="Flip camera"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Multi-Page Continuous Scanning Reel (if pages captured) */}
              {scannedPages.length > 0 && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers size={14} className="text-cyan-600" />
                      <span>Captured Pages Reel ({scannedPages.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Tap a page to edit & solve</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {scannedPages.map((page, idx) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => handleSelectPageFromReel(page, idx)}
                        className={`shrink-0 relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          activePageIndex === idx ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-slate-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={page.thumbnail} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-mono px-1 rounded">
                          P{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Controls Bar */}
              <div className="flex flex-wrap items-center gap-2.5">
                {cameraState === 'active' && (
                  <button
                    type="button"
                    onClick={handleCaptureFromVideo}
                    className="flex-1 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Camera size={18} />
                    <span>{isContinuousMode ? 'Snap Next Page' : 'Capture Question'}</span>
                  </button>
                )}

                {/* Continuous Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setIsContinuousMode(prev => !prev)}
                  className={`py-3 px-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isContinuousMode 
                      ? 'bg-violet-50 border-violet-300 text-violet-700 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Scan multiple pages continuously"
                >
                  <Layers size={16} className={isContinuousMode ? 'text-violet-600' : 'text-slate-500'} />
                  <span>{isContinuousMode ? 'Continuous: ON' : 'Continuous Mode'}</span>
                </button>

                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => filePickerRef.current?.click()}
                  className={`py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    cameraState !== 'active' ? 'w-full' : ''
                  }`}
                >
                  <Upload size={18} />
                  <span>Upload Image</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: ENHANCE, CROP & ROTATE
              ======================================================== */}
          {step === 'edit_crop' && originalImage && (
            <div className="space-y-4">
              {/* Adjustment Toolbar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Crop size={15} className="text-cyan-600" />
                  <span>Enhance & Crop Question</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRotateCcw}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Rotate 90° counter-clockwise"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotateCw}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Rotate 90° clockwise"
                  >
                    <RotateCw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAdjustments}
                    className="py-1 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 text-[11px] font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Image Preview with Dynamic Crop Boundary Box */}
              <div className="relative rounded-2xl bg-slate-950 max-h-[300px] overflow-hidden flex items-center justify-center border border-slate-800 p-2">
                <div 
                  className="relative overflow-hidden transition-transform duration-200"
                  style={{ transform: `rotate(${rotationDegrees + tiltDegrees}deg)` }}
                >
                  <img 
                    src={originalImage} 
                    alt="Homework preview" 
                    className={`max-h-[280px] w-auto object-contain rounded-lg ${
                      activeFilter === 'grayscale' ? 'grayscale' :
                      activeFilter === 'high_contrast' ? 'contrast-200 grayscale' :
                      activeFilter === 'document' ? 'contrast-125 brightness-105' : ''
                    }`}
                  />

                  {/* Visual Crop Overlay Rectangle */}
                  {(cropTop > 0 || cropBottom > 0 || cropLeft > 0 || cropRight > 0) && (
                    <div 
                      className="absolute border-2 border-cyan-400 bg-cyan-500/15 pointer-events-none rounded shadow-sm"
                      style={{
                        top: `${cropTop}%`,
                        bottom: `${cropBottom}%`,
                        left: `${cropLeft}%`,
                        right: `${cropRight}%`
                      }}
                    >
                      <div className="absolute top-1 left-1 bg-cyan-600 text-white text-[9px] font-bold px-1.5 rounded">
                        Target Area
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhancement Filter Selector Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Document Clarity & Enhancement Filter:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveFilter('document')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      activeFilter === 'document'
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles size={12} className="text-cyan-600" />
                    <span>Auto-Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('high_contrast')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeFilter === 'high_contrast'
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    High-Contrast B&W
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('sharpen')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeFilter === 'sharpen'
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Sharpen / De-Blur
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('grayscale')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeFilter === 'grayscale'
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Grayscale
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFilter('original')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeFilter === 'original'
                        ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Crop Presets & Boundary Sliders */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <SlidersHorizontal size={14} className="text-cyan-600" />
                    <span>Crop Framing Area</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleApplyCropPreset('full')}
                      className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                        cropPreset === 'full' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Full Page
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCropPreset('top')}
                      className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                        cropPreset === 'top' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Top Half
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCropPreset('bottom')}
                      className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                        cropPreset === 'bottom' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Bottom Half
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCropPreset('center')}
                      className={`px-2 py-0.5 rounded-lg font-bold cursor-pointer ${
                        cropPreset === 'center' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      Center
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                      <span>Crop Top</span>
                      <span>{cropTop}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={cropTop}
                      onChange={(e) => {
                        setCropTop(Number(e.target.value));
                        setCropPreset('custom');
                      }}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                      <span>Crop Bottom</span>
                      <span>{cropBottom}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={cropBottom}
                      onChange={(e) => {
                        setCropBottom(Number(e.target.value));
                        setCropPreset('custom');
                      }}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                      <span>Crop Left</span>
                      <span>{cropLeft}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={cropLeft}
                      onChange={(e) => {
                        setCropLeft(Number(e.target.value));
                        setCropPreset('custom');
                      }}
                      className="w-full accent-cyan-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                      <span>Crop Right</span>
                      <span>{cropRight}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={cropRight}
                      onChange={(e) => {
                        setCropRight(Number(e.target.value));
                        setCropPreset('custom');
                      }}
                      className="w-full accent-cyan-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={handleProceedToAnalyze}
                  className="flex-1 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Auto-Detect & Recognize Question</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: ANALYZING SPINNER (ACCURATE PROGRESS FEEDBACK)
              ======================================================== */}
          {step === 'analyzing' && (
            <div className="p-10 text-center space-y-4">
              <RefreshCw size={36} className="animate-spin text-cyan-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  {analysisStageText}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Assessing image clarity, extracting mathematical formulas & detecting question boundaries.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 4: QUALITY WARNING (NEVER GUESS BLURRY IMAGES)
              ======================================================== */}
          {step === 'quality_warning' && (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-amber-950">
                  Image Quality Alert: Unclear or Cut-Off Content
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed max-w-md mx-auto">
                  {qualityFeedback}
                </p>
                {ocrResult?.quality?.unreadablePartDescription && (
                  <p className="text-[11px] font-mono text-amber-800 bg-amber-100/80 py-1 px-3 rounded-lg inline-block mt-2">
                    Detail: {ocrResult.quality.unreadablePartDescription}
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Retake Photo with Full Question
                </button>
                <button
                  type="button"
                  onClick={() => setStep('recognized')}
                  className="py-2.5 px-4 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold cursor-pointer"
                >
                  Type Question Manually
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 5: MULTI-QUESTION SELECTION (PAGE CONTAINS Q1, Q2, Q3)
              ======================================================== */}
          {step === 'multi_question_select' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-900 flex items-center gap-1.5">
                  <Layers size={15} className="text-cyan-700" />
                  <span>Multiple Questions Detected on Page ({detectedQuestionsList.length})</span>
                </span>
                <span className="text-[10px] text-cyan-800 font-bold">Select one to solve</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {detectedQuestionsList.map((q, idx) => (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => {
                      setSelectedQuestionIndex(idx);
                      setEditableQuestion(q.text);
                      if (q.subject) setDetectedSubject(q.subject);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      selectedQuestionIndex === idx
                        ? 'bg-cyan-50/80 border-cyan-400 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                          {q.label || `Question ${idx + 1}`}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {q.topic}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {q.text}
                      </p>
                    </div>

                    <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                      selectedQuestionIndex === idx
                        ? 'border-cyan-600 bg-cyan-600 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}>
                      <Check size={12} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={() => setStep('recognized')}
                  className="flex-1 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Review Selected Question</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 6: RECOGNIZED QUESTION & AMBIGUITY VERIFICATION
              ======================================================== */}
          {step === 'recognized' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 size={14} className="text-cyan-600" />
                  <span>Review Extracted Question</span>
                </span>
                
                {/* Subject & Grade Selectors */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={detectedSubject}
                    onChange={(e) => setDetectedSubject(e.target.value)}
                    className="text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science (Physics / Chem / Bio)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="French">French</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>

                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ambiguity notice if unclear characters detected */}
              {uncertainNotations.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold">Check notation before solving:</span>
                    <p className="text-[11px] text-amber-800">
                      Possible ambiguous symbols: {uncertainNotations.join(', ')}. Please verify that numbers, signs, and exponents are correct.
                    </p>
                  </div>
                </div>
              )}

              {/* Editable Question Textbox */}
              <div className="space-y-1.5">
                <textarea
                  value={editableQuestion}
                  onChange={(e) => setEditableQuestion(e.target.value)}
                  rows={4}
                  placeholder="Enter or verify the detected homework question..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 focus:outline-cyan-500 font-medium leading-relaxed shadow-2xs"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-1">
                  <span>Preserve negative signs, brackets, fractions, and units.</span>
                  {processedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        onCaptureImage(processedImage.base64, processedImage.mimeType);
                        onClose();
                      }}
                      className="text-cyan-700 hover:text-cyan-900 font-bold underline cursor-pointer"
                    >
                      Attach photo to main workspace
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Academic Formula Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Academic Presets:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setEditableQuestion('Solve equation: 2x + 7 = 19');
                      setDetectedSubject('Mathematics');
                    }}
                    className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    2x + 7 = 19
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditableQuestion('Solve quadratic equation: x^2 - 5x + 6 = 0');
                      setDetectedSubject('Mathematics');
                    }}
                    className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    x² - 5x + 6 = 0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditableQuestion('Pythagoras theorem: hypotenuse when a = 3, b = 4');
                      setDetectedSubject('Mathematics');
                    }}
                    className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    Pythagoras: a=3, b=4
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditableQuestion('Calculate Force: mass = 10 kg, acceleration = 9.8 m/s^2');
                      setDetectedSubject('Science');
                    }}
                    className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    F = m × a
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Retake Photo
                </button>
                <button
                  type="button"
                  onClick={handleSolveQuestion}
                  disabled={!editableQuestion.trim()}
                  className="flex-1 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Solve with Academic Verification</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 7: SOLVING SPINNER
              ======================================================== */}
          {step === 'solving' && (
            <div className="p-10 text-center space-y-4">
              <RefreshCw size={36} className="animate-spin text-cyan-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  {solvingStageText}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Running multi-step symbolic calculation, checking units, formulas, and verified accuracy.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 8: SOLVED RESULT + STEP-BY-STEP EXPLANATION
              ======================================================== */}
          {step === 'solved' && solverResult && (
            <div className="space-y-4">
              
              {/* Utility Header: Audio Narration, Print, View Mode Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleReadAloud}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSpeaking 
                        ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                        : 'bg-white border-slate-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-200'
                    }`}
                    title={isSpeaking ? 'Stop narration' : 'Listen to solution read aloud'}
                  >
                    {isSpeaking ? <VolumeX size={14} className="text-rose-600" /> : <Volume2 size={14} className="text-cyan-600" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintSolution}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Print worksheet or save as PDF"
                  >
                    <Printer size={14} className="text-slate-600" />
                    <span>Print Worksheet</span>
                  </button>
                </div>

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
              </div>

              {/* Question Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Question ({solverResult.subject} · {selectedGrade})
                  </span>
                  {isOfflineEngineUsed ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      ⚡ Local Offline Engine
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCheck size={11} className="text-emerald-600" />
                      <span>Independently Verified</span>
                    </span>
                  )}
                </div>
                <p className="font-semibold text-slate-900 leading-snug">
                  {cleanEducationalText(solverResult.question)}
                </p>
              </div>

              {/* Verified Final Answer Card */}
              <div className="p-4 rounded-2xl bg-cyan-50/70 border-2 border-cyan-400/40 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-cyan-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-cyan-600" />
                    <span>Verified Final Answer</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAnswer}
                      className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
                      title="Copy answer"
                    >
                      <Copy size={12} />
                      <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <span className="text-[10px] font-mono text-cyan-800 font-bold bg-cyan-100/70 px-2 py-0.5 rounded-md">
                      {solverResult.engineUsed || 'Verified'}
                    </span>
                  </div>
                </div>

                <div className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                  {cleanEducationalText(solverResult.structuredSteps?.finalAnswer || '')}
                </div>

                {solverResult.quickAnswer && (
                  <p className="text-xs text-cyan-950 font-medium leading-relaxed pt-0.5">
                    {cleanEducationalText(solverResult.quickAnswer)}
                  </p>
                )}
              </div>

              {/* DETAILED MODE: Givens, Formula, Steps, Visual Diagram & Practice Questions */}
              {solutionViewMode === 'detailed' && (
                <div className="space-y-4">
                  {/* Givens & Formula Row */}
                  {(solverResult.structuredSteps?.givenInfo?.length > 0 || solverResult.structuredSteps?.formula) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {solverResult.structuredSteps?.givenInfo?.length > 0 && (
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                            Given Information
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                            {solverResult.structuredSteps.givenInfo.map((g: string, i: number) => (
                              <li key={i}>{cleanEducationalText(g)}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {solverResult.structuredSteps?.formula && (
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                            Governing Principle / Formula
                          </span>
                          <p className="font-mono text-slate-900 font-bold">
                            {cleanEducationalText(solverResult.structuredSteps.formula)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step-by-Step Intermediate Calculations */}
                  {Array.isArray(solverResult.structuredSteps?.calculation) && solverResult.structuredSteps.calculation.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Step-by-Step Derivation & Intermediate Steps
                      </span>
                      <div className="space-y-1.5">
                        {solverResult.structuredSteps.calculation.map((stepText: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-800 font-mono leading-relaxed">
                            <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0 text-slate-600">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{cleanEducationalText(stepText)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Independent Verification Method Note */}
                  {solverResult.structuredSteps?.verification && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                      <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Independent Verification Note</span>
                      </span>
                      <p className="text-emerald-950 font-medium">
                        {solverResult.structuredSteps.verification.details || 'Calculation verified against curriculum principles.'}
                      </p>
                    </div>
                  )}

                  {/* Visual Homework Explainer (Geometry, Science Diagram, Coordinate Graph) */}
                  {solverResult.visualExplanation && (
                    <VisualHomeworkExplainer visual={solverResult.visualExplanation} />
                  )}

                  {/* Academic Reasoning & Intuition Narrative */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                      Student Explanation & Memory Analogy
                    </h4>
                    <div className="text-xs text-slate-800 leading-relaxed">
                      {formatTutorResponse(solverResult.narrativeExplanation)}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleUseInNotebook}
                  className="flex-1 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <FileText size={16} />
                  <span>Open in AI Homework Chat</span>
                </button>

                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle size={15} />
                  <span>Scan Another Question</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
