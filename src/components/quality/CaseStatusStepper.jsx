import StatusStepper from "./StatusStepper";

export default function CaseStatusStepper({ status }) {
  return <div className="border-b border-slate-200 bg-slate-50 p-3"><StatusStepper status={status} /></div>;
}
