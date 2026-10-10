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
  GraduationCap
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  subject?: string;
  mode?: 'chat' | 'explain' | 'notes' | 'quiz';
}

const SUGGESTED_PROMPTS = [
  { text: "Explain Photosynthesis with an easy real-world analogy", subject: "Biology", mode: "explain" },
  { text: "Solve 2x + 7 = 23 step-by-step with explanation", subject: "Mathematics", mode: "chat" },
  { text: "Summarize Newton's 3 Laws of Motion into 3 bullet points", subject: "Physics", mode: "notes" },
  { text: "Why do we have different seasons on Earth?", subject: "Science", mode: "explain" },
  { text: "Test me with 3 rapid questions on Chemical Bonds", subject: "Chemistry", mode: "quiz" }
];

const SUBJECTS_LIST = [
  "All Subjects",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "English"
];

export default function NeoNovaAITutorTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: "👋 **Hello! I'm NeoNova AI Tutor, your AI Academic Companion & Study Coach.**\n\nI can explain tough textbook concepts, walk you through homework problems step-by-step, generate quick revision summaries, or quiz you before an exam.\n\nWhat are you studying today? Pick a topic or type any question below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [activeMode, setActiveMode] = useState<'chat' | 'explain' | 'notes' | 'quiz'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    let formulatedPrompt = textToSend;
    if (activeMode === 'explain') {
      formulatedPrompt = `Please explain the following concept in super simple, crystal-clear terms suitable for a student, using intuitive everyday metaphors and real-world analogies: "${textToSend}"`;
    } else if (activeMode === 'notes') {
      formulatedPrompt = `Please synthesize a high-yield study sheet for the following topic with: 1) Core Definition, 2) Key Rules/Formulas, 3) 4 Clear Bullet Points, 4) Common Exam Pitfalls: "${textToSend}"`;
    } else if (activeMode === 'quiz') {
      formulatedPrompt = `Generate a rapid 3-question multiple-choice practice quiz with answers and explanations for: "${textToSend}". Format each question clearly with options A, B, C, D and provide the correct answer with reasoning.`;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formulatedPrompt,
          subject: selectedSubject !== 'All Subjects' ? selectedSubject : 'General Academic',
          grade: 'Grade 8'
        })
      });
      const data = await response.json();
      const replyText = data.reply || "I've structured a response for you. Feel free to ask follow-up questions!";

      const tutorMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode
      };
      setMessages(prev => [...prev, tutorMessage]);
    } catch (err) {
      const fallbackMessage: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: `Here is a clear breakdown for **${textToSend}**:\n\n1. **Core Concept:** Break the question down into its known inputs and target answer.\n2. **Step-by-step Rule:** Apply the relevant rule or formula.\n3. **Sanity Check:** Always verify if your final calculation makes logical sense.\n\n*(Feel free to ask me to dive deeper into any specific step!)*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] max-h-[82vh] bg-slate-50 text-slate-800 rounded-2xl overflow-hidden font-sans border border-slate-200">
      {/* TOP HEADER */}
      <div className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 leading-none">
                  NeoNova AI Tutor
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Coach
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Curriculum assistance, concept simplification & rapid exam preparation
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'chat'
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot size={13} />
              <span>Ask Tutor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('explain')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'explain'
                  ? 'bg-white text-amber-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb size={13} />
              <span>Explain Simply</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('notes')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'notes'
                  ? 'bg-white text-purple-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={13} />
              <span>Revision Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('quiz')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'quiz'
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award size={13} />
              <span>Quick Quiz</span>
            </button>
          </div>
        </div>

        {/* SUBJECT SELECTION PILLS */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mr-1">Subject:</span>
          {SUBJECTS_LIST.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* CHAT STREAM CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-2xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="hover:text-indigo-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleSpeakText(msg.text)}
                        className="hover:text-indigo-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                        title="Listen to Explanation"
                      >
                        <Volume2 size={11} />
                        <span>Listen</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  You
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500 font-medium">
              <RefreshCw size={14} className="animate-spin text-indigo-600" />
              <span>NeoNova AI Tutor is thinking & structuring your explanation...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/80 overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Try asking:</span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedSubject(prompt.subject);
                  setActiveMode(prompt.mode as any);
                  handleSendMessage(prompt.text);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-[11px] font-medium text-slate-700 hover:text-indigo-700 transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT FORM CONTAINER */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeMode === 'explain'
                  ? 'Enter a term or concept to simplify (e.g. Gravity, Mitosis, Supply & Demand)...'
                  : activeMode === 'notes'
                  ? 'Enter a chapter or topic for revision cheat-sheets...'
                  : activeMode === 'quiz'
                  ? 'Enter a subject/topic to get a 3-question quiz...'
                  : 'Ask NeoNova AI Tutor any homework question, formula, or concept...'
              }
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl py-3 pl-4 pr-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <span>Ask</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

export { NeoNovaAITutorTab as AvaCompanionTab };
