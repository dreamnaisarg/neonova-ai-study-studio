import React, { useRef, useEffect, useState } from 'react';
import { 
  Camera, 
  Paperclip, 
  Mic, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RefreshCw, 
  Lightbulb, 
  ListOrdered, 
  Plus, 
  Trash2, 
  ChevronDown, 
  BookOpen, 
  ArrowRight, 
  Loader2,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  Sparkle
} from 'lucide-react';
import { Notebook, Message } from '../../types';
import { formatTutorResponse, stripAllSymbolsForPlaintext } from '../../utils';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface HomeworkHelperViewProps {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  onSelectNotebook: (id: string) => void;
  onCreateNotebook: (subject?: string, grade?: string) => void;
  onDeleteNotebook: (id: string) => void;
  inputMessage: string;
  setInputMessage: (val: string) => void;
  attachedImage: { mimeType: string; data: string } | null;
  setAttachedImage: (img: { mimeType: string; data: string } | null) => void;
  isLoading: boolean;
  apiError: string | null;
  onSendMessage: (e?: React.FormEvent) => void;
  onOpenScanner: () => void;
  isDictating: boolean;
  onToggleDictation: () => void;
  currentNarratingId: string | null;
  onToggleSpeak: (id: string, text: string) => void;
  bypassTeacherDetector: boolean;
  setBypassTeacherDetector: (val: boolean) => void;
  onOpenHelpMeUnderstand: (question: string, answer?: string, subject?: string, grade?: string) => void;
  currentGrade: string;
  currentSubject?: string;
  onOpenVoice?: () => void;
  onSwitchToDeepSolver?: () => void;
}

