import { useState, useEffect, useMemo } from "react";
import { colors, T } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";
import { getQualityRiskDashboardData } from "../../src/lib/qualityRiskDataSource.js";
import { calculateRiskLevel, calculateRiskScore, canAdvanceStatus, canCloseCase } from "../../src/lib/qualityRiskUtils.js";
import CaseDetailPanel from "../../src/components/quality/CaseDetailPanel.jsx";

const C = colors;
const ACCENT = C.purple;

const STATUS_ORDER = ["Open", "Containment", "RCA", "CAPA", "Verification", "Closed"];

const STATUS_CFG = {
  Open:         { bg: C.dangerSubtle,  text: C.dangerText,   dot: C.danger   },
  Containment:  { bg: C.warningSoft,   text: C.warningText,  dot: C.warning  },
  RCA:          { bg: C.brandSubtle,   text: C.brandDark,    dot: C.brand    },
  CAPA:         { bg: C.purpleSubtle,  text: C.purpleText,   dot: ACCENT     },
  Verification: { bg: C.tealSubtle,    text: C.tealText,     dot: C.teal     },
  Closed:       { bg: C.successSubtle, text: C.successText,  dot: C.success  },
};

function hydrateCase(c) {
  const riskScore = calculateRiskScore(c);
  return { ...c, riskScore, riskLevel: calculateRiskLevel(riskScore) };
}

function btnStyle(variant) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer",
    ...(variant === "primary"
      ? { background: ACCENT, border: "none", color: "#fff" }
      : { background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }
    ),
  };
}

function KpiCard({ label, value, sub }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 6, padding: "14px 16px", boxShadow: T.cardShadow }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: C.text1, margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ fontSize: 11.5, color: C.text3, fontWeight: 500, margin: "4px 0 0" }}>{sub}</p>}
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

