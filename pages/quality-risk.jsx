import Head from "next/head";
import QualityRiskDashboard from "../src/pages/QualityRiskDashboard";

export default function QualityRiskPage() {
  return (
    <>
      <Head>
        <title>Quality Risk & RCA - Awntrak</title>
      </Head>
      <QualityRiskDashboard />
    </>
  );
}
