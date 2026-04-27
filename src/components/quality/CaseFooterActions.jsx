export default function CaseFooterActions({ canAdvance, canClose, onSave, onAddCapa, onAddEvidence, onNextPhase, onCloseCase }) {
  return (
    <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white p-4">
      <button onClick={onSave} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Save Changes</button>
      <button onClick={onAddCapa} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Add CAPA Action</button>
      <button onClick={onAddEvidence} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Add Evidence</button>
      <button disabled={!canAdvance} onClick={onNextPhase} className="rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Move to Next Phase</button>
      <button disabled={!canClose} onClick={onCloseCase} className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Close Case</button>
    </div>
  );
}
