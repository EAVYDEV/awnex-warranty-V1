export const STATUS_FLOW = ["Open", "Containment", "RCA", "CAPA", "Effectiveness Check", "Closed"];

const severityScores = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const scopeScores = { "Single Item": 1, Batch: 2, "Multiple Orders": 3, Unknown: 4 };
const detectionScores = { "Known Extent": 1, "Partially Known": 2, "Unknown Extent": 3 };

export function calculateRiskScore(caseRecord) {
  const severity = severityScores[caseRecord.severity] || 1;
  const scope = scopeScores[caseRecord.scope] || 1;
  const detection = detectionScores[caseRecord.detectionRisk] || 1;
  const fieldImpact = caseRecord.fieldImpact ? 3 : 0;
  return severity + scope + detection + fieldImpact;
}

export function calculateRiskLevel(score) {
  if (score >= 11) return "Critical";
  if (score >= 8) return "High";
  if (score >= 5) return "Medium";
  return "Low";
}

export function isContainmentRequired(caseRecord) {
  return ["High", "Critical"].includes(caseRecord.severity)
    || caseRecord.fieldImpact
    || ["Batch", "Multiple Orders", "Unknown"].includes(caseRecord.scope);
}

export function isFieldImpactReviewRequired(caseRecord) {
  return caseRecord.fieldImpact || caseRecord.scope === "Unknown";
}

export function canAdvanceStatus(caseRecord) {
  const idx = STATUS_FLOW.indexOf(caseRecord.status);
  if (idx < 0 || idx >= STATUS_FLOW.length - 1) return false;

  if (caseRecord.status === "Open") {
    return Boolean(caseRecord.title && caseRecord.description);
  }

  if (caseRecord.status === "Containment") {
    if (!isContainmentRequired(caseRecord)) return true;
    return Boolean(caseRecord.containmentSummary?.trim());
  }

  if (caseRecord.status === "RCA") {
    const rca = caseRecord.rca || {};
    const hasSuspected = Array.isArray(rca.suspectedRootCauses) && rca.suspectedRootCauses.some(Boolean);
    const verifiedFlagSelected = rca.rootCauseVerificationStatus === "Verified" || rca.rootCauseVerificationStatus === "Not Yet Verified";
    return Boolean(rca.problemStatement?.trim() && hasSuspected && verifiedFlagSelected);
  }

  if (caseRecord.status === "CAPA") {
    if (!Array.isArray(caseRecord.capaActions) || caseRecord.capaActions.length === 0) return false;
    return caseRecord.capaActions
      .filter(action => action.verificationRequired)
      .every(action => ["Complete", "Verified"].includes(action.status));
  }

  if (caseRecord.status === "Effectiveness Check") {
    return Boolean(caseRecord.closure?.effectivenessResult?.trim());
  }

  return false;
}

export function canCloseCase(caseRecord) {
  const closure = caseRecord.closure || {};
  const hasEvidence = Array.isArray(caseRecord.evidenceItems) && caseRecord.evidenceItems.length > 0;
  const fieldImpactRequired = isFieldImpactReviewRequired(caseRecord);

  const containmentOk = !isContainmentRequired(caseRecord)
    || Boolean(caseRecord.containmentSummary?.trim());

  const rca = caseRecord.rca || {};
  const rcaOk = Boolean(
    rca.problemStatement?.trim()
    && Array.isArray(rca.suspectedRootCauses)
    && rca.suspectedRootCauses.some(Boolean)
    && (rca.rootCauseVerificationStatus === "Verified" || rca.rootCauseVerificationStatus === "Not Yet Verified")
  );

  const capaOk = Array.isArray(caseRecord.capaActions)
    && caseRecord.capaActions.length > 0
    && caseRecord.capaActions
      .filter(action => action.verificationRequired)
      .every(action => ["Complete", "Verified"].includes(action.status));

  const fieldImpactOk = !fieldImpactRequired
    || caseRecord.fieldImpactReviewStatus === "Complete"
    || caseRecord.fieldImpactLeadershipAcceptedUncertainty;

  return Boolean(
    caseRecord.status === "Effectiveness Check"
    && containmentOk
    && rcaOk
    && capaOk
    && fieldImpactOk
    && hasEvidence
    && closure.closureSummary?.trim()
    && closure.effectivenessResult?.trim()
    && closure.approvedBy?.trim()
    && closure.approvalDate
  );
}
