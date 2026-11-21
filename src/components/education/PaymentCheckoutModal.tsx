import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Check,
  AlertCircle,
  CreditCard,
  Building2,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Info,
  Wallet
} from 'lucide-react';
import {
  PLANS,
  VerifiedSubscriptionState,
  isNativeAndroidApp
} from '../../lib/billing';
import AdminPaymentPortalModal from './AdminPaymentPortalModal';
import { loadRazorpayScript } from '../../lib/cardPaymentService';
import { useTranslation } from '../../lib/i18n';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: 'plus' | 'pro';
  initialBillingCycle?: 'monthly' | 'yearly';
  studentName?: string;
  studentEmail?: string;
  onPaymentSuccess: (newState: VerifiedSubscriptionState) => void;
}

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  targetTier,
  initialBillingCycle = 'monthly',
  studentName = 'Cadet',
  studentEmail = '',
  onPaymentSuccess
}: PaymentCheckoutModalProps) {
  const { t } = useTranslation();
  const [tier, setTier] = useState<'plus' | 'pro'>(targetTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBillingCycle);

  // Processing & Verification States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'VERIFIED' | 'FAILED'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<VerifiedSubscriptionState | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Sync prop changes when modal opens
  useEffect(() => {
    if (isOpen) {
      setTier(targetTier);
      setBillingCycle(initialBillingCycle);
      setVerificationError(null);
      setVerifiedReceipt(null);
      setSubmissionStatus('idle');
      setStatusMessage('');
      setIsProcessing(false);
    }
  }, [isOpen, targetTier, initialBillingCycle]);

  const currentPlan = PLANS[tier];
  const finalPrice = billingCycle === 'monthly'
    ? (tier === 'plus' ? 99 : 199)
    : (tier === 'plus' ? 899 : 1799);

  // Razorpay Standard Web Checkout
  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    setVerificationError(null);
    setSubmissionStatus('idle');
    setStatusMessage('Opening Razorpay Secure Checkout...');

    try {
      // 1. Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded && !(window as any).Razorpay) {
        throw new Error('Razorpay Checkout SDK could not be loaded. Please check your internet connection.');
      }

      // Calculate amount in paise (minimum 100 paise)
      const amountInPaise = Math.max(100, finalPrice * 100);

      // 2. Step 1: Call /api/create-order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${tier}_${Date.now()}`,
          tier,
          billingCycle,
          studentName,
          studentEmail,
          accountId: studentEmail || studentName
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || 'Failed to create Razorpay payment order.');
      }

      const razorpayKeyId = orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        throw new Error('Razorpay public Key ID is not configured.');
      }

      // 3. Step 2: Open Razorpay modal with order_id
      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'NeoNova AI Study Studio',
        description: `NeoNova ${tier.toUpperCase()} Subscription (${billingCycle})`,
        order_id: orderData.order_id,
        prefill: {
          name: studentName || 'Student',
          email: studentEmail || ''
        },
        theme: {
          color: '#4f46e5'
        },
        handler: async function (response: any) {
          setIsProcessing(true);
          setStatusMessage('Verifying payment signature securely...');

          try {
            // Step 3: Verify HMAC-SHA256 signature on backend
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tier,
                billingCycle,
                amount: orderData.amount,
                studentName,
                studentEmail,
                token: typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_token') || undefined : undefined
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.verified && verifyData.verifiedState) {
              setVerifiedReceipt(verifyData.verifiedState);
              setSubmissionStatus('VERIFIED');
              setStatusMessage('Payment successful: Your NeoNova subscription is now active.');
              onPaymentSuccess(verifyData.verifiedState);
            } else {
              setSubmissionStatus('FAILED');
              setVerificationError(verifyData.error || 'Payment verification failed: Signature mismatch.');
            }
          } catch (err: any) {
            setSubmissionStatus('FAILED');
            setVerificationError(err.message || 'Failed to verify payment signature with server.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setStatusMessage('Payment cancelled or modal closed.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        setSubmissionStatus('FAILED');
        const desc = resp.error?.description || 'Payment failed or was declined by card/bank.';
        if (/website|domain|registered/i.test(desc)) {
          const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
          setVerificationError(
            `${desc} (Active page origin: ${currentOrigin} | Active key: ${razorpayKeyId}. Ensure this exact URL is registered under Razorpay Dashboard -> Account & Settings -> Website and App Settings.)`
          );
        } else {
          setVerificationError(desc);
        }
      });

      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setSubmissionStatus('FAILED');
      setVerificationError(err.message || 'Could not launch Razorpay checkout.');
    }
  };

  if (!isOpen || isNativeAndroidApp()) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP SECURITY BANNER */}
        <div className="bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <span>{t.checkoutTitle}</span>
                <span className="text-[10px] px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">256-BIT SSL</span>
              </span>
              <span className="block text-[10px] text-slate-400">
                Razorpay Standard Checkout • PCI-DSS Level 1 • Bank-Grade Security
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Close Checkout"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {verifiedReceipt ? (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                  <Check size={13} /> Official Subscription Activated
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome to NeoNova {PLANS[verifiedReceipt.tier].name}!
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Your payment has been officially verified via Razorpay. All premium learning features are now fully unlocked for your account.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900">{verifiedReceipt.orderId || 'Verified'}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Subscription Tier:</span>
                  <span className="font-bold text-indigo-700 uppercase">{PLANS[verifiedReceipt.tier].badge}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Amount Verified:</span>
                  <span className="font-bold text-slate-900">₹{verifiedReceipt.amountPaid || finalPrice}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="font-bold text-emerald-600 uppercase flex items-center gap-1">
                    <Check size={12} /> Active &amp; Verified
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Start Learning Now
              </button>
            </div>
          ) : (
            <>
              {/* PLAN SELECTION & ORDER HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                      Selected Plan
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-indigo-600 border border-indigo-200 shadow-2xs">
                      {currentPlan.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentPlan.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {currentPlan.tagline}
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-indigo-200/80 sm:pl-4">
                  <div className="text-2xl font-black text-slate-900">
                    ₹{finalPrice}
                    <span className="text-xs font-normal text-slate-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                    18% GST Included • Instant Activation
                  </span>
                </div>
              </div>

              {/* TIER & CYCLE SWITCHER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTier('plus')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      tier === 'plus' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    NeoNova Plus (₹99)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('pro')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      tier === 'pro' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    NeoNova Pro (₹199)
                  </button>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      billingCycle === 'yearly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-extrabold">Save 25%</span>
                  </button>
                </div>
              </div>

              {/* REAL-TIME PAYMENT STATUS INDICATOR BANNER */}
              {isProcessing && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center gap-3 animate-in fade-in duration-150">
                  <RefreshCw size={18} className="animate-spin text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 block">Processing payment</span>
                    <span className="text-xs font-semibold">{statusMessage || 'Checking your transaction securely...'}</span>
                  </div>
                </div>
              )}

              {!isProcessing && verificationError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-center gap-3 animate-in fade-in duration-150">
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 block">
                      Payment failed
                    </span>
                    <span className="text-xs font-medium">{verificationError}</span>
                  </div>
                </div>
              )}

              {!isProcessing && !verificationError && submissionStatus === 'idle' && statusMessage && (
                <div className="p-3 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 flex items-center gap-2.5 animate-in fade-in duration-150">
                  <Info size={16} className="text-slate-600 shrink-0" />
                  <span className="text-xs font-medium">{statusMessage}</span>
                </div>
              )}

              {/* RAZORPAY STANDARD WEB CHECKOUT */}
              <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-b from-indigo-50/70 to-slate-50 border border-indigo-200/80 space-y-5 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-indigo-100 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      R
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">Razorpay Standard Checkout</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                          OFFICIAL GATEWAY
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Credit &amp; Debit Cards, 50+ NetBanking, Wallets
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Payable</span>
                    <span className="text-lg font-black text-indigo-700 font-mono">₹{finalPrice}.00</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <CreditCard size={15} className="text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-700">Credit / Debit Cards</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <Building2 size={15} className="text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-700">50+ Net Banking Banks</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <Wallet size={15} className="text-purple-600 shrink-0" />
                    <span className="font-semibold text-slate-700">Digital Wallets</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-blue-600 shrink-0" />
                    <span className="font-semibold text-slate-700">PCI-DSS Encrypted</span>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Student Account:</span>
                    <span className="font-mono text-indigo-800 font-semibold">{studentName} {studentEmail ? `(${studentEmail})` : ''}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Subscription Plan:</span>
                    <span className="font-extrabold uppercase text-indigo-700">NeoNova {tier.toUpperCase()} ({billingCycle})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Verification &amp; Activation:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Instant (&lt; 3s) on Payment Success</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRazorpayCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 bg-linear-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Processing Razorpay Checkout...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={17} />
                      <span>Pay ₹{finalPrice}.00 with Razorpay Standard Checkout</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-400">
                  🔒 256-Bit SSL Encrypted. Powered by Razorpay Standard Web Checkout. Your payment details are protected by bank-grade security.
                </p>
              </div>

              {/* ANTI-FRAUD FOOTNOTE */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-slate-400 shrink-0" />
                  <span>
                    <strong>Anti-Fraud Policy:</strong> Subscriptions are verified in real-time via Razorpay cryptographic signature verification. NO VERIFIED PAYMENT → NO PAID ACCESS.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer shrink-0"
                >
                  Admin Portal
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Administrator Ledger & Verification Modal */}
      <AdminPaymentPortalModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
