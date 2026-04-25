// ─── DASHBOARD DEFAULTS ───────────────────────────────────────────────────────
// Default KPI and chart configurations that replicate the original
// hard-coded warranty dashboard. Users start here and customise from these.

import { T } from "./tokens.js";

// ─── KPI THEMES ───────────────────────────────────────────────────────────────
// Named presets for quick color selection in the KPI editor.

export const KPI_THEMES = {
  blue:   { color: T.brand,     bg: T.brandSubtle  },
  green:  { color: T.success,   bg: T.successSoft  },
  yellow: { color: T.warning,   bg: T.warningSoft  },
  red:    { color: T.danger,    bg: T.dangerSoft   },
  gray:   { color: T.textSec,   bg: T.bgApp        },
  orange: { color: T.accentDark,bg: T.accentSubtle },
  purple: { color: "#5B3E9C",   bg: "#EDE7FF"      },
};

// ─── CHART COLOR PALETTES ─────────────────────────────────────────────────────

export const COLOR_PALETTES = {
  default: ["#1B5FA8","#F5A623","#E24B4A","#97C459","#7DAEE8","#FAD07A","#F09595","#5DCAA5"],
  warm:    ["#E24B4A","#F5A623","#FAD07A","#F09595","#C97E0A","#E8856E","#D6545C","#F5C94E"],
  cool:    ["#1B5FA8","#7DAEE8","#BCD4F4","#5DCAA5","#AFA9EC","#4B9FDC","#3D7FBF","#86C4E8"],
  earth:   ["#8B6914","#5C4033","#7C8B5E","#C4956A","#9C7A5A","#D4B483","#6B8C6B","#A3724A"],
  mono:    ["#1C1C1B","#636260","#959490","#C4C3BD","#E5E4E0","#F4F3F0","#FAFAF8","#FFFFFF"],
};

// ─── DEFAULT KPI CONFIGURATIONS ───────────────────────────────────────────────
// Each config matches a KPI card from the original hard-coded dashboard.
// aggregation: "count" | "sum" | "avg" | "min" | "max"
// filter: { field, op, value } — applied before aggregation. null = no filter.
// format: "number" | "currency" | "percent" | "text"

export const DEFAULT_KPI_CONFIGS = [
  // ── Row 1: Warranty Status ────────────────────────────────────────────────
  {
    id: "kpi-under-warranty",
    title: "Under Warranty",
    aggregation: "count",
    field: null,
    filter: { field: "status", op: "in", value: ["active", "expiring"] },
    subtitle: "Active & expiring orders",
    icon: "shield",
    color: T.brand,
    bg: T.brandSubtle,
    format: "number",
    decimals: 0,
    hidden: false,
  },
  {
    id: "kpi-active",
    title: "Active",
    aggregation: "count",
    field: null,
    filter: { field: "status", op: "eq", value: "active" },
    subtitle: "Coverage currently active",
    icon: "check-circle",
    color: T.success,
    bg: T.successSoft,
    format: "number",
    decimals: 0,
    hidden: false,
  },
  {
    id: "kpi-expiring",
    title: "Expiring Soon",
    aggregation: "count",
    field: null,
    filter: { field: "status", op: "eq", value: "expiring" },
    subtitle: "Under 90 days remaining",
    icon: "alert-circle",
    color: T.warning,
    bg: T.warningSoft,
    format: "number",
    decimals: 0,
    hidden: false,
  },
  {
    id: "kpi-expired",
    title: "Expired",
    aggregation: "count",
    field: null,
    filter: { field: "status", op: "eq", value: "expired" },
    subtitle: "Warranty period closed",
    icon: "x-circle",
    color: T.danger,
    bg: T.dangerSoft,
    format: "number",
    decimals: 0,
    hidden: false,
  },
  // ── Row 2: Claims + Financials ────────────────────────────────────────────
  {
    id: "kpi-open-claims",
    title: "Open Claims",
    aggregation: "sum",
    field: "openClaims",
    filter: null,
    subtitle: "Require active attention",
    icon: "file-alert",
    color: T.danger,
    bg: T.dangerSoft,
    format: "number",
    decimals: 0,
    hidden: false,
  },
  {
    id: "kpi-closed-claims",
    title: "Closed Claims",
    aggregation: "sum",
    field: "closedClaims",
    filter: null,
    subtitle: "Claims resolved",
    icon: "file-check",
    color: T.textSec,
    bg: T.bgApp,
    format: "number",
    decimals: 0,
    hidden: false,
  },
  {
    id: "kpi-portfolio-value",
    title: "Total Portfolio Value",
    aggregation: "sum",
    field: "orderValue",
    filter: null,
    subtitle: "All tracked orders",
    icon: "dollar-sign",
    color: T.brandDark,
    bg: T.brandSubtle,
    format: "currency",
    decimals: 2,
    hidden: false,
  },
  {
    id: "kpi-claim-costs",
    title: "Claim Costs",
    aggregation: "sum",
    field: "claimCost",
    filter: null,
    subtitle: "Total repair cost logged",
    icon: "briefcase",
    color: T.accentDark,
    bg: T.accentSubtle,
    format: "currency",
    decimals: 2,
    hidden: false,
  },
  {
    id: "kpi-high-risk",
    title: "High Risk Orders",
    aggregation: "count",
    field: null,
    filter: { field: "risk", op: "in", value: ["critical", "high"] },
    subtitle: "Critical or high risk level",
    icon: "alert-triangle",
    color: T.danger,
    bg: T.dangerSoft,
    format: "number",
    decimals: 0,
    hidden: false,
  },
];

