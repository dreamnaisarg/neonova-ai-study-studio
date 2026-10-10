import React, { useState } from 'react';
import { Sparkles, HelpCircle, Layers, PlayCircle, CheckCircle2 } from 'lucide-react';

interface Formula {
  id: string;
  expression: string;
  name: string;
  category: string;
  proofSteps: string[];
  examplePrompt: string;
  exampleAnswer: string;
}

export default function FormulaRoom() {
  const [activeFormulaId, setActiveFormulaId] = useState<string>('pythagoras');
  const [currentProofStep, setCurrentProofStep] = useState(0);
  const [solvedState, setSolvedState] = useState<string | null>(null);
  const [userSolution, setUserSolution] = useState('');
  const [mobileTab, setMobileTab] = useState<'formulas' | 'proof' | 'solver'>('formulas');

  const formulas: Formula[] = [
    {
      id: 'pythagoras',
      expression: 'a² + b² = c²',
      name: "Pythagorean Theorem",
      category: "Geometry",
      proofSteps: [
        "1. Construct a right-angled triangle with sides (a) and (b), and hypotenuse (c).",
        "2. Form an outer square with side length (a + b). It contains four copies of the triangle.",
        "3. The remaining internal space defines a smaller square with area equal to (c²).",
        "4. Algebra: Expanding the square sides simplifies to: a² + b² = c²."
      ],
      examplePrompt: "If a = 3, b = 4, what is the length of hypotenuse c?",
      exampleAnswer: "5"
    },
    {
      id: 'euler',
      expression: 'e^(iπ) + 1 = 0',
      name: "Euler's Identity",
      category: "Complex Analysis",
      proofSteps: [
        "1. Let f(θ) = cos(θ) + i sin(θ) denote points on the complex unit circle.",
        "2. Differentiating gives f'(θ) = -sin(θ) + i cos(θ) = i * f(θ), establishing f(θ) = e^(iθ).",
        "3. Setting θ = π (180° rotation): e^(iπ) = cos(π) + i sin(π) = -1 + 0.",
        "4. Adding 1 to both sides yields the famous identity: e^(iπ) + 1 = 0."
      ],
      examplePrompt: "What is the value of e^(iπ/2)?",
      exampleAnswer: "i"
    },
    {
      id: 'quadratic',
      expression: 'x = (-b ± √(b² - 4ac)) / 2a',
      name: "Quadratic Formula",
      category: "Algebra",
      proofSteps: [
        "1. Start with the standard quadratic form: ax² + bx + c = 0.",
        "2. Divide by coefficient (a) and transpose the constant: x² + (b/a)x = -c/a.",
        "3. Complete the square on the left side: (x + b/2a)² = (b² - 4ac) / 4a².",
        "4. Take square roots and isolate x to get the roots formula."
      ],
      examplePrompt: "For x² - 5x + 6 = 0, what is the positive root?",
      exampleAnswer: "3"
    },
    {
      id: 'einstein',
      expression: 'E = mc²',
      name: "Mass-Energy Equivalence",
      category: "Relativistic Physics",
      proofSteps: [
        "1. Consider relativistic momentum p = γmv where γ is the Lorentz factor.",
        "2. Work done on an accelerating particle increases kinetic energy dE = v dp.",
        "3. Integrating from velocity 0 to v yields total relativistic energy E = γmc².",
        "4. At rest (v = 0, γ = 1), the invariant rest energy is E = mc²."
      ],
      examplePrompt: "If m = 2 kg and c = 3×10^8 m/s, what order of magnitude is E in Joules?",
      exampleAnswer: "1.8e17"
    }
  ];

  const currentFormula = formulas.find(f => f.id === activeFormulaId) || formulas[0];

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSolution.trim()) return;
    if (userSolution.trim().toLowerCase() === currentFormula.exampleAnswer.toLowerCase()) {
      setSolvedState('correct');
    } else {
      setSolvedState('incorrect');
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('formulas')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mobileTab === 'formulas' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
          }`}
        >
          Formulas
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('proof')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mobileTab === 'proof' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
          }`}
        >
          Proof Steps
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('solver')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            mobileTab === 'solver' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
          }`}
        >
          Practice Solver
        </button>
      </div>

      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-wrap justify-between items-center gap-3 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            Interactive Mathematics
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-1">
            Visual Formula Studio
          </h3>
          <p className="text-xs text-slate-500">Deconstruct mathematical proofs and solve practice equations step-by-step.</p>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Formulas List */}
        <div className={`lg:col-span-4 flex-col gap-2 ${mobileTab === 'formulas' ? 'flex' : 'hidden lg:flex'}`}>
          {formulas.map(f => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFormulaId(f.id);
                setCurrentProofStep(0);
                setSolvedState(null);
                setUserSolution('');
              }}
              className={`p-3.5 text-left border rounded-2xl cursor-pointer transition-all ${
                activeFormulaId === f.id
                  ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{f.category}</span>
                {activeFormulaId === f.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5">{f.name}</h4>
              <div className="text-sm font-mono font-bold text-indigo-700 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                {f.expression}
              </div>
            </button>
          ))}
        </div>

        {/* Middle: Step-by-Step Proof Stage */}
        <div className={`lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl flex-col justify-between shadow-xs ${
          mobileTab === 'proof' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Interactive Proof</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{currentFormula.name}</h4>
            </div>

            {/* Formula Expression Showcase */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 mb-1">Standard Mathematical Form</span>
              <div className="text-xl sm:text-2xl font-mono font-black text-indigo-700 tracking-tight">
                {currentFormula.expression}
              </div>
            </div>

            {/* Proof Steps */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Derivation Stages:</span>
              <div className="space-y-2">
                {currentFormula.proofSteps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentProofStep(idx)}
                    className={`p-3 rounded-xl border text-xs leading-relaxed cursor-pointer transition-all ${
                      currentProofStep === idx
                        ? 'bg-indigo-50 border-indigo-200 text-slate-900 font-semibold shadow-2xs'
                        : 'bg-slate-50/50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Practice Solver */}
        <div className={`lg:col-span-3 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs ${
          mobileTab === 'solver' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Self-Check</span>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5">Practice Equation</h4>
            </div>
            <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {currentFormula.examplePrompt}
            </p>
            <form onSubmit={handleCheckAnswer} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Answer:</label>
                <input
                  type="text"
                  value={userSolution}
                  onChange={(e) => setUserSolution(e.target.value)}
                  placeholder="Enter numerical answer..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Validate Answer
              </button>
            </form>
            {solvedState === 'correct' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Correct! You mastered this formula step.</span>
              </div>
            )}
            {solvedState === 'incorrect' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1 animate-in fade-in">
                <div className="font-bold">Not quite right yet.</div>
                <div className="text-[11px]">Correct answer: {currentFormula.exampleAnswer}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
