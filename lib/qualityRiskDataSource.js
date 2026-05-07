const USE_MOCK_QUALITY_RISK_DATA = true;

const mockCases = [
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
  {
    id: "QRC-003",
    title: "Drive motor intermittent fault during commissioning",
    description: "Installer observed repeated torque cutoff faults in first 48h after go-live.",
    severity: "Critical",
    scope: "Single Order",
    detectionRisk: "Unknown Extent",
    status: "CAPA",
    department: "Service",
    reportedBy: "A. Brooks",
    dateReported: "2026-04-19",
    owner: "D. Hassan",
    fieldImpact: true,
    customerImpact: true,
    safetyImpact: true,
    containmentSummary: "Enable reduced-speed profile and remote monitoring alert.",
    rootCauseSummary: "",
    verifiedRootCause: "",
    closureSummary: "",
    capaActions: [{ actionType: "Corrective Action", actionDescription: "Replace suspect controller batch", owner: "D. Hassan", department: "Service", dueDate: "2026-05-08", status: "In Progress", completionDate: "", verificationRequired: true, notes: "Priority site" }],
    affectedOrders: [{ orderNumber: "AW-89277", customer: "Summit Foods", location: "Phoenix", shipDate: "2026-04-02", installStatus: "Commissioning", suspectedImpact: "Motor protection trip", verificationStatus: "Confirmed", notes: "Temporary profile active" }],
    evidenceItems: [{ evidenceType: "Log", description: "Drive fault telemetry", uploadedBy: "A. Brooks", uploadDate: "2026-04-20", relatedPhase: "RCA", fileLink: "https://files.local/qrc-003-log" }],
    rca: { problemStatement: "Intermittent controller overcurrent signal", suspectedRootCauses: ["Controller firmware timing regression"], rootCauseVerificationStatus: "Pending Test" },
    containment: { containmentRequired: true, actions: [] },
    closure: {},
    fieldImpactReviewStatus: "In Progress",
    fieldImpactLeadershipAcceptedUncertainty: false,
  },
];

const mockTrends = {
  byDepartment: [
    { label: "Quality", value: 7 },
    { label: "Engineering", value: 5 },
    { label: "Service", value: 4 },
    { label: "Manufacturing", value: 3 },
  ],
  bySeverity: [
    { label: "Critical", value: 2 },
    { label: "High", value: 6 },
    { label: "Medium", value: 8 },
    { label: "Low", value: 3 },
  ],
  recurringCategories: [
    { label: "Coating / Finish", value: 5 },
    { label: "Bracket / Fitment", value: 4 },
    { label: "Drive / Motor", value: 3 },
    { label: "Electrical Harness", value: 2 },
  ],
};

async function fetchLiveQualityRiskData() {
  // Swap this function body to hook into API data when available.
  // Expected return shape: { cases: [], trends: { byDepartment: [], bySeverity: [], recurringCategories: [] } }
  return { cases: [], trends: { byDepartment: [], bySeverity: [], recurringCategories: [] } };
}

export async function getQualityRiskDashboardData() {
  if (USE_MOCK_QUALITY_RISK_DATA) {
    return { cases: mockCases, trends: mockTrends };
  }
  return fetchLiveQualityRiskData();
}
