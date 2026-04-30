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
export function JobCard({ job, onOpenDetail, onStatusChange }) {
  const qcHighlight = job.status === "QC Required" || /required/i.test(job.qcStatus);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-semibold text-slate-800">{job.jobName}</div>
      <div className="text-xs text-slate-500">{job.location} {job.city}, {job.state}</div>
      <div className="mt-2 text-xs">Crew: <span className="font-medium">{job.crew}</span></div>
      <div className="text-xs">PM: <span className="font-medium">{job.projectManager}</span></div>
      <div className={`mt-2 text-xs font-semibold ${qcHighlight ? "text-amber-600" : "text-slate-500"}`}>QC: {job.qcStatus}</div>
      <div className="text-xs text-slate-500">Equipment: {job.equipmentStatus}</div>
      <div className="mt-3 flex gap-2">
        <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white" onClick={onOpenDetail}>Details</button>
        <select className="rounded border px-2 py-1 text-xs" value={job.status} onChange={(e) => onStatusChange?.(job, e.target.value)}>
          {["Scheduled","Ready","In Progress","QC Required","Complete"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}
