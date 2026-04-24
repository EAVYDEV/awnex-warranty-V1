const LS_TABLE = "awntrak_warranty_table_id";
const LS_REPORT = "awntrak_warranty_report_id";

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
