import Head from "next/head";
import { WarrantyDashboard } from "../Warranty Management/WarrantyDashboard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Warranty Management - Awntrak</title>
        <meta name="description" content="Awntrak Warranty Management Dashboard" />
      </Head>
      <WarrantyDashboard apiRoute="/api/warranty-orders" />
    </>
  );
}
