// ─── ALERTS STORAGE ───────────────────────────────────────────────────────────
// localStorage helpers for alert thresholds and the user's watchlist.

const LS_ALERT_THRESHOLDS = "awntrak_alert_thresholds";
const LS_WATCHED_ORDERS   = "awntrak_watched_orders";

export const DEFAULT_ALERT_THRESHOLDS = { expiryDays: 60, riskScore: 70 };

// ─── THRESHOLDS ───────────────────────────────────────────────────────────────

export function loadAlertThresholds() {
  try {
    const raw = localStorage.getItem(LS_ALERT_THRESHOLDS);
    return raw ? { ...DEFAULT_ALERT_THRESHOLDS, ...JSON.parse(raw) } : { ...DEFAULT_ALERT_THRESHOLDS };
  } catch { return { ...DEFAULT_ALERT_THRESHOLDS }; }
}

export function saveAlertThresholds(t) {
  try { localStorage.setItem(LS_ALERT_THRESHOLDS, JSON.stringify(t)); } catch {}
}

export function clearAlertThresholds() {
  try { localStorage.removeItem(LS_ALERT_THRESHOLDS); } catch {}
}

// ─── WATCHLIST ────────────────────────────────────────────────────────────────

export function loadWatchedOrders() {
  try {
    const raw = localStorage.getItem(LS_WATCHED_ORDERS);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

export function saveWatchedOrders(setOrArray) {
  try {
    const arr = setOrArray instanceof Set ? [...setOrArray] : setOrArray;
    localStorage.setItem(LS_WATCHED_ORDERS, JSON.stringify(arr));
  } catch {}
}

export function clearWatchedOrders() {
  try { localStorage.removeItem(LS_WATCHED_ORDERS); } catch {}
}
