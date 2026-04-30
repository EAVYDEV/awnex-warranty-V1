import { useMemo, useState } from "react";
import { KpiCard } from "../../../components/dashboard/KpiCard";
import { filterJobs, getKpiMetrics } from "../../../lib/installationHelpers";
import { InstallationKanban } from "./InstallationKanban";
import { JobDetailPanel } from "./JobDetailPanel";
import { InstallationMap } from "./InstallationMap";

export function InstallationDashboard({ jobs }) {
  const [view, setView] = useState("kanban");
  const [filters, setFilters] = useState({ status: "all", crew: "all", region: "all", pm: "all" });
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const kpi = getKpiMetrics(filtered);
  const options = (key) => ["all", ...new Set(jobs.map((j) => j[key]).filter(Boolean))];

  return <div className="space-y-4">
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <KpiCard label="Active Jobs" value={String(kpi.activeJobs)} />
      <KpiCard label="Jobs In Progress" value={String(kpi.inProgress)} />
      <KpiCard label="QC Required Count" value={String(kpi.qcRequired)} />
      <KpiCard label="Completed This Week" value={String(kpi.completedThisWeek)} />
    </div>
    <div className="flex flex-wrap gap-2">
      {[["status","Status"],["crew","Crew"],["region","Region"],["projectManager","PM"]].map(([key, lbl]) => (
        <select key={key} className="rounded border px-2 py-1 text-sm" value={filters[key === "projectManager" ? "pm" : key]} onChange={(e)=>setFilters((f)=>({...f,[key === "projectManager" ? "pm" : key]:e.target.value}))}>
          {options(key === "region" ? "state" : key === "pm" ? "projectManager" : key).map((v) => <option key={v} value={v}>{v === "all" ? `All ${lbl}` : v}</option>)}
        </select>
      ))}
      <div className="ml-auto flex rounded border bg-white">
        {[["kanban","Kanban View"],["table","Table View"],["map","Map View"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} className={`px-3 py-1 text-xs ${view===v?"bg-blue-600 text-white":""}`}>{l}</button>)}
      </div>
    </div>
    {view === "kanban" && <InstallationKanban jobs={filtered} onOpenDetail={setSelected} onStatusChange={() => {}} />}
    {view === "table" && <div className="overflow-auto rounded-xl border bg-white"><table className="min-w-full text-sm"><thead><tr>{["Job","Location","Status","Crew","PM"].map((h)=><th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead><tbody>{filtered.map((j)=><tr key={j._rowId} className="border-t"><td className="px-3 py-2">{j.jobName}</td><td>{j.city}, {j.state}</td><td>{j.status}</td><td>{j.crew}</td><td>{j.projectManager}</td></tr>)}</tbody></table></div>}
    {view === "map" && <InstallationMap jobs={filtered} />}
    <JobDetailPanel job={selected} onClose={() => setSelected(null)} />
  </div>;
}
