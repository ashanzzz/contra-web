export function createSfxManager() {
  return new SfxManager();
}

class SfxManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
  }

  unlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  }

  fire() {
    this.playTone({
      startHz: 640,
      endHz: 460,
      duration: 0.05,
      type: "square",
      gain: 0.04,
    });
  }

  hit() {
    this.playTone({
      startHz: 250,
      endHz: 180,
      duration: 0.07,
      type: "triangle",
      gain: 0.03,
    });
  }

  enemyDown() {
    this.playTone({
      startHz: 210,
      endHz: 70,
      duration: 0.14,
      type: "sawtooth",
      gain: 0.05,
    });
  }

  playerHurt() {
    this.playTone({
      startHz: 190,
      endHz: 110,
      duration: 0.12,
      type: "square",
      gain: 0.05,
    });
  }

  playerDown() {
    this.playTone({
      startHz: 420,
      endHz: 80,
      duration: 0.26,
      type: "sawtooth",
      gain: 0.06,
    });
  }

  victory() {
    this.playTone({ startHz: 520, endHz: 700, duration: 0.1, type: "triangle", gain: 0.05 });
    this.playTone({ startHz: 700, endHz: 920, duration: 0.15, type: "triangle", gain: 0.045, delay: 0.12 });
  }

  defeat() {
    this.playTone({ startHz: 300, endHz: 160, duration: 0.2, type: "square", gain: 0.05 });
    this.playTone({ startHz: 180, endHz: 90, duration: 0.24, type: "square", gain: 0.04, delay: 0.16 });
  }

  playTone({ startHz, endHz, duration, type, gain, delay = 0 }) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;

    const startAt = ctx.currentTime + delay;
    const stopAt = startAt + duration;

    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startHz, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endHz), stopAt);

    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, startAt);
    amp.gain.linearRampToValueAtTime(gain, startAt + Math.min(0.015, duration * 0.2));
    amp.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(amp);
    amp.connect(ctx.destination);

    oscillator.start(startAt);
    oscillator.stop(stopAt + 0.01);
  }

  ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    return this.ctx;
  }
}
