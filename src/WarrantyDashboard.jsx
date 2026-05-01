import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { useRouter } from "next/router";
import { T } from "../lib/tokens.js";
import {
  mapQBResponse, mapClaimsResponse,
  daysFromToday, warrantyStatus,
  computeRiskScore, riskLevel,
  fmtCurrency, fmtDate, buildReportFields,
  buildColumnSpecs,
} from "../lib/qbUtils.js";
import {
  buildAvailableFields,
  applyFilter,
  computeKpiValue, formatKpiValue,
  genId,
} from "../lib/dashboardMetrics.js";
import { blankKpiConfig, blankChartConfig } from "../lib/dashboardDefaults.js";
import {
  loadConnectionSettings, saveConnectionSettings,
  loadModuleSettings, saveModuleSettings,
  loadKpiConfigs, saveKpiConfigs,
  loadChartConfigs, saveChartConfigs,
  loadColumnTitles, saveColumnTitles,
  loadColumnOrder, saveColumnOrder,
  loadFilterFields, saveFilterFields,
  DEFAULT_DASHBOARD_TITLE, DEFAULT_DASHBOARD_SUBTITLE,
  resetAllConfigs, clearAllData,
} from "../lib/dashboardStorage.js";
import AppHeader from "./components/AppHeader.jsx";
import { SettingsModal }         from "../components/SettingsModal.jsx";
import { MapView }               from "../components/MapView.jsx";
import { ContentViewer }         from "./components/ContentViewer.jsx";
import { KpiCard }               from "../components/dashboard/KpiCard.jsx";
import { KpiEditor }             from "../components/dashboard/KpiEditor.jsx";
import { ChartCard }             from "../components/dashboard/ChartCard.jsx";
import { ChartEditor }           from "../components/dashboard/ChartEditor.jsx";
import { ConfigurableChart }     from "../components/dashboard/ConfigurableChart.jsx";
import { DashboardEditToolbar }  from "../components/dashboard/DashboardEditToolbar.jsx";
import { ColumnEditor }          from "../components/dashboard/ColumnEditor.jsx";
import { StatusBadge, RiskBadge } from "../components/ui/Badge.jsx";
import { ProductTag }            from "../components/ui/Tag.jsx";
import { SortIcon }              from "../components/ui/SortIcon.jsx";
import { EmptyState, LoadingState, ErrorState } from "../components/ui/StateScreens.jsx";
import { InstallationDashboard } from "./components/installation/InstallationDashboard.jsx";
import { mapInstallationData } from "../lib/installationData";

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export function WarrantyDashboard({
  apiRoute  = "/api/warranty-orders",
  orders: ordersProp = null,
  sources   = null,
}) {
  // ── Connection settings ────────────────────────────────────────────────────
  const [settings, setSettings]                           = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings]                   = useState(false);
  const [installationSettings, setInstallationSettings]   = useState({ tableId: "", reportId: "" });
  const [showInstallationSettings, setShowInstallationSettings] = useState(false);

  useEffect(() => {
    setSettings(loadConnectionSettings());
    setInstallationSettings(loadModuleSettings("installation"));
  }, []);

  // ── Cross-device sync via Vercel KV ───────────────────────────────────────
  // "loading" → fetching server settings on mount
  // "ready"   → up to date
  // "saving"  → debounced POST in flight
  // "error"   → last POST failed
  const [syncStatus,    setSyncStatus]    = useState("loading");
  const syncStatusRef   = useRef("loading");
  const skipNextSyncRef = useRef(true); // skip the echo-back after server load

  function updateSyncStatus(s) { syncStatusRef.current = s; setSyncStatus(s); }

  // ── Raw data ───────────────────────────────────────────────────────────────
  const [orders, setOrders]             = useState(ordersProp ?? []);
  const [loadState, setLoadState]       = useState(ordersProp ? "loaded" : "loading");
  const [errorMsg, setErrorMsg]         = useState("");
  const [sourceStatuses, setSourceStatuses] = useState({});
  const [qbReportFields, setQbReportFields] = useState([]);
  const [installationJobs, setInstallationJobs]       = useState([]);
  const [installationLoadState, setInstallationLoadState] = useState("loading");
  const [installationErrorMsg, setInstallationErrorMsg]   = useState("");

  const fetchData = useCallback(async () => {
    setLoadState("loading");
    try {
      function withSettings(route) {
        if (!settings.tableId || !settings.reportId) return route;
        const sep = route.includes("?") ? "&" : "?";
        return `${route}${sep}tableId=${encodeURIComponent(settings.tableId)}&reportId=${encodeURIComponent(settings.reportId)}`;
      }
      const targets = (sources ?? [{ id: "orders", route: apiRoute, role: "orders" }])
        .map(s => ({ ...s, route: withSettings(s.route) }));
      const statuses = Object.fromEntries(targets.map(s => [s.id, "loading"]));
      setSourceStatuses({ ...statuses });

      const results = await Promise.all(targets.map(async s => {
        try {
          const res = await fetch(s.route);
          const ct  = res.headers.get("content-type") || "";
          if (!ct.includes("application/json"))
            throw new Error(`${s.route} returned non-JSON (${res.status})`);
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

      const ordersResult = results.find(r => r.role === "orders");
      if (!ordersResult || ordersResult.error)
        throw new Error(ordersResult?.error || "No orders source configured.");

      if (ordersResult.payload?.fields)
        setQbReportFields(buildReportFields(ordersResult.payload.fields));

      let mapped = mapQBResponse(ordersResult.payload);

      const claimsResult = results.find(r => r.role === "claims" && !r.error);
      if (claimsResult) {
        const cm = mapClaimsResponse(claimsResult.payload, claimsResult.fieldMap);
        mapped = mapped.map(o => {
          const c = cm[o.orderNum] || { open: 0, closed: 0, totalCost: 0 };
          return { ...o, openClaims: c.open, closedClaims: c.closed, claimCost: c.totalCost };
        });
      }

      const costsResult = results.find(r => r.role === "costs" && !r.error);
      if (costsResult) {
        const cm = mapClaimsResponse(costsResult.payload, { cost: "Total Cost", ...costsResult.fieldMap });
        mapped = mapped.map(o => {
          const c = cm[o.orderNum];
          return { ...o, claimCost: (o.claimCost || 0) + (c?.totalCost || 0) };
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
    if (!settings.tableId || !settings.reportId) { setLoadState("unconfigured"); return; }
    fetchData();
  }, [fetchData, ordersProp, settings]);

  // ── Installation independent fetch ────────────────────────────────────────
  const fetchInstallationData = useCallback(async () => {
    setInstallationLoadState("loading");
    try {
      const sep = apiRoute.includes("?") ? "&" : "?";
      const route = `${apiRoute}${sep}tableId=${encodeURIComponent(installationSettings.tableId)}&reportId=${encodeURIComponent(installationSettings.reportId)}`;
      const res = await fetch(route);
      const ct  = res.headers.get("content-type") || "";
      if (!ct.includes("application/json"))
        throw new Error(`Installation source returned non-JSON (${res.status})`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Installation source returned ${res.status}`);
      setInstallationJobs(mapInstallationData(json));
      setInstallationLoadState("loaded");
    } catch (err) {
      setInstallationErrorMsg(err.message);
      setInstallationLoadState("error");
    }
  }, [apiRoute, installationSettings]);

  useEffect(() => {
    if (!installationSettings.tableId || !installationSettings.reportId) {
      setInstallationLoadState("unconfigured");
      return;
    }
    fetchInstallationData();
  }, [fetchInstallationData, installationSettings]);

  // ── Table UI state ─────────────────────────────────────────────────────────
  const [search, setSearch]             = useState("");
  const [fieldFilters, setFieldFilters] = useState({});
  const [sortCol, setSortCol]           = useState("warrantyEnd");
  const [sortDir, setSortDir]           = useState("asc");
  const [expandedRow, setExpandedRow]   = useState(null);
  const [activeView, setActiveView]     = useState("table");
  const [activeModule, setActiveModule] = useState("warranty");
  const router = useRouter();
  const [viewerUrl, setViewerUrl]       = useState(null);
  const [viewerOpen, setViewerOpen]     = useState(false);


  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.module === "installation") setActiveModule("installation");
  }, [router.isReady, router.query.module]);
  const handleOpenLink = useCallback((raw) => {
    if (!raw || typeof raw !== "string") return;
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "#") return;
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    setViewerUrl(normalized);
    setViewerOpen(true);
  }, []);

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [editMode, setEditMode]           = useState(false);
  const [kpiConfigs, setKpiConfigs]       = useState(() => loadKpiConfigs());
  const [chartConfigs, setChartConfigs]   = useState(() => loadChartConfigs());
  const [editingKpi, setEditingKpi]       = useState(null); // { config, idx }
  const [editingChart, setEditingChart]   = useState(null); // { config, idx }
  const [columnTitles, setColumnTitles]   = useState(() => loadColumnTitles());
  const [columnOrder,  setColumnOrder]    = useState(() => loadColumnOrder());
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [selectedFilterFieldIds, setSelectedFilterFieldIds] = useState(() => loadFilterFields());
  const [draggingKpiId, setDraggingKpiId] = useState(null);
  const [draggingChartId, setDraggingChartId] = useState(null);

  // Load server settings once on mount; override localStorage where present
  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(s => {
        if (s.kpiConfigs?.length)                         setKpiConfigs(s.kpiConfigs);
        if (s.chartConfigs?.length)                       setChartConfigs(s.chartConfigs);
        if (s.columnTitles && Object.keys(s.columnTitles).length) setColumnTitles(s.columnTitles);
        if (s.columnOrder?.length)                        setColumnOrder(s.columnOrder);
        if (Array.isArray(s.filterFieldIds))              setSelectedFilterFieldIds(s.filterFieldIds);
        if (s.tableId || s.reportId) {
          const ns = { tableId: s.tableId || "", reportId: s.reportId || "" };
          setSettings(ns);
          saveConnectionSettings(ns);
        }
        if (s.installationTableId || s.installationReportId) {
          const ns = { tableId: s.installationTableId || "", reportId: s.installationReportId || "" };
          setInstallationSettings(ns);
          saveModuleSettings("installation", ns);
        }
        updateSyncStatus("ready");
      })
      .catch(() => updateSyncStatus("ready")); // no KV configured — stay on localStorage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save whenever any persisted config changes (after first server load)
  useEffect(() => {
    if (syncStatusRef.current === "loading") return;
    if (skipNextSyncRef.current) { skipNextSyncRef.current = false; return; }
    updateSyncStatus("saving");
    const timer = setTimeout(() => {
      fetch("/api/settings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kpiConfigs, chartConfigs, columnTitles, columnOrder,
          filterFieldIds: selectedFilterFieldIds,
          tableId: settings.tableId, reportId: settings.reportId,
          installationTableId: installationSettings.tableId,
          installationReportId: installationSettings.reportId,
        }),
      })
        .then(r => r.ok ? updateSyncStatus("ready") : updateSyncStatus("error"))
        .catch(() => updateSyncStatus("error"));
    }, 800);
    return () => clearTimeout(timer);
  // syncStatus intentionally excluded — we use the ref to avoid re-triggering
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiConfigs, chartConfigs, columnTitles, columnOrder, selectedFilterFieldIds, settings, installationSettings]);

  // KPI helpers
  function updateKpi(idx, updated) {
    const next = kpiConfigs.map((c, i) => i === idx ? updated : c);
    setKpiConfigs(next); saveKpiConfigs(next);
  }
  function duplicateKpi(idx) {
    const copy = { ...kpiConfigs[idx], id: genId("kpi") };
    const next = [...kpiConfigs.slice(0, idx + 1), copy, ...kpiConfigs.slice(idx + 1)];
    setKpiConfigs(next); saveKpiConfigs(next);
  }
  function deleteKpi(idx) {
    const next = kpiConfigs.filter((_, i) => i !== idx);
    setKpiConfigs(next); saveKpiConfigs(next); setEditingKpi(null);
  }
  function addKpi() {
    const cfg = blankKpiConfig(genId("kpi"));
    const next = [...kpiConfigs, cfg];
    setKpiConfigs(next); saveKpiConfigs(next);
    setEditingKpi({ config: { ...cfg }, idx: next.length - 1 });
  }
  function moveKpi(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const from = kpiConfigs.findIndex(c => c.id === sourceId);
    const to   = kpiConfigs.findIndex(c => c.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...kpiConfigs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setKpiConfigs(next);
    saveKpiConfigs(next);
  }

  // Chart helpers
  function updateChart(idx, updated) {
    const next = chartConfigs.map((c, i) => i === idx ? updated : c);
    setChartConfigs(next); saveChartConfigs(next);
  }
  function duplicateChart(idx) {
    const copy = { ...chartConfigs[idx], id: genId("chart"), metrics: chartConfigs[idx].metrics.map(m => ({ ...m })) };
    const next = [...chartConfigs.slice(0, idx + 1), copy, ...chartConfigs.slice(idx + 1)];
    setChartConfigs(next); saveChartConfigs(next);
  }
  function deleteChart(idx) {
    const next = chartConfigs.filter((_, i) => i !== idx);
    setChartConfigs(next); saveChartConfigs(next); setEditingChart(null);
  }
  function addChart() {
    const cfg = blankChartConfig(genId("chart"));
    const next = [...chartConfigs, cfg];
    setChartConfigs(next); saveChartConfigs(next);
    setEditingChart({ config: { ...cfg, metrics: cfg.metrics.map(m => ({ ...m })) }, idx: next.length - 1 });
  }
  function moveChart(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const from = chartConfigs.findIndex(c => c.id === sourceId);
    const to   = chartConfigs.findIndex(c => c.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...chartConfigs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setChartConfigs(next);
    saveChartConfigs(next);
  }

  function handleResetAll() {
    const { kpiConfigs: k, chartConfigs: c } = resetAllConfigs();
    setKpiConfigs(k); setChartConfigs(c);
    setColumnTitles({}); setColumnOrder([]);
    setSelectedFilterFieldIds([]);
    setDashboardTitle(DEFAULT_DASHBOARD_TITLE);
    setDashboardSubtitle(DEFAULT_DASHBOARD_SUBTITLE);
  }

  function handleClearAll() {
    clearAllData();
    const { kpiConfigs: k, chartConfigs: c } = resetAllConfigs();
    setSettings({ tableId: "", reportId: "" });
    setKpiConfigs(k); setChartConfigs(c);
    setColumnTitles({}); setColumnOrder([]);
    setSelectedFilterFieldIds([]);
    setDashboardTitle(DEFAULT_DASHBOARD_TITLE);
    setDashboardSubtitle(DEFAULT_DASHBOARD_SUBTITLE);
    setShowSettings(false);
  }

  // ── Enrichment ─────────────────────────────────────────────────────────────
  const enriched = useMemo(() => orders, [orders]);

  const availableFields = useMemo(
    () => buildAvailableFields(qbReportFields),
    [qbReportFields]
  );

  const columnSpecs = useMemo(() => {
    const specs  = buildColumnSpecs(qbReportFields, columnTitles);
    if (!columnOrder.length) return specs;
    // Apply saved order: sort by position in columnOrder; unknown cols go before qbLink
    const orderMap = Object.fromEntries(columnOrder.map((id, i) => [id, i]));
    const link     = specs.find(c => c.renderAs === "qbLink");
    const rest     = specs.filter(c => c.renderAs !== "qbLink");
    rest.sort((a, b) => (orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999));
    return link ? [...rest, link] : rest;
  }, [qbReportFields, columnTitles, columnOrder]);

  // ── Table filter + sort ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = enriched;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(o => Object.values(o).some(v => String(v ?? "").toLowerCase().includes(q)));
    }
    Object.entries(fieldFilters).forEach(([k,v]) => {
      if (!v || v === "all") return;
      r = r.filter(o => String(o[k] ?? "") === String(v));
    });
    function getVal(o, key) {
      if (o[key] !== undefined) return o[key];
      return o._qbFields?.[key] ?? "";
    }
    return [...r].sort((a, b) => {
      const av = getVal(a, sortCol); const bv = getVal(b, sortCol);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [enriched, search, fieldFilters, sortCol, sortDir]);

  const filterableFields = useMemo(() => {
    const availableByKey = new Map(availableFields.map((f) => [f.key, f]));
    const availableByQbId = new Map(availableFields.filter((f) => f.qbId != null).map((f) => [f.qbId, f]));
    const seen = new Set();
    const candidates = columnSpecs
      .filter((c) => c.renderAs !== "qbLink")
      .map((c) => {
        const source = availableByQbId.get(c.qbId) || availableByKey.get(c.key);
        return {
          id: c.id,
          key: c.key,
          qbId: c.qbId,
          label: c.title,
          type: source?.type || "text",
        };
      })
      .filter((f) => {
        if (!["text", "number", "currency", "date"].includes(f.type)) return false;
        if (seen.has(f.key)) return false;
        seen.add(f.key);
        return true;
      });

    if (!selectedFilterFieldIds.length) return candidates.slice(0, 4);
    return selectedFilterFieldIds
      .map((id) => candidates.find((c) => c.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [availableFields, columnSpecs, selectedFilterFieldIds]);
  const filterOptions = useMemo(() => Object.fromEntries(filterableFields.map(f => [f.key, [...new Set(enriched.map(o => String(o[f.key] ?? "")).filter(Boolean))].slice(0,200)])), [filterableFields, enriched]);
  const hasFilters   = search || Object.values(fieldFilters).some(v => v && v !== "all");
  useEffect(() => {
    const allowed = new Set(filterableFields.map((f) => f.key));
    setFieldFilters((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => allowed.has(k))));
  }, [filterableFields]);

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  const filteredClaims = 0;
  const filteredValue  = 0;

  // ── Shared table cell styles ───────────────────────────────────────────────
  const TH = {
    padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700,
    color: T.text2, letterSpacing: "0.05em", textTransform: "uppercase",
    borderBottom: `2px solid ${T.borderLight}`, cursor: "pointer", whiteSpace: "nowrap",
    background: T.surface, userSelect: "none",
  };
  const TD = { padding: "10px 12px", fontSize: 13, verticalAlign: "middle" };

  // ── Table cell renderer ────────────────────────────────────────────────────
  function renderCell(o, spec, td) {
    switch (spec.renderAs) {
      case "orderNum":
        return <td key={spec.id} style={{ ...td, fontWeight: 700, color: T.brand }}>{o.orderNum}</td>;
      case "customer":
        return <td key={spec.id} style={{ ...td, color: T.text1, fontWeight: 500 }}>{o.customer}</td>;
      case "location":
        return <td key={spec.id} style={{ ...td, color: T.text2, fontSize: 12, whiteSpace: "nowrap" }}>{o.location}</td>;
      case "pm":
        return <td key={spec.id} style={{ ...td, color: T.text1, fontSize: 12 }}>{o.pm}</td>;
      case "risk":
        return <td key={spec.id} style={td}><RiskBadge level={o.risk} score={o.riskScore} /></td>;
      case "status":
        return <td key={spec.id} style={td}><StatusBadge status={o.status} days={o.days} /></td>;
      case "expires":
        return <td key={spec.id} style={{ ...td, color: T.text2, fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(o.warrantyEnd)}</td>;
      case "claims":
        return <td key={spec.id} style={{ ...td, textAlign: "center", fontWeight: 700, color: o.claims > 1 ? T.danger : T.text1 }}>{o.claims}</td>;
      case "qcPeeling":
        return <td key={spec.id} style={{ ...td, textAlign: "center", color: T.text2 }}>{o.qcPeeling}</td>;
      case "qcPowder":
        return <td key={spec.id} style={{ ...td, textAlign: "center", color: o.qcPowder > 1 ? T.warningText : T.text2, fontWeight: o.qcPowder > 1 ? 700 : 400 }}>{o.qcPowder}</td>;
      case "orderValue":
        return <td key={spec.id} style={{ ...td, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtCurrency(o.orderValue)}</td>;
      case "products":
        return (
          <td key={spec.id} style={{ ...td, maxWidth: 220 }}>
            {o.products.length > 0
              ? o.products.map(p => <ProductTag key={p} name={p} />)
              : <span style={{ fontSize: 11, color: T.text3 }}>-</span>}
          </td>
        );
      case "qbLink":
        return (
          <td key={spec.id} style={td}>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenLink(o.qbUrl); }} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: T.brandSubtle, color: T.brand, fontSize: 11, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", cursor: "pointer" }}>
              Open
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </td>
        );
      case "qbField": {
        const v = o._qbFields?.[spec.key];
        if (v == null) return <td key={spec.id} style={{ ...td, color: T.text2, fontSize: 12 }}>-</td>;
        const str = String(v);
        if (/^https?:\/\//i.test(str)) {
          return (
            <td key={spec.id} style={{ ...td }}>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenLink(str); }} style={{ border: "none", background: "transparent", color: T.brand, textDecoration: "underline", cursor: "pointer", padding: 0 }}>
                Open link
              </button>
            </td>
          );
        }
        if (/<[a-z]/i.test(str)) {
          const safeHtml = DOMPurify.sanitize(str, { ADD_ATTR: ["target", "rel"] }).replace(/href=(['"])(.*?)\1/gi, 'href="#" data-app-url="$2"');
          return (
            <td key={spec.id} style={{ ...td }} onClick={(e) => {
              const anchor = e.target.closest?.("a[data-app-url]");
              if (anchor) {
                e.preventDefault();
                e.stopPropagation();
                handleOpenLink(anchor.getAttribute("data-app-url"));
              }
            }}>
              <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
            </td>
          );
        }
        return <td key={spec.id} style={{ ...td, color: T.text2, fontSize: 12 }}>{str}</td>;
      }
      default:
        return <td key={spec.id} style={{ ...td, color: T.text2 }}>{String(o[spec.key] ?? "-")}</td>;
    }
  }

  // ── Early returns ──────────────────────────────────────────────────────────
  const settingsModals = (
    <>
      {showSettings && (
        <SettingsModal
          dashboardLabel="Warranty"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={s => { const ns = { tableId: s.tableId, reportId: s.reportId }; saveConnectionSettings(ns); setSettings(ns); setShowSettings(false); }}
          onClear={handleClearAll}
        />
      )}
      {showInstallationSettings && (
        <SettingsModal
          dashboardLabel="Installation"
          initialTableId={installationSettings.tableId}
          initialReportId={installationSettings.reportId}
          onClose={() => setShowInstallationSettings(false)}
          onSave={s => { const ns = { tableId: s.tableId, reportId: s.reportId }; saveModuleSettings("installation", ns); setInstallationSettings(ns); setShowInstallationSettings(false); }}
        />
      )}
    </>
  );

  const wrap = children => (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bg, minHeight: "100vh", padding: "24px 24px 48px" }}>
      {settingsModals}
      <ContentViewer url={viewerUrl} onClose={() => setViewerUrl(null)} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <AppHeader />
        <button
          onClick={() => activeModule === "installation" ? setShowInstallationSettings(true) : setShowSettings(true)}
          title="Configure Quickbase connection"
          style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.borderLight}`, background: T.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.text2, boxShadow: T.cardShadow }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </button>
      </div>
      {children}
    </div>
  );

  if (activeModule === "installation") {
    if (installationLoadState === "unconfigured") return wrap(<EmptyState onConfigure={() => setShowInstallationSettings(true)} />);
    if (installationLoadState === "loading")      return wrap(<LoadingState />);
    if (installationLoadState === "error")        return wrap(<ErrorState message={installationErrorMsg} onRetry={fetchInstallationData} />);
  } else {
    if (loadState === "unconfigured") return wrap(<EmptyState onConfigure={() => setShowSettings(true)} />);
    if (loadState === "loading")      return wrap(<LoadingState />);
    if (loadState === "error")        return wrap(<ErrorState message={errorMsg} onRetry={fetchData} />);
  }

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: T.bg, minHeight: "100vh", padding: "24px 24px 48px" }}>

      {/* Modals */}
      {settingsModals}
      <ContentViewer
        open={viewerOpen}
        url={viewerUrl}
        onClose={() => {
          setViewerOpen(false);
          setViewerUrl(null);
        }}
      />
      {editingKpi && (
        <KpiEditor
          config={editingKpi.config}
          enrichedOrders={enriched}
          availableFields={availableFields}
          onSave={updated => { updateKpi(editingKpi.idx, updated); setEditingKpi(null); }}
          onClose={() => setEditingKpi(null)}
          onDelete={() => deleteKpi(editingKpi.idx)}
          onDuplicate={() => { duplicateKpi(editingKpi.idx); setEditingKpi(null); }}
        />
      )}
      {editingChart && (
        <ChartEditor
          config={editingChart.config}
          enrichedOrders={enriched}
          availableFields={availableFields}
          onSave={updated => { updateChart(editingChart.idx, updated); setEditingChart(null); }}
          onClose={() => setEditingChart(null)}
          onDelete={() => deleteChart(editingChart.idx)}
          onDuplicate={() => { duplicateChart(editingChart.idx); setEditingChart(null); }}
        />
      )}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AppHeader />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Sync status */}
          {syncStatus !== "loading" && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: T.card, border: `1px solid ${T.borderLight}`, fontSize: 11 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={syncStatus === "error" ? T.danger : syncStatus === "saving" ? T.text3 : T.successFill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
              </svg>
              <span style={{ color: syncStatus === "error" ? T.danger : T.text2 }}>
                {syncStatus === "saving" ? "Saving…" : syncStatus === "error" ? "Sync error" : "Synced"}
              </span>
            </div>
          )}

          {/* Source status pills */}
          {Object.entries(sourceStatuses).map(([id, st]) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8, background: T.card, border: `1px solid ${T.borderLight}`, fontSize: 11, color: T.text2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: st === "ok" ? T.successFill : st === "error" ? T.danger : T.accentSoft, flexShrink: 0 }} />
              {id}
            </div>
          ))}

          {/* Settings gear — opens module-specific QB connection modal */}
          <button
            onClick={() => activeModule === "installation" ? setShowInstallationSettings(true) : setShowSettings(true)}
            title="Configure Quickbase connection"
            style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.borderLight}`, background: T.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.text2, boxShadow: T.cardShadow }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>

          {activeModule === "warranty" && (
          <>
          {/* Edit mode toggle */}
          <button
            onClick={() => setEditMode(e => !e)}
            title={editMode ? "Exit edit mode" : "Customise dashboard"}
            style={{ padding: "7px 14px", borderRadius: 10, border: `1px solid ${editMode ? T.brand : T.borderLight}`, background: editMode ? T.brandSubtle : T.card, color: editMode ? T.brand : T.text2, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: T.cardShadow }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {editMode ? "Editing…" : "Edit"}
          </button>

          {/* View toggle */}
          <div style={{ display: "flex", background: T.card, border: `1px solid ${T.borderLight}`, borderRadius: 10, overflow: "hidden", boxShadow: T.cardShadow }}>
            {[["table","Table"],["map","Map"]].map(([v, label]) => (
              <button key={v} onClick={() => setActiveView(v)} style={{ padding: "7px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeView === v ? T.brand : "transparent", color: activeView === v ? T.card : T.text2, transition: "background 0.15s, color 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
          </>
          )}
        </div>
      </div>

      {activeModule === "installation" ? (
        <InstallationDashboard jobs={installationJobs} />
      ) : (
      <>
      {/* ── Edit toolbar ─────────────────────────────────────────────────── */}
      {editMode && (
        <DashboardEditToolbar
          onAddKpi={addKpi}
          onAddChart={addChart}
          onResetAll={handleResetAll}
          onExit={() => setEditMode(false)}
        />
      )}

      {/* ── KPI grid ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        {kpiConfigs.filter(cfg => !cfg.hidden || editMode).map((cfg) => {
          const idx = kpiConfigs.findIndex(c => c.id === cfg.id);
          const raw = computeKpiValue(enriched, cfg);
          const val = formatKpiValue(raw, cfg.format, cfg.decimals);
          return (
            <div
              key={cfg.id}
              draggable={editMode}
              title={editMode ? "Drag to reorder KPI cards" : undefined}
              onDragStart={e => {
                if (!editMode) return;
                e.dataTransfer.effectAllowed = "move";
                setDraggingKpiId(cfg.id);
              }}
              onDragEnd={() => setDraggingKpiId(null)}
              onDragOver={e => {
                if (!editMode || !draggingKpiId || draggingKpiId === cfg.id) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={e => {
                e.preventDefault();
                if (!editMode) return;
                moveKpi(draggingKpiId, cfg.id);
                setDraggingKpiId(null);
              }}
              style={{
                cursor: editMode ? (draggingKpiId === cfg.id ? "grabbing" : "grab") : "default",
                transform: draggingKpiId === cfg.id ? "scale(0.98)" : "none",
                opacity: draggingKpiId === cfg.id ? 0.7 : 1,
              }}
            >
              <KpiCard
                label={cfg.title}
                value={val}
                sub={cfg.subtitle}
                color={cfg.color}
                bg={cfg.bg}
                iconName={cfg.icon}
                editMode={editMode}
                hidden={cfg.hidden}
                onEdit={() => setEditingKpi({ config: { ...cfg }, idx })}
                onDuplicate={() => duplicateKpi(idx)}
                onToggleHide={() => updateKpi(idx, { ...cfg, hidden: !cfg.hidden })}
              />
            </div>
          );
        })}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div style={{ background: T.card, borderRadius: 20, padding: "12px 16px", marginBottom: 20, boxShadow: T.cardShadow, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search order, customer, location…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 16, border: `1px solid ${T.borderLight}`, fontSize: 13, color: T.text1, background: T.bg, outline: "none", boxSizing: "border-box" }} />
        </div>
        {filterableFields.map((f) => (
          <select key={f.key} value={fieldFilters[f.key] || "all"} onChange={e => setFieldFilters(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ padding: "8px 12px", borderRadius: 14, border: `1px solid ${T.borderLight}`, fontSize: 13, color: T.text1, background: T.card, cursor: "pointer", flexShrink: 0 }}>
            <option value="all">All {f.label}</option>
            {filterOptions[f.key]?.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ))}
        {editMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderLeft: `1px solid ${T.borderLight}`, paddingLeft: 10 }}>
            <span style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Edit Filters</span>
            {[0, 1, 2, 3].map((slot) => (
              <select
                key={slot}
                value={selectedFilterFieldIds[slot] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedFilterFieldIds((prev) => {
                    const next = [...prev];
                    if (value) next[slot] = value;
                    else next.splice(slot, 1);
                    const deduped = next.filter((id, idx) => id && next.indexOf(id) === idx).slice(0, 4);
                    saveFilterFields(deduped);
                    return deduped;
                  });
                }}
                style={{ padding: "7px 9px", borderRadius: 10, border: `1px solid ${T.borderLight}`, fontSize: 12, color: T.text2, background: T.bg }}
              >
                <option value="">Filter {slot + 1}…</option>
                {columnSpecs
                  .filter((c) => c.renderAs !== "qbLink")
                  .map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            ))}
          </div>
        )}
        {hasFilters && (
          <button onClick={() => { setSearch(""); setFieldFilters({}); }} style={{ padding: "8px 12px", borderRadius: 12, border: `1px solid ${T.dangerSubtle}`, background: T.dangerSubtle, color: T.danger, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            Clear Filters
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: T.text3, whiteSpace: "nowrap" }}>{filtered.length} of {enriched.length} orders</span>
      </div>

      {/* ── Map view ─────────────────────────────────────────────────────── */}
      {activeView === "map" && <div style={{ marginBottom: 20 }}><MapView orders={filtered} /></div>}

      {/* ── Chart grid (table view only) ─────────────────────────────────── */}
      {activeView === "table" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginBottom: 20 }}>
          {chartConfigs.filter(cfg => !cfg.hidden || editMode).map((cfg) => {
            const idx = chartConfigs.findIndex(c => c.id === cfg.id);
            return (
              <div
                key={cfg.id}
                draggable={editMode}
                title={editMode ? "Drag to reorder chart cards" : undefined}
                onDragStart={e => {
                  if (!editMode) return;
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingChartId(cfg.id);
                }}
                onDragEnd={() => setDraggingChartId(null)}
                onDragOver={e => {
                  if (!editMode || !draggingChartId || draggingChartId === cfg.id) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={e => {
                  e.preventDefault();
                  if (!editMode) return;
                  moveChart(draggingChartId, cfg.id);
                  setDraggingChartId(null);
                }}
                style={{
                  cursor: editMode ? (draggingChartId === cfg.id ? "grabbing" : "grab") : "default",
                  transform: draggingChartId === cfg.id ? "scale(0.99)" : "none",
                  opacity: draggingChartId === cfg.id ? 0.7 : 1,
                }}
              >
                <ChartCard
                  title={cfg.title}
                  editMode={editMode}
                  hidden={cfg.hidden}
                  onEdit={() => setEditingChart({ config: { ...cfg, metrics: cfg.metrics.map(m => ({ ...m })) }, idx })}
                  onDuplicate={() => duplicateChart(idx)}
                  onToggleHide={() => updateChart(idx, { ...cfg, hidden: !cfg.hidden })}
                >
                  <ConfigurableChart config={cfg} records={enriched} />
                </ChartCard>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Order detail table (table view only) ─────────────────────────── */}
      {activeView === "table" && (
        <div style={{ background: T.card, borderRadius: 24, boxShadow: T.cardShadow, overflow: "hidden" }}>
          {showColumnEditor && (
            <ColumnEditor
              columns={columnSpecs}
              onSave={(customTitles, newOrder) => {
                setColumnTitles(customTitles);
                saveColumnTitles(customTitles);
                if (newOrder) { setColumnOrder(newOrder); saveColumnOrder(newOrder); }
                setShowColumnEditor(false);
              }}
              onClose={() => setShowColumnEditor(false)}
            />
          )}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text1, margin: 0 }}>Order Detail</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: T.text2 }}><b style={{ color: T.text1 }}>{filteredClaims}</b> claims</span>
              <span style={{ fontSize: 12, color: T.text2 }}>Portfolio: <b style={{ color: T.text1 }}>{fmtCurrency(filteredValue)}</b></span>
              <button
                onClick={() => setShowColumnEditor(true)}
                title="Edit column titles"
                style={{ padding: "5px 12px", borderRadius: 10, border: `1px solid ${T.borderLight}`, background: T.surface, color: T.text2, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Columns
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr>
                  {columnSpecs.map(spec => (
                    <th
                      key={spec.id}
                      style={{ ...TH, cursor: spec.sortable ? "pointer" : "default" }}
                      onClick={spec.sortable ? () => handleSort(spec.key) : undefined}
                    >
                      {spec.title}
                      {spec.sortable && <SortIcon col={spec.key} sortCol={sortCol} sortDir={sortDir} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => {
                  const isExpanded = expandedRow === o.orderNum;
                  const rowBg = i % 2 === 0 ? T.card : T.surface;
                  return (
                    <>
                      <tr key={o.orderNum} style={{ background: rowBg, borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }} onClick={() => setExpandedRow(isExpanded ? null : o.orderNum)}>
                        {columnSpecs.map(spec => renderCell(o, spec, TD))}
                      </tr>
                      {isExpanded && (
                        <tr key={`${o.orderNum}-exp`} style={{ background: T.brandSubtle }}>
                          <td colSpan={columnSpecs.length} style={{ padding: "10px 20px 12px" }}>
                            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                              {[["Final Color Approval", o.colors || "-"], ["Warranty End", fmtDate(o.warrantyEnd)], ["Order Value", fmtCurrency(o.orderValue)]].map(([lbl, val]) => (
                                <div key={lbl}>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</span>
                                  <p style={{ fontSize: 12, color: T.text1, margin: "4px 0 0" }}>{val}</p>
                                </div>
                              ))}
                              <div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Open Claims</span>
                                <p style={{ fontSize: 12, color: o.openClaims > 0 ? T.danger : T.text2, margin: "4px 0 0", fontWeight: o.openClaims > 0 ? 700 : 400 }}>{o.openClaims}</p>
                              </div>
                              <div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Closed Claims</span>
                                <p style={{ fontSize: 12, color: T.text2, margin: "4px 0 0" }}>{o.closedClaims}</p>
                              </div>
                              {o.claimCost > 0 && (
                                <div>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.05em" }}>Claim Cost</span>
                                  <p style={{ fontSize: 12, color: T.warningText, margin: "4px 0 0", fontWeight: 600 }}>{fmtCurrency(o.claimCost)}</p>
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
                  <tr><td colSpan={columnSpecs.length} style={{ padding: "40px 20px", textAlign: "center", color: T.text3, fontSize: 13 }}>No orders match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 20px", borderTop: `1px solid ${T.borderLight}`, background: T.surface, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.text3 }}>Click any row to expand color and warranty detail.</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: T.text2 }}>Showing <b style={{ color: T.text1 }}>{filtered.length}</b> orders · <b style={{ color: T.text1 }}>{filteredClaims}</b> claims · <b style={{ color: T.text1 }}>{fmtCurrency(filteredValue)}</b> portfolio value</span>
          </div>
        </div>
      )}

      </>
      )}
    </div>
  );
}
