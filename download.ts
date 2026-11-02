import type { Puppeteer } from "puppeteer";
import puppeteer from "puppeteer";
import fs from "fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

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
      setTimeout(async () => {
        const buttons = Array.from(
          document.querySelectorAll("div.items-center button"),
        )
                             .filter((el) => el.textContent.includes("Convert")).forEach(el => el.click())
        resolve(buttons);
      }, 1500);
    });
  });

  await closeAdPages(browser);
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (Array.from(
          document.querySelectorAll("div.items-center button")
        )
                 .filter((el) => el.textContent.includes("Queued")).length > 0) {
          setTimeout(async () =>{
            return new Promise((resolve, reject) => {
              const buttons = Array.from(
                document.querySelectorAll("div.items-center button")
              )
                                   .filter((el) => el.textContent.includes("Download")|| el.textContent.includes("Convert")).forEach(el => el.click())

            })
          }, 5000);
          }

        resolve(buttons);
        // setTimeout(() => page.close(), 1500);
        // setTimeout(() => {
        //   for (const page of browser.pages()) {
        //     page.close();
        //   }
        // }, 2500);
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
    protocolTimeout: 5000
  });
  return browser;
}
async function run() {
  const browser = await initialize();
  const urls = await fs.readFileSync("urls");
  for (const url of await listUrlFiles()) {
    await downloadTrack(browser, url);
    await closeAdPagesOnce(browser);
  }
  browser.close()
}
async function listUrlFiles(): string[] {
  const urls = [
    // "https://open.spotify.com/artist/6A43Djmhbe9100UwnI7epV", // cake
    // "https://open.spotify.com/playlist/2iZicEqw8eYHMxsq2HVVB7", // Disco is fundamental
    // "https://open.spotify.com/playlist/3Eni8dggzzd0MWUGXKMVHl", // Guy Gerber
    // "https://open.spotify.com/album/447aAsTmmXFZ0tyoB7sK3z", // Start breaking my heart
    // "https://open.spotify.com/track/6h9fjGkaBU03vxPgIJJAvf",

    "https://open.spotify.com/album/3u5F50SdWg1F75ugsG11CE", // Hydra

    // "https://open.spotify.com/track/3DHpzBZ4sGfPZfefkY88NO",
    // "https://open.spotify.com/track/6jEzD3FPcA95CsuIJtKFS0",
    // "https://open.spotify.com/track/1Gu8YosrIxq31SoQA1Nwfh",
    // "https://open.spotify.com/track/6aw9vJP8xUB9dyW4TrwTmS",
    // "https://open.spotify.com/track/17N6OOiHl7WMkUQZ2x9P1F",
    // "https://open.spotify.com/track/4vXMKlYcfXzA2MmhYMLJVr",
    // "https://open.spotify.com/track/3nRcAT9aoplAv9y18rQXRi",
    // "https://open.spotify.com/track/5omikDFURGs7xrfdp5QxX5",
    // "https://open.spotify.com/track/0b3uA2mQX1ZRAMUE4n78aO",
    // "https://open.spotify.com/track/34FyNQwiCnVPBZGk1wPEa4",
    // "https://open.spotify.com/track/1omHCWuWEH9TV0SmZiiLev",
    // "https://open.spotify.com/track/2VKO3Jo5Zgi4lKkazhtJlI",
    // "https://open.spotify.com/track/57h96qWrViAcioQHyb6exT",
    // "https://open.spotify.com/track/6WVRwQTvleYVomzYxYTmWw",
    // "https://open.spotify.com/track/5wTv501Kl9wLABLwHo11RJ",
    // "https://open.spotify.com/track/7jJy7mYWWz2DKSNSaAnkRc",
    // "https://open.spotify.com/track/0zC08QS1SmaY1RFyjya6ZX",
    // "https://open.spotify.com/track/6mNDeyhI21liXpWCh9Wi4C",
    // "https://open.spotify.com/track/1FparOA4TsEvXx9Gi9mdRQ",
    // "https://open.spotify.com/track/1QRQ6HOndanQlgWggueUx2",
    // "https://open.spotify.com/track/6qwPK5WhplqNcyy1CtnpLT",
    // "https://open.spotify.com/track/1TwGIP0mS6hndhipmYlNHM",
    // "https://open.spotify.com/track/3orXhmbVn44hjbnLxGUMpG",
    // "https://open.spotify.com/playlist/3Eni8dggzzd0MWUGXKMVHl",
    // "https://open.spotify.com/playlist/3iA6y9ZQx04aX238vogXI0?si=59208b761606401b",
    // "https://open.spotify.com/playlist/5qglMq1OQY35aH3Sex5YAE?si=6418bbfe41214ddb",
    // "https://open.spotify.com/playlist/6WUQKmRi7wX1uVacNnqF1k?si=aa9c89ab72f44fa2",
    // "https://open.spotify.com/playlist/7Dc9chcOTWnYnME1bVFfxf?si=e750973649524d54",
    // "https://open.spotify.com/playlist/2iZicEqw8eYHMxsq2HVVB7?si=132fc6c1912f41da",
    // "https://open.spotify.com/playlist/1dFpv6GqsixQwr8zr8uYTu?si=7a6b5c8db1184ee1",
    // "https://open.spotify.com/playlist/5SeRUjxWtWQOrETirbwbA9?si=23855ec23e2d4bcf",
    // "https://open.spotify.com/playlist/7GYGc4JSiV44Y53VvE2Dpa?si=0639e062155f4c24",
    // "https://open.spotify.com/playlist/0GYSxHR7PcsKfTBbLI0Wr8?si=6a2f10f87a7848c3",
    //
  ];
  // const files = await readdir(".");
  // for (const file of files) {
  //   if (/urls[.][^.]+[.]txt$/.exec(file)) {
  //     const currentUrls = (await fs.readFile(file)).splitlines();
  //     for (const cur of currentUrls) {
  //       urls.push(cur);
  //     }
  //   }
  // }
  return urls;
}
run();
