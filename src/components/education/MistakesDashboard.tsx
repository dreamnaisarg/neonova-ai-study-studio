import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface MistakesDashboardProps {
  userId?: string;
  onNavigateToPractice?: (topic: string) => void;
}

export default function MistakesDashboard({
  userId = 'student-1',
  onNavigateToPractice
}: MistakesDashboardProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingRevision, setIsGeneratingRevision] = useState(false);
  const [examRevisionPlan, setExamRevisionPlan] = useState<any | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [selectedMistake, setSelectedMistake] = useState<any | null>(null);

  const fetchStudentMemory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/student/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.warn('Failed to load student memory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentMemory();
  }, [userId]);

  const handleGenerateExamRevision = async () => {
    setIsGeneratingRevision(true);
    try {
      const res = await fetch('/api/student/exam-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setExamRevisionPlan(data);
      }
    } catch (e) {
      console.warn('Failed to generate exam revision:', e);
    } finally {
      setIsGeneratingRevision(false);
    }
  };

  const topicStatsList = profile?.topicStats ? Object.values(profile.topicStats) : [];
  const mistakesList = profile?.mistakes || [];

  const filteredMistakes = mistakesList.filter((m: any) => {
    if (filterSubject === 'all') return true;
    return m.subject.toLowerCase() === filterSubject.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <NeoNovaLogo size={40} glow className="shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Mistake History & Long-Term Learning Memory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure cognitive analytics tracking actual questions, errors, and targeted exam revision
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateExamRevision}
          disabled={isGeneratingRevision || mistakesList.length === 0}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          {isGeneratingRevision ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          <span>Generate Pre-Exam Revision</span>
        </button>
      </div>

      {/* Pattern Detection Notification (Requirement: e.g. "Your recent practice shows that fractions...") */}
      {profile?.weakTopics && profile.weakTopics.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-start gap-3 animate-in fade-in">
          <AlertCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-indigo-950">Detected Cognitive Pattern:</h4>
            <p className="text-indigo-800 mt-0.5">
              Your recent practice shows that <strong className="font-bold text-indigo-950">{profile.weakTopics.join(', ')}</strong> {profile.weakTopics.length === 1 ? 'is' : 'are'} among the topics you should review before your next assessment.
            </p>
            {onNavigateToPractice && (
              <button
                onClick={() => onNavigateToPractice(profile.weakTopics[0])}
                className="mt-2 text-indigo-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Launch targeted review on {profile.weakTopics[0]}</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exam Revision Plan Card (When Generated) */}
      {examRevisionPlan && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-indigo-500/30 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Personalized Pre-Exam Revision Strategy
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Analyzed {examRevisionPlan.totalMistakesAnalyzed} authenticated student attempts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examRevisionPlan.revisionModules.map((mod: any, i: number) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{mod.topic}</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    {mod.previousMistakesCount} past errors
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dominant error: <strong className="text-slate-700 font-medium">{mod.commonErrorType}</strong>
                </p>
                <p className="text-xs text-indigo-900 bg-white p-2 rounded-xl border border-indigo-100">
                  {mod.actionableAdvice}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Performance Grid (Topic → Attempts → Correct → Incorrect → Common mistake → Improvement) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Topic Mastery Performance Matrix
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {topicStatsList.length} Topics Recorded
          </span>
        </div>

        {topicStatsList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
            <p>No questions recorded yet. As you solve homework and practice questions, NeoNova securely records your progress here without fake simulated data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-center">Attempts</th>
                  <th className="py-2.5 px-3 text-center">Correct</th>
                  <th className="py-2.5 px-3 text-center">Incorrect</th>
                  <th className="py-2.5 px-3">Common Mistake</th>
                  <th className="py-2.5 px-3 text-right">Accuracy & Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {topicStatsList.map((stat: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{stat.topicName}</td>
                    <td className="py-3 px-3 text-slate-500">{stat.subject}</td>
                    <td className="py-3 px-3 text-center font-mono">{stat.attempts}</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-600 font-bold">{stat.correct}</td>
                    <td className="py-3 px-3 text-center font-mono text-rose-600 font-bold">{stat.incorrect}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-mono">
                        {stat.commonMistakeCategory || 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center gap-1 font-mono font-bold ${
                        stat.accuracyRate >= 80 ? 'text-emerald-600' : stat.accuracyRate >= 60 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {stat.accuracyRate}%
                        {stat.improvementTrend === 'improving' ? (
                          <TrendingUp size={13} className="text-emerald-500" />
                        ) : stat.improvementTrend === 'needs_practice' ? (
                          <TrendingDown size={13} className="text-rose-500" />
                        ) : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Mistakes Log */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Mistake Log & Root Cause Analysis
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Filter:</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
            </select>
          </div>
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
            <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2 opacity-60" />
            <p>No recorded mistakes under this filter. Great job maintaining accuracy!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMistakes.map((mistake: any) => (
              <div 
                key={mistake.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors space-y-2 cursor-pointer"
                onClick={() => setSelectedMistake(mistake)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                      {mistake.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{mistake.topic}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    mistake.resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {mistake.resolved ? 'Resolved' : 'Needs Practice'}
                  </span>
                </div>

                <p className="text-xs text-slate-800 font-medium">
                  {mistake.question}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>Your answer: <strong className="text-rose-600 font-bold">{mistake.studentAnswer}</strong></span>
                  <span>Correct: <strong className="text-emerald-700 font-bold">{mistake.correctAnswer}</strong></span>
                  <span className="text-indigo-600 font-sans">Cause: {mistake.mistakeCategory?.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mistake Detail Modal */}
      {selectedMistake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">{selectedMistake.subject} &middot; {selectedMistake.topic}</span>
                <h4 className="text-sm font-bold text-slate-900">Mistake Root-Cause Review</h4>
              </div>
              <button
                onClick={() => setSelectedMistake(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-semibold text-slate-900">{selectedMistake.question}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="block text-[10px] font-bold text-rose-600">Your Submission:</span>
                  {selectedMistake.studentAnswer}
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="block text-[10px] font-bold text-emerald-600">Verified Answer:</span>
                  {selectedMistake.correctAnswer}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
              <span className="font-bold text-indigo-950 block">Remedial Concept Guidance:</span>
              <p className="text-indigo-900 leading-relaxed">{selectedMistake.explanation}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedMistake(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
