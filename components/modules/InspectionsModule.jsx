import { useState, useEffect } from "react";
import { colors } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";
import { registerModule } from "../../lib/moduleRegistry.js";
import {
  HeroBanner, ConnectBanner, ModuleKpiCard,
} from "../ui/ModuleShared.jsx";

const C      = colors;
const ACCENT = "var(--t-teal)";

const SAMPLE_INSPECTIONS = [
  { id: "INS-0041", order: "ORD-2241", product: "Powder Coat — Bronze", inspector: "J. Martinez", date: "2026-04-28", result: "Pass",   defects: 0,  notes: "" },
  { id: "INS-0040", order: "ORD-2238", product: "Powder Coat — White",  inspector: "T. Kim",      date: "2026-04-27", result: "Fail",   defects: 3,  notes: "Peeling at weld seam" },
  { id: "INS-0039", order: "ORD-2235", product: "Anodize — Clear",      inspector: "J. Martinez", date: "2026-04-25", result: "Pass",   defects: 0,  notes: "" },
  { id: "INS-0038", order: "ORD-2230", product: "Powder Coat — Black",  inspector: "R. Singh",    date: "2026-04-24", result: "Rework", defects: 1,  notes: "Minor color inconsistency" },
  { id: "INS-0037", order: "ORD-2228", product: "Powder Coat — Bronze", inspector: "T. Kim",      date: "2026-04-23", result: "Pass",   defects: 0,  notes: "" },
  { id: "INS-0036", order: "ORD-2225", product: "Anodize — Clear",      inspector: "J. Martinez", date: "2026-04-22", result: "Fail",   defects: 2,  notes: "Adhesion failure" },
  { id: "INS-0035", order: "ORD-2220", product: "Powder Coat — White",  inspector: "R. Singh",    date: "2026-04-21", result: "Pass",   defects: 0,  notes: "" },
  { id: "INS-0034", order: "ORD-2218", product: "Powder Coat — Black",  inspector: "T. Kim",      date: "2026-04-20", result: "Pass",   defects: 0,  notes: "" },
];

const RESULT_CFG = {
  Pass:   { bg: C.successSubtle, text: C.successText, dot: C.success },
  Fail:   { bg: C.dangerSubtle,  text: C.dangerText,  dot: C.danger  },
  Rework: { bg: "var(--t-warning-soft)", text: C.warningText, dot: C.warningText },
};

function ResultBadge({ result }) {
  const cfg = RESULT_CFG[result] || { bg: C.surface, text: C.text2, dot: C.text3 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: cfg.bg, color: cfg.text, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {result}
    </span>
  );
}

export function InspectionsModule() {
  const [settings, setSettings]         = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [inspections]                   = useState(SAMPLE_INSPECTIONS);

  useEffect(() => { setSettings(loadModuleSettings("inspections")); }, []);

  const isConnected  = !!(settings.tableId && settings.reportId);
  const total        = inspections.length;
  const passed       = inspections.filter(i => i.result === "Pass").length;
  const failed       = inspections.filter(i => i.result === "Fail").length;
  const rework       = inspections.filter(i => i.result === "Rework").length;
  const passRate     = total ? Math.round((passed / total) * 100) : 0;
  const totalDefects = inspections.reduce((s, i) => s + i.defects, 0);

  return (
    <div style={{ padding: "20px 24px 48px" }}>
      {showSettings && (
        <SettingsModal
          dashboardLabel="Inspections"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={s => { saveModuleSettings("inspections", s); setSettings(s); setShowSettings(false); }}
        />
      )}

      <HeroBanner
        title="Inspections"
        subtitle="QC inspection records, pass/fail tracking, and defect visibility across all production runs."
        chips={[
          { label: "Total",     value: String(total),       sub: "All inspections" },
          { label: "Pass Rate", value: `${passRate}%`,      sub: `${passed} passed` },
          { label: "Failed",    value: String(failed),      sub: "Require action" },
        ]}
      >
        <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "#fff", color: "var(--t-brand)" }}>Inspections</button>
      </HeroBanner>

      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowSettings(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2, fontFamily: "inherit" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Configure QB
        </button>
      </div>

      {!isConnected && (
        <ConnectBanner
          accent={ACCENT}
          message="Connect a Quickbase report to load live inspection records."
          onSettings={() => setShowSettings(true)}
        />
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <ModuleKpiCard label="Total Inspections" value={total}           sub="All-time sample data"        accent={ACCENT} />
        <ModuleKpiCard label="Pass Rate"         value={`${passRate}%`} sub={`${passed} of ${total} passed`} accent={C.success} />
        <ModuleKpiCard label="Failed"            value={failed}         sub="Require rework or scrap"     accent={C.danger} />
        <ModuleKpiCard label="Rework"            value={rework}         sub="Conditional pass"            accent={C.warningText} />
        <ModuleKpiCard label="Total Defects"     value={totalDefects}   sub="Across all inspections"      accent={C.brand} />
      </div>

      {/* Pass/Fail bar */}
      <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: "18px 20px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.text2, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Inspection Results Breakdown</p>
        <div style={{ display: "flex", height: 20, borderRadius: 999, overflow: "hidden", background: C.bg }}>
          {passed > 0 && <div style={{ flex: passed,  background: C.success    }} title={`Pass: ${passed}`} />}
          {rework > 0 && <div style={{ flex: rework,  background: C.warningText}} title={`Rework: ${rework}`} />}
          {failed > 0 && <div style={{ flex: failed,  background: C.danger     }} title={`Fail: ${failed}`} />}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {[["Pass", C.success, passed], ["Rework", C.warningText, rework], ["Fail", C.danger, failed]].map(([l, color, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.text2 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
              {l}: <strong style={{ color: C.text1 }}>{v}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Inspection Records</span>
          {!isConnected && <span style={{ fontSize: 11, color: C.text3 }}>Sample data — connect QB to load live records</span>}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {["Inspection ID", "Order", "Product", "Inspector", "Date", "Result", "Defects", "Notes"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: C.text3, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspections.map((row, i) => (
                <tr key={row.id} style={{ borderBottom: i < inspections.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: ACCENT }}>{row.id}</td>
                  <td style={{ padding: "10px 14px", color: C.text2 }}>{row.order}</td>
                  <td style={{ padding: "10px 14px", color: C.text1 }}>{row.product}</td>
                  <td style={{ padding: "10px 14px", color: C.text2 }}>{row.inspector}</td>
                  <td style={{ padding: "10px 14px", color: C.text2, whiteSpace: "nowrap" }}>{row.date}</td>
                  <td style={{ padding: "10px 14px" }}><ResultBadge result={row.result} /></td>
                  <td style={{ padding: "10px 14px", color: row.defects > 0 ? C.danger : C.text1, fontWeight: row.defects > 0 ? 700 : 400 }}>{row.defects}</td>
                  <td style={{ padding: "10px 14px", color: C.text2 }}>{row.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

registerModule({
  id:             "inspections",
  label:          "Inspections",
  iconKey:        "checklist",
  group:          "modules",
  component:      InspectionsModule,
  accentColor:    "var(--t-teal)",
  description:    "QC inspection records, pass/fail rates, inspector assignments, and defect tracking per production run.",
  overviewStatus: "configure",
});
