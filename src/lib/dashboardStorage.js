const LS_TABLE    = "awntrak_warranty_table_id";
const LS_REPORT   = "awntrak_warranty_report_id";

export const LS_DASHBOARD_TITLE    = "awntrak_dashboard_title";
export const LS_DASHBOARD_SUBTITLE = "awntrak_dashboard_subtitle";

export const DEFAULT_DASHBOARD_TITLE    = "Warranty Management";
export const DEFAULT_DASHBOARD_SUBTITLE = "Awntrak Platform — QC Module";

export function safeJsonParse(raw, fallback = null) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function loadDashboardConfig() {
  return {
    tableId: localStorage.getItem(LS_TABLE) || "",
    reportId: localStorage.getItem(LS_REPORT) || "",
  };
}

export function saveDashboardConfig(config) {
  localStorage.setItem(LS_TABLE, config.tableId || "");
  localStorage.setItem(LS_REPORT, config.reportId || "");
}

export function resetDashboardConfig() {
  localStorage.removeItem(LS_TABLE);
  localStorage.removeItem(LS_REPORT);
}

export function loadDashboardTitle() {
  try {
    return localStorage.getItem(LS_DASHBOARD_TITLE) || DEFAULT_DASHBOARD_TITLE;
  } catch {
    return DEFAULT_DASHBOARD_TITLE;
  }
}

export function saveDashboardTitle(title) {
  try { localStorage.setItem(LS_DASHBOARD_TITLE, title); } catch {}
}

export function loadDashboardSubtitle() {
  try {
    return localStorage.getItem(LS_DASHBOARD_SUBTITLE) || DEFAULT_DASHBOARD_SUBTITLE;
  } catch {
    return DEFAULT_DASHBOARD_SUBTITLE;
  }
}

export function saveDashboardSubtitle(subtitle) {
  try { localStorage.setItem(LS_DASHBOARD_SUBTITLE, subtitle); } catch {}
}
