import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Smartphone, 
  Clock, 
  Flame, 
  Sparkles, 
  Camera, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  X, 
  Plus, 
  Download, 
  RotateCw, 
  BookOpen, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Share2, 
  ChevronRight,
  HelpCircle,
  Volume2
} from 'lucide-react';
import { EduTab } from '../education/EduSidebar';

export interface HomeScreenWidgetsHubProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchScanner?: () => void;
  onLaunchARLab?: () => void;
  onNavigateTab?: (tab: EduTab) => void;
  studentName?: string;
  currentGrade?: string;
}

interface StudyReminderSettings {
  enabled: boolean;
  time: string; // e.g. "17:30"
  goalMinutes: number;
  frequency: 'daily' | 'weekdays' | 'exam_mode';
  soundEnabled: boolean;
  lastReminderSent?: string;
}

interface ExamDeadline {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
}

const STORAGE_REMINDER_KEY = 'neonova_study_reminder_settings_v1';
const STORAGE_DEADLINES_KEY = 'neonova_exam_deadlines_v1';

export default function HomeScreenWidgetsHub({
  isOpen,
  onClose,
  onLaunchScanner,
  onLaunchARLab,
  onNavigateTab,
  studentName = 'Student',
  currentGrade = 'Grade 8'
}: HomeScreenWidgetsHubProps) {
  // Active widget tab in simulator
  const [activeWidgetTab, setActiveWidgetTab] = useState<'reminder' | 'streak' | 'flashcard' | 'quick_launcher' | 'countdown'>('reminder');
  const [phoneOsStyle, setPhoneOsStyle] = useState<'ios' | 'android'>('android');
  
  // Notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [reminderSettings, setReminderSettings] = useState<StudyReminderSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REMINDER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      time: '18:00',
      goalMinutes: 45,
      frequency: 'daily',
      soundEnabled: true
    };
  });

  // Daily Streak state
  const [studyStreakDays, setStudyStreakDays] = useState(5);
  const [questionsSolvedToday, setQuestionsSolvedToday] = useState(4);
  const [loggedToday, setLoggedToday] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Concept / Flashcard of the Day state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Deadlines state
  const [deadlines, setDeadlines] = useState<ExamDeadline[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DEADLINES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', title: 'Chapter 5 Quadratic Equations Test', subject: 'Mathematics', date: '2026-10-24' },
      { id: '2', title: 'Cellular Respiration Lab Report', subject: 'Biology', date: '2026-10-28' },
      { id: '3', title: 'Newtonian Mechanics Quiz', subject: 'Physics', date: '2026-11-02' }
    ];
  });

  const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
  const [newDeadlineSubject, setNewDeadlineSubject] = useState('Mathematics');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [showAddDeadline, setShowAddDeadline] = useState(false);

  // PWA install prompt event
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Save reminder settings
  const handleSaveReminder = (updates: Partial<StudyReminderSettings>) => {
    const updated = { ...reminderSettings, ...updates };
    setReminderSettings(updated);
    try {
      localStorage.setItem(STORAGE_REMINDER_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Request browser notification permissions
  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support desktop notifications.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        handleSaveReminder({ enabled: true });
        handleTriggerTestReminder();
      }
    } catch (e) {
      console.error('Notification permission error:', e);
    }
  };

  // Send a real test notification
  const handleTriggerTestReminder = () => {
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 4000);

    // Audio chime if enabled
    if (reminderSettings.soundEnabled && typeof Audio !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {}
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('📚 NeoNova Daily Study Reminder', {
        body: `Hey ${studentName}! Time for your ${reminderSettings.goalMinutes}-minute study session. Keep your ${studyStreakDays}-day streak burning! 🔥`,
        icon: '/favicon.svg'
      });
    }
  };

  // Concept of the day flashcards
  const STEM_CONCEPTS = [
    {
      subject: 'Physics',
      title: "Newton's Third Law of Motion",
      summary: 'For every action, there is an equal and opposite reaction force.',
      formula: 'F_A = -F_B',
      example: 'A rocket engine expels hot gases downward; the gases exert an equal upward thrust force on the rocket.',
      quiz: 'When you jump off a small boat into the water, what direction does the boat move?',
      answer: 'The boat moves backwards away from the dock due to the reaction force!'
    },
    {
      subject: 'Biology',
      title: 'Mitochondria: Cellular Powerhouse',
      summary: 'Organelle generating ATP chemical energy through oxidative phosphorylation.',
      formula: 'C6H12O6 + 6O2 → 6CO2 + 6H2O + 36-38 ATP',
      example: 'Muscle cells have thousands of mitochondria to support continuous physical exertion.',
      quiz: 'What molecule stores and delivers usable energy in all living cells?',
      answer: 'Adenosine Triphosphate (ATP)!'
    },
    {
      subject: 'Mathematics',
      title: 'Pythagorean Theorem',
      summary: 'In any right-angled triangle, the square of the hypotenuse equals the sum of squares of the other sides.',
      formula: 'a² + b² = c²',
      example: 'If legs are 3cm and 4cm, hypotenuse c = √(9 + 16) = 5cm.',
      quiz: 'What is the length of hypotenuse if legs are 5 and 12?',
      answer: '13 (since 25 + 144 = 169, and √169 = 13)!'
    },
    {
      subject: 'Chemistry',
      title: "Avogadro's Number & The Mole",
      summary: 'One mole of any substance contains exactly 6.022 × 10²³ elementary entities.',
      formula: 'N_A = 6.022 × 10²³ particles / mole',
      example: '18 grams of pure water (H2O) contains exactly 1 mole of water molecules.',
      quiz: 'How many atoms are in one mole of Helium gas?',
      answer: 'Exactly 6.022 × 10²³ helium atoms!'
    }
  ];

  const currentConcept = STEM_CONCEPTS[flashcardIndex % STEM_CONCEPTS.length];

  // Add new exam deadline
  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadlineTitle.trim() || !newDeadlineDate) return;

    const newItem: ExamDeadline = {
      id: `dl-${Date.now()}`,
      title: newDeadlineTitle.trim(),
      subject: newDeadlineSubject,
      date: newDeadlineDate
    };

    const updated = [...deadlines, newItem].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDeadlines(updated);
    try {
      localStorage.setItem(STORAGE_DEADLINES_KEY, JSON.stringify(updated));
    } catch {}

    setNewDeadlineTitle('');
    setNewDeadlineDate('');
    setShowAddDeadline(false);
  };

  const handleDeleteDeadline = (id: string) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    try {
      localStorage.setItem(STORAGE_DEADLINES_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Helper calculating days remaining
  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Trigger PWA install
  const handleInstallPWA = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredInstallPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-cyan-50/60 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Phone Home Screen Widgets & Study Reminders
                </h2>
                <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Interactive Live Widgets
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set daily study reminder alarms, pin flashcards to your phone, and launch instant camera scans.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Widgets Hub"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Banner: In-app Notification Permission Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Never Miss Daily Study Time</h4>
                <p className="text-xs text-indigo-100">
                  {notifPermission === 'granted'
                    ? '✓ Device push notifications enabled. You will receive alarms at your scheduled time.'
                    : 'Enable browser notifications to receive study alarms, streak reminders, and homework deadlines.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {notifPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestNotificationPermission}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:bg-indigo-50 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Enable Notifications
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerTestReminder}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Volume2 size={14} />
                  <span>Test Alarm Sound</span>
                </button>
              )}
            </div>
          </div>

          {testNotificationSent && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Study alarm test chime fired! Your notification and sound are fully working.</span>
            </div>
          )}

          {/* Grid Layout: Left Column Controls, Right Column Phone Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Columns: Interactive Widget Configuration */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Widget Tabs Selector */}
              <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveWidgetTab('reminder')}
                  className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeWidgetTab === 'reminder'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Clock size={14} />
                  <span>Daily Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWidgetTab('streak')}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeWidgetTab === 'streak'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Flame size={14} />
                  <span>Streak Widget</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWidgetTab('flashcard')}
                  className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeWidgetTab === 'flashcard'
                      ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>Flashcard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveWidgetTab('countdown')}
                  className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeWidgetTab === 'countdown'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={14} />
                  <span>Exams Due</span>
                </button>
              </div>

              {/* 1. DAILY STUDY REMINDER CONTROLS */}
              {activeWidgetTab === 'reminder' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock size={16} className="text-indigo-600" />
                        <span>Daily Study Schedule & Alarm</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Choose what time you want NeoNova to send your daily homework reminder.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminderSettings.enabled}
                        onChange={(e) => handleSaveReminder({ enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        value={reminderSettings.time}
                        onChange={(e) => handleSaveReminder({ time: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Daily Target Goal
                      </label>
                      <select
                        value={reminderSettings.goalMinutes}
                        onChange={(e) => handleSaveReminder({ goalMinutes: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value={15}>15 Minutes (Quick Drill)</option>
                        <option value={30}>30 Minutes (Recommended)</option>
                        <option value={45}>45 Minutes (Focus Block)</option>
                        <option value={60}>60 Minutes (Deep Session)</option>
                        <option value={90}>90 Minutes (Exam Prep)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Schedule Frequency
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'daily', label: 'Every Day' },
                        { id: 'weekdays', label: 'Mon - Fri' },
                        { id: 'exam_mode', label: 'Exam Sprint' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSaveReminder({ frequency: item.id as any })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            reminderSettings.frequency === item.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. STREAK WIDGET CONTROLS */}
              {activeWidgetTab === 'streak' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Flame size={18} className="text-amber-500" />
                        <span>Daily Study Streak & XP Counter</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Keeps you motivated with visual study flames and daily questions progress.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {studyStreakDays} Day Streak 🔥
                    </span>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                      <span>Today&apos;s Problem Target</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">{questionsSolvedToday} / 5 Solved</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (questionsSolvedToday / 5) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionsSolvedToday(prev => Math.min(10, prev + 1));
                        setLoggedToday(true);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Log Practice Question (+1)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudyStreakDays(prev => prev + 1);
                        setLoggedToday(true);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      +1 Day
                    </button>
                  </div>
                </div>
              )}

              {/* 3. FLASHCARD CONTROLS */}
              {activeWidgetTab === 'flashcard' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen size={16} className="text-cyan-600" />
                        <span>Daily STEM Flashcard of the Day</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Interactive widget showing a new verified science or math formula every day.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFlashcardIndex(prev => prev + 1);
                        setIsFlipped(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw size={13} />
                      <span>Next Concept</span>
                    </button>
                  </div>

                  {/* Interactive Flip Card Preview */}
                  <div
                    onClick={() => setIsFlipped(prev => !prev)}
                    className="cursor-pointer p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-cyan-500/30 shadow-lg min-h-[140px] flex flex-col justify-between transition-all hover:border-cyan-400"
                  >
                    {!isFlipped ? (
                      <>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {currentConcept.subject}
                          </span>
                          <span className="text-[10px] text-slate-400">Tap to see Quiz & Answer</span>
                        </div>
                        <div className="my-2">
                          <h4 className="text-sm font-bold text-white">{currentConcept.title}</h4>
                          <p className="text-xs text-slate-300 mt-1">{currentConcept.summary}</p>
                          <div className="mt-2 inline-block px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800 font-mono text-cyan-300 text-xs font-bold">
                            {currentConcept.formula}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Example: {currentConcept.example}</p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Daily Quiz Challenge
                          </span>
                          <span className="text-[10px] text-slate-400">Tap to flip back</span>
                        </div>
                        <div className="my-2 space-y-2">
                          <p className="text-xs font-bold text-white">Q: {currentConcept.quiz}</p>
                          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs">
                            <span className="font-bold">Answer: </span>
                            {currentConcept.answer}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400">Verified by NeoNova Academic Curriculum</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 4. COUNTDOWN CONTROLS */}
              {activeWidgetTab === 'countdown' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar size={16} className="text-rose-600" />
                        <span>Homework & Exam Deadlines</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tracks days remaining for school assignments on your lockscreen widget.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddDeadline(!showAddDeadline)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Target</span>
                    </button>
                  </div>

                  {showAddDeadline && (
                    <form onSubmit={handleAddDeadline} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Test / Homework Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Science Chapter 3 Midterm"
                          value={newDeadlineTitle}
                          onChange={(e) => setNewDeadlineTitle(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                          <select
                            value={newDeadlineSubject}
                            onChange={(e) => setNewDeadlineSubject(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          >
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="English">English</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                          <input
                            type="date"
                            required
                            value={newDeadlineDate}
                            onChange={(e) => setNewDeadlineDate(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddDeadline(false)}
                          className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500 cursor-pointer"
                        >
                          Save Deadline
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {deadlines.map((item) => {
                      const daysLeft = getDaysRemaining(item.date);
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {item.subject}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Due: {item.date}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                              daysLeft <= 2
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                                : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                            }`}>
                              {daysLeft > 0 ? `${daysLeft}d left` : 'Due Today!'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteDeadline(item.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Instructions on how to Pin to Android / iOS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-indigo-600" />
                  <span>How to Add NeoNova & Widgets to Your Phone:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">📱 iPhone (iOS Safari):</p>
                    <p>1. Tap the <strong>Share button (⎋)</strong> at the bottom of Safari.</p>
                    <p>2. Scroll down and tap <strong>&apos;Add to Home Screen&apos; (⊞)</strong>.</p>
                    <p>3. Long-press home screen to add notifications widget!</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">🤖 Android (Chrome):</p>
                    <p>1. Tap the <strong>Three-dots menu (⋮)</strong> in Chrome.</p>
                    <p>2. Tap <strong>&apos;Install App&apos;</strong> or &apos;Add to Home Screen&apos;.</p>
                    <p>3. Long-press app icon for quick shortcuts to <strong>AR Lab</strong> & <strong>Scan</strong>!</p>
                  </div>
                </div>

                {deferredInstallPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallPWA}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                  >
                    <Download size={15} />
                    <span>Install NeoNova to Phone Home Screen Now</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Interactive Smartphone Simulator Mockup */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] text-slate-400 font-semibold">Preview Layout:</span>
                <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setPhoneOsStyle('android')}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      phoneOsStyle === 'android' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneOsStyle('ios')}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      phoneOsStyle === 'ios' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    iOS iPhone
                  </button>
                </div>
              </div>

              {/* Realistic Phone Bezel Frame */}
              <div className="relative w-[280px] sm:w-[300px] h-[580px] rounded-[44px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 overflow-hidden flex flex-col justify-between">
                
                {/* Dynamic Island / Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                </div>

                {/* Simulated Wallpaper Content */}
                <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-3 pt-8 flex flex-col justify-between select-none">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-white/80 font-mono px-2 pt-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Lockscreen Clock */}
                  <div className="text-center my-2">
                    <div className="text-3xl font-extrabold text-white tracking-tight">09:41</div>
                    <div className="text-[10px] text-indigo-200">Thursday, October 16 · Grade 8</div>
                  </div>

                  {/* 1. Daily Study Reminder Notification Banner Widget */}
                  {reminderSettings.enabled && (
                    <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-lg space-y-1 my-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-indigo-500 flex items-center justify-center text-[9px] font-bold">N</div>
                          <span className="text-[10px] font-bold tracking-tight">NEONOVA STUDY</span>
                        </div>
                        <span className="text-[9px] text-white/60">{reminderSettings.time}</span>
                      </div>
                      <p className="text-[11px] font-semibold leading-tight">
                        Daily Study Session · {reminderSettings.goalMinutes} mins
                      </p>
                      <p className="text-[10px] text-white/80 line-clamp-1">
                        Time to solve your worksheet problems & keep your streak!
                      </p>
                    </div>
                  )}

                  {/* 2. Interactive Study Streak & Flashcard Widget */}
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/15 text-white shadow-lg my-1 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold flex items-center gap-1 text-amber-400">
                        <Flame size={12} />
                        <span>{studyStreakDays} Day Streak</span>
                      </span>
                      <span className="text-cyan-300 font-mono">{questionsSolvedToday}/5 Solved</span>
                    </div>

                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-rose-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, (questionsSolvedToday / 5) * 100)}%` }}
                      />
                    </div>

                    <div className="pt-0.5">
                      <div className="text-[10px] font-bold text-white truncate">{currentConcept.title}</div>
                      <div className="text-[9px] text-slate-300 font-mono truncate">{currentConcept.formula}</div>
                    </div>
                  </div>

                  {/* 3. Quick Action Launcher Dock (1-tap launch into scanner or AR) */}
                  <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white grid grid-cols-4 gap-1 text-center my-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLaunchScanner?.();
                      }}
                      className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/10 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                        <Camera size={14} />
                      </div>
                      <span className="text-[8px] font-bold mt-1 text-white/90">Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLaunchARLab?.();
                      }}
                      className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/10 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-xs">
                        <Layers size={14} />
                      </div>
                      <span className="text-[8px] font-bold mt-1 text-white/90">3D AR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab?.('homework');
                      }}
                      className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/10 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                        <BookOpen size={14} />
                      </div>
                      <span className="text-[8px] font-bold mt-1 text-white/90">Solve</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab?.('quiz');
                      }}
                      className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-white/10 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-xs">
                        <Sparkles size={14} />
                      </div>
                      <span className="text-[8px] font-bold mt-1 text-white/90">Quiz</span>
                    </button>
                  </div>

                  {/* Home Bar */}
                  <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mb-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Widgets sync automatically with your local study schedule and PWA app shortcuts.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
