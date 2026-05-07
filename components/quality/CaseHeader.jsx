import RiskBadge from "./RiskBadge";
import StatusBadge from "./StatusBadge";

export default function CaseHeader({ caseRecord, onClose }) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">{caseRecord.id}</p>
          <h2 className="text-lg font-semibold text-slate-900">{caseRecord.title}</h2>
          <p className="text-xs text-slate-600">Reported {caseRecord.dateReported} • Owner {caseRecord.owner}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={caseRecord.status} />
            <RiskBadge level={caseRecord.riskLevel} />
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Severity: {caseRecord.severity}</span>
            {caseRecord.fieldImpact && <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Field Impact</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-300 px-2 py-1 text-xs">Edit Case</button>
          <button className="rounded-md border border-slate-300 px-2 py-1 text-xs">Change Status</button>
          <button className="rounded-md border border-slate-300 px-2 py-1 text-xs">Assign Owner</button>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-2 py-1 text-xs">Close</button>
        </div>
      </div>
    </div>
  );
}
