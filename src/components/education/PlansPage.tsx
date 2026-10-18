import React, { useState } from 'react';
import { 
  Check, 
  Minus, 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PlanTier, 
  PLANS, 
  initiatePlayBillingPurchase, 
  restorePlayPurchases, 
  getPlayStoreSubscriptionUrl,
  VerifiedSubscriptionState
} from '../../lib/billing';
import PaymentCheckoutModal from './PaymentCheckoutModal';

interface PlansPageProps {
  currentTier: PlanTier;
  onSubscriptionUpdated: (newState: VerifiedSubscriptionState) => void;
  onClose?: () => void;
  isGuest?: boolean;
  onSelectPlan?: (targetTier: 'plus' | 'pro', billingCycle: 'monthly' | 'yearly') => void;
}

export default function PlansPage({
  currentTier,
  onSubscriptionUpdated,
  onClose,
  isGuest = false,
  onSelectPlan
}: PlansPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutTargetTier, setCheckoutTargetTier] = useState<'plus' | 'pro'>('plus');

  const handleSelectPlan = (targetTier: 'plus' | 'pro') => {
    if (currentTier === targetTier) {
      setFeedbackMessage({
        text: `You are already enrolled in NeoNova ${PLANS[targetTier].name}.`,
        type: 'info'
      });
      return;
    }
    setFeedbackMessage(null);
    if (onSelectPlan) {
      onSelectPlan(targetTier, billingCycle);
      return;
    }
    setCheckoutTargetTier(targetTier);
    setIsCheckoutOpen(true);
  };

  const handleRestorePurchases = async () => {
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const res = await restorePlayPurchases();
      if (res.found) {
        onSubscriptionUpdated({
          tier: res.tier,
          status: 'active',
          lastVerifiedAt: new Date().toISOString()
        });
        setFeedbackMessage({ text: res.message, type: 'success' });
      } else {
        setFeedbackMessage({ text: res.message, type: 'info' });
      }
    } catch (e: any) {
      setFeedbackMessage({ text: "Could not restore purchases.", type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Comparison matrix features
  const comparisonMatrix = [
    { name: 'Core Homework Help', starter: '✓', plus: '✓', pro: '✓' },
    { name: 'Basic Quizzes (Grade 1-12)', starter: '✓', plus: '✓', pro: '✓' },
    { name: 'Advanced Adaptive Quizzes', starter: '—', plus: '✓', pro: '✓' },
    { name: 'Memory Booster (Flashcards)', starter: '—', plus: '✓', pro: '✓' },
    { name: 'Formula Visualizer', starter: '—', plus: '✓', pro: '✓' },
    { name: 'Scientific 3D Anatomy Lab', starter: '—', plus: '✓', pro: '✓' },
    { name: 'Advanced NeoVision Suite', starter: '—', plus: '—', pro: '✓' },
    { name: 'Exam Preparation & Shield', starter: '—', plus: '—', pro: '✓' },
    { name: 'Advanced Learning Analysis', starter: '—', plus: '—', pro: '✓' },
    { name: 'AI Daily Usage Limit', starter: 'Limited', plus: 'High', pro: 'Highest' },
    { name: 'Processing Speed', starter: 'Standard', plus: 'Priority', pro: 'Instant' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
          <Sparkles size={13} className="text-indigo-600" />
          <span>Google Play Verified Subscriptions</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Choose Your NeoNova Plan
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Choose the learning experience that fits you. Designed for students from Grade 1 to 12.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-sans font-bold">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert Banner */}
      {feedbackMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 max-w-2xl mx-auto ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : feedbackMessage.type === 'error'
            ? 'bg-rose-50 border border-rose-200 text-rose-800'
            : 'bg-indigo-50 border border-indigo-200 text-indigo-800'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : feedbackMessage.type === 'error' ? (
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">
            {feedbackMessage.text}
          </div>
        </div>
      )}

      {/* 3 Clean Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. STARTER (FREE) */}
        <div className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all ${
          currentTier === 'starter' 
            ? 'border-indigo-600 shadow-sm ring-1 ring-indigo-600/10' 
            : 'border-slate-200/90 hover:border-slate-300'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                STARTER
              </span>
              {currentTier === 'starter' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Active Plan
                </span>
              )}
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                FREE
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Default learning toolkit for every student
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              {PLANS.starter.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={currentTier === 'starter'}
              className="w-full py-2.5 px-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold cursor-default"
            >
              Current Plan
            </button>
          </div>
        </div>

        {/* 2. PLUS (PAID) */}
        <div className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
          currentTier === 'plus' 
            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-600/20' 
            : 'border-indigo-200/90 hover:border-indigo-400 hover:shadow-sm'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                PLUS ⭐
              </span>
              {currentTier === 'plus' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Active Plan
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Popular
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {billingCycle === 'monthly' ? PLANS.plus.priceMonthly : PLANS.plus.priceYearly}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Higher AI capacity, scientific 3D models, and memory revision
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              {PLANS.plus.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={isProcessing || currentTier === 'plus'}
              onClick={() => handleSelectPlan('plus')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                currentTier === 'plus'
                  ? 'bg-slate-100 text-slate-500 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
              }`}
            >
              <span>{currentTier === 'plus' ? 'Current Plan' : 'Upgrade to Plus'}</span>
              {currentTier !== 'plus' && <ArrowRight size={13} />}
            </button>
          </div>
        </div>

        {/* 3. PRO (PAID) */}
        <div className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
          currentTier === 'pro' 
            ? 'border-purple-600 shadow-md ring-2 ring-purple-600/20' 
            : 'border-slate-200/90 hover:border-purple-300 hover:shadow-sm'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600">
                PRO 👑
              </span>
              {currentTier === 'pro' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Active Plan
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Full Suite
                </span>
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {billingCycle === 'monthly' ? PLANS.pro.priceMonthly : PLANS.pro.priceYearly}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                The complete NeoNova academic experience with full spatial labs
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              {PLANS.pro.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check size={14} className="text-purple-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              disabled={isProcessing || currentTier === 'pro'}
              onClick={() => handleSelectPlan('pro')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                currentTier === 'pro'
                  ? 'bg-slate-100 text-slate-500 cursor-default'
                  : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-98'
              }`}
            >
              <span>{currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}</span>
              {currentTier !== 'pro' && <ArrowRight size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Plan Comparison Table */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Compare Features Across Plans
          </h2>
          <p className="text-xs text-slate-500">
            Clear feature entitlement overview for students and parents.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 pr-4">Feature</th>
                <th className="py-3 px-3 text-center">Starter</th>
                <th className="py-3 px-3 text-center">Plus</th>
                <th className="py-3 pl-3 text-center text-purple-700">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {comparisonMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4 font-medium text-slate-800">
                    {row.name}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    {row.starter === '✓' ? (
                      <Check size={15} className="text-emerald-600 inline" />
                    ) : row.starter === '—' ? (
                      <Minus size={14} className="text-slate-300 inline" />
                    ) : (
                      <span className="text-slate-600">{row.starter}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">
                    {row.plus === '✓' ? (
                      <Check size={15} className="text-indigo-600 inline" />
                    ) : row.plus === '—' ? (
                      <Minus size={14} className="text-slate-300 inline" />
                    ) : (
                      <span className="text-indigo-700 font-semibold">{row.plus}</span>
                    )}
                  </td>
                  <td className="py-3 pl-3 text-center font-mono font-medium bg-purple-50/20">
                    {row.pro === '✓' ? (
                      <Check size={15} className="text-purple-600 inline" />
                    ) : (
                      <span className="text-purple-800 font-semibold">{row.pro}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Google Play Billing Management Footer */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-slate-900">
              Google Play In-App Purchase Integrity
            </h4>
            <p className="text-slate-500 mt-0.5">
              Subscriptions are managed securely via Google Play. You can cancel or modify your plan anytime in the Play Store.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRestorePurchases}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Restore Purchases</span>
          </button>
          {currentTier !== 'starter' && (
            <a
              href={getPlayStoreSubscriptionUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Manage Subscription</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </section>

      {/* Official Payment & Checkout Sheet */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        targetTier={checkoutTargetTier}
        initialBillingCycle={billingCycle}
        onPaymentSuccess={(newState) => {
          onSubscriptionUpdated(newState);
          setFeedbackMessage({
            text: `Payment verified successfully! Welcome to NeoNova ${PLANS[newState.tier].name}.`,
            type: 'success'
          });
        }}
      />
    </div>
  );
}
