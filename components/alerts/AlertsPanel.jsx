import { useState } from "react";
import { T } from "../../lib/tokens.js";
import { StatusBadge, RiskBadge } from "../ui/Badge.jsx";

// ─── ORDER ROW ────────────────────────────────────────────────────────────────

function StarButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={active ? "Remove from watchlist" : "Add to watchlist"}
      style={{
        width: 22, height: 22, flexShrink: 0, marginTop: 1,
        border: "none", background: "transparent", cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24"
        fill={active ? T.warningText : "none"}
        stroke={active ? T.warningText : T.text3}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </button>
  );
}

function OrderRow({ o, isWatched, onToggleWatch }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "9px 0", borderBottom: `1px solid ${T.borderLight}`,
    }}>
      <StarButton active={isWatched} onClick={() => onToggleWatch(o.orderNum)} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.brand, whiteSpace: "nowrap" }}>
            {o.orderNum}
          </span>
          <span style={{ fontSize: 11, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
            {o.customer}
          </span>
        </div>
        {o.location && (
          <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>{o.location}</div>
        )}
        <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
          <StatusBadge status={o.status} days={o.days} />
          {o.riskScore >= 50 && <RiskBadge level={o.risk} score={o.riskScore} />}
          {(o.openClaims || 0) > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: T.dangerText,
              background: T.dangerSubtle, padding: "2px 6px", borderRadius: 6,
              border: `1px solid var(--t-danger-fill)`,
            }}>
              {o.openClaims} open claim{o.openClaims !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION ──────────────────────────────────────────────────────────────────

function Section({ title, count, children }) {
  if (!count) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.text3,
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {title}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, color: T.text2,
          background: T.surface, padding: "1px 6px", borderRadius: 999,
          border: `1px solid ${T.borderLight}`,
        }}>
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── ALERTS PANEL ─────────────────────────────────────────────────────────────

export function AlertsPanel({ orders, watchedOrders, onToggleWatch, thresholds, onThresholdsChange, onClose }) {
  const [showThresholds, setShowThresholds] = useState(false);

  const watched    = orders.filter(o => watchedOrders.has(o.orderNum));
  const expiring   = orders.filter(o => o.days != null && o.days >= 0 && o.days <= thresholds.expiryDays);
  const highRisk   = orders.filter(o => (o.riskScore || 0) >= thresholds.riskScore);
  const withClaims = orders.filter(o => (o.openClaims || 0) > 0);

  const totalSet = new Set([
    ...watched.map(o => o.orderNum),
    ...expiring.map(o => o.orderNum),
    ...highRisk.map(o => o.orderNum),
    ...withClaims.map(o => o.orderNum),
  ]);
  const total = totalSet.size;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.22)", zIndex: 999 }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 360,
        background: T.card, zIndex: 1000,
        display: "flex", flexDirection: "column",
        boxShadow: "-4px 0 28px rgba(0,0,0,0.14)",
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 18px",
          borderBottom: `1px solid ${T.borderLight}`,
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={T.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text1, margin: 0, flex: 1 }}>Alerts</h2>
          {total > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: T.card,
              background: T.danger, padding: "2px 8px", borderRadius: 999,
            }}>
              {total}
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              color: T.text2, padding: 4, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          {total === 0 && (
            <div style={{ textAlign: "center", padding: "52px 20px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={T.text3} strokeWidth="1.5"
                style={{ display: "block", margin: "0 auto 12px" }}
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <p style={{ fontSize: 13, color: T.text2, margin: 0 }}>All orders look healthy.</p>
              <p style={{ fontSize: 12, color: T.text3, margin: "6px 0 0" }}>
                Star rows in the table to track specific orders.
              </p>
            </div>
          )}

          <Section title="Watching" count={watched.length}>
            {watched.map(o => (
              <OrderRow key={o.orderNum} o={o} isWatched={true} onToggleWatch={onToggleWatch} />
            ))}
          </Section>

          <Section title={`Expiring Soon  ≤ ${thresholds.expiryDays} days`} count={expiring.length}>
            {expiring.map(o => (
              <OrderRow
                key={o.orderNum} o={o}
                isWatched={watchedOrders.has(o.orderNum)} onToggleWatch={onToggleWatch}
              />
            ))}
          </Section>

          <Section title={`High Risk  ≥ ${thresholds.riskScore}`} count={highRisk.length}>
            {highRisk.map(o => (
              <OrderRow
                key={o.orderNum} o={o}
                isWatched={watchedOrders.has(o.orderNum)} onToggleWatch={onToggleWatch}
              />
            ))}
          </Section>

          <Section title="Open Claims" count={withClaims.length}>
            {withClaims.map(o => (
              <OrderRow
                key={o.orderNum} o={o}
                isWatched={watchedOrders.has(o.orderNum)} onToggleWatch={onToggleWatch}
              />
            ))}
          </Section>
        </div>

        {/* Thresholds footer */}
        <div style={{ borderTop: `1px solid ${T.borderLight}`, flexShrink: 0 }}>
          <button
            onClick={() => setShowThresholds(v => !v)}
            style={{
              width: "100%", padding: "10px 18px",
              border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span style={{
              fontSize: 10, fontWeight: 700, color: T.text3,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Thresholds
            </span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={T.text3} strokeWidth="2.5"
              style={{ transform: showThresholds ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showThresholds && (
            <div style={{ padding: "0 18px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: T.text2 }}>
                Expiry window
                <select
                  value={thresholds.expiryDays}
                  onChange={e => onThresholdsChange({ ...thresholds, expiryDays: Number(e.target.value) })}
                  style={{ padding: "4px 8px", borderRadius: 8, border: `1px solid ${T.borderLight}`, fontSize: 12, background: T.bg, color: T.text1 }}
                >
                  {[30, 60, 90, 180].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </label>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: T.text2 }}>
                Risk threshold
                <select
                  value={thresholds.riskScore}
                  onChange={e => onThresholdsChange({ ...thresholds, riskScore: Number(e.target.value) })}
                  style={{ padding: "4px 8px", borderRadius: 8, border: `1px solid ${T.borderLight}`, fontSize: 12, background: T.bg, color: T.text1 }}
                >
                  {[50, 60, 70, 80, 90].map(v => <option key={v} value={v}>{v}+</option>)}
                </select>
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
