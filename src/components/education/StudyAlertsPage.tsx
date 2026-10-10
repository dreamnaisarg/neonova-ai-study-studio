import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  Sparkles,
  ArrowLeft,
  Volume2
} from 'lucide-react';
import { EduTab } from './EduSidebar';
import ToolHeaderBar from './ToolHeaderBar';

interface StudyReminder {
  id: string;
  title: string;
  subject: string;
  time: string;
  days: string[];
  isEnabled: boolean;
}

const DEFAULT_REMINDERS: StudyReminder[] = [
  {
    id: 'rem-1',
    title: 'Daily Math Problem Solving (5 Questions)',
    subject: 'Mathematics',
    time: '17:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    isEnabled: true
  },
  {
    id: 'rem-2',
    title: 'Science Concept & Diagram Review',
    subject: 'Science',
    time: '18:30',
    days: ['Mon', 'Wed', 'Fri'],
    isEnabled: true
  },
  {
    id: 'rem-3',
    title: '4-Stage Exam Practice Drill',
    subject: 'All Subjects',
    time: '20:00',
    days: ['Sat', 'Sun'],
    isEnabled: true
  }
];

const STORAGE_KEY = 'neonova_study_reminders_v1';

interface StudyAlertsPageProps {
  onBackToTools: () => void;
  onNavigateTab?: (tab: EduTab) => void;
  currentGrade?: string;
  academicXP?: number;
}

export default function StudyAlertsPage({
  onBackToTools,
  onNavigateTab,
  currentGrade = 'Grade 10',
  academicXP = 150
}: StudyAlertsPageProps) {
  // Timer Modes: 25m Pomodoro, 45m Class Period, 60m Standard Exam, 90m Full Mock
  const timerPresets = [
    { label: '25m Pomodoro', seconds: 25 * 60 },
    { label: '45m Period', seconds: 45 * 60 },
    { label: '60m Exam', seconds: 60 * 60 },
    { label: '90m Mock Test', seconds: 90 * 60 },
  ];

  const [selectedDuration, setSelectedDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [timerSessionCompleted, setTimerSessionCompleted] = useState(false);

  // Reminders state
  const [reminders, setReminders] = useState<StudyReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newTime, setNewTime] = useState('18:00');
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setTimerSessionCompleted(true);
            try {
              // Play gentle browser beep if possible
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
              osc.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.6);
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSelectPreset = (secs: number) => {
    setIsRunning(false);
    setSelectedDuration(secs);
    setTimeLeft(secs);
    setTimerSessionCompleted(false);
  };

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedDuration);
      setTimerSessionCompleted(false);
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration);
    setTimerSessionCompleted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRem: StudyReminder = {
      id: `rem-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      time: newTime,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      isEnabled: true
    };

    setReminders((prev) => [newRem, ...prev]);
    setNewTitle('');
    setIsAddingReminder(false);
  };

  const progressPercent = Math.max(0, Math.min(100, Math.round(((selectedDuration - timeLeft) / selectedDuration) * 100)));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <ToolHeaderBar
        title="Study Alerts & Timed Exam Simulator"
        category="Practice & Schedule"
        description="Paced focus timers, timed mock exam simulations, and spaced homework reminder alarms."
        icon={Clock}
        onBack={onBackToTools}
        backLabel="Back to All Features"
        currentGrade={currentGrade}
        academicXP={academicXP}
        onNavigateTab={onNavigateTab}
        activeTab="alerts"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timed Exam Simulator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Timed Exam Simulator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Test your problem-solving speed under exam constraints
                  </p>
                </div>
              </div>

              {isRunning && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Exam in Progress
                </span>
              )}
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timerPresets.map((preset) => {
                const isSelected = selectedDuration === preset.seconds;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset.seconds)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Big Countdown Display */}
            <div className="relative p-8 rounded-3xl bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950 text-white flex flex-col items-center justify-center shadow-md overflow-hidden">
              {/* Background circular progress glow */}
              <div 
                className="text-5xl sm:text-6xl font-black font-mono tracking-tight my-2 select-none"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatTime(timeLeft)}
              </div>

              <div className="w-full bg-slate-800/80 rounded-full h-2 mt-4 overflow-hidden border border-slate-700">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between w-full mt-2 text-[11px] text-slate-400 font-mono">
                <span>Paced Progress: {progressPercent}%</span>
                <span>Target: {Math.round(selectedDuration / 60)} mins</span>
              </div>

              {timerSessionCompleted && (
                <div className="mt-4 p-2.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} />
                  <span>Time is up! Exam block completed. Excellent focus!</span>
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTimer}
                className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause size={18} />
                    <span>Pause Exam Clock</span>
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    <span>{timeLeft === 0 ? 'Restart Session' : 'Start Timer'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                title="Reset timer"
                aria-label="Reset timer"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Quick Exam Pacing Strategies */}
          <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-600" />
              <span>Exam Pacing Recommendations</span>
            </h3>
            <ul className="text-xs text-indigo-950 space-y-1.5 list-disc list-inside">
              <li>Spend no more than <strong>1.5 minutes per 1-mark question</strong> on standard board tests.</li>
              <li>Allocate <strong>10 minutes at the end</strong> to cross-verify all arithmetic and unit conversions.</li>
              <li>For multi-step physics/maths problems, jot down given variables first before substituting.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Spaced Study Reminders & Alarms */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Spaced Homework Alarms
                  </h2>
                  <p className="text-xs text-slate-500">
                    Automated revision schedules and daily homework alerts
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingReminder(prev => !prev)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>{isAddingReminder ? 'Cancel' : 'New Alarm'}</span>
              </button>
            </div>

            {/* Add New Reminder Form */}
            {isAddingReminder && (
              <form onSubmit={handleAddReminder} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Task / Topic Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Solve Quadratic Equations Exercise 4.2"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-indigo-500 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Subject
                    </label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-indigo-500"
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                      <option value="Social Science">Social Science</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-indigo-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  Save Study Alarm
                </button>
              </form>
            )}

            {/* List of Reminders */}
            <div className="space-y-2.5">
              {reminders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-2xl border border-dashed border-slate-200">
                  No active study alarms. Click &quot;New Alarm&quot; to set up your revision schedule.
                </div>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      rem.isEnabled
                        ? 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleReminder(rem.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-colors cursor-pointer ${
                          rem.isEnabled
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                        title={rem.isEnabled ? "Alarm Active - Click to disable" : "Alarm Inactive - Click to enable"}
                      >
                        <Clock size={16} />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {rem.title}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {rem.subject}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                          <span className="font-bold text-indigo-600">{rem.time}</span>
                          <span>&middot;</span>
                          <span>{rem.days.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => deleteReminder(rem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete reminder"
                        aria-label="Delete reminder"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
