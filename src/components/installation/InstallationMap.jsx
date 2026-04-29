import { MapView } from "../../components/MapView";

export function InstallationMap({ jobs }) {
  const orders = jobs.map((j) => ({ ...j, orderNum: j.jobId, customer: j.jobName, location: `${j.city}, ${j.state}`, status: j.status }));
  return <MapView orders={orders} />;
}
