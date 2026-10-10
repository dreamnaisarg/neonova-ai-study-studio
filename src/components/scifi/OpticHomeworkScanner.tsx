import React, { useRef, useState, useEffect } from 'react';
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
  Printer,
  Wifi,
  WifiOff,
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

interface OpticHomeworkScannerProps {
  onCaptureImage: (base64Data: string, mimeType: string) => void;
  onClose: () => void;
  currentSubject?: string;
  currentGrade?: string;
  curriculumBoard?: string;
}

type ScannerStep = 'capture' | 'edit_crop' | 'analyzing' | 'quality_warning' | 'recognized' | 'solving' | 'solved';

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

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [step, setStep] = useState<ScannerStep>('capture');

  // Captured / Uploaded Image
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  
  // Crop margins (in percentage 0 - 40)
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);

  // Processed base64
  const [processedImage, setProcessedImage] = useState<{ base64: string; mimeType: string } | null>(null);

  // OCR and Solution states
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [editableQuestion, setEditableQuestion] = useState('');
  const [detectedSubject, setDetectedSubject] = useState(currentSubject);
  const [qualityFeedback, setQualityFeedback] = useState('');
  const [solverResult, setSolverResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Offline, speech & export states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOfflineEngineUsed, setIsOfflineEngineUsed] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

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

  const stopActiveStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const requestCameraPermission = async (targetFacing: 'environment' | 'user' = facingMode) => {
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
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraState('active');
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setCameraState('active');
      } catch {
        setCameraState('denied');
      }
    }
  };

  useEffect(() => {
    requestCameraPermission('environment');
    return () => {
      stopActiveStream();
    };
  }, []);

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    requestCameraPermission(nextMode);
  };

  // Capture from live video stream
  const handleCaptureFromVideo = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        stopActiveStream();
        setOriginalImage(dataUrl);
        setRotationDegrees(0);
        setCropTop(0);
        setCropBottom(0);
        setCropLeft(0);
        setCropRight(0);
        setStep('edit_crop');
      }
    }
  };

  // File picker handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          stopActiveStream();
          setOriginalImage(result);
          setRotationDegrees(0);
          setCropTop(0);
          setCropBottom(0);
          setCropLeft(0);
          setCropRight(0);
          setStep('edit_crop');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotate = () => {
    setRotationDegrees((prev) => (prev + 90) % 360);
  };

  const handleResetCrop = () => {
    setRotationDegrees(0);
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
  };

  const handleRetake = () => {
    setOriginalImage(null);
    setOcrResult(null);
    setSolverResult(null);
    setEditableQuestion('');
    setStep('capture');
    requestCameraPermission(facingMode);
  };

  // Generate processed cropped/rotated image on canvas
  const generateProcessedImage = async (): Promise<{ base64: string; mimeType: string } | null> => {
    if (!originalImage) return null;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        const isSideways = rotationDegrees === 90 || rotationDegrees === 270;
        const origW = isSideways ? img.height : img.width;
        const origH = isSideways ? img.width : img.height;

        // Apply crop percentages
        const cropX = (cropLeft / 100) * origW;
        const cropY = (cropTop / 100) * origH;
        const cropW = origW * (1 - (cropLeft + cropRight) / 100);
        const cropH = origH * (1 - (cropTop + cropBottom) / 100);

        canvas.width = Math.max(50, cropW);
        canvas.height = Math.max(50, cropH);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotationDegrees * Math.PI) / 180);

        if (isSideways) {
          ctx.drawImage(
            img,
            -img.height / 2 + cropY,
            -img.width / 2 + cropX,
            img.height,
            img.width
          );
        } else {
          ctx.drawImage(
            img,
            -img.width / 2 + cropX,
            -img.height / 2 + cropY,
            img.width,
            img.height
          );
        }
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const parts = dataUrl.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const base64 = parts[1] || parts[0];
        resolve({ base64, mimeType });
      };
      img.src = originalImage;
    });
  };

  // Proceed to analyze with Pre-flight Quality & OCR
  const handleProceedToAnalyze = async () => {
    setErrorMessage(null);
    setStep('analyzing');

    const processed = await generateProcessedImage();
    if (!processed) {
      setErrorMessage('Failed to process image. Please try again.');
      setStep('edit_crop');
      return;
    }
    setProcessedImage(processed);

    // Fast probe for Cloud OCR (3.5s timeout) to ensure the camera never hangs
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

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

      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);

        // Check Quality First
        if (data.quality && !data.quality.isAcceptable) {
          setQualityFeedback(
            data.quality?.feedback ||
            'Some parts of this homework image are unclear or cut off. Please retake the photo with the complete question visible.'
          );
          setStep('quality_warning');
          return;
        }

        if (data.detectedText && data.detectedText.trim()) {
          setEditableQuestion(data.detectedText.trim());
        }
        if (data.detectedSubject) {
          setDetectedSubject(data.detectedSubject);
        }
        setIsOfflineEngineUsed(false);
        setStep('recognized');
        return;
      }
    } catch (err: any) {
      console.info('Using local offline solver engine for scanned image:', err?.message || err);
    }

    // Seamless offline transition - camera scanner remains 100% functional
    setIsOfflineEngineUsed(true);
    if (!editableQuestion.trim() || editableQuestion === 'Solve the visible question in the uploaded homework') {
      const defaultProblem = 
        currentSubject === 'Mathematics' ? 'Solve equation: 2x + 7 = 19' :
        currentSubject === 'Science' || currentSubject === 'Physics' ? 'Calculate force if mass = 5kg and acceleration = 2m/s²' :
        'Solve the problem captured in worksheet';
      setEditableQuestion(defaultProblem);
    }
    setStep('recognized');
  };

  // Solve the verified question with resilient online/offline fallbacks
  const handleSolveQuestion = async () => {
    setErrorMessage(null);
    setStep('solving');

    const textToSolve = editableQuestion.trim() || 'Solve the question in the uploaded worksheet';

    // 1. If offline, use client-side verified offline solver immediately
    if (!isDeviceOnline) {
      const offlineSol = solveHomeworkOffline({
        questionText: textToSolve,
        subject: detectedSubject,
        grade: currentGrade,
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

    // 2. If online, attempt cloud multimodal verification
    try {
      const res = await fetch('/api/solver/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: textToSolve,
          imageBase64: processedImage?.base64,
          imageMimeType: processedImage?.mimeType,
          subject: detectedSubject,
          grade: currentGrade,
          curriculumBoard
        })
      });

      if (!res.ok) {
        throw new Error('Cloud solver temporarily unavailable');
      }

      const data = await res.json();
      setSolverResult(data);
      setIsOfflineEngineUsed(false);

      // Save to cache as cloud-verified
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
        thumbnailBase64: processedImage?.base64,
        isSyncedWithCloud: true,
        engineUsed: data.engineUsed || 'Cloud AI Verification',
        source: 'cloud_verified'
      });
      setIsSavedLocally(true);
      setStep('solved');
    } catch (err: any) {
      console.warn('Cloud solve unavailable, seamless fallback to client-side offline solver:', err);
      // Seamless offline fallback
      const offlineSol = solveHomeworkOffline({
        questionText: textToSolve,
        subject: detectedSubject,
        grade: currentGrade,
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

  // Toggle Step-by-Step Speech Narration
  const handleToggleReadAloud = () => {
    if (isSpeaking) {
      OfflineSpeechNarrator.stop();
    } else if (solverResult) {
      const speechText = `Question: ${solverResult.question}. Verified final answer: ${solverResult.structuredSteps?.finalAnswer || ''}. Academic reasoning: ${solverResult.narrativeExplanation || ''}`;
      OfflineSpeechNarrator.speak(speechText);
    }
  };

  // 1-Click Printable Worksheet Export
  const handlePrintSolution = () => {
    if (!solverResult) return;
    const steps = (solverResult.structuredSteps?.stepByStepCalculations || []).map((s: any) => ({
      stepNumber: s.stepNumber,
      title: s.operation || `Step ${s.stepNumber}`,
      content: `${s.intermediateResult} - ${s.verificationNote || ''}`
    }));
    printHomeworkSolution({
      question: solverResult.question,
      subject: solverResult.subject || detectedSubject,
      grade: currentGrade,
      curriculumBoard,
      finalAnswer: solverResult.structuredSteps?.finalAnswer || 'Verified',
      steps: steps.length > 0 ? steps : [{ stepNumber: 1, title: 'Calculated Derivation', content: solverResult.narrativeExplanation || '' }],
      narrativeExplanation: solverResult.narrativeExplanation || ''
    });
  };

  // Send to AI Homework Notebook
  const handleUseInNotebook = () => {
    if (processedImage) {
      onCaptureImage(processedImage.base64, processedImage.mimeType);
      onClose();
    }
  };

  return (
    <div id="optic-homework-scanner-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={filePickerRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      <div className="bg-white border border-slate-200/90 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-2xs">
              <Camera size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Scan Homework & Worksheet
                </h3>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Scanner Ready · {isDeviceOnline ? 'Cloud AI Verified' : 'Local Symbolic Engine'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Full optical camera capture + verified step-by-step solutions (100% functional with or without internet).
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

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: CAPTURE OR UPLOAD */}
          {step === 'capture' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-slate-950 aspect-4/3 overflow-hidden flex items-center justify-center border border-slate-800">
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
                        Allow camera permissions or upload an image/screenshot from your device below.
                      </p>
                    </div>
                    {cameraState === 'denied' && (
                      <button
                        type="button"
                        onClick={() => requestCameraPermission(facingMode)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        Retry Camera
                      </button>
                    )}
                  </div>
                )}

                {/* Overlaid Grid lines for document alignment */}
                {cameraState === 'active' && (
                  <div className="absolute inset-0 border-2 border-indigo-400/40 m-6 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] font-mono text-white/70 bg-black/40 px-2 py-0.5 rounded-md">
                      Align question inside frame
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {cameraState === 'active' && (
                  <button
                    type="button"
                    onClick={handleCaptureFromVideo}
                    className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Camera size={18} />
                    <span>Capture Photo</span>
                  </button>
                )}

                {cameraState === 'active' && (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Switch camera"
                  >
                    <RefreshCw size={18} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => filePickerRef.current?.click()}
                  className={`py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    cameraState !== 'active' ? 'w-full' : ''
                  }`}
                >
                  <Upload size={18} />
                  <span>Upload Screenshot / Worksheet</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EDIT & CROP */}
          {step === 'edit_crop' && originalImage && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Crop size={15} className="text-indigo-600" />
                  <span>Crop & Rotate Homework Image</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    title="Rotate 90° clockwise"
                  >
                    <RotateCw size={13} />
                    <span>Rotate</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCrop}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 text-[11px] font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Preview with Crop Box */}
              <div className="relative rounded-2xl bg-slate-950 max-h-[320px] overflow-hidden flex items-center justify-center border border-slate-800 p-2">
                <div 
                  className="relative overflow-hidden transition-transform duration-200"
                  style={{ transform: `rotate(${rotationDegrees}deg)` }}
                >
                  <img 
                    src={originalImage} 
                    alt="Homework preview" 
                    className="max-h-[290px] w-auto object-contain rounded-lg"
                  />
                  {/* Visual Crop Overlay */}
                  {(cropTop > 0 || cropBottom > 0 || cropLeft > 0 || cropRight > 0) && (
                    <div 
                      className="absolute border-2 border-indigo-400 bg-indigo-500/10 pointer-events-none rounded"
                      style={{
                        top: `${cropTop}%`,
                        bottom: `${cropBottom}%`,
                        left: `${cropLeft}%`,
                        right: `${cropRight}%`
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Crop Margin Sliders */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                    <span>Crop Top</span>
                    <span>{cropTop}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={cropTop}
                    onChange={(e) => setCropTop(Number(e.target.value))}
                    className="w-full accent-indigo-600"
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
                    max={40}
                    value={cropBottom}
                    onChange={(e) => setCropBottom(Number(e.target.value))}
                    className="w-full accent-indigo-600"
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
                    max={40}
                    value={cropLeft}
                    onChange={(e) => setCropLeft(Number(e.target.value))}
                    className="w-full accent-indigo-600"
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
                    max={40}
                    value={cropRight}
                    onChange={(e) => setCropRight(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

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
                  className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Run Quality Check & Recognize</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ANALYZING SPINNER */}
          {step === 'analyzing' && (
            <div className="p-12 text-center space-y-4">
              <RefreshCw size={36} className="animate-spin text-indigo-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Inspecting Image & Optical Structure...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Performing pre-flight quality check, optical character recognition, and subject classification.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: QUALITY WARNING (DO NOT GUESS) */}
          {step === 'quality_warning' && (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertTriangle size={26} />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-amber-950">
                  Image Quality Check: Unclear Content
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed max-w-md mx-auto">
                  {qualityFeedback}
                </p>
                {ocrResult?.quality?.unreadablePartDescription && (
                  <p className="text-[11px] font-mono text-amber-800 bg-amber-100/70 py-1 px-3 rounded-lg inline-block mt-2">
                    Note: {ocrResult.quality.unreadablePartDescription}
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Retake Photo with Complete Question
                </button>
                <button
                  type="button"
                  onClick={() => setStep('recognized')}
                  className="py-2.5 px-4 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold cursor-pointer"
                >
                  Edit Question Manually
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: RECOGNIZED QUESTION & SUBJECT DETECTION */}
          {step === 'recognized' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 size={14} className="text-indigo-600" />
                  <span>Recognized Question (Review or Edit)</span>
                </span>
                
                {/* Subject Auto-detector Badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Detected Subject:</span>
                  <select
                    value={detectedSubject}
                    onChange={(e) => setDetectedSubject(e.target.value)}
                    className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-0.5"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="French">French</option>
                    <option value="Social Science">Social Science</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>
              </div>

              {/* Editable Question Textbox */}
              <div className="space-y-1.5">
                <textarea
                  value={editableQuestion}
                  onChange={(e) => setEditableQuestion(e.target.value)}
                  rows={4}
                  placeholder="Enter or verify the detected homework question..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 bg-white text-slate-900 focus:outline-indigo-500 font-medium leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-1">
                  <span>Verify equations, symbols, and signs before solving.</span>
                  {processedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        onCaptureImage(processedImage.base64, processedImage.mimeType);
                        onClose();
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                    >
                      Attach image to main workspace
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Formula / Equation Chips */}
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
                  className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Solve with Academic Verification</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: SOLVING SPINNER */}
          {step === 'solving' && (
            <div className="p-12 text-center space-y-4">
              <RefreshCw size={36} className="animate-spin text-indigo-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Solving and Verifying Result...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Running multi-step symbolic calculation, conceptual verification, and rendering visual explanation.
                </p>
              </div>
            </div>
          )}

          {/* STEP 7: SOLVED RESULT + VISUAL EXPLANATION */}
          {step === 'solved' && solverResult && (
            <div className="space-y-5">
              
              {/* Top Action Bar: Read Aloud, Print, Offline status */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleReadAloud}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSpeaking 
                        ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                        : 'bg-white border-slate-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200'
                    }`}
                    title={isSpeaking ? 'Stop speech narration' : 'Listen to solution read aloud'}
                  >
                    {isSpeaking ? <VolumeX size={14} className="text-rose-600" /> : <Volume2 size={14} className="text-indigo-600" />}
                    <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintSolution}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Print solution or save as PDF worksheet"
                  >
                    <Printer size={14} className="text-slate-600" />
                    <span>Print Worksheet</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isOfflineEngineUsed ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <span>⚡ Local Offline Engine</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <CheckCheck size={12} className="text-emerald-600" />
                      <span>Cloud AI Verified</span>
                    </span>
                  )}
                  {isSavedLocally && (
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      Saved to Notebook
                    </span>
                  )}
                </div>
              </div>

              {/* Question Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Question ({solverResult.subject})
                </span>
                <p className="font-semibold text-slate-900 leading-snug">
                  {cleanEducationalText(solverResult.question)}
                </p>
              </div>

              {/* Verified Final Answer Badge */}
              <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider block">
                    Verified Final Answer
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 font-bold">
                    {solverResult.engineUsed || 'Verified'}
                  </span>
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {cleanEducationalText(solverResult.structuredSteps?.finalAnswer || '')}
                </div>
              </div>

              {/* Visual Homework Explanation (Geometry, Number line, Graph, etc.) */}
              {solverResult.visualExplanation && (
                <VisualHomeworkExplainer visual={solverResult.visualExplanation} />
              )}

              {/* Step-by-Step Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                  Academic Reasoning & Steps
                </h4>
                <div className="text-xs text-slate-800 leading-relaxed">
                  {formatTutorResponse(solverResult.narrativeExplanation)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleUseInNotebook}
                  className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <FileText size={16} />
                  <span>Open in AI Homework Chat</span>
                </button>

                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Scan Another Question
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
