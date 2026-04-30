import { useMemo, useState } from "react";
import { KpiCard } from "../../../components/dashboard/KpiCard";
import { filterJobs, getKpiMetrics } from "../../../lib/installationHelpers";
import { T } from "../../../lib/tokens";
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
  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
      <KpiCard label="Active Jobs" value={String(kpi.activeJobs)} />
      <KpiCard label="Jobs In Progress" value={String(kpi.inProgress)} />
      <KpiCard label="QC Required Count" value={String(kpi.qcRequired)} />
      <KpiCard label="Completed This Week" value={String(kpi.completedThisWeek)} />
    </div>
    <div style={{ background: T.card, borderRadius: 20, padding: "12px 16px", marginBottom: 16, boxShadow: T.cardShadow, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      {[["status","Status","status"],["crew","Crew","crew"],["region","Region","state"],["pm","PM","projectManager"]].map(([fk, lbl, key]) => (
        <select key={fk} value={filters[fk]} onChange={(e) => setFilter(fk, e.target.value)} style={{ padding: "8px 12px", borderRadius: 14, border: `1px solid ${T.borderLight}`, fontSize: 13, color: T.text1, background: T.card }}>
          {options(key).map((v) => <option key={v} value={v}>{v === "all" ? `All ${lbl}` : v}</option>)}
        </select>
      ))}
      <div style={{ marginLeft: "auto", display: "flex", background: T.card, border: `1px solid ${T.borderLight}`, borderRadius: 10, overflow: "hidden" }}>
        {[["kanban","Kanban View"],["table","Table View"],["map","Map View"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{ padding: "7px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: view===v?T.brand:"transparent", color: view===v?T.card:T.text2 }}>{l}</button>)}
      </div>
    </div>
    {view === "kanban" && <InstallationKanban jobs={filtered} onOpenDetail={setSelected} onStatusChange={() => {}} />}
    {view === "table" && <div style={{ overflow: "auto", borderRadius: 20, boxShadow: T.cardShadow, background: T.card }}><table style={{ minWidth: "100%", fontSize: 13 }}><thead><tr>{["Job","Location","Status","Crew","PM"].map((h)=><th key={h} style={{ textAlign: "left", padding: "10px 12px", color: T.text2 }}>{h}</th>)}</tr></thead><tbody>{filtered.map((j)=><tr key={j._rowId} style={{ borderTop: `1px solid ${T.borderLight}` }}><td style={{ padding: "8px 12px" }}>{j.jobName}</td><td>{j.city}, {j.state}</td><td>{j.status}</td><td>{j.crew}</td><td>{j.projectManager}</td></tr>)}</tbody></table></div>}
    {view === "map" && <InstallationMap jobs={filtered} />}
    <JobDetailPanel job={selected} onClose={() => setSelected(null)} />
  </div>;
}
