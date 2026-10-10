import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot } from 'lucide-react';

export default function NeoNovaAITutorCompanion() {
  const [tutorMode, setTutorMode] = useState<'idle' | 'thinking' | 'explaining' | 'happy'>('idle');
  const [bubbleText, setBubbleText] = useState<string | null>(
    "Hello! I am NeoNova AI Tutor, your AI study companion. Ready to review your homework?"
  );

  const expressionsState = {
    idle: {
      color: 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-2xs',
      label: 'Ready to Help',
      eyes: '● ●',
      smile: ' ‿ ',
      sparkle: '✨',
      bubble: "I'm ready whenever you are! Try asking me any math or science question."
    },
    thinking: {
      color: 'border-amber-200 bg-amber-50 text-amber-700 shadow-2xs',
      label: 'Thinking...',
      eyes: '◉ ◉',
      smile: ' ⁓ ',
      sparkle: '⚡',
      bubble: "Reviewing textbook definitions and breaking down the steps..."
    },
    explaining: {
      color: 'border-purple-200 bg-purple-50 text-purple-700 shadow-2xs',
      label: 'Explaining Concept',
      eyes: '★ ★',
      smile: ' ▽ ',
      sparkle: '💡',
      bubble: "Did you know gravity curves space-time? Think of a heavy ball on a stretched trampoline!"
    },
    happy: {
      color: 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs',
      label: 'Great Job!',
      eyes: '^^',
      smile: ' ◡ ',
      sparkle: '🎉',
      bubble: "Awesome work today! Keep your study streak going to level up your mastery!"
    }
  };

  const handleModeChange = (mode: 'idle' | 'thinking' | 'explaining' | 'happy') => {
    setTutorMode(mode);
    setBubbleText(expressionsState[mode].bubble);
  };

  return (
    <div id="neonova-floating-tutor-card" className="bg-white border border-slate-200 p-4 rounded-2xl relative shadow-xs space-y-3 font-sans text-slate-800">
      <div className="flex justify-between items-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
          <Bot size={12} className="text-indigo-600" />
          <span>NeoNova AI Tutor Study Coach</span>
        </span>
        <span className="text-[10px] text-slate-500 font-semibold">
          {expressionsState[tutorMode].label}
        </span>
      </div>

      <div className="flex items-center gap-3.5 pt-1">
        <motion.button
          id="btn-tutor-interactive-face"
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          onClick={() => {
            const list: ('idle' | 'thinking' | 'explaining' | 'happy')[] = ['idle', 'thinking', 'explaining', 'happy'];
            const nextIdx = (list.indexOf(tutorMode) + 1) % list.length;
            handleModeChange(list[nextIdx]);
          }}
          className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-mono text-center relative shrink-0 transition-all select-none cursor-pointer group active:scale-95 ${expressionsState[tutorMode].color}`}
        >
          <span className="text-sm font-black tracking-wider block mt-1 transition-all">{expressionsState[tutorMode].eyes}</span>
          <span className="text-xs font-black tracking-wider block -mt-0.5">{expressionsState[tutorMode].smile}</span>
        </motion.button>

        <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl relative shadow-2xs">
          <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
            "{bubbleText}"
          </p>
        </div>
      </div>
    </div>
  );
}

export { NeoNovaAITutorCompanion as AvaCompanion };
