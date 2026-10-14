import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Award, 
  Download, 
  Trophy,
  ExternalLink
} from 'lucide-react';
import { Mission7State } from '../../types/mission7';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface Mission7ShareModalProps {
  state: Mission7State;
  studentName: string;
  grade: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Mission7ShareModal({
  state,
  studentName,
  grade,
  isOpen,
  onClose
}: Mission7ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const completedCount = state.tasks.filter(t => t.status === 'completed' || t.status === 'claimed').length;
  const shareText = `🎓 I just conquered ${completedCount}/7 missions in the Mission 7 Academic Mastery Championship on NeoNova AI Homework Helper! Earned ${state.totalBonusXpEarned} XP and unlocked exclusive mastery badges! Check it out at https://neonovastudy.com`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NeoNova Mission 7 Achievement',
          text: shareText,
          url: 'https://neonovastudy.com'
        });
      } catch {}
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Share2 size={18} />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Share Achievement
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shareable Achievement Card Preview */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 rounded-2xl text-white space-y-4 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NeoNovaLogo size={24} />
              <span className="text-xs font-mono font-bold tracking-wider text-indigo-200">
                NEONOVA • MISSION 7
              </span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              {completedCount === 7 ? 'CHAMPION' : `${completedCount}/7 CONQUERED`}
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-extrabold text-white">
              {studentName}
            </h4>
            <p className="text-xs text-indigo-200">
              {grade} • Academic Quest & 4-Stage Mastery
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-800/60">
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-indigo-300 block uppercase font-mono">Event XP</span>
              <span className="text-sm font-black text-amber-300 font-mono">+{state.totalBonusXpEarned} XP</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <span className="text-[10px] text-indigo-300 block uppercase font-mono">Badges Earned</span>
              <span className="text-sm font-black text-white">{state.badges.filter(b => b.unlocked).length} / 4 Badges</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Share2 size={14} />
            <span>Share Achievement Card</span>
          </button>
          
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Link & Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