export default function HomeworkHelperView({
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onCreateNotebook,
  onDeleteNotebook,
  inputMessage,
  setInputMessage,
  attachedImage,
  setAttachedImage,
  isLoading,
  apiError,
  onSendMessage,
  onOpenScanner,
  isDictating,
  onToggleDictation,
  currentNarratingId,
  onToggleSpeak,
  bypassTeacherDetector,
  setBypassTeacherDetector,
  onOpenHelpMeUnderstand,
  currentGrade,
  currentSubject = 'Mathematics',
  onOpenVoice,
  onSwitchToDeepSolver
}: HomeworkHelperViewProps) {
  const activeNotebook = notebooks.find(n => n.id === activeNotebookId) || notebooks[0];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeNotebook?.messages, isLoading]);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(stripAllSymbolsForPlaintext(text));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn("Clipboard copy failed", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const commaIndex = base64String.indexOf(',');
      if (commaIndex !== -1) {
        setAttachedImage({
          mimeType: file.type || 'image/jpeg',
          data: base64String.substring(commaIndex + 1)
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Quick Action Prompts for responses
  const handleActionPrompt = (actionType: 'explain_again' | 'simplify' | 'show_steps' | 'similar_question', lastAnswer?: string, lastQuestion?: string) => {
    if (actionType === 'explain_again') {
      setInputMessage("Please explain this solution again with an alternative pedagogical approach.");
    } else if (actionType === 'simplify') {
      setInputMessage("Please simplify this explanation using a crystal-clear everyday analogy.");
    } else if (actionType === 'show_steps') {
      setInputMessage("Break down the working steps with explicit numbered formulas and calculations.");
    } else if (actionType === 'similar_question') {
      if (lastQuestion) {
        onOpenHelpMeUnderstand(lastQuestion, lastAnswer, activeNotebook?.subject, activeNotebook?.grade);
      } else {
        setInputMessage("Give me 1 similar practice problem with hints to test my mastery of this concept.");
      }
    }
  };

  const samplePrompts = [
    { title: "Solve linear equation", text: "Solve for x: 3x - 5 = 16 with step-by-step working" },
    { title: "Explain photosynthesis", text: "Explain light-dependent and Calvin cycle reactions in photosynthesis" },
    { title: "French Passé Composé", text: "How does agreement work with être in passé composé in French?" },
    { title: "Binary to Decimal", text: "Convert binary 11001 to decimal and show the powers of 2 calculation" }
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100dvh-170px)] sm:h-[calc(100dvh-135px)] min-h-[480px] max-h-[960px] bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden font-sans">
      
      {/* 1. Sleek Apple-style Cockpit Header */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-10">
        
        {/* Left: Brand Identity & Active Subject */}
        <div className="flex items-center gap-3 min-w-0">
          <NeoNovaLogo size={34} glow className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                AI Homework Helper
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                {activeNotebook?.subject || currentSubject}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {currentGrade} &middot; Adaptive Step-by-Step Tutor
            </p>
          </div>
        </div>

        {/* Right: Actions, Sessions Dropdown & Modes */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Deep Verification Mode Switcher */}
          {onSwitchToDeepSolver && (
            <button
              type="button"
              onClick={onSwitchToDeepSolver}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200/60"
              title="Open Diagram OCR & Verification Inspector"
            >
              <Layers size={13} className="text-indigo-600" />
              <span>Deep Solver</span>
            </button>
          )}

          {/* Voice Tutor Button */}
          {onOpenVoice && (
            <button
              type="button"
              onClick={onOpenVoice}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-200/80 flex items-center gap-1"
              title="Talk Live with Voice Tutor"
            >
              <Mic size={14} className="text-indigo-600" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>
          )}

          {/* Notebook Session Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSessionDropdownOpen(!sessionDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <BookOpen size={13} className="text-slate-500" />
              <span className="max-w-[100px] truncate">{activeNotebook?.title || 'Session'}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {sessionDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saved Sessions</span>
                  <button
                    type="button"
                    onClick={() => {
                      onCreateNotebook(currentSubject, currentGrade);
                      setSessionDropdownOpen(false);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>New</span>
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {notebooks.map(nb => (
                    <div 
                      key={nb.id}
                      className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                        nb.id === activeNotebookId ? 'bg-indigo-50/70 text-indigo-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        onSelectNotebook(nb.id);
                        setSessionDropdownOpen(false);
                      }}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate">{nb.title}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{nb.subject} &middot; {nb.messages.length} msgs</p>
                      </div>
                      {notebooks.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotebook(nb.id);
                          }}
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-md"
                          title="Delete Session"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Messages Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 bg-slate-50/50"
      >
        {activeNotebook && activeNotebook.messages.length > 0 ? (
          activeNotebook.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs mt-1">
                    <Sparkles size={15} />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[80%] space-y-2`}>
                  
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed transition-all shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {/* Attached Photo Preview */}
                    {msg.image && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-w-xs bg-black/10 shadow-inner">
                        <img
                          src={`data:${msg.image.mimeType};base64,${msg.image.data}`}
                          alt="Homework Problem"
                          className="w-full max-h-56 object-contain"
                        />
                      </div>
                    )}

                    {/* AI Verified Badge Header */}
                    {!isUser && (
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <ShieldCheck size={13} className="text-emerald-600" />
                          <span>Verified Solution Engine</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.timestamp || 'Now'}
                        </span>
                      </div>
                    )}

                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      <div className="space-y-1.5 prose prose-slate max-w-none text-xs sm:text-sm">
                        {formatTutorResponse(msg.content)}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for AI Response */}
                  {!isUser && (
                    <div className="space-y-2 pt-0.5 px-1">
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={12} className="text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <span>&middot;</span>
                        <button
                          type="button"
                          onClick={() => onToggleSpeak(msg.id, msg.content)}
                          className="hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {currentNarratingId === msg.id ? (
                            <>
                              <VolumeX size={12} className="text-indigo-600" />
                              <span className="text-indigo-600 font-bold">Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Educational Action Prompts below AI answers */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleActionPrompt('explain_again', msg.content)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <RefreshCw size={11} className="text-slate-500" />
                          <span>Explain Again</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionPrompt('simplify', msg.content)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Lightbulb size={11} className="text-amber-500" />
                          <span>Simplify Analogy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionPrompt('show_steps', msg.content)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <ListOrdered size={11} className="text-indigo-500" />
                          <span>Show Working Steps</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionPrompt('similar_question', msg.content, activeNotebook.messages[index - 1]?.content)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/90 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Sparkles size={11} className="text-indigo-600" />
                          <span>Practice Similar Question</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 select-none mt-1">
                    You
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Empty State: Inspiring Educational Suggestions */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <BookOpen size={28} />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-bold text-slate-900">
                Ready for your {activeNotebook?.subject || currentSubject} Homework
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan worksheet pages with your camera, attach photos, or type any homework question to receive step-by-step verified explanations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg pt-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputMessage(p.text)}
                  className="p-3 text-left rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all text-xs cursor-pointer group"
                >
                  <p className="font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                    <span>{p.title}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
              <Sparkles size={15} />
            </div>
            <div className="bg-white border border-slate-200/90 p-4 rounded-3xl rounded-bl-xs text-xs text-slate-600 flex items-center gap-2.5 shadow-xs">
              <Loader2 size={15} className="animate-spin text-indigo-600" />
              <span>NeoNova is verifying calculations and crafting step-by-step explanation...</span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {apiError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{apiError}</span>
            <button
              onClick={() => onSendMessage()}
              className="text-xs font-bold underline hover:no-underline ml-2"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 3. Modern Apple-level Input Dock */}
      <div className="p-3 sm:p-4 border-t border-slate-100 bg-white space-y-2.5 shrink-0">
        
        {/* Attached Photo Preview Bar */}
        {attachedImage && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <img
                src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`}
                alt="Selected homework"
                className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-2xs"
              />
              <div>
                <p className="text-xs font-bold text-slate-800">Homework Photo Attached</p>
                <p className="text-[10px] text-slate-500">Ready to solve with multimodal OCR</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Remove attachment"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Input Form Bar */}
        <form onSubmit={onSendMessage} className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Camera Scanner Button */}
          <button
            type="button"
            onClick={onOpenScanner}
            disabled={isLoading}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Scan Homework with Camera"
          >
            <Camera size={18} />
          </button>

          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Upload Photo / Worksheet"
          >
            <Paperclip size={18} />
          </button>

          {/* Voice Dictation Button */}
          <button
            type="button"
            onClick={onToggleDictation}
            disabled={isLoading}
            className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-2xl transition-all cursor-pointer disabled:opacity-50 shrink-0 ${
              isDictating 
                ? 'bg-rose-600 text-white animate-pulse shadow-md' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isDictating ? "Stop recording..." : "Dictate question with voice"}
          >
            <Mic size={18} />
          </button>

          {/* Main Input Text Field */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            placeholder={
              attachedImage 
                ? "Describe what to solve in the attached photo..."
                : `Ask any ${activeNotebook?.subject || currentSubject} question...`
            }
            className="flex-1 min-w-0 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-inner"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!inputMessage.trim() && !attachedImage)}
            className="h-10 sm:h-11 px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-2xl transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <span className="hidden sm:inline">Ask</span>
            <Send size={14} />
          </button>
        </form>

        {/* Tone and Grade Indicator Footnote */}
        <div className="flex items-center justify-between px-1.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Tone:</span>
            <button
              type="button"
              onClick={() => setBypassTeacherDetector(!bypassTeacherDetector)}
              className={`hover:underline cursor-pointer font-bold ${
                bypassTeacherDetector ? 'text-amber-600' : 'text-slate-600'
              }`}
            >
              {bypassTeacherDetector ? 'Colloquial Student Voice' : 'Formal Academic'}
            </button>
          </div>
          <span className="font-mono text-[10px]">
            {currentGrade} &middot; Multi-subject Accuracy Engine
          </span>
        </div>
      </div>
    </div>
  );
}
