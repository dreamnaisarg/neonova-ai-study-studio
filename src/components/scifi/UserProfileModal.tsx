import React, { useState } from 'react';
import { User, ShieldAlert, Check, X, Sparkles, BookOpen } from 'lucide-react';
import { SUBJECTS, GRADES } from '../../types';

interface UserProfileModalProps {
  currentProfile: {
    studentName: string;
    grade: string;
    avatar: string;
    preferredSubjects: string[];
  } | null;
  onSave: (name: string, grade: string, avatar: string, subjects: string[]) => void;
  onClose: () => void;
}

export default function UserProfileModal({ currentProfile, onSave, onClose }: UserProfileModalProps) {
  const [name, setName] = useState(currentProfile?.studentName || "");
  const [grade, setGrade] = useState(currentProfile?.grade || "Grade 8");
  const [avatar, setAvatar] = useState(currentProfile?.avatar || "🎓");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentProfile?.preferredSubjects || ["Mathematics", "General Science"]
  );

  const avatars = [
    { emoji: "🎓", label: "Scholar" },
    { emoji: "📖", label: "Reader" },
    { emoji: "🦉", label: "Wise Owl" },
    { emoji: "🔬", label: "Scientist" },
    { emoji: "🎨", label: "Artist" },
    { emoji: "💻", label: "Coder" },
    { emoji: "💡", label: "Quick Mind" },
    { emoji: "⭐", label: "Star Student" }
  ];

  const handleToggleSubject = (subName: string) => {
    if (selectedSubjects.includes(subName)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subName));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subName]);
    }
  };

  const handleTriggerSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name.trim() || "Student", grade, avatar, selectedSubjects);
  };

  return (
    <div id="user-profile-modal-backdrop" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
      <div 
        id="user-profile-modal-body" 
        className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {currentProfile && (
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        <div className="space-y-5 overflow-y-auto pr-1">
          <div className="text-center space-y-1">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shadow-xs">
              {avatar}
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-2">
              Student Academic Profile
            </h3>
            <p className="text-xs text-slate-500">
              Customize your grade level, avatar, and study subjects
            </p>
          </div>

          <form onSubmit={handleTriggerSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Student Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={25}
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-xs text-slate-900 p-2.5 px-3 rounded-xl focus:outline-none font-medium transition-colors"
                  required
                />
                <User size={14} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Choose Profile Avatar
              </label>
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {avatars.map(av => (
                  <button
                    key={av.emoji}
                    type="button"
                    onClick={() => setAvatar(av.emoji)}
                    className={`p-2 text-center rounded-xl transition-all cursor-pointer ${
                      avatar === av.emoji 
                        ? 'bg-white text-indigo-700 border border-indigo-300 shadow-xs scale-105' 
                        : 'hover:bg-white text-slate-600 border border-transparent'
                    }`}
                    title={av.label}
                  >
                    <span className="text-xl block">{av.emoji}</span>
                    <span className="text-[10px] block mt-0.5 text-slate-500 truncate">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Grade Level
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs text-slate-800 p-2.5 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none cursor-pointer font-medium"
              >
                {GRADES.map(gradeLevel => (
                  <option key={gradeLevel} value={gradeLevel}>
                    {gradeLevel}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Preferred Subjects
              </label>
              <div className="flex flex-wrap gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-h-[140px] overflow-y-auto">
                {SUBJECTS.map(sub => {
                  const isSelected = selectedSubjects.includes(sub.name);
                  return (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => handleToggleSubject(sub.name)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer font-medium transition-all flex items-center gap-1.5 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <span>{sub.icon}</span>
                      <span>{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <span>Save Profile</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-center pt-1 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.history.pushState({}, '', '/privacy-policy');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-indigo-600 hover:underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-slate-300 select-none">•</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.history.pushState({}, '', '/delete-account');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="hover:text-rose-600 hover:underline cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
