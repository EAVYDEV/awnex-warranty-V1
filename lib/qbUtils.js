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
export function extractPMName(str) {
  return stripHtml(str || "").split(" <")[0].trim();
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(0, 0, 0, 0);
  return Math.round((end - today) / 86400000);
}

export function warrantyStatus(dateStr) {
  const d = daysFromToday(dateStr);
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

  return data.map(record => {
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

    return {
      orderNum, qbRid, qbUrl, brand, location, customer, pm,
      warrantyEnd, products, colors, claims, qcPeeling, qcPowder,
      orderValue, _qbFields,
    };
  }).filter(o => o.warrantyEnd && o.orderNum);
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
