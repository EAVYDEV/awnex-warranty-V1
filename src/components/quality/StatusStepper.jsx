import { STATUS_FLOW } from "../../lib/qualityRiskUtils";

export default function StatusStepper({ status }) {
  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_FLOW.map((step, idx) => (
        <div key={step} className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${idx <= currentIndex ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
            {step}
          </span>
          {idx < STATUS_FLOW.length - 1 && <span className="text-slate-400">›</span>}
        </div>
      ))}
    </div>
  );
}
