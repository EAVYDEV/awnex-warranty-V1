import { useState, useEffect, useMemo } from "react";
import { colors } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";
import CaseTable from "../../src/components/quality/CaseTable.jsx";
import CaseDetailPanel from "../../src/components/quality/CaseDetailPanel.jsx";
import CreateCaseModal from "../../src/components/quality/CreateCaseModal.jsx";
import {
  calculateRiskLevel,
  calculateRiskScore,
  canAdvanceStatus,
  canCloseCase,
} from "../../src/lib/qualityRiskUtils.js";
import { getQualityRiskDashboardData } from "../../src/lib/qualityRiskDataSource.js";

const C = colors;
const ACCENT = "#DC2626";

const TABS = ["All NCRs", "Open", "High Risk", "Field Impact", "Closed"];

function hydrateCase(c) {
  const riskScore = calculateRiskScore(c);
  return { ...c, riskScore, riskLevel: calculateRiskLevel(riskScore) };
}

function btnStyle(variant) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
    ...(variant === "primary"
      ? { background: ACCENT, border: "none", color: "#fff" }
      : { background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }
    ),
  };
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(15,23,42,0.06)", borderTop: `3px solid ${accent}` }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color: C.text1, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.text2, margin: "6px 0 0" }}>{sub}</p>}
    </div>
  );
}

function ConnectBanner({ onSettings }) {
  return (
    <div style={{ background: ACCENT + "10", border: `1px dashed ${ACCENT}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.text1, margin: "0 0 2px" }}>Showing sample data</p>
        <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Connect a Quickbase report to load live NCR records.</p>
      </div>
      <button onClick={onSettings} style={{ ...btnStyle("primary"), background: ACCENT }}>Connect QB Report</button>
    </div>
  );
}

export function NcrModule() {
  const [settings, setSettings]           = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings]   = useState(false);
  const [cases, setCases]                 = useState([]);
  const [activeTab, setActiveTab]         = useState("All NCRs");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCreate, setShowCreate]       = useState(false);

  useEffect(() => {
    setSettings(loadModuleSettings("ncrs"));
    let mounted = true;
    getQualityRiskDashboardData().then((data) => {
      if (!mounted) return;
      setCases((data.cases || []).map(hydrateCase));
    });
    return () => { mounted = false; };
  }, []);

  const isConnected = !!(settings.tableId && settings.reportId);

  const filteredCases = useMemo(() => {
    if (activeTab === "Open")        return cases.filter(c => c.status !== "Closed");
    if (activeTab === "High Risk")   return cases.filter(c => c.riskScore >= 8 || c.severity === "Critical");
    if (activeTab === "Field Impact") return cases.filter(c => c.fieldImpact);
    if (activeTab === "Closed")      return cases.filter(c => c.status === "Closed");
    return cases;
  }, [activeTab, cases]);

  const selectedCase = useMemo(() => cases.find(c => c.id === selectedCaseId) || null, [cases, selectedCaseId]);

  const kpi = useMemo(() => ({
    open:        cases.filter(c => c.status !== "Closed").length,
    critical:    cases.filter(c => c.severity === "Critical").length,
    fieldImpact: cases.filter(c => c.fieldImpact).length,
    closed:      cases.filter(c => c.status === "Closed").length,
  }), [cases]);

  const handleCreate = (newCase) => {
    const now = new Date().toISOString().slice(0, 10);
    const created = hydrateCase({
      id: `NCR-${String(cases.length + 1).padStart(3, "0")}`,
      status: "Open", dateReported: now,
      containmentSummary: "", rootCauseSummary: "", verifiedRootCause: "",
      closureSummary: "", capaActions: [], affectedOrders: [], evidenceItems: [],
      rca: { suspectedRootCauses: [] }, containment: { actions: [] }, closure: {},
      fieldImpactReviewStatus: "Not Started",
      fieldImpactLeadershipAcceptedUncertainty: false,
      ...newCase,
    });
    setCases(prev => [created, ...prev]);
    setShowCreate(false);
  };

  const saveCase = (updated) => {
    const hydrated = hydrateCase(updated);
    setCases(prev => prev.map(c => c.id === hydrated.id ? hydrated : c));
  };

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {showSettings && (
        <SettingsModal
          dashboardLabel="Non-Conformances"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={(s) => { saveModuleSettings("ncrs", s); setSettings(s); setShowSettings(false); }}
        />
      )}
      {showCreate && (
        <CreateCaseModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
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
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text1, margin: 0 }}>Non-Conformances</h1>
            <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>Log, investigate, and resolve NCR events</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSettings(true)} style={btnStyle("outline")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Configure QB
          </button>
          <button onClick={() => setShowCreate(true)} style={{ ...btnStyle("primary"), background: ACCENT }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log NCR
          </button>
        </div>
      </div>

      {!isConnected && <ConnectBanner onSettings={() => setShowSettings(true)} />}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Open NCRs"        value={kpi.open}        sub="Require investigation" accent={ACCENT} />
        <KpiCard label="Critical Issues"  value={kpi.critical}    sub="Immediate attention"   accent={C.danger} />
        <KpiCard label="Field Impact"     value={kpi.fieldImpact} sub="Installed product risk" accent="#D97706" />
        <KpiCard label="Closed"           value={kpi.closed}      sub="Resolved this period"  accent={C.success} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${activeTab === tab ? ACCENT : C.borderLight}`,
              background: activeTab === tab ? ACCENT : C.card,
              color: activeTab === tab ? "#fff" : C.text2,
              cursor: "pointer",
            }}
          >
            {tab}
            <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.8 }}>
              ({tab === "All NCRs" ? cases.length : tab === "Open" ? kpi.open : tab === "High Risk" ? cases.filter(c => c.riskScore >= 8 || c.severity === "Critical").length : tab === "Field Impact" ? kpi.fieldImpact : kpi.closed})
            </span>
          </button>
        ))}
      </div>

      {/* Case table from existing quality components */}
      <CaseTable cases={filteredCases} onSelect={(c) => setSelectedCaseId(c.id)} />
    </div>
  );
}
