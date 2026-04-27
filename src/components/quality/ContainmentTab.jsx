export default function ContainmentTab({ caseRecord, onUpdate }) {
  const containment = caseRecord.containment || {};
  const setContainment = (key, value) => onUpdate({ ...caseRecord, containment: { ...containment, [key]: value }, containmentSummary: key === "containmentSummary" ? value : caseRecord.containmentSummary });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {["containmentRequired", "productHoldRequired", "productionStopRequired", "customerNotificationNeeded"].map((flag) => (
          <label key={flag} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(containment[flag])} onChange={(e) => setContainment(flag, e.target.checked)} />{flag}</label>
        ))}
        {[["containmentOwner", "Containment Owner"], ["targetCompletionDate", "Target Completion Date"], ["actualCompletionDate", "Actual Completion Date"], ["containmentStatus", "Containment Status"]].map(([k, label]) => (
          <label key={k} className="text-sm">{label}<input className="mt-1 w-full rounded border border-slate-300 px-2 py-1" value={containment[k] || ""} onChange={(e) => setContainment(k, e.target.value)} /></label>
        ))}
      </div>
      <label className="block text-sm">Containment Summary<textarea className="mt-1 w-full rounded border border-slate-300 px-2 py-1" rows={3} value={caseRecord.containmentSummary || ""} onChange={(e) => setContainment("containmentSummary", e.target.value)} /></label>
      <h4 className="font-semibold">Containment Actions</h4>
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full text-xs"><thead className="bg-slate-50"><tr>{["Action", "Owner", "Due Date", "Status", "Completion Date", "Notes"].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
          <tbody>{(containment.actions || []).map((a, i) => <tr key={i} className="border-t"><td className="px-2 py-1">{a.action}</td><td className="px-2 py-1">{a.owner}</td><td className="px-2 py-1">{a.dueDate}</td><td className="px-2 py-1">{a.status}</td><td className="px-2 py-1">{a.completionDate}</td><td className="px-2 py-1">{a.notes}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}
