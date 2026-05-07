import { useState, useEffect, useMemo } from "react";
import { colors } from "../../lib/tokens.js";
import { SettingsModal } from "../SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage.js";
import { registerModule } from "../../lib/moduleRegistry.js";
import { HeroBanner, ConnectBanner, ModuleKpiCard } from "../ui/ModuleShared.jsx";
import CaseTable from "../quality/CaseTable.jsx";
import CaseDetailPanel from "../quality/CaseDetailPanel.jsx";
import CreateCaseModal from "../quality/CreateCaseModal.jsx";
import {
  calculateRiskLevel, calculateRiskScore,
  canAdvanceStatus, canCloseCase,
} from "../../lib/qualityRiskUtils.js";
import { getQualityRiskDashboardData } from "../../lib/qualityRiskDataSource.js";

const C      = colors;
const ACCENT = C.danger;

const TABS = ["All NCRs", "Open", "High Risk", "Field Impact", "Closed"];

function hydrateCase(c) {
  const riskScore = calculateRiskScore(c);
  return { ...c, riskScore, riskLevel: calculateRiskLevel(riskScore) };
}

function btnStyle(variant) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    ...(variant === "primary"
      ? { background: ACCENT, border: "none", color: C.card }
      : { background: C.card, border: `1px solid ${C.borderLight}`, color: C.text2 }
    ),
  };
}

export function NcrModule({ onNavigate }) {
  const [settings, setSettings]             = useState({ tableId: "", reportId: "" });
  const [showSettings, setShowSettings]     = useState(false);
  const [cases, setCases]                   = useState([]);
  const [activeTab, setActiveTab]           = useState("All NCRs");
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [showCreate, setShowCreate]         = useState(false);

  useEffect(() => {
    setSettings(loadModuleSettings("ncrs"));
    let mounted = true;
    getQualityRiskDashboardData().then(data => {
      if (!mounted) return;
      setCases((data.cases || []).map(hydrateCase));
    });
    return () => { mounted = false; };
  }, []);

  const isConnected = !!(settings.tableId && settings.reportId);

  const kpi = useMemo(() => ({
    open:        cases.filter(c => c.status !== "Closed").length,
    critical:    cases.filter(c => c.severity === "Critical").length,
    fieldImpact: cases.filter(c => c.fieldImpact).length,
    closed:      cases.filter(c => c.status === "Closed").length,
  }), [cases]);

  const filteredCases = useMemo(() => {
    if (activeTab === "Open")         return cases.filter(c => c.status !== "Closed");
    if (activeTab === "High Risk")    return cases.filter(c => c.riskScore >= 8 || c.severity === "Critical");
    if (activeTab === "Field Impact") return cases.filter(c => c.fieldImpact);
    if (activeTab === "Closed")       return cases.filter(c => c.status === "Closed");
    return cases;
  }, [activeTab, cases]);

  const selectedCase = useMemo(() => cases.find(c => c.id === selectedCaseId) || null, [cases, selectedCaseId]);

  const handleCreate = newCase => {
    const now     = new Date().toISOString().slice(0, 10);
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

  const saveCase = updated => {
    const hydrated = hydrateCase(updated);
    setCases(prev => prev.map(c => c.id === hydrated.id ? hydrated : c));
  };

  return (
    <div style={{ padding: "20px 24px 48px" }}>
      {showSettings && (
        <SettingsModal
          dashboardLabel="Non-Conformances"
          initialTableId={settings.tableId}
          initialReportId={settings.reportId}
          onClose={() => setShowSettings(false)}
          onSave={s => { saveModuleSettings("ncrs", s); setSettings(s); setShowSettings(false); }}
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

      <HeroBanner
        title="Quality Intelligence"
        subtitle="Log, investigate, and resolve non-conforming product events with full root-cause traceability."
        chips={[
          { label: "Open",         value: String(kpi.open),        sub: "Require investigation" },
          { label: "Critical",     value: String(kpi.critical),    sub: "Immediate attention" },
          { label: "Field Impact", value: String(kpi.fieldImpact), sub: "Installed product risk" },
        ]}
      >
        <button style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "#fff", color: "var(--t-brand)" }}>Quality Intelligence</button>
        <button onClick={() => onNavigate?.("capas")} style={{ fontFamily: "inherit", border: "none", cursor: "pointer", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.15)", color: "#fff" }}>Field Execution</button>
      </HeroBanner>

      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowSettings(true)} style={btnStyle("outline")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Configure QB
        </button>
        <button onClick={() => setShowCreate(true)} style={{ ...btnStyle("primary"), background: ACCENT }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log NCR
        </button>
      </div>

      {!isConnected && (
        <ConnectBanner
          accent={ACCENT}
          message="Connect a Quickbase report to load live NCR records."
          onSettings={() => setShowSettings(true)}
        />
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <ModuleKpiCard label="Open NCRs"       value={kpi.open}        sub="Require investigation"  accent={ACCENT} />
        <ModuleKpiCard label="Critical Issues" value={kpi.critical}    sub="Immediate attention"    accent={C.danger} />
        <ModuleKpiCard label="Field Impact"    value={kpi.fieldImpact} sub="Installed product risk" accent={C.warningText} />
        <ModuleKpiCard label="Closed"          value={kpi.closed}      sub="Resolved this period"   accent={C.success} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            border:      `1px solid ${activeTab === tab ? ACCENT : C.borderLight}`,
            background:  activeTab === tab ? ACCENT : C.card,
            color:       activeTab === tab ? C.card  : C.text2,
          }}>
            {tab}
            <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.8 }}>
              ({tab === "All NCRs" ? cases.length : tab === "Open" ? kpi.open : tab === "High Risk" ? cases.filter(c => c.riskScore >= 8 || c.severity === "Critical").length : tab === "Field Impact" ? kpi.fieldImpact : kpi.closed})
            </span>
          </button>
        ))}
      </div>

      <CaseTable cases={filteredCases} onSelect={c => setSelectedCaseId(c.id)} />
    </div>
  );
}

registerModule({
  id:             "ncrs",
  label:          "Quality Intelligence",
  iconKey:        "alert",
  group:          "modules",
  component:      NcrModule,
  accentColor:    colors.danger,
  description:    "Log, investigate, and resolve non-conforming product events with root-cause analysis and disposition tracking.",
  overviewStatus: "configure",
});
