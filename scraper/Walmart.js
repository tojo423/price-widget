const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class WalmartScraper {
  settings;

  priceSpanSelector = `div[data-testid="add-to-cart-section"] span[itemprop="price"]`;

  constructor(settings) {
    this.settings = settings;
  }

  async getProductPrice(url) {
    try {
      url = url.replace("www.walmart.com", "www-walmart-com.translate.goog");
      if (url.includes("?")) {
        url += "&_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp";
      } else {
        url += "?_x_tr_sl=tr&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp";
      }

      return JSDOM.fromURL(url, {
        referrer: "https://www.translate.google.com/",
        includeNodeLocations: true,
        //   storageQuota: 10000000,
        //   pretendToBeVisual: true,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        cookieJar: new jsdom.CookieJar(),
      }).then(async (dom) => {
        const document = dom.window.document;
        const priceSpan = document.querySelector(this.priceSpanSelector);
        const price = priceSpan.textContent;
        console.log("[Walmart Scraper] price:", price);

        return price;
      });
    } catch (error) {
      console.log("[Walmart Scraper] Failed to scrape product price", error);
      return Promise.resolve("N/A");
    }
  }
}

module.exports = WalmartScraper;
