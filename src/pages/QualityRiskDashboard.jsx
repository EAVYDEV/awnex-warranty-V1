import { useEffect, useMemo, useState } from "react";
import { T } from "../../lib/tokens";
import AppHeader from "../components/AppHeader";
import CaseTable from "../../components/quality/CaseTable";
import CaseCard from "../../components/quality/CaseCard";
import CreateCaseModal from "../../components/quality/CreateCaseModal";
import CaseDetailPanel from "../../components/quality/CaseDetailPanel";
import { SettingsModal } from "../../components/SettingsModal.jsx";
import { loadModuleSettings, saveModuleSettings } from "../../lib/dashboardStorage";
import {
  calculateRiskLevel,
  calculateRiskScore,
  canAdvanceStatus,
  canCloseCase,
  isContainmentRequired,
  isFieldImpactReviewRequired,
} from "../../lib/qualityRiskUtils";
import { getQualityRiskDashboardData } from "../../lib/qualityRiskDataSource";

const dashboardTabs = ["Overview", "Active Cases", "High Risk", "Field Impact", "CAPA Tracking", "Trends"];


function hydrateCase(caseRecord) {
  const riskScore = calculateRiskScore(caseRecord);
  return {
    ...caseRecord,
    riskScore,
    riskLevel: calculateRiskLevel(riskScore),
    containmentRequired: isContainmentRequired(caseRecord),
    fieldImpactReviewRequired: isFieldImpactReviewRequired(caseRecord),
  };
}

