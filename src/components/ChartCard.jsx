import { T } from "../lib/dashboardDefaults";

export function ChartCard({ title, children }) {
  return (
    <div style={{ background: T.bgCard, borderRadius: 12, padding: "16px 20px 12px", boxShadow: T.cardShadow }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14, margin: "0 0 14px" }}>{title}</h3>
      {children}
    </div>
  );
}

export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", boxShadow: T.cardShadow }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: T.text, margin: "0 0 4px" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, color: p.color || T.textSec, margin: "2px 0" }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

export function ChartEditor() { return null; }
export function ConfigurableChart({ children }) { return children ?? null; }
