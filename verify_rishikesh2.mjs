import { chromium } from "playwright";

const url = "http://localhost:3737";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(1000);

const rishikesh = page.locator('section[data-figma-node="779:92"]');
await rishikesh.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

const box = await rishikesh.boundingBox();
const sectionTop = box.y + (await page.evaluate(() => window.scrollY));
console.log("sectionTop(doc)=", sectionTop, "height=", box.height, "viewportH=900");

const startY = sectionTop - 900; // "top bottom"
const endY = sectionTop; // "top top"
console.log("expected active range:", startY, "->", endY);

async function shot(name, scrollY) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(400);
  const progress = await page.evaluate(() => {
    const el = document.querySelector(".rishikesh-line-reveal");
    if (!el) return null;
    return getComputedStyle(el).getPropertyValue("--line-reveal-progress");
  });
  const secTop = await page.evaluate(() => {
    const s = document.querySelector('section[data-figma-node="779:92"]');
    return s.getBoundingClientRect().top;
  });
  console.log(name, "scrollY=", scrollY, "progress=", progress, "sectionTopInViewport=", secTop);
  await page.screenshot({ path: `/sessions/great-wizardly-galileo/mnt/outputs/${name}.png` });
}

await shot("v2_a_before", startY - 100);
await shot("v2_b_start", startY);
await shot("v2_c_quarter", startY + (endY - startY) * 0.25);
await shot("v2_d_half", startY + (endY - startY) * 0.5);
await shot("v2_e_threequarter", startY + (endY - startY) * 0.75);
await shot("v2_f_end", endY);
await shot("v2_g_past", endY + 100);

await browser.close();
