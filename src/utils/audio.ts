let audioCtx: AudioContext | null = null;
let alarmOsc: OscillatorNode | null = null;
let alarmGain: GainNode | null = null;
let alarmLfo: OscillatorNode | null = null;
let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSwitchClick() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  
  // Dual impulse click (switch on/off mechanical snap)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, now);
  filter.Q.setValueAtTime(3.5, now);

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(240, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.035);

  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function playRemoteClick() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function playSitSound() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Low frequency thud/rustle
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.22);
}

export function startAlarmAudio(): void {
  const ctx = getContext();
  if (!ctx) return;
  if (alarmOsc) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(580, now);

  // LFO modulates pitch between 480 and 720 Hz
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(2.2, now); // siren cycle speed
  lfoGain.gain.setValueAtTime(160, now);

  lfo.connect(osc.frequency);

  gain.gain.setValueAtTime(0.08, now);

  osc.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(now);
  osc.start(now);

  alarmOsc = osc;
  alarmGain = gain;
  alarmLfo = lfo;
}

export function stopAlarmAudio(): void {
  if (alarmOsc) {
    try {
      alarmOsc.stop();
      alarmOsc.disconnect();
      alarmLfo?.stop();
      alarmLfo?.disconnect();
      alarmGain?.disconnect();
    } catch {}
    alarmOsc = null;
    alarmGain = null;
    alarmLfo = null;
  }
}

export function toggleRoomAmbience(enable: boolean) {
  const ctx = getContext();
  if (!ctx) return;

  if (!enable) {
    if (ambientSource) {
      try {
        ambientGain?.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        setTimeout(() => {
          ambientSource?.stop();
          ambientSource?.disconnect();
          ambientSource = null;
        }, 500);
      } catch {}
    }
    return;
  }

  if (ambientSource) return;

  // Generate 2 seconds of pink/brown low room tone
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 0.4;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 320;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.2);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  ambientSource = noise;
  ambientGain = gain;
}

export function playFootstep(): void {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(140, now);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(65, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.07);

  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}
