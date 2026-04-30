import { T } from "../../../lib/tokens";

export function JobCard({ job, onOpenDetail, onStatusChange }) {
  const qcHighlight = job.status === "QC Required" || /required/i.test(job.qcStatus);

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${T.borderLight}`, background: T.card, padding: 12, boxShadow: T.cardShadow }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.text1, marginBottom: 4 }}>{job.jobName}</div>
      <div style={{ fontSize: 12, color: T.text2, marginBottom: 8 }}>{[job.location, job.city && `${job.city}, ${job.state}`].filter(Boolean).join(" · ") || "-"}</div>
      <div style={{ fontSize: 13, color: T.text1 }}>Crew: <b>{job.crew}</b></div>
      <div style={{ fontSize: 13, color: T.text1 }}>PM: <b>{job.projectManager}</b></div>
      <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: qcHighlight ? T.warningText : T.text2 }}>QC: {job.qcStatus}</div>
      <div style={{ fontSize: 12, color: T.text2 }}>Equipment: {job.equipmentStatus}</div>
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button style={{ borderRadius: 10, background: T.brand, color: T.card, border: "none", padding: "6px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={onOpenDetail}>Details</button>
        <select style={{ borderRadius: 10, border: `1px solid ${T.borderLight}`, padding: "6px 10px", fontSize: 12, color: T.text1, background: T.card }} value={job.status} onChange={(e) => onStatusChange?.(job, e.target.value)}>
          {["Scheduled", "Ready", "In Progress", "QC Required", "Complete"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}
