export const INSTALL_STATUSES = [
  "Scheduled",
  "Ready",
  "In Progress",
  "QC Required",
  "Complete",
];

const FIELD_ALIASES = {
  JobID: ["JobID", "Job ID", "Record ID#"],
  JobName: ["JobName", "Job Name", "Order Name (Formula)"],
  Location: ["Location", "Address", "Site Address"],
  City: ["City"],
  State: ["State"],
  Latitude: ["Latitude", "Lat"],
  Longitude: ["Longitude", "Lng", "Lon"],
  Status: ["Status", "Install Status"],
  Crew: ["Crew", "Assigned Crew"],
  ProjectManager: ["ProjectManager", "Project Manager", "PM"],
  QCStatus: ["QCStatus", "QC Status"],
  EquipmentStatus: ["EquipmentStatus", "Equipment Status"],
  StartDate: ["StartDate", "Start Date"],
  EndDate: ["EndDate", "End Date", "Completion Date"],
};

const pick = (record, map, names) => {
  const key = names.find((n) => map[n]);
  return key ? record[map[key]]?.value ?? null : null;
};

export function mapInstallationData(payload) {
  if (!payload?.fields || !payload?.data) return [];
  const labelToId = Object.fromEntries(payload.fields.map((f) => [f.label, f.id]));
  return payload.data.map((record, idx) => {
    const status = String(pick(record, labelToId, FIELD_ALIASES.Status) || "Scheduled");
    return {
      _rowId: String(record[3]?.value || idx + 1),
      jobId: String(pick(record, labelToId, FIELD_ALIASES.JobID) || idx + 1),
      jobName: String(pick(record, labelToId, FIELD_ALIASES.JobName) || "Untitled Job"),
      location: String(pick(record, labelToId, FIELD_ALIASES.Location) || ""),
      city: String(pick(record, labelToId, FIELD_ALIASES.City) || ""),
      state: String(pick(record, labelToId, FIELD_ALIASES.State) || ""),
      latitude: Number(pick(record, labelToId, FIELD_ALIASES.Latitude)) || null,
      longitude: Number(pick(record, labelToId, FIELD_ALIASES.Longitude)) || null,
      status: status,
      crew: String(pick(record, labelToId, FIELD_ALIASES.Crew) || "Unassigned"),
      projectManager: String(pick(record, labelToId, FIELD_ALIASES.ProjectManager) || "Unassigned"),
      qcStatus: String(pick(record, labelToId, FIELD_ALIASES.QCStatus) || "Pending"),
      equipmentStatus: String(pick(record, labelToId, FIELD_ALIASES.EquipmentStatus) || "Unknown"),
      startDate: pick(record, labelToId, FIELD_ALIASES.StartDate),
      endDate: pick(record, labelToId, FIELD_ALIASES.EndDate),
      hooks: {
        mobileReporting: null,
        photoUploads: null,
        qcTaskLinking: null,
      },
    };
  });
}
