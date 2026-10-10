import React from 'react';
import { Sparkles, X, Check, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { PlanTier, PLANS } from '../../lib/billing';

interface PremiumLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: PlanTier;
  featureName?: string;
  featureDescription?: string;
  onViewPlans: (targetTier?: PlanTier) => void;
  onUpgradeNow?: (targetTier: 'plus' | 'pro') => void;
}

export default function PremiumLockModal({
  isOpen,
  onClose,
  requiredTier,
  featureName,
  featureDescription,
  onViewPlans,
  onUpgradeNow
}: PremiumLockModalProps) {
  if (!isOpen) return null;

  const targetPlan = PLANS[requiredTier] || PLANS.plus;
  const isPro = requiredTier === 'pro';
  const tierTarget: 'plus' | 'pro' = isPro ? 'pro' : 'plus';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Lock size={20} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            {targetPlan.badge} Feature
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Unlock with {targetPlan.name}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {featureDescription || (
              featureName 
                ? `${featureName} is available on ${targetPlan.name}. Upgrade your academic toolkit to access this feature and unlock advanced study capabilities.`
                : `This learning tool requires a ${targetPlan.name} subscription.`
            )}
          </p>
        </div>

        {/* Key Features Pill List */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-slate-700">
            What you get with {targetPlan.name}:
          </div>
          {targetPlan.features.slice(1, 4).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-600">
              <Check size={13} className="text-emerald-600 shrink-0" />
              <span className="truncate">{f}</span>
            </div>
          ))}
          <div className="text-[11px] font-mono font-bold text-indigo-700 pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span>Starting at {targetPlan.priceMonthly}</span>
            <span className="text-[10px] text-slate-500 font-sans font-normal">Official Verified Access</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewPlans(requiredTier);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            Compare All Plans
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onUpgradeNow) {
                onUpgradeNow(tierTarget);
              } else {
                onViewPlans(requiredTier);
              }
            }}
            className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{isPro ? 'Upgrade to Pro' : 'Upgrade to Plus'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
