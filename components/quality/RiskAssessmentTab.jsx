export default function RiskAssessmentTab({ caseRecord, onUpdate }) {
  const setValue = (key, value) => onUpdate({ ...caseRecord, [key]: value });

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {[
        ["severity", ["Low", "Medium", "High", "Critical"]],
        ["scope", ["Single Item", "Batch", "Multiple Orders", "Unknown"]],
        ["detectionRisk", ["Known Extent", "Partially Known", "Unknown Extent"]],
      ].map(([field, options]) => (
        <label key={field} className="text-sm">
          {field}
          <select className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={caseRecord[field]} onChange={(e) => setValue(field, e.target.value)}>
            {options.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </label>
      ))}
      <div className="md:col-span-2 flex gap-4">
        {["fieldImpact", "customerImpact", "safetyImpact"].map((flag) => (
          <label key={flag} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={caseRecord[flag]} onChange={(e) => setValue(flag, e.target.checked)} />{flag}</label>
        ))}
      </div>
      <div className="rounded border border-slate-200 p-3 text-sm">Risk Score: {caseRecord.riskScore}</div>
      <div className="rounded border border-slate-200 p-3 text-sm">Risk Level: {caseRecord.riskLevel}</div>
    </div>
  );
}
