// ─── DASHBOARD STORAGE ────────────────────────────────────────────────────────
// localStorage helpers for QB connection settings and dashboard configurations.
// Structured so configs can later be persisted to Quickbase or SharePoint.

import { DEFAULT_KPI_CONFIGS, DEFAULT_CHART_CONFIGS } from "./dashboardDefaults.js";

export const LS_TABLE        = "awntrak_warranty_table_id";
export const LS_REPORT       = "awntrak_warranty_report_id";
export const LS_KPI_CONFIGS  = "awntrak_kpi_configs";
export const LS_CHART_CONFIGS= "awntrak_chart_configs";

// ─── QB CONNECTION ────────────────────────────────────────────────────────────

export function loadConnectionSettings() {
  try {
    return {
      tableId:  localStorage.getItem(LS_TABLE)  || "",
      reportId: localStorage.getItem(LS_REPORT) || "",
    };
  } catch {
    return { tableId: "", reportId: "" };
  }
}

export function saveConnectionSettings({ tableId, reportId }) {
  try {
    localStorage.setItem(LS_TABLE,  tableId);
    localStorage.setItem(LS_REPORT, reportId);
  } catch {}
}

// ─── KPI CONFIGS ─────────────────────────────────────────────────────────────

export function loadKpiConfigs() {
  try {
    const raw = localStorage.getItem(LS_KPI_CONFIGS);
    if (!raw) return DEFAULT_KPI_CONFIGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_KPI_CONFIGS;
  } catch {
    return DEFAULT_KPI_CONFIGS;
  }
}

export function saveKpiConfigs(configs) {
  try {
    localStorage.setItem(LS_KPI_CONFIGS, JSON.stringify(configs));
  } catch {}
}

// ─── CHART CONFIGS ────────────────────────────────────────────────────────────

export function loadChartConfigs() {
  try {
    const raw = localStorage.getItem(LS_CHART_CONFIGS);
    if (!raw) return DEFAULT_CHART_CONFIGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CHART_CONFIGS;
  } catch {
    return DEFAULT_CHART_CONFIGS;
  }
}

export function saveChartConfigs(configs) {
  try {
    localStorage.setItem(LS_CHART_CONFIGS, JSON.stringify(configs));
  } catch {}
}

// ─── RESET ────────────────────────────────────────────────────────────────────

export function resetAllConfigs() {
  try {
    localStorage.removeItem(LS_KPI_CONFIGS);
    localStorage.removeItem(LS_CHART_CONFIGS);
  } catch {}
  return {
    kpiConfigs:   DEFAULT_KPI_CONFIGS,
    chartConfigs: DEFAULT_CHART_CONFIGS,
  };
}
