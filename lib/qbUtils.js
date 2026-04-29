// ─── QB UTILITIES ─────────────────────────────────────────────────────────────
// Reusable helpers for parsing Quickbase API responses.
// Any QB-connected Awntrak module can import from here.

// ─── STRING / HTML HELPERS ────────────────────────────────────────────────────

export function stripHtml(str) {
  if (!str) return "";
  return String(str).replace(/<[^>]*>/g, "").trim();
}

// Extracts href from an HTML anchor string returned by QB URL fields
export function extractQBUrl(html) {
  if (!html) return null;
  const m = String(html).match(/href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// "Betty Burford <63060485.ed38>" → "Betty Burford"
// Also handles QB user objects: { id: "...", name: "Betty Burford" }
export function extractPMName(str) {
  if (!str) return "";
  if (typeof str === "object") return String(str.name || str.userName || str.email || "").trim();
  return stripHtml(String(str)).split(" <")[0].trim();
}

export function parseCurrency(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[$,\s]/g, "")) || 0;
}

// ─── ORDER NAME PARSING ───────────────────────────────────────────────────────

const BRAND_PREFIX_MAP = {
  "MCDS":  "McDonald's",
  "CFA":   "Chick-fil-A",
  "SBUX":  "Starbucks",
  "MUNIC": "Municipal",
  "ADN":   "ADN",
  "ADN-O": "ADN",
};

export function extractBrand(orderName) {
  const prefix = (orderName || "").split("-")[0].trim().toUpperCase();
  return BRAND_PREFIX_MAP[prefix] || prefix;
}

