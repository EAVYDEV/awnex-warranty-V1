import RiskBadge from "./RiskBadge";
import StatusBadge from "./StatusBadge";

export default function CaseCard({ caseRecord, onView }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{caseRecord.id}</p>
          <h3 className="text-sm font-semibold text-slate-900">{caseRecord.title}</h3>
        </div>
        <StatusBadge status={caseRecord.status} />
      </div>
      <p className="mb-3 line-clamp-2 text-xs text-slate-600">{caseRecord.description}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        <RiskBadge level={caseRecord.riskLevel} />
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">Severity: {caseRecord.severity}</span>
        {caseRecord.fieldImpact && <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Field Impact</span>}
      </div>
      <button onClick={onView} className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
        View
      </button>
    </div>
  );
}
