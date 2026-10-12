/**
 * SoundEngine - Pure Web Audio API Cinematic Audio Architecture for Trust No One
 * Provides synthesized interrogation room ambience, scroll-driven tension, and gameplay sound effects.
 * Completely self-contained with zero external asset dependencies or CORS risks.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.65;
  private isAmbientPlaying: boolean = false;

  // Ambient Drone Nodes
  private ambientGain: GainNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private oscMid: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private tensionFilter: BiquadFilterNode | null = null;

  private listeners: Set<() => void> = new Set();

  constructor() {
    // Read persisted audio preferences
    try {
      const savedMute = localStorage.getItem('tno_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('tno_audio_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
    } catch {
      // LocalStorage not available
    }
  }

  private initContext(): boolean {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying && !this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('tno_audio_volume', String(this.volume));
    } catch {}
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.22, this.ctx.currentTime);
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('tno_audio_muted', String(this.isMuted));
    } catch {}

    if (!this.isMuted) {
      this.initContext();
      this.startAmbience();
      this.play('select');
    } else {
      this.stopAmbience();
    }

    this.notify();
    return this.isMuted;
  }

  public enableAudio(): void {
    if (this.isMuted) {
      this.isMuted = false;
      try {
        localStorage.setItem('tno_audio_muted', 'false');
      } catch {}
      this.initContext();
      this.startAmbience();
      this.notify();
    }
  }

  /**
   * Continuous atmospheric interrogation room drone:
   * Low 48Hz drone + subtle 72Hz flutter + filtered ventilation noise
   */
  public startAmbience() {
    if (this.isMuted || this.isAmbientPlaying) return;
    if (!this.initContext() || !this.ctx) return;

    try {
      const ctx = this.ctx;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(this.volume * 0.22, ctx.currentTime + 3);

      // Low sub rumble (interrogation table resonance)
      this.oscSub = ctx.createOscillator();
      this.oscSub.type = 'sine';
      this.oscSub.frequency.setValueAtTime(48, ctx.currentTime);

      // Mid drone with harmonic tension
      this.oscMid = ctx.createOscillator();
      this.oscMid.type = 'triangle';
      this.oscMid.frequency.setValueAtTime(72, ctx.currentTime);

      const midFilter = ctx.createBiquadFilter();
      midFilter.type = 'lowpass';
      midFilter.frequency.setValueAtTime(140, ctx.currentTime);

      // Procedural ventilation / room tone noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseNode = ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      this.tensionFilter = ctx.createBiquadFilter();
      this.tensionFilter.type = 'bandpass';
      this.tensionFilter.frequency.setValueAtTime(220, ctx.currentTime);
      this.tensionFilter.Q.setValueAtTime(0.7, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.025, ctx.currentTime);

      // Connect nodes
      this.noiseNode.connect(this.tensionFilter);
      this.tensionFilter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);

      this.oscSub.connect(this.ambientGain);

      this.oscMid.connect(midFilter);
      midFilter.connect(this.ambientGain);

      this.ambientGain.connect(ctx.destination);

      this.oscSub.start();
      this.oscMid.start();
      this.noiseNode.start();

      this.isAmbientPlaying = true;
    } catch {
      // Audio autoplay restrictions handled
    }
  }

  public stopAmbience() {
    if (!this.isAmbientPlaying) return;
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
      }
      setTimeout(() => {
        try {
          this.oscSub?.stop();
          this.oscMid?.stop();
          this.noiseNode?.stop();
          this.oscSub?.disconnect();
          this.oscMid?.disconnect();
          this.noiseNode?.disconnect();
        } catch {}
        this.isAmbientPlaying = false;
      }, 1000);
    } catch {
      this.isAmbientPlaying = false;
    }
  }

  /**
   * Dynamically adjust tension frequency based on scroll progress (0.0 to 1.0)
   */
  public setScrollTension(progress: number) {
    if (this.isMuted || !this.ctx || !this.isAmbientPlaying) return;
    try {
      const p = Math.max(0, Math.min(1, progress));
      if (this.tensionFilter) {
        // Shift bandpass from 200Hz to 600Hz as suspicion rises
        const targetFreq = 200 + p * 400;
        this.tensionFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      }
      if (this.oscMid) {
        // Subtle micro-pitch rise
        const targetPitch = 72 + p * 8;
        this.oscMid.frequency.setTargetAtTime(targetPitch, this.ctx.currentTime, 0.2);
      }
    } catch {}
  }

  /**
   * Synthesize bespoke cinematic sound cues
   */
  public play(
    sound:
      | 'door_enter'
      | 'footstep'
      | 'evidence_slide'
      | 'suspicion_pulse'
      | 'reveal_impact'
      | 'game_enter'
      | 'chat_send'
      | 'chat_receive'
      | 'typing'
      | 'select'
      | 'vote_cast'
      | 'elimination'
      | 'victory'
      | 'defeat'
      | 'connection_alert'
  ) {
    if (this.isMuted) return;
    if (!this.initContext() || !this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, now);
    masterGain.connect(ctx.destination);

    switch (sound) {
      case 'door_enter': {
        // Deep heavy industrial door shut sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 0.7);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.2);
        break;
      }

      case 'evidence_slide': {
        // Tactile paper / photograph slide across table
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + 0.25);
        filter.Q.setValueAtTime(3.0, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(now);
        break;
      }

      case 'reveal_impact': {
        // Cinematic sub boom impact
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(130, now);
        subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);

        subGain.gain.setValueAtTime(0.65, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

        subOsc.connect(subGain);
        subGain.connect(masterGain);

        subOsc.start(now);
        subOsc.stop(now + 1.6);
        break;
      }

      case 'suspicion_pulse': {
        // Low heartbeat / tension thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }

      case 'game_enter': {
        // Dark ascending transition whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.5);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }

      case 'chat_send': {
        // Crisp investigative typewriter click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'chat_receive': {
        // Muted radio chime / telegraph pulse
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(540, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(780, now + 0.06);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);

        osc1.start(now);
        osc1.stop(now + 0.06);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.28);
        break;
      }

      case 'select': {
        // Tactile suspect selection click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'vote_cast': {
        // Dramatic accusation hammer / gavel hit
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, now);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.65);
        break;
      }

      case 'elimination': {
        // Chilling verdict stinger (descending dissonant tri-tone)
        [185, 130, 92].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 1.4);

          gain.gain.setValueAtTime(0.2, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.1);
          osc.stop(now + 1.8);
        });
        break;
      }

      case 'victory': {
        // Resolving major investigative chord
        [220, 277.18, 329.63, 440].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 2.2);
        });
        break;
      }

      case 'defeat': {
        // Deep grim minor chord
        [110, 130.81, 155.56].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 2.5);
        });
        break;
      }

      case 'connection_alert': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.setValueAtTime(260, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      default:
        break;
    }
  }
}

export const soundEngine = new SoundEngine();
