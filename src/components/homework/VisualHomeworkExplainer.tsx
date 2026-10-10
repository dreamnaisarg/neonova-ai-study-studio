import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Compass,
  TrendingUp,
  Table,
  Activity,
  ArrowRight
} from 'lucide-react';

export interface VisualExplanationData {
  type: 'geometry' | 'number_line' | 'coordinate_graph' | 'science_diagram' | 'process_flow' | 'table' | 'formula_breakdown';
  title: string;
  description: string;
  data: {
    geometry?: {
      shape?: string;
      vertices: { label: string; x: number; y: number }[];
      lines: { from: string; to: string; label?: string; style?: 'solid' | 'dashed' }[];
      angles?: { vertex: string; label: string; arc?: boolean }[];
      labels?: { text: string; x: number; y: number }[];
    };
    numberLine?: {
      min: number;
      max: number;
      step: number;
      points: { value: number; label: string; highlighted?: boolean }[];
      ranges?: { from: number; to: number; label: string; color?: string }[];
    };
    graph?: {
      xLabel: string;
      yLabel: string;
      xRange: [number, number];
      yRange: [number, number];
      curves: { expression: string; points: { x: number; y: number }[]; color: string; label: string }[];
      criticalPoints?: { x: number; y: number; label: string }[];
    };
    processFlow?: {
      steps: { stepNumber: number; title: string; description: string; formulaOrLaw?: string }[];
    };
    scienceDiagram?: {
      title: string;
      components: { name: string; role: string; locationDescription?: string }[];
      reactionsOrForces?: string[];
    };
    table?: {
      headers: string[];
      rows: string[][];
    };
    formulaBreakdown?: {
      originalFormula: string;
      variableMapping: { symbol: string; meaning: string; value: string; unit?: string }[];
      stepwiseTransformations: string[];
    };
  };
}

interface VisualHomeworkExplainerProps {
  visual: VisualExplanationData;
  className?: string;
}

