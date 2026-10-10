import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  Bookmark, 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Flame, 
  ThumbsUp, 
  ThumbsDown,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Notebook } from '../types';
import { updateTopicMastery } from '../lib/progressStorage';

interface Flashcard {
  question: string;
  answer: string;
  hint: string;
  mnemonic: string;
}

interface MemoryBoosterProps {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  adjustXP?: (amount: number) => void;
}

export default function MemoryBooster({ notebooks, activeNotebookId, adjustXP }: MemoryBoosterProps) {
  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  const [cards, setCards] = useState<Flashcard[]>([
    {
      question: "What is the primary role of chlorophyll in photosynthesis?",
      answer: "Chlorophyll absorbs photon wavelengths (primarily blue and red light), transferring excitation energy to produce ATP and NADPH for carbohydrate synthesis.",
      hint: "It resides inside the thylakoid membranes of chloroplasts.",
      mnemonic: "💡 Think 'CH-LORA-FILL' as 'fill with light' — Chlorophyll's job is literally to fill the cell with solar energy!"
    },
    {
      question: "Why does water exhibit unusually high surface tension?",
      answer: "Due to the polarity of H₂O molecules creating strong electrostatic hydrogen bonding between molecules at the air-water interface.",
      hint: "Think about the partial positive hydrogen and partial negative oxygen poles.",
      mnemonic: "💡 Hydrogen bonds act like atomic 'handshakes' — they hold on so tightly that lightweight insects can walk on water!"
    },
    {
      question: "What does Coulomb's Law state?",
      answer: "The electrostatic force between two point charges is directly proportional to the product of their charges, and inversely proportional to the square of the distance between them.",
      hint: "Formula: F = k * (|q1 * q2|) / r²",
      mnemonic: "💡 Think of charges as 'Cool Magnets' — double the distance, and the attraction drops to one-quarter!"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [scoreTracker, setScoreTracker] = useState<{ [key: number]: 'easy' | 'hard' | null }>({});
  const activeCard = cards[currentIndex] || null;
  const [boosterPoints, setBoosterPoints] = useState(120);

  const handleAutoExtractCards = async () => {
    if (!activeNotebook) {
      setErrorObj("Please select an active notebook with questions to extract flashcards.");
      return;
    }

    const dialogueDump = activeNotebook.messages
      .map(m => `${m.role === 'user' ? 'Student question' : 'Tutor explanation'}: ${m.content}`)
      .join('\n\n');

    if (!dialogueDump.trim()) {
      setErrorObj("Your notebook is currently empty. Ask NeoNova a few questions first!");
      return;
    }

    setIsGenerating(true);
    setErrorObj(null);
    setIsFlipped(false);
    setShowHint(false);

    try {
      const res = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: dialogueDump })
      });
      if (!res.ok) {
        throw new Error(`Failed to generate flashcards (code ${res.status})`);
      }
      const newCardsData = await res.json();
      const newCards: Flashcard[] = newCardsData.cards || newCardsData;
      if (Array.isArray(newCards) && newCards.length > 0) {
        setCards(newCards);
        setCurrentIndex(0);
        setScoreTracker({});
        if (typeof adjustXP === 'function') {
          adjustXP(30);
        }
      } else {
        throw new Error("Could not parse flashcards from notebook text.");
      }
    } catch (err: any) {
      console.warn("Using local card compilation:", err);
      setErrorObj("Auto-generation was unavailable. Using offline study deck.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleMarkConfidence = (style: 'easy' | 'hard') => {
    setScoreTracker(prev => ({
      ...prev,
      [currentIndex]: style
    }));
    const earned = style === 'easy' ? 20 : 10;
    setBoosterPoints(prev => prev + earned);
    if (typeof adjustXP === 'function') {
      adjustXP(earned);
    }
    
    const sub = activeNotebook?.subject || 'General Science';
    const topic = activeCard?.question.substring(0, 40) || 'Flashcard Recall';
    updateTopicMastery(topic, sub, style === 'easy' ? 90 : 55);

    setTimeout(() => {
      handleNext();
    }, 400);
  };

  const totalStudiedCount = Object.keys(scoreTracker).length;

  return (
    <div id="neonova-memory-cards-booster" className="flex-1 flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden bg-white text-slate-800 font-sans">
      {/* Configuration Panel - Left */}
      <div className="w-full lg:w-80 shrink-0 border-r border-slate-200/80 bg-slate-50/60 p-5 flex flex-col justify-between overflow-y-visible lg:overflow-y-auto z-20">
        <div className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              ⚡ Memory Booster
            </span>
            <h2 className="text-sm font-bold text-slate-900 mt-1.5">
              Active Recall Flashcards
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Convert notebook questions into flashcards with mnemonic associations for rapid exam preparation.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Active Study Notebook
            </span>
            {activeNotebook ? (
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  📘 {activeNotebook.title}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {activeNotebook.messages.length} exchanges
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 block leading-tight">
                No active notebook selected. Ask questions in the Homework Helper first!
              </span>
            )}

            <button
              id="btn-trigger-notes-extraction"
              type="button"
              disabled={isGenerating || !activeNotebook || activeNotebook.messages.length === 0}
              onClick={handleAutoExtractCards}
              className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-40 text-white font-semibold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={13} />
                  <span>Extracting Flashcards...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Convert Active Notes</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block">
              Study Metrics
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">BOOSTER XP</div>
                <div className="text-amber-600 text-sm font-bold mt-0.5 flex items-center justify-center gap-1">
                  <Flame size={12} className="text-amber-500 fill-amber-500" />
                  <span>{boosterPoints} XP</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">CARDS REVIEWED</div>
                <div className="text-slate-900 text-sm font-bold mt-0.5">
                  {totalStudiedCount} / {cards.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {errorObj && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{errorObj}</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
          <p className="leading-relaxed">
            Rate cards as <strong>Needs Practice</strong> or <strong>Mastered</strong> to track your recall confidence.
          </p>
        </div>
      </div>

      {/* Main Flashcard Carousel Stage */}
      <div className="flex-1 p-5 md:p-8 flex flex-col justify-between overflow-y-visible lg:overflow-y-auto bg-slate-50/30">
        {activeCard ? (
          <div className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-between space-y-6 py-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Bookmark size={13} className="fill-indigo-600 text-indigo-600" />
                <span>Card {currentIndex + 1} of {cards.length}</span>
              </span>
              <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}% Complete</span>
            </div>

            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full flex-1 min-h-[300px] bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 relative flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden select-none"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isFlipped 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {isFlipped ? 'Answer & Mnemonic' : 'Question'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isFlipped ? 'Click card to view question' : 'Click card to reveal answer'}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center py-6 text-center">
                {!isFlipped ? (
                  <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-relaxed max-w-md mx-auto">
                    {activeCard.question}
                  </h3>
                ) : (
                  <div className="space-y-4 max-w-md mx-auto text-left">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Answer Explanation:
                      </span>
                      <p className="text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                        {activeCard.answer}
                      </p>
                    </div>
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                        💡 Mnemonic Recall Hook:
                      </span>
                      <p className="text-xs text-amber-900 leading-relaxed font-normal">
                        {activeCard.mnemonic}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  id="btn-view-card-hint"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle size={13} className="text-amber-600" />
                  <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <RotateCw size={12} className="text-slate-400" />
                  <span>Tap to Flip</span>
                </div>
              </div>

              {showHint && !isFlipped && (
                <div className="absolute inset-x-4 bottom-14 bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-xs text-indigo-900 font-medium shadow-sm flex items-start gap-2 z-30">
                  <Info size={14} className="shrink-0 mt-0.5 text-indigo-600" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-indigo-700 mb-0.5">Study Clue</span>
                    <span>{activeCard.hint}</span>
                  </div>
                </div>
              )}
            </div>

            {isFlipped && (
              <div className="space-y-2">
                <span className="text-center text-xs font-medium text-slate-500 block">
                  Self-Assess Your Recall:
                </span>
                <div className="flex gap-3 justify-center">
                  <button
                    id="btn-assess-hard"
                    type="button"
                    onClick={() => handleMarkConfidence('hard')}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-98"
                  >
                    <ThumbsDown size={14} />
                    <span>Needs Practice</span>
                  </button>
                  <button
                    id="btn-assess-easy"
                    type="button"
                    onClick={() => handleMarkConfidence('easy')}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-98"
                  >
                    <ThumbsUp size={14} />
                    <span>Mastered (+20 XP)</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <button
                id="btn-prev-flashcard"
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </button>
              <div className="text-xs font-semibold text-slate-700">
                {currentIndex + 1} of {cards.length}
              </div>
              <button
                id="btn-next-flashcard"
                type="button"
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>Next</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <Bookmark size={36} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">No Flashcards Available</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select an active notebook on the left to generate customized flashcards from your study session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
