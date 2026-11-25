// audio.js — every sound in the game, synthesized with WebAudio. No audio files,
// no network: a tiny synth that plays a chop thock, a sizzle, a serve chime and more.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopSizzle();
    return this.muted;
  }

  blip(freq, dur, type, vol, slideTo) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noiseBurst(dur, vol, lowpass) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass || 1800;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t);
  }

  pickup() { this.blip(520, 0.07, 'triangle', 0.10, 700); }
  putdown() { this.blip(300, 0.07, 'triangle', 0.10, 220); }
  chop() { this.noiseBurst(0.09, 0.22, 900); this.blip(180, 0.06, 'square', 0.06, 120); }
  chopDone() { this.blip(660, 0.09, 'triangle', 0.12, 880); }
  grillStart() { this.noiseBurst(0.25, 0.10, 3200); }
  grillDone() { this.blip(880, 0.10, 'sine', 0.12, 990); this.blip(1320, 0.12, 'sine', 0.08, 1320); }
  burnt() { this.blip(220, 0.25, 'sawtooth', 0.10, 110); }
  serve() {
    this.blip(523, 0.10, 'sine', 0.12);
    setTimeout(() => this.blip(659, 0.10, 'sine', 0.12), 90);
    setTimeout(() => this.blip(784, 0.16, 'sine', 0.14), 180);
  }
  wrong() { this.blip(160, 0.18, 'square', 0.10, 120); }
  orderIn() { this.blip(440, 0.08, 'triangle', 0.10, 587); setTimeout(() => this.blip(587, 0.10, 'triangle', 0.09), 80); }
  expired() { this.blip(330, 0.20, 'sawtooth', 0.09, 196); }
  tick() { this.blip(980, 0.05, 'square', 0.05); }
  shiftEnd() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, 'triangle', 0.12), i * 130));
  }
  click() { this.blip(700, 0.05, 'triangle', 0.08, 900); }

  // A soft looping sizzle while anything sits on the grill.
  startSizzle() {
    if (this.muted || !this.ctx || this.sizzleNodes) return;
    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4200;
    filter.Q.value = 0.6;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.018;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start();
    this.sizzleNodes = { src, gain };
  }

  stopSizzle() {
    if (!this.sizzleNodes) return;
    try { this.sizzleNodes.src.stop(); } catch (_e) { /* already stopped */ }
    this.sizzleNodes = null;
  }
}
