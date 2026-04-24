const BRAND_PREFIX_MAP = {
  MCDS:  "McDonald's",
  CFA:   "Chick-fil-A",
  SBUX:  "Starbucks",
  MUNIC: "Municipal",
  ADN:   "ADN",
  "ADN-O": "ADN",
};

export function extractQBUrl(html) {
  if (!html) return null;
  const match = String(html).match(/href=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export function stripHtml(str) {
  if (!str) return "";
  return String(str).replace(/<[^>]*>/g, "").trim();
}

function extractPMName(str) {
  return stripHtml(str || "").split(" <")[0].trim();
}

export function parseCurrency(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[$,\s]/g, "")) || 0;
}

function extractBrand(orderName) {
  const prefix = (orderName || "").split("-")[0].trim().toUpperCase();
  return BRAND_PREFIX_MAP[prefix] || prefix;
}

function extractLocation(orderName) {
  const parts = (orderName || "").split("-");
  return parts.length >= 4 ? parts[3].trim() : "";
}

function warrantyEndFromDates(installDate, shippingDate) {
  const base = installDate || shippingDate;
  if (!base) return null;
  const d = new Date(base);
  if (isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

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

  return data.map(record => {
    const qbRid = String(record[recordIdField]?.value || "");
    const rawOrderNumHtml = String(get(record, "Order Number w/Series") || "");
    const qbUrl = extractQBUrl(rawOrderNumHtml);
    const rawOrderNum = stripHtml(rawOrderNumHtml);
    const orderNumMatch = rawOrderNum.match(/\d{4,}/);
    const orderNum = orderNumMatch ? orderNumMatch[0] : rawOrderNum;

    const rawName = stripHtml(get(record, "Order Name (Formula)") || "");
    const brand = extractBrand(rawName);
    const location = extractLocation(rawName);
    const customer = rawName.split(",")[0].trim() || rawName.split("-").slice(0, 2).join(" - ").trim();

    const pm = extractPMName(get(record, "Project Manager") || "");
    const rawProducts = get(record, "Product Scope") || "";
    const products = rawProducts ? String(rawProducts).split(";").map(p => p.trim()).filter(Boolean) : [];

    const colors = stripHtml(get(record, "NEW Final Color Approval") || "");
    const claims = parseInt(get(record, "# of Warranty Claims")) || 0;
    const qcPeeling = parseInt(get(record, "# of QC Entries for Peeling Powder")) || 0;
    const qcPowder = parseInt(get(record, "# of QC Entries for Powder Failure")) || 0;
    const orderValue = parseCurrency(get(record, "Order Posted $"));

    const warrantyEnd = warrantyEndFromDates(
      get(record, "Installation Complete Date"),
      get(record, "Shipping Complete Date")
    );

    return { orderNum, qbRid, qbUrl, brand, location, customer, pm, warrantyEnd, products, colors, claims, qcPeeling, qcPowder, orderValue };
  }).filter(o => o.warrantyEnd && o.orderNum);
}

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
    else result[orderNum].closed++;
    result[orderNum].totalCost += cost;
  });
  return result;
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
  if (d > 90) return "active";
  if (d > 0) return "expiring";
  return "expired";
}

