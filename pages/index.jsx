import Head from "next/head";
import { QMSShell } from "../components/QMSShell.jsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Quality Management System — Awnex</title>
        <meta name="description" content="Awnex Manufacturing Quality Management System" />
      </Head>
      <QMSShell />
    </>
  );
}
