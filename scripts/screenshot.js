import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:5173";
const output = process.argv[3] || "screenshot.png";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
});

await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: output, fullPage: true });

await browser.close();

console.log(`Screenshot saved to ${output}`);