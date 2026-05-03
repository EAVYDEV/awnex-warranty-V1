import { INSTALL_STATUSES } from "../../../lib/installationData";
import { groupJobsByStatus } from "../../../lib/installationHelpers";
import { T } from "../../../lib/tokens";
import { JobCard } from "./JobCard";

export function InstallationKanban({ jobs, onOpenDetail, onStatusChange }) {
  const grouped = groupJobsByStatus(jobs);
  return <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
    {INSTALL_STATUSES.map((status) => (
      <div key={status} style={{ minWidth: 290, borderRadius: 8, border: `1px solid ${T.borderLight}`, background: T.surface, padding: 12 }}>
        <div style={{ marginBottom: 10, fontSize: 14, fontWeight: 700, color: T.text1 }}>{status} ({grouped[status].length})</div>
        <div style={{ display: "grid", gap: 10 }}>
          {grouped[status].map((job) => <div key={job._rowId} draggable onDragStart={() => {}}><JobCard job={job} onOpenDetail={() => onOpenDetail(job)} onStatusChange={onStatusChange} /></div>)}
        </div>
      </div>
    ))}
  </div>;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {INSTALL_STATUSES.map((status) => (
        <div key={status} className="min-w-72 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 text-sm font-semibold text-slate-700">{status} ({grouped[status].length})</div>
          <div className="space-y-2">
            {grouped[status].map((job) => (
              <div key={job._rowId} draggable onDragStart={() => {}}>
                <JobCard job={job} onOpenDetail={() => onOpenDetail(job)} onStatusChange={onStatusChange} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
