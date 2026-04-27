import RiskBadge from "./RiskBadge";
import StatusBadge from "./StatusBadge";

export default function CaseTable({ cases, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Case</th>
            <th className="px-3 py-2">Severity</th>
            <th className="px-3 py-2">Risk</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Owner</th>
            <th className="px-3 py-2">Flags</th>
            <th className="px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="px-3 py-2">
                <p className="font-semibold text-slate-900">{c.id}</p>
                <p className="text-xs text-slate-600">{c.title}</p>
              </td>
              <td className="px-3 py-2">{c.severity}</td>
              <td className="px-3 py-2"><RiskBadge level={c.riskLevel} /></td>
              <td className="px-3 py-2"><StatusBadge status={c.status} /></td>
              <td className="px-3 py-2 text-slate-700">{c.owner}</td>
              <td className="px-3 py-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  {c.fieldImpact && <span className="rounded bg-red-100 px-2 py-1 text-red-700">Field Review</span>}
                  {c.scope === "Unknown" && <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">Order Review</span>}
                  {c.riskScore >= 10 && <span className="rounded bg-orange-100 px-2 py-1 text-orange-700">Escalation</span>}
                  {c.severity === "Critical" && <span className="rounded bg-red-100 px-2 py-1 text-red-700">Immediate Containment</span>}
                </div>
              </td>
              <td className="px-3 py-2">
                <button onClick={() => onSelect(c)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
