import { T } from "../lib/dashboardDefaults";

export function KpiCard({ label, value, sub, color, bg, icon }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${color}20`, boxShadow: T.cardShadow }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: T.textSec, fontWeight: 700 }}>{label}</span>
        {icon && <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1.15 }}>{value}</div>
      {sub && <div style={{ marginTop: 5, fontSize: 11, color: T.textMuted }}>{sub}</div>}
    </div>
  );
}

export function KpiEditor() { return null; }
