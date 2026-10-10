import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Edit3, 
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { EduTab } from './EduSidebar';
import { PlanTier, PLANS, VerifiedSubscriptionState } from '../../lib/billing';

interface ProfileViewProps {
  studentName: string;
  studentAvatar: string;
  currentGrade: string;
  preferredSubjects: string[];
  academicXP: number;
  username?: string;
  userEmail?: string;
  isEmailVerified?: boolean;
  currentTier?: PlanTier;
  subscriptionState?: VerifiedSubscriptionState;
  onLogout?: () => void;
  onOpenSettings: () => void;
  onOpenPrivacyPolicy: () => void;
}

export default function ProfileView({
  studentName,
  studentAvatar,
  currentGrade,
  preferredSubjects,
  academicXP,
  username,
  userEmail,
  isEmailVerified,
  currentTier = 'starter',
  subscriptionState,
  onLogout,
  onOpenSettings,
  onOpenPrivacyPolicy
}: ProfileViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs text-slate-500">
          Academic record and learning statistics for the current school term.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl select-none shadow-2xs">
              {studentAvatar || '🎓'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {studentName || 'Student Cadet'}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 text-xs text-slate-500">
                <span className="font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  {currentGrade || 'Grade 8'}
                </span>
                <span>•</span>
                <span>{preferredSubjects.length} Active Subjects</span>
                <span>•</span>
                <span className="font-mono font-medium text-slate-700">{academicXP} Study XP</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Academic Learning Statistics Grid */}
        <div className="pt-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Learning Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Questions Asked</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">24</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Step-by-step analyzed</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Quizzes Completed</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">12</div>
              <div className="text-[10px] text-indigo-600 font-medium mt-0.5">85% average score</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Chapters Studied</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">9</div>
              <div className="text-[10px] text-slate-600 font-medium mt-0.5">Across all enrolled subjects</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 font-medium">Study Progress</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">68%</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Term on track</div>
            </div>
          </div>
        </div>

        {/* Enrolled Subjects Summary */}
        <div className="pt-6 mt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Subjects ({preferredSubjects.length})
            </h3>
            <button
              onClick={onOpenSettings}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Manage Subjects →
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferredSubjects.map((sub) => (
              <span
                key={sub}
                className="px-3 py-1 bg-slate-100/80 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        {/* Real User Account Details */}
        <div className="pt-6 mt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Verified User Account</span>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    <span>Email Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span>Unverified</span>
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentTier === 'pro'
                    ? 'bg-purple-100 text-purple-800'
                    : currentTier === 'plus'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {PLANS[currentTier]?.badge || 'STARTER'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Username: <strong className="text-slate-800 font-mono font-bold">{username || studentName}</strong> • Email: <strong className="text-slate-800 font-mono">{userEmail || 'registered student'}</strong>
              </p>
              {currentTier !== 'starter' && subscriptionState?.expiryTime && (
                <p className="text-[11px] font-medium text-indigo-700">
                  {subscriptionState.billingCycle === 'yearly' ? '📅 Yearly Plan (365 days)' : '📅 Monthly Plan (30 days)'} • Valid until {new Date(subscriptionState.expiryTime).toLocaleDateString()}
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Protected by cryptographic scrypt password hashing & unique credential verification.
              </p>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Compliance & Student Privacy Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-indigo-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Student Privacy & Educational Data Safety
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              NeoNova is strictly educational, student-friendly, and COPPA compliant. Your homework scans are never shared.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenPrivacyPolicy}
          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
        >
          <span>Privacy Policy</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}
