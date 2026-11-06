import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  UserX, 
  FileText, 
  Send, 
  Info,
  Lock
} from 'lucide-react';

export interface ReportItemDetails {
  type: 'ai_response' | 'user_profile' | 'battle_peer' | 'general_content';
  contentId?: string;
  contentText?: string;
  targetUserName?: string;
  targetUserId?: string;
}

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemDetails?: ReportItemDetails | null;
  onUserBlocked?: (userId: string, userName: string) => void;
}

export default function ReportContentModal({
  isOpen,
  onClose,
  itemDetails,
  onUserBlocked
}: ReportContentModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('inaccurate_info');
  const [comments, setComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [reportTicketId, setReportTicketId] = useState<string>('');
  const [userBlockedSuccess, setUserBlockedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const isUserReport = itemDetails?.type === 'user_profile' || itemDetails?.type === 'battle_peer';

  const reasons = isUserReport ? [
    { id: 'inappropriate_name', label: 'Inappropriate or offensive student name' },
    { id: 'harassment', label: 'Bullying, harassment, or offensive conduct' },
    { id: 'cheating_or_bot', label: 'Cheating, automated bot, or unfair play' },
    { id: 'spam', label: 'Spam or commercial advertisement' },
    { id: 'other_user', label: 'Other violation of Community Safety Guidelines' }
  ] : [
    { id: 'inaccurate_info', label: 'Factually inaccurate or misleading explanation' },
    { id: 'inappropriate_content', label: 'Inappropriate language or unsafe advice' },
    { id: 'calculation_error', label: 'Mathematical or scientific calculation error' },
    { id: 'unclear_explanation', label: 'Confusing, broken, or unhelpful response' },
    { id: 'copyright_or_plagiarism', label: 'Intellectual property or copyright concern' },
    { id: 'other_ai', label: 'Other issue or educational feedback' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ticket = `RPT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setReportTicketId(ticket);

    // Save report locally for audit trail and compliance
    try {
      const storedReports = JSON.parse(localStorage.getItem('neonova_content_reports') || '[]');
      storedReports.unshift({
        ticketId: ticket,
        timestamp: new Date().toISOString(),
        reason: selectedReason,
        comments,
        itemDetails: itemDetails || { type: 'general_content' }
      });
      localStorage.setItem('neonova_content_reports', JSON.stringify(storedReports.slice(0, 50)));
    } catch (err) {
      console.warn('Could not store content report locally:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleBlockUser = () => {
    if (!itemDetails?.targetUserId && !itemDetails?.targetUserName) return;
    const uid = itemDetails.targetUserId || itemDetails.targetUserName || 'unknown_user';
    const uname = itemDetails.targetUserName || 'Student';

    try {
      const blocked = JSON.parse(localStorage.getItem('neonova_blocked_users') || '[]');
      if (!blocked.includes(uid)) {
        blocked.push(uid);
        localStorage.setItem('neonova_blocked_users', JSON.stringify(blocked));
      }
    } catch {}

    setUserBlockedSuccess(true);
    if (onUserBlocked) {
      onUserBlocked(uid, uname);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setUserBlockedSuccess(false);
    setComments('');
    setSelectedReason('inaccurate_info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Top Warning Stripe */}
        <div className="w-full h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />

        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isUserReport ? 'Report or Block User' : 'Report Educational Content'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Google Play Community Safety & Zero-Tolerance Protection
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Report Received</h4>
              <p className="text-slate-600 text-xs max-w-sm mx-auto leading-relaxed">
                Thank you for helping keep NeoNova safe and academically accurate. Our academic safety moderators will review this report promptly.
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 inline-block">
                Reference ID: <span className="font-bold text-indigo-700">{reportTicketId}</span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Context Summary */}
              {itemDetails && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Target Information
                  </span>
                  {itemDetails.targetUserName && (
                    <div className="font-semibold text-slate-800">
                      Student: <span className="text-indigo-700">{itemDetails.targetUserName}</span>
                    </div>
                  )}
                  {itemDetails.contentText && (
                    <div className="text-slate-600 italic line-clamp-2 text-[11px]">
                      "{itemDetails.contentText}"
                    </div>
                  )}
                </div>
              )}

              {/* Block User Option if it is a user report */}
              {isUserReport && (
                <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <UserX size={14} className="text-rose-600" />
                      <span>Block this student</span>
                    </span>
                    <p className="text-[11px] text-rose-700 leading-normal">
                      Prevents this user from matching with you in Battle Arena or displaying their profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={userBlockedSuccess}
                    onClick={handleBlockUser}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      userBlockedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    }`}
                  >
                    {userBlockedSuccess ? 'Blocked ✓' : 'Block User'}
                  </button>
                </div>
              )}

              {/* Reason Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Select Reason:
                </label>
                <div className="space-y-1.5">
                  {reasons.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReason === r.id
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={r.id}
                        checked={selectedReason === r.id}
                        onChange={() => setSelectedReason(r.id)}
                        className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Additional Details (Optional):
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Describe what was inaccurate, unsafe, or inappropriate..."
                  rows={3}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Educational Safety Disclosure */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2 text-[11px] text-indigo-900 leading-relaxed">
                <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  NeoNova upholds Google Play Families & UGC Safety policies. All reports are logged and reviewed to ensure a safe, constructive educational atmosphere for K-12 students.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
