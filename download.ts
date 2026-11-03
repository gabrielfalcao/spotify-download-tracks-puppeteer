import type { Puppeteer } from "puppeteer";
import puppeteer from "puppeteer";
import fs from "fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import readline from "node:readline";

async function downloadTrack(browser: Puppeteer, url: string) {
  console.log(`downloadTrack`);
  const page = await browser.newPage();
  // await page.resize({ contentWidth: 2880, contentHeight: 1800 });
  //
  await page.goto("https://spotsaver.net", {
    timeout: 360000,
    waitUntil: "networkidle2",
  });

  await page.locator('input[type="text"]').fill(url);
  const searchButton = await page.$('button[type="submit"]');
  await searchButton.click();
  console.log(`clicked to submit!`, searchButton);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(`Press enter when the list of songs appear`, (name) => {
    console.log(`Hi ${name}!`);
    rl.close();
  });

  await page.evaluate(async () => {
    Array.from(document.querySelectorAll("svg")).forEach((el) => el.remove());
  });

  await new Promise(async (resolve, reject) => {
    await page.evaluate(() => {
      setTimeout(async () => {
        const buttons = Array.from(
          document.querySelectorAll("div.items-center button"),
        ).filter((el) => /.*(Convert|Download).*/.exec(`${el.textContent}`));
        resolve(buttons);
      }, 5000);
    });

    await convertOrDownload2(browser, page);
  });
}
async function convertOrDownload2(browser, page) {
  console.log(`convertOrDownload2`);
  // page.focus("div.items-center");
  let buttons = [];
  while (buttons && buttons.length === 0) {
    console.log("page.reload();");
    // page.reload();
    buttons = await new Promise((resolve, reject) => {
      setTimeout(async () => {
        let buttons = Array.from((await page.$$("button span")) ?? []);
        for (const attempt in [...new Array(30)]) {
          buttons = Array.from((await page.$$("button span")) ?? [])
            .filter((el) =>
              /.*(Convert|Download|Queue).*/.exec(`${el.textContent}`),
            )
            .map((el) => el.parent);
          console.log(buttons);
          if (buttons.length > 0) {
            resolve(buttons);
          }
        }
        resolve(null);
      }, 500);
    });
  }

  console.log(buttons);
}

