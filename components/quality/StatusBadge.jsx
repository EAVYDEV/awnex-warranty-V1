const statusClasses = {
  Open: "bg-slate-100 text-slate-700 border-slate-200",
  Containment: "bg-blue-100 text-blue-700 border-blue-200",
  RCA: "bg-indigo-100 text-indigo-700 border-indigo-200",
  CAPA: "bg-purple-100 text-purple-700 border-purple-200",
  "Effectiveness Check": "bg-amber-100 text-amber-700 border-amber-200",
  Closed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${statusClasses[status] || statusClasses.Open}`}>
      {status}
    </span>
  );
}
