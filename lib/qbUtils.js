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
//
// Field labels are matched case-insensitively against a list of common
// variations so reports for different product lines (warranty, QC, etc.)
// can drive the same dashboard without code changes.
export function mapQBResponse({ data, fields }) {
  const labelToId = {};
  const lowerLabelToId = {};
  let recordIdField = 3;
  fields.forEach(f => {
    labelToId[f.label] = f.id;
    lowerLabelToId[String(f.label).toLowerCase().trim()] = f.id;
    if (f.type === "recordid") recordIdField = f.id;
  });

  function get(record, label) {
    const id = labelToId[label] ?? lowerLabelToId[String(label).toLowerCase().trim()];
    if (!id || record[id] === undefined) return null;
    return record[id].value;
  }

  // Returns the first non-empty value found among the supplied label variants.
  // Also returns the resolved label so it can be excluded from _qbFields.
  function findValue(record, labels) {
    for (const label of labels) {
      const id = labelToId[label] ?? lowerLabelToId[String(label).toLowerCase().trim()];
      if (!id) continue;
      const v = record[id]?.value;
      if (v !== undefined && v !== null && v !== "") return { value: v, label };
    }
    return { value: null, label: null };
  }

  const ORDER_NUM_LABELS    = ["Order Number w/Series", "Order Number", "Order #", "Order No", "Order No.", "Order ID"];
  const ORDER_NAME_LABELS   = ["Order Name (Formula)", "Order Name Formula", "Order Name"];
  const PM_LABELS           = ["Project Manager", "PM", "Manager", "Install By", "Installer"];
  const PRODUCT_LABELS      = ["Product Scope", "Products", "Product"];
  const COLOR_LABELS        = ["NEW Final Color Approval", "Final Color Approval", "Color"];
  const CLAIMS_LABELS       = ["# of Warranty Claims", "Warranty Claims", "Claims"];
  const QC_PEELING_LABELS   = ["# of QC Entries for Peeling Powder", "QC Peeling", "Peeling Powder"];
  const QC_POWDER_LABELS    = ["# of QC Entries for Powder Failure", "QC Powder Failure", "Powder Failure"];
  const ORDER_VALUE_LABELS  = ["Order Posted $", "Order Value", "Contract Amount", "Total"];
  const INSTALL_DATE_LABELS = ["Installation Complete Date", "Install Complete Date", "Install Complete", "Install Date", "Installation Date"];
  const SHIP_DATE_LABELS    = ["Shipping Complete Date", "Ship Complete Date", "Shipping Date", "Ship Date"];

  return data.map(record => {
    const qbRid = String(record[recordIdField]?.value || "");

    const consumedLabels = new Set();

    const orderNumField = findValue(record, ORDER_NUM_LABELS);
    if (orderNumField.label) consumedLabels.add(orderNumField.label);
    const rawOrderNumHtml = String(orderNumField.value || "");
    const qbUrl       = extractQBUrl(rawOrderNumHtml);
    const rawOrderNum = stripHtml(rawOrderNumHtml);
    const orderNumMatch = rawOrderNum.match(/\d{4,}/);
    const orderNum = orderNumMatch ? orderNumMatch[0] : (rawOrderNum || qbRid);

    const orderNameField = findValue(record, ORDER_NAME_LABELS);
    if (orderNameField.label) consumedLabels.add(orderNameField.label);
    const rawName  = stripHtml(String(orderNameField.value || ""));
    const brand    = extractBrand(rawName);
    const location = extractLocation(rawName);
    const customer = rawName.split(",")[0].trim() || rawName.split("-").slice(0, 2).join(" - ").trim();

    const pmField = findValue(record, PM_LABELS);
    if (pmField.label) consumedLabels.add(pmField.label);
    const pm = extractPMName(pmField.value || "");

    const productsField = findValue(record, PRODUCT_LABELS);
    if (productsField.label) consumedLabels.add(productsField.label);
    const rawProducts = productsField.value || "";
    const products = rawProducts
      ? String(rawProducts).split(";").map(p => p.trim()).filter(Boolean)
      : [];

    const colorField = findValue(record, COLOR_LABELS);
    if (colorField.label) consumedLabels.add(colorField.label);
    const colors = stripHtml(String(colorField.value || ""));

    const claimsField = findValue(record, CLAIMS_LABELS);
    if (claimsField.label) consumedLabels.add(claimsField.label);
    const claims = parseInt(claimsField.value) || 0;

    const qcPeelingField = findValue(record, QC_PEELING_LABELS);
    if (qcPeelingField.label) consumedLabels.add(qcPeelingField.label);
    const qcPeeling = parseInt(qcPeelingField.value) || 0;

    const qcPowderField = findValue(record, QC_POWDER_LABELS);
    if (qcPowderField.label) consumedLabels.add(qcPowderField.label);
    const qcPowder = parseInt(qcPowderField.value) || 0;

    const orderValueField = findValue(record, ORDER_VALUE_LABELS);
    if (orderValueField.label) consumedLabels.add(orderValueField.label);
    const orderValue = parseCurrency(orderValueField.value);

    const installDateField = findValue(record, INSTALL_DATE_LABELS);
    if (installDateField.label) consumedLabels.add(installDateField.label);
    const shipDateField = findValue(record, SHIP_DATE_LABELS);
    if (shipDateField.label) consumedLabels.add(shipDateField.label);
    const warrantyEnd = warrantyEndFromDates(installDateField.value, shipDateField.value);

    // Capture every other QB field so the configurable KPI/chart/column system
    // can use them — even fields we don't recognize.
    const _qbFields = {};
    fields.forEach(f => {
      if (consumedLabels.has(f.label)) return;
      if (f.type === "recordid") return;
      if (record[f.id] !== undefined) _qbFields[f.label] = record[f.id].value;
    });

    return {
      orderNum, qbRid, qbUrl, brand, location, customer, pm,
      warrantyEnd, products, colors, claims, qcPeeling, qcPowder,
      orderValue, _qbFields,
    };
  }).filter(o => o.qbRid || o.orderNum);
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

// Each entry maps one or more alternate QB field labels (case-insensitive) to
// the typed column specs they should produce. The first label is canonical.
const QB_LABEL_COL_GROUPS = [
  {
    labels: ["Order Number w/Series", "Order Number", "Order #", "Order No", "Order No.", "Order ID"],
    cols: [{ id: "col_orderNum", renderAs: "orderNum", key: "orderNum", defaultTitle: "Order #", sortable: true }],
  },
  {
    labels: ["Order Name (Formula)", "Order Name Formula", "Order Name"],
    cols: [
      { id: "col_customer", renderAs: "customer", key: "customer", defaultTitle: "Customer", sortable: true },
      { id: "col_location", renderAs: "location", key: "location", defaultTitle: "Location", sortable: true },
    ],
  },
  {
    labels: ["Project Manager", "PM", "Manager", "Install By", "Installer"],
    cols: [{ id: "col_pm", renderAs: "pm", key: "pm", defaultTitle: "Project Manager", sortable: true }],
  },
  {
    labels: ["# of Warranty Claims", "Warranty Claims", "Claims"],
    cols: [
      { id: "col_claims", renderAs: "claims", key: "claims", defaultTitle: "Claims", sortable: true },
      { id: "col_risk",   renderAs: "risk",   key: "riskScore", defaultTitle: "Risk", sortable: true },
    ],
  },
  {
    labels: ["# of QC Entries for Peeling Powder", "QC Peeling", "Peeling Powder"],
    cols: [{ id: "col_qcPeeling", renderAs: "qcPeeling", key: "qcPeeling", defaultTitle: "QC Peeling", sortable: true }],
  },
  {
    labels: ["# of QC Entries for Powder Failure", "QC Powder Failure", "Powder Failure"],
    cols: [{ id: "col_qcPowder", renderAs: "qcPowder", key: "qcPowder", defaultTitle: "QC Powder", sortable: true }],
  },
  {
    labels: ["Order Posted $", "Order Value", "Contract Amount", "Total"],
    cols: [{ id: "col_orderValue", renderAs: "orderValue", key: "orderValue", defaultTitle: "Order Value", sortable: true }],
  },
  {
    labels: ["Installation Complete Date", "Install Complete Date", "Install Complete", "Install Date", "Installation Date"],
    cols: [
      { id: "col_expires", renderAs: "expires", key: "warrantyEnd", defaultTitle: "Expires",  sortable: true },
      { id: "col_status",  renderAs: "status",  key: "status",      defaultTitle: "Warranty", sortable: true },
    ],
  },
  // Shipping date is merged into warrantyEnd; suppress its raw column.
  { labels: ["Shipping Complete Date", "Ship Complete Date", "Shipping Date", "Ship Date"], cols: [] },
  {
    labels: ["Product Scope", "Products", "Product"],
    cols: [{ id: "col_products", renderAs: "products", key: "products", defaultTitle: "Products", sortable: false }],
  },
  // Color approval is shown in the expanded row only; suppress its raw column.
  { labels: ["NEW Final Color Approval", "Final Color Approval", "Color"], cols: [] },
];

// Lower-cased label → cols lookup (built once at module load).
const QB_LABEL_COLS_LOOKUP = (() => {
  const m = {};
  for (const g of QB_LABEL_COL_GROUPS) {
    for (const lbl of g.labels) m[lbl.toLowerCase().trim()] = g.cols;
  }
  return m;
})();

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
    const mapped = QB_LABEL_COLS_LOOKUP[String(f.label).toLowerCase().trim()];
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
