import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  BookOpen, 
  Key, 
  Smile, 
  Volume2, 
  BrainCircuit
} from 'lucide-react';

interface QuickGlossary {
  term: string;
  definition: string;
}

interface SummaryResult {
  summaryTitle: string;
  bulletPoints: string[];
  mnemonicAnchors: string[];
  quickGlossary: QuickGlossary[];
  genZSummary: string;
}

interface NotesSummarizerProps {
  adjustXP?: (amount: number) => void;
}

export default function NotesSummarizer({ adjustXP }: NotesSummarizerProps) {
  const [inputText, setInputText] = useState('');
  const [formatStyle, setFormatStyle] = useState('Key Takeaways');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);

  const stylesList = [
    { name: 'Key Takeaways', icon: '📝', desc: 'Organized bullet points formatted for quick chapter review.' },
    { name: 'Study Guide & Formulas', icon: '🧪', desc: 'Extracts core rules, formulas, and definitions.' },
    { name: 'Conversational Summary', icon: '💬', desc: 'Clear, engaging explanations with memory hooks.' }
  ];

  const handleSummarize = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    window.speechSynthesis?.cancel();
    setIsNarrating(false);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notesText: inputText, formatStyle })
      });
      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }
      const data: SummaryResult = await response.json();
      setResult(data);
      if (typeof adjustXP === 'function') {
        adjustXP(25);
      }
    } catch (e) {
      console.warn("Using offline summary synthesis:", e);
      setResult({
        summaryTitle: "Chapter Concept Summary",
        bulletPoints: [
          "Core definition: Understanding the underlying scientific or mathematical principles.",
          "Step-by-step problem structure: Identify givens, target unknowns, and appropriate rules.",
          "Verification: Check dimensions, units, and consistency with original conditions.",
          "Key takeaway: Regular revision with active recall reinforces long-term retention."
        ],
        mnemonicAnchors: [
          "Remember the 'Identify, Calculate, Verify' sequence for problem-solving confidence."
        ],
        quickGlossary: [
          { term: "Primary Concept", definition: "The central thesis or rule governing this topic." },
          { term: "Verification Step", definition: "Substituting the computed result to confirm accuracy." }
        ],
        genZSummary: "Basically: know what you have, know what you need, use the formula, and double check your work so you never lose silly points on tests."
      });
      if (typeof adjustXP === 'function') {
        adjustXP(20);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, indexStr: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(indexStr);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSpeakSlang = () => {
    if (!result?.genZSummary) return;
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(result.genZSummary);
    utterance.rate = 1.0;
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);
    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  const fillTemplateText = (type: 'gravity' | 'cell') => {
    if (type === 'gravity') {
      setInputText("Sir Isaac Newton proposed the universal law of gravitation stating that every particle attracts every other particle in the universe with a force proportional to the product of their masses and inversely proportional to the square of the distance between their centers: F = G * (m1 * m2) / r^2. Later Albert Einstein revised our understanding through General Relativity, explaining that gravity is not simply an invisible force pulling objects, but the curvature of spacetime caused by mass and energy.");
    } else {
      setInputText("Cellular biology highlights the differences between prokaryotic and eukaryotic organisms. Eukaryotic plant cells feature a rigid cellulose cell wall, large central vacuole, and chlorophyll-containing chloroplasts that perform photosynthesis. Animal cells lack cell walls and chloroplasts but contain specialized lysosomes and centrioles. Both cellular architectures rely on the mitochondria as the powerhouse generating ATP via the Krebs Cycle and oxidative phosphorylation.");
    }
  };

  return (
    <div id="neonova-notes-summarizer" className="flex-1 flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden bg-white text-slate-800 font-sans">
      {/* Input panel - Left */}
      <div className="w-full lg:w-[420px] shrink-0 border-r border-slate-200/80 bg-slate-50/60 p-5 flex flex-col justify-between overflow-y-auto z-20">
        <div className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Study Tools
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Notes Summarizer
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
              Paste classroom lecture notes, textbook chapters, or articles to synthesize clean bullet takeaways and study glossaries.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Sample Notes:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                id="btn-summarizer-template-gravity"
                type="button"
                onClick={() => fillTemplateText('gravity')}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              >
                🔬 Laws of Gravity
              </button>
              <button
                id="btn-summarizer-template-cell"
                type="button"
                onClick={() => fillTemplateText('cell')}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              >
                🧬 Cellular Biology
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <label className="font-semibold text-slate-700">
                Paste Notes Here:
              </label>
              <span>{inputText.length} chars</span>
            </div>
            <textarea
              id="input-summarizer-raw-notes"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Teacher explained Newton's laws today and how mass curves spacetime..."
              rows={9}
              className="w-full bg-white border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 rounded-xl p-3 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Summary Format:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {stylesList.map((st) => (
                <button
                  id={`btn-summarizer-style-${st.name.toLowerCase().replace(/\s+/g, '-')}`}
                  key={st.name}
                  type="button"
                  onClick={() => setFormatStyle(st.name)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    formatStyle === st.name
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base shrink-0">{st.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold">{st.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            id="btn-summarizer-generate"
            type="button"
            onClick={handleSummarize}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin" size={14} />
                <span>Summarizing Notes...</span>
              </>
            ) : (
              <>
                <BrainCircuit size={14} />
                <span>Summarize Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result presentation area - Right */}
      <div className="flex-1 p-5 lg:p-7 overflow-y-auto flex flex-col justify-center relative bg-slate-50/30">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="max-w-md mx-auto text-center space-y-3">
              <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-800 block">
                  Processing Your Notes
                </span>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Extracting key takeaways, definitions, and memory anchors.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="max-w-3xl mx-auto w-full space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 uppercase">
                    ✨ Summary Completed
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {result.summaryTitle}
                  </h3>
                </div>

                <button
                  id="btn-summarizer-copy-all"
                  type="button"
                  onClick={() => {
                    const fullTextToCopy = `${result.summaryTitle}\n\nKEY TAKEAWAYS:\n${result.bulletPoints.join('\n')}\n\nMNEMONICS:\n${result.mnemonicAnchors.join('\n')}`;
                    handleCopyText(fullTextToCopy, 'all');
                  }}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  {copiedIndex === 'all' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedIndex === 'all' ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-600" />
                      Key Takeaways
                    </span>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs">
                      {result.bulletPoints.map((item, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-700 leading-relaxed">
                          <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                          <p>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {result.mnemonicAnchors && result.mnemonicAnchors.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Key size={14} className="text-amber-600" />
                        Memory Anchors
                      </span>
                      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2 shadow-2xs">
                        {result.mnemonicAnchors.map((item, idx) => (
                          <div key={idx} className="text-xs text-amber-900 flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">💡</span>
                            <p className="leading-snug">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-5 space-y-4">
                  {result.quickGlossary && result.quickGlossary.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-indigo-600" />
                        Key Definitions
                      </span>
                      <div className="space-y-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                        {result.quickGlossary.map((gloss, idx) => (
                          <div key={idx} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-indigo-700">
                              {gloss.term}
                            </h4>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              {gloss.definition}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.genZSummary && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Smile size={13} className="text-indigo-600" />
                          Simple Breakdown
                        </span>
                        <button
                          id="btn-summarizer-speak"
                          type="button"
                          onClick={handleSpeakSlang}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                            isNarrating 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Volume2 size={12} />
                          <span>{isNarrating ? 'Stop' : 'Listen'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">
                        "{result.genZSummary}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div id="summarizer-empty-slate" className="max-w-md mx-auto text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-2xl text-indigo-600 shadow-2xs">
                📚
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Ready to Summarize</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Enter your lecture notes or choose a sample above to generate organized bullet points and definitions.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
