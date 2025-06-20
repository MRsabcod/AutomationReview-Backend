import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import fs from 'fs'
import path from 'path'
export async function postGoogleReview({ email, password, placeId, review, rating }) {
  let browser;
const isLocal = process.env.ISLOCAL === 'TRUE';
  try {
    // Configure plugins
  // if(isLocal) {
    console.log('first')
    const stealth = StealthPlugin();
    stealth.enabledEvasions.delete("iframe.contentWindow");
    stealth.enabledEvasions.delete("media.codecs");

    puppeteer.use(stealth);
    puppeteer.use(AnonymizeUAPlugin());
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      timeout: 0, // no timeout at launch level
      ignoreDefaultArgs: ["--disable-extensions"],
      executablePath:!isLocal? path.resolve('.puppeteer-cache/chrome/linux-136.0.7103.92/chrome-linux64/chrome'):"",
      dumpio: true,
      args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"],
    });
  // }
    // else{
//        const executablePath = await chromium.executablePath;
//   browser = await puppeteer.launch({
//   executablePath: path.resolve('.puppeteer-cache/chrome/linux-136.0.7103.92/chrome-linux64/chrome'),
//   headless: true,                                 // NOT 'new'; use traditional headless for stability :contentReference[oaicite:6]{index=6}
//   dumpio: true,
//   protocolTimeout:60000,
//   args: [
//     '--no-sandbox',
//     '--disable-setuid-sandbox',
//     '--disable-dev-shm-usage',
//     '--disable-gpu',                            // ✅ critical to avoid startup hang :contentReference[oaicite:7]{index=7}
//     '--disable-software-rasterizer',
//     '--disable-accelerated-2d-canvas',
//     '--disable-background-timer-throttling',
//     '--disable-backgrounding-occluded-windows',
//     '--disable-renderer-backgrounding',
//     '--no-first-run',
//     '--no-zygote',
//     '--single-process',
//     '--remote-debugging-port=9222',
//   ]
// });
// await new  Promise(resolve => setTimeout(resolve, 3000)); // wait 1 second

//    console.log('second')
//    console.log("Launching Chrome from:", path.resolve('.puppeteer-cache/chrome/linux-136.0.7103.92/chrome-linux64/chrome'));


//     }

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Sign in
    console.log("🔐 Signing in to Google...");
    await page.goto("https://accounts.google.com/signin", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.type("input[type='email']", email, { delay: 100 });
    console.log('email written ')
    await page.click("#identifierNext");
    // await new Promise(r => setTimeout(r, 3000));
    await page.waitForSelector("input[type='password']", { visible: true, timeout: 15000 });
    await page.type("input[type='password']", password, { delay: 100 });
    await page.click("#passwordNext");

    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
    console.log("✅ Logged in!");

    // Navigate to review link
    const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
    console.log("📨 Opening review page...");
    
    await page.goto(reviewUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
    const screenshotPath = '/tmp/review_state.png';
await page.screenshot({ path: screenshotPath });

const imageBuffer = fs.readFileSync(screenshotPath);
const base64Image = imageBuffer.toString('base64');

// Attach base64 image in your API response
console.log(`data:image/png;base64,${base64Image}`)
    // Find the review iframe
   // Wait until the correct iframe containing the review textarea is loaded
let reviewFrame = null;
const maxWait = 15000; // 15 seconds timeout
const pollInterval = 500;
let waited = 0;

while (!reviewFrame && waited < maxWait) {
  const frames = page.frames();

  for (const frame of frames) {
    try {
      const el = await frame.$('textarea[jsname="YPqjbf"]');
      if (el) {
        reviewFrame = frame;
        break;
      }
    } catch {}
  }

  if (!reviewFrame) {
    await new Promise(r => setTimeout(r, pollInterval));
    waited += pollInterval;
  }
}

if (!reviewFrame) {

  throw new Error("❌ Couldn't find the review iframe after waiting.");
}


    // Fill in review content
   // Fill in review content
if (rating && rating >= 1 && rating <= 5) {
  console.log("⭐ Clicking star rating...");

  const starSelector = `div[role="radio"][data-rating^="${rating}"]`;
  const starButton = await reviewFrame.$(starSelector);

  if (starButton) {
    await starButton.click();
    await new Promise(r => setTimeout(r, 1500));

    // ✅ Verify aria-checked is true
    const isSelected = await reviewFrame.evaluate(el => el.getAttribute('aria-checked') === 'true', starButton);

    if (!isSelected) {
      throw new Error(`❌ Star rating ${rating} did not register (aria-checked is not true).`);
    }

    console.log(`✅ Clicked and confirmed star number ${rating}`);
  } else {
    throw new Error("❌ Star rating element not found.");
  }
}

// ✅ Step 2: Then fill in the review content
console.log("📝 Typing review...");
const textareaSelector = 'textarea[jsname="YPqjbf"]';
await reviewFrame.waitForSelector(textareaSelector, { visible: true, timeout: 60000 });

const textarea = await reviewFrame.$(textareaSelector);
await textarea.click({ clickCount: 3 });
await textarea.press('Backspace');
await new Promise(r => setTimeout(r, 500));

console.log("Review to type:", review);
await textarea.type(review || 'This is an automated review 😬', { delay: 100 });

const typedText = await reviewFrame.$eval(textareaSelector, el => el.value);
console.log("✅ Typed content:", typedText);
console.log("📌 Expected content:", review);

if (!typedText || typedText.trim() !== review.trim()) {
  console.warn("❌ Review text mismatch — retrying...");
  return { success: false, error: "Typed review does not match intended text." };
}
    // Submit the review
    console.log("📬 Submitting review...");
    await reviewFrame.waitForSelector('button[jsname="IJM3w"]', { visible: true, timeout: 10000 });
    await reviewFrame.click('button[jsname="IJM3w"]');

    console.log("✅ Review submitted successfully!");
    await new Promise(r => setTimeout(r, 3000));
    return { success: true, message: "Review posted successfully." };
  } catch (error) {
    console.error("❌ Error in postGoogleReview():", error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
export async function retryPostGoogleReview(data, maxRetries = 5, delay = 3000) {
  let attempts = 0;
  let result;

  while (attempts < maxRetries) {
    try {
      console.log(`🔁 Attempt ${attempts + 1}/${maxRetries} to post review...`);

      result = await postGoogleReview(data);

      if (result && result.success) {
        console.log("✅ Automation succeeded.");
        return result;
      }

      console.warn("⚠️ Automation attempt failed. Retrying...");
    } catch (error) {
      console.error(`❌ Error on attempt ${attempts + 1}:`, error.message);
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return { success: false, error: 'Failed after maximum retry attempts.' };
}