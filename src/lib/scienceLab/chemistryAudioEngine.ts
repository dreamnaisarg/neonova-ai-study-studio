/**
 * NeoNova 3D Chemistry Lab Sound Synthesis Engine
 * 
 * Uses Web Audio API to procedurally synthesize photorealistic laboratory sounds:
 * - Liquid pouring and splashing
 * - Carbon dioxide / hydrogen gas bubbling & foaming fizz
 * - Glass stirring rod circular vortex clinking
 * - Powder scooping & tap
 * - Science discovery / precipitation sound
 * - Master Mute toggle
 */

class ChemistryAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeFizzSource: AudioNode | null = null;
  private activeFizzGain: GainNode | null = null;

  constructor() {
    // Lazily initialized on first user gesture to comply with browser autoplay policies
    try {
      const storedMute = localStorage.getItem('neonova_chem_lab_muted');
      if (storedMute === 'true') this.isMuted = true;
    } catch {}
  }

  private initContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('neonova_chem_lab_muted', String(this.isMuted));
    } catch {}
    if (this.isMuted) {
      this.stopFizzSound();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Procedural liquid pouring stream sound with resonance
   */
  public playPourSound(durationSec: number = 1.2) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      const now = ctx.currentTime;
      // White noise buffer for fluid turbulence
      const bufferSize = ctx.sampleRate * durationSec;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter to simulate hollow glass beaker resonant splash
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(650, now);
      bandpass.frequency.exponentialRampToValueAtTime(820, now + durationSec); // Pitch rises slightly as beaker fills!
      bandpass.Q.setValueAtTime(3.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      gain.gain.setValueAtTime(0.15, now + durationSec - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      whiteNoise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + durationSec);
    } catch {}
  }

  /**
   * Continuous chemical reaction gas fizzing (effervescence)
   */
  public startFizzSound(intensity: number = 0.2) {
    if (this.isMuted || this.activeFizzSource) return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      // Pink noise algorithm for authentic soda/effervescence fizz
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }

      const fizzNoise = ctx.createBufferSource();
      fizzNoise.buffer = noiseBuffer;
      fizzNoise.loop = true;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(1400, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(Math.min(0.25, intensity), now + 0.3);

      fizzNoise.connect(highpass);
      highpass.connect(gain);
      gain.connect(ctx.destination);

      fizzNoise.start(now);
      this.activeFizzSource = fizzNoise;
      this.activeFizzGain = gain;
    } catch {}
  }

  public stopFizzSound() {
    if (this.activeFizzGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.activeFizzGain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        setTimeout(() => {
          if (this.activeFizzSource) {
            try { (this.activeFizzSource as any).stop(); } catch {}
            this.activeFizzSource = null;
            this.activeFizzGain = null;
          }
        }, 450);
      } catch {
        this.activeFizzSource = null;
        this.activeFizzGain = null;
      }
    }
  }

  /**
   * Glass rod stirring sound with gentle resonance
   */
  public playStirSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      const now = ctx.currentTime;
      // Gentle sine tone glide
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }

  /**
   * Powder scoop / beaker tap clink sound
   */
  public playTapSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Reaction discovery success chime
   */
  public playReactionSuccessSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }
}

export const chemistryAudio = new ChemistryAudioEngine();
