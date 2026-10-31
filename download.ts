import type { Puppeteer } from "puppeteer";
import puppeteer from "puppeteer";
import fs = from 'fs:promises';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

async function downloadTrack(browser: Puppeteer, url: string) {
  const page = await browser.newPage();

  await page.goto("https://spotsaver.net", {
    timeout: 60000,
    waitUntil: "networkidle2",
  });

  await page.locator('input[type="text"]').fill(url);

  const searchButton = await page.$('button[type="submit"]');
  await searchButton.click();
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const button = Array.from(
          document.querySelectorAll("div.items-center button"),
        )
          .filter((el) => el.textContent.includes("Convert"))
          .pop(0);
        button.click();
        resolve(button);
      }, 1500);
    });
  });

  await closeAdPages(browser);
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const button = Array.from(
          document.querySelectorAll("div.items-center button"),
        )
          .filter((el) => el.textContent.includes("Download"))
          .pop(0);
        button.click();
        resolve(button);
        setTimeout(() => page.close())
      }, 1500);
      });
  });
}

async function closeAdPages(browser: Puppeteer): number {
  let closed = (async () => {
    let closed = 0;
    let pages = await browser.pages();
    for (const page of pages) {
      const currentUrl = page.url();
      if (!currentUrl.includes("spotsaver.net")) {
        await page.close();
        closed += 1;
      }
    }
    return closed;
  })();
  while (closed > 0) {
    await closeAdPagesOnce(browser);
  }
  return closed;
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

  const urls = await fs.readFile('urls')
  for (const url of listUrlFiles()) {
    await downloadTrack(browser, url);
  }
}
async function listUrlFiles(): string[] {
  const urls = []
    const files = await readdir(".");
    for (const file of files) {
      if (/urls[.][^.]+[.]txt$/.exec(file)) {
        const currentUrls = (await fs.readFile(file)).splitlines();
        for (const cur of currentUrls) {
          urls.push(cur);
        }
      }
    }
  return urls
}
run();
