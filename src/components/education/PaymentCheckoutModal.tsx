import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Check, 
  AlertCircle, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ExternalLink, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Download,
  Info,
  CheckCheck,
  Wallet,
  Clock
} from 'lucide-react';
import { 
  PlanTier, 
  PLANS, 
  VerifiedSubscriptionState, 
  PaymentVerificationStatus,
  createServerPaymentOrder, 
  verifyPaymentOnServer, 
  checkPaymentStatusOnServer,
  getPlayStoreSubscriptionUrl,
  initiatePlayBillingPurchase
} from '../../lib/billing';
import PhonePeQrCard from './PhonePeQrCard';
import { buildPhonePeUpiUri } from '../../lib/phonepeQrHelper';
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
  const { t, isFinnish } = useTranslation();
  const [tier, setTier] = useState<'plus' | 'pro'>(targetTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const [upiSubTab, setUpiSubTab] = useState<'phonepe' | 'dynamic'>('phonepe');

  // Real QR Code Data URLs
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [playStoreQrDataUrl, setPlayStoreQrDataUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(true);

  // Order state from server
  const [orderId, setOrderId] = useState<string>('');
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [upiPayString, setUpiPayString] = useState<string>('');
  const [isInitializingOrder, setIsInitializingOrder] = useState<boolean>(false);

  // Form Inputs
  const [enteredUtr, setEnteredUtr] = useState<string>('');
  const [enteredGpaId, setEnteredGpaId] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>(studentName || 'Student Name');
  const [selectedBank, setSelectedBank] = useState<string>('sbi');
  const [enteredNetBankingRef, setEnteredNetBankingRef] = useState<string>('');

  // 3D Secure / OTP Simulation for Cards
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState<string>('');

  // Processing & Verification States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | PaymentVerificationStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [submittedDetails, setSubmittedDetails] = useState<{
    orderId: string;
    utr: string;
    tier: 'plus' | 'pro';
    amount: number;
    cycle: 'monthly' | 'yearly';
    submittedAt: string;
  } | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<VerifiedSubscriptionState | null>(null);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [customRzpKey, setCustomRzpKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('neonova_rzp_live_key') || '';
    }
    return '';
  });

  // Sync prop changes
  useEffect(() => {
    if (isOpen) {
      setTier(targetTier);
      setBillingCycle(initialBillingCycle);
      setVerificationError(null);
      setVerifiedReceipt(null);
      setShowOtpModal(false);
      setEnteredUtr('');
      setEnteredGpaId('');
      setSubmissionStatus('idle');
      setStatusMessage('');
      setSubmittedDetails(null);
    }
  }, [isOpen, targetTier, initialBillingCycle]);

  // Create an official server order whenever tier or cycle changes
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function initOrder() {
      setIsInitializingOrder(true);
      setVerificationError(null);
      try {
        const res = await createServerPaymentOrder(tier, billingCycle, studentName, studentEmail);
        if (isMounted && res.success && res.orderId) {
          setOrderId(res.orderId);
          setOrderAmount(res.amount || (tier === 'plus' ? (billingCycle === 'monthly' ? 99 : 899) : (billingCycle === 'monthly' ? 199 : 1799)));
          setUpiPayString(res.upiPayString || '');
        }
      } catch (err: any) {
        console.error("Order init error", err);
      } finally {
        if (isMounted) setIsInitializingOrder(false);
      }
    }
    initOrder();
    return () => { isMounted = false; };
  }, [isOpen, tier, billingCycle, studentName, studentEmail]);

  const currentPlan = PLANS[tier];
  const finalPrice = billingCycle === 'monthly' 
    ? (tier === 'plus' ? 99 : 199)
    : (tier === 'plus' ? 899 : 1799);

  // Generate real QR code
  useEffect(() => {
    if (!isOpen) return;
    setIsGeneratingQr(true);
    const resolvedUpiUri = upiPayString || buildPhonePeUpiUri(finalPrice, `NeoNova ${tier.toUpperCase()}`);

    QRCode.toDataURL(resolvedUpiUri, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => {
        setUpiQrDataUrl(url);
        setIsGeneratingQr(false);
      })
      .catch(err => {
        console.error("Failed to generate UPI QR:", err);
        setIsGeneratingQr(false);
      });

    const playStoreUrl = getPlayStoreSubscriptionUrl(tier === 'plus' ? 'neonova_plus' : 'neonova_pro');
    QRCode.toDataURL(playStoreUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => {
        setPlayStoreQrDataUrl(url);
      })
      .catch(err => {
        console.error("Failed to generate Play Store QR:", err);
      });
  }, [isOpen, upiPayString, finalPrice, tier, orderId]);

  const getCardNetwork = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (/^4/.test(clean)) return { name: 'Visa', badge: 'VISA', color: 'text-blue-600' };
    if (/^5[1-5]/.test(clean)) return { name: 'Mastercard', badge: 'MASTERCARD', color: 'text-orange-600' };
    if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', badge: 'RuPay', color: 'text-emerald-700' };
    return { name: 'Card', badge: 'DEBIT/CREDIT', color: 'text-slate-600' };
  };

  const cardNetwork = getCardNetwork(cardNumber);

  const handleNativePlayPurchase = async () => {
    setIsProcessing(true);
    setVerificationError(null);
    try {
      const res = await initiatePlayBillingPurchase(tier);
      if (res.success && res.verifiedState) {
        setVerifiedReceipt(res.verifiedState);
        onPaymentSuccess(res.verifiedState);
      } else if (res.status === 'requires_android_play_store') {
        setVerificationError("To complete via Google Play, subscribe via the Play Store link/QR below, then enter your GPA Order ID from your Google Play receipt email to activate instantly.");
      } else {
        setVerificationError(res.message || "Google Play billing could not be completed.");
      }
    } catch (err: any) {
      setVerificationError(err.message || "Google Play interaction failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCard = cardNumber.replace(/\s+/g, '');
    if (cleanedCard.length < 15) {
      setVerificationError("Please enter a valid 16-digit card number.");
      return;
    }
    if (!cardExpiry || !cardCvv || cardCvv.length < 3) {
      setVerificationError("Please enter valid card expiry (MM/YY) and CVV.");
      return;
    }
    setVerificationError(null);
    const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedDemoOtp(demoOtp);
    setEnteredOtp(demoOtp);
    setShowOtpModal(true);
  };

  const handleVerifyTransaction = async (overrideRef?: string) => {
    setIsProcessing(true);
    setVerificationError(null);
    let transactionRef = (overrideRef || enteredUtr || enteredGpaId || enteredNetBankingRef || '').trim();

    if (!transactionRef) {
      setVerificationError("Please enter your PhonePe / UPI transaction reference (UTR) from your payment confirmation receipt.");
      setIsProcessing(false);
      return;
    }

    if (transactionRef.length < 5) {
      setVerificationError("Please enter a valid PhonePe transaction reference or UPI UTR number (at least 6 characters).");
      setIsProcessing(false);
      return;
    }

    const currentOrderId = orderId || `ORD-NEO-${Date.now()}`;

    try {
      const verifyRes = await verifyPaymentOnServer({
        orderId: currentOrderId,
        paymentMethod: 'upi',
        transactionRef,
        tier,
        billingCycle,
        expectedAmount: finalPrice,
        studentName,
        studentEmail,
        token: (typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_token') || undefined : undefined),
        directActivation: true
      });

      if (verifyRes.verified && verifyRes.verifiedState) {
        setVerifiedReceipt(verifyRes.verifiedState);
        setSubmissionStatus('VERIFIED');
        setStatusMessage("Payment successful: Your NeoNova subscription is now active.");
        setShowOtpModal(false);
        onPaymentSuccess(verifyRes.verifiedState);
      } else if (verifyRes.reason === 'ALREADY_USED') {
        setSubmissionStatus('FAILED');
        setVerificationError("Already processed: This transaction has already been applied to the appropriate order.");
      } else if (verifyRes.status === 'PENDING' || verifyRes.status === 'REVIEW_REQUIRED') {
        setSubmissionStatus(verifyRes.status);
        setStatusMessage(
          verifyRes.status === 'REVIEW_REQUIRED'
            ? "Payment reference is being reviewed by administrator."
            : "Payment pending: Waiting for confirmation from the payment provider."
        );
        setSubmittedDetails({
          orderId: currentOrderId,
          utr: transactionRef,
          tier,
          amount: finalPrice,
          cycle: billingCycle,
          submittedAt: new Date().toLocaleTimeString()
        });
      } else {
        setSubmissionStatus(verifyRes.status || 'FAILED');
        setVerificationError(
          verifyRes.error || 
          verifyRes.message || 
          "Payment failed: Payment could not be confirmed. Please retry or contact support."
        );
      }
    } catch (err: any) {
      setSubmissionStatus('PENDING');
      setStatusMessage("Payment pending: Waiting for confirmation from the payment provider.");
    } finally {
      setIsProcessing(false);
    }
  };


  // Razorpay Standard Web Checkout - Step 2: Open modal on button click
  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    setVerificationError(null);
    setStatusMessage("Opening Razorpay Secure Checkout...");

    try {
      // 1. Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded && !(window as any).Razorpay) {
        throw new Error("Razorpay Checkout SDK could not be loaded. Please check your internet connection.");
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
        throw new Error(orderData.error || "Failed to create Razorpay payment order.");
      }

      if (orderData.isSandboxFallback) {
        setIsProcessing(false);
        setVerificationError("Razorpay API rejected credentials (Authentication failed: Key ID and Secret do not match or are inactive in Razorpay Dashboard).");
        return;
      }

      const razorpayKeyId = orderData.key_id || 'rzp_test_TrguNqR3Yo84kk';

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
          // On success: receive razorpay_payment_id, razorpay_order_id, razorpay_signature
          setIsProcessing(true);
          setStatusMessage("Verifying payment signature securely...");

          try {
            // Step 3: Send all three to verify endpoint
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
                token: (typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_token') || undefined : undefined)
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.verified && verifyData.verifiedState) {
              setVerifiedReceipt(verifyData.verifiedState);
              setSubmissionStatus('VERIFIED');
              setStatusMessage("Payment successful: Your NeoNova subscription is now active.");
              onPaymentSuccess(verifyData.verifiedState);
            } else {
              setSubmissionStatus('FAILED');
              setVerificationError(verifyData.error || "Payment verification failed: Signature mismatch.");
            }
          } catch (err: any) {
            setSubmissionStatus('FAILED');
            setVerificationError(err.message || "Failed to verify payment signature with server.");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setStatusMessage("Payment cancelled or modal closed.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        setSubmissionStatus('FAILED');
        setVerificationError(resp.error?.description || "Payment failed or was declined by card/bank.");
      });

      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setVerificationError(err.message || "Could not launch Razorpay checkout.");
    }
  };

  // Section 7 & Section 1: Automatic bounded short-interval polling (every 1.5s)
  useEffect(() => {
    if (!isOpen || submissionStatus !== 'PENDING') return;

    let pollCount = 0;
    const maxPolls = 60; // Up to 90 seconds
    let isCancelled = false;

    const intervalId = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(intervalId);
        return;
      }

      const targetOrderId = submittedDetails?.orderId || orderId;
      const targetUtr = submittedDetails?.utr || enteredUtr;
      if (!targetOrderId && !targetUtr) return;

      try {
        const res = await checkPaymentStatusOnServer({
          orderId: targetOrderId,
          transactionId: targetUtr,
          accountId: studentEmail || studentName
        });

        if (isCancelled) return;

        if (res.verified && res.verifiedState) {
          clearInterval(intervalId);
          setVerifiedReceipt(res.verifiedState);
          setSubmissionStatus('VERIFIED');
          setStatusMessage("Payment successful: Your NeoNova subscription is now active.");
          onPaymentSuccess(res.verifiedState);
        } else if (res.status === 'FAILED') {
          clearInterval(intervalId);
          setSubmissionStatus('FAILED');
          setVerificationError(
            res.message?.includes('already')
              ? "Already processed: This transaction has already been applied to the appropriate order."
              : "Payment failed: Payment could not be confirmed. Please retry or contact support."
          );
        }
      } catch (err) {
        console.warn('Silent payment poll status check:', err);
      }
    }, 1500);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [isOpen, submissionStatus, submittedDetails, orderId, enteredUtr, studentEmail, studentName, onPaymentSuccess]);

  const handleCheckStatus = async () => {
    const targetOrderId = submittedDetails?.orderId || orderId;
    const targetUtr = submittedDetails?.utr || enteredUtr;
    if (!targetOrderId && !targetUtr) return;

    setIsCheckingStatus(true);
    setVerificationError(null);
    try {
      const res = await checkPaymentStatusOnServer({
        orderId: targetOrderId,
        transactionId: targetUtr,
        accountId: studentEmail || studentName
      });

      if (res.verified && res.verifiedState) {
        setVerifiedReceipt(res.verifiedState);
        setSubmissionStatus('VERIFIED');
        setStatusMessage("Payment successful: Your NeoNova subscription is now active.");
        onPaymentSuccess(res.verifiedState);
      } else {
        setSubmissionStatus(res.status);
        if (res.status === 'PENDING') {
          setStatusMessage("Payment pending: Waiting for confirmation from the payment provider.");
        } else {
          setStatusMessage(res.message);
        }
        if (res.status === 'FAILED') {
          setVerificationError(
            res.message?.includes('already')
              ? "Already processed: This transaction has already been applied to the appropriate order."
              : (res.message || "Payment failed: Payment could not be confirmed. Please retry or contact support.")
          );
        }
      }
    } catch {
      setStatusMessage("Payment pending: Waiting for confirmation from the payment provider.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("9898074424@axl");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!upiQrDataUrl) return;
    const a = document.createElement('a');
    a.href = upiQrDataUrl;
    a.download = `NeoNova_${tier.toUpperCase()}_UPI_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

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
                Direct NPCI UPI Switch • Razorpay Standard Checkout • Core Banking Certified
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
                  Your payment has been officially verified by the banking switch. All premium learning features are now fully unlocked for your account.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900">{verifiedReceipt.orderId || orderId}</span>
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
                    <Check size={12} /> Active & Verified
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

              {/* REAL-TIME PAYMENT STATUS INDICATOR BANNER (5 Explicit States) */}
              {isProcessing && (
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center gap-3 animate-in fade-in duration-150">
                  <RefreshCw size={18} className="animate-spin text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 block">Processing payment</span>
                    <span className="text-xs font-semibold">Checking your transaction securely...</span>
                  </div>
                </div>
              )}

              {!isProcessing && submissionStatus === 'PENDING' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="animate-spin text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 block">Payment pending</span>
                      <span className="text-xs font-semibold">Waiting for confirmation from the payment provider.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    disabled={isCheckingStatus}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw size={12} className={isCheckingStatus ? "animate-spin" : ""} />
                    <span>Refresh</span>
                  </button>
                </div>
              )}

              {!isProcessing && verificationError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-center gap-3 animate-in fade-in duration-150">
                  <AlertCircle size={18} className="text-rose-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 block">
                      {verificationError.includes('already') || verificationError.includes('Already')
                        ? 'Already processed'
                        : 'Payment failed'}
                    </span>
                    <span className="text-xs font-medium">{verificationError}</span>
                  </div>
                </div>
              )}

              {/* PAYMENT METHOD SELECTOR TABS */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t.selectPayment}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('razorpay'); setVerificationError(null); }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      paymentMethod === 'razorpay'
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-600/25'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                          R
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">{t.razorpayCheckout}</span>
                      </div>
                      <span className="text-[9px] font-black tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">
                        POPULAR • ALL-IN-ONE
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-600 font-medium">{t.razorpaySub}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Cards (Credit & Debit), 50+ Banks NetBanking, UPI, Wallets</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('upi'); setVerificationError(null); }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-600/25'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode size={20} className="text-emerald-600" />
                        <span className="text-xs font-extrabold text-slate-900">{t.instantUpi}</span>
                      </div>
                      <span className="text-[9px] font-black tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        PHONEPE • DIRECT QR
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-600 font-medium">{t.upiSub}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Scan & Pay directly via any installed UPI application</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* PAYMENT DETAILS FORM BY METHOD */}
              <div className="space-y-4">
                {/* 0. RAZORPAY STANDARD WEB CHECKOUT */}
                {paymentMethod === 'razorpay' && (
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
                            Cards, UPI, 50+ NetBanking, Wallets
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
                        <QrCode size={15} className="text-purple-600 shrink-0" />
                        <span className="font-semibold text-slate-700">UPI (PhonePe, GPay)</span>
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
                        <span className="font-bold text-slate-700">Verification & Activation:</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Instant (&lt; 3s) on Payment Success</span>
                        </span>
                      </div>
                    </div>

                    {/* Single Main Action Button */}
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
                )}

                {/* 1. UPI QR METHOD */}
                {paymentMethod === 'upi' && (
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-150">
                    <div className="flex bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80">
                      <button
                        type="button"
                        onClick={() => setUpiSubTab('phonepe')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          upiSubTab === 'phonepe'
                            ? 'bg-[#5f259f] text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white text-[#5f259f] flex items-center justify-center text-[10px] font-bold">✓</span>
                        <span>Official PhonePe QR (9898074424@axl)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiSubTab('dynamic')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          upiSubTab === 'dynamic'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <QrCode size={14} />
                        <span>Dynamic Order QR</span>
                      </button>
                    </div>

                    {upiSubTab === 'phonepe' && (
                      <PhonePeQrCard
                        amount={finalPrice}
                        planName={currentPlan.name}
                        orderId={orderId}
                        onCopyUpi={handleCopyUpi}
                      />
                    )}

                    {upiSubTab === 'dynamic' && (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/30 shadow-md text-center shrink-0 flex flex-col items-center">
                          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-1 relative overflow-hidden border border-slate-100">
                            {isGeneratingQr ? (
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <RefreshCw size={24} className="animate-spin text-emerald-600" />
                                <span className="text-[10px] font-bold">Generating Real QR...</span>
                              </div>
                            ) : upiQrDataUrl ? (
                              <img 
                                src={upiQrDataUrl} 
                                alt="Scan to pay via UPI" 
                                className="w-full h-full object-contain select-none"
                              />
                            ) : (
                              <QrCode size={100} className="text-slate-300" />
                            )}
                          </div>
                          <div className="mt-2.5 flex items-center justify-between w-full px-1">
                            <span className="text-xs font-black text-slate-900 font-mono">₹{finalPrice}.00</span>
                            <button
                              type="button"
                              onClick={handleDownloadQr}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                              title="Download QR Image"
                            >
                              <Download size={11} />
                              <span>Save QR</span>
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            Scan with GPay, PhonePe, Paytm or BHIM
                          </span>
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                              Official Merchant UPI ID:
                            </span>
                            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 mt-1 shadow-2xs">
                              <span className="font-mono text-xs font-bold text-slate-900 select-all">
                                9898074424@axl
                              </span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                {copiedUpi ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={13} />}
                                <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                              Pay Directly in Installed App:
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={`gpay://upi/pay?pa=9898074424@axl&pn=NeoNova+Education&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
                                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <span>📱 Google Pay</span>
                              </a>
                              <a
                                href={`phonepe://pay?pa=9898074424@axl&pn=NeoNova+Education&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
                                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <span>📱 PhonePe</span>
                              </a>
                              <a
                                href={`paytmmp://pay?pa=9898074424@axl&pn=NeoNova+Education&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
                                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <span>💳 Paytm</span>
                              </a>
                              <a
                                href={upiPayString || `upi://pay?pa=9898074424@axl&pn=NeoNova+Education&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
                                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <Smartphone size={13} />
                                <span>Any UPI App</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PhonePe Submission & Verification Status Component */}
                    {(submissionStatus === 'PENDING' || submissionStatus === 'REVIEW_REQUIRED') ? (
                      <div className="pt-3 border-t border-slate-200">
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-4 shadow-sm animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                                <Clock size={20} className="animate-spin" />
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                                  {submissionStatus === 'REVIEW_REQUIRED' ? 'REVIEW REQUIRED' : 'PENDING VERIFICATION'}
                                </span>
                                <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 mt-1">
                                  {statusMessage || "Payment submitted. Waiting for verification."}
                                </h4>
                              </div>
                            </div>
                          </div>

                          {/* Submission Details Association */}
                          <div className="bg-white rounded-xl p-3.5 border border-amber-200 text-xs space-y-2">
                            <div className="flex justify-between pb-1.5 border-b border-slate-100">
                              <span className="text-slate-500 font-medium">NeoNova Order ID:</span>
                              <span className="font-mono font-bold text-slate-900">{submittedDetails?.orderId || orderId}</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-100">
                              <span className="text-slate-500 font-medium">PhonePe / UPI Ref (UTR):</span>
                              <span className="font-mono font-bold text-indigo-700">{submittedDetails?.utr || enteredUtr}</span>
                            </div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-100">
                              <span className="text-slate-500 font-medium">Selected Plan:</span>
                              <span className="font-bold text-slate-800 uppercase">NeoNova {tier.toUpperCase()} ({billingCycle})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Expected Amount:</span>
                              <span className="font-black text-emerald-700 font-mono">₹{finalPrice}.00</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-amber-900/90 leading-relaxed">
                            Your payment reference is recorded in our secure database. Our administrator verifies each PhonePe QR payment directly against official merchant settlement records. Once verified, your subscription will activate automatically.
                          </p>

                          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCheckStatus}
                              disabled={isCheckingStatus}
                              className="w-full sm:flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <RefreshCw size={13} className={isCheckingStatus ? "animate-spin" : ""} />
                              <span>{isCheckingStatus ? "Checking Status with Server..." : "Check Verification Status"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSubmissionStatus('idle');
                                setVerificationError(null);
                              }}
                              className="w-full sm:w-auto py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Edit Reference / Resubmit
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); handleVerifyTransaction(); }} className="pt-3 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            Submit Payment for Verification
                          </label>
                          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                            Merchant: 9898074424@axl
                          </span>
                        </div>

                        {/* Order & Plan Association Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100 p-2.5 rounded-xl text-[11px] border border-slate-200">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">NeoNova Order ID</span>
                            <span className="font-mono font-bold text-slate-800">{orderId || `ORD-NEO-${Date.now()}`}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscription Plan</span>
                            <span className="font-bold text-indigo-700 uppercase">NeoNova {tier.toUpperCase()} ({billingCycle})</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Amount</span>
                            <span className="font-black text-emerald-700 font-mono">₹{finalPrice}.00</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800">
                              PhonePe / UPI Transaction Reference (UTR)
                            </label>
                            <span className="text-[10px] text-slate-500 font-medium">
                              12-digit UTR on receipt
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              maxLength={32}
                              value={enteredUtr}
                              onChange={(e) => setEnteredUtr(e.target.value)}
                              placeholder="Enter 12-digit UPI UTR (e.g. 627114829103)"
                              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                            <button
                              type="submit"
                              disabled={isProcessing}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                            >
                              {isProcessing ? (
                                <>
                                  <RefreshCw size={13} className="animate-spin" />
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck size={14} />
                                  <span>Submit for Verification</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                          <strong>Security Notice:</strong> A transaction ID or UPI reference is not proof of payment by itself. Submitted transactions remain in <strong>PENDING</strong> status until reconciled against official merchant settlement records. Unverified submissions will not activate premium access.
                        </div>
                      </form>
                    )}
                  </div>
                )}



                {/* ERROR FEEDBACK */}
                {verificationError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Verification Error</span>
                      <span className="leading-relaxed">{verificationError}</span>
                    </div>
                  </div>
                )}

                {/* ANTI-FRAUD FOOTNOTE */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-slate-400 shrink-0" />
                    <span>
                      <strong>Anti-Fraud Policy:</strong> Subscriptions are verified in real-time by authoritative banking networks. NO VERIFIED PAYMENT → NO PAID ACCESS.
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
