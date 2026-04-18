import { useEffect, useMemo, useState } from "react";

type RadarTile = {
  radar: {
    id: string;
    slug: string;
    name: string;
    category: string;
    status: string;
  };
  sourceCount: number;
  submissionCount: number;
  liveSnapshot?: {
    disagreement_index: number;
    quality_score: number;
    signals: Record<string, { median: number; range: [number, number]; agreement: number }>;
  };
  latestDailySnapshot?: {
    as_of_utc: string;
  };
};

function averageSignal(snapshot: RadarTile["liveSnapshot"]): number {
  if (!snapshot) return 0;
  const values = Object.values(snapshot.signals);
  if (values.length === 0) return 0;
  return values.reduce((sum, signal) => sum + signal.median, 0) / values.length;
}

function ClockTile({ tile }: { tile: RadarTile }): JSX.Element {
  const mean = averageSignal(tile.liveSnapshot);
  const angle = -90 + (mean / 4) * 360;
  const disagreement = tile.liveSnapshot?.disagreement_index ?? 0;
  const haloOpacity = 0.15 + disagreement * 0.5;
  const handLength = 58;
  const radians = (angle * Math.PI) / 180;
  const x2 = 76 + Math.cos(radians) * handLength;
  const y2 = 76 + Math.sin(radians) * handLength;

  return (
    <article className="tile">
      <div className="tile-header">
        <div>
          <h2>{tile.radar.name}</h2>
          <p>{tile.radar.category}</p>
        </div>
        <span className="status">{tile.radar.status}</span>
      </div>
      <svg viewBox="0 0 152 152" className="clock" role="img" aria-label={`${tile.radar.name} clock`}>
        <defs>
          <radialGradient id={`halo-${tile.radar.id}`}>
            <stop offset="0%" stopColor="rgba(255,111,60,0.0)" />
            <stop offset="70%" stopColor={`rgba(255,111,60,${haloOpacity.toFixed(2)})`} />
            <stop offset="100%" stopColor="rgba(255,111,60,0.0)" />
          </radialGradient>
        </defs>
        <circle cx="76" cy="76" r="70" fill={`url(#halo-${tile.radar.id})`} />
        <circle cx="76" cy="76" r="58" className="clock-face" />
        <circle cx="76" cy="76" r="48" className="clock-ring" />
        {tile.liveSnapshot && Object.values(tile.liveSnapshot.signals).map((signal, index) => {
          const start = -90 + (signal.range[0] / 4) * 360;
          const end = -90 + (signal.range[1] / 4) * 360;
          return (
            <path
              key={`${tile.radar.id}-${index}`}
              d={describeArc(76, 76, 52 - index * 3, start, end)}
              className="uncertainty-arc"
            />
          );
        })}
        <line x1="76" y1="76" x2={x2} y2={y2} className="clock-hand" />
        <circle cx="76" cy="76" r="5" className="clock-center" />
      </svg>
      <div className="tile-meta">
        <span>{tile.submissionCount} packets</span>
        <span>{tile.sourceCount} sources</span>
        <span>Q {tile.liveSnapshot?.quality_score ?? 0}</span>
      </div>
    </article>
  );
}

export function App(): JSX.Element {
  const [tiles, setTiles] = useState<RadarTile[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      const response = await fetch(`${apiUrl}/api/radars`);
      const payload = (await response.json()) as RadarTile[];
      if (active) {
        setTiles(payload);
      }
    };
    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 15_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const headline = useMemo(() => `${tiles.length} active radars`, [tiles.length]);

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Threat Radar Network</p>
        <h1>{headline}</h1>
        <p className="lede">A live wall of agent-maintained clocks. Each tile is a deterministic synthesis over evolving evidence, not a single model opinion.</p>
      </header>
      <section className="wall">
        {tiles.map((tile) => <ClockTile key={tile.radar.id} tile={tile} />)}
      </section>
    </main>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}
