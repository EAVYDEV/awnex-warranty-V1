// ─── RISK HISTORY ─────────────────────────────────────────────────────────────
// Persists rolling risk-score snapshots per order so sparklines and trend
// detection can work across page loads.

const LS_RISK_HISTORY = "awntrak_risk_history";
const MAX_SNAPSHOTS   = 30;

export function loadRiskHistory() {
  try {
    const raw = localStorage.getItem(LS_RISK_HISTORY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// Called after each successful data fetch; appends the current riskScore for
// every order and trims each series to MAX_SNAPSHOTS entries.
export function saveRiskSnapshot(orders) {
  try {
    const history = loadRiskHistory();
    const ts = Date.now();
    orders.forEach(o => {
      if (!o.orderNum) return;
      const prev = history[o.orderNum] || [];
      history[o.orderNum] = [...prev, { ts, score: o.riskScore ?? 0 }].slice(-MAX_SNAPSHOTS);
    });
    localStorage.setItem(LS_RISK_HISTORY, JSON.stringify(history));
  } catch {}
}

export function clearRiskHistory() {
  try { localStorage.removeItem(LS_RISK_HISTORY); } catch {}
}

// Returns true when the trailing average of an order's risk scores is rising.
// Requires at least minPoints data points; compares the mean of the first half
// to the mean of the last half and flags a rise > 2 pts to filter noise.
export function isRisingRisk(snapshots, minPoints = 3) {
  if (!snapshots || snapshots.length < minPoints) return false;
  const recent = snapshots.slice(-Math.min(6, snapshots.length));
  if (recent.length < 2) return false;
  const mid = Math.ceil(recent.length / 2);
  const avg = arr => arr.reduce((s, p) => s + p.score, 0) / arr.length;
  return avg(recent.slice(mid)) > avg(recent.slice(0, mid)) + 2;
}
