import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Trash2, 
  Printer, 
  Copy, 
  Check, 
  Lock, 
  Eye, 
  Database, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Mail,
  Camera,
  Mic,
  Cookie,
  Globe
} from 'lucide-react';
import NeoNovaLogo from './common/NeoNovaLogo';

interface PrivacyPolicyPageProps {
  onBackToApp?: () => void;
}

export default function PrivacyPolicyPage({ onBackToApp }: PrivacyPolicyPageProps) {
  const [copiedCustomUrl, setCopiedCustomUrl] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | NeoNova - AI Homework Helper";
  }, []);

  const customDomainPrivacyUrl = "https://neonovastudy.com/privacy-policy";
  const appletPrivacyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/privacy-policy`
    : 'https://neonovastudy.com/privacy-policy';

  const handleCopyText = async (text: string, setCopiedState: (v: boolean) => void) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2500);
    } catch (err) {
      console.warn("Could not copy to clipboard", err);
    }
  };

  const handleBack = () => {
    if (onBackToApp) {
      onBackToApp();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div id="privacy-policy-page" className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Accent Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 fixed top-0 left-0 z-50" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-from-privacy"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to App</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <NeoNovaLogo size={30} glow className="shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 tracking-tight block">
                NeoNova
              </span>
              <span className="text-[10px] text-indigo-600 font-medium hidden sm:inline">
                AI Homework Helper & Study Platform
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('/delete-account')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={13} className="text-rose-600" />
            <span className="hidden sm:inline">Delete Account & Data</span>
            <span className="sm:hidden">Delete Data</span>
          </button>
          <button
            onClick={handlePrint}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer size={13} />
            <span>Print PDF</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Document Hero Badge */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-3">
              <ShieldCheck size={14} className="text-indigo-600" />
              <span>Official Privacy Policy & Data Safety Charter</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              NeoNova – Privacy Policy
            </h1>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-3xl mb-6">
              Welcome to <strong>NeoNova – AI Homework Helper</strong> ("NeoNova", "we", "our", or "us"). 
              We are committed to providing a transparent, safe, and privacy-first educational experience for students, parents, and educators from Grades 1 to 12. 
              This Privacy Policy explains what information is collected, how it is used, stored, and protected, and our strict zero-monetization policy regarding student information.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Developer / Author</span>
                <strong className="text-slate-900 font-semibold">Naisarg Ramdatti</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Package Identifier</span>
                <span className="text-indigo-700 font-mono text-[11px] font-semibold break-all">com.neonova.app</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Effective Date</span>
                <strong className="text-slate-900 font-semibold">August 2026</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Contact Inquiries</span>
                <a href="mailto:dreamfind4424@gmail.com" className="text-indigo-600 hover:underline break-all font-medium">dreamfind4424@gmail.com</a>
              </div>
            </div>

            {/* Public Live URL */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-indigo-50/60 border border-indigo-200/80 p-3.5 rounded-xl">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Globe size={18} className="text-indigo-600 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase text-indigo-900 font-bold block">
                        Official Custom Domain URL:
                      </span>
                    </div>
                    <code className="text-xs font-mono font-bold text-slate-900 truncate block select-all mt-0.5">
                      {customDomainPrivacyUrl}
                    </code>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-copy-custom-privacy-url"
                  onClick={() => handleCopyText(customDomainPrivacyUrl, setCopiedCustomUrl)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  {copiedCustomUrl ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Domain URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section id="sec-overview" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base md:text-lg mb-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
              <h2>Overview & Core Privacy Principles</h2>
            </div>
            <p className="mb-3 text-slate-600">
              NeoNova is designed with a <strong>privacy-first, student-safety architecture</strong>. Our educational tools—including step-by-step homework explanations, 3D anatomical models, interactive math solvers, and science simulations—are created to foster learning without invasive tracking.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <CheckCircle2 size={16} className="text-emerald-600 mb-1.5" />
                <h3 className="font-bold text-slate-900 text-xs mb-1">No Account Creation Required</h3>
                <p className="text-xs text-slate-500">You can use all features immediately without mandatory passwords, credit cards, or phone numbers.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <CheckCircle2 size={16} className="text-indigo-600 mb-1.5" />
                <h3 className="font-bold text-slate-900 text-xs mb-1">No Sale of Personal Data</h3>
                <p className="text-xs text-slate-500">We never sell, monetize, rent, or trade student inputs or academic logs to third parties or advertisers.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <CheckCircle2 size={16} className="text-blue-600 mb-1.5" />
                <h3 className="font-bold text-slate-900 text-xs mb-1">Client-Isolated Storage</h3>
                <p className="text-xs text-slate-500">Your study notebooks, flashcards, and progress trackers remain safely on your own local device.</p>
              </div>
            </div>
          </section>

          <section id="sec-permissions" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base md:text-lg mb-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">2</span>
              <h2>Device Permissions (Camera & Microphone)</h2>
            </div>
            <p className="mb-4 text-slate-600">
              Certain optional interactive features ask for explicit device permissions:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                  <Camera size={18} />
                  <h3>Camera Permission (Homework Scanner)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  Used <strong>strictly on-demand</strong> when taking a picture of a textbook problem or math worksheet to extract text and formulas.
                </p>
                <div className="p-2.5 bg-white rounded-lg text-[11px] text-slate-500 border border-slate-200">
                  <strong>Safety Guarantee:</strong> Images are processed transiently in memory. No continuous video feed or biometric facial identification is ever captured or stored.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
                  <Mic size={18} />
                  <h3>Microphone Permission (Voice Question)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  Used <strong>only when clicking the microphone button</strong> to speak homework questions aloud.
                </p>
                <div className="p-2.5 bg-white rounded-lg text-[11px] text-slate-500 border border-slate-200">
                  <strong>Safety Guarantee:</strong> Voice input is converted to text via standard Web Speech API streams and closed immediately after speech concludes. We do not record or archive ambient audio.
                </div>
              </div>
            </div>
          </section>

          <section id="sec-coppa" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base md:text-lg mb-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">3</span>
              <h2>Children's Privacy Protection (COPPA & FERPA)</h2>
            </div>
            <p className="mb-3 text-slate-600">
              Because NeoNova provides educational assistance across primary, middle, and secondary school grades (Grades 1 through 12), we treat children's privacy with the utmost rigor:
            </p>
            <ul className="space-y-2 pl-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>We <strong>do not knowingly collect personal identifiable information</strong> from children under the age of 13.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>No targeted behavioral advertising operates on student activity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                <span>Parents and guardians have full control to inspect, export, or permanently wipe any stored notes or progress metrics at any time.</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Navigation */}
        <footer className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NeoNova – Developed by Naisarg Ramdatti. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigateTo('/delete-account')} 
              className="text-rose-600 hover:text-rose-700 hover:underline cursor-pointer font-medium"
            >
              Delete Account
            </button>
            <span>•</span>
            <button 
              onClick={handleBack} 
              className="text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer font-medium"
            >
              Back to Study Desk
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
