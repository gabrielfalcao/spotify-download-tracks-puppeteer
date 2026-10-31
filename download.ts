import type { Puppeteer } from "puppeteer";
import puppeteer from "puppeteer";

const URLS = [
  "https://open.spotify.com/track/6h9fjGkaBU03vxPgIJJAvf",

  "https://open.spotify.com/track/1D1TDZCXTIrsXUmW6UaaLg",

  "https://open.spotify.com/track/3DHpzBZ4sGfPZfefkY88NO",

  "https://open.spotify.com/track/6jEzD3FPcA95CsuIJtKFS0",

  "https://open.spotify.com/track/1Gu8YosrIxq31SoQA1Nwfh",

  "https://open.spotify.com/track/6aw9vJP8xUB9dyW4TrwTmS",

  "https://open.spotify.com/track/17N6OOiHl7WMkUQZ2x9P1F",

  "https://open.spotify.com/track/4vXMKlYcfXzA2MmhYMLJVr",

  "https://open.spotify.com/track/3nRcAT9aoplAv9y18rQXRi",

  "https://open.spotify.com/track/5omikDFURGs7xrfdp5QxX5",

  "https://open.spotify.com/track/0b3uA2mQX1ZRAMUE4n78aO",

  "https://open.spotify.com/track/34FyNQwiCnVPBZGk1wPEa4",

  "https://open.spotify.com/track/1omHCWuWEH9TV0SmZiiLev",

  "https://open.spotify.com/track/2VKO3Jo5Zgi4lKkazhtJlI",

  "https://open.spotify.com/track/57h96qWrViAcioQHyb6exT",

  "https://open.spotify.com/track/6WVRwQTvleYVomzYxYTmWw",

  "https://open.spotify.com/track/5wTv501Kl9wLABLwHo11RJ",

  "https://open.spotify.com/track/7jJy7mYWWz2DKSNSaAnkRc",

  "https://open.spotify.com/track/0zC08QS1SmaY1RFyjya6ZX",

  "https://open.spotify.com/track/6mNDeyhI21liXpWCh9Wi4C",

  "https://open.spotify.com/track/1FparOA4TsEvXx9Gi9mdRQ",

  "https://open.spotify.com/track/1QRQ6HOndanQlgWggueUx2",

  "https://open.spotify.com/track/6qwPK5WhplqNcyy1CtnpLT",

  "https://open.spotify.com/track/1TwGIP0mS6hndhipmYlNHM",

  "https://open.spotify.com/track/3orXhmbVn44hjbnLxGUMpG",
];

async function downloadTrack(browser: Puppeteer, url: string) {
  const page = await browser.newPage();

  await page.goto("https://spotsaver.net", {
    timeout: 60000,
    // waitUntil: "domcontentloaded",
    waitUntil: "networkidle2",
  });

  await page.locator('input[type="text"]').fill(url);

  const searchButton = await page.$('button[type="submit"]');
  await searchButton.click();
  await page.evaluate(() => {
    setTimeout(() => {
      Array.from(document.querySelectorAll("div.items-center button"))
        .filter((el) => el.textContent.includes("Convert"))
        .pop(0)
        .click();
    }, 1500);
  });
  await closeAdPages(browser);
  await page.evaluate(() => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        const button = Array.from(
          document.querySelectorAll("div.items-center button"),
        )
          .filter((el) => el.textContent.includes("Download"))
          .pop(0);
        button.click();
        resolve(button);
      }, 1500);
    });
  });

  await closeAdPages(browser);
}
async function closeAdPages(browser: Puppeteer) {
  const pages = await browser.pages();
  for (const page of pages) {
    const currentUrl = page.url();
    if (!currentUrl.includes("spotsaver.net")) {
      await page.close();
    }
  }
}
async function initialize(): Puppeteer {
  const response = await fetch("http://localhost:9333/json/version");
  const data = await response.json();
  const browserWSEndpoint = data.webSocketDebuggerUrl;
  const browser = await puppeteer.connect({
    browserWSEndpoint: browserWSEndpoint,
  });
  return browser;
}
async function run() {
  const browser = await initialize();
  await downloadTrack(browser, URLS[0]);
}
run();