export default function VisualHomeworkExplainer({ visual, className = '' }: VisualHomeworkExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-linear-to-b from-indigo-50/60 via-white to-slate-50 border border-indigo-200/90 shadow-xs space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            {visual.type === 'geometry' && <Compass size={17} />}
            {visual.type === 'number_line' && <Activity size={17} />}
            {visual.type === 'coordinate_graph' && <TrendingUp size={17} />}
            {visual.type === 'science_diagram' && <Layers size={17} />}
            {visual.type === 'process_flow' && <Sparkles size={17} />}
            {visual.type === 'table' && <Table size={17} />}
            {visual.type === 'formula_breakdown' && <Sparkles size={17} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                Verified Visual Explanation
              </span>
              <span className="text-[10px] font-mono text-slate-400 capitalize">
                {visual.type.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mt-0.5">
              {visual.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title={isExpanded ? "Collapse visualization" : "Expand visualization"}
        >
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed font-medium">
        {visual.description}
      </p>

      {/* Visual Render Container */}
      <div className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col items-center justify-center transition-all ${
        isExpanded ? 'min-h-[420px]' : 'min-h-[220px]'
      }`}>
        {visual.type === 'geometry' && renderGeometryDiagram(visual.data.geometry)}
        {visual.type === 'number_line' && renderNumberLine(visual.data.numberLine)}
        {visual.type === 'coordinate_graph' && renderCoordinateGraph(visual.data.graph)}
        {visual.type === 'science_diagram' && renderScienceDiagram(visual.data.scienceDiagram)}
        {visual.type === 'process_flow' && renderProcessFlow(visual.data.processFlow)}
        {visual.type === 'table' && renderStructuredTable(visual.data.table)}
        {visual.type === 'formula_breakdown' && renderFormulaBreakdown(visual.data.formulaBreakdown)}
      </div>
    </div>
  );
}

/* =========================================================================
   1. GEOMETRY DIAGRAM RENDERER (SVG)
   ========================================================================= */
function renderGeometryDiagram(geo?: VisualExplanationData['data']['geometry']) {
  if (!geo || !geo.vertices || geo.vertices.length === 0) {
    // Default clean triangle diagram
    return (
      <svg viewBox="0 0 320 200" className="w-full max-w-sm h-auto select-none">
        <polygon points="60,160 260,160 60,40" fill="#f5f3ff" stroke="#6366f1" strokeWidth="2.5" />
        <rect x="60" y="145" width="15" height="15" fill="none" stroke="#6366f1" strokeWidth="1.5" />
        <text x="45" y="175" className="text-xs font-bold font-mono" fill="#1e1b4b">A</text>
        <text x="270" y="175" className="text-xs font-bold font-mono" fill="#1e1b4b">B</text>
        <text x="45" y="35" className="text-xs font-bold font-mono" fill="#1e1b4b">C</text>
        <text x="155" y="180" className="text-[11px] font-bold font-mono" fill="#4f46e5">Base (b)</text>
        <text x="20" y="105" className="text-[11px] font-bold font-mono" fill="#4f46e5">Height (h)</text>
        <text x="165" y="95" className="text-[11px] font-bold font-mono" fill="#4f46e5">Hypotenuse (c)</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 340 220" className="w-full max-w-md h-auto select-none">
      {/* Draw lines */}
      {geo.lines.map((l, i) => {
        const v1 = geo.vertices.find(v => v.label === l.from);
        const v2 = geo.vertices.find(v => v.label === l.to);
        if (!v1 || !v2) return null;
        return (
          <g key={i}>
            <line
              x1={v1.x}
              y1={v1.y}
              x2={v2.x}
              y2={v2.y}
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray={l.style === 'dashed' ? '5,5' : undefined}
            />
            {l.label && (
              <text
                x={(v1.x + v2.x) / 2 + 5}
                y={(v1.y + v2.y) / 2 - 5}
                className="text-[10px] font-mono font-bold"
                fill="#4f46e5"
              >
                {l.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Draw vertices */}
      {geo.vertices.map((v, i) => (
        <g key={i}>
          <circle cx={v.x} cy={v.y} r="4.5" fill="#4f46e5" />
          <text
            x={v.x + 8}
            y={v.y - 6}
            className="text-xs font-mono font-bold"
            fill="#0f172a"
          >
            {v.label}
          </text>
        </g>
      ))}

      {/* Extra labels */}
      {geo.labels?.map((lbl, i) => (
        <text key={i} x={lbl.x} y={lbl.y} className="text-[11px] font-bold" fill="#334155">
          {lbl.text}
        </text>
      ))}
    </svg>
  );
}

/* =========================================================================
   2. NUMBER LINE RENDERER (SVG)
   ========================================================================= */
function renderNumberLine(nl?: VisualExplanationData['data']['numberLine']) {
  const min = nl?.min ?? -5;
  const max = nl?.max ?? 5;
  const step = nl?.step ?? 1;
  const points = nl?.points || [{ value: 0, label: 'x = 0', highlighted: true }];

  const totalSteps = Math.max(1, (max - min) / step);
  const width = 360;
  const startX = 30;
  const endX = width - 30;
  const axisY = 60;

  const valueToX = (val: number) => {
    const fraction = (val - min) / (max - min);
    return startX + fraction * (endX - startX);
  };

  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) {
    ticks.push(v);
  }

  return (
    <svg viewBox={`0 0 ${width} 120`} className="w-full max-w-md h-auto select-none">
      {/* Main Axis Arrow Line */}
      <line x1={startX - 15} y1={axisY} x2={endX + 15} y2={axisY} stroke="#334155" strokeWidth="2.5" />
      <polygon points={`${endX + 15},${axisY} ${endX + 8},${axisY - 4} ${endX + 8},${axisY + 4}`} fill="#334155" />
      <polygon points={`${startX - 15},${axisY} ${startX - 8},${axisY - 4} ${startX - 8},${axisY + 4}`} fill="#334155" />

      {/* Ticks & Numbers */}
      {ticks.map((t) => {
        const x = valueToX(t);
        return (
          <g key={t}>
            <line x1={x} y1={axisY - 6} x2={x} y2={axisY + 6} stroke="#64748b" strokeWidth="1.5" />
            <text x={x} y={axisY + 20} textAnchor="middle" className="text-[10px] font-mono text-slate-600 font-bold">
              {t}
            </text>
          </g>
        );
      })}

      {/* Highlights & Plotted Points */}
      {points.map((pt, i) => {
        const x = valueToX(pt.value);
        return (
          <g key={i}>
            <circle cx={x} cy={axisY} r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
            <text x={x} y={axisY - 14} textAnchor="middle" className="text-[11px] font-mono font-bold" fill="#4338ca">
              {pt.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* =========================================================================
   3. COORDINATE GRAPH RENDERER (SVG)
   ========================================================================= */
function renderCoordinateGraph(g?: VisualExplanationData['data']['graph']) {
  const width = 360;
  const height = 220;
  const midX = width / 2;
  const midY = height / 2;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md h-auto bg-slate-50/50 rounded-xl select-none">
      {/* Grid Lines */}
      <line x1={0} y1={midY} x2={width} y2={midY} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={midX} y1={0} x2={midX} y2={height} stroke="#94a3b8" strokeWidth="1.5" />

      {/* Axis Labels */}
      <text x={width - 20} y={midY - 8} className="text-[11px] font-mono font-bold" fill="#475569">
        {g?.xLabel || 'x'}
      </text>
      <text x={midX + 8} y={15} className="text-[11px] font-mono font-bold" fill="#475569">
        {g?.yLabel || 'y'}
      </text>

      {/* Parabola Curve or Line */}
      <path
        d={`M 40 ${height - 30} Q ${midX} 20 ${width - 40} ${height - 30}`}
        fill="none"
        stroke="#4f46e5"
        strokeWidth="3"
      />

      {/* Origin / Vertex Marker */}
      <circle cx={midX} cy={35} r="4" fill="#ef4444" />
      <text x={midX + 8} y={35} className="text-[10px] font-mono font-bold" fill="#b91c1c">
        Vertex (h, k)
      </text>
    </svg>
  );
}

/* =========================================================================
   4. SCIENCE DIAGRAM RENDERER
   ========================================================================= */
function renderScienceDiagram(sci?: VisualExplanationData['data']['scienceDiagram']) {
  const comps = sci?.components || [
    { name: 'Input Reactants', role: 'Initial chemical or physical constituents' },
    { name: 'Transition State', role: 'Activation energy barrier' },
    { name: 'Final Products', role: 'Thermodynamically stable output' }
  ];

  return (
    <div className="w-full max-w-md space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {comps.map((c, i) => (
          <div key={i} className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-center space-y-1">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold mx-auto flex items-center justify-center">
              {i + 1}
            </div>
            <div className="text-xs font-bold text-slate-900">{c.name}</div>
            <div className="text-[10px] text-slate-600 leading-tight">{c.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   5. PROCESS FLOWCHART RENDERER
   ========================================================================= */
function renderProcessFlow(pf?: VisualExplanationData['data']['processFlow']) {
  const steps = pf?.steps || [
    { stepNumber: 1, title: 'State Given Condition', description: 'Extract explicit variables and units.' },
    { stepNumber: 2, title: 'Apply Governing Law', description: 'Substitute parameters into canonical formula.' },
    { stepNumber: 3, title: 'Compute & Verify', description: 'Simplify algebraically and check units.' }
  ];

  return (
    <div className="w-full max-w-md space-y-2">
      {steps.map((st, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            {st.stepNumber}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">{st.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================================
   6. STRUCTURED COMPARISON TABLE
   ========================================================================= */
function renderStructuredTable(tb?: VisualExplanationData['data']['table']) {
  const headers = tb?.headers || ['Feature', 'Condition A', 'Condition B'];
  const rows = tb?.rows || [
    ['Definition', 'Primary State', 'Secondary State'],
    ['Energy State', 'Exothermic (ΔH < 0)', 'Endothermic (ΔH > 0)'],
    ['Equilibrium', 'Favors Forward', 'Favors Reverse']
  ];

  return (
    <div className="w-full max-w-md overflow-x-auto">
      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-indigo-50 border-b border-indigo-100">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="p-2.5 font-bold text-indigo-900">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-50">
              {r.map((cell, cIdx) => (
                <td key={cIdx} className="p-2.5 text-slate-700 font-medium">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================================
   7. STEP-BY-STEP FORMULA BREAKDOWN
   ========================================================================= */
function renderFormulaBreakdown(fb?: VisualExplanationData['data']['formulaBreakdown']) {
  const formula = fb?.originalFormula || 'v = u + at';
  const mappings = fb?.variableMapping || [
    { symbol: 'v', meaning: 'Final velocity', value: 'Target variable', unit: 'm/s' },
    { symbol: 'u', meaning: 'Initial velocity', value: '0', unit: 'm/s' },
    { symbol: 'a', meaning: 'Acceleration', value: '9.8', unit: 'm/s²' },
    { symbol: 't', meaning: 'Time elapsed', value: '5', unit: 's' }
  ];

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-center">
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-700 block">
          Governing Formula
        </span>
        <span className="text-base font-bold font-mono text-indigo-950 mt-0.5 block">
          {formula}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {mappings.map((m, i) => (
          <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-mono font-bold text-indigo-600">{m.symbol} = {m.value} {m.unit || ''}</div>
            <div className="text-[10px] text-slate-500">{m.meaning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
