import React, { useRef } from 'react';
import { 
  Award, 
  X, 
  Download, 
  Share2, 
  CheckCircle2, 
  Printer, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Mission7Certificate } from '../../types/mission7';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface Mission7CertificateModalProps {
  certificate: Mission7Certificate;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export default function Mission7CertificateModal({
  certificate,
  isOpen,
  onClose,
  onShare
}: Mission7CertificateModalProps) {
  const [copied, setCopied] = React.useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const link = `https://neonovastudy.com/verify-certificate?id=${certificate.certificateCode}&hash=${certificate.verificationHash}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Control Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 font-bold">
              <Award size={18} />
            </span>
            <span className="text-sm font-bold text-slate-800">
              Official Verifiable Credential • Mission 7 Championship
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Print or Save as PDF"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied Link' : 'Copy Verification Link'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-4 sm:p-8 bg-slate-100/70">
          <div 
            ref={certRef}
            className="bg-white border-8 border-double border-amber-600/30 rounded-2xl p-6 sm:p-12 shadow-lg relative overflow-hidden text-center space-y-6"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.03) 0%, transparent 80%)'
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500/60" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500/60" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500/60" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/60" />

            {/* Header / Crest */}
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <NeoNovaLogo size={36} />
                <span className="text-sm font-black tracking-widest uppercase text-slate-900 font-mono">
                  NEONOVA AI ACADEMIC SYSTEM
                </span>
              </div>
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles size={11} className="text-amber-600" />
                <span>Mission 7 Academic Mastery Championship</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight pt-2">
                Certificate of Academic Excellence
              </h2>
              <p className="text-xs text-slate-500 italic max-w-md mx-auto">
                This prestigious credential honors exemplary multidisciplinary mastery, continuous study discipline, and successful completion of all 7 Event Missions.
              </p>
            </div>

            {/* Recipient */}
            <div className="py-2 space-y-1 border-y border-amber-100 max-w-lg mx-auto">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Proudly Presented To
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight underline decoration-amber-400/80 decoration-2 underline-offset-8">
                {certificate.studentName}
              </h3>
              <p className="text-xs font-semibold text-slate-600 pt-2">
                {certificate.grade} • {certificate.curriculumBoard} Curriculum Standards
              </p>
            </div>

            {/* Statement of Merit */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto">
              For demonstrating exceptional diligence by solving foundational stages, complex problems in Mathematics and Sciences, optical document analysis, error remediation, and conquering the <strong>Stage 4 Comprehensive Examination</strong>.
            </p>

            {/* Distinction & Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2">
              <div className="text-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Distinction</span>
                <span className="text-xs font-bold text-amber-700">Highest Honors</span>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Missions Conquered</span>
                <span className="text-xs font-bold text-slate-900">7 of 7 Complete</span>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Event XP Accumulated</span>
                <span className="text-xs font-bold text-indigo-700 font-mono">+{certificate.totalXpEarned} XP</span>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 max-w-2xl mx-auto text-left">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-500/80 bg-amber-50 flex items-center justify-center text-amber-600 shadow-xs">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Verification Code</div>
                  <div className="text-xs font-mono font-bold text-slate-900">{certificate.certificateCode}</div>
                  <div className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={10} /> Cryptographically Verified
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right space-y-0.5">
                <div className="font-serif italic font-bold text-slate-800 text-sm">
                  Naisarg Ramdatti
                </div>
                <div className="text-[10px] text-slate-500">
                  Lead Architect & Creator • NeoNova AI
                </div>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Issued on: {certificate.issuedAt}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
