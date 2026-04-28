import { RISK_CFG, STATUS_CFG, T } from "../lib/dashboardDefaults";

export function StatusBadge({ status, days }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.unknown;
  const label = days === null || days === undefined
    ? "—"
    : status === "expired"
      ? `${Math.abs(days)}d ago`
      : `${days}d left`;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 999,
        background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        {cfg.label}
      </span>
      <span style={{ fontSize: 10, color: cfg.text, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export function ProductTag({ name }) {
  return (
    <span style={{
      padding: "2px 7px", borderRadius: 4,
      background: T.brandSubtle, color: T.brandDark,
      fontSize: 10, fontWeight: 600,
      display: "inline-block", marginRight: 3, marginBottom: 2,
    }}>
      {name}
    </span>
  );
}

export function RiskBadge({ level, score }) {
  const cfg = RISK_CFG[level];
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 999,
        background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        {cfg.label}
      </span>
      <span style={{ fontSize: 10, color: cfg.text, fontWeight: 500 }}>{score} / 100</span>
    </div>
  );
}

