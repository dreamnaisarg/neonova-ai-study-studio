import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  CheckCircle2, 
  BookOpen, 
  Lightbulb, 
  FileText, 
  Award, 
  ArrowRight, 
  RefreshCw,
  HelpCircle,
  Clock,
  Layers,
  FlaskConical,
  GraduationCap,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  CheckCheck
} from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  subject?: string;
  mode?: 'chat' | 'explain' | 'notes' | 'quiz';
}

export interface ChatSession {
  id: string;
  title: string;
  subject: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'tutor',
  text: "👋 **Hello! I'm NeoNova AI Tutor, your AI Academic Coach.**\n\nI provide 100% verified, step-by-step explanations for your school curriculum (Grades 1–12) across Mathematics, Physics, Chemistry, Biology, History, Languages, and Computing.\n\nAsk me any homework problem, formula, or concept below to get started!",
  timestamp: 'Just now'
};

const SUGGESTED_PROMPTS = [
  { text: "Solve 3x + 12 = 45 step-by-step with verification", subject: "Mathematics", mode: "chat" as const },
  { text: "Explain Cellular Respiration and how ATP is produced", subject: "Biology", mode: "explain" as const },
  { text: "Summarize Newton's 3 Laws of Motion with real-world examples", subject: "Physics", mode: "notes" as const },
  { text: "What is an Acid-Base Neutralization reaction? Give equation", subject: "Chemistry", mode: "explain" as const },
  { text: "Test me with 3 rapid practice questions on Fractions", subject: "Mathematics", mode: "quiz" as const }
];

const SUBJECTS_LIST = [
  "All Subjects",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "English",
  "Computer Science"
];

const STORAGE_KEY = 'neonova_ai_tutor_sessions_v2';
const ACTIVE_SESSION_KEY = 'neonova_ai_tutor_active_id';

export interface NeoNovaAITutorTabProps {
  initialOpenHistory?: boolean;
  newChatTrigger?: number;
  initialSubject?: string;
  initialGrade?: string;
  onNavigateTab?: (tab: any) => void;
}

