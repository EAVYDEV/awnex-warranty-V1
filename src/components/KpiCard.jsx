import { T } from "../lib/dashboardDefaults";

export function KpiCard({ label, value, sub, color, bg, icon }) {
  return (
    <div style={{
      background: T.bgCard, borderRadius: 12, padding: "18px 20px",
      boxShadow: T.cardShadow,
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        {icon && (
          <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
        )}
      </div>
      <span style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: T.textMuted }}>{sub}</span>}
    </div>
  );
}


export function KpiEditor() {
  return null;
}
