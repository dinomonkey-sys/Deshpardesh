/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Subtle "blip" for movement
  playStep() {
    this.playTone(150, 'sine', 0.05, 0.02);
  }

  // Soft "chime" for topic interaction
  playInteraction() {
    this.playTone(440, 'sine', 0.3, 0.05);
    setTimeout(() => this.playTone(880, 'sine', 0.3, 0.03), 50);
  }

  // Upward sweep for screen transitions
  playTransition() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // High-pitched "ding" for correct answers
  playCorrect() {
    this.playTone(523.25, 'sine', 0.5, 0.05); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.5, 0.03), 100); // E5
  }

  // Low-pitched "thud" for incorrect answers
  playIncorrect() {
    this.playTone(110, 'triangle', 0.4, 0.08); // A2
  }

  // "Pop" for UI clicks
  playClick() {
    this.playTone(300, 'sine', 0.1, 0.05);
  }
}

export const sounds = new SoundManager();
