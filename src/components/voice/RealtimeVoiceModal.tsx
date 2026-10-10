import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  CornerDownRight, 
  RefreshCw, 
  HelpCircle, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface VoiceMessage {
  id: string;
  sender: 'student' | 'neonova';
  text: string;
  timestamp: string;
}

interface RealtimeVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject?: string;
  currentGrade?: string;
  curriculumBoard?: string;
  initialContext?: string;
}

export default function RealtimeVoiceModal({
  isOpen,
  onClose,
  currentSubject = 'Mathematics',
  currentGrade = 'Grade 8',
  curriculumBoard = 'CBSE',
  initialContext = ''
}: RealtimeVoiceModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'init-1',
      sender: 'neonova',
      text: `Hello! I'm your NeoNova AI Tutor for ${currentSubject} (${currentGrade}, ${curriculumBoard.toUpperCase()}). Tap the microphone to speak, ask questions, or interrupt me anytime.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  // Setup Web Speech Recognition and Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceAvailable(false);
        setErrorMessage('Speech recognition is not supported in this browser. You can type your questions in AI Homework mode.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage(null);
        };

        recognition.onresult = (event: any) => {
          // INTERRUPTION HANDLING: If the student speaks while NeoNova is talking, STOP speaking immediately!
          if (synthRef.current && synthRef.current.speaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
          }

          let interim = '';
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          setInterimText(interim);

          if (final.trim()) {
            handleStudentVoiceInput(final.trim());
            setInterimText('');
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
            setIsListening(false);
          } else if (event.error === 'no-speech') {
            // Keep listening
          } else {
            setErrorMessage(`Voice mode error: ${event.error}. You can retry or type your query.`);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          // If modal is still open and wasn't manually stopped, auto-restart
          if (isOpen && isListening) {
            try {
              recognition.start();
            } catch {}
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        setVoiceAvailable(false);
        setErrorMessage('Voice engine could not be initialized.');
      }
    }

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setErrorMessage(null);
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    stopSpeaking();

    // Clean markdown symbols for natural speech
    const cleanSpeech = text
      .replace(/[*_~`#]/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\cdot/g, 'times')
      .replace(/\\pm/g, 'plus or minus')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick best English voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleStudentVoiceInput = async (studentText: string) => {
    const studentMsg: VoiceMessage = {
      id: `usr_${Date.now()}`,
      sender: 'student',
      text: studentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, studentMsg]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: studentText,
          subject: currentSubject,
          grade: currentGrade,
          curriculumBoard,
          context: initialContext || (messages.length > 0 ? messages[messages.length - 1].text : '')
        })
      });

      if (!response.ok) {
        throw new Error('AI Voice service response error');
      }

      const data = await response.json();
      const reply = data.reply || "I've analyzed your question. Would you like me to break down any specific step?";

      const aiMsg: VoiceMessage = {
        id: `ai_${Date.now()}`,
        sender: 'neonova',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      speakText(reply);
    } catch (err: any) {
      const errorMsg: VoiceMessage = {
        id: `err_${Date.now()}`,
        sender: 'neonova',
        text: "Voice mode is temporarily unable to connect to the educational server. You can ask again or switch to written mode.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickFollowUp = (phrase: string) => {
    handleStudentVoiceInput(phrase);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[85vh] max-h-[720px] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <NeoNovaLogo size={32} glow />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Real-Time Voice AI Tutor</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {curriculumBoard}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentSubject} &middot; {currentGrade}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Natural educational conversation with instant interruption support
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                title="Mute voice"
              >
                <VolumeX size={18} />
              </button>
            )}
            <button
              onClick={() => {
                stopSpeaking();
                stopListening();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Error Notification if mic is unavailable */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Transcript / Chat Area */}
        <div 
          ref={chatScrollRef}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm font-sans"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'neonova' && (
                <NeoNovaLogo size={28} className="shrink-0 mt-0.5" />
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs whitespace-pre-wrap leading-relaxed ${
                  m.sender === 'student'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                <p>{m.text}</p>
                <span className={`text-[10px] block mt-1.5 font-mono ${m.sender === 'student' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Interim speech recognition preview */}
          {interimText && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 italic animate-pulse">
                &ldquo;{interimText}&rdquo;
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
              <RefreshCw size={14} className="animate-spin" />
              <span>NeoNova is verifying reasoning and preparing spoken reply...</span>
            </div>
          )}
        </div>

        {/* Quick Follow-Up Buttons */}
        <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <CornerDownRight size={12} />
            Quick follow-up:
          </span>
          <button
            onClick={() => handleQuickFollowUp('Why is that formula used?')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Why?
          </button>
          <button
            onClick={() => handleQuickFollowUp('How did you get from step two to step three?')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            How did you get that?
          </button>
          <button
            onClick={() => handleQuickFollowUp('Can you repeat the last calculation step?')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Repeat step
          </button>
          <button
            onClick={() => handleQuickFollowUp('Can you explain that more simply?')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Explain more simply
          </button>
        </div>

        {/* Active Controls Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!voiceAvailable}
              className={`p-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-md cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              <span>{isListening ? 'Stop Listening' : 'Tap to Speak'}</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {isListening ? 'Listening... Speak clearly or interrupt anytime' : 'Tap microphone to start talking'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium">
                <Volume2 size={14} className="animate-bounce" />
                <span>Speaking...</span>
              </div>
            )}
            <button
              onClick={() => {
                stopSpeaking();
                stopListening();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
