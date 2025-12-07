export class SoundManager {
    private ctx: AudioContext;

    constructor() {
        // Initialize AudioContext
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
    }

    playPickup() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playFootstep() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.1;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    playAmbience() {
         if (this.ctx.state === 'suspended') this.ctx.resume();
         const osc = this.ctx.createOscillator();
         const gain = this.ctx.createGain();

         osc.type = 'triangle';
         osc.frequency.value = 50; // Low drone

         gain.gain.value = 0.05;

         osc.connect(gain);
         gain.connect(this.ctx.destination);

         osc.start();
         // Loop forever? For now, let's not leak oscillators in this simple demo
         osc.stop(this.ctx.currentTime + 5);
    }

    playDoorOpen() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Low creak
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 1.5);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }

    playLockedSound() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);

        // Double click effect
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(100, this.ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.05, this.ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);

        osc2.start(this.ctx.currentTime + 0.15);
        osc2.stop(this.ctx.currentTime + 0.25);
    }

    playHeartbeat() {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const t = this.ctx.currentTime;

        const createThump = (time: number, vol: number) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.frequency.setValueAtTime(60, time);
            osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);

            gain.gain.setValueAtTime(vol, time);
            gain.gain.exponentialRampToValueAtTime(0, time + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.15);
        };

        createThump(t, 0.5);
        createThump(t + 0.2, 0.3); // Lub-dub
    }
}

export const soundManager = new SoundManager();
