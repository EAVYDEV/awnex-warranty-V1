// ─── DASHBOARD METRIC HELPERS ─────────────────────────────────────────────────
// Pure functions for filtering, grouping, aggregating, and formatting.
// No React dependencies — usable in any dashboard or data module.

// ─── AVAILABLE FIELDS ─────────────────────────────────────────────────────────
// The enriched order fields always available for KPI / chart configuration.
// Extra QB report fields are merged in at runtime by buildAvailableFields().

export const BUILTIN_FIELDS = [
  { key: "status",      label: "Warranty Status",     type: "text"     },
  { key: "brand",       label: "Brand",               type: "text"     },
  { key: "pm",          label: "Project Manager",      type: "text"     },
  { key: "location",    label: "Location",             type: "text"     },
  { key: "customer",    label: "Customer",             type: "text"     },
  { key: "risk",        label: "Risk Level",           type: "text"     },
  { key: "products",    label: "Product Type",         type: "text_array" },
  { key: "claims",      label: "# Warranty Claims",   type: "number"   },
  { key: "openClaims",  label: "Open Claims",          type: "number"   },
  { key: "closedClaims",label: "Closed Claims",        type: "number"   },
  { key: "claimCost",   label: "Claim Cost",           type: "currency" },
  { key: "orderValue",  label: "Order Value",          type: "currency" },
  { key: "qcPeeling",   label: "QC Peeling Entries",  type: "number"   },
  { key: "qcPowder",    label: "QC Powder Failure",   type: "number"   },
  { key: "riskScore",   label: "Risk Score (0–100)",  type: "number"   },
  { key: "days",        label: "Days to Expiry",       type: "number"   },
  { key: "warrantyEnd", label: "Warranty End Date",   type: "date"     },
];

// Merge builtin fields with QB-sourced extra fields (from buildReportFields())
export function buildAvailableFields(qbReportFields = []) {
  const builtinKeys = new Set(BUILTIN_FIELDS.map(f => f.key));
  const extras = qbReportFields.filter(f => !builtinKeys.has(f.key));
  return [...BUILTIN_FIELDS, ...extras];
}

export const NUMERIC_TYPES  = new Set(["number", "currency"]);
export const TEXT_TYPES     = new Set(["text", "text_array"]);

// ─── FILTER ───────────────────────────────────────────────────────────────────
// condition: { field, op, value }
// ops: eq | neq | gt | gte | lt | lte | in | notin | contains | isempty | isnotempty

export function applyFilter(records, condition) {
  if (!condition || !condition.field) return records;
  const { field, op, value } = condition;
  return records.filter(r => {
    const v = r[field];
    switch (op) {
      case "eq":         return String(v).toLowerCase() === String(value).toLowerCase();
      case "neq":        return String(v).toLowerCase() !== String(value).toLowerCase();
      case "gt":         return parseFloat(v) > parseFloat(value);
      case "gte":        return parseFloat(v) >= parseFloat(value);
      case "lt":         return parseFloat(v) < parseFloat(value);
      case "lte":        return parseFloat(v) <= parseFloat(value);
      case "in": {
        const vals = Array.isArray(value) ? value : String(value).split(",").map(s => s.trim());
        return vals.map(s => s.toLowerCase()).includes(String(v).toLowerCase());
      }
      case "notin": {
        const vals = Array.isArray(value) ? value : String(value).split(",").map(s => s.trim());
        return !vals.map(s => s.toLowerCase()).includes(String(v).toLowerCase());
      }
      case "contains":      return String(v).toLowerCase().includes(String(value).toLowerCase());
      case "isempty":       return v === null || v === undefined || v === "";
      case "isnotempty":    return v !== null && v !== undefined && v !== "";
      default:              return true;
    }
  });
}

// ─── AGGREGATION ──────────────────────────────────────────────────────────────

export function aggregateField(records, field, type) {
  if (!records.length) return 0;
  switch (type) {
    case "count": return records.length;
    case "sum":   return records.reduce((s, r) => s + (parseFloat(r[field]) || 0), 0);
    case "avg": {
      const vals = records.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    }
    case "min": {
      const vals = records.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
      return vals.length ? Math.min(...vals) : 0;
    }
    case "max": {
      const vals = records.map(r => parseFloat(r[field])).filter(v => !isNaN(v));
      return vals.length ? Math.max(...vals) : 0;
    }
    default:    return 0;
  }
}

// ─── KPI VALUE ────────────────────────────────────────────────────────────────
// config: { aggregation, field, filter }

