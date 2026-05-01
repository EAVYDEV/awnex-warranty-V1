import { useEffect, useMemo, useState } from "react";
import { T } from "../../lib/tokens";
import AppHeader from "../components/AppHeader";
import CaseTable from "../components/quality/CaseTable";
import CaseCard from "../components/quality/CaseCard";
import CreateCaseModal from "../components/quality/CreateCaseModal";
import CaseDetailPanel from "../components/quality/CaseDetailPanel";
import {
  calculateRiskLevel,
  calculateRiskScore,
  canAdvanceStatus,
  canCloseCase,
  isContainmentRequired,
  isFieldImpactReviewRequired,
} from "../lib/qualityRiskUtils";
import { getQualityRiskDashboardData } from "../lib/qualityRiskDataSource";

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
      <div>
        <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <AppHeader />
          <button onClick={() => setShowCreate(true)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${T.borderLight}`, background: T.brand, color: T.card, fontSize: 13, fontWeight: 700, boxShadow: T.cardShadow, cursor: "pointer" }}>Create Case</button>
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
