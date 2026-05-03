import { T } from "../../lib/tokens.js";

// Renders a tiny polyline chart from an array of { ts, score } snapshots.
// Rising trend → danger red; falling → success green; flat → muted.
export function Sparkline({ points = [], width = 56, height = 20 }) {
  if (!points || points.length < 2) {
    return <span style={{ color: T.text3, fontSize: 11, display: "block", textAlign: "center" }}>—</span>;
  }

  const scores  = points.map(p => (typeof p === "object" ? p.score : p));
  const minVal  = Math.min(...scores);
  const maxVal  = Math.max(...scores);
  const range   = maxVal - minVal || 1;

  const toX = i  => 2 + (i / (scores.length - 1)) * (width - 4);
  const toY = v  => height - 2 - ((v - minVal) / range) * (height - 4);

  const pts    = scores.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const lastX  = toX(scores.length - 1);
  const lastY  = toY(scores[scores.length - 1]);

  const first  = scores[0];
  const last   = scores[scores.length - 1];
  const color  = last > first + 2 ? T.danger
               : last < first - 2 ? T.successFill
               : T.text3;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
      aria-label={`Risk trend: ${first} → ${last}`}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <circle cx={lastX.toFixed(1)} cy={lastY.toFixed(1)} r="2.5" fill={color} />
    </svg>
  );
}
