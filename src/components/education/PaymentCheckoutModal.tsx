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
  Wallet
} from 'lucide-react';
import { 
  PlanTier, 
  PLANS, 
  VerifiedSubscriptionState, 
  createServerPaymentOrder, 
  verifyPaymentOnServer, 
  getPlayStoreSubscriptionUrl,
  initiatePlayBillingPurchase
} from '../../lib/billing';
import PhonePeQrCard from './PhonePeQrCard';
import { buildPhonePeUpiUri } from '../../lib/phonepeQrHelper';
import AdminPaymentPortalModal from './AdminPaymentPortalModal';

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
  const [tier, setTier] = useState<'plus' | 'pro'>(targetTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'google_play' | 'card' | 'netbanking'>('upi');
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
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<VerifiedSubscriptionState | null>(null);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

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

  if (!isOpen) return null;

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
      setVerificationError("Please enter your transaction ID or UTR number from your payment confirmation receipt.");
      setIsProcessing(false);
      return;
    }

    if (transactionRef.length < 5) {
      setVerificationError("Please enter a valid transaction ID or UTR reference (at least 5 characters).");
      setIsProcessing(false);
      return;
    }

    try {
      const verifyRes = await verifyPaymentOnServer({
        orderId: orderId || `ORD-NEO-${Date.now()}`,
        paymentMethod: 'upi',
        transactionRef,
        tier,
        billingCycle,
        studentName,
        studentEmail
      });

      if (verifyRes.verified && verifyRes.verifiedState) {
        setVerifiedReceipt(verifyRes.verifiedState);
        setShowOtpModal(false);
        onPaymentSuccess(verifyRes.verifiedState);
      } else {
        setVerificationError(
          verifyRes.error || 
          "Payment verification failed. No authenticated banking transaction matching this reference was found."
        );
      }
    } catch (err: any) {
      setVerificationError(err?.message || "Failed to communicate with payment verification gateway.");
    } finally {
      setIsProcessing(false);
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
                <span>NeoNova Official Payment Gateway</span>
                <span className="text-[10px] px-2 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">256-BIT SSL</span>
              </span>
              <span className="block text-[10px] text-slate-400">
                Direct NPCI UPI Switch • Google Play Store • Core Banking Certified
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

              {/* PAYMENT METHOD SELECTOR TABS */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Payment Method:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('upi'); setVerificationError(null); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <QrCode size={20} className="text-emerald-600" />
                      <span className="text-[9px] font-black tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        ACTIVE • QR PAY
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">Instant UPI QR</div>
                      <div className="text-[10px] text-slate-500">PhonePe, GPay, Paytm, BHIM</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('google_play'); setVerificationError(null); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      paymentMethod === 'google_play'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Smartphone size={20} className={paymentMethod === 'google_play' ? 'text-amber-600' : 'text-slate-400'} />
                      <span className="text-[8px] font-black tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase">
                        TEMP UNAVAILABLE • QR
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">Google Play</div>
                      <div className="text-[10px] text-amber-700 font-medium">Replaced with QR</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setVerificationError(null); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard size={20} className={paymentMethod === 'card' ? 'text-amber-600' : 'text-slate-400'} />
                      <span className="text-[8px] font-black tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase">
                        TEMP UNAVAILABLE • QR
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">Debit / Credit Card</div>
                      <div className="text-[10px] text-amber-700 font-medium">Replaced with QR</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('netbanking'); setVerificationError(null); }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      paymentMethod === 'netbanking'
                        ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building2 size={20} className={paymentMethod === 'netbanking' ? 'text-amber-600' : 'text-slate-400'} />
                      <span className="text-[8px] font-black tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full uppercase">
                        TEMP UNAVAILABLE • QR
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">Net Banking</div>
                      <div className="text-[10px] text-amber-700 font-medium">Replaced with QR</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* PAYMENT DETAILS FORM BY METHOD */}
              <div className="space-y-4">
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
                                href={`gpay://upi/pay?pa=9898074424@axl&pn=Bank+Of+Baroda+5536&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
                                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <span>📱 Google Pay</span>
                              </a>
                              <a
                                href={`phonepe://pay?pa=9898074424@axl&pn=Bank+Of+Baroda+5536&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
                                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <span>📱 PhonePe</span>
                              </a>
                              <a
                                href={`paytmmp://pay?pa=9898074424@axl&pn=Bank+Of+Baroda+5536&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
                                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <span>💳 Paytm</span>
                              </a>
                              <a
                                href={upiPayString || `upi://pay?pa=9898074424@axl&pn=Bank+Of+Baroda+5536&am=${finalPrice}.00&cu=INR&tn=NeoNova+${tier.toUpperCase()}`}
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

                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyTransaction(); }} className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Enter your authorized transaction ID
                        </label>
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                          Example: 42134565
                        </span>
                      </div>

                      <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                        <strong>Security Notice:</strong> A user-entered transaction ID format is <em>not</em> proof of payment by itself. The server verifies this transaction against authoritative banking settlement records before unlocking paid features.
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          maxLength={32}
                          value={enteredUtr}
                          onChange={(e) => setEnteredUtr(e.target.value)}
                          placeholder="Enter your authorized transaction ID (e.g. 42134565)"
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
                              <span>Verifying with Server...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              <span>Verify Transaction</span>
                            </>
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Only an independently verified successful transaction will unlock paid NeoNova features.
                      </span>
                    </form>
                  </div>
                )}

                {/* 2. GOOGLE PLAY STORE METHOD (TEMPORARILY UNAVAILABLE - REPLACED WITH QR) */}
                {paymentMethod === 'google_play' && (
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <span className="uppercase tracking-wider font-extrabold">Google Play: Temporarily Unavailable</span>
                        <span className="text-[9px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-black">REPLACED WITH QR</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Google Play billing is currently <strong>temporarily unavailable</strong> while our engineering team is actively upgrading the integration. It has been replaced with the official <strong>Instant UPI QR Code Payment</strong> below so your plan activation is instant and seamless.
                      </p>
                    </div>

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

                    {upiSubTab === 'phonepe' ? (
                      <PhonePeQrCard
                        amount={finalPrice}
                        planName={currentPlan.name}
                        orderId={orderId}
                        onCopyUpi={handleCopyUpi}
                      />
                    ) : (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/30 shadow-md text-center shrink-0 flex flex-col items-center">
                          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-1 relative overflow-hidden border border-slate-100">
                            {isGeneratingQr ? (
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <RefreshCw size={24} className="animate-spin text-emerald-600" />
                                <span className="text-[11px] font-medium">Generating QR...</span>
                              </div>
                            ) : upiQrDataUrl ? (
                              <img 
                                src={upiQrDataUrl} 
                                alt="Official NeoNova UPI QR Code" 
                                className="w-full h-full object-contain select-none"
                              />
                            ) : (
                              <QrCode size={80} className="text-slate-300" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 mt-2 block">
                            Direct NPCI Switch Settlement
                          </span>
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-800 block">
                              Pay via Any UPI App to Activate:
                            </span>
                            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 justify-between">
                              <span className="font-bold text-indigo-700">9898074424@axl</span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="px-2.5 py-1 text-[11px] font-sans font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedUpi ? <CheckCheck size={12} /> : <Copy size={12} />}
                                <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyTransaction(); }} className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Enter your authorized transaction ID:
                        </label>
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                          Example: 42134565
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          maxLength={32}
                          value={enteredUtr}
                          onChange={(e) => setEnteredUtr(e.target.value)}
                          placeholder="Enter your authorized transaction ID (e.g. 42134565)"
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
                              <span>Verifying with Server...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              <span>Verify & Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 3. CARD METHOD (TEMPORARILY UNAVAILABLE - REPLACED WITH QR) */}
                {paymentMethod === 'card' && (
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <span className="uppercase tracking-wider font-extrabold">Debit / Credit Cards: Temporarily Unavailable</span>
                        <span className="text-[9px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-black">REPLACED WITH QR</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Credit card and Debit card processing is <strong>temporarily unavailable</strong> while payment switch maintenance is in progress. As requested, it has been replaced with the official <strong>Instant UPI QR Code Payment</strong> below so you can proceed without interruption.
                      </p>
                    </div>

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

                    {upiSubTab === 'phonepe' ? (
                      <PhonePeQrCard
                        amount={finalPrice}
                        planName={currentPlan.name}
                        orderId={orderId}
                        onCopyUpi={handleCopyUpi}
                      />
                    ) : (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/30 shadow-md text-center shrink-0 flex flex-col items-center">
                          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-1 relative overflow-hidden border border-slate-100">
                            {isGeneratingQr ? (
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <RefreshCw size={24} className="animate-spin text-emerald-600" />
                                <span className="text-[11px] font-medium">Generating QR...</span>
                              </div>
                            ) : upiQrDataUrl ? (
                              <img 
                                src={upiQrDataUrl} 
                                alt="Official NeoNova UPI QR Code" 
                                className="w-full h-full object-contain select-none"
                              />
                            ) : (
                              <QrCode size={80} className="text-slate-300" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 mt-2 block">
                            Direct NPCI Switch Settlement
                          </span>
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-800 block">
                              Pay via Any UPI App to Activate:
                            </span>
                            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 justify-between">
                              <span className="font-bold text-indigo-700">9898074424@axl</span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="px-2.5 py-1 text-[11px] font-sans font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedUpi ? <CheckCheck size={12} /> : <Copy size={12} />}
                                <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyTransaction(); }} className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Enter your authorized transaction ID:
                        </label>
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                          Example: 42134565
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          maxLength={32}
                          value={enteredUtr}
                          onChange={(e) => setEnteredUtr(e.target.value)}
                          placeholder="Enter your authorized transaction ID (e.g. 42134565)"
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
                              <span>Verifying with Server...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              <span>Verify & Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 4. NET BANKING METHOD (TEMPORARILY UNAVAILABLE - REPLACED WITH QR) */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-150">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <span className="uppercase tracking-wider font-extrabold">Net Banking: Temporarily Unavailable</span>
                        <span className="text-[9px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-black">REPLACED WITH QR</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Core Net Banking gateways (SBI, HDFC, ICICI, Axis, Kotak, PNB) are <strong>temporarily unavailable</strong> while server maintenance is taking place. As requested, it has been replaced with the official <strong>Instant UPI QR Code Payment</strong> below for uninterrupted activation.
                      </p>
                    </div>

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

                    {upiSubTab === 'phonepe' ? (
                      <PhonePeQrCard
                        amount={finalPrice}
                        planName={currentPlan.name}
                        orderId={orderId}
                        onCopyUpi={handleCopyUpi}
                      />
                    ) : (
                      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/30 shadow-md text-center shrink-0 flex flex-col items-center">
                          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-1 relative overflow-hidden border border-slate-100">
                            {isGeneratingQr ? (
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <RefreshCw size={24} className="animate-spin text-emerald-600" />
                                <span className="text-[11px] font-medium">Generating QR...</span>
                              </div>
                            ) : upiQrDataUrl ? (
                              <img 
                                src={upiQrDataUrl} 
                                alt="Official NeoNova UPI QR Code" 
                                className="w-full h-full object-contain select-none"
                              />
                            ) : (
                              <QrCode size={80} className="text-slate-300" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 mt-2 block">
                            Direct NPCI Switch Settlement
                          </span>
                        </div>
                        <div className="flex-1 space-y-3 w-full">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-800 block">
                              Pay via Any UPI App to Activate:
                            </span>
                            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 justify-between">
                              <span className="font-bold text-indigo-700">9898074424@axl</span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="px-2.5 py-1 text-[11px] font-sans font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                {copiedUpi ? <CheckCheck size={12} /> : <Copy size={12} />}
                                <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyTransaction(); }} className="pt-3 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-800">
                          Enter your authorized transaction ID:
                        </label>
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                          Example: 42134565
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          maxLength={32}
                          value={enteredUtr}
                          onChange={(e) => setEnteredUtr(e.target.value)}
                          placeholder="Enter your authorized transaction ID (e.g. 42134565)"
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
                              <span>Verifying with Server...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              <span>Verify & Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
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
                    Admin Portal (Naisarg Ramdatti)
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

      {/* 3D SECURE OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <Lock size={22} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Bank 3D-Secure Authentication
              </h3>
              <p className="text-xs text-slate-500">
                A one-time authorization code has been issued for this academic subscription of ₹{finalPrice}.00.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase block tracking-wider">
                SMS Authorization Notice:
              </span>
              <p className="font-mono text-xs">
                OTP: <strong>{generatedDemoOtp}</strong> for ₹{finalPrice}.00 to NeoNova Study Gateway.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Enter 6-Digit OTP:</label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleVerifyTransaction(`CARD-OTP-${enteredOtp}-${Date.now().toString(36).toUpperCase()}`)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isProcessing ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>Authorize & Unlock</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
