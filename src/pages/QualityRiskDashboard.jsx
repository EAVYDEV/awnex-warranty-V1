import { useMemo, useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Awntrak Quality Risk & Root Cause</h1>
            <p className="text-sm text-slate-600">Issue intake, risk, containment, RCA, CAPA, field impact, evidence, and closure workflow.</p>
            <div className="mt-3 flex gap-2">
              <Link href="/" className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">Warranty</Link>
              <Link href="/quality-risk" className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Quality Risk & RCA</Link>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Create Case</button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {dashboardTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-1 text-sm font-semibold ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            {[ ["Open Cases", kpi.open], ["Critical Issues", kpi.critical], ["Field Impact Cases", kpi.fieldImpact], ["Average Days Open", kpi.avgDaysOpen] ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div>
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
