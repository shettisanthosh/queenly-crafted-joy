// Lightweight WebAudio click/place/win sounds — no asset files needed.
let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, dur = 0.08, type: OscillatorType = "sine", gain = 0.08) {
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g).connect(a.destination);
  const now = a.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.start(now);
  osc.stop(now + dur);
}

export const sounds = {
  place: () => tone(660, 0.1, "triangle", 0.06),
  remove: () => tone(330, 0.08, "sine", 0.05),
  mark: () => tone(520, 0.05, "square", 0.03),
  click: () => tone(440, 0.05, "sine", 0.04),
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, "triangle", 0.08), i * 110));
  },
  error: () => tone(180, 0.18, "sawtooth", 0.05),
};
