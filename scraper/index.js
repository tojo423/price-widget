const puppeteer = require("puppeteer-extra");
const AmazonScraper = require("./Amazon");
const BestBuyScraper = require("./BestBuy");
const NeweggScraper = require("./Newegg");
const WalmartScraper = require("./Walmart");
const redis = import("redis");

class Scraper {
  redisClient;

  amazonScraper;
  walmartScraper;
  neweggScraper;

  storeCachePrefixes;

  isIniting = false;
  isInit = false;
  initPromise;

  async init() {
    if (this.isInit) {
      return;
    }

    if (this.isIniting) {
      return;
    }

    this.isIniting = true;

    const { createClient } = await redis;
    const redisClient = createClient({
      url: "redis://redis-17191.c13.us-east-1-3.ec2.cloud.redislabs.com:17191",
      password: "rK7nXpUngcYxYJmPjko0lGpIX8EZ1Ta5",
    });
    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    await redisClient.connect();

    this.redisClient = redisClient;

    console.log("[Scraper] Connecting to Redis...");

    // console.log("[Scraper] Creating Browser...");

    // // Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
    // const StealthPlugin = require("puppeteer-extra-plugin-stealth");
    // puppeteer.use(StealthPlugin());

    // // Add adblocker plugin to block all ads and trackers (saves bandwidth)
    // const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
    // puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

    // const blockResourcesPlugin =
    //   require("puppeteer-extra-plugin-block-resources")();
    // puppeteer.use(blockResourcesPlugin);
    // blockResourcesPlugin.blockedTypes.add("media");
    // blockResourcesPlugin.blockedTypes.add("image");
    // blockResourcesPlugin.blockedTypes.add("font");
    // // ? for some reason, blocking stylesheets breaks the site

    // const browser = await puppeteer.launch({
    //   //headless: "true",
    //   ignoreHTTPSErrors: true,
    //   headless: true,
    //   args: [
    //     "--no-sandbox",
    //     "--disable-setuid-sandbox",
    //     `--user-agent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"`,
    //     "--disable-setuid-sandbox",
    //     "--disable-infobars",
    //     "--window-position=0,0",
    //     "--ignore-certifcate-errors",
    //     "--ignore-certifcate-errors-spki-list",
    //     // "--remote-debugging-address=0.0.0.0",
    //     "--window-size=1400,900'",
    //     "--disable-gpu",
    //     "--disable-features=IsolateOrigins,site-per-process",
    //     "--blink-settings=imagesEnabled=true",
    //   ],
    //   userDataDir: "./tmp",
    // });
    // this.browser = browser;

    this.amazonScraper = new AmazonScraper(this);
    this.walmartScraper = new WalmartScraper(this);
    this.neweggScraper = new NeweggScraper(this);
    this.bestbuyScraper = new BestBuyScraper(this);

    this.isInit = true;
    this.isIniting = false;

    return this;
  }

  getScraperByUrl(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const host = hostname.split(".")[1];
    const scraper = this[host + "Scraper"];
    return scraper;
  }

  validateProductUrl(url) {
    if (!url || url == "") {
      return {
        success: false,
        errorCode: "URL_EMPTY",
      };
    }

    const scraper = this.getScraperByUrl(url);
    if (!scraper) {
      throw new Error(`Scraper for host '${host} not found'`);
    }

    if (!scraper.validateUrl) {
      throw new Error(
        `Scraper for host '${host}' does define a 'validateUrl' method`
      );
    }

    try {
      const validateUrlResult = scraper.validateUrl(url);
      return validateUrlResult;
    } catch {
      return {
        success: false,
        errorCode: "INVALID_URL",
      };
    }
  }

  async getProductPrice(url) {
    const scraper = this.getScraperByUrl(url);
    if (!scraper) {
      throw new Error(`Scraper for host '${host} not found'`);
    }

    if (!scraper.getProductId) {
      throw new Error(
        `Scraper for host '${host}' does define a 'getProductId' method`
      );
    }

    const productId = scraper.getProductId(url);
    console.log("[Scraper] productId:", productId);
    if (!productId) {
      throw new Error(
        `'getProductId' method of Scraper for host '${host}' returned nil`
      );
    }

    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const host = hostname.split(".")[1];

    const cacheId = host + productId;
    console.log("[Scraper] cacheId:", cacheId);
    const cachedPriceJson = await this.redisClient.get(cacheId);

    if (cachedPriceJson) {
      const cachedPriceObj = JSON.parse(cachedPriceJson);
      const cacheTime = cachedPriceObj.time;

      const timeDiff = Date.now() - cacheTime;
      const _1DayMs = 86_400_000;
      if (timeDiff < _1DayMs) {
        return cachedPriceObj.price;
      }
    }

    const price = await scraper.getProductPrice(url);
    const nowTime = Date.now();
    const priceObj = {
      price,
      time: nowTime,
    };
    const priceObjJson = JSON.stringify(priceObj);
    await this.redisClient.set(cacheId, priceObjJson);
    return price;
  }

  // dispose() {
  //   return this.browser.close();
  // }
}

module.exports = Scraper;
