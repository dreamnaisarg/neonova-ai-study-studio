import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  RotateCw, 
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
  Zap, 
  ZapOff, 
  SlidersHorizontal, 
  Maximize2, 
  CheckCheck
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
  | 'preview_attach' 
  | 'analyzing' 
  | 'quality_warning' 
  | 'multi_question_select' 
  | 'recognized' 
  | 'solving' 
  | 'solved';

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

  // Active captured/picked photo
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<EnhancementFilter>('document');
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);

  // Analysis, OCR, and Solver states
  const [analysisStageText, setAnalysisStageText] = useState('Enhancing worksheet contrast...');
  const [solvingStageText, setSolvingStageText] = useState('Extracting formulas and solving...');
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [detectedQuestionsList, setDetectedQuestionsList] = useState<DetectedQuestionItem[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [editableQuestion, setEditableQuestion] = useState('');
  const [detectedSubject, setDetectedSubject] = useState(currentSubject);
  const [selectedGrade, setSelectedGrade] = useState(currentGrade);
  const [qualityFeedback, setQualityFeedback] = useState('');
  const [solverResult, setSolverResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
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

  // Subscribe to speech narrator
  useEffect(() => {
    return OfflineSpeechNarrator.subscribe(setIsSpeaking);
  }, []);

  // Stop active camera stream tracks
  const stopActiveStream = useCallback(() => {
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
    setIsTorchSupported(false);
  }, []);

  // Request camera stream with robust fallbacks
  const requestCameraPermission = useCallback(async (targetFacing: 'environment' | 'user' = facingMode) => {
    stopActiveStream();
    setCameraState('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      return;
    }

    try {
      // 1. Try high-definition environmental back camera (ideal for documents)
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
        videoRef.current.play().catch(e => console.warn('Video play deferred:', e));
      }

      // Check hardware torch support
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const caps = await getCameraCapabilities(videoTrack);
        setIsTorchSupported(caps.supportsTorch);
      }

      setCameraState('active');
    } catch (primaryErr) {
      console.warn('High-res camera failed, trying simple video stream:', primaryErr);
      try {
        // 2. Fallback to basic camera constraint
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: targetFacing },
          audio: false
        });
        mediaStreamRef.current = fallbackStream;

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(e => console.warn('Fallback video play deferred:', e));
        }

        setCameraState('active');
      } catch (fallbackErr) {
        try {
          // 3. Fallback to any available video device
          const anyStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          mediaStreamRef.current = anyStream;
          if (videoRef.current) {
            videoRef.current.srcObject = anyStream;
            videoRef.current.play().catch(() => {});
          }
          setCameraState('active');
        } catch (finalErr) {
          console.error('All camera attempts failed:', finalErr);
          setCameraState('denied');
        }
      }
    }
  }, [facingMode, stopActiveStream]);

  // Mount camera initialization and ensure video stream is bound
  useEffect(() => {
    requestCameraPermission('environment');
    return () => {
      stopActiveStream();
      OfflineSpeechNarrator.stop();
    };
  }, [requestCameraPermission, stopActiveStream]);

  // Reactive effect ensuring video element always receives stream once ready
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      videoRef.current.play().catch(e => console.warn('Video autoPlay:', e));
    }
  }, [cameraState, step]);

  // Flip front/back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    requestCameraPermission(nextMode);
  };

  // Toggle hardware torch
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

  // Snap photo from live camera feed
  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const vw = video.videoWidth || 1920;
      const vh = video.videoHeight || 1080;
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

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }

        stopActiveStream();
        setCapturedPhotoUrl(dataUrl);
        setRotationDegrees(0);
        setCropTop(0);
        setCropBottom(0);
        setCropLeft(0);
        setCropRight(0);
        setStep('preview_attach');
      }
    }
  };

  // File upload from disk or gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          stopActiveStream();
          setCapturedPhotoUrl(result);
          setRotationDegrees(0);
          setCropTop(0);
          setCropBottom(0);
          setCropLeft(0);
          setCropRight(0);
          setStep('preview_attach');
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Retake photo: restarts live camera
  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setOcrResult(null);
    setDetectedQuestionsList([]);
    setSolverResult(null);
    setEditableQuestion('');
    setErrorMessage(null);
    setStep('capture');
    requestCameraPermission(facingMode);
  };

  // Process & Enhance image
  const generateProcessedImage = async (): Promise<{ base64: string; mimeType: string; dataUrl: string } | null> => {
    if (!capturedPhotoUrl) return null;
    try {
      const res = await processAndEnhanceImage(capturedPhotoUrl, {
        filter: activeFilter,
        rotationDegrees,
        tiltDegrees: 0,
        brightness: 0,
        contrast: 10,
        cropPercentages: {
          top: cropTop,
          bottom: cropBottom,
          left: cropLeft,
          right: cropRight
        },
        maxDimension: 1800
      });
      return {
        base64: res.base64,
        mimeType: res.mimeType,
        dataUrl: res.dataUrl
      };
    } catch {
      // Fallback
      const commaIndex = capturedPhotoUrl.indexOf(',');
      const base64 = commaIndex !== -1 ? capturedPhotoUrl.substring(commaIndex + 1) : capturedPhotoUrl;
      const mimeMatch = capturedPhotoUrl.match(/^data:([^;]+);base64,/);
      return {
        base64,
        mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
        dataUrl: capturedPhotoUrl
      };
    }
  };

  // 1-Tap DIRECT ATTACH: Attaches photo immediately to homework chat/solver and exits
  const handleDirectAttach = async () => {
    if (!capturedPhotoUrl) return;
    try {
      const processed = await generateProcessedImage();
      if (processed) {
        onCaptureImage(processed.base64, processed.mimeType);
        onClose();
        return;
      }
    } catch {}

    const commaIndex = capturedPhotoUrl.indexOf(',');
    const base64 = commaIndex !== -1 ? capturedPhotoUrl.substring(commaIndex + 1) : capturedPhotoUrl;
    const mimeMatch = capturedPhotoUrl.match(/^data:([^;]+);base64,/);
    onCaptureImage(base64, mimeMatch ? mimeMatch[1] : 'image/jpeg');
    onClose();
  };

  // Trigger OCR analysis to recognize & solve
  const handleProceedToAnalyze = async () => {
    setErrorMessage(null);
    setStep('analyzing');
    setAnalysisStageText('Enhancing clarity & optical contrast...');

    const processed = await generateProcessedImage();
    if (!processed) {
      setErrorMessage('Could not process image. Attaching directly instead.');
      handleDirectAttach();
      return;
    }

    const timer1 = setTimeout(() => {
      setAnalysisStageText('Reading mathematical equations & diagrams...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setAnalysisStageText('Detecting question boundaries...');
    }, 2800);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

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
      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);

        // Quality check alert
        if (data.quality && !data.quality.isAcceptable) {
          setQualityFeedback(
            data.quality?.feedback ||
            'The question in this photo is unclear or too dark. You can retake or attach it directly to AI Tutor.'
          );
          setStep('quality_warning');
          return;
        }

        // Multi-question detection
        if (Array.isArray(data.detectedQuestions) && data.detectedQuestions.length > 1) {
          setDetectedQuestionsList(data.detectedQuestions);
          setSelectedQuestionIndex(0);
          setEditableQuestion(data.detectedQuestions[0].text);
          if (data.detectedQuestions[0].subject) setDetectedSubject(data.detectedQuestions[0].subject);
          setStep('multi_question_select');
          return;
        }

        if (data.detectedText && data.detectedText.trim()) {
          setEditableQuestion(data.detectedText.trim());
        }
        if (data.detectedSubject) setDetectedSubject(data.detectedSubject);
        setStep('recognized');
      } else {
        // Fallback directly to recognized
        setStep('recognized');
      }
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setStep('recognized');
    }
  };

  // Run final step-by-step solver
  const handleSolveFinal = async () => {
    if (!editableQuestion.trim() && !capturedPhotoUrl) return;
    setStep('solving');
    setSolvingStageText('AI Tutor is verifying multi-step solution...');

    try {
      const processed = await generateProcessedImage();
      const res = await fetch('/api/solver/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editableQuestion.trim() || 'Solve the attached worksheet question step-by-step.',
          subject: detectedSubject,
          grade: selectedGrade,
          curriculumBoard,
          imageBase64: processed?.base64,
          mimeType: processed?.mimeType
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSolverResult(data);
        setStep('solved');
        return;
      }
    } catch {}

    // Offline solver fallback
    const offlineRes = solveHomeworkOffline({
      questionText: editableQuestion.trim() || 'Worksheet Problem',
      subject: detectedSubject,
      grade: selectedGrade
    });
    setSolverResult(offlineRes);
    setStep('solved');
  };

  return (
    <div 
      id="optic-homework-scanner-modal" 
      className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none font-sans"
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

      {/* 1. Live Camera Stream Background (Rendered Unconditionally in DOM so ref is never null!) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover z-0 ${
          step === 'capture' && cameraState === 'active' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 2. Top Header Navigation Bar (AR-Style Glassmorphism) */}
      <header className="relative z-30 flex items-center justify-between p-3.5 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
            <Camera size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                NEONOVA OPTIC SCANNER
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                {detectedSubject}
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              {step === 'capture' 
                ? 'Point camera at worksheet or book page' 
                : 'Review & Attach worksheet'}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Torch Toggle */}
          {step === 'capture' && isTorchSupported && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`p-2 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
                isTorchOn 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/30' 
                  : 'bg-slate-900/70 text-slate-300 border-slate-700/60 hover:text-white'
              }`}
              title={isTorchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
            >
              {isTorchOn ? <Zap size={16} /> : <ZapOff size={16} />}
            </button>
          )}

          {/* Flip Camera */}
          {step === 'capture' && cameraState === 'active' && (
            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-700/60 backdrop-blur-md transition-colors cursor-pointer"
              title="Flip Camera (Front / Back)"
            >
              <RefreshCw size={16} />
            </button>
          )}

          {/* Close Scanner */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 backdrop-blur-md transition-colors cursor-pointer"
            title="Close Camera"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* 3. STEP 1: LIVE CAMERA VIEWFINDER & RETICLE */}
      {step === 'capture' && (
        <div className="relative flex-1 flex flex-col justify-between p-4 z-20 pointer-events-none">
          {/* If Camera Requesting or Denied: Sleek AR-Style Permission Card */}
          {cameraState !== 'active' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white pointer-events-auto z-40">
              {cameraState === 'requesting' ? (
                <div className="space-y-4 max-w-sm">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
                    <div className="w-20 h-20 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                      <Camera size={32} className="text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white">Opening Device Camera...</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connecting to your phone&apos;s camera to scan your homework problems.
                  </p>
                  <button
                    type="button"
                    onClick={() => filePickerRef.current?.click()}
                    className="mt-3 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <Upload size={14} />
                    <span>Or Pick Photo from Files</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-w-md bg-slate-900 border border-cyan-500/30 p-6 rounded-3xl shadow-2xl">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Camera size={28} />
                  </div>
                  <h3 className="text-base font-bold text-white">Camera Permission Needed</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    NeoNova needs access to your camera to scan equations and textbook pages.
                  </p>
                  <div className="p-3 bg-slate-800/80 rounded-2xl text-left text-xs text-slate-300 space-y-1.5 border border-slate-700">
                    <p className="font-semibold text-slate-100">How to allow camera on your phone:</p>
                    <p>1. Tap the <strong>lock or camera icon</strong> in your browser address bar.</p>
                    <p>2. Select <strong>Site Settings</strong> or <strong>Permissions</strong>.</p>
                    <p>3. Set <strong>Camera to Allow</strong> and tap Try Again.</p>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => requestCameraPermission(facingMode)}
                      className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <RefreshCw size={14} />
                      <span>Allow Camera & Try Again</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => filePickerRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 flex items-center gap-1.5"
                    >
                      <Upload size={14} />
                      <span>Attach Photo Directly</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Central Holographic Document Viewfinder Frame */}
          {cameraState === 'active' && (
            <div className="flex-1 flex items-center justify-center my-4">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-4/3 sm:aspect-16/10 border-2 border-cyan-400/50 rounded-3xl p-4 flex flex-col justify-between shadow-2xl overflow-hidden">
                {/* Sweeping Laser Beam Animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-[scanLaser_3s_ease-in-out_infinite]" />

                {/* Corner Target L-Brackets */}
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 border-t-3 border-l-3 border-cyan-400 rounded-tl-xl" />
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/40 backdrop-blur-xs">
                    Align Problem in Frame
                  </span>
                  <div className="w-8 h-8 border-t-3 border-r-3 border-cyan-400 rounded-tr-xl" />
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-8 h-8 border-b-3 border-l-3 border-cyan-400 rounded-bl-xl" />
                  <div className="w-8 h-8 border-b-3 border-r-3 border-cyan-400 rounded-br-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Live Shutter & Attachment Controls */}
          {cameraState === 'active' && (
            <div className="pointer-events-auto flex items-center justify-around max-w-md mx-auto w-full pb-3">
              {/* Upload Photo from Device */}
              <button
                type="button"
                onClick={() => filePickerRef.current?.click()}
                className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all shadow-md active:scale-95"
                title="Choose Photo from Device Files / Gallery"
              >
                <Upload size={18} className="text-cyan-400" />
                <span className="text-[8px] font-bold text-slate-300 mt-0.5">Gallery</span>
              </button>

              {/* Big AR-Style Camera Shutter Button */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="group relative w-20 h-20 rounded-full border-4 border-white/90 p-1 flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title="Snap Photo of Homework"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:from-cyan-400 group-hover:to-indigo-400">
                  <Camera size={28} />
                </div>
              </button>

              {/* Flip camera */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all shadow-md active:scale-95"
                title="Flip Camera"
              >
                <RefreshCw size={18} className="text-cyan-400" />
                <span className="text-[8px] font-bold text-slate-300 mt-0.5">Flip</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. STEP 2: PREVIEW & DIRECT ATTACH / SOLVE OPTIONS */}
      {step === 'preview_attach' && capturedPhotoUrl && (
        <div className="relative flex-1 flex flex-col justify-between p-3 sm:p-5 z-20 overflow-y-auto">
          {/* Photo Display Viewport */}
          <div className="flex-1 flex items-center justify-center my-auto min-h-0">
            <div className="relative max-h-[62vh] rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-950 flex items-center justify-center">
              <img
                src={capturedPhotoUrl}
                alt="Captured Homework Worksheet"
                style={{ transform: `rotate(${rotationDegrees}deg)` }}
                className="max-h-[60vh] max-w-full object-contain transition-transform duration-200"
              />

              {/* Quick Rotate in Preview */}
              <button
                type="button"
                onClick={() => setRotationDegrees(prev => (prev + 90) % 360)}
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-white backdrop-blur-md cursor-pointer hover:bg-slate-800"
                title="Rotate 90 degrees"
              >
                <RotateCw size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Action Strip: Direct Attachment vs Solve */}
          <div className="mt-3 space-y-2 max-w-md mx-auto w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* PRIMARY USER GOAL: DIRECT ATTACH TO HOMEWORK */}
              <button
                type="button"
                onClick={handleDirectAttach}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <CheckCircle2 size={18} />
                <span>Attach to Homework Directly</span>
              </button>

              {/* OPTIONAL: AI STEP-BY-STEP SOLVER */}
              <button
                type="button"
                onClick={handleProceedToAnalyze}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-98 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/40 transition-all cursor-pointer"
              >
                <Sparkles size={18} />
                <span>Solve with AI Tutor</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRetake}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Retake Photo with Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. STEP 3: ANALYZING SPINNER */}
      {step === 'analyzing' && (
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 z-20 text-center text-white">
          <div className="space-y-4 max-w-sm">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
            </div>
            <h3 className="text-base font-bold text-white">{analysisStageText}</h3>
            <p className="text-xs text-slate-400">
              Assessing image clarity, extracting mathematical formulas & detecting question boundaries.
            </p>
            <button
              type="button"
              onClick={handleDirectAttach}
              className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-lg"
            >
              <CheckCircle2 size={15} />
              <span>Skip Scan & Attach Directly to AI Tutor</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. STEP 4: QUALITY WARNING ALERT */}
      {step === 'quality_warning' && (
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 z-20 text-center text-white">
          <div className="space-y-4 max-w-md bg-slate-900 border border-amber-500/40 p-6 rounded-3xl shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-white">Image Quality Alert</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{qualityFeedback}</p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleDirectAttach}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 size={15} />
                <span>Attach Image Anyway</span>
              </button>
              <button
                type="button"
                onClick={handleRetake}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
              >
                Retake Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. STEP 5: MULTI-QUESTION SELECTION */}
      {step === 'multi_question_select' && (
        <div className="relative flex-1 flex flex-col justify-between p-4 z-20 max-w-xl mx-auto w-full overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="text-xs font-bold flex items-center gap-1.5 text-cyan-400">
                <Layers size={15} />
                <span>Multiple Questions Detected ({detectedQuestionsList.length})</span>
              </span>
              <span className="text-[10px] text-slate-400">Select one to solve</span>
            </div>

            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
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
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-md text-white'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-800">
                      {q.label || `Question ${idx + 1}`}
                    </span>
                    <p className="text-xs leading-relaxed mt-1">{q.text}</p>
                  </div>
                  <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                    selectedQuestionIndex === idx ? 'border-cyan-400 bg-cyan-500 text-white' : 'border-slate-700'
                  }`}>
                    <Check size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={handleDirectAttach}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              Attach Directly
            </button>
            <button
              type="button"
              onClick={() => setStep('recognized')}
              className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Review Question</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 8. STEP 6: RECOGNIZED QUESTION REVIEW */}
      {step === 'recognized' && (
        <div className="relative flex-1 flex flex-col justify-between p-4 z-20 max-w-xl mx-auto w-full overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="text-xs font-bold flex items-center gap-1.5 text-cyan-400">
                <Edit3 size={15} />
                <span>Review Recognized Question</span>
              </span>
              <select
                value={detectedSubject}
                onChange={(e) => setDetectedSubject(e.target.value)}
                className="text-xs font-bold text-cyan-300 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Social Science">Social Science</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <textarea
              value={editableQuestion}
              onChange={(e) => setEditableQuestion(e.target.value)}
              placeholder="Question text extracted from worksheet..."
              rows={6}
              className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={handleDirectAttach}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>Attach Image to Chat</span>
            </button>
            <button
              type="button"
              onClick={handleSolveFinal}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Sparkles size={16} />
              <span>Solve with AI Now</span>
            </button>
          </div>
        </div>
      )}

      {/* 9. STEP 7: SOLVING SPINNER */}
      {step === 'solving' && (
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 z-20 text-center text-white">
          <div className="space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-bold text-white">{solvingStageText}</h3>
            <p className="text-xs text-slate-400">Verifying pedagogical clarity and mathematical rigor.</p>
          </div>
        </div>
      )}

      {/* 10. STEP 8: SOLVED BREAKDOWN */}
      {step === 'solved' && solverResult && (
        <div className="relative flex-1 flex flex-col justify-between p-4 z-20 max-w-2xl mx-auto w-full overflow-y-auto text-white">
          <div className="space-y-3 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Step-by-Step Educational Solution</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {detectedSubject}
              </span>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 text-xs text-slate-200 leading-relaxed font-sans">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-semibold">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Question:</span>
                <p className="mt-1">{editableQuestion || 'Worksheet Problem'}</p>
              </div>

              {solverResult.analogy && (
                <div className="p-3 rounded-2xl bg-cyan-950/50 border border-cyan-800/80 text-cyan-200">
                  <span className="font-bold block text-[11px] mb-1">Everyday Intuitive Analogy:</span>
                  <p>{solverResult.analogy}</p>
                </div>
              )}

              {Array.isArray(solverResult.steps) && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-300 text-xs">Step-by-Step Breakdown:</span>
                  {solverResult.steps.map((st: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-cyan-400 font-mono">Step {idx + 1}: {st.title}</span>
                      <p className="text-slate-200">{st.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {solverResult.finalAnswer && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-200 font-bold">
                  <span className="text-[10px] text-emerald-400 uppercase block font-mono">Final Answer:</span>
                  <p className="text-sm mt-0.5">{solverResult.finalAnswer}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={handleDirectAttach}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              Attach Solution to Notebook
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Custom Keyframe Styles for scanning laser */}
      <style>{`
        @keyframes scanLaser {
          0%, 100% { top: 8%; opacity: 0.3; }
          50% { top: 90%; opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
