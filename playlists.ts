import type { Puppeteer } from "puppeteer";
import puppeteer from "puppeteer";
import fs = from 'fs:promises';


async function listPlaylistTrackUrls(browser: Puppeteer, playlistUrl: string): string[] {
  const parts = playlistUrl.split('/');
  const id = parts[parts.length-1]
  const page = await browser.newPage();

  await page.goto(playlistUrl, {
    timeout: 60000,
    waitUntil: "networkidle2",
  });

  const urls = Array.from(await page.$$('a[data-testid="internal-track-link"]')).map(el => `${el.href}`)
  await fs.writeFile(`urls.${id}.txt , urls.join("\n"), 'utf-8');
}
async function initialize(): Puppeteer {
  const response = await fetch("http://localhost:9222/json/version");
  const data = await response.json();
  const browserWSEndpoint = data.webSocketDebuggerUrl;
  const browser = await puppeteer.connect({
    browserWSEndpoint: browserWSEndpoint,
  });
  return browser;
}
async function run() {
  const browser = await initialize();
  for (const url of URLS) {
    await listPlaylistTrackUrls(browser, 'https://open.spotify.com/playlist/2MbTY40stFva68HPZPWkHk');
  }
}
run();
