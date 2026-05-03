import { useState, useEffect } from "react";
import { colors } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";

const C = colors;
const ACCENT = "#D97706";

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────

const SAMPLE_BATCHES = [
  { id: "BTH-0051", order: "ORD-2241", product: "Powder Coat — Bronze", line: "Line A", startDate: "2026-04-28", endDate: "2026-04-29", units: 120, passed: 117, defects: 3, yield: 97.5, status: "Complete" },
  { id: "BTH-0050", order: "ORD-2238", product: "Powder Coat — White",  line: "Line B", startDate: "2026-04-27", endDate: "2026-04-28", units: 80,  passed: 76,  defects: 4, yield: 95.0, status: "Complete" },
  { id: "BTH-0049", order: "ORD-2235", product: "Anodize — Clear",      line: "Line C", startDate: "2026-04-25", endDate: "2026-04-26", units: 200, passed: 200, defects: 0, yield: 100,  status: "Complete" },
  { id: "BTH-0048", order: "ORD-2230", product: "Powder Coat — Black",  line: "Line A", startDate: "2026-04-24", endDate: "2026-04-25", units: 95,  passed: 91,  defects: 4, yield: 95.8, status: "Complete" },
  { id: "BTH-0047", order: "ORD-2228", product: "Powder Coat — Bronze", line: "Line B", startDate: "2026-04-23", endDate: null,          units: 60,  passed: 44,  defects: 2, yield: null, status: "In Progress" },
  { id: "BTH-0046", order: "ORD-2225", product: "Anodize — Clear",      line: "Line C", startDate: "2026-04-22", endDate: "2026-04-23", units: 150, passed: 138, defects: 12, yield: 92.0, status: "Complete" },
  { id: "BTH-0045", order: "ORD-2220", product: "Powder Coat — White",  line: "Line A", startDate: "2026-04-21", endDate: "2026-04-22", units: 75,  passed: 75,  defects: 0, yield: 100,  status: "Complete" },
  { id: "BTH-0044", order: "ORD-2218", product: "Powder Coat — Black",  line: "Line B", startDate: "2026-04-20", endDate: "2026-04-21", units: 110, passed: 104, defects: 6, yield: 94.5, status: "Complete" },
];

const STATUS_CFG = {
  "Complete":    { bg: C.successSubtle, text: C.successText, dot: C.success },
  "In Progress": { bg: C.brandSubtle,   text: C.brandDark,   dot: C.brand   },
  "On Hold":     { bg: "#FFFBEB",       text: C.warningText, dot: "#D97706" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color: C.text1, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.text2, margin: "6px 0 0" }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: C.surface, text: C.text2, dot: C.text3 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: cfg.bg, color: cfg.text, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function YieldBar({ value }) {
  const pct = value ?? 0;
  const color = pct >= 98 ? C.success : pct >= 95 ? ACCENT : C.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 80, height: 6, borderRadius: 999, background: C.bg, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 40 }}>
        {value != null ? `${value}%` : "—"}
      </span>
    </div>
  );
}

