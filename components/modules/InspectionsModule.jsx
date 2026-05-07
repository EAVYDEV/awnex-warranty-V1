import { useState, useEffect } from "react";
import { colors, shadows } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";

const C = colors;
const ACCENT = 'var(--t-teal)';
const HERO_GRADIENT = "linear-gradient(115deg, var(--t-brand-deep) 0%, var(--t-brand) 60%, var(--t-brand-light) 100%)";

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────

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
  Rework: { bg: 'var(--t-warning-soft)', text: C.warningText, dot: C.warningText },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function StatChip({ label, value, sub }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: 6, padding: "12px 18px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 6, padding: "14px 16px", boxShadow: shadows.card, display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0, lineHeight: 1.35 }}>{label}</p>
      <div>
        <p style={{ fontSize: 26, fontWeight: 800, color: accent, margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
        {sub && <p style={{ fontSize: 11.5, color: C.text3, margin: "4px 0 0", fontWeight: 500 }}>{sub}</p>}
      </div>
    </div>
  );
}

function ResultBadge({ result }) {
  const cfg = RESULT_CFG[result] || { bg: C.surface, text: C.text2, dot: C.text3 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: cfg.bg, color: cfg.text, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {result}
    </span>
  );
}

function ConnectBanner({ onSettings }) {
  return (
    <div style={{ background: ACCENT + "12", border: `1px dashed ${ACCENT}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>Showing sample data</p>
        <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Connect a Quickbase report to load live inspection records.</p>
      </div>
      <button onClick={onSettings} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: ACCENT, border: "none", color: C.card }}>
        Connect QB Report
      </button>
    </div>
  );
}

// ─── INSPECTIONS MODULE ───────────────────────────────────────────────────────

export function InspectionsModule() {
  const [settings, setSettings]           = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings]   = useState(false);
  const [inspections]                     = useState(SAMPLE_INSPECTIONS);

  useEffect(() => {
    setSettings(loadModuleSettings("inspections"));
  }, []);

  const isConnected = !!(settings.tableId && settings.reportId);

  const total  = inspections.length;
  const passed = inspections.filter(i => i.result === "Pass").length;
  const failed = inspections.filter(i => i.result === "Fail").length;
  const rework = inspections.filter(i => i.result === "Rework").length;
  const passRate = total ? Math.round((passed / total) * 100) : 0;
  const totalDefects = inspections.reduce((s, i) => s + i.defects, 0);

  return (
    <div style={{ padding: "20px 24px 48px" }}>
      {showSettings && (
        <SettingsModal
          dashboardLabel="Inspections"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            saveModuleSettings("inspections", s);
            setSettings(s);
            setShowSettings(false);
          }}
        />
      )}

      {/* Hero Banner */}
      <div style={{ background: HERO_GRADIENT, borderRadius: 13, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ position: "absolute", right: 180, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", right: 220, bottom: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: 0 }}>Inspections</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500, maxWidth: 380, margin: "6px 0 0" }}>QC inspection records, pass/fail tracking, and defect visibility across all production runs.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "#fff", color: "var(--t-brand)" }}>Inspections</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <StatChip label="Total" value={String(total)} sub="All inspections" />
          <StatChip label="Pass Rate" value={`${passRate}%`} sub={`${passed} passed`} />
          <StatChip label="Failed" value={String(failed)} sub="Require action" />
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowSettings(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Configure QB
        </button>
      </div>

      {!isConnected && <ConnectBanner onSettings={() => setShowSettings(true)} />}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <KpiCard label="Total Inspections" value={total}      sub="All-time sample data"      accent={ACCENT} />
        <KpiCard label="Pass Rate"         value={`${passRate}%`} sub={`${passed} of ${total} passed`} accent={C.success} />
        <KpiCard label="Failed"            value={failed}     sub="Require rework or scrap"   accent={C.danger} />
        <KpiCard label="Rework"            value={rework}     sub="Conditional pass"          accent={C.warningText} />
        <KpiCard label="Total Defects"     value={totalDefects} sub="Across all inspections" accent={C.brand} />
      </div>

      {/* Pass/Fail bar */}
      <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: "18px 20px", marginBottom: 24, boxShadow: shadows.card }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.text2, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Inspection Results Breakdown</p>
        <div style={{ display: "flex", gap: 0, height: 20, borderRadius: 999, overflow: "hidden", background: C.bg }}>
          {passed > 0 && <div style={{ flex: passed, background: C.success }} title={`Pass: ${passed}`} />}
          {rework > 0 && <div style={{ flex: rework, background: C.warningText }} title={`Rework: ${rework}`} />}
          {failed > 0 && <div style={{ flex: failed, background: C.danger }} title={`Fail: ${failed}`} />}
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
      <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, boxShadow: shadows.card, overflow: "hidden" }}>
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
