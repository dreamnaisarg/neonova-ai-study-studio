import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Flame, 
  Trophy, 
  Zap, 
  HelpCircle, 
  CheckCircle2, 
  Share2, 
  ArrowRight, 
  Smile, 
  TrendingUp, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Mission7QuickWidget from './missions/Mission7QuickWidget';

interface MemeResponse {
  templateStyle: string;
  setupProblem: string;
  punchlineSolution: string;
  emojiVisualComic: string;
  academicAdvice: string;
}

interface DailyHubProps {
  onNavigateTab?: (tab: any) => void;
}

export default function DailyHub({ onNavigateTab }: DailyHubProps = {}) {
  const [studentXP, setStudentXP] = useState(380);
  const [streakDays, setStreakDays] = useState(5);
  const [checkedDays, setCheckedDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [missions, setMissions] = useState([
    { id: 'notes', text: 'Synthesize lecture notes in Summarizer', xp: 15, done: false },
    { id: 'doodle', text: 'Sketch a calculation on the Blackboard', xp: 10, done: false },
    { id: 'scanner', text: 'Scan raw homework sheet via Homework Scanner', xp: 20, done: false }
  ]);

  const handleToggleDay = (idx: number) => {
    if (checkedDays.includes(idx)) {
      setCheckedDays(prev => prev.filter(d => d !== idx));
      setStreakDays(prev => Math.max(0, prev - 1));
      setStudentXP(prev => Math.max(0, prev - 10));
    } else {
      setCheckedDays(prev => [...prev, idx].sort((a,b) => a-b));
      setStreakDays(prev => prev + 1);
      setStudentXP(prev => prev + 10);
    }
  };

  const handleToggleMission = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.done;
        setStudentXP(xp => nextState ? xp + m.xp : Math.max(0, xp - m.xp));
        return { ...m, done: nextState };
      }
      return m;
    }));
  };

  const [dailyQuestion] = useState({
    subject: "Physics & Orbital Mechanics",
    text: "According to Kepler's Second Law of Planetary Motion, what quantity remains constant as a satellite travels around an elliptical orbit?",
    options: [
      "The linear speed of the satellite",
      "The areal velocity (area swept per unit time)",
      "The gravitational force exerted on the satellite",
      "The distance between satellite and center of mass"
    ],
    correctIndex: 1,
    explanation: "Kepler's Second Law states that a line segment joining a planet and the Sun sweeps out equal areas during equal intervals of time, which is a consequence of conservation of angular momentum."
  });

  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [dailyPointsAdded, setDailyPointsAdded] = useState(false);

  const [memeSubject, setMemeSubject] = useState("Chemistry");
  const [memeTopic, setMemeTopic] = useState("Balancing redox reactions");
  const [isMemeGenerating, setIsMemeGenerating] = useState(false);
  const [memeResult, setMemeResult] = useState<MemeResponse | null>({
    templateStyle: "Expectation vs Reality",
    setupProblem: "Spending 40 minutes trying to balance charges on permanganate in acidic solution...",
    punchlineSolution: "Realizing you multiplied oxygen by 7 instead of 4 on step two!",
    emojiVisualComic: "🧪 🔬 🤦‍♂️ 💡",
    academicAdvice: "Always verify oxygen and hydrogen balances at the very end using water and H+ ions."
  });
  const [memeError, setMemeError] = useState<string | null>(null);

  const achievements = [
    {
      id: "streak_5",
      title: "Consistent Learner",
      description: "Maintained an unbroken 5-day daily homework practice streak.",
      unlocked: true,
      icon: "🔥"
    },
    {
      id: "quiz_ace",
      title: "Concept Master",
      description: "Scored 100% accuracy on an interactive curriculum quiz.",
      unlocked: true,
      icon: "🎯"
    },
    {
      id: "bookworm",
      title: "Avid Reader",
      description: "Explored classic literature in the Educational Library.",
      unlocked: true,
      icon: "📚"
    },
    {
      id: "night_owl",
      title: "Dedicated Student",
      description: "Reviewed study flashcards before an upcoming exam.",
      unlocked: false,
      icon: "🦉"
    }
  ];

  const getRankName = (xp: number) => {
    if (xp >= 500) return 'Academic Scholar';
    if (xp >= 350) return 'Dedicated Learner';
    return 'Motivated Student';
  };

  const handleResponseSelect = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedResponse(idx);
  };

  const handleSubmitDailyAnswer = () => {
    if (selectedResponse === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedResponse === dailyQuestion.correctIndex) {
      setStudentXP(prev => prev + 40);
      setStreakDays(prev => prev + 1);
      setDailyPointsAdded(true);
    }
  };

  const handleCreateAIStudyMeme = async () => {
    setIsMemeGenerating(true);
    setMemeError(null);
    try {
      const res = await fetch('/api/generate-meme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: memeSubject, topic: memeTopic })
      });
      if (!res.ok) {
        throw new Error(`Failed to generate study meme: ${res.status}`);
      }
      const parsedMeme = await res.json();
      setMemeResult(parsedMeme);
      setStudentXP(prev => prev + 15);
    } catch (err: any) {
      console.error(err);
      setMemeError(err.message || "Could not generate meme at this time.");
    } finally {
      setIsMemeGenerating(false);
    }
  };

  return (
    <div id="neonova-daily-orbit-hub" className="flex-1 flex flex-col xl:flex-row h-full overflow-y-auto xl:overflow-hidden bg-white text-slate-800 font-sans">
      {/* LEFT COLUMN: Ranks, achievements & streaks */}
      <div className="w-full xl:w-88 shrink-0 border-r border-slate-200/80 bg-slate-50/60 p-5 flex flex-col justify-between overflow-y-visible xl:overflow-y-auto z-20">
        <div className="space-y-5">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Daily Practice
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Daily Goals & Habits
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
              Accumulate XP points by completing daily questions, reviewing flashcards, and staying consistent.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Current Level:
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {getRankName(studentXP)}
                </h3>
              </div>
              <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-2.5 py-1 text-center shrink-0">
                <div className="text-xs font-bold leading-none flex items-center justify-center gap-1">
                  <Flame size={12} className="text-amber-500 fill-amber-500" />
                  <span>{streakDays} Days</span>
                </div>
                <div className="text-[9px] font-medium text-amber-600 mt-0.5">STREAK</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">XP Progress:</span>
                <span className="text-indigo-600 font-bold">{studentXP} / 500 XP</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (studentXP / 500) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 28-Day Study Habit Calendar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2.5 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900">
                Study Calendar
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                {checkedDays.length} / 28 Days Active
              </span>
            </div>
            
            <p className="text-xs text-slate-500 leading-tight">
              Tap any day to log your daily study session and maintain your streak.
            </p>

            <div className="grid grid-cols-7 gap-1 pt-1">
              {Array.from({ length: 28 }, (_, idx) => {
                const isChecked = checkedDays.includes(idx);
                return (
                  <button
                    id={`btn-streak-day-${idx}`}
                    key={idx}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isChecked 
                        ? 'bg-amber-500 text-white shadow-2xs' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title={`Day ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mission 7 Active Event Widget */}
          <Mission7QuickWidget 
            onOpenEventHub={() => onNavigateTab ? onNavigateTab('mission7') : null}
          />

          {/* Daily Missions */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2.5 shadow-2xs">
            <span className="text-xs font-bold text-slate-900 block">
              Daily Study Checklist
            </span>
            <div className="space-y-2">
              {missions.map((mission) => (
                <button
                  id={`btn-mission-toggle-${mission.id}`}
                  key={mission.id}
                  type="button"
                  onClick={() => handleToggleMission(mission.id)}
                  className="w-full flex items-center justify-between text-left p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 max-w-[80%]">
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                      mission.done 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-white border-slate-300'
                    }`}>
                      <CheckCircle2 size={11} className={mission.done ? 'opacity-100' : 'opacity-0'} />
                    </div>
                    <span className={`text-xs truncate ${mission.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {mission.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 shrink-0">
                    +{mission.xp} XP
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-900">
              Recent Milestones
            </span>
            <div className="grid grid-cols-1 gap-2">
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    ach.unlocked 
                      ? 'bg-white border-slate-200 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="text-xl p-1.5 bg-slate-50 rounded-lg shrink-0">
                    {ach.icon}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {ach.title}
                      {ach.unlocked && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">Unlocked</span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER & RIGHT COLUMN CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-y-visible xl:overflow-hidden">
        {/* CENTER COLUMN: Daily Challenge Section */}
        <div className="flex-1 p-5 lg:p-7 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col justify-between overflow-y-visible md:overflow-y-auto">
          <div className="space-y-5">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-600 block">
                Challenge of the Day
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {dailyQuestion.subject}
              </h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4">
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                {dailyQuestion.text}
              </p>
              
              <div className="space-y-2 mt-3">
                {dailyQuestion.options.map((option, idx) => {
                  const isSelected = selectedResponse === idx;
                  let optionStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700';
                  if (isSelected) {
                    optionStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-semibold ring-1 ring-indigo-600';
                  }
                  if (isAnswerSubmitted) {
                    if (idx === dailyQuestion.correctIndex) {
                      optionStyle = 'bg-emerald-50 text-emerald-900 border-emerald-500 font-semibold';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-50 text-rose-900 border-rose-500';
                    } else {
                      optionStyle = 'bg-white border-slate-200 opacity-50 text-slate-400';
                    }
                  }

                  return (
                    <button
                      id={`btn-daily-option-${idx}`}
                      key={idx}
                      type="button"
                      onClick={() => handleResponseSelect(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all border flex items-start gap-2.5 ${optionStyle} ${!isAnswerSubmitted ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="font-semibold text-slate-400 shrink-0">[{String.fromCharCode(65 + idx)}]</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isAnswerSubmitted && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold">
                  {selectedResponse === dailyQuestion.correctIndex ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={15} /> Correct Answer! (+40 XP)
                    </span>
                  ) : (
                    <span className="text-rose-700">
                      Incorrect • Here is the explanation:
                    </span>
                  )}
                </div>
                <p className="text-slate-600 pl-4 border-l-2 border-slate-200">{dailyQuestion.explanation}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              id="btn-submit-daily-challenge"
              type="button"
              disabled={selectedResponse === null || isAnswerSubmitted}
              onClick={handleSubmitDailyAnswer}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Submit Answer</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Study Tips */}
        <div className="flex-1 p-5 lg:p-7 flex flex-col justify-between overflow-y-visible md:overflow-y-auto bg-slate-50/30">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-amber-700 block">
                Study Insights
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Concept Visualizer & Study Tips
              </h3>
            </div>

            <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Area:
                </label>
                <input
                  id="choice-meme-subject"
                  type="text"
                  value={memeSubject}
                  onChange={(e) => setMemeSubject(e.target.value)}
                  placeholder="e.g. Chemistry, Algebra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Challenging topic you want simplified:
                </label>
                <textarea
                  id="choice-meme-topic"
                  value={memeTopic}
                  onChange={(e) => setMemeTopic(e.target.value)}
                  placeholder="e.g. balancing chemical formulas or remembering trig ratios..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 resize-none"
                />
              </div>

              <button
                id="btn-trigger-ai-meme"
                type="button"
                onClick={handleCreateAIStudyMeme}
                disabled={isMemeGenerating || !memeTopic.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-xs"
              >
                {isMemeGenerating ? (
                  <>
                    <RefreshCw className="animate-spin text-white" size={13} />
                    <span>Simplifying Concept...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Generate Study Tip</span>
                  </>
                )}
              </button>
            </div>

            {memeResult && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>{memeResult.templateStyle}</span>
                  <span>💡</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 font-medium">
                    {memeResult.setupProblem}
                  </div>
                  <div className="py-2 text-2xl text-center select-none">
                    {memeResult.emojiVisualComic}
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-900">
                    {memeResult.punchlineSolution}
                  </div>
                </div>
                <div className="pt-2 text-xs text-slate-600 italic border-t border-slate-100">
                  📌 <strong>Study Tip:</strong> {memeResult.academicAdvice}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
