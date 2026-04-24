import { useState, useMemo, useEffect, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

import { T, CHART_PALETTE } from "./lib/dashboardDefaults";
import {
  mapQBResponse,
  mapClaimsResponse,
  daysFromToday,
  warrantyStatus,
  fmtCurrency,
  fmtDate,
  computeRiskScore,
  riskLevel,
  applyFilter,
  computeKpiValue,
  computeChartData,
} from "./lib/dashboardMetrics";
import { loadDashboardConfig } from "./lib/dashboardStorage";
import { KpiCard } from "./components/KpiCard";
import { StatusBadge, ProductTag, RiskBadge } from "./components/StatusBadge";
import { SettingsModal } from "./components/SettingsModal";
import { EmptyState, LoadingState, ErrorState } from "./components/StateScreens";
import { MapView } from "./components/MapView";
import { ChartCard, CustomTooltip } from "./components/ChartCard";

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
  return <span style={{ marginLeft: 4, color: T.brand }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
}

function AwnexLogo({ height = 44 }) {
  const [logoSrc, setLogoSrc] = useState("/logo.png");

  return (
    <img
      src={logoSrc}
      alt="Awntrak Logo"
      style={{ height, width: "auto", objectFit: "contain", display: "block", marginRight: 10 }}
      onError={(e) => {
        if (logoSrc !== "/awnex-logo-no-tag.png") {
          setLogoSrc("/awnex-logo-no-tag.png");
        } else {
          e.currentTarget.style.display = "none";
        }
      }}
    />
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
// Props:
//   apiRoute  - Single QB orders API route (default: "/api/warranty-orders")
//   orders    - Pre-loaded orders array - skips all fetching. Great for previews.
//   sources   - Multi-source array for connecting multiple QB tables:
//               [{ id, route, role: "orders"|"claims"|"costs", fieldMap?, label? }]
//               When provided, apiRoute is ignored. Sources are fetched in parallel
//               and merged by order number.
export function WarrantyDashboard({ apiRoute = "/api/warranty-orders", orders: ordersProp = null, sources = null }) {
  // Settings state - tableId and reportId are stored in localStorage and passed as query params
  const [settings, setSettings]         = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setSettings(loadDashboardConfig());
  }, []);

  // Data + fetch state
  const [orders, setOrders]       = useState(ordersProp ?? []);
  const [loadState, setLoadState] = useState(ordersProp ? "loaded" : "loading");
  const [errorMsg, setErrorMsg]   = useState("");
  const [sourceStatuses, setSourceStatuses] = useState({}); // { [sourceId]: "loading"|"ok"|"error" }

  const fetchData = useCallback(async () => {
    setLoadState("loading");
    try {
      // Append tableId and reportId as query params if provided via settings modal
      function withSettings(route) {
        if (!settings.tableId || !settings.reportId) return route;
        const sep = route.includes("?") ? "&" : "?";
        return `${route}${sep}tableId=${encodeURIComponent(settings.tableId)}&reportId=${encodeURIComponent(settings.reportId)}`;
      }

      // Build the list of sources to fetch
      const targets = (sources ?? [{ id: "orders", route: apiRoute, role: "orders" }])
        .map(s => ({ ...s, route: withSettings(s.route) }));
      const statuses = {};
      targets.forEach(s => { statuses[s.id] = "loading"; });
      setSourceStatuses({ ...statuses });

      const results = await Promise.all(targets.map(async s => {
        try {
          const res = await fetch(s.route);
          const ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) {
            throw new Error(`${s.route} returned non-JSON (${res.status}). Is the API route running?`);
          }
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || `${s.route} returned ${res.status}`);
          statuses[s.id] = "ok";
          return { ...s, payload: json, error: null };
        } catch (err) {
          statuses[s.id] = "error";
          return { ...s, payload: null, error: err.message };
        }
      }));
      setSourceStatuses({ ...statuses });

      // Require the orders source to succeed
      const ordersResult = results.find(r => r.role === "orders");
      if (!ordersResult || ordersResult.error) {
        throw new Error(ordersResult?.error || "No orders source configured.");
      }

      let mapped = mapQBResponse(ordersResult.payload);

      // Merge claims source if available
      const claimsResult = results.find(r => r.role === "claims" && !r.error);
      if (claimsResult) {
        const claimsMap = mapClaimsResponse(claimsResult.payload, claimsResult.fieldMap);
        mapped = mapped.map(o => {
          const cm = claimsMap[o.orderNum] || { open: 0, closed: 0, totalCost: 0 };
          return { ...o, openClaims: cm.open, closedClaims: cm.closed, claimCost: cm.totalCost };
        });
      }

      // Merge costs source if separate from claims
      const costsResult = results.find(r => r.role === "costs" && !r.error);
      if (costsResult) {
        const costsMap = mapClaimsResponse(costsResult.payload, { cost: "Total Cost", ...costsResult.fieldMap });
        mapped = mapped.map(o => {
          const cm = costsMap[o.orderNum];
          return { ...o, claimCost: (o.claimCost || 0) + (cm?.totalCost || 0) };
        });
      }

      setOrders(mapped);
      setLoadState("loaded");
    } catch (err) {
      setErrorMsg(err.message);
      setLoadState("error");
    }
  }, [sources, apiRoute, settings]);

  useEffect(() => {
    if (ordersProp) return;
    // Only fetch if we have settings configured, or if sources/apiRoute supply their own credentials
    if (!settings.tableId || !settings.reportId) {
      setLoadState("unconfigured");
      return;
    }
    fetchData();
  }, [fetchData, ordersProp, settings]);

  // UI state
  const [search, setSearch]             = useState("");
  const [pmFilter, setPmFilter]         = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter]   = useState("all");
  const [riskFilter, setRiskFilter]     = useState("all");
  const [sortCol, setSortCol]           = useState("warrantyEnd");
  const [sortDir, setSortDir]           = useState("asc");
  const [expandedRow, setExpandedRow]   = useState(null);
  const [activeView, setActiveView]     = useState("table"); // "table" | "map"

  // Enrich all orders with live status + inferred open/closed claims
  const enriched = useMemo(() =>
    orders.map(o => {
      const days   = daysFromToday(o.warrantyEnd);
      const status = warrantyStatus(o.warrantyEnd);
      // If no claims source is connected, infer open = active/expiring claims, closed = expired
      const openClaims   = o.openClaims   ?? (status !== "expired" ? o.claims : 0);
      const closedClaims = o.closedClaims ?? (status === "expired"  ? o.claims : 0);
      const claimCost    = o.claimCost    ?? 0;
      const riskScore    = computeRiskScore({ ...o, status });
      const risk         = riskLevel(riskScore);
      return { ...o, days, status, openClaims, closedClaims, claimCost, riskScore, risk };
    })
  , [orders]);

  // Filter + sort
  const filtered = useMemo(() => applyFilter(enriched, {
    search, pmFilter, statusFilter, brandFilter, riskFilter, sortCol, sortDir,
  }), [enriched, search, pmFilter, statusFilter, brandFilter, riskFilter, sortCol, sortDir]);

  // KPIs (full data set - unaffected by filters)
  const kpis = useMemo(() => computeKpiValue(enriched), [enriched]);

  // Chart data
  const { brandChartData, statusChartData, pmChartData, productChartData } = useMemo(
    () => computeChartData(enriched, kpis),
    [enriched, kpis]
  );

  const uniquePMs    = [...new Set(enriched.map(o => o.pm))].sort();
  const uniqueBrands = [...new Set(enriched.map(o => o.brand))].sort();
  const hasFilters   = search || pmFilter !== "all" || statusFilter !== "all" || brandFilter !== "all" || riskFilter !== "all";

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const TH = (col) => ({
    padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700,
    color: T.textSec, letterSpacing: "0.05em", textTransform: "uppercase",
    borderBottom: `2px solid ${T.border}`, cursor: "pointer", whiteSpace: "nowrap",
    background: "#FAFAF8", userSelect: "none",
  });

  const TD = { padding: "10px 12px", fontSize: 13, verticalAlign: "middle" };

  // Footer totals for filtered set
  const filteredClaims = filtered.reduce((s, o) => s + o.claims, 0);
  const filteredValue  = filtered.reduce((s, o) => s + o.orderValue, 0);

  // Gate render on load state
  if (loadState === "unconfigured") {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bgApp, minHeight: "100vh", padding: "24px 24px 48px" }}>
        {showSettings && (
          <SettingsModal
            initialTableId={settings.tableId}
            initialReportId={settings.reportId}
            onClose={() => setShowSettings(false)}
            onSave={s => { setSettings(s); setShowSettings(false); }}
          />
        )}
        <EmptyState onConfigure={() => setShowSettings(true)} />
      </div>
    );
  }

  if (loadState === "loading") {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bgApp, minHeight: "100vh", padding: "24px 24px 48px" }}>
        <LoadingState />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bgApp, minHeight: "100vh", padding: "24px 24px 48px" }}>
        <ErrorState message={errorMsg} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bgApp, minHeight: "100vh", padding: "24px 24px 48px" }}>

      {/* ── Settings Modal ───────────────────────────────────────────────────── */}
      {showSettings && (
        <SettingsModal
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={s => { setSettings(s); setShowSettings(false); }}
        />
      )}

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AwnexLogo />
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: "#112A52", margin: 0, lineHeight: 1.05 }}>Warranty Management</h1>
            <p style={{ fontSize: 13, color: T.textSec, margin: "3px 0 0" }}>Awntrak Platform - QC Module</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Source status pills */}
          {Object.entries(sourceStatuses).map(([id, status]) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: T.bgCard, border: `1px solid ${T.border}`, fontSize: 11, color: T.textSec }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: status === "ok" ? T.successFill : status === "error" ? T.danger : T.accentSoft, flexShrink: 0 }} />
              {id}
            </div>
          ))}
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            title="Configure Quickbase connection"
            style={{
              width: 34, height: 34, borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bgCard, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: T.textSec,
              boxShadow: T.cardShadow, flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>

          {/* View toggle */}
          <div style={{ display: "flex", background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden", boxShadow: T.cardShadow }}>
            {[["table", "Table", <svg key="t" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>], ["map", "Map", <svg key="m" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>]].map(([v, label, icon]) => (
              <button key={v} onClick={() => setActiveView(v)} style={{
                padding: "7px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 5,
                background: activeView === v ? T.brand : "transparent",
                color: activeView === v ? T.white : T.textSec,
                transition: "background 0.15s, color 0.15s",
              }}>
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Row 1: Warranty Status ────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 14 }}>
        <KpiCard
          label="Under Warranty"
          value={kpis.underWarranty}
          sub={`${fmtCurrency(kpis.warrantyValue)} total order value`}
          color={T.brand}
          bg={T.brandSubtle}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.brand} strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
        />
        <KpiCard
          label="Active"
          value={kpis.active}
          sub={`${fmtCurrency(kpis.activeValue)} in active coverage`}
          color={T.success}
          bg={T.successSoft}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27500A" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
        />
        <KpiCard
          label="Expiring Soon"
          value={kpis.expiring}
          sub={kpis.expiring > 0 ? "Under 90 days - review now" : "None expiring soon"}
          color={T.warning}
          bg={T.warningSoft}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C97E0A" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        />
        <KpiCard
          label="Expired"
          value={kpis.expired}
          sub="Warranty period closed"
          color={T.danger}
          bg={T.dangerSoft}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
        />
      </div>

      {/* ── KPI Row 2: Claims + Financials ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <KpiCard
          label="Open Claims"
          value={kpis.openClaims}
          sub={kpis.openClaims > 0 ? "Require active attention" : "No open claims"}
          color={T.danger}
          bg={T.dangerSoft}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="17" x2="12" y2="12"/><line x1="12" y1="10" x2="12.01" y2="10"/></svg>}
        />
        <KpiCard
          label="Closed Claims"
          value={kpis.closedClaims}
          sub={`${kpis.totalClaims} total across all orders`}
          color={T.textSec}
          bg={T.bgApp}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>}
        />
        <KpiCard
          label="Total Portfolio Value"
          value={fmtCurrency(kpis.totalValue)}
          sub={`${enriched.length} orders tracked`}
          color={T.brandDark}
          bg={T.brandSubtle}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.brandDark} strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
        <KpiCard
          label="Claim Costs"
          value={kpis.hasCostData ? fmtCurrency(kpis.totalClaimCost) : "-"}
          sub={kpis.hasCostData ? "Total repair cost logged" : "Connect a costs source to track"}
          color={kpis.hasCostData ? T.accentDark : T.textMuted}
          bg={T.accentSubtle}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={kpis.hasCostData ? T.accentDark : T.textMuted} strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>}
        />
        <KpiCard
          label="High Risk Orders"
          value={kpis.criticalRisk + kpis.highRisk}
          sub={kpis.atRisk > 0 ? `${kpis.atRisk} with QC flags but no claim filed` : kpis.criticalRisk > 0 ? `${kpis.criticalRisk} critical - immediate attention` : "No high risk orders"}
          color={kpis.criticalRisk > 0 ? T.danger : kpis.highRisk > 0 ? T.warning : T.textSec}
          bg={kpis.criticalRisk > 0 ? T.dangerSoft : kpis.highRisk > 0 ? T.warningSoft : T.bgApp}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={kpis.criticalRisk > 0 ? T.danger : kpis.highRisk > 0 ? T.warning : T.textSec} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────────── */}
      <div style={{
        background: T.bgCard, borderRadius: 12, padding: "12px 16px",
        marginBottom: 20, boxShadow: T.cardShadow,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search order, customer, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 30px",
              borderRadius: 8, border: `1px solid ${T.border}`,
              fontSize: 13, color: T.text, background: T.bgApp,
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        {[
          { label: "Status", value: statusFilter, setter: setStatusFilter,
            options: [["all","All Statuses"],["active","Active"],["expiring","Expiring"],["expired","Expired"]] },
          { label: "PM", value: pmFilter, setter: setPmFilter,
            options: [["all","All PMs"], ...uniquePMs.map(p => [p, p])] },
          { label: "Brand", value: brandFilter, setter: setBrandFilter,
            options: [["all","All Brands"], ...uniqueBrands.map(b => [b, b])] },
          { label: "Risk", value: riskFilter, setter: setRiskFilter,
            options: [["all","All Risk Levels"],["critical","Critical"],["high","High"],["medium","Medium"],["low","Low"],["atrisk","At Risk (No Claim)"]] },
        ].map(({ label, value, setter, options }) => (
          <select key={label} value={value} onChange={e => setter(e.target.value)} style={{
            padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
            fontSize: 13, color: T.text, background: T.bgCard, cursor: "pointer",
            flexShrink: 0,
          }}>
            {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setPmFilter("all"); setStatusFilter("all"); setBrandFilter("all"); setRiskFilter("all"); }}
            style={{
              padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.dangerFill}`,
              background: T.dangerSoft, color: T.danger, fontSize: 12, fontWeight: 600,
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}>
            Clear Filters
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: T.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>
          {filtered.length} of {enriched.length} orders
        </span>
      </div>

      {/* ── Map View ─────────────────────────────────────────────────────────── */}
      {activeView === "map" && (
        <div style={{ marginBottom: 20 }}>
          <MapView orders={filtered} />
        </div>
      )}

      {/* ── Charts (table view only) ──────────────────────────────────────────── */}
      {activeView === "table" && (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginBottom: 20 }}>

        {/* Orders and Claims by Brand */}
        <ChartCard title="Open and Closed Claims by Brand">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={brandChartData} barGap={4} barSize={14} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="brand" tick={{ fontSize: 10, fill: T.textSec }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: T.textSec }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="orders"       name="Orders"        fill={T.brandSoft}  radius={[4, 4, 0, 0]} />
              <Bar dataKey="openClaims"   name="Open Claims"   fill={T.danger}     radius={[4, 4, 0, 0]} />
              <Bar dataKey="closedClaims" name="Closed Claims" fill={T.accentSoft} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Warranty Status Breakdown */}
        <ChartCard title="Warranty Status Breakdown">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%" cy="48%"
                innerRadius={60} outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Claims by Project Manager */}
        <ChartCard title="Orders and Claims by Project Manager">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={pmChartData} layout="vertical" barSize={12} margin={{ top: 4, right: 16, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: T.textSec }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="pm" tick={{ fontSize: 10, fill: T.textSec }} tickLine={false} axisLine={false} width={88} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="orders" name="Orders" fill={T.brandSoft} radius={[0, 4, 4, 0]} />
              <Bar dataKey="claims" name="Claims" fill={T.brand} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Claims by Product Type */}
        <ChartCard title="Claims by Product Type">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={productChartData} layout="vertical" barSize={12} margin={{ top: 4, right: 16, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: T.textSec }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="product" tick={{ fontSize: 10, fill: T.textSec }} tickLine={false} axisLine={false} width={96} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="claims" name="Claims" fill={T.accent} radius={[0, 4, 4, 0]} />
              <Bar dataKey="count" name="Orders" fill={T.accentSoft} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
      )} {/* end activeView === "table" charts block */}

      {/* ── Order Detail Table (table view only) ─────────────────────────────── */}
      {activeView === "table" && (
      <div style={{ background: T.bgCard, borderRadius: 12, boxShadow: T.cardShadow, overflow: "hidden" }}>

        {/* Table header bar */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>Order Detail</h3>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontSize: 12, color: T.textSec }}>
              <b style={{ color: T.text }}>{filteredClaims}</b> claims
            </span>
            <span style={{ fontSize: 12, color: T.textSec }}>
              Portfolio: <b style={{ color: T.text }}>{fmtCurrency(filteredValue)}</b>
            </span>
          </div>
        </div>

        {/* Scrollable table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr>
                {[
                  ["orderNum",   "Order #"],
                  ["customer",   "Customer"],
                  ["location",   "Location"],
                  ["pm",         "Project Manager"],
                  ["riskScore",  "Risk"],
                  ["status",     "Warranty"],
                  ["warrantyEnd","Expires"],
                  ["claims",     "Claims"],
                  ["qcPeeling",  "QC Peeling"],
                  ["qcPowder",   "QC Powder"],
                  ["orderValue", "Order Value"],
                ].map(([col, label]) => (
                  <th key={col} style={TH(col)} onClick={() => handleSort(col)}>
                    {label}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                  </th>
                ))}
                <th style={{ ...TH("products"), cursor: "default" }}>Products</th>
                <th style={{ ...TH("link"), cursor: "default" }}>QB</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => {
                const isExpanded = expandedRow === o.orderNum;
                const rowBg = i % 2 === 0 ? T.bgCard : "#FAFAF8";
                return (
                  <>
                    <tr
                      key={o.orderNum}
                      style={{ background: rowBg, borderBottom: `1px solid ${T.border}`, cursor: "pointer" }}
                      onClick={() => setExpandedRow(isExpanded ? null : o.orderNum)}
                    >
                      <td style={{ ...TD, fontWeight: 700, color: T.brand }}>{o.orderNum}</td>
                      <td style={{ ...TD, color: T.text, fontWeight: 500 }}>{o.customer}</td>
                      <td style={{ ...TD, color: T.textSec, fontSize: 12, whiteSpace: "nowrap" }}>{o.location}</td>
                      <td style={{ ...TD, color: T.text, fontSize: 12 }}>{o.pm}</td>
                      <td style={{ ...TD }}><RiskBadge level={o.risk} score={o.riskScore} /></td>
                      <td style={{ ...TD }}><StatusBadge status={o.status} days={o.days} /></td>
                      <td style={{ ...TD, color: T.textSec, fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(o.warrantyEnd)}</td>
                      <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: o.claims > 1 ? T.danger : T.text }}>{o.claims}</td>
                      <td style={{ ...TD, textAlign: "center", color: T.textSec }}>{o.qcPeeling}</td>
                      <td style={{ ...TD, textAlign: "center", color: o.qcPowder > 1 ? T.warning : T.textSec, fontWeight: o.qcPowder > 1 ? 700 : 400 }}>{o.qcPowder}</td>
                      <td style={{ ...TD, fontWeight: 600, whiteSpace: "nowrap", color: T.text }}>{fmtCurrency(o.orderValue)}</td>
                      <td style={{ ...TD, maxWidth: 220 }}>
                        {o.products.length > 0
                          ? o.products.map(p => <ProductTag key={p} name={p} />)
                          : <span style={{ fontSize: 11, color: T.textMuted }}>-</span>}
                      </td>
                      <td style={{ ...TD }}>
                        <a
                          href={o.qbUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            padding: "4px 10px", borderRadius: 6,
                            background: T.brandSubtle, color: T.brand,
                            fontSize: 11, fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-flex", alignItems: "center", gap: 3,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Open
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      </td>
                    </tr>
                    {/* Expanded row - colors detail */}
                    {isExpanded && (
                      <tr key={`${o.orderNum}-exp`} style={{ background: T.brandSubtle }}>
                        <td colSpan={13} style={{ padding: "10px 20px 12px" }}>
                          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
                            <div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Final Color Approval</span>
                              <p style={{ fontSize: 12, color: T.text, margin: "4px 0 0" }}>{o.colors || "-"}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Warranty End</span>
                              <p style={{ fontSize: 12, color: T.text, margin: "4px 0 0" }}>{fmtDate(o.warrantyEnd)}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Order Value</span>
                              <p style={{ fontSize: 12, color: T.text, margin: "4px 0 0", fontWeight: 600 }}>{fmtCurrency(o.orderValue)}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Open Claims</span>
                              <p style={{ fontSize: 12, color: o.openClaims > 0 ? T.danger : T.textSec, margin: "4px 0 0", fontWeight: o.openClaims > 0 ? 700 : 400 }}>{o.openClaims}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Closed Claims</span>
                              <p style={{ fontSize: 12, color: T.textSec, margin: "4px 0 0" }}>{o.closedClaims}</p>
                            </div>
                            {o.claimCost > 0 && (
                              <div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Claim Cost</span>
                                <p style={{ fontSize: 12, color: T.accentDark, margin: "4px 0 0", fontWeight: 600 }}>{fmtCurrency(o.claimCost)}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ padding: "40px 20px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>
                    No orders match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div style={{
          padding: "10px 20px", borderTop: `1px solid ${T.border}`,
          background: "#FAFAF8",
          display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>
            Click any row to expand color and warranty detail.
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: T.textSec }}>
            Showing <b style={{ color: T.text }}>{filtered.length}</b> orders - <b style={{ color: T.text }}>{filteredClaims}</b> claims - <b style={{ color: T.text }}>{fmtCurrency(filteredValue)}</b> portfolio value
          </span>
        </div>

      </div>
      )} {/* end activeView === "table" table block */}

    </div>
  );
}

// ─── SAMPLE DATA (preview / testing) ──────────────────────────────────────────
// Pass as the `orders` prop to render the dashboard without a live API route.
// Usage: <WarrantyDashboard orders={SAMPLE_ORDERS} />
export const SAMPLE_ORDERS = [
  { orderNum: "80886", qbRid: "10886", qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=10886", brand: "McDonald's", location: "San Antonio Texas", customer: "MCDS-McDonalds-042-3611, NSN 43567", pm: "Betty Burford", warrantyEnd: "2027-01-06", products: ["Colorado Canopy", "Downspouts"], colors: "IFS - PLSF50970CN - Yellow Texture; PPG - PCTT89340 - Chantilly Lace; TIGER - RAL 7022 - Umbra grey", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 36747.68 },
  { orderNum: "80103", qbRid: "10103", qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=10103", brand: "Chick-fil-A", location: "Broadview Heights Ohio", customer: "CFA-Chick-fil-A-#05925 Broadview Heights", pm: "Betty Burford", warrantyEnd: "2027-02-09", products: ["Colorado Canopy w/ Lights", "Phoenix System"], colors: "PPG - PCTT20129 - Patio Bronze", claims: 1, qcPeeling: 1, qcPowder: 2, orderValue: 54089.58 },
  { orderNum: "80950", qbRid: "10950", qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=10950", brand: "Municipal", location: "Winter Garden Florida", customer: "MUNIC-Horizon West Library-21-109", pm: "Betty Burford", warrantyEnd: "2027-02-12", products: [], colors: "TIGER - 038/60080 - Statuary Bronze", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 16862.99 },
  { orderNum: "79615", qbRid: "9615",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=9615",  brand: "ADN",        location: "North Liberty Iowa",   customer: "ADN-O-North Liberty Retail-23-132",     pm: "Riley Garrison", warrantyEnd: "2026-01-14", products: ["Colorado Canopy 2.0"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 31443.26 },
  { orderNum: "78984", qbRid: "8984",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8984",  brand: "Chick-fil-A", location: "Farmington Missouri",   customer: "CFA-Chick-fil-A-#05788 Farmington FSU",  pm: "Henry Black",    warrantyEnd: "2025-10-06", products: ["Colorado Canopy w/ Lights", "Phoenix System"], colors: "PPG - PCTT20129 - Patio Bronze", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 46815.34 },
  { orderNum: "78845", qbRid: "8845",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8845",  brand: "Morgantown",  location: "Bowling Green Kentucky", customer: "Morgantown Bank and Trust Branch Office", pm: "John Massaro",   warrantyEnd: "2025-10-22", products: ["Phoenix System"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 10627.28 },
  { orderNum: "78306", qbRid: "8306",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8306",  brand: "Anytime",     location: "Elkhorn Wisconsin",     customer: "Anytime Fitness-22018-01",             pm: "Matt Dillon",    warrantyEnd: "2024-11-08", products: [], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 25726.48 },
  { orderNum: "77958", qbRid: "7958",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=7958",  brand: "Starbucks",   location: "Bridgeport Michigan",   customer: "SBUX-Starbucks-23-107",               pm: "Mark Williams",  warrantyEnd: "2024-11-09", products: ["Colorado Canopy w/ Lights"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 31774.47 },
  { orderNum: "78409", qbRid: "8409",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8409",  brand: "Starbucks",   location: "Texarkana Texas",       customer: "SBUX-Starbucks-22125",                pm: "Matt Dillon",    warrantyEnd: "2024-11-30", products: ["Colorado Canopy", "Colorado Canopy w/ Lights", "IWP SOFFIT/DECKING"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 2, qcPeeling: 2, qcPowder: 2, orderValue: 53339.47 },
  { orderNum: "78349", qbRid: "8349",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8349",  brand: "Starbucks",   location: "Fayetteville West Virginia", customer: "SBUX-Starbucks-11481.1.003",      pm: "Matt Dillon",    warrantyEnd: "2024-12-13", products: ["Colorado Canopy"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 46481.83 },
  { orderNum: "78538", qbRid: "8538",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8538",  brand: "Starbucks",   location: "Forsyth Illinois",      customer: "SBUX-Starbucks-22007",                pm: "Matt Dillon",    warrantyEnd: "2025-02-20", products: ["Colorado Canopy", "IWP SOFFIT/DECKING"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 48364.15 },
  { orderNum: "78733", qbRid: "8733",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8733",  brand: "Starbucks",   location: "LeClaire Iowa",         customer: "SBUX-Starbucks-80221",                pm: "Matt Dillon",    warrantyEnd: "2025-03-05", products: ["Colorado Canopy"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 48453.01 },
  { orderNum: "78585", qbRid: "8585",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8585",  brand: "Starbucks",   location: "St. Michael Minnesota", customer: "SBUX-Starbucks-2023-0252",             pm: "Matt Dillon",    warrantyEnd: "2025-03-27", products: ["Colorado Canopy"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 52891.52 },
  { orderNum: "78814", qbRid: "8814",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8814",  brand: "Starbucks",   location: "Blue Springs Missouri",  customer: "SBUX-Starbucks-230458",               pm: "Matt Dillon",    warrantyEnd: "2025-04-26", products: ["Colorado Canopy 2.0", "Colorado Canopy w/ Lights"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 76017.94 },
  { orderNum: "78821", qbRid: "8821",  qbUrl: "https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=8821",  brand: "Chick-fil-A", location: "Omaha Nebraska",        customer: "CFA-Chick-fil-A-#05599 156th & Maple FSU", pm: "Henry Black", warrantyEnd: "2025-09-12", products: ["Fabric Awnings"], colors: "Prismatic Powders - PSB 6865 - Blackboard", claims: 1, qcPeeling: 1, qcPowder: 1, orderValue: 51480.73 },
];

// Default export renders with sample data so the component previews without a live API.
// In your Next.js app, import the named export instead:
//   import { WarrantyDashboard } from "./WarrantyDashboard";
//   <WarrantyDashboard apiRoute="/api/warranty-orders" />
export default function WarrantyDashboardPreview() {
  return <WarrantyDashboard orders={SAMPLE_ORDERS} />;
}
