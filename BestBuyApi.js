const puppeteer = require("puppeteer");

module.exports = class BestBuyApi {
  cachedProducts = {};

  async getProduct(productUrl) {
    if (this.cachedProducts[productUrl]) {
      return this.cachedProducts[productUrl];
    }

    console.log("getting product at url:", productUrl);
    const browser = await puppeteer.launch({
      headless: "true",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    // await page.setDefaultNavigationTimeout(0);

    await page.setExtraHTTPHeaders({
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
    });

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (
        req.resourceType() === "image" ||
        req.resourceType() === "stylesheet" ||
        req.resourceType() === "font"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(productUrl, {
      //waitUtil: "domcontentloaded",
      timeout: 0, // !important as our page may load after 30000 ms
    });
    console.log("navigated to page");

    await page.waitForSelector(
      ".priceView-hero-price.priceView-customer-price span"
    );
    console.log("waited for selector");

    const name = await page.$eval(".sku-title h1", (element) => {
      return element.innerText;
    });

    const price = await page.$eval(
      ".priceView-hero-price.priceView-customer-price span",
      (element) => {
        return element.innerText;
      }
    );

    console.log("price", price);
    await browser.close();

    const product = {
      name,
      price,
    };

    this.cachedProducts[productUrl] = product;

    return product;
  }
};
