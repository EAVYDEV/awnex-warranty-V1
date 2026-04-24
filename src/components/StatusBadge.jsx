import { RISK_CFG, STATUS_CFG, T } from "../lib/dashboardDefaults";

export function StatusBadge({ status, days }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.active;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
      borderRadius: 999, background: cfg.bg, color: cfg.text, fontWeight: 700, fontSize: 11, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label} ({Math.abs(days)}d {status === "expired" ? "ago" : "left"})
    </span>
  );
}

export function ProductTag({ name }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 8px", borderRadius: 999,
      background: T.brandSubtle, color: T.brandDark, border: `1px solid ${T.brandSoft}`,
      fontSize: 10, fontWeight: 700, marginRight: 6, marginBottom: 4,
    }}>
      {name}
    </span>
  );
}

export function RiskBadge({ level, score }) {
  const cfg = RISK_CFG[level] || RISK_CFG.low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
      borderRadius: 999, background: cfg.bg, color: cfg.text, fontWeight: 700, fontSize: 11, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label} ({score}/100)
    </span>
  );
}
