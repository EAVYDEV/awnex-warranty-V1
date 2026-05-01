import { useMemo, useState } from "react";
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

const dashboardTabs = ["Overview", "Active Cases", "High Risk", "Field Impact", "CAPA Tracking", "Trends"];

const starterCases = [
  {
    id: "QRC-001",
    title: "Powder coat blistering after install",
    description: "Customer complaint received for blistering at welded seam in coastal environment.",
    severity: "High",
    scope: "Multiple Orders",
    detectionRisk: "Partially Known",
    status: "Containment",
    department: "Quality",
    reportedBy: "R. Lopez",
    dateReported: "2026-04-08",
    owner: "M. Nguyen",
    fieldImpact: true,
    customerImpact: true,
    safetyImpact: false,
    containmentSummary: "Stop ship on affected finish lot and launch inspection lot segregation.",
    rootCauseSummary: "",
    verifiedRootCause: "",
    closureSummary: "",
    capaActions: [{ actionType: "Corrective Action", actionDescription: "Add seam prep verification", owner: "M. Nguyen", department: "Manufacturing", dueDate: "2026-05-02", status: "In Progress", completionDate: "", verificationRequired: true, notes: "Pilot line first" }],
    affectedOrders: [{ orderNumber: "AW-88219", customer: "Metro Retail", location: "Dallas", shipDate: "2026-03-11", installStatus: "Installed", suspectedImpact: "Surface failure", verificationStatus: "Potentially Affected", notes: "Follow-up scheduled" }],
    evidenceItems: [{ evidenceType: "Photo", description: "Coating blister sample", uploadedBy: "R. Lopez", uploadDate: "2026-04-09", relatedPhase: "Intake", fileLink: "https://files.local/qrc-001-photo-1" }],
    rca: { problemStatement: "Coating delamination at seam region", suspectedRootCauses: ["Inconsistent pretreatment"], rootCauseVerificationStatus: "Not Yet Verified" },
    containment: { containmentRequired: true, productHoldRequired: true, productionStopRequired: false, customerNotificationNeeded: true, actions: [] },
    closure: {},
    fieldImpactReviewStatus: "In Progress",
    fieldImpactLeadershipAcceptedUncertainty: false,
  },
  {
    id: "QRC-002",
    title: "Arm bracket hole mismatch",
    description: "Inspection discovered recurring bracket mismatch during assembly.",
    severity: "Medium",
    scope: "Batch",
    detectionRisk: "Known Extent",
    status: "RCA",
    department: "Engineering",
    reportedBy: "L. Martin",
    dateReported: "2026-04-14",
    owner: "K. Patel",
    fieldImpact: false,
    customerImpact: false,
    safetyImpact: false,
    containmentSummary: "Incoming bracket sort and temporary drill fixture update.",
    rootCauseSummary: "",
    verifiedRootCause: "",
    closureSummary: "",
    capaActions: [{ actionType: "SOP Update", actionDescription: "Update drill setup SOP", owner: "K. Patel", department: "Engineering", dueDate: "2026-04-30", status: "Not Started", completionDate: "", verificationRequired: true, notes: "" }],
    affectedOrders: [],
    evidenceItems: [],
    rca: { problemStatement: "Hole centerline offset", suspectedRootCauses: ["Fixture wear"], rootCauseVerificationStatus: "Not Yet Verified" },
    containment: { containmentRequired: true, actions: [] },
    closure: {},
    fieldImpactReviewStatus: "Not Started",
    fieldImpactLeadershipAcceptedUncertainty: false,
  },
];

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
  const [cases, setCases] = useState(starterCases.map(hydrateCase));
  const [activeTab, setActiveTab] = useState("Overview");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

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
    const avgDaysOpen = Math.round(cases.reduce((sum, c) => sum + Math.max(0, Math.floor((Date.now() - new Date(c.dateReported).getTime()) / 86400000)), 0) / cases.length);
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
    <div style={{ minHeight: "100vh", background: T.bg, padding: 24, fontFamily: "DM Sans, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {["Cases by Department", "Cases by Severity", "Recurring Issue Categories"].map((card) => (
              <div key={card} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold text-slate-900">{card}</h3><p className="mt-2 text-sm text-slate-600">Trend placeholder for future chart integration.</p></div>
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
