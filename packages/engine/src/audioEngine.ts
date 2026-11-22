/**
 * Kerala Athaan - Web Audio API Synthesizer
 * 
 * RULE 9: "Do not use an unlicensed Athaan recording.
 * Ship a short neutral tone by default; add recordings only when I supply permission."
 * 
 * Synthesizes peaceful harmonic bell chimes in pure Web Audio API without
 * external audio files or copyright restrictions. Works 100% offline.
 */

export interface PlayToneOptions {
  volume?: number; // 0.0 to 1.0
  style?: 'short' | 'full';
  onEnded?: () => void;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];

  /**
   * Lazily initializes and returns the AudioContext.
   * Safe for non-DOM / SSR / test environments.
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Unlocks the AudioContext following user gesture (click / touch).
   */
  public async unlock(): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  /**
   * Plays the neutral tone (default acoustic chime).
   */
  public playNeutralTone(options: PlayToneOptions = {}): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    this.stop(); // Stop any active audio

    const masterVolume = Math.max(0, Math.min(1, options.volume ?? 0.8));
    const style = options.style ?? 'short';

    const now = ctx.currentTime;

    // Harmonic frequencies for natural resonance (root 528 Hz - solfeggio frequency + octave harmonic)
    const tones = style === 'short' ? [528, 1056] : [432, 528, 648, 864];
    const duration = style === 'short' ? 1.8 : 4.5;

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Stagger notes slightly for full style arpeggio effect
      const startTime = now + (style === 'full' ? idx * 0.4 : 0);
      const noteDuration = duration - (style === 'full' ? idx * 0.4 : 0);

      // Smooth envelope attack and exponential decay
      const peakGain = (masterVolume * 0.3) / (idx + 1);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);

      this.activeOscillators.push(osc);
      this.activeGainNodes.push(gain);
    });

    if (options.onEnded) {
      setTimeout(options.onEnded, duration * 1000);
    }

    return true;
  }

  /**
   * Stops any currently playing audio immediately.
   */
  public stop(): void {
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    }
    for (const gain of this.activeGainNodes) {
      try {
        gain.disconnect();
      } catch {
        // Disconnected
      }
    }
    this.activeOscillators = [];
    this.activeGainNodes = [];
  }
}

export const audioEngine = new AudioEngine();
