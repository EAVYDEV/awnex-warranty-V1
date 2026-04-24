export const LS_TABLE = "awntrak_warranty_table_id";
export const LS_REPORT = "awntrak_warranty_report_id";

export function safeParseJSON(value, fallback = null) {
  try { return JSON.parse(value); } catch { return fallback; }
}

export function loadDashboardConfig() {
  if (typeof window === "undefined") return { tableId: "", reportId: "" };
  return {
    tableId: localStorage.getItem(LS_TABLE) || "",
    reportId: localStorage.getItem(LS_REPORT) || "",
  };
}

export function saveDashboardConfig({ tableId = "", reportId = "" }) {
  localStorage.setItem(LS_TABLE, tableId);
  localStorage.setItem(LS_REPORT, reportId);
}

export function resetDashboardConfig() {
  localStorage.removeItem(LS_TABLE);
  localStorage.removeItem(LS_REPORT);
}
