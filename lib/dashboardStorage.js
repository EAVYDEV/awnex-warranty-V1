// ─── DASHBOARD STORAGE ────────────────────────────────────────────────────────
// localStorage helpers for QB connection settings and dashboard configurations.
// Structured so configs can later be persisted to Quickbase or SharePoint.

import { DEFAULT_KPI_CONFIGS, DEFAULT_CHART_CONFIGS } from "./dashboardDefaults.js";

export const LS_TABLE              = "awntrak_warranty_table_id";
export const LS_REPORT             = "awntrak_warranty_report_id";
export const LS_KPI_CONFIGS        = "awntrak_kpi_configs";
export const LS_CHART_CONFIGS      = "awntrak_chart_configs";
export const LS_COLUMN_TITLES      = "awntrak_column_titles";
export const LS_COLUMN_ORDER       = "awntrak_column_order";
export const LS_DASHBOARD_TITLE    = "awntrak_dashboard_title";
export const LS_DASHBOARD_SUBTITLE = "awntrak_dashboard_subtitle";

export const DEFAULT_DASHBOARD_TITLE    = "Warranty Management";
export const DEFAULT_DASHBOARD_SUBTITLE = "Awntrak Platform — QC Module";

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

// ─── COLUMN TITLES ────────────────────────────────────────────────────────────

export function loadColumnTitles() {
  try {
    const raw = localStorage.getItem(LS_COLUMN_TITLES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveColumnTitles(titles) {
  try {
    localStorage.setItem(LS_COLUMN_TITLES, JSON.stringify(titles));
  } catch {}
}

// ─── COLUMN ORDER ─────────────────────────────────────────────────────────────

export function loadColumnOrder() {
  try {
    const raw = localStorage.getItem(LS_COLUMN_ORDER);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveColumnOrder(order) {
  try { localStorage.setItem(LS_COLUMN_ORDER, JSON.stringify(order)); } catch {}
}

// ─── DASHBOARD TITLE / SUBTITLE ───────────────────────────────────────────────

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

// ─── RESET ────────────────────────────────────────────────────────────────────

export function resetAllConfigs() {
  try {
    localStorage.removeItem(LS_KPI_CONFIGS);
    localStorage.removeItem(LS_CHART_CONFIGS);
    localStorage.removeItem(LS_COLUMN_TITLES);
    localStorage.removeItem(LS_COLUMN_ORDER);
    localStorage.removeItem(LS_DASHBOARD_TITLE);
    localStorage.removeItem(LS_DASHBOARD_SUBTITLE);
  } catch {}
  return {
    kpiConfigs:   DEFAULT_KPI_CONFIGS,
    chartConfigs: DEFAULT_CHART_CONFIGS,
  };
}