export function computeKpiValue(enriched, config) {
  if (!enriched?.length) return 0;
  const { aggregation, field, filter } = config;
  const records = filter ? applyFilter(enriched, filter) : enriched;
  if (aggregation === "count" || (!field && aggregation !== "count")) return records.length;
  return aggregateField(records, field, aggregation);
}

// ─── KPI FORMATTING ───────────────────────────────────────────────────────────
// format: "number" | "currency" | "percent" | "text"

export function formatKpiValue(value, format, decimals = 0) {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(num) || format === "text") return String(value);
  const opts = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  switch (format) {
    case "currency": return "$" + num.toLocaleString("en-US", opts);
    case "percent":  return num.toLocaleString("en-US", opts) + "%";
    default:         return num.toLocaleString("en-US", opts);
  }
}

// ─── CHART DATA ───────────────────────────────────────────────────────────────
// config: { type, groupField, metrics[], filter, sortDir, maxCategories, stackField }
// metric: { field, aggregation, label, color }

export function computeChartData(records, config) {
  if (!records?.length || !config?.groupField) return [];
  const { groupField, metrics = [], filter, sortDir = "desc", maxCategories, stackField, type } = config;

  const filtered = filter ? applyFilter(records, filter) : records;

  // products is an array field — expand each order into one row per product
  const isArrayField = groupField === "products";

  // ── Stacked bar: two-dimensional grouping ────────────────────────────────
  if (type === "stacked" && stackField) {
    const groups = {};
    const allStackValues = new Set();

    filtered.forEach(r => {
      const gKey = isArrayField
        ? null  // stacked + array field not supported; fall through
        : String(r[groupField] ?? "Unknown");
      const sKey = String(r[stackField] ?? "Unknown");
      allStackValues.add(sKey);
      if (!groups[gKey]) groups[gKey] = {};
      if (!groups[gKey][sKey]) groups[gKey][sKey] = [];
      groups[gKey][sKey].push(r);
    });

    const m0 = metrics[0] || { field: null, aggregation: "count", label: "Count" };
    const result = Object.entries(groups).map(([gKey, stackedGroups]) => {
      const row = { [groupField]: gKey };
      allStackValues.forEach(sv => {
        const subset = stackedGroups[sv] || [];
        row[sv] = m0.field
          ? aggregateField(subset, m0.field, m0.aggregation)
          : subset.length;
      });
      return row;
    });

    const total = row => [...allStackValues].reduce((s, sv) => s + (row[sv] || 0), 0);
    result.sort((a, b) => sortDir === "asc" ? total(a) - total(b) : total(b) - total(a));
    return maxCategories ? result.slice(0, maxCategories) : result;
  }

  // ── All other chart types ─────────────────────────────────────────────────
  let working = filtered;
  if (isArrayField) {
    working = filtered.flatMap(o =>
      (o.products || []).map(p => ({ ...o, _expandedKey: p }))
    );
  }

  const groups = {};
  working.forEach(r => {
    const key = isArrayField ? r._expandedKey : String(r[groupField] ?? "Unknown");
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const result = Object.entries(groups).map(([key, grp]) => {
    const row = { [groupField]: key };

    // For donut, produce a single "value" key
    if (type === "donut") {
      const m = metrics[0] || { field: null, aggregation: "count" };
      const countVal = isArrayField
        ? new Set(grp.map(r => r.orderNum)).size
        : grp.length;
      row.value = m.field ? aggregateField(grp, m.field, m.aggregation) : countVal;
      return row;
    }

    metrics.forEach(m => {
      const lbl = m.label || m.field || "value";
      if (!m.field || m.aggregation === "count") {
        row[lbl] = isArrayField
          ? new Set(grp.map(r => r.orderNum)).size
          : grp.length;
      } else {
        row[lbl] = aggregateField(grp, m.field, m.aggregation);
      }
    });
    return row;
  });

  // Sort by first metric value
  const primaryKey = type === "donut"
    ? "value"
    : (metrics[0]?.label || metrics[0]?.field || "value");
  result.sort((a, b) =>
    sortDir === "asc"
      ? (a[primaryKey] ?? 0) - (b[primaryKey] ?? 0)
      : (b[primaryKey] ?? 0) - (a[primaryKey] ?? 0)
  );

  return maxCategories ? result.slice(0, maxCategories) : result;
}

// ─── MISC ─────────────────────────────────────────────────────────────────────

export function genId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function truncateLabel(str, max = 16) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}
