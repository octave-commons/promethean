import type { World } from '../../ds/ecs';

export function VADUpdateSystem(w: World, C: any) {
  const { RawVAD, VAD } = C;
  const q = w.makeQuery({ all: [RawVAD, VAD] });

  return function run(_dt: number) {
    for (const [e, get] of w.iter(q)) {
      const raw = get(RawVAD) ?? { level: 0, ts: 0 };
      const v0 = get(VAD) ?? {
        active: false,
        lastTrueAt: 0,
        lastFalseAt: 0,
        attackMs: 120,
        releaseMs: 250,
        hangMs: 800,
        threshold: 0.5,
        _prevActive: false,
      };
      const now = Date.now();

      let vad = { ...v0 };
      const rawActive = (raw?.level ?? 0) >= vad.threshold;
      if (rawActive) {
        if (!vad.active && now - vad.lastFalseAt >= vad.attackMs) vad = { ...vad, active: true };
        vad = { ...vad, lastTrueAt: now };
      } else {
        if (vad.active && now - vad.lastTrueAt >= vad.releaseMs) vad = { ...vad, active: false };
        vad = { ...vad, lastFalseAt: now };
      }
      if (vad.active && now - vad.lastTrueAt > vad.hangMs) {
        vad = { ...vad, active: false, lastFalseAt: now };
      }

      w.set(e, VAD, vad);
    }
  };
}
