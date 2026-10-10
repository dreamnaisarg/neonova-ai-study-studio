import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  CheckCheck, 
  Share2, 
  ExternalLink, 
  Smartphone, 
  ShieldCheck, 
  Building2,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { OFFICIAL_PHONEPE_ACCOUNT, buildPhonePeUpiUri, generatePhonePeBrandedQr } from '../../lib/phonepeQrHelper';

interface PhonePeQrCardProps {
  amount: number;
  planName: string;
  orderId?: string;
  onCopyUpi?: () => void;
}

export default function PhonePeQrCard({
  amount,
  planName,
  orderId,
  onCopyUpi
}: PhonePeQrCardProps) {
  const [includeAmountInQr, setIncludeAmountInQr] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [showCopyBanner, setShowCopyBanner] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [sharedToast, setSharedToast] = useState<boolean>(false);

  const upiUri = includeAmountInQr 
    ? buildPhonePeUpiUri(amount, `NeoNova ${planName}`)
    : buildPhonePeUpiUri();

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);
    generatePhonePeBrandedQr(upiUri, 480)
      .then(url => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch(err => {
        console.error('Failed to generate real QR', err);
        if (isMounted) setIsGenerating(false);
      });
    return () => { isMounted = false; };
  }, [upiUri]);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId);
    setCopiedUpi(true);
    setShowCopyBanner(true);
    if (onCopyUpi) onCopyUpi();
    setTimeout(() => setCopiedUpi(false), 3000);
    setTimeout(() => setShowCopyBanner(false), 3500);
  };

  const handleDownloadCard = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `PhonePe_BankOfBaroda_5536_${OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NeoNova ${planName} - UPI Payment`,
          text: `Pay ₹${amount} for NeoNova ${planName} via UPI ID: ${OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId}`,
          url: upiUri
        });
      } catch (e) {
        handleCopyUpiId();
      }
    } else {
      handleCopyUpiId();
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
        {/* BANK OF BARODA HEADER */}
        <div className="flex flex-col items-center space-y-1.5 pt-1">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-9 h-9 fill-[#f35c24]">
              <path d="M50 5 C25.1 5 5 25.1 5 50 C5 74.9 25.1 95 50 95 C62.5 95 73.8 89.9 81.8 81.8 L70.5 70.5 C65.2 75.8 58 79 50 79 C34 79 21 66 21 50 C21 34 34 21 50 21 C66 21 79 34 79 50 L95 50 C95 25.1 74.9 5 50 5 Z" />
              <path d="M50 29 C38.4 29 29 38.4 29 50 C29 61.6 38.4 71 50 71 C55.8 71 61 68.7 64.9 64.9 L53.5 53.5 C52.6 54.4 51.4 55 50 55 C47.2 55 45 52.8 45 50 C45 47.2 47.2 45 50 45 C52.8 45 55 47.2 55 50 L71 50 C71 38.4 61.6 29 50 29 Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Bank Of Baroda - 5536
            </h3>
            <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Primary account for receiving money</span>
            </p>
          </div>
        </div>

        {/* REAL SCANNABLE QR CODE CONTAINER */}
        <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center relative">
          <div className="w-56 h-56 bg-white flex items-center justify-center relative">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <RefreshCw size={28} className="animate-spin text-[#5f259f]" />
                <span className="text-xs font-bold">Rendering PhonePe QR...</span>
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Real Scannable PhonePe QR for 9898074424@axl" 
                className="w-full h-full object-contain rounded-lg shadow-2xs"
              />
            ) : (
              <div className="text-xs text-slate-400">QR Code Unavailable</div>
            )}
          </div>
        </div>

        {/* UPI ID ROW WITH COPY BUTTON */}
        <div className="flex items-center justify-center gap-2 pt-1 w-full">
          <span className="text-xs sm:text-sm font-semibold text-slate-600">
            UPI ID: <span className="font-mono font-bold text-slate-900 select-all">9898074424@axl</span>
          </span>
          <button
            type="button"
            onClick={handleCopyUpiId}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy UPI ID"
            aria-label="Copy UPI ID"
          >
            {copiedUpi ? (
              <CheckCheck size={16} className="text-emerald-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>

        {/* QR MODE SELECTOR */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setIncludeAmountInQr(true)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              includeAmountInQr 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Fixed ₹{amount}.00 QR
          </button>
          <button
            type="button"
            onClick={() => setIncludeAmountInQr(false)}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
              !includeAmountInQr 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Exact App QR
          </button>
        </div>

        {/* DOWNLOAD & SHARE BUTTONS */}
        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          <button
            type="button"
            onClick={handleDownloadCard}
            className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download size={15} />
            <span>Download</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Share2 size={15} />
            <span>{sharedToast ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* TOAST: UPI ID COPIED */}
        {showCopyBanner && (
          <div className="w-full bg-slate-900 text-white rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="w-4 h-4 rounded-full bg-[#5f259f] flex items-center justify-center text-[10px] font-bold text-white">✓</span>
            <span>UPI ID copied to your clipboard.</span>
          </div>
        )}

        {/* BOTTOM BRAND FOOTER */}
        <div className="pt-3 border-t border-slate-100 w-full flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex flex-col items-start text-left">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Supported on all UPI apps</span>
            <div className="flex items-center gap-1.5 mt-0.5 font-bold text-slate-700">
              <span className="text-[#5f259f]">PhonePe</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600">BHIM</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-600">GPay</span>
              <span className="text-slate-300">•</span>
              <span className="text-sky-600">Paytm</span>
            </div>
          </div>
          <div className="flex flex-col items-end text-right border-l border-slate-200 pl-3">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Powered by</span>
            <span className="font-extrabold text-slate-800 italic tracking-wider">UPI⚡</span>
          </div>
        </div>
      </div>

      {/* QUICK MOBILE INTENT LAUNCHERS */}
      <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <a
          href={`phonepe://pay?pa=${OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId}&pn=Bank%20Of%20Baroda&am=${amount}.00&cu=INR&tn=${encodeURIComponent(`NeoNova ${planName}`)}`}
          className="py-2 px-2 bg-[#5f259f] hover:bg-[#4d1d82] text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
        >
          <span>📱 PhonePe</span>
        </a>
        <a
          href={`gpay://upi/pay?pa=${OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId}&pn=Bank%20Of%20Baroda&am=${amount}.00&cu=INR&tn=${encodeURIComponent(`NeoNova ${planName}`)}`}
          className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
        >
          <span>🌐 GPay</span>
        </a>
        <a
          href={`paytmmp://pay?pa=${OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId}&pn=Bank%20Of%20Baroda&am=${amount}.00&cu=INR&tn=${encodeURIComponent(`NeoNova ${planName}`)}`}
          className="py-2 px-2 bg-white hover:bg-slate-50 text-sky-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
        >
          <span>💳 Paytm</span>
        </a>
        <a
          href={`upi://pay?pa=${OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId}&pn=Bank%20Of%20Baroda&am=${amount}.00&cu=INR&tn=${encodeURIComponent(`NeoNova ${planName}`)}`}
          className="py-2 px-2 bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
        >
          <span>⚡ Any UPI</span>
        </a>
      </div>
    </div>
  );
}
