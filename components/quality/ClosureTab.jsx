export default function ClosureTab({ caseRecord, onUpdate, checklist }) {
  const closure = caseRecord.closure || {};
  const setValue = (key, value) => onUpdate({ ...caseRecord, closure: { ...closure, [key]: value }, closureSummary: key === "closureSummary" ? value : caseRecord.closureSummary });

  return (
    <div className="space-y-3 text-sm">
      <div className="rounded border border-slate-200 p-3">
        <h4 className="mb-2 font-semibold">Closure Checklist</h4>
        <ul className="space-y-1">
          {checklist.map((item) => <li key={item.label} className={item.complete ? "text-emerald-700" : "text-slate-600"}>{item.complete ? "Complete" : "Pending"}: {item.label}</li>)}
        </ul>
      </div>
      {["closureSummary", "effectivenessResult", "residualRisk", "lessonsLearned", "approvedBy", "approvalDate"].map((f) => (
        <label key={f} className="block">{f}
          <input type={f === "approvalDate" ? "date" : "text"} className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={closure[f] || ""} onChange={(e) => setValue(f, e.target.value)} />
        </label>
      ))}
      {["sopUpdatesRequired", "trainingUpdatesRequired", "checklistUpdatesRequired"].map((f) => (
        <label key={f} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(closure[f])} onChange={(e) => setValue(f, e.target.checked)} />{f}</label>
      ))}
    </div>
  );
}
