import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  Sparkles, 
  Play, 
  Square, 
  Sliders, 
  Check, 
  Globe, 
  Languages, 
  Mic, 
  Radio, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { naturalVoiceEngine, VoiceProfile, VoiceEngineSettings } from '../../lib/naturalVoiceEngine';

interface NaturalVoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (Academic / Teacher)', flag: '🇺🇸 / 🇬🇧' },
  { code: 'hi', name: 'हिन्दी (Hindi - Natural Educator)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati - Natural Tutor)', flag: '🇮🇳' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'fi', name: 'Suomi (Finnish - Luonnollinen opettaja)', flag: '🇫🇮' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' }
];

export default function NaturalVoiceSettingsModal({
  isOpen,
  onClose
}: NaturalVoiceSettingsModalProps) {
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [settings, setSettings] = useState<VoiceEngineSettings>(naturalVoiceEngine.getSettings());
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'voices' | 'tuning'>('voices');

  useEffect(() => {
    if (isOpen) {
      setVoices(naturalVoiceEngine.getAvailableVoices());
      setSettings(naturalVoiceEngine.getSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredVoices = voices.filter(v => {
    if (settings.selectedLanguage === 'all') return true;
    return v.lang.toLowerCase().startsWith(settings.selectedLanguage);
  });

  const handleSelectVoice = (voiceId: string) => {
    naturalVoiceEngine.saveSettings({ selectedVoiceId: voiceId });
    setSettings(naturalVoiceEngine.getSettings());
  };

  const handleLanguageChange = (langCode: string) => {
    naturalVoiceEngine.saveSettings({ selectedLanguage: langCode, selectedVoiceId: 'auto' });
    setSettings(naturalVoiceEngine.getSettings());
  };

  const handlePlayPreview = () => {
    if (isPlayingPreview) {
      naturalVoiceEngine.stop();
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);
    let sample = "Hello! I am your NeoNova natural science and academic tutor. The molecular formula of water is H-2-O, and kinetic energy equals half m v squared.";
    
    if (settings.selectedLanguage === 'hi') {
      sample = "नमस्ते! मैं आपका नियोनोवा विज्ञान और अध्ययन शिक्षक हूँ। आइए मिलकर विज्ञान के नए प्रयोग सीखें।";
    } else if (settings.selectedLanguage === 'gu') {
      sample = "નમસ્તે! હું તમારો નિયોનોવા વિજ્ઞાન અને અભ્યાસ માર્ગદર્શક છું. ચાલો સાથે મળીને વૈજ્ઞાનિક પ્રયોગો શીખીએ.";
    } else if (settings.selectedLanguage === 'es') {
      sample = "¡Hola! Soy tu tutor académico NeoNova. Exploremos juntos el laboratorio de ciencias.";
    } else if (settings.selectedLanguage === 'fr') {
      sample = "Bonjour! Je suis votre tuteur NeoNova. Découvrons ensemble les merveilles de la science.";
    } else if (settings.selectedLanguage === 'fi') {
      sample = "Hei! Olen NeoNova-tekoälytuutorisi. Veden kemiallinen kaava on H-2-O, ja liike-energia on puoli m v toiseen. Ratkaistaan tehtävät yhdessä!";
    }

    naturalVoiceEngine.speak(sample, {
      targetLang: settings.selectedLanguage,
      onEnd: () => setIsPlayingPreview(false)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 via-indigo-850 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Volume2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Natural Human AI Voice</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Upgraded
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Warm, human-like educational intonation with phonetic formula translation
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              naturalVoiceEngine.stop();
              onClose();
            }}
            className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4">
          <button
            onClick={() => setActiveTab('voices')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'voices'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic size={14} />
            <span>Voice Selection</span>
          </button>
          <button
            onClick={() => setActiveTab('tuning')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tuning'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            <span>Pacing & Acoustics</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'voices' && (
            <div className="space-y-4">
              {/* Language Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Target Spoken Language:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs cursor-pointer flex items-center justify-between ${
                        settings.selectedLanguage === lang.code
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{lang.name}</span>
                      <span className="text-xs shrink-0">{lang.flag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detected Voices List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Available Natural Voices:
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {filteredVoices.length} detected
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {/* Default / Auto Choice */}
                  <div
                    onClick={() => handleSelectVoice('auto')}
                    className={`p-3 rounded-2xl border transition-all text-xs cursor-pointer flex items-center justify-between ${
                      settings.selectedVoiceId === 'auto'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      <div>
                        <div className="font-bold">Auto-Select Best Natural Voice (Recommended)</div>
                        <div className="text-[10px] text-slate-500">Automatically picks highest-rated neural voice</div>
                      </div>
                    </div>
                    {settings.selectedVoiceId === 'auto' && (
                      <Check size={16} className="text-indigo-600 shrink-0" />
                    )}
                  </div>

                  {filteredVoices.map(voice => (
                    <div
                      key={voice.id}
                      onClick={() => handleSelectVoice(voice.id)}
                      className={`p-2.5 rounded-xl border transition-all text-xs cursor-pointer flex items-center justify-between ${
                        settings.selectedVoiceId === voice.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-base shrink-0">{voice.flag}</span>
                        <div className="truncate">
                          <div className="font-semibold truncate">{voice.label}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{voice.lang}</div>
                        </div>
                      </div>
                      {settings.selectedVoiceId === voice.id && (
                        <Check size={16} className="text-indigo-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tuning' && (
            <div className="space-y-5">
              {/* Speed Slider */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Speaking Speed (Cadence)</span>
                  <span className="font-mono text-indigo-600 font-bold">{settings.rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.02"
                  value={settings.rate}
                  onChange={(e) => {
                    naturalVoiceEngine.saveSettings({ rate: parseFloat(e.target.value) });
                    setSettings(naturalVoiceEngine.getSettings());
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.75x (Deliberate)</span>
                  <span>0.94x (Natural Teacher)</span>
                  <span>1.25x (Fast)</span>
                </div>
              </div>

              {/* Pitch Slider */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Voice Pitch (Tone Warmth)</span>
                  <span className="font-mono text-indigo-600 font-bold">{settings.pitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.80"
                  max="1.20"
                  step="0.02"
                  value={settings.pitch}
                  onChange={(e) => {
                    naturalVoiceEngine.saveSettings({ pitch: parseFloat(e.target.value) });
                    setSettings(naturalVoiceEngine.getSettings());
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Deep / Authoritative</span>
                  <span>1.04x (Friendly / Warm)</span>
                  <span>High Register</span>
                </div>
              </div>

              {/* Phonetic Translation Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">
                    Scientific & Math Phonetics
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Speaks H₂O as "water", x² as "x squared", and converts fractions naturally
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.phoneticsEnabled}
                  onChange={(e) => {
                    naturalVoiceEngine.saveSettings({ phoneticsEnabled: e.target.checked });
                    setSettings(naturalVoiceEngine.getSettings());
                  }}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Live Preview */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePlayPreview}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
              isPlayingPreview
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isPlayingPreview ? (
              <>
                <Square size={14} className="fill-current" />
                <span>Stop Sample</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-current" />
                <span>Listen to Sample Voice</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              naturalVoiceEngine.stop();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
