const actionTypes = ["Correction", "Corrective Action", "Preventive Action", "Training Update", "SOP Update", "Checklist Update", "Design Review Update", "Supplier Action"];
const statusValues = ["Not Started", "In Progress", "Complete", "Overdue", "Verified"];

export default function CapaTab({ caseRecord, onUpdate }) {
  const updateAction = (idx, key, value) => {
    const next = caseRecord.capaActions.map((a, i) => (i === idx ? { ...a, [key]: value } : a));
    onUpdate({ ...caseRecord, capaActions: next });
  };

  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50"><tr>{["Action Type", "Action Description", "Owner", "Department", "Due Date", "Status", "Completion Date", "Verification Required", "Notes"].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
        <tbody>
          {caseRecord.capaActions.map((a, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-2 py-1"><select className="rounded border border-slate-300 px-1" value={a.actionType} onChange={(e) => updateAction(idx, "actionType", e.target.value)}>{actionTypes.map((t) => <option key={t}>{t}</option>)}</select></td>
              <td className="px-2 py-1"><input className="w-40 rounded border border-slate-300 px-1" value={a.actionDescription} onChange={(e) => updateAction(idx, "actionDescription", e.target.value)} /></td>
              <td className="px-2 py-1"><input className="w-24 rounded border border-slate-300 px-1" value={a.owner} onChange={(e) => updateAction(idx, "owner", e.target.value)} /></td>
              <td className="px-2 py-1"><input className="w-24 rounded border border-slate-300 px-1" value={a.department} onChange={(e) => updateAction(idx, "department", e.target.value)} /></td>
              <td className="px-2 py-1"><input type="date" className="rounded border border-slate-300 px-1" value={a.dueDate || ""} onChange={(e) => updateAction(idx, "dueDate", e.target.value)} /></td>
              <td className="px-2 py-1"><select className="rounded border border-slate-300 px-1" value={a.status} onChange={(e) => updateAction(idx, "status", e.target.value)}>{statusValues.map((s) => <option key={s}>{s}</option>)}</select></td>
              <td className="px-2 py-1"><input type="date" className="rounded border border-slate-300 px-1" value={a.completionDate || ""} onChange={(e) => updateAction(idx, "completionDate", e.target.value)} /></td>
              <td className="px-2 py-1"><input type="checkbox" checked={a.verificationRequired} onChange={(e) => updateAction(idx, "verificationRequired", e.target.checked)} /></td>
              <td className="px-2 py-1"><input className="w-36 rounded border border-slate-300 px-1" value={a.notes || ""} onChange={(e) => updateAction(idx, "notes", e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