export default function QualityRiskDashboard() {
  const [cases, setCases] = useState([]);
  const [trendData, setTrendData] = useState({ byDepartment: [], bySeverity: [], recurringCategories: [] });
  const [activeTab, setActiveTab] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [qualitySettings, setQualitySettings] = useState({ tableId: "", reportId: "" });
  const [showQualitySettings, setShowQualitySettings] = useState(false);

  useEffect(() => {
    setQualitySettings(loadModuleSettings("quality"));
    fetch("/api/settings")
      .then(r => r.json())
      .then(s => {
        if (s.qualityTableId || s.qualityReportId) {
          const ns = { tableId: s.qualityTableId || "", reportId: s.qualityReportId || "" };
          setQualitySettings(ns);
          saveModuleSettings("quality", ns);
        }
      })
      .catch(() => {});
  }, []);


  useEffect(() => {
    let mounted = true;
    getQualityRiskDashboardData().then((data) => {
      if (!mounted) return;
      setCases((data.cases || []).map(hydrateCase));
      setTrendData(data.trends || { byDepartment: [], bySeverity: [], recurringCategories: [] });
    });
    return () => { mounted = false; };
  }, []);
  const selectedCase = useMemo(() => cases.find((c) => c.id === selectedCaseId) || null, [cases, selectedCaseId]);

  const filteredCases = useMemo(() => {
    if (activeTab === "Active Cases") return cases.filter((c) => c.status !== "Closed");
    if (activeTab === "High Risk") return cases.filter((c) => c.riskScore >= 8 || c.severity === "Critical");
    if (activeTab === "Field Impact") return cases.filter((c) => c.fieldImpact);
    if (activeTab === "CAPA Tracking") return cases.filter((c) => c.status === "CAPA" || c.capaActions.some((a) => !["Complete", "Verified"].includes(a.status)));
    return cases;
  }, [activeTab, cases]);

  const kpi = useMemo(() => {
    const open = cases.filter((c) => c.status !== "Closed").length;
    const critical = cases.filter((c) => c.severity === "Critical").length;
    const fieldImpact = cases.filter((c) => c.fieldImpact).length;
    const avgDaysOpen = cases.length ? Math.round(cases.reduce((sum, c) => sum + Math.max(0, Math.floor((Date.now() - new Date(c.dateReported).getTime()) / 86400000)), 0) / cases.length) : 0;
    return { open, critical, fieldImpact, avgDaysOpen };
  }, [cases]);

  const handleCreate = (newCase) => {
    const now = new Date().toISOString().slice(0, 10);
    const created = hydrateCase({
      id: `QRC-${String(cases.length + 1).padStart(3, "0")}`,
      status: "Open",
      dateReported: now,
      containmentSummary: "",
      rootCauseSummary: "",
      verifiedRootCause: "",
      closureSummary: "",
      capaActions: [],
      affectedOrders: [],
      evidenceItems: [],
      rca: { suspectedRootCauses: [] },
      containment: { actions: [] },
      closure: {},
      fieldImpactReviewStatus: "Not Started",
      fieldImpactLeadershipAcceptedUncertainty: false,
      ...newCase,
    });
    setCases((prev) => [created, ...prev]);
    setShowCreate(false);
  };

  const saveCase = (updatedCase) => {
    const hydrated = hydrateCase(updatedCase);
    setCases((prev) => prev.map((c) => (c.id === hydrated.id ? hydrated : c)));
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "24px 24px 48px", fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {showQualitySettings && (
        <SettingsModal
          dashboardLabel="Quality Risk & RCA"
          initialTableId={qualitySettings.tableId}
          initialReportId={qualitySettings.reportId}
          onClose={() => setShowQualitySettings(false)}
          onSave={s => {
            const ns = { tableId: s.tableId, reportId: s.reportId };
            saveModuleSettings("quality", ns);
            setQualitySettings(ns);
            setShowQualitySettings(false);
            fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qualityTableId: ns.tableId, qualityReportId: ns.reportId }) }).catch(() => {});
          }}
        />
      )}
      <div>
        <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <AppHeader />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setShowQualitySettings(true)}
              title="Configure Quickbase connection"
              style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${T.borderLight}`, background: T.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.text2, boxShadow: T.cardShadow }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
            <button onClick={() => setShowCreate(true)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${T.borderLight}`, background: T.brand, color: T.card, fontSize: 13, fontWeight: 700, boxShadow: T.cardShadow, cursor: "pointer" }}>Create Case</button>
          </div>
        </div>

        <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {dashboardTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "7px 14px", borderRadius: 10, border: `1px solid ${T.borderLight}`, background: activeTab === tab ? T.brand : T.card, color: activeTab === tab ? T.card : T.text2, fontSize: 12, fontWeight: 600 }}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {[ ["Open Cases", kpi.open], ["Critical Issues", kpi.critical], ["Field Impact Cases", kpi.fieldImpact], ["Average Days Open", kpi.avgDaysOpen] ].map(([label, value]) => (
              <div key={label} style={{ borderRadius: 20, border: `1px solid ${T.borderLight}`, background: T.card, padding: 16, boxShadow: T.cardShadow }}><p style={{ fontSize: 11, color: T.text3, margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p><p style={{ fontSize: 40, margin: "4px 0 0", fontWeight: 700, color: T.text1 }}>{value}</p></div>
            ))}
          </div>
        )}

        {activeTab === "Trends" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
            {[
              { title: "Cases by Department", rows: trendData.byDepartment },
              { title: "Cases by Severity", rows: trendData.bySeverity },
              { title: "Recurring Issue Categories", rows: trendData.recurringCategories },
            ].map((card) => (
              <div key={card.title} style={{ borderRadius: 16, border: `1px solid ${T.borderLight}`, background: T.card, padding: 16, boxShadow: T.cardShadow }}>
                <h3 style={{ margin: 0, color: T.text1, fontSize: 36, fontWeight: 700 }}>{card.title}</h3>
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  {card.rows.map((item) => (
                    <div key={item.label} style={{ display: "grid", gridTemplateColumns: "160px 1fr auto", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14, color: T.text2, fontWeight: 600 }}>{item.label}</span>
                      <div style={{ width: "100%", height: 10, borderRadius: 999, background: T.bg }}>
                        <div style={{ width: `${Math.min(100, item.value * 12)}%`, height: "100%", borderRadius: 999, background: T.brand }} />
                      </div>
                      <span style={{ fontSize: 14, color: T.text1, fontWeight: 700 }}>{item.value}</span>
                    </div>
                  ))}
                  {card.rows.length === 0 && <p style={{ margin: 0, color: T.text3, fontSize: 13 }}>No trend data available.</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <CaseTable cases={filteredCases} onSelect={(c) => setSelectedCaseId(c.id)} />
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases.map((c) => <CaseCard key={c.id} caseRecord={c} onView={() => setSelectedCaseId(c.id)} />)}
            </div>
          </>
        )}

        <CreateCaseModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />

        {selectedCase && (
          <CaseDetailPanel
            caseRecord={selectedCase}
            onClose={() => setSelectedCaseId(null)}
            onSave={saveCase}
            canAdvanceStatus={canAdvanceStatus}
            canCloseCase={canCloseCase}
          />
        )}
      </div>
    </div>
  );
}
