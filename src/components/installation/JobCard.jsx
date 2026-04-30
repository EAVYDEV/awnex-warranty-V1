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
