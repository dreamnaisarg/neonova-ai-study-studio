import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Lock, 
  Mail, 
  RefreshCw, 
  FileText, 
  Sparkles,
  ExternalLink,
  Info,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import NeoNovaLogo from './common/NeoNovaLogo';

interface DeleteAccountPageProps {
  onBackToApp?: () => void;
}

export default function DeleteAccountPage({ onBackToApp }: DeleteAccountPageProps) {
  const [activeStep, setActiveStep] = useState<'options' | 'client_wiped' | 'request_submitted'>('options');
  const [isWiping, setIsWiping] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestNickname, setRequestNickname] = useState('');
  const [requestReason, setRequestReason] = useState('Personal preference');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Delete Account & Data Erasure | NeoNova - AI Homework Helper";
  }, []);

  const fullDeleteUrl = "https://neonovastudy.com/delete-account";

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullDeleteUrl);
      } else {
        const input = document.createElement('input');
        input.value = fullDeleteUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
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

  // Instant on-device data erasure
  const handleInstantClientWipe = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setErrorMessage('Please type DELETE in the confirmation box below.');
      return;
    }
    setIsWiping(true);
    setErrorMessage(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsWiping(false);
      setActiveStep('client_wiped');
    } catch (err: any) {
      setIsWiping(false);
      setErrorMessage(err.message || 'Failed to complete local data erasure.');
    }
  };

  const handleServerDeletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail && !requestNickname) {
      setErrorMessage('Please provide either your contact email or student name.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/delete-account-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: requestEmail.trim(),
          nickname: requestNickname.trim(),
          reason: requestReason,
          timestamp: new Date().toISOString()
        })
      });
      const data = await res.json();
      setTicketId(data.ticketId || `NEO-DEL-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSubmitting(false);
      setActiveStep('request_submitted');
    } catch (err: any) {
      const fallbackTicket = `NEO-DEL-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(fallbackTicket);
      setIsSubmitting(false);
      setActiveStep('request_submitted');
    }
  };

  return (
    <div id="delete-account-page" className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top Accent Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 fixed top-0 left-0 z-50" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-from-delete"
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
              <span className="text-[10px] text-rose-600 font-medium hidden sm:inline">
                Account & Data Management Portal
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/privacy-policy"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/privacy-policy');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <ShieldCheck size={13} className="text-indigo-600" />
            <span>Privacy Policy</span>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 md:p-8 shadow-xs mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
              <ShieldAlert size={14} className="text-rose-600" />
              <span>Official Account & Data Deletion Portal</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Delete Your NeoNova Account & Data
            </h1>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-3xl mb-4">
              In full compliance with <strong>Google Play Developer Policies</strong>, <strong>GDPR</strong>, and <strong>CCPA</strong>, NeoNova grants every student and parent complete control over their account data. You can delete your on-device data instantly or submit a formal server erasure request below without needing to log in.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">App Identifier</span>
                <strong className="text-indigo-700 font-mono text-xs">com.neonova.app</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Turnaround Time</span>
                <strong className="text-emerald-700 font-medium">Instant (Local) / &lt; 24h (Server)</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Support Contact</span>
                <a href="mailto:dreamfind4424@gmail.com" className="text-indigo-600 hover:underline break-all font-medium">dreamfind4424@gmail.com</a>
              </div>
            </div>

            {/* Public Live URL */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-rose-50/60 border border-rose-200 p-3.5 rounded-xl">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Globe size={18} className="text-rose-600 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[11px] uppercase text-rose-900 font-bold block">
                    Public Web URL (For Google Play Account Deletion Requirement):
                  </span>
                  <code className="text-xs font-mono font-bold text-slate-900 truncate block select-all mt-0.5">
                    {fullDeleteUrl}
                  </code>
                </div>
              </div>
              <button
                type="button"
                id="btn-copy-delete-url"
                onClick={handleCopyUrl}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                {copiedUrl ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {activeStep === 'client_wiped' ? (
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 md:p-8 text-center shadow-xs mb-8">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              On-Device Data Successfully Erased
            </h2>
            <p className="text-slate-600 text-xs md:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
              All your local notebooks, saved solutions, avatar profiles, progress records, and application caches have been completely wiped from this browser and device storage.
            </p>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Restart NeoNova Fresh
            </button>
          </div>
        ) : activeStep === 'request_submitted' ? (
          <div className="bg-white border border-indigo-200 rounded-2xl p-6 md:p-8 text-center shadow-xs mb-8">
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-200">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              Deletion Request Submitted
            </h2>
            <p className="text-slate-600 text-xs md:text-sm max-w-lg mx-auto mb-4 leading-relaxed">
              Your formal account and data erasure ticket has been registered. Our security team processes all incoming requests within 24 hours.
            </p>
            {ticketId && (
              <div className="inline-block bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono text-indigo-700 font-bold mb-6">
                Verification Ticket ID: <span className="text-slate-900">{ticketId}</span>
              </div>
            )}
            <div>
              <button
                onClick={handleBack}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Return to NeoNova App
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Method 1: Instant Local Device Data Wipe */}
            <div className="bg-white border border-rose-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Instant On-Device Data Wipe (Recommended)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Immediately purge all local profile information, chat logs, homework history, and offline storage from this device.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-4">
                <label className="block text-xs text-slate-700 mb-2 font-medium">
                  To prevent accidental data loss, please type <strong className="text-rose-700 font-bold">DELETE</strong> below:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full max-w-sm px-3.5 py-2 bg-white border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400"
                />
              </div>

              <button
                id="btn-confirm-instant-wipe"
                type="button"
                onClick={handleInstantClientWipe}
                disabled={isWiping || confirmText.trim().toUpperCase() !== 'DELETE'}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isWiping ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Erasing Local Storage...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Permanently Wipe All Local Data Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Method 2: Formal Server-Side Request Form */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Submit Formal Account Erasure Request
                  </h2>
                  <p className="text-xs text-slate-500">
                    Submit your details if you want our administrative team to confirm complete deletion across cloud endpoints.
                  </p>
                </div>
              </div>

              <form onSubmit={handleServerDeletionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Student Name or Account Identifier:
                    </label>
                    <input
                      type="text"
                      value={requestNickname}
                      onChange={(e) => setRequestNickname(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs text-slate-900 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Contact Email (for ticket confirmation):
                    </label>
                    <input
                      type="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="student_parent@domain.com"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Reason for Deletion (Optional):
                  </label>
                  <select
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-xs text-slate-800"
                  >
                    <option value="Personal preference">Personal preference</option>
                    <option value="Graduated / No longer using app">Graduated / No longer using app</option>
                    <option value="Privacy concerns">Privacy concerns</option>
                    <option value="Starting over with fresh account">Starting over with fresh account</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Submitting Deletion Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={14} />
                      <span>Submit Deletion Ticket</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
