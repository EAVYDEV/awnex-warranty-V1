import { useMemo, useState } from "react";
import { STATUS_FLOW, canAdvanceStatus, canCloseCase } from "../../lib/qualityRiskUtils";
import CaseHeader from "./CaseHeader";
import CaseStatusStepper from "./CaseStatusStepper";
import CaseSummaryTab from "./CaseSummaryTab";
import RiskAssessmentTab from "./RiskAssessmentTab";
import ContainmentTab from "./ContainmentTab";
import RootCauseTab from "./RootCauseTab";
import CapaTab from "./CapaTab";
import FieldImpactTab from "./FieldImpactTab";
import EvidenceTab from "./EvidenceTab";
import ClosureTab from "./ClosureTab";
import CaseFooterActions from "./CaseFooterActions";

const tabs = ["Summary", "Risk Assessment", "Containment", "RCA", "CAPA", "Field Impact", "Evidence", "Closure"];

export default function CaseDetailPanel({ caseRecord, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState("Summary");
  const [draft, setDraft] = useState(caseRecord);

  const checklist = useMemo(() => {
    const requiredContainment = draft.containmentRequired;
    const fieldImpactRequired = draft.fieldImpact || draft.scope === "Unknown";
    const requiredCapa = draft.capaActions.filter((a) => a.verificationRequired);
    return [
      { label: "Risk assessment complete", complete: Boolean(draft.riskScore && draft.riskLevel) },
      { label: "Containment complete, if required", complete: !requiredContainment || Boolean(draft.containmentSummary) },
      { label: "RCA complete", complete: Boolean(draft.rca?.problemStatement && draft.rca?.suspectedRootCauses?.length && draft.rca?.rootCauseVerificationStatus) },
      { label: "CAPA actions complete", complete: requiredCapa.length > 0 && requiredCapa.every((a) => ["Complete", "Verified"].includes(a.status)) },
      { label: "Effectiveness check complete", complete: Boolean(draft.closure?.effectivenessResult) },
      { label: "Field impact review complete, if required", complete: !fieldImpactRequired || draft.fieldImpactReviewStatus === "Complete" || draft.fieldImpactLeadershipAcceptedUncertainty },
      { label: "Evidence attached", complete: draft.evidenceItems.length > 0 },
      { label: "Final approval complete", complete: Boolean(draft.closure?.approvedBy && draft.closure?.approvalDate) },
    ];
  }, [draft]);

  const renderTab = () => {
    if (activeTab === "Summary") return <CaseSummaryTab caseRecord={draft} />;
    if (activeTab === "Risk Assessment") return <RiskAssessmentTab caseRecord={draft} onUpdate={setDraft} />;
    if (activeTab === "Containment") return <ContainmentTab caseRecord={draft} onUpdate={setDraft} />;
    if (activeTab === "RCA") return <RootCauseTab caseRecord={draft} onUpdate={setDraft} />;
    if (activeTab === "CAPA") return <CapaTab caseRecord={draft} onUpdate={setDraft} />;
    if (activeTab === "Field Impact") return <FieldImpactTab caseRecord={draft} onUpdate={setDraft} />;
    if (activeTab === "Evidence") return <EvidenceTab caseRecord={draft} onUpdate={setDraft} />;
    return <ClosureTab caseRecord={draft} onUpdate={setDraft} checklist={checklist} />;
  };

  const addCapa = () => setDraft((prev) => ({
    ...prev,
    capaActions: [...prev.capaActions, { actionType: "Corrective Action", actionDescription: "", owner: "", department: prev.department, dueDate: "", status: "Not Started", completionDate: "", verificationRequired: true, notes: "" }],
  }));

  const addEvidence = () => setDraft((prev) => ({
    ...prev,
    evidenceItems: [...prev.evidenceItems, { evidenceType: "Other", description: "", uploadedBy: "", uploadDate: "", relatedPhase: "RCA", fileLink: "" }],
  }));

  const moveNext = () => {
    if (!canAdvanceStatus(draft)) return;
    const idx = STATUS_FLOW.indexOf(draft.status);
    setDraft({ ...draft, status: STATUS_FLOW[idx + 1] });
  };

  const closeCase = () => {
    if (!canCloseCase(draft)) return;
    setDraft({ ...draft, status: "Closed" });
    onSave({ ...draft, status: "Closed" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40">
      <div className="ml-auto flex h-full w-full min-w-[320px] max-w-[900px] flex-col bg-white md:w-[48vw] md:min-w-[600px]">
        <CaseHeader caseRecord={draft} onClose={onClose} />
        <CaseStatusStepper status={draft.status} />
        <div className="border-b border-slate-200 px-3 py-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-2 py-1 text-xs font-semibold ${activeTab === tab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>{tab}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{renderTab()}</div>
        <CaseFooterActions
          canAdvance={canAdvanceStatus(draft)}
          canClose={canCloseCase(draft)}
          onSave={() => onSave(draft)}
          onAddCapa={addCapa}
          onAddEvidence={addEvidence}
          onNextPhase={moveNext}
          onCloseCase={closeCase}
        />
      </div>
    </div>
  );
}
