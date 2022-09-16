const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class BestBuyScraper {
  settings;

  priceItemSelector = `.priceView-hero-price.priceView-customer-price span`;

  constructor(settings) {
    this.settings = settings;
  }

  getProductPrice(url) {
    try {
      url += "&intl=nosplash";

      return JSDOM.fromURL(url, {
        referrer: "https://www.bestbuy.com/",
        includeNodeLocations: true,
        //storageQuota: 10000000,
        pretendToBeVisual: true,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        cookieJar: new jsdom.CookieJar(),
      }).then((dom) => {
        const document = dom.window.document;
        const priceSpan = document.querySelector(this.priceItemSelector);

        const price = priceSpan.textContent;

        return price;
      });
    } catch (error) {
      console.log("[BestBuy Scraper] Failed to scrape product price", error);
      return Promise.resolve("N/A");
    }
  }
}

module.exports = BestBuyScraper;
