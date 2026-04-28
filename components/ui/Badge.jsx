import { STATUS_CFG, RISK_CFG } from "../../lib/tokens.js";

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

export function StatusBadge({ status, days }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.active;
  const label = days == null
    ? "No date"
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

// ─── RISK BADGE ───────────────────────────────────────────────────────────────

export function RiskBadge({ level, score }) {
  const cfg = RISK_CFG[level] || RISK_CFG.low;
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
