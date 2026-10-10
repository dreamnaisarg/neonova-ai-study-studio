import React from 'react';

/**
 * Strips raw markdown hashes, LaTeX delimiters, stray asterisks, backslashes,
 * and symbol clutter from educational answers, transforming them into clean,
 * natural unicode text without symbol noise.
 */
export function cleanEducationalText(raw: string): string {
  if (!raw) return '';

  let cleaned = raw;

  // 1. Remove LaTeX environment blocks: \begin{...} and \end{...}
  cleaned = cleaned.replace(/\\begin\{[^{}]*\}/g, '');
  cleaned = cleaned.replace(/\\end\{[^{}]*\}/g, '');

  // 2. Remove LaTeX block math delimiters \[ ... \] and $$ ... $$
  cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, '$1');
  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, '$1');

  // 3. Remove inline LaTeX delimiters \( ... \)
  cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, '$1');

  // 4. Remove dollar signs used as LaTeX math delimiters: e.g. $x = 7$ -> x = 7
  cleaned = cleaned.replace(/\$([^\$\n]+?)\$/g, '$1');

  // 5. Clean LaTeX spacing and alignment commands
  cleaned = cleaned.replace(/\\\\/g, '\n'); // LaTeX newline
  cleaned = cleaned.replace(/\\quad/g, '  ');
  cleaned = cleaned.replace(/\\qquad/g, '   ');
  cleaned = cleaned.replace(/\\[,;:! ]/g, ' ');
  cleaned = cleaned.replace(/&(?=\s*[=+\-*/<>])/g, ''); // LaTeX alignment &

  // 6. Clean common LaTeX structural commands (nested passes for fractions/brackets)
  cleaned = cleaned.replace(/\\boxed\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\text\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\textbf\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\textit\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathrm\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathbf\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathit\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathbb\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathcal\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\underline\{([^{}]*)\}/g, '$1');
  cleaned = cleaned.replace(/\\displaystyle/g, '');

  // Fractions: repeated passes to handle nested \frac
  for (let i = 0; i < 3; i++) {
    cleaned = cleaned.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1 / $2');
  }

  // Roots
  cleaned = cleaned.replace(/\\sqrt\[([^{}]*)\]\{([^{}]*)\}/g, '$1√($2)');
  cleaned = cleaned.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');

  // Delimiters
  cleaned = cleaned.replace(/\\left\(/g, '(');
  cleaned = cleaned.replace(/\\right\)/g, ')');
  cleaned = cleaned.replace(/\\left\[/g, '[');
  cleaned = cleaned.replace(/\\right\]/g, ']');
  cleaned = cleaned.replace(/\\left\\\{/g, '{');
  cleaned = cleaned.replace(/\\right\\\}/g, '}');
  cleaned = cleaned.replace(/\\left\|/g, '|');
  cleaned = cleaned.replace(/\\right\|/g, '|');
  cleaned = cleaned.replace(/\\left\./g, '');
  cleaned = cleaned.replace(/\\right\./g, '');

  // 7. Transform LaTeX mathematical operators to clean unicode symbols
  cleaned = cleaned.replace(/\\times/g, '×');
  cleaned = cleaned.replace(/\\div/g, '÷');
  cleaned = cleaned.replace(/\\cdot/g, '·');
  cleaned = cleaned.replace(/\\pm/g, '±');
  cleaned = cleaned.replace(/\\mp/g, '∓');
  cleaned = cleaned.replace(/\\approx/g, '≈');
  cleaned = cleaned.replace(/\\equiv/g, '≡');
  cleaned = cleaned.replace(/\\neq?/g, '≠');
  cleaned = cleaned.replace(/\\leq?/g, '≤');
  cleaned = cleaned.replace(/\\geq?/g, '≥');
  cleaned = cleaned.replace(/\\ll/g, '≪');
  cleaned = cleaned.replace(/\\gg/g, '≫');
  cleaned = cleaned.replace(/\\degree/g, '°');
  cleaned = cleaned.replace(/\^\\circ/g, '°');
  cleaned = cleaned.replace(/\\circ/g, '°');
  cleaned = cleaned.replace(/\\pi/g, 'π');
  cleaned = cleaned.replace(/\\theta/g, 'θ');
  cleaned = cleaned.replace(/\\alpha/g, 'α');
  cleaned = cleaned.replace(/\\beta/g, 'β');
  cleaned = cleaned.replace(/\\gamma/g, 'γ');
  cleaned = cleaned.replace(/\\Delta/g, 'Δ');
  cleaned = cleaned.replace(/\\delta/g, 'δ');
  cleaned = cleaned.replace(/\\lambda/g, 'λ');
  cleaned = cleaned.replace(/\\mu/g, 'μ');
  cleaned = cleaned.replace(/\\sigma/g, 'σ');
  cleaned = cleaned.replace(/\\omega/g, 'ω');
  cleaned = cleaned.replace(/\\Omega/g, 'Ω');
  cleaned = cleaned.replace(/\\phi/g, 'φ');
  cleaned = cleaned.replace(/\\rho/g, 'ρ');
  cleaned = cleaned.replace(/\\infty/g, '∞');
  cleaned = cleaned.replace(/\\rightarrow/g, '→');
  cleaned = cleaned.replace(/\\to\b/g, '→');
  cleaned = cleaned.replace(/\\leftarrow/g, '←');
  cleaned = cleaned.replace(/\\Rightarrow/g, '⇒');
  cleaned = cleaned.replace(/\\implies/g, '⇒');
  cleaned = cleaned.replace(/\\therefore/g, '∴');
  cleaned = cleaned.replace(/\\because/g, '∵');
  cleaned = cleaned.replace(/\\angle/g, '∠');
  cleaned = cleaned.replace(/\\triangle/g, '△');
  cleaned = cleaned.replace(/\\sum/g, '∑');
  cleaned = cleaned.replace(/\\prod/g, '∏');
  cleaned = cleaned.replace(/\\int/g, '∫');
  cleaned = cleaned.replace(/\\partial/g, '∂');
  cleaned = cleaned.replace(/\\in\b/g, '∈');
  cleaned = cleaned.replace(/\\notin\b/g, '∉');
  cleaned = cleaned.replace(/\\subset\b/g, '⊂');
  cleaned = cleaned.replace(/\\subseteq\b/g, '⊆');
  cleaned = cleaned.replace(/\\cup\b/g, '∪');
  cleaned = cleaned.replace(/\\cap\b/g, '∩');

  // 8. Convert superscripts & subscripts: e.g. x^2 -> x², x_1 -> x₁
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', 'n': 'ⁿ', 'x': 'ˣ'
  };
  cleaned = cleaned.replace(/\^([0-9+\-nx])\b/g, (_, ch) => superscripts[ch] || `^${ch}`);
  cleaned = cleaned.replace(/\^\{([0-9+\-nx])\}/g, (_, ch) => superscripts[ch] || `^${ch}`);

  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'n': 'ₙ', 'x': 'ₓ'
  };
  cleaned = cleaned.replace(/_([0-9aeinx])\b/g, (_, ch) => subscripts[ch] || `_${ch}`);
  cleaned = cleaned.replace(/_\{([0-9aeinx])\}/g, (_, ch) => subscripts[ch] || `_${ch}`);

  // 9. Clean remaining unparsed LaTeX curly braces around simple words/numbers: e.g. {15} -> 15
  cleaned = cleaned.replace(/\{([a-zA-Z0-9.,_+\-/*\s]+?)\}/g, '$1');

  // 10. Strip escaped brackets and backslashes
  cleaned = cleaned.replace(/\\([\[\]{}%_])/g, '$1');

  // 11. Clean multiplication asterisk between numbers or variables: 5 * 5 -> 5 × 5
  cleaned = cleaned.replace(/(\d)\s*\*\s*(\d)/g, '$1 × $2');

  // 12. Strip stray multiple asterisks or dividers (***, ****)
  cleaned = cleaned.replace(/\*{3,}/g, '');

  return cleaned;
}

/**
 * Strips all markdown and markup symbols for pure plain text copying or speech synthesis.
 */
export function stripAllSymbolsForPlaintext(text: string): string {
  if (!text) return '';
  return cleanEducationalText(text)
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/\*{1,}/g, '')
    .replace(/\\/g, '')
    .trim();
}

/**
 * Custom text formatter utility to beautifully parse answers into modern,
 * symbol-free, Apple-level educational typography without raw markup symbols.
 */
export function formatTutorResponse(text: string): React.ReactNode {
  if (!text) return null;

  // Clean all LaTeX and formatting symbols first
  const preCleaned = cleanEducationalText(text);

  // Split content by code blocks if any
  const parts = preCleaned.split(/(```[\s\S]*?```)/g);

  return parts.map((part, partIdx) => {
    // If this part is a real code block
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);

      return (
        <pre 
          key={partIdx} 
          className="my-3 p-4 bg-slate-900 text-indigo-200 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 shadow-xs relative"
        >
          {language && (
            <span className="absolute top-2.5 right-3 text-[10px] text-slate-400 uppercase tracking-widest font-mono select-none">
              {language}
            </span>
          )}
          <code>{code.trim()}</code>
        </pre>
      );
    }

    // Process lines
    const lines = part.split('\n');

    return (
      <div key={partIdx} className="space-y-2.5">
        {lines.map((line, lIdx) => {
          let trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-1.5" />;

          // Check and strip markdown headers (#, ##, ###, ####)
          const headerMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
          if (headerMatch) {
            const headingContent = headerMatch[2].replace(/^[*_\s]+|[*_\s]+$/g, '').trim();
            if (!headingContent) return null;
            return (
              <h4 
                key={lIdx} 
                className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight pt-2 pb-0.5 border-b border-slate-100 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block shrink-0" />
                <span>{parseCleanInlineText(headingContent)}</span>
              </h4>
            );
          }

          // Check if it's a step header: e.g. "**Step 1:**", "Step 1 -", "Step One:"
          const stepMatch = trimmed.match(/^[\s*_\-]*step\s*(\d+|[a-zA-Z]+)[\s*_:–\-]*(.*)$/i);
          if (stepMatch) {
            const stepNumber = stepMatch[1];
            const stepDesc = stepMatch[2].replace(/^[*_\s:–\-]+|[*_\s]+$/g, '').trim();
            return (
              <div key={lIdx} className="my-2.5 p-3 sm:p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs space-y-1">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md font-sans">
                  Step {stepNumber}
                </span>
                {stepDesc && (
                  <p className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed">
                    {parseCleanInlineText(stepDesc)}
                  </p>
                )}
              </div>
            );
          }

          // Check for key educational sections: e.g., "**Answer:**", "**Explanation:**", "Answer:", "Final Answer:"
          const sectionMatch = trimmed.match(/^[\s*_\-📎]*(Answer|Final Answer|Explanation|Given|Formula|Solution|Verification|Conclusion|Summary|Note|Important)[\s*_:–\-]*(.*)$/i);
          if (sectionMatch) {
            const sectionName = sectionMatch[1];
            const sectionContent = sectionMatch[2].replace(/^[*_\s:–\-]+|[*_\s]+$/g, '').trim();
            const isAnswerSection = /Answer|Final Answer/i.test(sectionName);

            return (
              <div 
                key={lIdx} 
                className={`my-2 p-3 sm:p-3.5 rounded-2xl border shadow-2xs space-y-1 ${
                  isAnswerSection 
                    ? 'bg-indigo-50/70 border-indigo-200/80 text-indigo-950' 
                    : 'bg-white border-slate-200/80 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-indigo-700">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAnswerSection ? 'bg-indigo-600' : 'bg-slate-400'}`} />
                  <span>{sectionName}</span>
                </div>
                {sectionContent && (
                  <p className={`text-xs sm:text-sm leading-relaxed ${isAnswerSection ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                    {parseCleanInlineText(sectionContent)}
                  </p>
                )}
              </div>
            );
          }

          // Check if bullet point (- , * , • )
          const isBullet = /^[-*•]\s+/.test(trimmed);
          if (isBullet) {
            const bulletContent = trimmed.replace(/^[-*•]\s+/, '').replace(/^[*_\s]+|[*_\s]+$/g, '');
            return (
              <div key={lIdx} className="flex items-start gap-2.5 pl-2 my-1">
                <span className="text-indigo-500 font-bold text-xs select-none mt-0.5 shrink-0">•</span>
                <span className="text-slate-700 text-xs sm:text-sm font-normal leading-relaxed">
                  {parseCleanInlineText(bulletContent)}
                </span>
              </div>
            );
          }

          // Check if numbered list (1. , 2. )
          const numMatch = trimmed.match(/^(\d+)[\.\)]\s*(.*)$/);
          if (numMatch) {
            const num = numMatch[1];
            const listContent = numMatch[2].replace(/^[*_\s]+|[*_\s]+$/g, '');
            return (
              <div key={lIdx} className="flex items-start gap-2.5 pl-1 my-1.5">
                <span className="w-5 h-5 flex items-center justify-center bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold rounded-lg shrink-0 mt-0.5 select-none shadow-2xs">
                  {num}
                </span>
                <span className="flex-1 text-slate-800 text-xs sm:text-sm font-normal leading-relaxed">
                  {parseCleanInlineText(listContent)}
                </span>
              </div>
            );
          }

          // Regular paragraph text
          return (
            <p key={lIdx} className="text-slate-800 text-xs sm:text-sm font-normal leading-relaxed">
              {parseCleanInlineText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  });
}

/**
 * Inner parser to clean inline bold (**word**), italics, and stray symbols,
 * rendering clean semantic typography without symbol clutter.
 */
function parseCleanInlineText(txt: string): React.ReactNode[] {
  if (!txt) return [];

  // 1. Remove stray backticks, backslashes, and dangling math delimiters
  let sanitized = txt
    .replace(/`([^`]+)`/g, '$1') // inline backticks
    .replace(/`/g, '')
    .replace(/\\/g, '')          // stray backslashes
    .replace(/(^|\s)\*(?!\S)/g, '$1') // floating asterisks
    .replace(/(^|\s)_(?!\S)/g, '$1');

  // 2. Tokenize on **bold** or *italic* patterns
  const tokens = sanitized.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*)/g);

  return tokens.map((token, idx) => {
    // Double asterisk bold: **text**
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      const cleanWord = token.slice(2, -2).trim();
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {cleanWord}
        </strong>
      );
    }

    // Single asterisk emphasis: *text*
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      const cleanWord = token.slice(1, -1).trim();
      return (
        <span key={idx} className="font-semibold text-slate-800">
          {cleanWord}
        </span>
      );
    }

    // Strip any lingering asterisk or hash characters from plain text tokens
    const cleanToken = token.replace(/[*#]/g, '');
    return <span key={idx}>{cleanToken}</span>;
  });
}