// "BRAND-CustomerName-ID-City State-Address" → "City State"
export function extractLocation(orderName) {
  const parts = (orderName || "").split("-");
  return parts.length >= 4 ? parts[3].trim() : "";
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

export function warrantyEndFromDates(installDate, shippingDate) {
  const base = installDate || shippingDate;
  if (!base) return null;
  const d = new Date(base);
  if (isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

export function daysFromToday(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  if (isNaN(end.getTime())) return null;
  end.setHours(0, 0, 0, 0);
  return Math.round((end - today) / 86400000);
}

export function warrantyStatus(dateStr) {
  if (!dateStr) return "active";
  const d = daysFromToday(dateStr);
  if (d === null) return "active";
  if (d > 90)  return "active";
  if (d > 0)   return "expiring";
  return "expired";
}

// ─── FORMATTING ───────────────────────────────────────────────────────────────

export function fmtCurrency(v) {
  return "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(s) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${m}-${d}-${y.slice(2)}`;
}

// ─── RISK SCORING ─────────────────────────────────────────────────────────────
// Claims (≤50 pts) are the primary signal. QC entries (≤30 pts) are leading
// indicators. Expiring warranty adds urgency (+15). Silent risk (QC flags with
// no filed claim yet) adds +12. High-value orders add +5.

export function computeRiskScore(o) {
  let s = 0;
  s += Math.min(o.claims * 25, 50);
  s += Math.min((o.qcPeeling + o.qcPowder) * 7, 30);
  if (o.status === "expiring") s += 15;
  if (o.claims === 0 && (o.qcPeeling > 0 || o.qcPowder > 0)) s += 12;
  if (o.orderValue >= 50000) s += 5;
  return Math.min(Math.round(s), 100);
}

export function riskLevel(score) {
  if (score >= 60) return "critical";
  if (score >= 35) return "high";
  if (score >= 15) return "medium";
  return "low";
}

// ─── QB RESPONSE MAPPERS ─────────────────────────────────────────────────────

// Maps a QB Report Run payload ({ fields, data }) to typed order objects.
// Also stores all raw QB field values in _qbFields so extra report columns
// remain accessible to the configurable KPI/chart system.
export function mapQBResponse({ data, fields }) {
  const labelToId = {};
  let recordIdField = 3;
  fields.forEach(f => {
    labelToId[f.label] = f.id;
    if (f.type === "recordid") recordIdField = f.id;
  });

  function get(record, label) {
    const id = labelToId[label];
    if (!id || record[id] === undefined) return null;
    return record[id].value;
  }

  // Labels already mapped to named fields — don't double-expose them
  const KNOWN_LABELS = new Set([
    "Order Number w/Series", "Order Name (Formula)", "Project Manager",
    "Product Scope", "NEW Final Color Approval", "# of Warranty Claims",
    "# of QC Entries for Peeling Powder", "# of QC Entries for Powder Failure",
    "Order Posted $", "Installation Complete Date", "Shipping Complete Date",
  ]);

  return data.map((record, idx) => {
    const qbRid = String(record[recordIdField]?.value || "");

    const rawOrderNumHtml = String(get(record, "Order Number w/Series") || "");
    const qbUrl    = extractQBUrl(rawOrderNumHtml);
    const rawOrderNum = stripHtml(rawOrderNumHtml);
    const orderNumMatch = rawOrderNum.match(/\d{4,}/);
    const orderNum = orderNumMatch ? orderNumMatch[0] : rawOrderNum;

    const rawName  = stripHtml(get(record, "Order Name (Formula)") || "");
    const brand    = extractBrand(rawName);
    const location = extractLocation(rawName);
    const customer = rawName.split(",")[0].trim() || rawName.split("-").slice(0, 2).join(" - ").trim();

    const pm       = extractPMName(get(record, "Project Manager") || "");

    const rawProducts = get(record, "Product Scope") || "";
    const products = rawProducts
      ? String(rawProducts).split(";").map(p => p.trim()).filter(Boolean)
      : [];

    const colors     = stripHtml(get(record, "NEW Final Color Approval") || "");
    const claims     = parseInt(get(record, "# of Warranty Claims"))               || 0;
    const qcPeeling  = parseInt(get(record, "# of QC Entries for Peeling Powder")) || 0;
    const qcPowder   = parseInt(get(record, "# of QC Entries for Powder Failure")) || 0;
    const orderValue = parseCurrency(get(record, "Order Posted $"));

    const warrantyEnd = warrantyEndFromDates(
      get(record, "Installation Complete Date"),
      get(record, "Shipping Complete Date"),
    );

    // Capture any extra QB fields not explicitly mapped above
    const _qbFields = {};
    fields.forEach(f => {
      if (!KNOWN_LABELS.has(f.label) && f.type !== "recordid" && record[f.id] !== undefined) {
        _qbFields[f.label] = record[f.id].value;
      }
    });

    const qbValues = {};
    fields.forEach(f => {
      if (f.type === "recordid") return;
      qbValues[`qb_${f.id}`] = record[f.id]?.value ?? null;
    });

    return {
      orderNum, qbRid, qbUrl, brand, location, customer, pm,
      warrantyEnd, products, colors, claims, qcPeeling, qcPowder,
      orderValue, _qbFields,
      _rowId: qbRid || String(idx + 1),
      ...qbValues,
    };
  });
}

// Maps a QB claims/costs table response to a lookup keyed by order number.
export function mapClaimsResponse({ data, fields }, fieldMap = {}) {
  const fm = { orderNum: "Order Number", status: "Status", cost: "Repair Cost", ...fieldMap };
  const labelToId = {};
  fields.forEach(f => { labelToId[f.label] = f.id; });
  function get(record, label) {
    const id = labelToId[label];
    return id && record[id] !== undefined ? record[id].value : null;
  }
  const result = {};
  data.forEach(record => {
    const raw = stripHtml(String(get(record, fm.orderNum) || ""));
    const m = raw.match(/\d{4,}/);
    const orderNum = m ? m[0] : raw;
    if (!orderNum) return;
    const statusRaw = String(get(record, fm.status) || "").toLowerCase();
    const isOpen = /open|pending|active|in.?progress/.test(statusRaw);
    const cost = parseCurrency(get(record, fm.cost) || 0);
    if (!result[orderNum]) result[orderNum] = { open: 0, closed: 0, totalCost: 0 };
    if (isOpen) result[orderNum].open++;
    else        result[orderNum].closed++;
    result[orderNum].totalCost += cost;
  });
  return result;
}

// ─── COLUMN SPEC BUILDER ──────────────────────────────────────────────────────
// Maps known QB report field labels → one or more typed column specs for the
// order detail table.  Unknown QB fields become plain-text columns appended in
// report order.  The QB link button is always appended last.

const QB_LABEL_COLS = {
  "Order Number w/Series": [
    { id: "col_orderNum",   renderAs: "orderNum",   key: "orderNum",   defaultTitle: "Order Number w/Series", sortable: true  },
  ],
  "Order Name (Formula)": [
    { id: "col_customer",   renderAs: "customer",   key: "customer",   defaultTitle: "Customer",              sortable: true  },
    { id: "col_location",   renderAs: "location",   key: "location",   defaultTitle: "Location",              sortable: true  },
  ],
  "Project Manager": [
    { id: "col_pm",         renderAs: "pm",         key: "pm",         defaultTitle: "Project Manager",       sortable: true  },
  ],
  "# of Warranty Claims": [
    { id: "col_claims",     renderAs: "claims",     key: "claims",     defaultTitle: "# of Warranty Claims",  sortable: true  },
    { id: "col_risk",       renderAs: "risk",       key: "riskScore",  defaultTitle: "Risk",                  sortable: true  },
  ],
  "# of QC Entries for Peeling Powder": [
    { id: "col_qcPeeling",  renderAs: "qcPeeling",  key: "qcPeeling",  defaultTitle: "# of QC Entries for Peeling Powder", sortable: true },
  ],
  "# of QC Entries for Powder Failure": [
    { id: "col_qcPowder",   renderAs: "qcPowder",   key: "qcPowder",   defaultTitle: "# of QC Entries for Powder Failure",  sortable: true },
  ],
  "Order Posted $": [
    { id: "col_orderValue", renderAs: "orderValue", key: "orderValue", defaultTitle: "Order Posted $",        sortable: true  },
  ],
  "Installation Complete Date": [
    { id: "col_expires",    renderAs: "expires",    key: "warrantyEnd",defaultTitle: "Expires",               sortable: true  },
    { id: "col_status",     renderAs: "status",     key: "status",     defaultTitle: "Warranty",              sortable: true  },
  ],
  "Shipping Complete Date":   [],  // merged into warrantyEnd computation
  "Product Scope": [
    { id: "col_products",   renderAs: "products",   key: "products",   defaultTitle: "Products",              sortable: false },
  ],
  "NEW Final Color Approval": [],  // shown in expanded row only
};

export const DEFAULT_COLUMN_SPECS = [
  { id: "col_orderNum",   renderAs: "orderNum",   key: "orderNum",    defaultTitle: "Order #",         title: "Order #",         sortable: true,  qbId: null },
  { id: "col_customer",   renderAs: "customer",   key: "customer",    defaultTitle: "Customer",        title: "Customer",        sortable: true,  qbId: null },
  { id: "col_location",   renderAs: "location",   key: "location",    defaultTitle: "Location",        title: "Location",        sortable: true,  qbId: null },
  { id: "col_pm",         renderAs: "pm",         key: "pm",          defaultTitle: "Project Manager", title: "Project Manager", sortable: true,  qbId: null },
  { id: "col_risk",       renderAs: "risk",       key: "riskScore",   defaultTitle: "Risk",            title: "Risk",            sortable: true,  qbId: null },
  { id: "col_status",     renderAs: "status",     key: "status",      defaultTitle: "Warranty",        title: "Warranty",        sortable: true,  qbId: null },
  { id: "col_expires",    renderAs: "expires",    key: "warrantyEnd", defaultTitle: "Expires",         title: "Expires",         sortable: true,  qbId: null },
  { id: "col_claims",     renderAs: "claims",     key: "claims",      defaultTitle: "Claims",          title: "Claims",          sortable: true,  qbId: null },
  { id: "col_qcPeeling",  renderAs: "qcPeeling",  key: "qcPeeling",   defaultTitle: "QC Peeling",      title: "QC Peeling",      sortable: true,  qbId: null },
  { id: "col_qcPowder",   renderAs: "qcPowder",   key: "qcPowder",    defaultTitle: "QC Powder",       title: "QC Powder",       sortable: true,  qbId: null },
  { id: "col_orderValue", renderAs: "orderValue", key: "orderValue",  defaultTitle: "Order Value",     title: "Order Value",     sortable: true,  qbId: null },
  { id: "col_products",   renderAs: "products",   key: "products",    defaultTitle: "Products",        title: "Products",        sortable: false, qbId: null },
  { id: "col_qbLink",     renderAs: "qbLink",     key: "qbUrl",       defaultTitle: "QB",              title: "QB",              sortable: false, qbId: null },
];

// Builds column specs from the QB report field list (preserving QB column order).
// customTitles: { [colId]: string } — user-saved title overrides from localStorage.
// Falls back to DEFAULT_COLUMN_SPECS when qbReportFields is empty.
export function buildColumnSpecs(qbReportFields = [], customTitles = {}) {
  if (!qbReportFields.length) {
    return DEFAULT_COLUMN_SPECS.map(s => ({
      ...s,
      title: customTitles[s.id] ?? s.defaultTitle,
    }));
  }

  const seenIds = new Set();
  const cols = [];

  for (const f of qbReportFields) {
    const mapped = QB_LABEL_COLS[f.label];
    if (mapped !== undefined) {
      for (const spec of mapped) {
        if (seenIds.has(spec.id)) continue;
        seenIds.add(spec.id);
        cols.push({ ...spec, qbId: f.qbId, title: customTitles[spec.id] ?? spec.defaultTitle });
      }
    } else {
      const id = `col_qb_${f.qbId}`;
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      cols.push({
        id,
        qbId:         f.qbId,
        renderAs:     "qbField",
        key:          f.label,
        defaultTitle: f.label,
        title:        customTitles[id] ?? f.label,
        sortable:     true,
      });
    }
  }

  cols.push({
    id: "col_qbLink", qbId: null, renderAs: "qbLink", key: "qbUrl",
    defaultTitle: "QB", title: customTitles["col_qbLink"] ?? "QB", sortable: false,
  });

  return cols;
}

// Returns the QB fields array from a report payload, normalised for the
// configurable field picker: { key, label, type, source }
export function buildReportFields(fields = []) {
  const QB_TYPE_MAP = {
    numeric: "number", currency: "currency", date: "date", datetime: "date",
    percent: "number", rating: "number", duration: "number",
    text: "text", multitext: "text", checkbox: "text", user: "text",
    multiuser: "text", url: "text", phone: "text", email: "text",
    formula: "text",
  };
  return fields
    .filter(f => f.type !== "recordid")
    .map(f => ({
      key:    `qb_${f.id}`,
      label:  f.label,
      type:   QB_TYPE_MAP[f.type] || "text",
      source: "qb",
      qbId:   f.id,
    }));
}