async function convertOrDownload(browser, page) {
  console.log(`convertOrDownload`);
  const worked = await page.evaluate(async () => {
    setTimeout(async () => {
      if (
        Array.from(document.querySelectorAll("div.items-center button")).filter(
          (el) => el.textContent.includes("Queued"),
        ).length > 0
      ) {
        setTimeout(async () => {
          const buttons = Array.from(
            document.querySelectorAll("div.items-center button"),
          ).filter(
            (el) =>
              el.textContent.includes("Download") ||
              el.textContent.includes("Convert"),
          );
          for (const attempt of [...new Array(30)]) {
            if (buttons.length === 0) {
              if (attempt >= 29) {
                resolve(false);
              }
            } else {
              buttons.forEach((el) => el.click());
              resolve(true);
            }
          }
        }, 5000);
      }
    });
    if (!worked) {
      await convertOrDownload(browser, page);
    } else {
      await closeAdPages(browser, page);
    }
  });
}
async function closeAdPages(browser: Puppeteer, page): number {
  console.log(`closeAdPages`);

  const doClose = async () => {
    let closed = 0;
    let pages = await browser.pages();
    if (pages.length <= 1) {
      return closed;
    }
    console.log(`closeAdPages: pages => ${pages}`, pages);
    for (const openPage of pages) {
      if (openPage != page) {
        openPage.close();
        closed += 1;
      }
      // const currentUrl = URL.parse(await page.url());
      // console.log(`closeAdPages: currentUrl => ${currentUrl}`, currentUrl)
      // console.log(`${currentUrl}`, currentUrl);
      // if (!currentUrl.hostname.includes("spotsaver.net")) {
      //   console.log(`closing page ${currentUrl}`)
      //   await page.close();
    }
    return closed;
  };
  let closed = await doClose();
  while (closed > 0) {
    await closeAdPages(browser, page);
  }
  return closed;
}
async function initialize(): Puppeteer {
  console.log(`initialize`);
  try {
    const response = await fetch("http://localhost:9333/json/version");
    const data = await response.json();
    const browserWSEndpoint = data.webSocketDebuggerUrl;
    const browser = await puppeteer.connect({
      browserWSEndpoint: browserWSEndpoint,
      protocolTimeout: 360000,
      headless: false,
      defaultViewport: null,
    });
    return browser;
  } catch (e) {
    console.error(
      `it appears that chromium is not open or not listening on port 9333: ${e}`,
    );
    return process.exit(1);
  }
}
async function run() {
  console.log(`initialize`);
  const browser = await initialize();
  for (const url of await listUrlFiles()) {
    await downloadTrack(browser, url);
  }
  // browser.close();
}
async function listUrlFiles(): string[] {
  console.log(`listUrlFiles`);
  const urls = [
    "https://open.spotify.com/track/0YyZBGbZYAuEFu473MiyjQ?si=41d6a620f79f4c68",

    // "https://open.spotify.com/album/2jW16dwv1hTu1K90W5upwO?si=7o8vYZ05Q-GC_-_erVbznA", // Mombodó
    //
    // "https://open.spotify.com/playlist/2K3rOUcaLTXrEW0YQQN4pp",//  The talking heads, Velvet Underground, Lou Reed
    //

    // "https://open.spotify.com/playlist/1HkvGddWj6VdHQpqPownp2?si=63b8c49d670e4c90",
    // "https://open.spotify.com/playlist/2LdeFxjOP04jItRBSnX3Va?si=d158f47b5c374c88",
    // "https://open.spotify.com/playlist/3ekE9yMBYjJy9CSbE6tMDP?si=q7RB1L_xQwCC3aP6xjqXfA",
    // "https://open.spotify.com/playlist/5UwqHFbyup3VCukNu5mXPN?si=b9db79b7152f475e",
    // "https://open.spotify.com/track/61mWefnWQOLf90gepjOCb3?si=48ccecfaaab74e2e",
    // "https://open.spotify.com/playlist/5F9h5N5TrBoZhFvLYcQo63", // CK Happy Disco
    // "https://open.spotify.com/artist/6A43Djmhbe9100UwnI7epV", // cake
    // "https://open.spotify.com/playlist/2iZicEqw8eYHMxsq2HVVB7", // Disco is fundamental
    // "https://open.spotify.com/playlist/3Eni8dggzzd0MWUGXKMVHl", // Guy Gerber
    // "https://open.spotify.com/album/447aAsTmmXFZ0tyoB7sK3z", // Start breaking my heart
    // "https://open.spotify.com/track/6h9fjGkaBU03vxPgIJJAvf",

    // "https://open.spotify.com/album/3HBjRlao4zDeHTRr3IxctS?si=VHiAjKvDSjGX29wyj2qY_w",
    //
    // "https://open.spotify.com/album/3u5F50SdWg1F75ugsG11CE", // Hydra
    //
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
    // "https://open.spotify.com/playlist/2tjZUUUYBvVedxCtKQGqFE?si=23988d039b2c4f65", // bergauf
    // "https://open.spotify.com/playlist/3qpkpLGxc9eekjuwudX4gG",  // an evidence of time
    // "https://open.spotify.com/artist/6Th7POyVfZgiHJQ64ddV5Y", // Rodriguez Jr.
    // "https://open.spotify.com/playlist/37i9dQZF1DZ06evO44CBIO", // This is Rodriguez Jr
    // "https://open.spotify.com/playlist/4QttXMFmKsk017fTmnB9tt?si=016a1c88690c4a39",  // Intense crying epyphany
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
  console.log(urls);
  return urls;
}
console.log("running");
try {
  run();
} catch (e) {
  console.error(`failed to run`);
}
