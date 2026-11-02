import type { Puppeteer } from "puppeteer";
import puppeteer from "puppeteer";
import fs from "fs";
const PLAYLISTS = [

  "https://open.spotify.com/playlist/5qglMq1OQY35aH3Sex5YAE?si=6418bbfe41214ddb",
  "https://open.spotify.com/playlist/6WUQKmRi7wX1uVacNnqF1k?si=aa9c89ab72f44fa2",
  "https://open.spotify.com/playlist/7Dc9chcOTWnYnME1bVFfxf?si=e750973649524d54",
  "https://open.spotify.com/playlist/2iZicEqw8eYHMxsq2HVVB7?si=132fc6c1912f41da",
  "https://open.spotify.com/playlist/1dFpv6GqsixQwr8zr8uYTu?si=7a6b5c8db1184ee1",
  "https://open.spotify.com/playlist/3iA6y9ZQx04aX238vogXI0?si=59208b761606401b",
  "https://open.spotify.com/playlist/5SeRUjxWtWQOrETirbwbA9?si=23855ec23e2d4bcf",
  "https://open.spotify.com/playlist/7GYGc4JSiV44Y53VvE2Dpa?si=0639e062155f4c24",
  "https://open.spotify.com/playlist/0GYSxHR7PcsKfTBbLI0Wr8?si=6a2f10f87a7848c3",

];
async function listPlaylistTrackUrls(
  browser: Puppeteer,
  playlistUrl: string,
): string[] {
  const parts = playlistUrl.split("/");
  const id = parts[parts.length - 1];
  const page = await browser.newPage();

  await page.goto(playlistUrl, {
    timeout: 60000,
    waitUntil: "networkidle2",
  });

  const urls = Array.from(
    await page.$$('a[data-testid="internal-track-link"]'),
  ).map((el) => `${el.href}`);
  await fs.writeFileSync(`urls.${id}.txt`, urls.join("\n"), "utf-8");
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
  for (const playlist of PLAYLISTS) {
    await listPlaylistTrackUrls(
      browser,
      playlist
    );
  }
}
run();
