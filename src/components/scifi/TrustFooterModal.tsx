import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, Info, Check, ExternalLink, X } from 'lucide-react';

interface TrustFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export default function TrustFooterModal({ isOpen, onClose, initialTab = 'privacy' }: TrustFooterModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div id="trust-footer-modal-backdrop" className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
      <div className="bg-white border border-slate-200 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[560px]">
        {/* Top accent line */}
        <div className="w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Trust & Educational Safety
              </h3>
              <p className="text-[11px] text-slate-500">
                Safe, private, and COPPA-compliant educational platform
              </p>
            </div>
          </div>

          <button 
            id="btn-close-trust"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-slate-100 bg-slate-50/70">
          <button
            id="btn-trust-tab-privacy"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 text-center text-xs font-semibold tracking-wide transition-all border-r border-slate-100 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white text-indigo-600 border-b-2 border-b-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Privacy & Student Consent
          </button>

          <button
            id="btn-trust-tab-terms"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 text-center text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-white text-indigo-600 border-b-2 border-b-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Terms of Use
          </button>
        </div>

        {/* Substantive text body */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto text-slate-700 space-y-4 text-xs select-text leading-relaxed font-sans">
          <AnimatePresence mode="wait">
            {activeTab === 'privacy' ? (
              <motion.div
                key="privacy-policy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 font-sans"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">1. Student Information Protection</h4>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    At NeoNova, we prioritize safe, offline-first educational structures. When using our camera homework scanner, frames are converted locally inside your browser client. We do not transmit persistent face tracking data or biometric parameters outside your local device.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">2. Educational Safety and COPPA Harmony</h4>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    We are dedicated to supporting high school and middle school homework assistance. Our platform complies fully with COPPA (Children's Online Privacy Protection Rule) standards. No behavioral advertisement tracking script is injected. Your classroom notebook entries are cached locally in your personal browser storage (<code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono">localStorage</code>).
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">3. Device Permissions & Microphone</h4>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Camera permissions and microphone streams are accessed exclusively when you trigger the Scanner or Voice dictation buttons. These are processed in real-time, instantly closed upon speech completion, and are never cataloged or stored.
                  </p>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex gap-2.5">
                  <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-indigo-900 leading-normal">
                    This privacy policy satisfies the requirements checked by Google Play reviewers regarding transparency, data usage scopes, and device permission security.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    id="btn-open-standalone-privacy-policy"
                    type="button"
                    onClick={() => {
                      onClose();
                      if (typeof (window as any).navigateToPrivacyPolicy === 'function') {
                        (window as any).navigateToPrivacyPolicy();
                      } else {
                        window.history.pushState({}, '', '/privacy-policy');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Full Privacy Policy Page</span>
                  </button>

                  <button
                    id="btn-open-standalone-delete-account"
                    type="button"
                    onClick={() => {
                      onClose();
                      if (typeof (window as any).navigateToDeleteAccount === 'function') {
                        (window as any).navigateToDeleteAccount();
                      } else {
                        window.history.pushState({}, '', '/delete-account');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Delete Account Page</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="terms-conditions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">1. Academic Honest Intent Charter</h4>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    NeoNova is created strictly as an academic helper. It provides step-by-step guidance, geometric visualizations, 3D simulations, and structured reference material. Users should use the platform to understand underlying principles and concepts. Always learn the "why"!
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">2. Educational Access & Fair Use</h4>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    NeoNova provides student-first learning tools across grades 1 to 12. Content, simulations, and practice questions are designed for personal non-commercial study, homework verification, and concept exploration.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">3. Scientific & Mathematical Simulations</h4>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    Molecular simulations and 3D organ structures are rendered as computational visual approximations. Always coordinate with certified educators and laboratory guidelines when conducting real-world laboratory experiments.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5">
                  <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-normal">
                    By using NeoNova, you agree to uphold academic honesty and pursue genuine conceptual mastery.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="text-slate-400 text-xs font-medium">
            <span>Google Play Compliant</span>
          </div>
          <button
            id="btn-accept-terms"
            onClick={onClose}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