// ─── DEFAULT CHART CONFIGURATIONS ────────────────────────────────────────────
// Each config matches a chart from the original hard-coded dashboard.
// type: "bar" | "hbar" | "donut" | "line" | "stacked"
// metrics: [{ field, aggregation, label, color }] — up to 3 per chart.
// sortDir: "asc" | "desc" (by primary metric value).

export const DEFAULT_CHART_CONFIGS = [
  {
    id: "chart-claims-by-brand",
    title: "Open & Closed Claims by Brand",
    type: "bar",
    groupField: "brand",
    stackField: null,
    metrics: [
      { field: null,          aggregation: "count", label: "Orders",        color: "#BCD4F4" },
      { field: "openClaims",  aggregation: "sum",   label: "Open Claims",   color: "#E24B4A" },
      { field: "closedClaims",aggregation: "sum",   label: "Closed Claims", color: "#FAD07A" },
    ],
    filter: null,
    sortDir: "desc",
    maxCategories: null,
    showLegend: true,
    showAxisLabels: true,
    palette: "default",
    hidden: false,
  },
  {
    id: "chart-status-breakdown",
    title: "Warranty Status Breakdown",
    type: "donut",
    groupField: "status",
    stackField: null,
    metrics: [
      { field: null, aggregation: "count", label: "Count", color: null },
    ],
    filter: null,
    sortDir: "desc",
    maxCategories: null,
    showLegend: true,
    showAxisLabels: false,
    palette: "default",
    hidden: false,
  },
  {
    id: "chart-claims-by-pm",
    title: "Orders & Claims by Project Manager",
    type: "hbar",
    groupField: "pm",
    stackField: null,
    metrics: [
      { field: null,     aggregation: "count", label: "Orders", color: "#BCD4F4" },
      { field: "claims", aggregation: "sum",   label: "Claims", color: "#1B5FA8" },
    ],
    filter: null,
    sortDir: "desc",
    maxCategories: 12,
    showLegend: true,
    showAxisLabels: true,
    palette: "default",
    hidden: false,
  },
  {
    id: "chart-claims-by-product",
    title: "Claims by Product Type",
    type: "hbar",
    groupField: "products",
    stackField: null,
    metrics: [
      { field: "claims", aggregation: "sum",   label: "Claims", color: "#F5A623" },
      { field: null,     aggregation: "count", label: "Orders", color: "#FAD07A" },
    ],
    filter: null,
    sortDir: "desc",
    maxCategories: 12,
    showLegend: true,
    showAxisLabels: true,
    palette: "default",
    hidden: false,
  },
];

// ─── BLANK TEMPLATES ──────────────────────────────────────────────────────────
// Used when the user clicks "Add KPI" or "Add Chart" in edit mode.

export function blankKpiConfig(id) {
  return {
    id,
    title: "New KPI",
    aggregation: "count",
    field: null,
    filter: null,
    subtitle: "",
    icon: "bar-chart-2",
    color: T.brand,
    bg: T.brandSubtle,
    format: "number",
    decimals: 0,
    hidden: false,
  };
}

export function blankChartConfig(id) {
  return {
    id,
    title: "New Chart",
    type: "bar",
    groupField: "brand",
    stackField: null,
    metrics: [
      { field: null, aggregation: "count", label: "Count", color: null },
    ],
    filter: null,
    sortDir: "desc",
    maxCategories: 12,
    showLegend: true,
    showAxisLabels: true,
    palette: "default",
    hidden: false,
  };
}
