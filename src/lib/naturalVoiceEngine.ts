/**
 * NeoNova Natural Human Voice Engine
 * 
 * Provides human-like educational speech synthesis with:
 * - Mathematical formula and scientific notation translation
 * - Chemical formula and symbol phonetic pronunciation
 * - Human cadence, breathing pauses, and natural clause chunking
 * - Multilingual natural voice selection (English, Hindi, Gujarati, Spanish, French, German)
 * - Safe interruption handling and zero overlapping audio
 * - Full offline compatibility via native Web Speech synthesis tuning
 */

export interface VoiceProfile {
  id: string;
  name: string;
  lang: string;
  label: string;
  flag: string;
  gender: 'female' | 'male';
  isNaturalScore: number;
}

export interface VoiceEngineSettings {
  rate: number;      // 0.75 - 1.25 (default 0.94 for calm teacher pacing)
  pitch: number;     // 0.8 - 1.2 (default 1.04 for warm resonance)
  volume: number;    // 0.0 - 1.0
  selectedVoiceId: string;
  selectedLanguage: string;
  phoneticsEnabled: boolean;
}

const DEFAULT_SETTINGS: VoiceEngineSettings = {
  rate: 0.94,
  pitch: 1.04,
  volume: 1.0,
  selectedVoiceId: 'auto',
  selectedLanguage: 'en',
  phoneticsEnabled: true
};

const STORAGE_KEY = 'neonova_natural_voice_settings';

class NaturalVoiceEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private isPausedState = false;
  private sentenceQueue: string[] = [];
  private currentQueueIndex = 0;
  private listeners: Set<(state: { isSpeaking: boolean; isPaused: boolean; currentWord?: string }) => void> = new Set();
  private settings: VoiceEngineSettings;

  constructor() {
    this.settings = this.loadSettings();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Force refresh voice lists when voices load asynchronously
        this.notifyListeners();
      };
    }
  }

  private loadSettings(): VoiceEngineSettings {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return { ...DEFAULT_SETTINGS };
  }

  public saveSettings(newSettings: Partial<VoiceEngineSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch {}
    this.notifyListeners();
  }

  public getSettings(): VoiceEngineSettings {
    return { ...this.settings };
  }

  /**
   * Preprocess educational text: Converts math, physics, chemistry formulas,
   * markdown formatting, and symbols into natural human-spoken educational speech.
   */
  public prepareEducationalSpeech(rawText: string): string {
    if (!this.settings.phoneticsEnabled) {
      return this.cleanMarkdown(rawText);
    }

    let text = rawText;

    // 1. Remove markdown links, code blocks, bold, headers
    text = this.cleanMarkdown(text);

    // 2. Chemical formulas
    const chemicalReplacements: [RegExp, string][] = [
      [/\bH2O\b/g, 'H-2-O, water'],
      [/\bH₂O\b/g, 'H-2-O, water'],
      [/\bCO2\b/g, 'C-O-2, carbon dioxide'],
      [/\bCO₂\b/g, 'C-O-2, carbon dioxide'],
      [/\bO2\b/g, 'oxygen gas'],
      [/\bO₂\b/g, 'oxygen gas'],
      [/\bN2\b/g, 'nitrogen gas'],
      [/\bN₂\b/g, 'nitrogen gas'],
      [/\bH2\b/g, 'hydrogen gas'],
      [/\bH₂\b/g, 'hydrogen gas'],
      [/\bHCl\b/g, 'hydrochloric acid'],
      [/\bNaOH\b/g, 'sodium hydroxide'],
      [/\bNaCl\b/g, 'sodium chloride'],
      [/\bH2SO4\b/g, 'sulfuric acid'],
      [/\bH₂SO₄\b/g, 'sulfuric acid'],
      [/\bCuSO4\b/g, 'copper sulfate'],
      [/\bCuSO₄\b/g, 'copper sulfate'],
      [/\bFeSO4\b/g, 'iron sulfate'],
      [/\bFeSO₄\b/g, 'iron sulfate'],
      [/\bCaCO3\b/g, 'calcium carbonate'],
      [/\bCaCO₃\b/g, 'calcium carbonate'],
      [/\bCH4\b/g, 'methane'],
      [/\bCH₄\b/g, 'methane'],
      [/\bC6H12O6\b/g, 'glucose'],
      [/\bC₆H₁₂O₆\b/g, 'glucose'],
      [/\bpH\b/g, 'p-H'],
      [/\bATP\b/g, 'A-T-P energy']
    ];

    for (const [pattern, replacement] of chemicalReplacements) {
      text = text.replace(pattern, replacement);
    }

    // 3. Units & Measurements
    const unitReplacements: [RegExp, string][] = [
      [/(\d+)\s*m\/s\^2/gi, '$1 meters per second squared'],
      [/(\d+)\s*m\/s²/gi, '$1 meters per second squared'],
      [/(\d+)\s*m\/s\b/gi, '$1 meters per second'],
      [/(\d+)\s*km\/h\b/gi, '$1 kilometers per hour'],
      [/(\d+)\s*kJ\/mol\b/gi, '$1 kilojoules per mole'],
      [/(\d+)\s*g\/cm\^3/gi, '$1 grams per cubic centimeter'],
      [/(\d+)\s*g\/cm³/gi, '$1 grams per cubic centimeter'],
      [/(\d+)\s*g\/mol\b/gi, '$1 grams per mole'],
      [/(\d+)\s*mL\b/g, '$1 milliliters'],
      [/(\d+)\s*ml\b/g, '$1 milliliters'],
      [/(\d+)\s*cm\b/g, '$1 centimeters'],
      [/(\d+)\s*mm\b/g, '$1 millimeters'],
      [/(\d+)\s*kg\b/g, '$1 kilograms'],
      [/(\d+)\s*°C\b/g, '$1 degrees Celsius'],
      [/(\d+)\s*deg C\b/gi, '$1 degrees Celsius'],
      [/(\d+)\s*K\b/g, '$1 Kelvin'],
      [/(\d+)\s*MPa\b/g, '$1 megapascals'],
      [/(\d+)\s*Hz\b/g, '$1 hertz'],
      [/(\d+)\s*N\b/g, '$1 newtons'],
      [/(\d+)\s*J\b/g, '$1 joules']
    ];

    for (const [pattern, replacement] of unitReplacements) {
      text = text.replace(pattern, replacement);
    }

    // 4. Mathematical Symbols & Expressions
    const mathReplacements: [RegExp, string][] = [
      [/([a-zA-Z0-9])\^2\b/g, '$1 squared'],
      [/([a-zA-Z0-9])²\b/g, '$1 squared'],
      [/([a-zA-Z0-9])\^3\b/g, '$1 cubed'],
      [/([a-zA-Z0-9])³\b/g, '$1 cubed'],
      [/√\(([^)]+)\)/g, 'the square root of $1'],
      [/√([a-zA-Z0-9]+)/g, 'the square root of $1'],
      [/\\sqrt\{([^}]+)\}/g, 'the square root of $1'],
      [/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2'],
      [/(\d+)\/(\d+)/g, '$1 over $2'],
      [/±|\\\pm/g, ' plus or minus '],
      [/≈|\\approx/g, ' is approximately '],
      [/≠|\\neq/g, ' is not equal to '],
      [/≤|<=|\\le/g, ' is less than or equal to '],
      [/≥|>=|\\ge/g, ' is greater than or equal to '],
      [/×|\*/g, ' times '],
      [/÷/g, ' divided by '],
      [/π|\\pi/g, ' pi '],
      [/Δ|\\Delta/g, ' delta, or change in, '],
      [/θ|\\theta/g, ' theta '],
      [/λ|\\lambda/g, ' lambda '],
      [/→/g, ' yields '],
      [/⇌/g, ' is in equilibrium with ']
    ];

    for (const [pattern, replacement] of mathReplacements) {
      text = text.replace(pattern, replacement);
    }

    // 5. Add micro-pause commas for pleasant educational cadence
    text = text
      .replace(/\s+([;:])\s+/g, ', ')
      .replace(/(\b(?:Therefore|Consequently|Furthermore|Specifically|In conclusion|For example|Notice that)\b)/g, '$1,')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return text;
  }

  private cleanMarkdown(md: string): string {
    return md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_{}\[\]]/g, ' ')
      .replace(/^[\s-*>]+/gm, '')
      .replace(/\n+/g, '. ')
      .trim();
  }

  /**
   * Split text into human-sized breath groups (clauses)
   * Prevents browser speech synthesis timeout bug on mobile/Chromium
   */
  private splitIntoBreathGroups(text: string): string[] {
    const rawSentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks: string[] = [];

    for (const s of rawSentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      // If a sentence is unusually long (> 160 chars), break it at commas or conjunctions
      if (trimmed.length > 160) {
        const parts = trimmed.split(/,\s+|\s+(?:and|but|while|whereas|because)\s+/i);
        for (const p of parts) {
          const pt = p.trim();
          if (pt) chunks.push(pt.endsWith('.') ? pt : pt + '.');
        }
      } else {
        chunks.push(trimmed);
      }
    }
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Scan and rank available system voices by human naturalness score
   */
  public getAvailableVoices(): VoiceProfile[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }

    const sysVoices = window.speechSynthesis.getVoices();
    const profiles: VoiceProfile[] = [];

    for (const v of sysVoices) {
      let score = 50;
      const lower = v.name.toLowerCase();

      // Premium neural / natural identifiers
      if (lower.includes('natural') || lower.includes('online') || lower.includes('neural')) score += 40;
      if (lower.includes('google')) score += 30;
      if (lower.includes('samantha') || lower.includes('karen') || lower.includes('daniel') || lower.includes('jenny')) score += 25;
      if (v.default) score += 10;
      if (lower.includes('desktop') || lower.includes('espeak')) score -= 30; // Robotic

      let flag = '🌐';
      let label = v.name;
      const l = v.lang.toLowerCase();

      if (l.startsWith('en-us')) { flag = '🇺🇸'; label = `${v.name} (US English)`; }
      else if (l.startsWith('en-in')) { flag = '🇮🇳'; label = `${v.name} (Indian English)`; }
      else if (l.startsWith('en-gb')) { flag = '🇬🇧'; label = `${v.name} (UK English)`; }
      else if (l.startsWith('hi')) { flag = '🇮🇳'; label = `${v.name} (हिन्दी Natural)`; }
      else if (l.startsWith('gu')) { flag = '🇮🇳'; label = `${v.name} (ગુજરાતી Natural)`; }
      else if (l.startsWith('fr')) { flag = '🇫🇷'; label = `${v.name} (Français)`; }
      else if (l.startsWith('fi')) { flag = '🇫🇮'; label = `${v.name} (Suomi Natural)`; }
      else if (l.startsWith('es')) { flag = '🇪🇸'; label = `${v.name} (Español)`; }
      else if (l.startsWith('de')) { flag = '🇩🇪'; label = `${v.name} (Deutsch)`; }

      profiles.push({
        id: v.name,
        name: v.name,
        lang: v.lang,
        label,
        flag,
        gender: lower.includes('male') && !lower.includes('female') ? 'male' : 'female',
        isNaturalScore: score
      });
    }

    // Sort highest naturalness score first
    return profiles.sort((a, b) => b.isNaturalScore - a.isNaturalScore);
  }

  /**
   * Choose the optimal natural human voice for a target language
   */
  public selectBestVoice(targetLang = 'en'): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // 1. If explicit user voice is saved and matches
    if (this.settings.selectedVoiceId && this.settings.selectedVoiceId !== 'auto') {
      const match = voices.find(v => v.name === this.settings.selectedVoiceId);
      if (match) return match;
    }

    // 2. Language-specific natural heuristic
    const prefix = targetLang.toLowerCase().slice(0, 2);
    const matchingVoices = voices.filter(v => v.lang.toLowerCase().startsWith(prefix));

    if (matchingVoices.length === 0) {
      // Fallback to top English voice
      const enVoice = voices.find(v => v.lang.toLowerCase().startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google')));
      return enVoice || voices[0] || null;
    }

    // Look for Google, Natural, Neural, or high-tier voices
    const naturalVoice = matchingVoices.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('natural') || n.includes('online') || n.includes('google') || n.includes('neural') || n.includes('samantha') || n.includes('jenny');
    });

    return naturalVoice || matchingVoices[0];
  }

  /**
   * Speak educational text with formula translation and natural pacing
   */
  public speakEducationalText(text: string, options?: { targetLang?: string; onEnd?: () => void }) {
    const prepared = this.prepareEducationalSpeech(text);
    return this.speak(prepared, options);
  }

  /**
   * Speak text with natural educational intonation
   */
  public speak(
    text: string, 
    options?: {
      targetLang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onWord?: (word: string) => void;
      rateOverride?: number;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Stop ongoing playback with zero overlap
    this.stop();

    const preparedText = this.prepareEducationalSpeech(text);
    this.sentenceQueue = this.splitIntoBreathGroups(preparedText);
    this.currentQueueIndex = 0;

    if (this.sentenceQueue.length === 0) return;

    this.isSpeakingState = true;
    this.isPausedState = false;
    this.notifyListeners();

    if (options?.onStart) options.onStart();

    this.playNextChunk(options);
  }

  private playNextChunk(options?: {
    targetLang?: string;
    onEnd?: () => void;
    onWord?: (word: string) => void;
    rateOverride?: number;
  }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.currentQueueIndex >= this.sentenceQueue.length) {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.notifyListeners();
      if (options?.onEnd) options.onEnd();
      return;
    }

    const chunk = this.sentenceQueue[this.currentQueueIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);

    // Apply natural speech acoustics
    utterance.rate = options?.rateOverride || this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    const voice = this.selectBestVoice(options?.targetLang || this.settings.selectedLanguage);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word' && options?.onWord) {
        const word = chunk.substring(event.charIndex, event.charIndex + (event.charLength || 10));
        options.onWord(word);
      }
    };

    utterance.onend = () => {
      this.currentQueueIndex++;
      this.playNextChunk(options);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Natural voice playback warning:', e.error);
      }
      this.currentQueueIndex++;
      this.playNextChunk(options);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.isPausedState = true;
        this.notifyListeners();
      }
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.isPausedState = false;
        this.notifyListeners();
      }
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.sentenceQueue = [];
      this.currentQueueIndex = 0;
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.notifyListeners();
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public subscribe(listener: (state: { isSpeaking: boolean; isPaused: boolean }) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const state = { isSpeaking: this.isSpeakingState, isPaused: this.isPausedState };
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  /**
   * Preview a voice sample so students can verify natural clarity
   */
  public previewVoice(voiceId: string, sampleText?: string) {
    const originalVoice = this.settings.selectedVoiceId;
    this.saveSettings({ selectedVoiceId: voiceId });

    const sample = sampleText || "Hello! I am your NeoNova natural science and homework tutor. Let's explore the laboratory and discover scientific concepts together.";
    this.speak(sample, {
      onEnd: () => {
        // Restore if needed or keep
      }
    });
  }
}

export const naturalVoiceEngine = new NaturalVoiceEngine();
