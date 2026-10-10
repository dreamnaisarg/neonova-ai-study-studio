import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  BookOpen, 
  DollarSign, 
  Milestone, 
  Activity, 
  Flame, 
  RefreshCw, 
  Award,
  AlertCircle,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Share2,
  CheckCircle2
} from 'lucide-react';

interface CareerMatch {
  title: string;
  matchScore: number;
  description: string;
  tasks: string[];
  salary: string;
  roadmap: string[];
  glowingColor: string;
}

interface CareerResponse {
  verdictSummary: string;
  careers: CareerMatch[];
}

export default function FutureCareerMatch() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Computer Science']);
  const [personality, setPersonality] = useState('Scientific Explorer (R&D)');
  const [additionalHobbies, setAdditionalHobbies] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CareerResponse | null>({
    verdictSummary: "You demonstrate high analytical thinking and spatial reasoning, ideal for technology architectures and applied science disciplines.",
    careers: [
      {
        title: "AI Systems & Robotics Architect",
        matchScore: 97,
        description: "Designs the cognitive frameworks and sensor pipelines for autonomous collaborative robots and machine learning infrastructure.",
        tasks: [
          "Calibrate multi-sensor vision arrays and neural pipeline telemetry",
          "Collaborate with domain specialists on safety constraints and precision algorithms",
          "Synthesize real-time motion planning routines with minimal latency"
        ],
        salary: "$145,000 - $195,000 / year",
        roadmap: [
          "Master algebra, geometry, and computer science in middle/high school",
          "Learn Python, fundamental algorithms, and introductory robotics kits",
          "Pursue a bachelor's degree in Computer Science, Robotics, or Data Science"
        ],
        glowingColor: "#3b82f6"
      },
      {
        title: "Bioinformatics & Genomic Scientist",
        matchScore: 91,
        description: "Combines computational modeling with biology to sequence gene therapies, model cellular responses, and advance personalized medicine.",
        tasks: [
          "Analyze high-throughput DNA and RNA sequencing datasets",
          "Run molecular dynamics simulations of protein interactions",
          "Validate predictive disease progression models with clinical teams"
        ],
        salary: "$130,000 - $175,000 / year",
        roadmap: [
          "Take advanced courses in Biology, Chemistry, and Statistics",
          "Build computational analysis skills using spreadsheet formulas and programming",
          "Specialize in Computational Biology, Bio-engineering, or Biochemistry in college"
        ],
        glowingColor: "#10b981"
      }
    ]
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subjectOptions = [
    'Mathematics', 
    'Computer Science', 
    'Biology & Medicine', 
    'Physics & Quantum', 
    'Chemistry', 
    'Literature & Writing',
    'History & Diplomacy',
    'Graphic Arts & UX',
    'Psychology & AI Ethics',
    'Astronomy & Space'
  ];

  const personalityOptions = [
    'Scientific Explorer (R&D)',
    'Creative Pioneer (Design & Media)',
    'Practical Builder (Engineering & Robotics)',
    'Empathetic Educator (Healthcare & Social Sciences)',
    'Strategic Leader (Business & Innovation)'
  ];

  const handleToggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(item => item !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleCalculateMatch = async () => {
    if (selectedSubjects.length === 0) {
      setErrorMsg("Please select at least one subject you enjoy!");
      return;
    }
    
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/career-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjects: selectedSubjects,
          style: personality + (additionalHobbies ? ` (Hobbies: ${additionalHobbies})` : '')
        })
      });
      if (!res.ok) {
        throw new Error(`Failed to request career paths (status ${res.status})`);
      }
      const matchData = await res.json();
      if (!matchData.careers || matchData.careers.length === 0) {
        throw new Error("Unable to generate career recommendations. Please try selecting different subjects.");
      }
      setResult(matchData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Career Advisor is temporarily unavailable. Please retry in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="neonova-career-match-lab" className="flex-1 flex flex-col md:flex-row h-full overflow-y-auto md:overflow-hidden bg-slate-50 text-slate-800">
      {/* Configuration Column - Left */}
      <div className="w-full md:w-96 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-5 lg:p-6 flex flex-col justify-between overflow-y-auto z-10 shadow-xs">
        <div className="space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Briefcase size={12} className="text-indigo-600" />
              <span>Career & Pathways Explorer</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2 tracking-tight">
              Future Career Pathways
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Select the subjects and activities you enjoy. NeoNova analyzes modern industry demands to recommend exciting academic and career paths.
            </p>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-bold text-slate-700">
              1. Choose Subjects You Enjoy:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {subjectOptions.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    id={`btn-career-subject-${sub.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    key={sub}
                    type="button"
                    onClick={() => handleToggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{sub}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-700">
              2. Preferred Learning & Work Style:
            </span>
            <select
              id="select-career-style"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {personalityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-700">
              3. Interests, Hobbies, or Special Skills (Optional):
            </span>
            <input
              id="input-career-hobbies"
              type="text"
              value={additionalHobbies}
              onChange={(e) => setAdditionalHobbies(e.target.value)}
              placeholder="e.g., coding games, sketching, building robotics kits, astronomy..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-5 border-t border-slate-200 mt-5 space-y-3">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            id="btn-trigger-career-predictor"
            type="button"
            onClick={handleCalculateMatch}
            disabled={isGenerating || selectedSubjects.length === 0}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin text-white" size={14} />
                <span>Analyzing Career Options...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-amber-300" />
                <span>Explore Career Pathways</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display Grid - Center Space */}
      <div className="flex-1 p-5 lg:p-8 flex flex-col justify-between overflow-y-auto">
        {result ? (
          <div className="space-y-6 max-w-4xl mx-auto w-full">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Academic Assessment & Guidance
                </span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed mt-1">
                  &ldquo;{result.verdictSummary}&rdquo;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {result.careers.map((career, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {career.matchScore}% Match
                      </span>
                      <span className="text-xs font-medium text-slate-400">Path 0{idx + 1}</span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900">
                        {career.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {career.description}
                      </p>
                    </div>

                    <div className="space-y-3.5 mt-4 pt-3.5 border-t border-slate-100">
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                        <DollarSign size={15} className="text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase">Average Annual Compensation</div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">{career.salary}</div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Activity size={13} className="text-indigo-600" />
                          <span>Typical Responsibilities</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-600 leading-relaxed pl-1">
                          {career.tasks.map((task, k) => (
                            <li key={k} className="flex gap-2">
                              <span className="text-indigo-500 shrink-0">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <GraduationCap size={14} className="text-emerald-600" />
                          <span>Academic Preparation Pathway</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-600 leading-relaxed pl-1">
                          {career.roadmap.map((step, k) => (
                            <li key={k} className="flex gap-2">
                              <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Share Your Academic Pathways</h4>
                <p className="text-xs text-slate-500 leading-tight mt-0.5">Copy recommendations to discuss with teachers, parents, or academic counselors.</p>
              </div>
              <button 
                id="btn-share-career"
                type="button"
                onClick={() => {
                  const items = result.careers.map((c) => `- ${c.title} (Match: ${c.matchScore}%)`).join('\n');
                  const shareText = `My NeoNova Career Pathways:\n${result.verdictSummary}\n${items}`;
                  navigator.clipboard.writeText(shareText);
                  alert('Career pathway recommendations copied to clipboard!');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              >
                <Share2 size={13} className="text-slate-600" />
                <span>Copy Summary</span>
              </button>
            </div>
          </div>
        ) : (
          <div id="career-match-empty" className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Compass size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Explore Future Pathways</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Select your favorite subjects on the left and tap &ldquo;Explore Career Pathways&rdquo; to view recommendations and academic preparation roadmaps.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