function ConnectBanner({ onSettings }) {
  return (
    <div style={{ background: ACCENT + "10", border: `1px dashed ${ACCENT}`, borderRadius: 6, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 2px" }}>Showing sample data</p>
        <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Connect a Quickbase report to load live CAPA records.</p>
      </div>
      <button onClick={onSettings} style={{ ...btnStyle("primary"), background: ACCENT }}>Connect QB Report</button>
    </div>
  );
}

function PipelineBar({ cases }) {
  const counts = STATUS_ORDER.map(s => ({
    status: s,
    count: cases.filter(c => c.status === s).length,
    cfg: STATUS_CFG[s],
  }));
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 6, padding: "18px 20px", marginBottom: 24, boxShadow: T.cardShadow }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.text2, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>CAPA Pipeline</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {counts.map(({ status, count, cfg }) => (
          <div key={status} style={{ flex: "1 1 80px", background: cfg.bg, border: `1px solid ${cfg.dot}30`, borderRadius: 6, padding: "10px 14px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: cfg.text }}>{count}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: cfg.text, opacity: 0.8, marginTop: 2 }}>{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionRow({ action, caseId }) {
  const overdue = action.dueDate && new Date(action.dueDate) < new Date() && action.status !== "Complete" && action.status !== "Verified";
  return (
    <tr>
      <td style={{ padding: "10px 14px", color: ACCENT, fontWeight: 700, fontSize: 12 }}>{caseId}</td>
      <td style={{ padding: "10px 14px", color: C.text1, fontSize: 12 }}>{action.description}</td>
      <td style={{ padding: "10px 14px", color: C.text2, fontSize: 12 }}>{action.owner || "—"}</td>
      <td style={{ padding: "10px 14px", fontSize: 12 }}>
        {action.dueDate
          ? <span style={{ color: overdue ? C.danger : C.text2, fontWeight: overdue ? 700 : 400 }}>{action.dueDate}{overdue ? " ⚠" : ""}</span>
          : <span style={{ color: C.text3 }}>—</span>}
      </td>
      <td style={{ padding: "10px 14px" }}>
        <StatusBadge status={action.status || "Open"} />
      </td>
    </tr>
  );
}

export function CapaModule() {
  const [settings, setSettings]             = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings]     = useState(false);
  const [cases, setCases]                   = useState([]);
  const [activeTab, setActiveTab]           = useState("All CAPAs");
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    setSettings(loadModuleSettings("capas"));
    let mounted = true;
    getQualityRiskDashboardData().then((data) => {
      if (!mounted) return;
      setCases((data.cases || []).map(hydrateCase));
    });
    return () => { mounted = false; };
  }, []);

  const isConnected = !!(settings.tableId && settings.reportId);
  const selectedCase = useMemo(() => cases.find(c => c.id === selectedCaseId) || null, [cases, selectedCaseId]);

  const allActions = useMemo(() =>
    cases.flatMap(c => (c.capaActions || []).map(a => ({ ...a, caseId: c.id }))),
    [cases]
  );

  const kpi = useMemo(() => {
    const open     = cases.filter(c => c.status !== "Closed").length;
    const inCapaPhase = cases.filter(c => c.status === "CAPA").length;
    const overdue  = allActions.filter(a => a.dueDate && new Date(a.dueDate) < new Date() && a.status !== "Complete" && a.status !== "Verified").length;
    const closed   = cases.filter(c => c.status === "Closed").length;
    const onTime   = closed ? Math.round((cases.filter(c => c.status === "Closed" && !allActions.some(a => a.caseId === c.id && a.dueDate && new Date(a.dueDate) < new Date(c.closedDate || Date.now()))).length / closed) * 100) : 0;
    return { open, inCapaPhase, overdue, closed, onTime };
  }, [cases, allActions]);

  const filteredActions = useMemo(() => {
    if (activeTab === "Overdue") return allActions.filter(a => a.dueDate && new Date(a.dueDate) < new Date() && a.status !== "Complete" && a.status !== "Verified");
    if (activeTab === "In Progress") return allActions.filter(a => a.status !== "Complete" && a.status !== "Verified");
    if (activeTab === "Completed") return allActions.filter(a => a.status === "Complete" || a.status === "Verified");
    return allActions;
  }, [activeTab, allActions]);

  const saveCase = (updated) => {
    setCases(prev => prev.map(c => c.id === updated.id ? hydrateCase(updated) : c));
  };

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {showSettings && (
        <SettingsModal
          dashboardLabel="Corrective Actions (CAPA)"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={(s) => { saveModuleSettings("capas", s); setSettings(s); setShowSettings(false); }}
        />
      )}
      {selectedCase && (
        <CaseDetailPanel
          caseRecord={selectedCase}
          onClose={() => setSelectedCaseId(null)}
          onSave={saveCase}
          canAdvanceStatus={canAdvanceStatus}
          canCloseCase={canCloseCase}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: ACCENT }} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: 0 }}>Corrective Actions (CAPA)</h1>
            <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Full CAPA lifecycle — initiation through verified closure</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} style={btnStyle("outline")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Configure QB
        </button>
      </div>

      {!isConnected && <ConnectBanner onSettings={() => setShowSettings(true)} />}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Open Cases"      value={kpi.open}        sub="Require action" />
        <KpiCard label="In CAPA Phase"   value={kpi.inCapaPhase} sub="Action items in flight" />
        <KpiCard label="Overdue Actions" value={kpi.overdue}     sub="Past due date" />
        <KpiCard label="Closed"          value={kpi.closed}      sub="Verified closed" />
      </div>

      {/* Pipeline */}
      <PipelineBar cases={cases} />

      {/* Action items table */}
      <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 6, boxShadow: T.cardShadow, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Action Items</span>
          <span style={{ fontSize: 11, color: C.text3, marginLeft: 4 }}>({allActions.length} total)</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["All Actions", "Overdue", "In Progress", "Completed"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${activeTab === tab ? ACCENT : C.borderLight}`,
                background: activeTab === tab ? ACCENT : C.surface,
                color: activeTab === tab ? "#fff" : C.text2,
              }}>{tab}</button>
            ))}
          </div>
        </div>
        {filteredActions.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: C.text3, fontSize: 13 }}>No action items in this view.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {["Case", "Action", "Owner", "Due Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: C.text3, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((action, i) => (
                  <ActionRow key={`${action.caseId}-${i}`} action={action} caseId={action.caseId} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cases table for drilling in */}
      <div style={{ marginTop: 24, background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 6, boxShadow: T.cardShadow, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.borderLight}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text1 }}>Cases</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.surface }}>
                {["ID", "Title", "Severity", "Status", "CAPA Actions", ""].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: C.text3, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < cases.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: ACCENT }}>{c.id}</td>
                  <td style={{ padding: "10px 14px", color: C.text1 }}>{c.title}</td>
                  <td style={{ padding: "10px 14px", color: C.text2 }}>{c.severity}</td>
                  <td style={{ padding: "10px 14px" }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding: "10px 14px", color: C.text2 }}>{(c.capaActions || []).length} action{(c.capaActions || []).length !== 1 ? "s" : ""}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button onClick={() => setSelectedCaseId(c.id)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid ${C.borderLight}`, background: C.surface, cursor: "pointer", color: C.text2 }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
