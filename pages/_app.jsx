import Head from "next/head";
import "../styles/quality.css";
import { ThemeProvider } from "../lib/ThemeContext.jsx";
import { THEMES } from "../lib/themes.js";

// Inline the default (light) theme CSS variables so the page renders correctly
// before the client-side ThemeProvider useEffect runs.
const defaultThemeVars = Object.entries(THEMES.light.vars)
  .map(([prop, val]) => `${prop}:${val}`)
  .join(';');

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet" />
        <style>{`
          :root{${defaultThemeVars}}
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif}
        `}</style>
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
