const jsdom = require("jsdom");
const { JSDOM } = jsdom;

class NeweggScraper {
  settings;

  priceSelector = `.product-buy-box .price-current`;

  constructor(settings) {
    this.settings = settings;
  }

  getProductPrice(url) {
    return JSDOM.fromURL(url, {
      referrer: "https://www.newegg.com/",
      includeNodeLocations: true,
      storageQuota: 10000000,
      pretendToBeVisual: true,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      cookieJar: new jsdom.CookieJar(),
    }).then((dom) => {
      require("fs").writeFileSync(
        "newegg_product_page_sample.html",
        dom.serialize()
      );
      const document = dom.window.document;
      const priceElements = [
        ...document.querySelectorAll(this.priceSelector),
      ].filter((priceElement) => {
        return priceElement.textContent.length > 2;
      });
      if (!priceElements) {
        console.log("[newegg Scraper] No Price Elements Found");
        return "N/A";
      }
      priceElements.forEach((priceElement) => {
        console.log(
          "[newegg Scraper] priceElement textContent:",
          priceElement.textContent
        );
      });
      const lastPriceElement = priceElements[priceElements.length - 1];
      const price = lastPriceElement.textContent;
      console.log("[newegg Scraper] price:", price);
      return price;
    });
  }
}

module.exports = NeweggScraper;
