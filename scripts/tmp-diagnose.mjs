import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:3100";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("console", async (msg) => {
  if (msg.text().includes("RISHIKESH-DEBUG")) {
    const args = await Promise.all(msg.args().map((a) => a.jsonValue().catch(() => "<unserializable>")));
    console.log("CONSOLE:", JSON.stringify(args, null, 2));
  }
});
page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// Scroll to bottom of doc to force ScrollTrigger refresh path / layout settle
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

const info1 = await page.evaluate(() => {
  const section = document.querySelector('[data-figma-node="779:92"]');
  const spacer = section ? section.parentElement : null;
  return {
    bodyClass: document.body.className,
    htmlClass: document.documentElement.className,
    sectionRect: section ? section.getBoundingClientRect().height : null,
    spacerClass: spacer ? spacer.className : null,
    spacerRect: spacer ? spacer.getBoundingClientRect().height : null,
    spacerInlineHeight: spacer ? spacer.style.height : null,
    docScrollHeight: document.documentElement.scrollHeight,
    bodyScrollHeight: document.body.scrollHeight,
    innerHeight: window.innerHeight,
  };
});
console.log("INITIAL_MEASURE:", JSON.stringify(info1, null, 2));

// Scroll all the way down (native) to see how far we can actually get
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(1000);

const info2 = await page.evaluate(() => {
  const section = document.querySelector('[data-figma-node="779:92"]');
  const spacer = section ? section.parentElement : null;
  const photo = section ? section.querySelector("[data-rishikesh-photo]") : null;
  const line = section ? section.querySelector(".rishikesh-line-reveal") : null;
  return {
    scrollY: window.scrollY,
    docScrollHeight: document.documentElement.scrollHeight,
    spacerRect: spacer ? spacer.getBoundingClientRect().height : null,
    spacerInlineHeight: spacer ? spacer.style.height : null,
    photoOpacity: photo ? getComputedStyle(photo).opacity : null,
    lineOpacity: line ? getComputedStyle(line).opacity : null,
    sectionBoundingTop: section ? section.getBoundingClientRect().top : null,
  };
});
console.log("SCROLLED_MEASURE:", JSON.stringify(info2, null, 2));

await browser.close();