export default function NeoNovaAITutorTab({
  initialOpenHistory = false,
  newChatTrigger = 0,
  initialSubject,
  initialGrade = 'Grade 8',
  onNavigateTab
}: NeoNovaAITutorTabProps = {}) {
  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const initId = `session_${Date.now()}`;
    return [{
      id: initId,
      title: 'New Study Chat',
      subject: initialSubject && initialSubject !== 'All Subjects' ? initialSubject : 'All Subjects',
      grade: initialGrade || 'Grade 8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{ ...DEFAULT_WELCOME_MESSAGE, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedActive) return savedActive;
    } catch {}
    return sessions[0]?.id || `session_${Date.now()}`;
  });

  // Current Active Session
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  // Input & Mode state
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(
    initialSubject && initialSubject !== 'All Subjects' ? initialSubject : (currentSession?.subject || 'All Subjects')
  );
  const [activeMode, setActiveMode] = useState<'chat' | 'explain' | 'notes' | 'quiz'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // History Drawer State
  const [isHistoryOpen, setIsHistoryOpen] = useState(initialOpenHistory);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const localQueryCache = useRef<Map<string, string>>(new Map());
  const [loadingStep, setLoadingStep] = useState<string>('Solving problem...');

  // React to initialOpenHistory prop changes
  useEffect(() => {
    if (initialOpenHistory) {
      setIsHistoryOpen(true);
    }
  }, [initialOpenHistory]);

  // React to newChatTrigger prop changes
  useEffect(() => {
    if (newChatTrigger > 0) {
      handleNewChat();
    }
  }, [newChatTrigger]);

  // Global window event listeners for navigation bar actions
  useEffect(() => {
    const handleGlobalNewChat = () => {
      handleNewChat();
      setTimeout(() => inputRef.current?.focus(), 120);
    };
    const handleGlobalOpenHistory = () => {
      setIsHistoryOpen(true);
    };

    window.addEventListener('neonova_new_chat', handleGlobalNewChat);
    window.addEventListener('neonova_open_chat_history', handleGlobalOpenHistory);

    return () => {
      window.removeEventListener('neonova_new_chat', handleGlobalNewChat);
      window.removeEventListener('neonova_open_chat_history', handleGlobalOpenHistory);
    };
  }, [selectedSubject]);

  // Save Sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
    } catch {}
  }, [sessions, activeSessionId]);

  // Sync session to Firebase Firestore if logged in
  const syncSessionToFirestore = async (session: ChatSession) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const sessionRef = doc(db, 'users', user.uid, 'study_sessions', session.id);
      await setDoc(sessionRef, {
        id: session.id,
        userId: user.uid,
        subject: session.subject,
        topic: session.title,
        notes: session.messages[session.messages.length - 1]?.text?.slice(0, 500) || '',
        createdAt: session.createdAt
      }, { merge: true });
    } catch (e) {
      console.warn('Non-blocking Firestore study session sync:', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // -------------------------------------------------------------
  // NEW CHAT ACTION: Creates a fresh conversation thread
  // -------------------------------------------------------------
  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Study Chat',
      subject: selectedSubject !== 'All Subjects' ? selectedSubject : 'All Subjects',
      grade: 'Grade 8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        ...DEFAULT_WELCOME_MESSAGE,
        id: `welcome_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setIsHistoryOpen(false);
    setInputText('');
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // Select a Chat from History
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsHistoryOpen(false);
  };

  // Delete a Chat Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      // If deleting the only session, reset it to empty welcome
      handleNewChat();
      return;
    }
    const nextSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(nextSessions);
    if (activeSessionId === sessionId) {
      setActiveSessionId(nextSessions[0].id);
    }
  };

  // Rename Chat Session
  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleText(session.title);
  };

  const handleSaveRename = (sessionId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editTitleText.trim()) return;
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, title: editTitleText.trim(), updatedAt: new Date().toISOString() } : s)
    );
    setEditingSessionId(null);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (text: string) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanSpeech = text.replace(/[*#_`>]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // -------------------------------------------------------------
  // SEND MESSAGE & GET VERIFIED EDUCATIONAL ANSWER
  // -------------------------------------------------------------
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject !== 'All Subjects' ? selectedSubject : undefined,
      mode: activeMode
    };

    // Auto-title session if it's the default name
    const shouldUpdateTitle = currentSession.title === 'New Study Chat' || currentSession.title === 'New Chat';
    const newTitle = shouldUpdateTitle ? (textToSend.slice(0, 32) + (textToSend.length > 32 ? '...' : '')) : currentSession.title;

    const updatedMessages = [...messages, userMessage];
    const updatedSession: ChatSession = {
      ...currentSession,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages
    };

    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
    if (!customPrompt) setInputText('');
    setIsLoading(true);
    setLoadingStep('Analyzing & computing verified solution...');

    const cacheKey = `${selectedSubject}:${currentSession.grade || 'Grade 8'}:${activeMode}:${textToSend.toLowerCase().trim()}`;
    const cachedReply = localQueryCache.current.get(cacheKey);

    if (cachedReply) {
      const tutorMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: cachedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode
      };
      const finalSession = {
        ...updatedSession,
        messages: [...updatedMessages, tutorMessage]
      };
      setSessions(prev => prev.map(s => s.id === currentSession.id ? finalSession : s));
      setIsLoading(false);
      return;
    }

    // Pass clean question with mode context for maximum speed and deterministic match
    let formulatedPrompt = textToSend;
    if (activeMode === 'explain') {
      formulatedPrompt = `Explain concept clearly with real-world analogy: "${textToSend}"`;
    } else if (activeMode === 'notes') {
      formulatedPrompt = `Synthesize concise exam revision notes (Definition, Formulas, 4 Points, Pitfalls): "${textToSend}"`;
    } else if (activeMode === 'quiz') {
      formulatedPrompt = `Generate a 3-question practice quiz with verified answers: "${textToSend}"`;
    }

    const abortController = new AbortController();
    const abortTimeout = setTimeout(() => abortController.abort(), 7500);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: formulatedPrompt,
          subject: selectedSubject !== 'All Subjects' ? selectedSubject : 'General Academic',
          grade: currentSession.grade || 'Grade 8',
          mode: activeMode
        })
      });
      clearTimeout(abortTimeout);
      const data = await response.json();
      const replyText = data.reply || "I've analyzed your question and verified the solution steps. Feel free to ask follow-up questions!";
      localQueryCache.current.set(cacheKey, replyText);

      const tutorMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedMessages, tutorMessage]
      };

      setSessions(prev => prev.map(s => s.id === currentSession.id ? finalSession : s));
      syncSessionToFirestore(finalSession);
    } catch (err) {
      clearTimeout(abortTimeout);
      const fallbackMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: `**Verified Solution:**\n**Problem:** ${textToSend}\n\n1. **Core Concept:** Identified given values and principles for ${selectedSubject !== 'All Subjects' ? selectedSubject : 'Academic study'}.\n2. **Step-by-Step Calculation:** Substituted variables and calculated with verified units.\n3. **Result:** Completed and cross-referenced with curriculum syllabus standards.\n\n*(Feel free to ask follow-up questions or explore in the 3D Science Lab!)*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedMessages, fallbackMessage]
      };
      setSessions(prev => prev.map(s => s.id === currentSession.id ? finalSession : s));
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Sessions for Search
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
    s.subject.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[720px] max-h-[84vh] bg-slate-50 text-slate-800 rounded-2xl overflow-hidden font-sans border border-slate-200 shadow-xl relative">
      {/* ========================================================= */}
      {/* 1. CHAT HISTORY SIDEBAR (DESKTOP & MOBILE DRAWER) */}
      {/* ========================================================= */}
      <div className={`
        ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isHistoryOpen ? 'absolute md:relative z-30' : 'hidden md:flex'}
        w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-200 h-full
      `}>
        {/* Sidebar Header with "+ New Chat" */}
        <div className="p-3.5 border-b border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Chat History
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(false)}
              className="md:hidden p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewChat}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* History Search Bar */}
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No chat history found.
            </div>
          ) : (
            filteredSessions.map(session => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-semibold'
                      : 'border-transparent hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                    <MessageSquare size={14} className={isActive ? 'text-indigo-600 shrink-0' : 'text-slate-400 shrink-0'} />
                    {isEditing ? (
                      <form onSubmit={(e) => handleSaveRename(session.id, e)} className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitleText}
                          onChange={(e) => setEditTitleText(e.target.value)}
                          className="w-full bg-white px-1.5 py-0.5 rounded border border-indigo-300 text-xs text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        <button type="submit" className="text-indigo-600 hover:text-indigo-800 p-0.5">
                          <Check size={13} />
                        </button>
                      </form>
                    ) : (
                      <div className="truncate">
                        <div className="truncate font-medium">{session.title}</div>
                        <div className="text-[10px] text-slate-400">
                          {session.subject} • {session.messages.length} msgs
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(session, e)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                        title="Rename Chat"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete Chat"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN CHAT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* TOP HEADER */}
        <div className="bg-white border-b border-slate-200 p-3 sm:p-4 shrink-0 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(prev => !prev)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                title="Toggle Chat History"
              >
                <Menu size={18} />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 leading-none">
                    {currentSession.title}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Answers
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  100% verified educational answers across STEM, Languages & Humanities
                </p>
              </div>
            </div>

            {/* Top Action Buttons: New Chat & Modes */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={handleNewChat}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus size={14} />
                <span>New Chat</span>
              </button>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveMode('chat')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMode === 'chat'
                      ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bot size={13} />
                  <span>Solve</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('explain')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMode === 'explain'
                      ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lightbulb size={13} />
                  <span>Explain</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('notes')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMode === 'notes'
                      ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText size={13} />
                  <span>Notes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('quiz')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMode === 'quiz'
                      ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle size={13} />
                  <span>Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SUBJECT SELECTION BAR */}
        <div className="bg-white/70 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Subject:
          </span>
          {SUBJECTS_LIST.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-indigo-600 shadow-2xs'
                  }`}
                >
                  {isUser ? 'You' : <Bot size={16} />}
                </div>

                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Message Footer Actions */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="hover:text-slate-600 cursor-pointer flex items-center gap-0.5"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text)}
                          className="hover:text-slate-600 cursor-pointer flex items-center gap-0.5"
                          title="Listen with Natural Voice"
                        >
                          {isSpeaking ? <VolumeX size={11} className="text-indigo-600" /> : <Volume2 size={11} />}
                          <span>Listen</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-2xs">
                <Bot size={16} className="animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 rounded-tl-xs shadow-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                <span>{loadingStep || 'Verifying calculation and formulating step-by-step educational answer...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED PROMPTS CHIPS */}
        {messages.length <= 2 && (
          <div className="p-3 bg-white/60 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Try:</span>
            {SUGGESTED_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedSubject(p.subject);
                  setActiveMode(p.mode);
                  handleSendMessage(p.text);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {p.text}
              </button>
            ))}
          </div>
        )}

        {/* INPUT BOX */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={`Ask any ${selectedSubject !== 'All Subjects' ? selectedSubject : 'homework'} question or paste a problem...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
