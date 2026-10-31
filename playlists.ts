import puppeteer from 'puppeteer';

async function runWithProfile() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you don't need a visible window
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS example
    // Windows path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    // Linux path: '/usr/bin/google-chrome'
    args: [
      '--no-first-run',
      '--no-default-browser-check',
      // Optional: specify a profile subdirectory like 'Profile 1' if not using Default
      // '--profile-directory=Default'
    ],
    userDataDir: '/Users/myusername/Library/Application Support/Google/Chrome', // macOS path
    // Windows userDataDir: 'C:\\Users\\YourName\\AppData\\Local\\Google\\Chrome\\User Data'
    // Linux userDataDir: '/home/yourname/.config/google-chrome'
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await browser.newPage();
  await page.goto('https://google.com');

  // Your automation code here...
}

runWithProfile();