export function fmtCurrency(v) {
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(s) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${m}-${d}-${y.slice(2)}`;
}

export function computeRiskScore(o) {
  return Math.min(100,
    (o.claims * 24) +
    (o.qcPeeling * 15) +
    (o.qcPowder * 10) +
    (o.status === "expired" ? 18 : 0) +
    (o.status === "expiring" ? 8 : 0)
  );
}

export function riskLevel(score) {
  if (score >= 70) return "critical";
  if (score >= 45) return "high";
  if (score >= 20) return "medium";
  return "low";
}

export function applyFilter(enriched, filters) {
  const { search, pmFilter, statusFilter, brandFilter, riskFilter, sortCol, sortDir } = filters;
  const q = search.toLowerCase();
  return enriched
    .filter(o => {
      if (q && !o.customer.toLowerCase().includes(q) && !o.orderNum.includes(q) && !o.location.toLowerCase().includes(q)) return false;
      if (pmFilter !== "all" && o.pm !== pmFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (brandFilter !== "all" && o.brand !== brandFilter) return false;
      if (riskFilter === "atrisk") { if (o.claims > 0 || (o.qcPeeling === 0 && o.qcPowder === 0)) return false; }
      else if (riskFilter !== "all" && o.risk !== riskFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
      return sortDir === "asc" ? cmp : -cmp;
    });
}

export function aggregateField(data, field) {
  return data.reduce((s, o) => s + (typeof field === "function" ? field(o) : (o[field] || 0)), 0);
}

export function computeKpiValue(enriched) {
  const active = enriched.filter(o => o.status === "active");
  const expiring = enriched.filter(o => o.status === "expiring");
  const expired = enriched.filter(o => o.status === "expired");
  const underWarranty = [...active, ...expiring];
  return {
    active: active.length,
    expiring: expiring.length,
    expired: expired.length,
    underWarranty: underWarranty.length,
    warrantyValue: aggregateField(underWarranty, "orderValue"),
    activeValue: aggregateField(active, "orderValue"),
    totalValue: aggregateField(enriched, "orderValue"),
    openClaims: aggregateField(enriched, "openClaims"),
    closedClaims: aggregateField(enriched, "closedClaims"),
    totalClaims: aggregateField(enriched, "claims"),
    totalClaimCost: aggregateField(enriched, "claimCost"),
    hasCostData: enriched.some(o => o.claimCost > 0),
    criticalRisk: enriched.filter(o => o.risk === "critical").length,
    highRisk: enriched.filter(o => o.risk === "high").length,
    atRisk: enriched.filter(o => o.claims === 0 && (o.qcPeeling > 0 || o.qcPowder > 0)).length,
  };
}

export function computeChartData(enriched, kpis) {
  const brandMap = {};
  const pmMap = {};
  const productMap = {};
  const abbr = {
    "Colorado Canopy": "CC Standard",
    "Colorado Canopy w/ Lights": "CC w/ Lights",
    "Colorado Canopy 2.0": "CC 2.0",
    "Phoenix System": "Phoenix",
    "IWP Soffit/Decking": "IWP Soffit",
    "IWP SOFFIT/DECKING": "IWP Soffit",
    "Fabric Awnings": "Fabric Awnings",
    "Downspouts": "Downspouts",
  };

  enriched.forEach(o => {
    if (!brandMap[o.brand]) brandMap[o.brand] = { brand: o.brand, orders: 0, openClaims: 0, closedClaims: 0 };
    brandMap[o.brand].orders++;
    brandMap[o.brand].openClaims += o.openClaims;
    brandMap[o.brand].closedClaims += o.closedClaims;

    if (!pmMap[o.pm]) pmMap[o.pm] = { pm: o.pm, claims: 0, orders: 0 };
    pmMap[o.pm].claims += o.claims;
    pmMap[o.pm].orders++;

    o.products.forEach(p => {
      const key = abbr[p] || p;
      if (!productMap[key]) productMap[key] = { product: key, full: p, count: 0, claims: 0 };
      productMap[key].count++;
      productMap[key].claims += o.claims;
    });
  });

  return {
    brandChartData: Object.values(brandMap).sort((a, b) => b.orders - a.orders),
    statusChartData: [
      { name: "Active", value: kpis.active, color: "#97C459" },
      { name: "Expiring", value: kpis.expiring, color: "#FAD07A" },
      { name: "Expired", value: kpis.expired, color: "#F09595" },
    ].filter(d => d.value > 0),
    pmChartData: Object.values(pmMap).sort((a, b) => b.orders - a.orders),
    productChartData: Object.values(productMap).sort((a, b) => b.claims - a.claims),
  };
}

export function formatKpiValue(value, kind = "number") {
  return kind === "currency" ? fmtCurrency(value) : value;
}