function ConnectBanner({ onSettings }) {
  return (
    <div style={{ background: ACCENT + "10", border: `1px dashed ${ACCENT}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 2px" }}>Showing sample data</p>
        <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Connect a Quickbase report to load live production batch records.</p>
      </div>
      <button onClick={onSettings} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: ACCENT, border: "none", color: "#fff" }}>
        Connect QB Report
      </button>
    </div>
  );
}

// ─── PRODUCTION MODULE ────────────────────────────────────────────────────────

export function ProductionModule() {
  const [settings, setSettings]         = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [batches]                       = useState(SAMPLE_BATCHES);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    setSettings(loadModuleSettings("production"));
  }, []);

  const isConnected = !!(settings.tableId && settings.reportId);

  const complete    = batches.filter(b => b.status === "Complete");
  const inProgress  = batches.filter(b => b.status === "In Progress");
  const totalUnits  = batches.reduce((s, b) => s + b.units, 0);
  const totalPassed = batches.filter(b => b.status === "Complete").reduce((s, b) => s + b.passed, 0);
  const totalComplete = complete.reduce((s, b) => s + b.units, 0);
  const avgYield    = totalComplete > 0 ? (complete.reduce((s, b) => s + b.yield, 0) / complete.length).toFixed(1) : "—";
  const totalDefects = batches.reduce((s, b) => s + b.defects, 0);

  const filteredBatches = batches.filter(b =>
    activeFilter === "All" ? true :
    activeFilter === "In Progress" ? b.status === "In Progress" :
    activeFilter === "Complete" ? b.status === "Complete" : true
  );

  const lineStats = ["Line A", "Line B", "Line C"].map(line => {
    const lBatches = complete.filter(b => b.line === line);
    const lYield = lBatches.length ? (lBatches.reduce((s, b) => s + b.yield, 0) / lBatches.length).toFixed(1) : null;
    return { line, batches: lBatches.length, yield: lYield };
  });

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {showSettings && (
        <SettingsModal
          dashboardLabel="Production & Batch Tracking"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={(s) => { saveModuleSettings("production", s); setSettings(s); setShowSettings(false); }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: ACCENT }} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: 0 }}>Production &amp; Batch Tracking</h1>
            <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Batch quality metrics, yield rates, and line-level defect counts</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Configure QB
        </button>
      </div>

      {!isConnected && <ConnectBanner onSettings={() => setShowSettings(true)} />}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Active Batches"  value={inProgress.length}  sub="In production now"     accent={C.brand}   />
        <KpiCard label="Avg Yield Rate"  value={`${avgYield}%`}      sub="Completed batches"     accent={ACCENT}    />
        <KpiCard label="Units Processed" value={totalUnits}           sub="Across all batches"   accent={C.accent}  />
        <KpiCard label="Total Defects"   value={totalDefects}         sub="All batches combined"  accent={C.danger}  />
        <KpiCard label="Units Passed"    value={totalPassed}          sub="First-pass quality"   accent={C.success} />
      </div>

      {/* Line stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {lineStats.map(({ line, batches: cnt, yield: y }) => (
          <div key={line} style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{line}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.text1 }}>{y != null ? `${y}%` : "—"}</span>
              <span style={{ fontSize: 12, color: C.text2 }}>avg yield</span>
            </div>
            <div style={{ fontSize: 12, color: C.text2 }}>{cnt} completed batch{cnt !== 1 ? "es" : ""}</div>
          </div>
        ))}
      </div>

      {/* Batch table */}
      <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, boxShadow: "0 1px 3px rgba(15,23,42,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Batch Records</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["All", "In Progress", "Complete"].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${activeFilter === f ? ACCENT : C.borderLight}`,
                background: activeFilter === f ? ACCENT : C.surface,
                color: activeFilter === f ? "#fff" : C.text2,
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {["Batch ID", "Order", "Product", "Line", "Start", "End", "Units", "Defects", "Yield", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: C.text3, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: i < filteredBatches.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: ACCENT }}>{row.id}</td>
                  <td style={{ padding: "10px 14px", color: C.text2 }}>{row.order}</td>
                  <td style={{ padding: "10px 14px", color: C.text1 }}>{row.product}</td>
                  <td style={{ padding: "10px 14px", color: C.text2 }}>{row.line}</td>
                  <td style={{ padding: "10px 14px", color: C.text2, whiteSpace: "nowrap" }}>{row.startDate}</td>
                  <td style={{ padding: "10px 14px", color: C.text2, whiteSpace: "nowrap" }}>{row.endDate || "—"}</td>
                  <td style={{ padding: "10px 14px", color: C.text1, fontWeight: 600 }}>{row.units}</td>
                  <td style={{ padding: "10px 14px", color: row.defects > 0 ? C.danger : C.text2, fontWeight: row.defects > 0 ? 700 : 400 }}>{row.defects}</td>
                  <td style={{ padding: "10px 14px" }}><YieldBar value={row.yield} /></td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
